/*
 * Thomas Miller — music site backend
 *
 * One Node process serves:
 *   - the static site (index.html, admin.html, audio, ...)
 *   - a SQLite-backed API: per-song listens / likes / comments
 *   - a password-protected admin API used by admin.html
 *
 * Database: uses the built-in node:sqlite (Node >= 22.5) when available,
 * and falls back to the `sqlite3` npm package on older Node versions.
 *
 * Run:  npm install && node server.js
 * Env:  PORT, ADMIN_PASSWORD, AUTO_APPROVE ("true" | "false", default "true"),
 *       DB_PATH (default ./data/music.db)
 */

const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "data", "music.db");
const AUTO_APPROVE = String(process.env.AUTO_APPROVE || "true") !== "false";
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // admin session: 12h

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
      run(sql, params = []) {
        handle.prepare(sql).run(...params);
      },
      get(sql, params = []) {
        return handle.prepare(sql).get(...params);
      },
      all(sql, params = []) {
        return handle.prepare(sql).all(...params);
      },
      exec(sql) {
        handle.exec(sql);
      }
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

const db = openDatabase();
const isPromiseDriver = db.driver === "sqlite3";
// node:sqlite calls are synchronous; sqlite3 calls return promises.
// Awaiting both works fine.
const q = (result) => Promise.resolve(result);

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function normalizeSong(song) {
  const value = String(song || "whispers").trim();
  if (!value) return "whispers";
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "whispers";
}

async function ensureSong(song) {
  const key = normalizeSong(song);
  const displayName = (String(song || "Whispers").trim() || "Whispers");
  await q(db.run(
    "INSERT OR IGNORE INTO songs (song_name, display_name) VALUES (?, ?)",
    [key, displayName]
  ));
  return key;
}

async function getSongStats(song) {
  const row = await q(db.get(
    `SELECT s.display_name AS display_name,
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

  if (!row) {
    return { display_name: song, listens: 0, likes: 0, comments: 0 };
  }
  return {
    display_name: row.display_name || song,
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
            COALESCE(l.count, 0) AS listens,
            COALESCE(k.count, 0) AS likes,
            (SELECT COUNT(*) FROM comments c
              WHERE c.song_name = s.song_name AND c.status = 'approved') AS comments
       FROM songs s
       LEFT JOIN listens l ON l.song_name = s.song_name
       LEFT JOIN likes k ON k.song_name = s.song_name
      ORDER BY s.rowid`
  ));
  return rows.map((r) => ({
    song: r.song,
    display_name: r.display_name,
    listens: Number(r.listens || 0),
    likes: Number(r.likes || 0),
    comments: Number(r.comments || 0)
  }));
}

function clientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length) return fwd.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

/* ------------------------------------------------------------------ */
/* Admin auth                                                         */
/* ------------------------------------------------------------------ */

function resolveAdminPassword() {
  const fromEnv = String(process.env.ADMIN_PASSWORD || "").trim();
  if (fromEnv) return { password: fromEnv, generated: false };

  const generated = crypto.randomBytes(4).toString("hex"); // 8 chars
  return { password: generated, generated: true };
}

const { password: ADMIN_PASSWORD, generated: PASSWORD_GENERATED } = resolveAdminPassword();
const adminTokens = new Map(); // token -> expiresAt

function timingSafeEqualStr(a, b) {
  const ha = crypto.createHash("sha256").update(String(a)).digest();
  const hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function issueToken() {
  const token = crypto.randomBytes(24).toString("hex");
  adminTokens.set(token, Date.now() + TOKEN_TTL_MS);
  return token;
}

function pruneTokens() {
  const now = Date.now();
  for (const [token, expires] of adminTokens) {
    if (expires <= now) adminTokens.delete(token);
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

/* ------------------------------------------------------------------ */
/* Rate limiting (comments)                                           */
/* ------------------------------------------------------------------ */

const COMMENT_COOLDOWN_MS = 8000;
const lastCommentAt = new Map(); // ip -> timestamp

setInterval(() => {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [ip, ts] of lastCommentAt) {
    if (ts < cutoff) lastCommentAt.delete(ip);
  }
}, 10 * 60 * 1000).unref();

/* ------------------------------------------------------------------ */
/* Middleware                                                         */
/* ------------------------------------------------------------------ */

app.use(express.json({ limit: "16kb" }));

// CORS: the GitHub Pages site talks to this API cross-origin.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});

// Never serve server internals or the database directory.
const BLOCKED = new Set([
  "server.js", "package.json", "package-lock.json", "schema.sql",
  "data", "node_modules", ".git"
]);
app.use((req, res, next) => {
  const first = decodeURIComponent(req.path.split("/")[1] || "");
  if (first && BLOCKED.has(first)) {
    return res.status(403).json({ error: "forbidden" });
  }
  next();
});

app.use(express.static(__dirname, { extensions: ["html"] }));

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, driver: db.driver, auto_approve: AUTO_APPROVE });
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
    res.json({ song, ...stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/listen", async (req, res) => {
  try {
    const song = await ensureSong(req.body?.song || req.query.song || "whispers");
    await incrementCounter("listens", song);
    res.json({ song, ...(await getSongStats(song)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/like", async (req, res) => {
  try {
    const song = await ensureSong(req.body?.song || req.query.song || "whispers");
    const action = String(req.body?.action || "like") === "unlike" ? "unlike" : "like";

    if (action === "unlike") await decrementCounter("likes", song);
    else await incrementCounter("likes", song);

    res.json({ song, liked: action === "like", ...(await getSongStats(song)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/comments", async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);

    let rows;
    if (req.query.song) {
      const song = normalizeSong(req.query.song);
      rows = await q(db.all(
        `SELECT id, song_name, author, text, created_at
           FROM comments
          WHERE song_name = ? AND status = 'approved'
          ORDER BY created_at DESC
          LIMIT ?`,
        [song, limit]
      ));
    } else {
      rows = await q(db.all(
        `SELECT id, song_name, author, text, created_at
           FROM comments
          WHERE status = 'approved'
          ORDER BY created_at DESC
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
  const ip = clientIp(req);
  const last = lastCommentAt.get(ip) || 0;

  if (Date.now() - last < COMMENT_COOLDOWN_MS) {
    const wait = Math.ceil((COMMENT_COOLDOWN_MS - (Date.now() - last)) / 1000);
    return res.status(429).json({ error: `slow down — try again in ${wait}s` });
  }

  const rawText = String(req.body?.text || "").trim();
  const rawAuthor = String(req.body?.author || "").trim();
  const text = rawText.slice(0, 250);
  const author = (rawAuthor.slice(0, 24) || "Anonymous");

  if (!text) return res.status(400).json({ error: "comment text is required" });

  try {
    const song = await ensureSong(req.body?.song || "whispers");
    const comment = {
      id: crypto.randomUUID(),
      song_name: song,
      author,
      text,
      created_at: new Date().toISOString(),
      status: AUTO_APPROVE ? "approved" : "hidden"
    };

    await q(db.run(
      `INSERT INTO comments (id, song_name, author, text, created_at, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [comment.id, comment.song_name, comment.author, comment.text, comment.created_at, comment.status]
    ));

    lastCommentAt.set(ip, Date.now());
    const stats = await getSongStats(song);
    res.status(201).json({ comment, song, ...stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ------------------------------------------------------------------ */
/* Admin API                                                          */
/* ------------------------------------------------------------------ */

app.post("/api/admin/login", (req, res) => {
  const password = String(req.body?.password || "");
  if (!timingSafeEqualStr(password, ADMIN_PASSWORD)) {
    // Small delay to blunt brute force.
    setTimeout(() => res.status(401).json({ error: "wrong password" }), 350);
    return;
  }
  res.json({ token: issueToken(), expires_in_ms: TOKEN_TTL_MS });
});

app.post("/api/admin/logout", requireAdmin, (req, res) => {
  adminTokens.delete(req.adminToken);
  res.json({ ok: true });
});

app.get("/api/admin/overview", requireAdmin, async (_req, res) => {
  try {
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
      `SELECT id, song_name, author, text, created_at, status
         FROM comments
        ORDER BY created_at DESC
        LIMIT 500`
    ));

    res.json({ driver: db.driver, songs: songsOut, comments });
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
/* Fallbacks                                                          */
/* ------------------------------------------------------------------ */

app.use("/api", (_req, res) => res.status(404).json({ error: "unknown API endpoint" }));

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

    CREATE INDEX IF NOT EXISTS idx_comments_song ON comments(song_name, created_at);
  `);

  const defaultSongs = [
    "Whispers",
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
  await q(db.run("INSERT OR IGNORE INTO listens (song_name, count) VALUES ('whispers', 10)"));
  await q(db.run("INSERT OR IGNORE INTO likes (song_name, count) VALUES ('whispers', 7)"));
}

initDatabase()
  .then(() => {
    console.log(`Database ready (${db.driver}): ${DB_PATH}`);
    if (PASSWORD_GENERATED) {
      const pwFile = path.join(path.dirname(DB_PATH), "admin-password.txt");
      try { fs.writeFileSync(pwFile, `${ADMIN_PASSWORD}\n`); } catch (_) {}
      console.log("========================================================");
      console.log("  ADMIN_PASSWORD was not set — generated one for you:");
      console.log(`  admin password: ${ADMIN_PASSWORD}`);
      console.log(`  (also saved to ${pwFile})`);
      console.log("  Set ADMIN_PASSWORD in your environment to choose your own.");
      console.log("========================================================");
    }
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
      console.log(`Admin panel: http://localhost:${PORT}/admin.html`);
    });
  })
  .catch((error) => {
    console.error("Database init failed:", error.message);
    process.exit(1);
  });
