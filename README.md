# Thomas Miller — Music Site

A personal music archive: stream tracks, download stems and Ableton sets, like
songs, leave comments — with accounts, global moderation, and a full admin
panel. The public site is static (GitHub Pages) and talks to a tiny Node +
SQLite backend for everything global.

## What's inside (v4)

| Feature | Where |
| --- | --- |
| Per-song listens / likes / comments | `server.js` + SQLite |
| **Separate sub-sites**: `/music`, `/stems`, `/live-sets`, `/about` | `music.html`, `stems.html`, `live-sets.html`, `about.html` |
| **Profiles**: custom picture, background, bio, visibility (`private` / `All Visible`) | `/profile`, `profile.js`, `users` table |
| **Friends**: requests, accept/decline, remove — visible only on `All Visible` profiles | `friends` + `friend_requests` tables |
| **Direct messages** with per-user policy: anyone / friends-only / nobody (admins always through) | `/messages`, `messages.js`, `messages` table |
| **Admin panel**: comments (all of them), songs, users (profiles + activity), DM moderation, bans | `admin.html`, `admin.js` |
| Auto-scan of `audio/` — every bundled mp3 lands on the site automatically | `initDatabase()` in `server.js` |
| **User accounts** (register / sign in) | `POST /api/users/*`, sign-in modal on the site |
| **Global bans & timeouts** (account + IP, hours or permanent) | `bans` table, admin Users/Bans tabs |
| **Add songs from the panel** (title, description, audio + cover upload) | `POST /api/admin/songs`, `/uploads` |
| **SoundCloud-style descriptions + cover art** | `songs.description` / `songs.cover_url`, shown on the player |
| **GitHub sign-in for the panel** (restricted to `ADMIN_GITHUB_USERS`) | `/api/auth/github*` |
| Comment moderation (hide / show / delete, ban from a comment) | admin Comments tab |
| Counter correction | admin panel → Song cards / counters |

## Architecture

```
GitHub Pages (static)                Node backend (server.js)
┌─────────────────────────┐          ┌──────────────────────────────┐
│ index.html  script.js   │  fetch   │ Express REST API             │
│ admin.html  admin.js    │ ───────► │  ├─ /api/*  (public)         │
│ api.js → MusicAPI       │          │  ├─ /api/users/* (accounts)  │
│ config.js → apiBase     │          │  ├─ /api/admin/* (auth'd)    │
└─────────────────────────┘          │  ├─ /uploads (audio + art)   │
                                     │  └─ SQLite (data/music.db)   │
                                     └──────────────────────────────┘
```

No backend reachable? The site still works — counters and comments fall back
to localStorage per device until `apiBase` is configured.

## Deploy the backend

1. Push this repo, then create a free web service on **Render** / **Railway** /
   **Fly.io** pointing at it:
   - Build: `npm install`  ·  Start: `node server.js`
2. Set environment variables (see below).
3. Put the service URL in `config.js` → `apiBase: "https://your-api.onrender.com"`,
   commit, push. Pages picks it up automatically.

> Free tiers have ephemeral disks — uploaded audio/covers and the SQLite file
> reset on redeploy. For permanence, mount a disk (Render/Railway) or set
> `DB_PATH` / `UPLOAD_DIR` to the mounted path.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | listen port (default 3000) |
| `DB_PATH` | SQLite file (default `./data/music.db`) |
| `UPLOAD_DIR` | uploads folder (default `./uploads`) |
| `AUTO_APPROVE` | `false` → new comments start hidden until approved |
| `ADMIN_PASSWORD` | admin password; **`off`** disables password login (GitHub only). Unset → a random one is generated and printed to the console. |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | a GitHub **OAuth App** — enables "Sign in with GitHub" on the panel. Callback URL: `https://your-api.onrender.com/api/auth/github/callback` |
| `ADMIN_GITHUB_USERS` | comma-separated GitHub logins allowed as admins (default `tomtom-cmd,tomtom-cmd-alt`) |
| `SESSION_TTL_DAYS` | user session lifetime (default 30) |
| `GITHUB_TOKEN` | **data persistence** — fine-grained PAT with *Contents: read/write* on this repo. Together with `DATA_SECRET` this enables automatic snapshots of the database + uploads. |
| `DATA_SECRET` | **data persistence** — any long random passphrase. The snapshot is AES-256-GCM encrypted with it before being pushed to git. |
| `GITHUB_BACKUP_REPO` | optional, default `tomtom-cmd-alt/my-music` |
| `DATA_BRANCH` | optional, default `site-data` (the branch where snapshots live) |

### Data persistence across deploys (Render free tier)

Render's free disk is ephemeral — without extra help every deploy wipes all
accounts, comments and DMs. With `GITHUB_TOKEN` + `DATA_SECRET` set, the
server mirrors an **encrypted** snapshot of the DB, admin files and uploaded
media to the `site-data` branch in this repo:

- **restore** — on boot, if the local DB is missing (fresh container), the
  snapshot is downloaded, decrypted and put in place *before* the DB opens.
- **backup** — debounced 12 s after every successful write, swept every
  3 minutes, and flushed on `SIGTERM` (i.e. right before Render kills the
  old container during a deploy).
- everything is AES-256-GCM encrypted with `DATA_SECRET`, so the public
  repo never sees plaintext passwords, sessions or messages.
- admins can watch it live: Admin panel → **Site** tab (status + "Back up
  now"), and toggle the **maintenance banner** there too.

If the env vars are missing, the site still works but persistence shows
"OFF" in the admin panel and data resets on each deploy.

### Maintenance banner

`maintenance.json` in the repo root drives a full-screen "we're improving
things" banner on every page (`/api/maintenance`, polled every 30 s, page
auto-reloads when it lifts). Flip it from the admin panel (**Site** tab) or
by editing the file and pushing. Admins see a "continue anyway" button.

### Setting up GitHub admin sign-in

1. GitHub → Settings → Developer settings → **OAuth Apps** → New OAuth App.
2. Homepage URL: your site (`https://tomtom-cmd-alt.github.io/my-music/`).
   Authorization callback URL: `https://your-api.onrender.com/api/auth/github/callback`.
3. Copy the **Client ID** and generate a **Client Secret** → set both as env vars.
4. Only the logins in `ADMIN_GITHUB_USERS` get in — everyone else is bounced
   with "not on the admin allow-list".

## Admin panel

Open `/admin.html` (linked in the footer). Sign in with GitHub or the admin
password. Tabs:

- **Overview** — live totals for listens / likes / comments / accounts / bans.
- **Comments** — filter by track & status; hide/show, delete, and ban the
  author's account or IP straight from any comment (IPs are captured for
  moderation and never exposed publicly).
- **Songs** — edit any track's name, SoundCloud-style description, cover art
  and audio; add brand-new songs (appear on the site instantly); delete
  panel-added songs.
- **Users** — every account with activity stats; ban/timeout (hours or
  permanent, with a reason), unban, delete.
- **Bans** — active account/IP bans with countdowns; manual IP bans; lift.

## API reference (public)

```
GET  /api/health                 backend probe + feature flags
GET  /api/all                    every song: stats + description/cover/audio
GET  /api/stats?song=key         one song's stats
POST /api/listen  {song}         +1 listen (ban-checked)
POST /api/like    {song,action}  like / unlike — one like per account, ban-checked
GET  /api/comments?song=key      approved comments (IPs never exposed)
POST /api/comments {song,text,author?}          post (8s cooldown, ban-checked)
POST /api/users/register {username,password}    create account
POST /api/users/login    {username,password}    sign in (banned → 403)
POST /api/users/logout                          kill session
GET  /api/me                     current account + liked songs + ban status
GET  /api/auth/config            is GitHub sign-in configured?
GET  /api/auth/github?origin=…   start GitHub OAuth (admin allow-list enforced)
POST /api/auth/github/exchange {code}  trade one-time code for an admin token
```

All admin endpoints require `Authorization: Bearer <token>` from
`/api/admin/login` or the GitHub flow.

## Local development

```bash
npm install
ADMIN_PASSWORD=dev123 node server.js     # http://localhost:3000
```

Leave `apiBase` empty in `config.js` — the site auto-detects a same-origin
backend. `data/` and `uploads/` are git-ignored.
