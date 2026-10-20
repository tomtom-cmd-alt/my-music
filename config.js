/*
 * Site configuration — GitHub Pages <-> database backend
 * =====================================================
 *
 * GitHub Pages only hosts static files, so the listens / likes / comments
 * database lives in this little Node server (server.js in this repo).
 *
 *   1. Deploy server.js anywhere (Render / Railway / Fly.io / your PC / VPS).
 *   2. Paste the public URL below. Example:
 *        apiBase: "https://my-music-api.onrender.com"
 *   3. Commit + push. The GitHub Pages site now persists everything
 *      globally in SQLite for every visitor.
 *
 * Leave apiBase as "" while testing locally with `node server.js` —
 * the site auto-detects the backend on the same origin.
 *
 * No backend reachable? The site still works: counters and comments are
 * then stored per-device in localStorage until the backend is configured.
 */
window.MUSIC_CONFIG = {
  // Public base URL of the Node backend, e.g. "https://my-music-api.onrender.com"
  apiBase: ""
};
