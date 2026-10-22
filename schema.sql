-- Thomas Miller music site — SQLite schema (v3)
-- Applied automatically by server.js on startup (including the ALTER TABLE
-- migrations for databases created by older versions); kept here for
-- reference / manual setup.

CREATE TABLE IF NOT EXISTS songs (
  song_name TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  cover_url TEXT,                            -- /uploads/... (admin-added art)
  audio_url TEXT,                            -- /uploads/... (admin-added audio)
  source TEXT NOT NULL DEFAULT 'static',     -- 'static' (bundled) | 'admin' (added in panel)
  created_at TEXT
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

-- One row per (song, account) like — enforces one like per account per song.
CREATE TABLE IF NOT EXISTS likes_by (
  song_name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (song_name, user_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  song_name TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Anonymous',
  text TEXT NOT NULL,
  created_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'approved',   -- 'approved' | 'hidden'
  ip TEXT,                                   -- stored for moderation (ban by IP)
  user_id TEXT                               -- set when posted by a signed-in account
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT COLLATE NOCASE NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,               -- scrypt: "<salt>:<hash>"
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at INTEGER NOT NULL                -- epoch ms
);

-- Global bans & timeouts. kind='user' bans an account by id, kind='ip' bans
-- an address. expires_at NULL = permanent.
CREATE TABLE IF NOT EXISTS bans (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,                        -- 'ip' | 'user'
  value TEXT NOT NULL,                       -- ip address or user id
  reason TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL,
  expires_at INTEGER                         -- epoch ms; NULL = permanent
);

CREATE INDEX IF NOT EXISTS idx_comments_song ON comments(song_name, created_at);
CREATE INDEX IF NOT EXISTS idx_bans_value ON bans(kind, value);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

INSERT OR IGNORE INTO songs (song_name, display_name) VALUES
  ('whispers', 'Whispers'),
  ('deep-space', 'Deep Space'),
  ('insterstellar-roadtrip-slowed', 'Insterstellar Roadtrip (Slowed)'),
  ('interstellar-roadtrip-sped', 'Interstellar Roadtrip (Sped)'),
  ('interstellar-roadtrip', 'Interstellar Roadtrip'),
  ('late-night-disco', 'Late Night Disco'),
  ('light-in-the-dark', 'Light in the Dark'),
  ('sands-of-time', 'Sands of Time'),
  ('solar-synth-relift', 'Solar Synth Relift'),
  ('solar-synth', 'Solar Synth');

INSERT OR IGNORE INTO listens (song_name, count) VALUES ('whispers', 10);
INSERT OR IGNORE INTO likes (song_name, count) VALUES ('whispers', 7);
