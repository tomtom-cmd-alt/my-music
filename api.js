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

  // Resolve a media URL that may be relative to the backend origin.
  function mediaUrl(url) {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    return base + url;
  }

  async function jfetch(path, options) {
    const res = await fetch(base + path, options);
    if (!res.ok) {
      let message = "HTTP " + res.status;
      let extra = null;
      try {
        const data = await res.json();
        if (data && data.error) message = data.error;
        if (data && data.banned) extra = data;
      } catch (_) {}
      const err = new Error(message);
      err.status = res.status;
      err.banned = extra ? extra.banned : false;
      err.banInfo = extra || null;
      throw err;
    }
    return res.json();
  }

  function jsonOptions(method, body, token) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = "Bearer " + token;
    return { method, headers, body: JSON.stringify(body) };
  }

  function authedOptions(method, token, body) {
    const options = { method, headers: { Authorization: "Bearer " + token } };
    if (body !== undefined) {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }
    return options;
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
    mediaUrl,

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

    like(song, action, token) {
      assertServer("like");
      return jfetch("/api/like", jsonOptions("POST", { song, action: action ? "like" : "unlike" }, token));
    },

    comments(song, limit) {
      assertServer("comments");
      const q = song ? "?song=" + encodeURIComponent(song) : "";
      return jfetch("/api/comments" + q + (limit ? (q ? "&" : "?") + "limit=" + limit : ""));
    },

    addComment(payload, token) {
      assertServer("addComment");
      return jfetch("/api/comments", jsonOptions("POST", payload, token));
    },

    /* ---------------- accounts ---------------- */

    register(username, password) {
      assertServer("register");
      return jfetch("/api/users/register", jsonOptions("POST", { username, password }));
    },

    login(username, password) {
      assertServer("login");
      return jfetch("/api/users/login", jsonOptions("POST", { username, password }));
    },

    logout(token) {
      return jfetch("/api/users/logout", jsonOptions("POST", {}, token));
    },

    me(token) {
      assertServer("me");
      return jfetch("/api/me", { headers: { Authorization: "Bearer " + token } });
    },

    /* ---------------- profiles ---------------- */

    getUser(username, token) {
      assertServer("profiles");
      const headers = {};
      if (token) headers.Authorization = "Bearer " + token;
      return jfetch("/api/users/" + encodeURIComponent(username), { headers });
    },

    updateProfile(token, payload) {
      assertServer("profile edit");
      return jfetch("/api/profile", jsonOptions("PATCH", payload, token));
    },

    uploadProfileImage(token, kind, file) {
      assertServer("profile image");
      const form = new FormData();
      form.append(kind === "bg" ? "bg" : "avatar", file, file.name);
      return jfetch("/api/profile/" + (kind === "bg" ? "bg" : "avatar"), {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: form
      });
    },

    clearProfileImage(token, kind) {
      assertServer("profile image");
      return jfetch("/api/profile/" + (kind === "bg" ? "bg" : "avatar"), {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token }
      });
    },

    /* ---------------- friends ---------------- */

    friends(token) {
      assertServer("friends");
      return jfetch("/api/friends", { headers: { Authorization: "Bearer " + token } });
    },

    friendRequest(token, username) {
      assertServer("friends");
      return jfetch("/api/friends/request", jsonOptions("POST", { username }, token));
    },

    friendAccept(token, id) {
      assertServer("friends");
      return jfetch("/api/friends/accept", jsonOptions("POST", { id }, token));
    },

    friendDecline(token, id) {
      assertServer("friends");
      return jfetch("/api/friends/decline", jsonOptions("POST", { id }, token));
    },

    friendRemove(token, username) {
      assertServer("friends");
      return jfetch("/api/friends/" + encodeURIComponent(username), {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token }
      });
    },

    /* ---------------- direct messages ---------------- */

    unreadCount(token) {
      assertServer("messages");
      return jfetch("/api/messages/unread", { headers: { Authorization: "Bearer " + token } });
    },

    conversations(token) {
      assertServer("messages");
      return jfetch("/api/messages/conversations", { headers: { Authorization: "Bearer " + token } });
    },

    threadWith(token, username) {
      assertServer("messages");
      return jfetch("/api/messages/with/" + encodeURIComponent(username), {
        headers: { Authorization: "Bearer " + token }
      });
    },

    sendMessage(token, to, text) {
      assertServer("messages");
      return jfetch("/api/messages", jsonOptions("POST", { to, text }, token));
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
    },

    adminAuthConfig() {
      assertServer("auth config");
      return jfetch("/api/auth/config");
    },

    // GitHub sign-in: full-page redirect to the backend, which redirects to GitHub.
    githubSignIn() {
      assertServer("github sign-in");
      window.location.href = base + "/api/auth/github?origin=" + encodeURIComponent(location.origin);
    },

    githubExchange(code) {
      assertServer("github exchange");
      return jfetch("/api/auth/github/exchange", jsonOptions("POST", { code }));
    },

    // Site-wide GitHub sign-in: full-page redirect; the server sends the
    // user back to the current page with a one-time ?gh= code.
    githubUserSignIn() {
      assertServer("github sign-in");
      const page = (location.pathname.split("/").pop() || "index.html");
      window.location.href = base + "/api/auth/github?origin=" + encodeURIComponent(location.origin) + "&path=" + encodeURIComponent(page);
    },

    githubUserExchange(code) {
      assertServer("github user exchange");
      return jfetch("/api/auth/github/user-exchange", jsonOptions("POST", { code }));
    },

    adminAddSong(token, formData) {
      return jfetch("/api/admin/songs", { method: "POST", headers: { Authorization: "Bearer " + token }, body: formData });
    },

    adminEditSong(token, songKey, formDataOrPayload) {
      if (formDataOrPayload instanceof FormData) {
        return jfetch("/api/admin/songs/" + encodeURIComponent(songKey), {
          method: "PATCH",
          headers: { Authorization: "Bearer " + token },
          body: formDataOrPayload
        });
      }
      return jfetch("/api/admin/songs/" + encodeURIComponent(songKey), jsonOptions("PATCH", formDataOrPayload, token));
    },

    adminDeleteSong(token, songKey) {
      return jfetch("/api/admin/songs/" + encodeURIComponent(songKey), { method: "DELETE", headers: { Authorization: "Bearer " + token } });
    },

    adminBanUser(token, userId, hours, reason) {
      return jfetch("/api/admin/users/" + encodeURIComponent(userId) + "/ban", jsonOptions("POST", { hours, reason }, token));
    },

    adminUnbanUser(token, userId) {
      return jfetch("/api/admin/users/" + encodeURIComponent(userId) + "/unban", jsonOptions("POST", {}, token));
    },

    adminDeleteUser(token, userId) {
      return jfetch("/api/admin/users/" + encodeURIComponent(userId), { method: "DELETE", headers: { Authorization: "Bearer " + token } });
    },

    adminAddBan(token, kind, value, hours, reason) {
      return jfetch("/api/admin/bans", jsonOptions("POST", { kind, value, hours, reason }, token));
    },

    adminLiftBan(token, banId) {
      return jfetch("/api/admin/bans/" + encodeURIComponent(banId), { method: "DELETE", headers: { Authorization: "Bearer " + token } });
    },

    adminDeleteMessage(token, id) {
      return jfetch("/api/admin/messages/" + encodeURIComponent(id), { method: "DELETE", headers: { Authorization: "Bearer " + token } });
    },

    /* ---------------- maintenance + persistence ---------------- */

    maintenanceGet() {
      return jfetch("/api/maintenance", { cache: "no-store" });
    },

    maintenanceSet(token, payload) {
      return jfetch("/api/admin/maintenance", jsonOptions("POST", payload, token));
    },

    persistenceStatus(token) {
      return jfetch("/api/admin/persistence", { headers: { Authorization: "Bearer " + token } });
    },

    persistenceBackupNow(token) {
      return jfetch("/api/admin/persistence/backup", jsonOptions("POST", {}, token));
    },

    zaiConfig() {
      return jfetch("/api/zai/config");
    },

    zaiHistory(token, key) {
      return jfetch("/api/zai/history", {
        headers: { Authorization: "Bearer " + token, "X-ZAI-Key": key }
      });
    },

    zaiSend(token, key, text) {
      return jfetch("/api/zai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
          "X-ZAI-Key": key
        },
        body: JSON.stringify({ text })
      });
    },

    zaiClear(token, key) {
      return jfetch("/api/zai/clear", {
        method: "POST",
        headers: { Authorization: "Bearer " + token, "X-ZAI-Key": key }
      });
    }
  };
})();
