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
  password_hash TEXT NOT NULL,               -- scrypt: "<salt>:<hash>" ('' for GitHub-only accounts)
  github_login TEXT,                         -- github login for OAuth sign-ins (NULL for password accounts)
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

-- v4 additions: profiles, friends, DMs
-- (users gains avatar_url, bg_url, bio, profile_visibility, dm_policy via
--  ALTER TABLE migrations in server.js)

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

CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, created_at);
CREATE INDEX IF NOT EXISTS idx_friend_requests_to ON friend_requests(to_id);

INSERT OR IGNORE INTO songs (song_name, display_name) VALUES
  ('when-i-think-about-you', 'When I Think About You');

-- v7 additions: Message Z.ai (admin-only AI chat + developer direct access)
CREATE TABLE IF NOT EXISTS zai_messages (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,          -- 'admin' (sent from the panel) | 'zai' (reply)
  text TEXT NOT NULL,
  created_at TEXT NOT NULL,
  via TEXT                     -- 'llm' (auto-reply) | 'developer' (direct access)
);

CREATE INDEX IF NOT EXISTS idx_zai_messages_time ON zai_messages(created_at);
