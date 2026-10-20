/* Admin panel — comment moderation + counter management.
 * Talks to the Node backend (same origin, or the URL from config.js).
 * If no backend is reachable, the panel explains what to set up. */

const loginView = document.getElementById("login-view");
const dashView = document.getElementById("dash-view");
const loginForm = document.getElementById("login-form");
const loginInput = document.getElementById("admin-password");
const loginError = document.getElementById("login-error");
const loginBtn = document.getElementById("login-btn");
const apiStatus = document.getElementById("api-status");
const adminState = document.getElementById("admin-state");

const refreshBtn = document.getElementById("refresh-btn");
const logoutBtn = document.getElementById("logout-btn");

const tabs = Array.from(document.querySelectorAll(".admin-tab"));
const tabComments = document.getElementById("tab-comments");
const tabSongs = document.getElementById("tab-songs");

const filterSong = document.getElementById("filter-song");
const filterStatus = document.getElementById("filter-status");
const commentsShown = document.getElementById("comments-shown");
const adminComments = document.getElementById("admin-comments");
const songsBody = document.getElementById("songs-body");
const tabCommentCount = document.getElementById("tab-comment-count");

const TOKEN_KEY = "tm-music-admin-token-v1";
let token = sessionStorage.getItem(TOKEN_KEY) || "";
let overview = null; // { songs, comments }
let songFilter = "";
let statusFilter = "";

/* ---------------- helpers ---------------- */

function showLogin(message) {
  token = "";
  sessionStorage.removeItem(TOKEN_KEY);
  adminState.hidden = true;
  dashView.hidden = true;
  loginView.hidden = false;
  if (message) {
    loginError.textContent = message;
    loginError.hidden = false;
  }
}

function showDash() {
  loginView.hidden = true;
  dashView.hidden = false;
  adminState.hidden = false;
  adminState.textContent = "signed in";
}

function fmtDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
    " · " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function fmtNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}

function displayName(songKey) {
  if (!overview) return songKey;
  const row = overview.songs.find((s) => s.song === songKey);
  return row ? row.display_name : songKey;
}

/* ---------------- data ---------------- */

async function loadOverview() {
  if (!token) return;
  refreshBtn.disabled = true;
  refreshBtn.textContent = "⟳ loading…";
  try {
    overview = await MusicAPI.adminOverview(token);
    renderAll();
  } catch (error) {
    if (error.status === 401) {
      showLogin("Session expired — sign in again.");
    } else {
      showLogin("Could not load data: " + error.message);
    }
  } finally {
    refreshBtn.disabled = false;
    refreshBtn.textContent = "⟳ Refresh";
  }
}

function renderAll() {
  if (!overview) return;

  // song filter options
  const selected = filterSong.value;
  filterSong.innerHTML = '<option value="">All tracks</option>' +
    overview.songs.map((s) =>
      `<option value="${s.song}">${s.display_name}</option>`
    ).join("");
  filterSong.value = selected;

  tabCommentCount.textContent = overview.comments.length ? String(overview.comments.length) : "";
  renderCommentsAdmin();
  renderSongsAdmin();
  commentsShown.textContent = `${visibleComments().length} of ${overview.comments.length} shown`;
}

function visibleComments() {
  return overview.comments.filter((c) => {
    if (songFilter && c.song_name !== songFilter) return false;
    if (statusFilter && c.status !== statusFilter) return false;
    return true;
  });
}

function renderCommentsAdmin() {
  const list = visibleComments();
  adminComments.innerHTML = "";

  if (!list.length) {
    const empty = document.createElement("li");
    empty.className = "comment-empty";
    empty.textContent = "No comments match the current filters.";
    adminComments.append(empty);
    return;
  }

  list.forEach((comment) => {
    const item = document.createElement("li");
    item.className = "comment-item admin-comment" + (comment.status === "hidden" ? " is-hidden" : "");

    const head = document.createElement("div");
    head.className = "admin-comment-head";

    const meta = document.createElement("div");
    meta.className = "comment-meta";
    meta.style.marginBottom = "0";

    const author = document.createElement("strong");
    author.textContent = comment.author || "Anonymous";

    const songChip = document.createElement("span");
    songChip.className = "song-chip";
    songChip.textContent = displayName(comment.song_name);

    const time = document.createElement("span");
    time.className = "comment-time";
    time.textContent = fmtDate(comment.created_at);

    meta.append(author, songChip, time);

    const status = document.createElement("span");
    status.className = "status-badge " + (comment.status === "approved" ? "approved" : "hidden");
    status.textContent = comment.status === "approved" ? "visible" : "hidden";

    head.append(meta, status);

    const text = document.createElement("p");
    text.className = "admin-comment-text";
    text.textContent = comment.text;

    const actions = document.createElement("div");
    actions.className = "admin-comment-actions";

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "admin-btn";
    toggleBtn.type = "button";
    toggleBtn.textContent = comment.status === "approved" ? "Hide" : "Show";
    toggleBtn.addEventListener("click", async () => {
      toggleBtn.disabled = true;
      try {
        await MusicAPI.adminSetCommentStatus(token, comment.id, comment.status === "approved" ? "hidden" : "approved");
        comment.status = comment.status === "approved" ? "hidden" : "approved";
        renderAll();
      } catch (error) {
        alert("Failed: " + error.message);
        toggleBtn.disabled = false;
      }
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "admin-btn danger";
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", async () => {
      if (!confirm("Delete this comment permanently?")) return;
      deleteBtn.disabled = true;
      try {
        await MusicAPI.adminDeleteComment(token, comment.id);
        overview.comments = overview.comments.filter((c) => c.id !== comment.id);
        renderAll();
      } catch (error) {
        alert("Failed: " + error.message);
        deleteBtn.disabled = false;
      }
    });

    actions.append(toggleBtn, deleteBtn);
    item.append(head, text, actions);
    adminComments.append(item);
  });
}

function renderSongsAdmin() {
  songsBody.innerHTML = "";

  overview.songs.forEach((song) => {
    const tr = document.createElement("tr");

    const tdName = document.createElement("td");
    tdName.textContent = song.display_name;

    const tdListens = document.createElement("td");
    tdListens.className = "mono";
    tdListens.textContent = fmtNumber(song.listens);

    const tdLikes = document.createElement("td");
    tdLikes.className = "mono";
    tdLikes.textContent = fmtNumber(song.likes);

    const tdComments = document.createElement("td");
    tdComments.className = "mono";
    tdComments.textContent = `${fmtNumber(song.comments_approved)} visible` +
      (song.comments_hidden ? ` · ${song.comments_hidden} hidden` : "");

    const tdAdjust = document.createElement("td");
    const wrap = document.createElement("div");
    wrap.className = "adjust-wrap";

    const listensInput = document.createElement("input");
    listensInput.type = "number";
    listensInput.min = "0";
    listensInput.value = song.listens;
    listensInput.className = "num-input mono";
    listensInput.setAttribute("aria-label", `Listens for ${song.display_name}`);

    const likesInput = document.createElement("input");
    likesInput.type = "number";
    likesInput.min = "0";
    likesInput.value = song.likes;
    likesInput.className = "num-input mono";
    likesInput.setAttribute("aria-label", `Likes for ${song.display_name}`);

    const saveBtn = document.createElement("button");
    saveBtn.className = "admin-btn";
    saveBtn.type = "button";
    saveBtn.textContent = "Save";
    saveBtn.addEventListener("click", async () => {
      saveBtn.disabled = true;
      saveBtn.textContent = "…";
      try {
        await MusicAPI.adminSetCounters(token, {
          song: song.song,
          listens: parseInt(listensInput.value, 10) || 0,
          likes: parseInt(likesInput.value, 10) || 0
        });
        saveBtn.textContent = "saved ✓";
        await loadOverview();
        setTimeout(() => { saveBtn.textContent = "Save"; saveBtn.disabled = false; }, 900);
      } catch (error) {
        alert("Failed: " + error.message);
        saveBtn.textContent = "Save";
        saveBtn.disabled = false;
      }
    });

    wrap.append(listensInput, likesInput, saveBtn);
    tdAdjust.append(wrap);

    tr.append(tdName, tdListens, tdLikes, tdComments, tdAdjust);
    songsBody.append(tr);
  });
}

/* ---------------- events ---------------- */

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.hidden = true;
  loginBtn.disabled = true;
  loginBtn.textContent = "Signing in…";

  try {
    const data = await MusicAPI.adminLogin(loginInput.value);
    token = data.token;
    sessionStorage.setItem(TOKEN_KEY, token);
    loginInput.value = "";
    showDash();
    await loadOverview();
  } catch (error) {
    loginError.textContent = error.message;
    loginError.hidden = false;
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Sign in";
  }
});

logoutBtn.addEventListener("click", async () => {
  try { if (token) await MusicAPI.adminLogout(token); } catch (_) {}
  showLogin();
});

refreshBtn.addEventListener("click", loadOverview);

filterSong.addEventListener("change", () => {
  songFilter = filterSong.value;
  renderCommentsAdmin();
  commentsShown.textContent = `${visibleComments().length} of ${overview.comments.length} shown`;
});

filterStatus.addEventListener("change", () => {
  statusFilter = filterStatus.value;
  renderCommentsAdmin();
  commentsShown.textContent = `${visibleComments().length} of ${overview.comments.length} shown`;
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    const target = tab.dataset.tab;
    tabComments.hidden = target !== "comments";
    tabSongs.hidden = target !== "songs";
  });
});

/* ---------------- boot ---------------- */

(async function boot() {
  await MusicAPI.detect();

  if (MusicAPI.mode !== "server") {
    apiStatus.innerHTML =
      "⚠ no backend reachable" +
      (MusicAPI.base ? ` at ${MusicAPI.base}` : "") +
      " — the admin panel needs the Node server running (node server.js), " +
      "or set <span class='mono'>apiBase</span> in config.js to the deployed backend URL.";
    loginBtn.disabled = true;
    return;
  }

  apiStatus.textContent = `backend: ${MusicAPI.base || "same origin"} — ready.`;

  if (token) {
    // Validate the stored token by loading data; on 401 we fall back to login.
    showDash();
    await loadOverview();
  }
})();
