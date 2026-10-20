# Thomas Miller — Music & Stems

Music portfolio site: in-browser player, downloadable stems, Ableton live sets,
**per-track listens / likes / comments**, and a **password-protected admin panel**
for comment moderation.

Live site: https://tomtom-cmd-alt.github.io/my-music/

---

## What's new

- **Per-song counters** — every track has its own listens, likes and comment
  count (the stats panel follows the selected track, and each row in the
  tracklist shows its own `▶ listens · ♥ likes`). The old single global total
  is gone.
- **Real admin panel** — open [`/admin.html`](./admin.html), sign in with the
  admin password, then:
  - moderate comments: **hide / show / delete** (filter by track and status)
  - see listens, likes and comment counts for every track
  - correct any counter value directly in the database
- **Database persistence** — comments now live in SQLite on the Node backend
  (they were browser-only before). The GitHub Pages site talks to the backend
  cross-origin; without a backend it falls back to per-device localStorage.

---

## How the pieces fit

```
GitHub Pages (static)                Node backend (server.js)
┌─────────────────────────┐  HTTPS   ┌──────────────────────────┐
│ index.html + script.js  │ ───────▶ │ /api/*  (Express)        │
│ admin.html + admin.js   │          │ SQLite: data/music.db    │
│ config.js → apiBase URL │          │ listens / likes/comments │
└─────────────────────────┘          └──────────────────────────┘
```

- **`config.js`** — the only file you edit to connect Pages to a backend:
  set `apiBase` to the backend URL.
- **`api.js`** — auto-detects a backend (same origin, then `apiBase`), and
  switches the site between **live database** and **saved on this device**
  modes (the little chip in the stats panel shows which one you're in).
- **`server.js`** — serves the site locally *and* the whole API. Uses the
  built-in `node:sqlite` on Node ≥ 22.5, falls back to the `sqlite3` npm
  package on older Node — `npm install` works even when native builds fail.

---

## Run it locally (full database)

```bash
npm install
ADMIN_PASSWORD=my-secret node server.js
```

- Site:  http://localhost:3000
- Admin: http://localhost:3000/admin.html

If `ADMIN_PASSWORD` is not set, the server generates one and prints it to the
console (also saved to `data/admin-password.txt`).

Environment variables:

| Variable         | Default              | Meaning                                        |
| ---------------- | -------------------- | ---------------------------------------------- |
| `PORT`           | `3000`               | HTTP port                                      |
| `ADMIN_PASSWORD` | random (printed)     | Password for the admin panel                   |
| `AUTO_APPROVE`   | `true`               | `false` = new comments start hidden until you approve them |
| `DB_PATH`        | `./data/music.db`    | SQLite database file                           |

---

## Put the database behind GitHub Pages

GitHub Pages can only host static files, so the database needs the Node
backend running somewhere public (free tier is plenty):

1. Push this repo to GitHub (done — it already contains `server.js`).
2. On [render.com](https://render.com) (or Railway / Fly.io / any Node host):
   - **New → Web Service**, connect this repo
   - Build command: `npm install`
   - Start command: `node server.js`
   - Environment: `ADMIN_PASSWORD = <your password>`
3. Copy the public URL, e.g. `https://my-music-api.onrender.com`
4. Edit **`config.js`** in this repo:

   ```js
   window.MUSIC_CONFIG = {
     apiBase: "https://my-music-api.onrender.com"
   };
   ```

5. Commit + push. The Pages site now shows **live database** and every
   visitor's listens, likes and comments persist in SQLite.

The admin panel works from GitHub Pages too — it talks to the same backend.

> CORS is already handled by the server (`Access-Control-Allow-Origin: *`).

---

## API reference

Public:

| Method | Endpoint              | Description                                    |
| ------ | --------------------- | ---------------------------------------------- |
| GET    | `/api/health`         | `{ ok: true, driver }` — used for auto-detect  |
| GET    | `/api/all`            | Per-song stats for every track                 |
| GET    | `/api/stats?song=`    | Stats for one track                            |
| POST   | `/api/listen`         | `{ song }` — +1 listen                         |
| POST   | `/api/like`           | `{ song, action: "like" \| "unlike" }`         |
| GET    | `/api/comments?song=` | Approved comments for a track (newest first)   |
| POST   | `/api/comments`       | `{ song, author?, text }` — rate-limited 1/8s  |

Admin (Bearer token from `/api/admin/login`):

| Method | Endpoint                     | Description                        |
| ------ | ---------------------------- | ---------------------------------- |
| POST   | `/api/admin/login`           | `{ password }` → `{ token }` (12h) |
| GET    | `/api/admin/overview`        | All songs + all comments           |
| PATCH  | `/api/admin/comments/:id`    | `{ status: "approved"\|"hidden" }` |
| DELETE | `/api/admin/comments/:id`    | Delete a comment                   |
| PATCH  | `/api/admin/counters`        | `{ song, listens?, likes? }` — set values |
| POST   | `/api/admin/logout`          | Invalidate the token               |

Data lives in `data/music.db`. Delete that file to reset everything.

---

## Site files

| File          | Purpose                                          |
| ------------- | ------------------------------------------------ |
| `index.html`  | Music page                                       |
| `script.js`   | Player, per-track stats, comments, stems zip     |
| `config.js`   | Backend URL for GitHub Pages                     |
| `api.js`      | API client + server auto-detection               |
| `admin.html`  | Admin panel (login, moderation, counters)        |
| `admin.js`    | Admin panel logic                                |
| `server.js`   | Express API + SQLite + static hosting            |
| `schema.sql`  | Database schema (applied automatically)          |
| `styles.css`  | Shared styling (site + admin)                    |
| `audio/`      | MP3s                                             |
