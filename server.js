const express = require("express");
const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const dbDir = path.join(__dirname, "data");
const dbPath = path.join(dbDir, "music.db");

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Failed to open SQLite database:", err.message);
    process.exit(1);
  }
  console.log("Connected to SQLite database:", dbPath);
});

function normalizeSong(song) {
  const value = String(song || "whispers").trim();
  if (!value) return "whispers";
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "whispers";
}

function ensureSong(song) {
  const key = normalizeSong(song);
  const displayName = (song || "Whispers").trim() || "Whispers";

  return new Promise((resolve, reject) => {
    db.run(
      "INSERT OR IGNORE INTO songs (song_name, display_name) VALUES (?, ?)",
      [key, displayName],
      (err) => {
        if (err) return reject(err);
        resolve(key);
      }
    );
  });
}

function getSongStats(song) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT s.display_name AS display_name,
              COALESCE(l.count, 0) AS listens,
              COALESCE(k.count, 0) AS likes
       FROM songs s
       LEFT JOIN listens l ON l.song_name = s.song_name
       LEFT JOIN likes k ON k.song_name = s.song_name
       WHERE s.song_name = ?`,
      [song],
      (err, row) => {
        if (err) return reject(err);
        resolve(
          row || {
            display_name: song,
            listens: 0,
            likes: 0
          }
        );
      }
    );
  });
}

function incrementCounter(tableName, song) {
  return new Promise((resolve, reject) => {
    db.run(`INSERT OR IGNORE INTO ${tableName} (song_name, count) VALUES (?, 0)`, [song], (insertErr) => {
      if (insertErr) return reject(insertErr);

      db.run(`UPDATE ${tableName} SET count = count + 1 WHERE song_name = ?`, [song], (updateErr) => {
        if (updateErr) return reject(updateErr);
        resolve();
      });
    });
  });
}

function initDatabase() {
  const schema = `
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
  `;

  db.exec(schema, (err) => {
    if (err) {
      console.error("Schema init failed:", err.message);
      process.exit(1);
    }

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

    Promise.all(defaultSongs.map((song) => ensureSong(song)))
      .then(() => console.log("Database initialized with default song entries."))
      .catch((error) => console.error("Failed to seed song list:", error.message));
  });
}

app.use(express.json());
app.use(express.static(__dirname));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/stats", async (req, res) => {
  const song = normalizeSong(req.query.song || "whispers");

  try {
    await ensureSong(song);
    const stats = await getSongStats(song);

    res.json({
      song,
      display_name: stats.display_name || song,
      listens: Number(stats.listens || 0),
      likes: Number(stats.likes || 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/listen", async (req, res) => {
  const song = normalizeSong(req.body?.song || req.query.song || "whispers");

  try {
    await ensureSong(song);
    await incrementCounter("listens", song);
    const stats = await getSongStats(song);

    res.json({
      song,
      display_name: stats.display_name || song,
      listens: Number(stats.listens || 0),
      likes: Number(stats.likes || 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/like", async (req, res) => {
  const song = normalizeSong(req.body?.song || req.query.song || "whispers");

  try {
    await ensureSong(song);
    await incrementCounter("likes", song);
    const stats = await getSongStats(song);

    res.json({
      song,
      display_name: stats.display_name || song,
      listens: Number(stats.listens || 0),
      likes: Number(stats.likes || 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

initDatabase();

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
