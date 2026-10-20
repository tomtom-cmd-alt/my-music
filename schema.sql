-- Thomas Miller music site — SQLite schema
-- Applied automatically by server.js on startup; kept here for reference/manual setup.

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
  status TEXT NOT NULL DEFAULT 'approved'  -- 'approved' | 'hidden'
);

CREATE INDEX IF NOT EXISTS idx_comments_song ON comments(song_name, created_at);

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
