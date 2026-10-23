/*
 * persistence.js — keep user accounts & uploads alive across redeploys.
 *
 * Render's free tier has an ephemeral disk: every deploy starts a fresh
 * container and the SQLite database / uploaded avatars disappear. This
 * module mirrors the data directory to a git branch ("site-data") in the
 * site's own GitHub repo via the Contents API:
 *
 *   - restore()  : on boot, if no local DB exists, download + decrypt the
 *                  latest snapshot before the database is opened
 *   - backup()   : encrypt {db + admin files + uploads} and commit it to
 *                  the backup branch (debounced after writes, swept every
 *                  few minutes, and flushed on SIGTERM before the old
 *                  container is killed)
 *
 * Everything is encrypted with AES-256-GCM so the (public) repo never
 * sees plaintext passwords, sessions or messages.
 *
 * Enable with env vars (set these in the Render dashboard):
 *   GITHUB_TOKEN        fine-grained PAT with Contents read/write on the repo
 *   DATA_SECRET         any long random passphrase (encrypts the snapshot)
 * Optional:
 *   GITHUB_BACKUP_REPO  default "tomtom-cmd-alt/my-music"
 *   DATA_BRANCH         default "site-data"
 *   DATA_BACKUP_PATH    default "site-data/backup.enc"
 *   DATA_MAX_BYTES      per-file cap, default 8 MB
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const API = "https://api.github.com";
const MAGIC = "TMD1";

function createPersistence({ DB_PATH, UPLOAD_DIR, ROOT_DIR }) {
  const TOKEN = String(process.env.GITHUB_TOKEN || "").trim();
  const SECRET = String(process.env.DATA_SECRET || "").trim();
  const REPO = String(process.env.GITHUB_BACKUP_REPO || "tomtom-cmd-alt/my-music").trim();
  const BRANCH = String(process.env.DATA_BRANCH || "site-data").trim();
  const BACKUP_PATH = String(process.env.DATA_BACKUP_PATH || "site-data/backup.enc").trim();
  const MAX_FILE = Number(process.env.DATA_MAX_BYTES) || 8 * 1024 * 1024;
  const MAX_TOTAL = 48 * 1024 * 1024;

  const enabled = Boolean(TOKEN && SECRET);
  const status = {
    enabled,
    repo: REPO,
    branch: BRANCH,
    path: BACKUP_PATH,
    last_backup: null,
    last_restore: null,
    last_error: null,
    backing_up: false
  };

  const key = enabled ? crypto.scryptSync(SECRET, "tm-music-backup-v1", 32) : null;

  function encrypt(buf) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const enc = Buffer.concat([cipher.update(buf), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([Buffer.from(MAGIC), iv, tag, enc]).toString("base64");
  }

  function decrypt(b64) {
    const raw = Buffer.from(String(b64), "base64");
    if (raw.slice(0, 4).toString() !== MAGIC) throw new Error("snapshot has wrong format");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, raw.slice(4, 16));
    decipher.setAuthTag(raw.slice(16, 32));
    return Buffer.concat([decipher.update(raw.slice(32)), decipher.final()]);
  }

  function ghHeaders(extra = {}) {
    return {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "my-music-persistence",
      ...extra
    };
  }

  /* ---------- snapshot packing ---------- */

  function collectFiles() {
    const files = {};
    let total = 0;
    const add = (abs, rel) => {
      try {
        const st = fs.statSync(abs);
        if (!st.isFile() || st.size === 0) return;
        if (st.size > MAX_FILE) return; // too big for a git blob snapshot
        if (total + st.size > MAX_TOTAL) return;
        files[rel] = fs.readFileSync(abs).toString("base64");
        total += st.size;
      } catch (_) {}
    };

    // the database itself + the maintenance banner state
    add(DB_PATH, "music.db");
    if (ROOT_DIR) add(path.join(ROOT_DIR, "maintenance.json"), "maintenance.json");

    // small files next to it (admin password file, etc.)
    const dataDir = path.dirname(DB_PATH);
    const dbBase = path.basename(DB_PATH);
    let dataFiles = [];
    try { dataFiles = fs.readdirSync(dataDir); } catch (_) {}
    for (const f of dataFiles) {
      if (f === dbBase || /\.db-(wal|shm|journal)$/i.test(f) || f.endsWith("-wal") || f.endsWith("-shm")) continue;
      add(path.join(dataDir, f), `data/${f}`);
    }

    // uploaded media (avatars, backgrounds, uploaded songs/covers)
    const walk = (dir, prefix) => {
      let entries = [];
      try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return; }
      for (const e of entries) {
        const abs = path.join(dir, e.name);
        if (e.isDirectory()) walk(abs, `${prefix}${e.name}/`);
        else add(abs, `uploads/${prefix}${e.name}`);
      }
    };
    walk(UPLOAD_DIR, "");

    return files;
  }

  /* ---------- restore (synchronous: runs before the DB opens) ---------- */

  function restore() {
    if (!enabled) return false;
    // A local database already exists (local dev) — never clobber it.
    if (fs.existsSync(DB_PATH)) {
      status.last_restore = "skipped — local database present";
      return false;
    }
    let out;
    try {
      out = execFileSync(
        "curl",
        [
          "-sfL",
          "-H", `Authorization: Bearer ${TOKEN}`,
          "-H", "Accept: application/vnd.github+json",
          `${API}/repos/${REPO}/contents/${BACKUP_PATH}?ref=${encodeURIComponent(BRANCH)}`
        ],
        { timeout: 60000, maxBuffer: 128 * 1024 * 1024 }
      );
    } catch (e) {
      status.last_restore = "no snapshot found (first boot?)";
      return false;
    }
    try {
      const json = JSON.parse(out.toString("utf8"));
      const payload = JSON.parse(decrypt(json.content).toString("utf8"));
      if (!payload || typeof payload.files !== "object") throw new Error("bad snapshot payload");
      for (const [rel, b64] of Object.entries(payload.files)) {
        let abs;
        if (rel === "music.db") abs = DB_PATH;
        else if (rel === "maintenance.json" && ROOT_DIR) abs = path.join(ROOT_DIR, "maintenance.json");
        else if (rel.startsWith("data/")) abs = path.join(path.dirname(DB_PATH), rel.slice(5));
        else if (rel.startsWith("uploads/")) abs = path.join(UPLOAD_DIR, rel.slice(8));
        else continue;
        fs.mkdirSync(path.dirname(abs), { recursive: true });
        fs.writeFileSync(abs, Buffer.from(b64, "base64"));
      }
      status.last_restore = `restored snapshot from ${payload.created_at} (${Object.keys(payload.files).length} files)`;
      return true;
    } catch (e) {
      status.last_restore = null;
      status.last_error = `restore failed: ${e.message}`;
      return false;
    }
  }

  /* ---------- backup ---------- */

  async function ensureBranch() {
    try {
      const head = await fetch(`${API}/repos/${REPO}/git/ref/heads/${encodeURIComponent(BRANCH)}`, { headers: ghHeaders() });
      if (head.ok) return true;
    } catch (_) { return false; }
    try {
      const mainRef = await fetch(`${API}/repos/${REPO}/git/ref/heads/main`, { headers: ghHeaders() });
      if (!mainRef.ok) return false;
      const mainSha = (await mainRef.json()).object.sha;
      const create = await fetch(`${API}/repos/${REPO}/git/refs`, {
        method: "POST",
        headers: ghHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ ref: `refs/heads/${BRANCH}`, sha: mainSha })
      });
      return create.ok || create.status === 422; // 422 = branch already exists
    } catch (_) {
      return false;
    }
  }

  async function backup(reason = "manual") {
    if (!enabled) return false;
    if (status.backing_up) return false;
    status.backing_up = true;
    try {
      await ensureBranch();
      const payload = Buffer.from(JSON.stringify({
        created_at: new Date().toISOString(),
        files: collectFiles()
      }));
      const content = encrypt(payload);

      // existing snapshot sha (needed to overwrite)
      let sha;
      try {
        const r = await fetch(`${API}/repos/${REPO}/contents/${BACKUP_PATH}?ref=${encodeURIComponent(BRANCH)}`, { headers: ghHeaders() });
        if (r.ok) sha = (await r.json()).sha;
      } catch (_) {}

      const put = await fetch(`${API}/repos/${REPO}/contents/${BACKUP_PATH}`, {
        method: "PUT",
        headers: ghHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          message: `auto-backup (${reason}) ${new Date().toISOString()}`,
          content,
          branch: BRANCH,
          ...(sha ? { sha } : {})
        })
      });
      if (!put.ok) throw new Error(`GitHub PUT ${put.status}: ${(await put.text()).slice(0, 180)}`);
      status.last_backup = new Date().toISOString();
      status.last_error = null;
      return true;
    } catch (e) {
      status.last_error = e.message;
      return false;
    } finally {
      status.backing_up = false;
    }
  }

  /* ---------- scheduling ---------- */

  let dirty = true; // first boot: push an initial snapshot so the branch exists
  let debounceTimer = null;

  function markDirty() {
    dirty = true;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => backup("write"), 12000);
    if (debounceTimer.unref) debounceTimer.unref();
  }

  function fingerprint() {
    // cheap change detection: db size+mtime and number of uploads
    try {
      const st = fs.statSync(DB_PATH);
      let uploads = 0;
      try { uploads = fs.readdirSync(UPLOAD_DIR).length; } catch (_) {}
      return `${st.size}:${Math.floor(st.mtimeMs / 5000)}:${uploads}`;
    } catch (_) {
      return "none";
    }
  }

  let lastFingerprint = null;

  function start() {
    if (!enabled) return;

    // periodic sweep: catches anything the debounce missed
    const sweep = setInterval(() => {
      const fp = fingerprint();
      if (dirty || fp !== lastFingerprint) backup("periodic").then((ok) => { if (ok) { dirty = false; lastFingerprint = fp; } });
    }, 3 * 60 * 1000);
    if (sweep.unref) sweep.unref();

    // final flush before Render kills the old container
    const flush = (signal) => {
      if (!dirty) { process.exit(0); return; }
      const deadline = setTimeout(() => process.exit(0), 7000);
      backup(`shutdown ${signal}`)
        .catch(() => {})
        .finally(() => { clearTimeout(deadline); process.exit(0); });
    };
    process.on("SIGTERM", () => flush("SIGTERM"));
    process.on("SIGINT", () => flush("SIGINT"));

    // initial snapshot (creates the branch + first backup)
    setTimeout(() => backup("initial").then((ok) => { dirty = !ok; lastFingerprint = fingerprint(); }), 5000);
  }

  return { status, restore, backup, markDirty, start, fingerprint };
}

module.exports = { createPersistence };
