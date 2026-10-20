/*
 * MusicAPI — single client the site uses to reach the SQLite backend.
 *
 * Modes:
 *   "server" — a backend answered /api/health (same origin, or the one
 *              configured in config.js). Data persists globally for all
 *              visitors.
 *   "local"  — no backend reachable (plain GitHub Pages without config).
 *              The page falls back to localStorage; script.js handles that.
 *
 * All server methods THROW when in local mode so callers can fall back.
 */
window.MusicAPI = (function () {
  const cfg = window.MUSIC_CONFIG || {};
  const configured = String(cfg.apiBase || "").trim().replace(/\/+$/, "");
  const sameOriginCandidate =
    location.protocol === "http:" || location.protocol === "https:" ? "" : null;

  let mode = "local";
  let base = "";
  let detected = false;
  let detecting = null;
  const listeners = [];

  function onChange(fn) {
    listeners.push(fn);
  }

  function emit() {
    listeners.forEach((fn) => {
      try { fn(mode, base); } catch (_) {}
    });
  }

  async function probe(candidate) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3500);
    try {
      const res = await fetch(candidate + "/api/health", { signal: ctrl.signal });
      if (!res.ok) return false;
      const data = await res.json();
      return Boolean(data && data.ok);
    } catch (_) {
      return false;
    } finally {
      clearTimeout(timer);
    }
  }

  async function detect() {
    if (detecting) return detecting;
    detecting = (async () => {
      if (configured && (await probe(configured))) {
        base = configured;
        mode = "server";
      } else if (sameOriginCandidate !== null && (await probe(sameOriginCandidate))) {
        base = sameOriginCandidate;
        mode = "server";
      } else {
        base = "";
        mode = "local";
      }
      detected = true;
      emit();
      return { mode, base };
    })();
    return detecting;
  }

  async function jfetch(path, options) {
    const res = await fetch(base + path, options);
    if (!res.ok) {
      let message = "HTTP " + res.status;
      try {
        const data = await res.json();
        if (data && data.error) message = data.error;
      } catch (_) {}
      const err = new Error(message);
      err.status = res.status;
      throw err;
    }
    return res.json();
  }

  function jsonOptions(method, body, token) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = "Bearer " + token;
    return { method, headers, body: JSON.stringify(body) };
  }

  function assertServer(what) {
    if (mode !== "server") throw new Error("no backend reachable — " + what + " unavailable");
  }

  /* ---------------- public API ---------------- */

  return {
    detect,
    onChange,
    get mode() { return mode; },
    get base() { return base; },
    get detected() { return detected; },

    stats(song) {
      assertServer("stats");
      return jfetch("/api/stats?song=" + encodeURIComponent(song));
    },

    all() {
      assertServer("all");
      return jfetch("/api/all");
    },

    listen(song) {
      assertServer("listen");
      return jfetch("/api/listen", jsonOptions("POST", { song }));
    },

    like(song, action) {
      assertServer("like");
      return jfetch("/api/like", jsonOptions("POST", { song, action: action ? "like" : "unlike" }));
    },

    comments(song, limit) {
      assertServer("comments");
      const q = song ? "?song=" + encodeURIComponent(song) : "";
      return jfetch("/api/comments" + q + (limit ? (q ? "&" : "?") + "limit=" + limit : ""));
    },

    addComment(payload) {
      assertServer("addComment");
      return jfetch("/api/comments", jsonOptions("POST", payload));
    },

    /* ---------------- admin ---------------- */

    adminLogin(password) {
      assertServer("admin");
      return jfetch("/api/admin/login", jsonOptions("POST", { password }));
    },

    adminLogout(token) {
      return jfetch("/api/admin/logout", jsonOptions("POST", {}, token));
    },

    adminOverview(token) {
      return jfetch("/api/admin/overview", { headers: { Authorization: "Bearer " + token } });
    },

    adminSetCommentStatus(token, id, status) {
      return jfetch("/api/admin/comments/" + encodeURIComponent(id), jsonOptions("PATCH", { status }, token));
    },

    adminDeleteComment(token, id) {
      return jfetch("/api/admin/comments/" + encodeURIComponent(id), { method: "DELETE", headers: { Authorization: "Bearer " + token } });
    },

    adminSetCounters(token, payload) {
      return jfetch("/api/admin/counters", jsonOptions("PATCH", payload, token));
    }
  };
})();
