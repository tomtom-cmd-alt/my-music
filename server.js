/*
 * Thomas Miller — music site backend (v3)
 *
 * One Node process serves:
 *   - the static site (index.html, admin.html, audio, ...)
 *   - uploaded audio + cover art (/uploads)
 *   - a SQLite-backed API: per-song listens / likes / comments,
 *     user accounts, global bans & timeouts, song library management
 *   - an admin API used by admin.html — sign in with the admin password
 *     or with GitHub (restricted to ADMIN_GITHUB_USERS)
 *
 * Database: built-in node:sqlite (Node >= 22.5) with an sqlite3 npm fallback.
 *
 * Run:  npm install && node server.js
 *
 * Env:
 *   PORT                    default 3000
 *   DB_PATH                 default ./data/music.db
 *   AUTO_APPROVE            "true" | "false"   (comments auto-publish)
 *   ADMIN_PASSWORD          admin password, or "off" to disable password login
 *   GITHUB_CLIENT_ID        GitHub OAuth app client id (enables "Sign in with GitHub")
 *   GITHUB_CLIENT_SECRET    GitHub OAuth app client secret
 *   ADMIN_GITHUB_USERS      comma-separated GitHub logins allowed to be admin
 *                           (default: tomtom-cmd,tomtom-cmd-alt)
 *   SESSION_TTL_DAYS        user session lifetime, default 30
 */

const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");

const app = express();
app.set("trust proxy", true); // Render / Railway / nginx put the real IP in X-Forwarded-*

const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "data", "music.db");
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, "uploads");
const AUTO_APPROVE = String(process.env.AUTO_APPROVE || "true") !== "false";
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;                       // admin session: 12h
const SESSION_TTL_MS = (Number(process.env.SESSION_TTL_DAYS) || 30) * 86400000;

/* ---------------- GitHub admin allow-list ---------------- */

const GITHUB_CLIENT_ID = String(process.env.GITHUB_CLIENT_ID || "").trim();
const GITHUB_CLIENT_SECRET = String(process.env.GITHUB_CLIENT_SECRET || "").trim();
const GITHUB_ENABLED = Boolean(GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET);
const ADMIN_GITHUB_USERS = String(process.env.ADMIN_GITHUB_USERS || "tomtom-cmd,tomtom-cmd-alt")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

/* ---------------- password login ---------------- */

const RAW_ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || "").trim();
let ADMIN_PASSWORD = RAW_ADMIN_PASSWORD;
let PASSWORD_GENERATED = false;
let PASSWORD_DISABLED = false;

if (/^(off|disable|disabled|none)$/i.test(RAW_ADMIN_PASSWORD)) {
  PASSWORD_DISABLED = true;
} else if (!RAW_ADMIN_PASSWORD) {
  ADMIN_PASSWORD = crypto.randomBytes(4).toString("hex"); // 8 chars
  PASSWORD_GENERATED = true;
}

/* ------------------------------------------------------------------ */
/* SQLite adapter: node:sqlite (sync) or sqlite3 (async), same API    */
/* ------------------------------------------------------------------ */

function openDatabase() {
  // Preferred: zero-dependency built-in driver (Node >= 22.5)
  try {
    const { DatabaseSync } = require("node:sqlite");
    const handle = new DatabaseSync(DB_PATH);
    return {
      driver: "node:sqlite",
      run(sql, params = []) { return handle.prepare(sql).run(...params); },
      get(sql, params = []) { return handle.prepare(sql).get(...params); },
      all(sql, params = []) { return handle.prepare(sql).all(...params); },
      exec(sql) { handle.exec(sql); }
    };
  } catch (_) {
    // Fallback: native npm driver
    const sqlite3 = require("sqlite3").verbose();
    const handle = new sqlite3.Database(DB_PATH);
    return {
      driver: "sqlite3",
      run(sql, params = []) {
        return new Promise((resolve, reject) => {
          handle.run(sql, params, (err) => (err ? reject(err) : resolve()));
        });
      },
      get(sql, params = []) {
        return new Promise((resolve, reject) => {
          handle.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
        });
      },
      all(sql, params = []) {
        return new Promise((resolve, reject) => {
          handle.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
        });
      },
      exec(sql) {
        return new Promise((resolve, reject) => {
          handle.exec(sql, (err) => (err ? reject(err) : resolve()));
        });
      }
    };
  }
}

if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const db = openDatabase();
const q = (result) => Promise.resolve(result); // node:sqlite sync + sqlite3 promises both await fine

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function normalizeSong(song) {
  const value = String(song || "").trim();
  if (!value) return "";
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function ensureSong(song, displayName) {
  const key = normalizeSong(song) || "whispers";
  const name = (String(displayName || song || "Whispers").trim() || "Whispers");
  await q(db.run(
    "INSERT OR IGNORE INTO songs (song_name, display_name) VALUES (?, ?)",
    [key, name]
  ));
  return key;
}

async function getSongStats(song) {
  const row = await q(db.get(
    `SELECT s.song_name AS song_key,
            s.display_name AS display_name,
            s.description AS description,
            s.cover_url AS cover_url,
            s.audio_url AS audio_url,
            s.source AS source,
            s.created_at AS created_at,
            COALESCE(l.count, 0) AS listens,
            COALESCE(k.count, 0) AS likes,
            (SELECT COUNT(*) FROM comments c
              WHERE c.song_name = s.song_name AND c.status = 'approved') AS comments
       FROM songs s
       LEFT JOIN listens l ON l.song_name = s.song_name
       LEFT JOIN likes k ON k.song_name = s.song_name
      WHERE s.song_name = ?`,
    [song]
  ));
  if (!row) return null;
  return {
    song: row.song_key,
    display_name: row.display_name || song,
    description: row.description || "",
    cover_url: row.cover_url || null,
    audio_url: row.audio_url || null,
    source: row.source || "static",
    created_at: row.created_at || null,
    listens: Number(row.listens || 0),
    likes: Number(row.likes || 0),
    comments: Number(row.comments || 0)
  };
}

async function incrementCounter(table, song) {
  await q(db.run(`INSERT OR IGNORE INTO ${table} (song_name, count) VALUES (?, 0)`, [song]));
  await q(db.run(`UPDATE ${table} SET count = count + 1 WHERE song_name = ?`, [song]));
}

async function decrementCounter(table, song) {
  await q(db.run(`INSERT OR IGNORE INTO ${table} (song_name, count) VALUES (?, 0)`, [song]));
  await q(db.run(`UPDATE ${table} SET count = MAX(count - 1, 0) WHERE song_name = ?`, [song]));
}

async function getAllStats() {
  const rows = await q(db.all(
    `SELECT s.song_name AS song,
            s.display_name AS display_name,
            s.description AS description,
            s.cover_url AS cover_url,
            s.audio_url AS audio_url,
            s.source AS source,
            s.created_at AS created_at,
            COALESCE(l.count, 0) AS listens,
            COALESCE(k.count, 0) AS likes,
            (SELECT COUNT(*) FROM comments c
              WHERE c.song_name = s.song_name AND c.status = 'approved') AS comments
       FROM songs s
       LEFT JOIN listens l ON l.song_name = s.song_name
       LEFT JOIN likes k ON k.song_name = s.song_name
      ORDER BY COALESCE(s.created_at, s.rowid), s.rowid`
  ));
  return rows.map((r) => ({
    song: r.song,
    display_name: r.display_name,
    description: r.description || "",
    cover_url: r.cover_url || null,
    audio_url: r.audio_url || null,
    source: r.source || "static",
    created_at: r.created_at || null,
    listens: Number(r.listens || 0),
    likes: Number(r.likes || 0),
    comments: Number(r.comments || 0)
  }));
}

function clientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length) {
    // Walk right-to-left: the edge proxy appends the real client address,
    // so the right-most PUBLIC entry is the trustworthy one (spoof-proof
    // against clients faking X-Forwarded-For).
    const parts = fwd.split(",").map((s) => s.trim()).filter(Boolean);
    for (let i = parts.length - 1; i >= 0; i--) {
      if (!isPrivateIp(parts[i])) return parts[i];
    }
    // All entries private (local testing) — fall through to socket address.
  }
  return req.socket?.remoteAddress || "unknown";
}

function isPrivateIp(value) {
  const v = String(value || "").trim();
  if (!v || v === "::1") return true;
  if (/^f[cd][0-9a-f]{2}:/i.test(v)) return true;                 // fc00::/7 unique local
  if (/^fe80:/i.test(v)) return true;                              // link-local v6
  if (/^::ffff:/i.test(v)) return isPrivateIp(v.slice(7));         // v4-mapped v6
  return /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(v);
}

/* ------------------------------------------------------------------ */
/* Passwords (scrypt) & user accounts                                 */
/* ------------------------------------------------------------------ */

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  try {
    const [salt, hash] = String(stored).split(":");
    const candidate = crypto.scryptSync(String(password), salt, 64);
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), candidate);
  } catch (_) {
    return false;
  }
}

const USERNAME_RE = /^[A-Za-z0-9_-]{3,20}$/;

/* ------------------------------------------------------------------ */
/* Sessions (user accounts)                                           */
/* ------------------------------------------------------------------ */

async function createSession(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = Date.now() + SESSION_TTL_MS;
  await q(db.run(
    "INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
    [token, userId, new Date().toISOString(), expires]
  ));
  return { token, expires };
}

// Resolves the Bearer token into a user row (or null). Never throws.
async function optionalAuth(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;
  try {
    const row = await q(db.get(
      `SELECT u.id, u.username, u.created_at, s.expires_at
         FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.token = ?`,
      [token]
    ));
    if (!row) return null;
    if (Number(row.expires_at) <= Date.now()) {
      await q(db.run("DELETE FROM sessions WHERE token = ?", [token]));
      return null;
    }
    req.user = { id: row.id, username: row.username, created_at: row.created_at };
    req.sessionToken = token;
    return req.user;
  } catch (_) {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Global bans & timeouts                                             */
/* ------------------------------------------------------------------ */

async function activeBanFor(userId, ip) {
  const now = Date.now();
  const row = await q(db.get(
    `SELECT * FROM bans
      WHERE (expires_at IS NULL OR expires_at > ?)
        AND ((kind = 'ip' AND value = ?) OR (kind = 'user' AND value = ?))
      ORDER BY (expires_at IS NULL) DESC, created_at DESC
      LIMIT 1`,
    [now, ip || "", userId || ""]
  ));
  return row || null;
}

function banPayload(ban) {
  return {
    banned: true,
    reason: ban.reason || "no reason given",
    until: ban.expires_at ? new Date(Number(ban.expires_at)).toISOString() : null,
    permanent: !ban.expires_at
  };
}

function banMessage(ban) {
  const when = ban.expires_at
    ? "until " + new Date(Number(ban.expires_at)).toUTCString()
    : "permanently";
  return `You are banned ${when} — ${ban.reason || "no reason given"}`;
}

// Returns true when the request may proceed; otherwise sends the 403 itself.
async function enforceNotBanned(req, res) {
  const ban = await activeBanFor(req.user ? req.user.id : null, clientIp(req));
  if (ban) {
    res.status(403).json({ error: banMessage(ban), ...banPayload(ban) });
    return false;
  }
  return true;
}

async function banTarget({ kind, value, hours, reason, createdBy }) {
  const expires = hours ? Date.now() + Number(hours) * 3600000 : null;
  const id = crypto.randomUUID();
  await q(db.run(
    `INSERT INTO bans (id, kind, value, reason, created_by, created_at, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, kind, String(value), reason || "", createdBy || "admin", new Date().toISOString(), expires]
  ));
  // Sessions are intentionally KEPT: enforceNotBanned blocks every write
  // action and /api/me reports the ban, so the user can see why they are
  // locked out. Logging back in is blocked by the login ban check too.
  return id;
}

async function activeBans() {
  return q(db.all(
    `SELECT b.*, u.username AS banned_username
       FROM bans b
       LEFT JOIN users u ON u.id = b.value AND b.kind = 'user'
      WHERE b.expires_at IS NULL OR b.expires_at > ?
      ORDER BY b.created_at DESC`,
    [Date.now()]
  ));
}

/* ------------------------------------------------------------------ */
/* Admin auth (password + GitHub OAuth)                               */
/* ------------------------------------------------------------------ */

const adminTokens = new Map();        // token -> expiresAt
const oneTimeCodes = new Map();       // one-time code -> { token, expiresAt }

function timingSafeEqualStr(a, b) {
  const ha = crypto.createHash("sha256").update(String(a)).digest();
  const hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function issueAdminToken() {
  const token = crypto.randomBytes(24).toString("hex");
  adminTokens.set(token, Date.now() + TOKEN_TTL_MS);
  return token;
}

function pruneTokens() {
  const now = Date.now();
  for (const [token, expires] of adminTokens) {
    if (expires <= now) adminTokens.delete(token);
  }
  for (const [code, entry] of oneTimeCodes) {
    if (entry.expiresAt <= now) oneTimeCodes.delete(code);
  }
}
setInterval(pruneTokens, 60 * 60 * 1000).unref();

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const expires = adminTokens.get(token);
  if (!token || !expires || expires <= Date.now()) {
    adminTokens.delete(token);
    return res.status(401).json({ error: "unauthorized — log in again" });
  }
  req.adminToken = token;
  next();
}

/* --- GitHub OAuth state signing (no cookies needed cross-origin) --- */

function signState(origin) {
  const payload = Buffer.from(JSON.stringify({ o: origin, t: Date.now() })).toString("base64url");
  const sig = crypto
    .createHmac("sha256", GITHUB_CLIENT_SECRET)
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

function verifyState(state) {
  try {
    const [payload, sig] = String(state).split(".");
    const expected = crypto.createHmac("sha256", GITHUB_CLIENT_SECRET).update(payload).digest("base64url");
    if (!timingSafeEqualStr(sig, expected)) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (Date.now() - Number(data.t) > 10 * 60 * 1000) return null; // 10 min window
    return data;
  } catch (_) {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Rate limiting                                                      */
/* ------------------------------------------------------------------ */

const COMMENT_COOLDOWN_MS = 8000;
const lastCommentAt = new Map();      // ip or user:<id> -> timestamp
const REGISTER_COOLDOWN_MS = 30000;
const lastRegisterAt = new Map();     // ip -> timestamp

setInterval(() => {
  const cutoff = Date.now() - 15 * 60 * 1000;
  for (const [key, ts] of lastCommentAt) if (ts < cutoff) lastCommentAt.delete(key);
  for (const [key, ts] of lastRegisterAt) if (ts < cutoff) lastRegisterAt.delete(key);
}, 15 * 60 * 1000).unref();

/* ------------------------------------------------------------------ */
/* Uploads (multer)                                                   */
/* ------------------------------------------------------------------ */

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    let ext = path.extname(file.originalname || "").toLowerCase();
    if (!/^\.[a-z0-9]{1,7}$/.test(ext)) {
      ext = file.mimetype.startsWith("image/") ? ".png"
          : file.mimetype === "audio/mpeg" ? ".mp3"
          : file.mimetype === "audio/wav" || file.mimetype === "audio/x-wav" ? ".wav"
          : file.mimetype === "audio/ogg" ? ".ogg"
          : ".bin";
    }
    cb(null, Date.now().toString(36) + crypto.randomBytes(6).toString("hex") + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 120 * 1024 * 1024, files: 2 },
  fileFilter: (_req, file, cb) => {
    if (file.fieldname === "audio" && /^(audio\/|application\/octet-stream)/i.test(file.mimetype)) {
      return cb(null, true);
    }
    if (file.fieldname === "cover" && /^image\//i.test(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error("unsupported file type"));
  }
});

const uploadSongFiles = upload.fields([
  { name: "audio", maxCount: 1 },
  { name: "cover", maxCount: 1 }
]);

function uploadedFiles(req) {
  const out = { audio: null, cover: null };
  if (req.files) {
    if (req.files.audio && req.files.audio[0]) out.audio = req.files.audio[0];
    if (req.files.cover && req.files.cover[0]) out.cover = req.files.cover[0];
  }
  return out;
}

// Profile images (avatar / background) — small images only.
const imageUpload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (/^image\//i.test(file.mimetype)) return cb(null, true);
    cb(new Error("only image files are allowed there"));
  }
});

function publicFileUrl(file) {
  return file ? "/uploads/" + file.filename : null;
}

/* ------------------------------------------------------------------ */
/* Middleware                                                         */
/* ------------------------------------------------------------------ */

app.use(express.json({ limit: "16kb" }));

// CORS: the GitHub Pages site talks to this API cross-origin.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});

// Uploaded media (audio + covers) — served before the blocker below.
app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "7d", fallthrough: false }));

// Never serve server internals or the database directory.
const BLOCKED = new Set([
  "server.js", "package.json", "package-lock.json", "schema.sql",
  "data", "node_modules", "uploads", ".git"
]);
app.use((req, res, next) => {
  const first = decodeURIComponent(req.path.split("/")[1] || "");
  if (first && BLOCKED.has(first)) {
    return res.status(403).json({ error: "forbidden" });
  }
  next();
});

app.use(express.static(__dirname, { extensions: ["html"] }));

// Resolve the user session (if any) for every /api call.
app.use("/api", (req, res, next) => { optionalAuth(req).then(() => next()).catch(() => next()); });

/* ------------------------------------------------------------------ */
/* Public API — discovery                                             */
/* ------------------------------------------------------------------ */

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    driver: db.driver,
    auto_approve: AUTO_APPROVE,
    accounts: true,
    bans: true,
    profiles: true,
    friends: true,
    dms: true,
    version: 4,
    github: GITHUB_ENABLED,
    password_login: !PASSWORD_DISABLED
  });
});

app.get("/api/auth/config", (_req, res) => {
  res.json({
    github_enabled: GITHUB_ENABLED,
    password_login: !PASSWORD_DISABLED,
    allowed_admins: ADMIN_GITHUB_USERS
  });
});

app.get("/api/all", async (_req, res) => {
  try {
    const songs = await getAllStats();
    const totals = songs.reduce(
      (acc, s) => ({
        listens: acc.listens + s.listens,
        likes: acc.likes + s.likes,
        comments: acc.comments + s.comments
      }),
      { listens: 0, likes: 0, comments: 0 }
    );
    res.json({ songs, totals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/stats", async (req, res) => {
  try {
    const song = await ensureSong(req.query.song || "whispers");
    const stats = await getSongStats(song);
    res.json({ song, ...(stats || { display_name: song, listens: 0, likes: 0, comments: 0 }) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ------------------------------------------------------------------ */
/* Public API — listens & likes                                       */
/* ------------------------------------------------------------------ */

app.post("/api/listen", async (req, res) => {
  if (!(await enforceNotBanned(req, res))) return;
  try {
    const song = await ensureSong(req.body?.song || req.query.song || "whispers");
    await incrementCounter("listens", song);
    res.json({ song, ...(await getSongStats(song)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/like", async (req, res) => {
  if (!(await enforceNotBanned(req, res))) return;
  try {
    const song = await ensureSong(req.body?.song || req.query.song || "whispers");
    const action = String(req.body?.action || "like") === "unlike" ? "unlike" : "like";

    if (req.user) {
      // Signed-in users: one like per account per song, enforced server-side.
      if (action === "like") {
        const existing = await q(db.get(
          "SELECT 1 AS x FROM likes_by WHERE song_name = ? AND user_id = ?",
          [song, req.user.id]
        ));
        if (existing) {
          return res.status(409).json({ error: "you already liked this track", ...(await getSongStats(song)) });
        }
        await q(db.run(
          "INSERT INTO likes_by (song_name, user_id, created_at) VALUES (?, ?, ?)",
          [song, req.user.id, new Date().toISOString()]
        ));
        await incrementCounter("likes", song);
      } else {
        const gone = await q(db.run(
          "DELETE FROM likes_by WHERE song_name = ? AND user_id = ?",
          [song, req.user.id]
        ));
        if (!gone || (gone.changes !== undefined && gone.changes === 0)) {
          return res.status(409).json({ error: "you have not liked this track", ...(await getSongStats(song)) });
        }
        await decrementCounter("likes", song);
      }
    } else if (action === "unlike") {
      await decrementCounter("likes", song);
    } else {
      await incrementCounter("likes", song);
    }

    res.json({ song, liked: action === "like", ...(await getSongStats(song)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ------------------------------------------------------------------ */
/* Public API — comments                                              */
/* ------------------------------------------------------------------ */

app.get("/api/comments", async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);

    let rows;
    const authorJoin = `LEFT JOIN users u ON u.id = c.user_id`;
    if (req.query.song) {
      const song = normalizeSong(req.query.song);
      rows = await q(db.all(
        `SELECT c.id, c.song_name, c.author, c.text, c.created_at, c.user_id, u.avatar_url AS avatar_url
           FROM comments c ${authorJoin}
          WHERE c.song_name = ? AND c.status = 'approved'
          ORDER BY c.created_at DESC
          LIMIT ?`,
        [song, limit]
      ));
    } else {
      rows = await q(db.all(
        `SELECT c.id, c.song_name, c.author, c.text, c.created_at, c.user_id, u.avatar_url AS avatar_url
           FROM comments c ${authorJoin}
          WHERE c.status = 'approved'
          ORDER BY c.created_at DESC
          LIMIT ?`,
        [limit]
      ));
    }
    res.json({ comments: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/comments", async (req, res) => {
  if (!(await enforceNotBanned(req, res))) return;

  const key = req.user ? `user:${req.user.id}` : `ip:${clientIp(req)}`;
  const last = lastCommentAt.get(key) || 0;
  if (Date.now() - last < COMMENT_COOLDOWN_MS) {
    const wait = Math.ceil((COMMENT_COOLDOWN_MS - (Date.now() - last)) / 1000);
    return res.status(429).json({ error: `slow down — try again in ${wait}s` });
  }

  const rawText = String(req.body?.text || "").trim();
  const text = rawText.slice(0, 250);
  if (!text) return res.status(400).json({ error: "comment text is required" });

  const author = req.user
    ? req.user.username
    : (String(req.body?.author || "").trim().slice(0, 24) || "Anonymous");

  try {
    const song = await ensureSong(req.body?.song || "whispers");
    const comment = {
      id: crypto.randomUUID(),
      song_name: song,
      author,
      text,
      created_at: new Date().toISOString(),
      status: AUTO_APPROVE ? "approved" : "hidden",
      user_id: req.user ? req.user.id : null
    };

    await q(db.run(
      `INSERT INTO comments (id, song_name, author, text, created_at, status, ip, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [comment.id, comment.song_name, comment.author, comment.text, comment.created_at,
       comment.status, clientIp(req), comment.user_id]
    ));

    lastCommentAt.set(key, Date.now());
    const stats = await getSongStats(song);
    const stored = await q(db.get("SELECT avatar_url FROM users WHERE id = ?", [req.user ? req.user.id : ""]));
    res.status(201).json({
      comment: { ...comment, avatar_url: comment.user_id ? (stored ? stored.avatar_url : null) : null },
      song,
      ...stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ------------------------------------------------------------------ */
/* Public API — accounts                                              */
/* ------------------------------------------------------------------ */

function isAdminUser(user) {
  return Boolean(user && ADMIN_GITHUB_USERS.includes(String(user.username || "").toLowerCase()));
}

function publicUser(row) {
  return {
    id: row.id,
    username: row.username,
    created_at: row.created_at,
    avatar_url: row.avatar_url || null,
    bg_url: row.bg_url || null,
    bio: row.bio || "",
    profile_visibility: row.profile_visibility || "private",
    dm_policy: row.dm_policy || "anyone",
    is_admin: isAdminUser({ username: row.username })
  };
}

async function getUserByUsername(username) {
  return q(db.get("SELECT * FROM users WHERE username = ? COLLATE NOCASE", [String(username || "").trim()]));
}

async function areFriends(a, b) {
  if (!a || !b) return false;
  const row = await q(db.get(
    "SELECT 1 AS x FROM friends WHERE user_id = ? AND friend_id = ?",
    [a, b]
  ));
  return Boolean(row);
}

async function friendIdsOf(userId) {
  const rows = await q(db.all(
    `SELECT f.friend_id AS id, u.username AS username, u.avatar_url AS avatar_url
       FROM friends f JOIN users u ON u.id = f.friend_id
      WHERE f.user_id = ?
      ORDER BY u.username`,
    [userId]
  ));
  return rows;
}

// Can `sender` DM `recipientRow`? Admins bypass every policy.
async function canDm(sender, recipientRow) {
  if (!sender || !recipientRow) return { ok: false, error: "not signed in" };
  if (isAdminUser(sender)) return { ok: true };
  if (recipientRow.id === sender.id) return { ok: false, error: "you cannot DM yourself" };
  const policy = recipientRow.dm_policy || "anyone";
  if (policy === "anyone") return { ok: true };
  if (policy === "friends" && (await areFriends(sender.id, recipientRow.id))) return { ok: true };
  return { ok: false, error: policy === "friends"
    ? "this person only accepts DMs from friends"
    : "this person doesn't accept DMs (admins can still reach them)" };
}

app.post("/api/users/register", async (req, res) => {
  const ip = clientIp(req);
  if (!(await enforceNotBanned(req, res))) return;

  const last = lastRegisterAt.get(ip) || 0;
  if (Date.now() - last < REGISTER_COOLDOWN_MS) {
    const wait = Math.ceil((REGISTER_COOLDOWN_MS - (Date.now() - last)) / 1000);
    return res.status(429).json({ error: `try again in ${wait}s` });
  }

  const username = String(req.body?.username || "").trim();
  const password = String(req.body?.password || "");

  if (!USERNAME_RE.test(username)) {
    return res.status(400).json({ error: "username must be 3-20 characters (letters, numbers, _ or -)" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "password must be at least 6 characters" });
  }

  try {
    // Only well-formed attempts burn the per-IP cooldown.
    lastRegisterAt.set(ip, Date.now());

    const exists = await q(db.get("SELECT id FROM users WHERE username = ?", [username]));
    if (exists) return res.status(409).json({ error: "that username is taken" });

    const id = crypto.randomUUID();
    await q(db.run(
      "INSERT INTO users (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)",
      [id, username, hashPassword(password), new Date().toISOString()]
    ));

    const session = await createSession(id);
    const created = { id, username, created_at: new Date().toISOString() };
    res.status(201).json({ token: session.token, expires_in_ms: SESSION_TTL_MS, user: publicUser({ ...created }) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/users/login", async (req, res) => {
  const username = String(req.body?.username || "").trim();
  const password = String(req.body?.password || "");

  try {
    const row = await q(db.get("SELECT * FROM users WHERE username = ?", [username]));
    if (!row || !verifyPassword(password, row.password_hash)) {
      return setTimeout(() => res.status(401).json({ error: "wrong username or password" }), 350);
    }

    const ban = await activeBanFor(row.id, clientIp(req));
    if (ban) {
      return res.status(403).json({ error: banMessage(ban), ...banPayload(ban) });
    }

    const session = await createSession(row.id);
    res.json({ token: session.token, expires_in_ms: SESSION_TTL_MS, user: publicUser(row) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/users/logout", async (req, res) => {
  try {
    if (req.sessionToken) {
      await q(db.run("DELETE FROM sessions WHERE token = ?", [req.sessionToken]));
    }
  } catch (_) {}
  res.json({ ok: true });
});

app.get("/api/me", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "not signed in" });
  try {
    const ban = await activeBanFor(req.user.id, null);
    const likes = await q(db.all(
      "SELECT song_name FROM likes_by WHERE user_id = ?",
      [req.user.id]
    ));
    const full = await q(db.get("SELECT * FROM users WHERE id = ?", [req.user.id]));
    const pending = await q(db.get(
      "SELECT COUNT(*) AS n FROM friend_requests WHERE to_id = ?",
      [req.user.id]
    ));
    res.json({
      user: {
        ...req.user,
        ...(full ? publicUser(full) : {}),
        banned: ban ? banPayload(ban) : null
      },
      likes: likes.map((r) => r.song_name),
      friend_requests: Number(pending ? pending.n : 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ------------------------------------------------------------------ */
/* Profiles (avatar / background / bio / visibility / DM policy)       */
/* ------------------------------------------------------------------ */

const DM_COOLDOWN_MS = 3000;
const lastDmAt = new Map();          // user id -> timestamp
setInterval(() => {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [key, ts] of lastDmAt) if (ts < cutoff) lastDmAt.delete(key);
}, 10 * 60 * 1000).unref();

async function deleteProfileFile(fileUrl) {
  if (!fileUrl || !fileUrl.startsWith("/uploads/")) return;
  const name = path.basename(fileUrl);
  if (!name || name.includes("..")) return;
  fs.unlink(path.join(UPLOAD_DIR, name), () => {});
}

app.get("/api/users/:username", async (req, res) => {
  try {
    const row = await getUserByUsername(req.params.username);
    if (!row) return res.status(404).json({ error: "no such user" });

    const viewer = req.user;
    const admin = isAdminUser(viewer);
    const isSelf = Boolean(viewer && viewer.id === row.id);
    const visibility = row.profile_visibility || "private";
    const canSee = isSelf || admin || visibility === "public";

    let friends = null;
    let comments = null;
    let friend_count = 0;
    if (canSee) {
      friends = await friendIdsOf(row.id);
      friend_count = friends.length;
      comments = await q(db.all(
        `SELECT c.id, c.song_name, c.text, c.created_at, c.status
           FROM comments c
          WHERE c.user_id = ?
          ORDER BY c.created_at DESC
          LIMIT 40`,
        [row.id]
      ));
    } else {
      const n = await q(db.get("SELECT COUNT(*) AS n FROM friends WHERE user_id = ?", [row.id]));
      friend_count = Number(n ? n.n : 0);
    }

    const relationship = isSelf
      ? "self"
      : admin ? "admin"
      : (viewer && (await areFriends(viewer.id, row.id))) ? "friends" : "none";

    // Incoming pending request from this profile to me (for an Add-friend button state).
    let incoming_request = null;
    if (viewer && !isSelf) {
      incoming_request = await q(db.get(
        "SELECT id, created_at FROM friend_requests WHERE from_id = ? AND to_id = ?",
        [row.id, viewer.id]
      )) || null;
    }
    let outgoing_request = null;
    if (viewer && !isSelf) {
      outgoing_request = await q(db.get(
        "SELECT id, created_at FROM friend_requests WHERE from_id = ? AND to_id = ?",
        [viewer.id, row.id]
      )) || null;
    }

    res.json({
      user: {
        id: row.id,
        username: row.username,
        created_at: row.created_at,
        avatar_url: row.avatar_url || null,
        bg_url: row.bg_url || null,
        bio: row.bio || "",
        profile_visibility: visibility,
        dm_policy: row.dm_policy || "anyone",
        is_admin: isAdminUser({ username: row.username })
      },
      viewer: {
        is_self: isSelf,
        is_admin: admin,
        signed_in: Boolean(viewer),
        relationship,
        can_see_details: canSee,
        can_dm: viewer && !isSelf ? (await canDm(viewer, row)).ok : false,
        incoming_request,
        outgoing_request
      },
      friends,
      friend_count,
      comments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/profile", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "sign in first" });
  try {
    const updates = {};
    if (req.body?.bio !== undefined) {
      updates.bio = String(req.body.bio).trim().slice(0, 300);
    }
    if (req.body?.profile_visibility !== undefined) {
      const v = String(req.body.profile_visibility);
      if (!["private", "public"].includes(v)) {
        return res.status(400).json({ error: "profile_visibility must be 'private' or 'public'" });
      }
      updates.profile_visibility = v;
    }
    if (req.body?.dm_policy !== undefined) {
      const v = String(req.body.dm_policy);
      if (!["anyone", "friends", "nobody"].includes(v)) {
        return res.status(400).json({ error: "dm_policy must be 'anyone', 'friends' or 'nobody'" });
      }
      updates.dm_policy = v;
    }
    const keys = Object.keys(updates);
    if (!keys.length) return res.status(400).json({ error: "nothing to update" });
    const setSql = keys.map((k) => `${k} = ?`).join(", ");
    await q(db.run(`UPDATE users SET ${setSql} WHERE id = ?`, [...keys.map((k) => updates[k]), req.user.id]));
    const row = await q(db.get("SELECT * FROM users WHERE id = ?", [req.user.id]));
    res.json({ user: publicUser(row) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function setProfileImage(req, res, column) {
  if (!req.user) return res.status(401).json({ error: "sign in first" });
  try {
    const row = await q(db.get("SELECT * FROM users WHERE id = ?", [req.user.id]));
    const old = column === "avatar_url" ? row.avatar_url : row.bg_url;
    if (req.file) {
      await q(db.run(`UPDATE users SET ${column} = ? WHERE id = ?`, [
        "/uploads/" + req.file.filename, req.user.id
      ]));
      if (old) await deleteProfileFile(old);
    } else {
      // no file → clear the image
      await q(db.run(`UPDATE users SET ${column} = NULL WHERE id = ?`, [req.user.id]));
      if (old) await deleteProfileFile(old);
    }
    const fresh = await q(db.get("SELECT * FROM users WHERE id = ?", [req.user.id]));
    res.json({ user: publicUser(fresh) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

app.post("/api/profile/avatar", imageUpload.single("avatar"), (req, res) => setProfileImage(req, res, "avatar_url"));
app.post("/api/profile/bg", imageUpload.single("bg"), (req, res) => setProfileImage(req, res, "bg_url"));
app.delete("/api/profile/avatar", (req, res) => { req.file = null; setProfileImage(req, res, "avatar_url"); });
app.delete("/api/profile/bg", (req, res) => { req.file = null; setProfileImage(req, res, "bg_url"); });

/* ------------------------------------------------------------------ */
/* Friends                                                            */
/* ------------------------------------------------------------------ */

app.get("/api/friends", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "sign in first" });
  try {
    const friends = await friendIdsOf(req.user.id);
    const requests = await q(db.all(
      `SELECT r.id, r.created_at, u.id AS from_id, u.username AS from_username, u.avatar_url AS from_avatar
         FROM friend_requests r JOIN users u ON u.id = r.from_id
        WHERE r.to_id = ?
        ORDER BY r.created_at DESC`,
      [req.user.id]
    ));
    const outgoing = await q(db.all(
      `SELECT r.id, r.created_at, u.id AS to_id, u.username AS to_username
         FROM friend_requests r JOIN users u ON u.id = r.to_id
        WHERE r.from_id = ?
        ORDER BY r.created_at DESC`,
      [req.user.id]
    ));
    res.json({ friends, requests, outgoing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/friends/request", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "sign in first" });
  if (!(await enforceNotBanned(req, res))) return;
  try {
    const target = await getUserByUsername(req.body?.username);
    if (!target) return res.status(404).json({ error: "no such user" });
    if (target.id === req.user.id) return res.status(400).json({ error: "you cannot add yourself" });

    if (await areFriends(req.user.id, target.id)) {
      return res.status(409).json({ error: "you are already friends" });
    }

    // If they already asked me — accept that request instead.
    const reverse = await q(db.get(
      "SELECT * FROM friend_requests WHERE from_id = ? AND to_id = ?",
      [target.id, req.user.id]
    ));
    if (reverse) {
      await q(db.run("DELETE FROM friend_requests WHERE id = ?", [reverse.id]));
      const now = new Date().toISOString();
      await q(db.run("INSERT OR IGNORE INTO friends (user_id, friend_id, created_at) VALUES (?, ?, ?)", [req.user.id, target.id, now]));
      await q(db.run("INSERT OR IGNORE INTO friends (user_id, friend_id, created_at) VALUES (?, ?, ?)", [target.id, req.user.id, now]));
      return res.json({ ok: true, status: "friends" });
    }

    const existing = await q(db.get(
      "SELECT id FROM friend_requests WHERE from_id = ? AND to_id = ?",
      [req.user.id, target.id]
    ));
    if (existing) return res.status(409).json({ error: "request already sent" });

    const id = crypto.randomUUID();
    await q(db.run(
      "INSERT INTO friend_requests (id, from_id, to_id, created_at) VALUES (?, ?, ?, ?)",
      [id, req.user.id, target.id, new Date().toISOString()]
    ));
    res.status(201).json({ ok: true, status: "requested", id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/friends/accept", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "sign in first" });
  try {
    const request = await q(db.get("SELECT * FROM friend_requests WHERE id = ?", [String(req.body?.id || "")]));
    if (!request || request.to_id !== req.user.id) return res.status(404).json({ error: "no such request" });

    const now = new Date().toISOString();
    await q(db.run("INSERT OR IGNORE INTO friends (user_id, friend_id, created_at) VALUES (?, ?, ?)", [req.user.id, request.from_id, now]));
    await q(db.run("INSERT OR IGNORE INTO friends (user_id, friend_id, created_at) VALUES (?, ?, ?)", [request.from_id, req.user.id, now]));
    await q(db.run("DELETE FROM friend_requests WHERE id = ?", [request.id]));
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/friends/decline", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "sign in first" });
  try {
    await q(db.run("DELETE FROM friend_requests WHERE id = ? AND to_id = ?", [String(req.body?.id || ""), req.user.id]));
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/friends/:username", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "sign in first" });
  try {
    const target = await getUserByUsername(req.params.username);
    if (!target) return res.status(404).json({ error: "no such user" });
    await q(db.run("DELETE FROM friends WHERE user_id = ? AND friend_id = ?", [req.user.id, target.id]));
    await q(db.run("DELETE FROM friends WHERE user_id = ? AND friend_id = ?", [target.id, req.user.id]));
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ------------------------------------------------------------------ */
/* Direct messages                                                    */
/* ------------------------------------------------------------------ */

app.get("/api/messages/unread", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "sign in first" });
  try {
    const row = await q(db.get(
      "SELECT COUNT(*) AS n FROM messages WHERE recipient_id = ? AND read_at IS NULL",
      [req.user.id]
    ));
    res.json({ unread: Number(row ? row.n : 0) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/messages/conversations", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "sign in first" });
  try {
    const rows = await q(db.all(
      `SELECT m.id, m.sender_id, m.recipient_id, m.text, m.created_at, m.read_at
         FROM messages m
        WHERE m.sender_id = ? OR m.recipient_id = ?
        ORDER BY m.created_at DESC
        LIMIT 1000`,
      [req.user.id, req.user.id]
    ));

    const convos = new Map();
    for (const m of rows) {
      const partnerId = m.sender_id === req.user.id ? m.recipient_id : m.sender_id;
      if (!convos.has(partnerId)) {
        convos.set(partnerId, {
          partner_id: partnerId,
          last_text: m.text,
          last_at: m.created_at,
          last_from_me: m.sender_id === req.user.id,
          unread: 0
        });
      }
      if (m.recipient_id === req.user.id && !m.read_at) {
        convos.get(partnerId).unread += 1;
      }
    }

    const out = [];
    for (const c of convos.values()) {
      const u = await q(db.get("SELECT username, avatar_url FROM users WHERE id = ?", [c.partner_id]));
      if (!u) continue;
      out.push({ ...c, partner_username: u.username, partner_avatar: u.avatar_url });
    }
    out.sort((a, b) => String(b.last_at).localeCompare(String(a.last_at)));
    res.json({ conversations: out });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/messages/with/:username", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "sign in first" });
  try {
    const partner = await getUserByUsername(req.params.username);
    if (!partner) return res.status(404).json({ error: "no such user" });

    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 200, 1), 500);
    const rows = await q(db.all(
      `SELECT m.id, m.sender_id, m.recipient_id, m.text, m.created_at, m.read_at
         FROM messages m
        WHERE (m.sender_id = ? AND m.recipient_id = ?) OR (m.sender_id = ? AND m.recipient_id = ?)
        ORDER BY m.created_at DESC
        LIMIT ?`,
      [req.user.id, partner.id, partner.id, req.user.id, limit]
    ));

    // Mark their messages to me as read.
    await q(db.run(
      "UPDATE messages SET read_at = ? WHERE sender_id = ? AND recipient_id = ? AND read_at IS NULL",
      [new Date().toISOString(), partner.id, req.user.id]
    ));

    res.json({
      partner: { id: partner.id, username: partner.username, avatar_url: partner.avatar_url || null },
      can_send: (await canDm(req.user, partner)).ok,
      dm_error: (await canDm(req.user, partner)).error || null,
      messages: rows.reverse()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/messages", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "sign in first" });
  if (!(await enforceNotBanned(req, res))) return;

  const key = req.user.id;
  const last = lastDmAt.get(key) || 0;
  if (Date.now() - last < DM_COOLDOWN_MS && !isAdminUser(req.user)) {
    const wait = Math.ceil((DM_COOLDOWN_MS - (Date.now() - last)) / 1000);
    return res.status(429).json({ error: `slow down — try again in ${wait}s` });
  }

  const text = String(req.body?.text || "").trim().slice(0, 1000);
  if (!text) return res.status(400).json({ error: "message text is required" });

  try {
    const recipient = await getUserByUsername(req.body?.to);
    if (!recipient) return res.status(404).json({ error: "no such user" });

    const check = await canDm(req.user, recipient);
    if (!check.ok) return res.status(403).json({ error: check.error });

    const message = {
      id: crypto.randomUUID(),
      sender_id: req.user.id,
      recipient_id: recipient.id,
      text,
      created_at: new Date().toISOString()
    };
    await q(db.run(
      `INSERT INTO messages (id, sender_id, recipient_id, text, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [message.id, message.sender_id, message.recipient_id, message.text, message.created_at]
    ));
    lastDmAt.set(key, Date.now());
    res.status(201).json({ message, to: { username: recipient.username } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ------------------------------------------------------------------ */
/* Admin — auth                                                       */
/* ------------------------------------------------------------------ */

app.post("/api/admin/login", (req, res) => {
  if (PASSWORD_DISABLED) {
    return res.status(403).json({ error: "password login is disabled — use GitHub sign-in" });
  }
  const password = String(req.body?.password || "");
  if (!timingSafeEqualStr(password, ADMIN_PASSWORD)) {
    // Small delay to blunt brute force.
    return setTimeout(() => res.status(401).json({ error: "wrong password" }), 350);
  }
  res.json({ token: issueAdminToken(), expires_in_ms: TOKEN_TTL_MS });
});

app.post("/api/admin/logout", requireAdmin, (req, res) => {
  adminTokens.delete(req.adminToken);
  res.json({ ok: true });
});

/* --- GitHub OAuth web flow ---------------------------------------- */

function baseUrlOf(req) {
  const proto = req.protocol; // trust proxy is on, so this respects X-Forwarded-Proto
  const host = req.get("host") || `localhost:${PORT}`;
  return `${proto}://${host}`;
}

app.get("/api/auth/github", (req, res) => {
  if (!GITHUB_ENABLED) {
    return res.status(501).json({
      error: "GitHub sign-in is not configured on this server — set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET."
    });
  }
  const origin = String(req.query.origin || "");
  if (!/^https?:\/\//i.test(origin)) {
    return res.status(400).json({ error: "missing or invalid ?origin= (the admin page URL origin)" });
  }
  const redirectUri = `${baseUrlOf(req)}/api/auth/github/callback`;
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: "read:user",
    state: signState(origin),
    allow_signup: "false"
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

app.get("/api/auth/github/callback", async (req, res) => {
  const fail = (msg) => {
    const origin = verifyState(String(req.query.state || ""))?.o;
    if (origin) return res.redirect(`${origin}/admin.html?gh_error=${encodeURIComponent(msg)}`);
    res.status(403).send(`GitHub sign-in failed: ${msg}`);
  };

  if (!GITHUB_ENABLED) return fail("github not configured");
  if (req.query.error) return fail(String(req.query.error));
  const data = verifyState(String(req.query.state || ""));
  if (!data || !data.o) return fail("bad state");
  const code = String(req.query.code || "");
  if (!code) return fail("missing code");

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${baseUrlOf(req)}/api/auth/github/callback`
      })
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) return fail(tokenData.error_description || "token exchange failed");

    const userRes = await fetch("https://api.github.com/user", {
      headers: { "Authorization": `Bearer ${accessToken}`, "User-Agent": "my-music-admin", "Accept": "application/vnd.github+json" }
    });
    const ghUser = await userRes.json();
    const login = String(ghUser.login || "").toLowerCase();

    if (!login || !ADMIN_GITHUB_USERS.includes(login)) {
      return fail(`account '${login || "unknown"}' is not on the admin allow-list`);
    }

    const token = issueAdminToken();
    const oneTime = crypto.randomBytes(24).toString("hex");
    oneTimeCodes.set(oneTime, { token, expiresAt: Date.now() + 5 * 60 * 1000 });
    res.redirect(`${data.o}/admin.html?gh=${oneTime}`);
  } catch (error) {
    fail(error.message || "github request failed");
  }
});

app.post("/api/auth/github/exchange", (req, res) => {
  const code = String(req.body?.code || "");
  const entry = oneTimeCodes.get(code);
  if (!entry || entry.expiresAt <= Date.now()) {
    oneTimeCodes.delete(code);
    return res.status(400).json({ error: "invalid or expired sign-in code — try again" });
  }
  oneTimeCodes.delete(code);
  res.json({ token: entry.token, expires_in_ms: TOKEN_TTL_MS, via: "github" });
});

/* ------------------------------------------------------------------ */
/* Admin — overview & moderation                                      */
/* ------------------------------------------------------------------ */

async function adminOverviewPayload() {
  const songs = await getAllStats();

  const countRows = await q(db.all(
    `SELECT song_name,
            SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
            SUM(CASE WHEN status = 'hidden' THEN 1 ELSE 0 END) AS hidden
       FROM comments
      GROUP BY song_name`
  ));
  const countBySong = new Map(
    countRows.map((r) => [r.song_name, { approved: Number(r.approved || 0), hidden: Number(r.hidden || 0) }])
  );

  const songsOut = songs.map((s) => {
    const c = countBySong.get(s.song) || { approved: 0, hidden: 0 };
    return { ...s, comments_total: c.approved + c.hidden, comments_approved: c.approved, comments_hidden: c.hidden };
  });

  const comments = await q(db.all(
    `SELECT id, song_name, author, text, created_at, status, ip, user_id
       FROM comments
      ORDER BY created_at DESC
      LIMIT 500`
  ));

  const users = await q(db.all(
    `SELECT u.id, u.username, u.created_at, u.avatar_url, u.bg_url, u.bio,
            u.profile_visibility, u.dm_policy,
            (SELECT COUNT(*) FROM comments c WHERE c.user_id = u.id) AS comments_posted,
            (SELECT COUNT(*) FROM likes_by l WHERE l.user_id = u.id) AS likes_given,
            (SELECT COUNT(*) FROM friends f WHERE f.user_id = u.id) AS friend_count,
            (SELECT COUNT(*) FROM messages m WHERE m.sender_id = u.id) AS dms_sent
       FROM users u
      ORDER BY u.created_at DESC`
  ));

  const bans = await activeBans();

  // Attach active ban info to each user row (drives the admin Users tab).
  const banByUser = new Map(
    bans.filter((b) => b.kind === "user").map((b) => [b.value, b])
  );
  const usersOut = users.map((u) => {
    const b = banByUser.get(u.id);
    return {
      ...u,
      is_admin: isAdminUser({ username: u.username }),
      banned: b
        ? {
            until: b.expires_at ? new Date(Number(b.expires_at)).toISOString() : null,
            permanent: !b.expires_at,
            reason: b.reason || ""
          }
        : null
    };
  });

  const messages = await q(db.all(
    `SELECT m.id, m.sender_id, m.recipient_id, m.text, m.created_at, m.read_at,
            su.username AS sender_username, ru.username AS recipient_username
       FROM messages m
       LEFT JOIN users su ON su.id = m.sender_id
       LEFT JOIN users ru ON ru.id = m.recipient_id
      ORDER BY m.created_at DESC
      LIMIT 500`
  ));

  const totals = {
    listens: songsOut.reduce((a, s) => a + s.listens, 0),
    likes: songsOut.reduce((a, s) => a + s.likes, 0),
    comments: songsOut.reduce((a, s) => a + s.comments, 0),
    users: usersOut.length,
    bans: bans.length,
    dms: Number((await q(db.get("SELECT COUNT(*) AS n FROM messages")) || { n: 0 }).n)
  };

  return {
    driver: db.driver,
    auto_approve: AUTO_APPROVE,
    password_login: !PASSWORD_DISABLED,
    github_enabled: GITHUB_ENABLED,
    allowed_admins: ADMIN_GITHUB_USERS,
    totals,
    songs: songsOut,
    comments,
    users: usersOut,
    bans,
    messages
  };
}

app.get("/api/admin/overview", requireAdmin, async (_req, res) => {
  try {
    res.json(await adminOverviewPayload());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/admin/comments/:id", requireAdmin, async (req, res) => {
  const status = String(req.body?.status || "");
  if (!["approved", "hidden"].includes(status)) {
    return res.status(400).json({ error: "status must be 'approved' or 'hidden'" });
  }
  try {
    await q(db.run("UPDATE comments SET status = ? WHERE id = ?", [status, req.params.id]));
    const row = await q(db.get("SELECT * FROM comments WHERE id = ?", [req.params.id]));
    if (!row) return res.status(404).json({ error: "comment not found" });
    res.json({ comment: row });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/comments/:id", requireAdmin, async (req, res) => {
  try {
    await q(db.run("DELETE FROM comments WHERE id = ?", [req.params.id]));
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/admin/counters", requireAdmin, async (req, res) => {
  try {
    const song = await ensureSong(req.body?.song || "whispers");
    const clamp = (v) => Math.max(0, Math.min(999999999, Math.floor(Number(v) || 0)));

    if (req.body?.listens !== undefined) {
      await q(db.run(
        `INSERT INTO listens (song_name, count) VALUES (?, ?)
         ON CONFLICT(song_name) DO UPDATE SET count = excluded.count`,
        [song, clamp(req.body.listens)]
      ));
    }
    if (req.body?.likes !== undefined) {
      await q(db.run(
        `INSERT INTO likes (song_name, count) VALUES (?, ?)
         ON CONFLICT(song_name) DO UPDATE SET count = excluded.count`,
        [song, clamp(req.body.likes)]
      ));
    }
    res.json({ song, ...(await getSongStats(song)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ------------------------------------------------------------------ */
/* Admin — song library (add / edit / delete + uploads)               */
/* ------------------------------------------------------------------ */

function safeUnlink(fileUrl) {
  if (!fileUrl || !fileUrl.startsWith("/uploads/")) return;
  const name = path.basename(fileUrl);
  if (!name || name.includes("..")) return;
  fs.unlink(path.join(UPLOAD_DIR, name), () => {});
}

app.post("/api/admin/songs", requireAdmin, uploadSongFiles, async (req, res) => {
  try {
    const title = String(req.body?.title || "").trim();
    if (!title) return res.status(400).json({ error: "title is required" });
    if (title.length > 80) return res.status(400).json({ error: "title is too long (max 80)" });

    const description = String(req.body?.description || "").trim().slice(0, 2000);
    const key = normalizeSong(title);
    if (!key) return res.status(400).json({ error: "could not derive a song key from that title" });

    const existing = await q(db.get("SELECT song_name FROM songs WHERE song_name = ?", [key]));
    if (existing) {
      const files = uploadedFiles(req);
      if (files.audio) safeUnlink(publicFileUrl(files.audio));
      if (files.cover) safeUnlink(publicFileUrl(files.cover));
      return res.status(409).json({ error: `a track called '${title}' already exists — edit it from the Songs tab instead` });
    }

    const files = uploadedFiles(req);
    await q(db.run(
      `INSERT INTO songs (song_name, display_name, description, cover_url, audio_url, source, created_at)
       VALUES (?, ?, ?, ?, ?, 'admin', ?)`,
      [key, title, description, publicFileUrl(files.cover), publicFileUrl(files.audio), new Date().toISOString()]
    ));

    res.status(201).json({ song: key, ...(await getSongStats(key)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/admin/songs/:song", requireAdmin, uploadSongFiles, async (req, res) => {
  try {
    const key = normalizeSong(req.params.song);
    const row = await q(db.get("SELECT * FROM songs WHERE song_name = ?", [key]));
    if (!row) return res.status(404).json({ error: "song not found" });

    const updates = {};
    const files = uploadedFiles(req);

    if (req.body?.display_name !== undefined && String(req.body.display_name).trim()) {
      updates.display_name = String(req.body.display_name).trim().slice(0, 80);
    }
    if (req.body?.description !== undefined) {
      updates.description = String(req.body.description).trim().slice(0, 2000);
    }
    if (files.cover) {
      safeUnlink(row.cover_url);
      updates.cover_url = publicFileUrl(files.cover);
    } else if (req.body?.remove_cover === "1" || req.body?.remove_cover === 1) {
      safeUnlink(row.cover_url);
      updates.cover_url = null;
    }
    if (files.audio) {
      safeUnlink(row.audio_url);
      updates.audio_url = publicFileUrl(files.audio);
    }

    const keys = Object.keys(updates);
    if (!keys.length) return res.status(400).json({ error: "nothing to update" });

    const setSql = keys.map((k) => `${k} = ?`).join(", ");
    await q(db.run(`UPDATE songs SET ${setSql} WHERE song_name = ?`, [...keys.map((k) => updates[k]), key]));

    res.json({ song: key, ...(await getSongStats(key)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/songs/:song", requireAdmin, async (req, res) => {
  try {
    const key = normalizeSong(req.params.song);
    const row = await q(db.get("SELECT * FROM songs WHERE song_name = ?", [key]));
    if (!row) return res.status(404).json({ error: "song not found" });
    if (row.source !== "admin") {
      return res.status(400).json({ error: "this track is bundled with the site — it can be edited but not deleted" });
    }

    safeUnlink(row.cover_url);
    safeUnlink(row.audio_url);
    await q(db.run("DELETE FROM comments WHERE song_name = ?", [key]));
    await q(db.run("DELETE FROM likes_by WHERE song_name = ?", [key]));
    await q(db.run("DELETE FROM listens WHERE song_name = ?", [key]));
    await q(db.run("DELETE FROM likes WHERE song_name = ?", [key]));
    await q(db.run("DELETE FROM songs WHERE song_name = ?", [key]));

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ------------------------------------------------------------------ */
/* Admin — users & bans                                               */
/* ------------------------------------------------------------------ */

app.post("/api/admin/users/:id/ban", requireAdmin, async (req, res) => {
  try {
    const row = await q(db.get("SELECT * FROM users WHERE id = ?", [req.params.id]));
    if (!row) return res.status(404).json({ error: "user not found" });

    const hoursRaw = req.body?.hours;
    const hours = hoursRaw === null || hoursRaw === undefined || hoursRaw === "" || Number(hoursRaw) === 0
      ? null
      : Math.max(0.01, Number(hoursRaw) || 0);
    const reason = String(req.body?.reason || "").trim().slice(0, 200) || "no reason given";

    await banTarget({ kind: "user", value: row.id, hours, reason, createdBy: "admin" });
    res.json({ ok: true, user: { id: row.id, username: row.username }, banned: banPayload({ expires_at: hours ? Date.now() + hours * 3600000 : null, reason }) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/users/:id/unban", requireAdmin, async (req, res) => {
  try {
    await q(db.run("DELETE FROM bans WHERE kind = 'user' AND value = ?", [req.params.id]));
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
  try {
    const row = await q(db.get("SELECT id FROM users WHERE id = ?", [req.params.id]));
    if (!row) return res.status(404).json({ error: "user not found" });
    await q(db.run("DELETE FROM sessions WHERE user_id = ?", [row.id]));
    await q(db.run("DELETE FROM likes_by WHERE user_id = ?", [row.id]));
    await q(db.run("UPDATE comments SET user_id = NULL WHERE user_id = ?", [row.id]));
    await q(db.run("DELETE FROM bans WHERE kind = 'user' AND value = ?", [row.id]));
    await q(db.run("DELETE FROM friends WHERE user_id = ? OR friend_id = ?", [row.id, row.id]));
    await q(db.run("DELETE FROM friend_requests WHERE from_id = ? OR to_id = ?", [row.id, row.id]));
    await q(db.run("DELETE FROM messages WHERE sender_id = ? OR recipient_id = ?", [row.id, row.id]));
    await q(db.run("DELETE FROM users WHERE id = ?", [row.id]));
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/messages/:id", requireAdmin, async (req, res) => {
  try {
    await q(db.run("DELETE FROM messages WHERE id = ?", [req.params.id]));
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin/bans", requireAdmin, async (_req, res) => {
  try {
    res.json({ bans: await activeBans() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/bans", requireAdmin, async (req, res) => {
  try {
    const kind = String(req.body?.kind || "") === "user" ? "user" : "ip";
    const value = String(req.body?.value || "").trim();
    if (!value || value.length > 64) return res.status(400).json({ error: "a value (IP or user id) is required" });
    if (kind === "ip" && !/^[0-9a-fA-F:.]+$/.test(value)) {
      return res.status(400).json({ error: "that does not look like an IP address" });
    }

    const hoursRaw = req.body?.hours;
    const hours = hoursRaw === null || hoursRaw === undefined || hoursRaw === "" || Number(hoursRaw) === 0
      ? null
      : Math.max(0.01, Number(hoursRaw) || 0);
    const reason = String(req.body?.reason || "").trim().slice(0, 200) || "no reason given";

    const id = await banTarget({ kind, value, hours, reason, createdBy: "admin" });
    res.status(201).json({ ok: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/bans/:id", requireAdmin, async (req, res) => {
  try {
    await q(db.run("DELETE FROM bans WHERE id = ?", [req.params.id]));
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ------------------------------------------------------------------ */
/* Fallbacks                                                          */
/* ------------------------------------------------------------------ */

app.use("/api", (_req, res) => res.status(404).json({ error: "unknown API endpoint" }));

// multipart / upload errors → JSON
app.use((error, _req, res, _next) => {
  if (error && (error.code === "LIMIT_FILE_SIZE" || error instanceof multer.MulterError)) {
    return res.status(413).json({ error: error.code === "LIMIT_FILE_SIZE" ? "file too large (max 120 MB)" : error.message });
  }
  if (error) return res.status(400).json({ error: error.message });
  res.status(500).json({ error: "server error" });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* ------------------------------------------------------------------ */
/* Start                                                              */
/* ------------------------------------------------------------------ */

async function initDatabase() {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS songs (
      song_name TEXT PRIMARY KEY,
      display_name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS listens (
      song_name TEXT PRIMARY KEY,
      count INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (song_name) REFERENCES songs(song_name)
    );

    CREATE TABLE IF NOT EXISTS likes (
      song_name TEXT PRIMARY KEY,
      count INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (song_name) REFERENCES songs(song_name)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      song_name TEXT NOT NULL,
      author TEXT NOT NULL DEFAULT 'Anonymous',
      text TEXT NOT NULL,
      created_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'approved'
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT COLLATE NOCASE NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bans (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      value TEXT NOT NULL,
      reason TEXT,
      created_by TEXT,
      created_at TEXT NOT NULL,
      expires_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS likes_by (
      song_name TEXT NOT NULL,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (song_name, user_id)
    );

    CREATE TABLE IF NOT EXISTS friends (
      user_id TEXT NOT NULL,
      friend_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, friend_id)
    );

    CREATE TABLE IF NOT EXISTS friend_requests (
      id TEXT PRIMARY KEY,
      from_id TEXT NOT NULL,
      to_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      recipient_id TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL,
      read_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_comments_song ON comments(song_name, created_at);
    CREATE INDEX IF NOT EXISTS idx_bans_value ON bans(kind, value);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_friend_requests_to ON friend_requests(to_id);
  `);

  // Migrations for databases created by earlier versions.
  const addColumnIfMissing = async (table, decl) => {
    const name = decl.split(/\s+/)[0];
    const cols = await q(db.all(`PRAGMA table_info(${table})`));
    if (!cols.some((c) => c.name === name)) {
      await q(db.run(`ALTER TABLE ${table} ADD COLUMN ${decl}`));
    }
  };

  await addColumnIfMissing("songs", "description TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing("songs", "cover_url TEXT");
  await addColumnIfMissing("songs", "audio_url TEXT");
  await addColumnIfMissing("songs", "source TEXT NOT NULL DEFAULT 'static'");
  await addColumnIfMissing("songs", "created_at TEXT");
  await addColumnIfMissing("comments", "ip TEXT");
  await addColumnIfMissing("comments", "user_id TEXT");
  await addColumnIfMissing("users", "avatar_url TEXT");
  await addColumnIfMissing("users", "bg_url TEXT");
  await addColumnIfMissing("users", "bio TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing("users", "profile_visibility TEXT NOT NULL DEFAULT 'private'");
  await addColumnIfMissing("users", "dm_policy TEXT NOT NULL DEFAULT 'anyone'");

  const defaultSongs = [
    "Whispers",
    "When I Think About You",
    "Deep Space",
    "Insterstellar Roadtrip (Slowed)",
    "Interstellar Roadtrip (Sped)",
    "Interstellar Roadtrip",
    "Late Night Disco",
    "Light in the Dark",
    "Sands of Time",
    "Solar Synth Relift",
    "Solar Synth"
  ];

  for (const song of defaultSongs) await ensureSong(song);

  // Safety net: make sure EVERY audio file bundled in /audio ends up on the
  // site, even if someone drops a new mp3 in the folder without editing the
  // tracks list above.
  const audioDir = path.join(__dirname, "audio");
  let scanned = [];
  try {
    scanned = fs.readdirSync(audioDir)
      .filter((f) => /\.(mp3|wav|ogg|m4a|flac)$/i.test(f))
      .map((f) => f.replace(/\.[^.]+$/, "").replace(/^Thomas Miller\s*-\s*/i, "").trim())
      .filter(Boolean);
  } catch (_) {}
  for (const song of scanned) {
    if (!defaultSongs.some((s) => normalizeSong(s) === normalizeSong(song))) {
      await ensureSong(song);
      console.log(`Auto-added bundled song from /audio: ${song}`);
    }
  }

  await q(db.run("INSERT OR IGNORE INTO listens (song_name, count) VALUES ('whispers', 10)"));
  await q(db.run("INSERT OR IGNORE INTO likes (song_name, count) VALUES ('whispers', 7)"));
}

initDatabase()
  .then(() => {
    console.log(`Database ready (${db.driver}): ${DB_PATH}`);
    console.log(`Uploads directory: ${UPLOAD_DIR}`);
    if (PASSWORD_DISABLED) {
      console.log("Password login: DISABLED (ADMIN_PASSWORD=off) — admins sign in with GitHub.");
    } else if (PASSWORD_GENERATED) {
      const pwFile = path.join(path.dirname(DB_PATH), "admin-password.txt");
      try { fs.writeFileSync(pwFile, `${ADMIN_PASSWORD}\n`); } catch (_) {}
      console.log("========================================================");
      console.log("  ADMIN_PASSWORD was not set — generated one for you:");
      console.log(`  admin password: ${ADMIN_PASSWORD}`);
      console.log(`  (also saved to ${pwFile})`);
      console.log("  Set ADMIN_PASSWORD in your environment to choose your own,");
      console.log('  or ADMIN_PASSWORD=off to disable password login entirely.');
      console.log("========================================================");
    }
    console.log(`GitHub admin sign-in: ${GITHUB_ENABLED ? "enabled" : "not configured"} — allowed: ${ADMIN_GITHUB_USERS.join(", ")}`);
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
      console.log(`Admin panel: http://localhost:${PORT}/admin.html`);
    });
  })
  .catch((error) => {
    console.error("Database init failed:", error.message);
    process.exit(1);
  });
