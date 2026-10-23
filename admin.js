/* Admin panel v3 — GitHub-OAuth + password login, comment moderation,
 * song library (add/edit/delete with uploads), user management and
 * global bans. Talks to the Node backend (same origin or config.js apiBase). */

const loginView = document.getElementById("login-view");
const dashView = document.getElementById("dash-view");
const loginForm = document.getElementById("login-form");
const loginInput = document.getElementById("admin-password");
const loginError = document.getElementById("login-error");
const loginBtn = document.getElementById("login-btn");
const apiStatus = document.getElementById("api-status");
const adminState = document.getElementById("admin-state");

const githubBtn = document.getElementById("github-btn");
const ghHint = document.getElementById("gh-hint");
const pwDivider = document.getElementById("pw-divider");

const refreshBtn = document.getElementById("refresh-btn");
const logoutBtn = document.getElementById("logout-btn");
const statCards = document.getElementById("stat-cards");

const tabs = Array.from(document.querySelectorAll(".admin-tab"));
const tabComments = document.getElementById("tab-comments");
const tabSongs = document.getElementById("tab-songs");
const tabUsers = document.getElementById("tab-users");
const tabMessages = document.getElementById("tab-messages");
const tabBans = document.getElementById("tab-bans");
const tabSite = document.getElementById("tab-site");
const maintenanceForm = document.getElementById("maintenance-form");
const maintenanceEnabled = document.getElementById("maintenance-enabled");
const maintenanceMessage = document.getElementById("maintenance-message");
const maintenanceEta = document.getElementById("maintenance-eta");
const maintenanceStatus = document.getElementById("maintenance-status");
const maintenanceSave = document.getElementById("maintenance-save");
const persistenceBox = document.getElementById("persistence-box");

/* --- Message Z.ai --- */
const tabZai = document.getElementById("tab-zai");
const zaiGate = document.getElementById("zai-gate");
const zaiChat = document.getElementById("zai-chat");
const zaiKeyInput = document.getElementById("zai-key-input");
const zaiUnlockBtn = document.getElementById("zai-unlock");
const zaiGateStatus = document.getElementById("zai-gate-status");
const zaiMode = document.getElementById("zai-mode");
const zaiLog = document.getElementById("zai-log");
const zaiForm = document.getElementById("zai-form");
const zaiText = document.getElementById("zai-text");
const zaiSendBtn = document.getElementById("zai-send");
const zaiClearBtn = document.getElementById("zai-clear");
const zaiRelockBtn = document.getElementById("zai-relock");
const tabZaiCount = document.getElementById("tab-zai-count");

const filterSong = document.getElementById("filter-song");
const filterStatus = document.getElementById("filter-status");
const commentsShown = document.getElementById("comments-shown");
const adminComments = document.getElementById("admin-comments");
const tabCommentCount = document.getElementById("tab-comment-count");
const tabUserCount = document.getElementById("tab-user-count");
const tabBanCount = document.getElementById("tab-ban-count");

const songsGrid = document.getElementById("songs-grid");
const addSongForm = document.getElementById("add-song-form");
const newSongTitle = document.getElementById("new-song-title");
const newSongDescription = document.getElementById("new-song-description");
const newSongAudio = document.getElementById("new-song-audio");
const newSongCover = document.getElementById("new-song-cover");
const addSongBtn = document.getElementById("add-song-btn");
const addSongStatus = document.getElementById("add-song-status");

const usersBody = document.getElementById("users-body");
const bansBody = document.getElementById("bans-body");
const adminMessages = document.getElementById("admin-messages");
const tabDmCount = document.getElementById("tab-dm-count");
const addBanForm = document.getElementById("add-ban-form");
const banValue = document.getElementById("ban-value");
const banHours = document.getElementById("ban-hours");
const banReason = document.getElementById("ban-reason");

const TOKEN_KEY = "tm-music-admin-token-v1";
let token = sessionStorage.getItem(TOKEN_KEY) || "";
let overview = null;
let songFilter = "";
let statusFilter = "";

/* ---------------- helpers ---------------- */

function showToast(message, type = "info", ms = 4200) {
  const root = document.getElementById("toast-root");
  if (!root) return;
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.textContent = message;
  root.append(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 350);
  }, ms);
}

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

function showDash(via) {
  loginView.hidden = true;
  dashView.hidden = false;
  adminState.hidden = false;
  adminState.textContent = via === "github" ? "signed in · github" : "signed in";
}

function fmtDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
    " · " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function fmtExpiry(ms) {
  if (!ms) return "permanent";
  const d = new Date(Number(ms));
  const days = (Number(ms) - Date.now()) / 86400000;
  const left = days >= 1 ? `${Math.floor(days)}d left` : `${Math.max(1, Math.floor((Number(ms) - Date.now()) / 3600000))}h left`;
  return `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · ${left}`;
}

function fmtNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}

function displayName(songKey) {
  if (!overview) return songKey;
  const row = overview.songs.find((s) => s.song === songKey);
  return row ? row.display_name : songKey;
}

function initialsFor(name) {
  return (String(name || "?").trim()[0] || "?").toUpperCase();
}

function hueFor(str) {
  let h = 0;
  for (let i = 0; i < String(str).length; i++) h = (h * 31 + String(str).charCodeAt(i)) % 360;
  return h;
}

function avatarFor(name, avatarUrl) {
  const span = document.createElement("span");
  span.className = "avatar avatar-small";
  if (avatarUrl) {
    const img = document.createElement("img");
    img.src = MusicAPI.mediaUrl(avatarUrl);
    img.alt = "";
    img.onerror = () => {
      img.remove();
      span.textContent = initialsFor(name);
      span.style.background = `linear-gradient(135deg, hsl(${hueFor(name)} 70% 45%), hsl(${(hueFor(name) + 60) % 360} 70% 55%))`;
    };
    span.append(img);
  } else {
    span.textContent = initialsFor(name);
    span.style.background = `linear-gradient(135deg, hsl(${hueFor(name)} 70% 45%), hsl(${(hueFor(name) + 60) % 360} 70% 55%))`;
  }
  return span;
}

function askBanParams() {
  const hoursRaw = window.prompt("Ban for how many hours? (leave empty or 0 for permanent)", "24");
  if (hoursRaw === null) return null;
  const reason = window.prompt("Reason (shown to the banned user):", "rule violation");
  if (reason === null) return null;
  const hours = String(hoursRaw).trim() === "" || Number(hoursRaw) === 0 ? null : Number(hoursRaw);
  return { hours, reason: reason || "no reason given" };
}

/* ---------------- GitHub OAuth ---------------- */

function handleGithubParams() {
  const params = new URLSearchParams(location.search);
  const code = params.get("gh");
  const ghError = params.get("gh_error");

  if (ghError) {
    history.replaceState(null, "", location.pathname);
    showLogin("GitHub sign-in failed: " + ghError);
    return true;
  }

  if (code) {
    history.replaceState(null, "", location.pathname);
    MusicAPI.githubExchange(code)
      .then((data) => {
        token = data.token;
        sessionStorage.setItem(TOKEN_KEY, token);
        showDash("github");
        showToast("Signed in with GitHub 🎉", "success");
        loadOverview();
      })
      .catch((error) => showLogin("GitHub sign-in failed: " + error.message));
    return true;
  }
  return false;
}

async function loadAuthConfig() {
  try {
    const config = await MusicAPI.adminAuthConfig();
    if (config.github_enabled) {
      githubBtn.hidden = false;
      githubBtn.disabled = false;
      ghHint.hidden = false;
      ghHint.textContent = "admins: " + (config.allowed_admins || []).join(", ");
    } else {
      githubBtn.hidden = true;
      ghHint.hidden = false;
      ghHint.textContent = "github sign-in not configured — set GITHUB_CLIENT_ID + GITHUB_CLIENT_SECRET on the server";
    }
    if (config.password_login === false) {
      loginForm.hidden = true;
      pwDivider.hidden = true;
    }
  } catch (_) {
    githubBtn.hidden = true;
  }
}

githubBtn.addEventListener("click", () => {
  try {
    MusicAPI.githubSignIn();
  } catch (error) {
    showToast(error.message, "error");
  }
});

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

  const selected = filterSong.value;
  filterSong.innerHTML = '<option value="">All tracks</option>' +
    overview.songs.map((s) => `<option value="${s.song}">${s.display_name}</option>`).join("");
  filterSong.value = selected;

  renderStats();
  renderCommentsAdmin();
  renderSongsAdmin();
  renderUsersAdmin();
  renderMessagesAdmin();
  renderBansAdmin();

  tabCommentCount.textContent = overview.comments.length ? String(overview.comments.length) : "";
  tabUserCount.textContent = overview.users.length ? String(overview.users.length) : "";
  tabBanCount.textContent = overview.bans.length ? String(overview.bans.length) : "";
  tabDmCount.textContent = (overview.messages || []).length ? String((overview.messages || []).length) : "";
  commentsShown.textContent = `${visibleComments().length} of ${overview.comments.length} shown`;
}

function renderStats() {
  const t = overview.totals || {};
  const cards = [
    { value: fmtNumber(t.listens), label: "total listens" },
    { value: fmtNumber(t.likes), label: "total likes" },
    { value: fmtNumber(t.comments), label: "visible comments" },
    { value: fmtNumber(t.users), label: "accounts" },
    { value: fmtNumber(t.dms || 0), label: "direct messages" },
    { value: fmtNumber(t.bans), label: "active bans" },
    { value: fmtNumber(overview.songs.length), label: "tracks" }
  ];
  statCards.innerHTML = "";
  cards.forEach((c) => {
    const div = document.createElement("div");
    div.className = "stat-card";
    const v = document.createElement("div");
    v.className = "stat-value";
    v.textContent = c.value;
    const l = document.createElement("div");
    l.className = "stat-label";
    l.textContent = c.label;
    div.append(v, l);
    statCards.append(div);
  });
}

function visibleComments() {
  return (overview.comments || []).filter((c) => {
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
    meta.className = "comment-who";

    meta.append(avatarFor(comment.author));

    const author = document.createElement("strong");
    author.textContent = comment.author || "Anonymous";
    meta.append(author);

    const songChip = document.createElement("span");
    songChip.className = "song-chip";
    songChip.textContent = displayName(comment.song_name);
    meta.append(songChip);

    if (comment.user_id) {
      const chip = document.createElement("span");
      chip.className = "acct-badge";
      chip.textContent = "account";
      meta.append(chip);
    }

    if (comment.ip) {
      const ip = document.createElement("span");
      ip.className = "ip-chip";
      ip.textContent = comment.ip;
      ip.title = "IP captured for moderation";
      meta.append(ip);
    }

    const time = document.createElement("span");
    time.className = "comment-time";
    time.textContent = fmtDate(comment.created_at);
    meta.append(time);

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
        showToast("Failed: " + error.message, "error");
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
        showToast("Failed: " + error.message, "error");
        deleteBtn.disabled = false;
      }
    });

    actions.append(toggleBtn, deleteBtn);

    if (comment.user_id) {
      const banUserBtn = document.createElement("button");
      banUserBtn.className = "admin-btn danger";
      banUserBtn.type = "button";
      banUserBtn.textContent = "Ban account";
      banUserBtn.title = "Timeout / permanently ban this account";
      banUserBtn.addEventListener("click", async () => {
        const params = askBanParams();
        if (!params) return;
        banUserBtn.disabled = true;
        try {
          await MusicAPI.adminBanUser(token, comment.user_id, params.hours, params.reason);
          showToast("Account banned.", "success");
          loadOverview();
        } catch (error) {
          showToast("Failed: " + error.message, "error");
          banUserBtn.disabled = false;
        }
      });
      actions.append(banUserBtn);
    }

    if (comment.ip) {
      const banIpBtn = document.createElement("button");
      banIpBtn.className = "admin-btn danger";
      banIpBtn.type = "button";
      banIpBtn.textContent = "Ban IP";
      banIpBtn.title = "Timeout / permanently ban this IP address";
      banIpBtn.addEventListener("click", async () => {
        const params = askBanParams();
        if (!params) return;
        banIpBtn.disabled = true;
        try {
          await MusicAPI.adminAddBan(token, "ip", comment.ip, params.hours, params.reason);
          showToast("IP banned.", "success");
          loadOverview();
        } catch (error) {
          showToast("Failed: " + error.message, "error");
          banIpBtn.disabled = false;
        }
      });
      actions.append(banIpBtn);
    }

    item.append(head, text, actions);
    adminComments.append(item);
  });
}

/* ---------------- songs tab ---------------- */

function renderSongsAdmin() {
  songsGrid.innerHTML = "";

  (overview.songs || []).forEach((song) => {
    const card = document.createElement("div");
    card.className = "song-card";

    const head = document.createElement("div");
    head.className = "song-card-head";

    const cover = document.createElement("img");
    cover.className = "song-card-cover";
    cover.alt = "";
    if (song.cover_url) {
      cover.src = MusicAPI.mediaUrl(song.cover_url);
      cover.onerror = () => { cover.style.visibility = "hidden"; };
    } else {
      cover.style.visibility = "hidden";
    }
    head.append(cover);

    const titleWrap = document.createElement("div");
    titleWrap.className = "song-card-title";

    const title = document.createElement("strong");
    title.textContent = song.display_name;
    titleWrap.append(title);

    const meta = document.createElement("div");
    meta.className = "song-card-meta";
    meta.append(
      Object.assign(document.createElement("span"), { textContent: `▶ ${fmtNumber(song.listens)}` }),
      Object.assign(document.createElement("span"), { textContent: `♥ ${fmtNumber(song.likes)}` }),
      Object.assign(document.createElement("span"), { textContent: `💬 ${fmtNumber(song.comments_approved)}` })
    );

    const src = document.createElement("span");
    src.className = "source-badge " + (song.source === "admin" ? "admin" : "static");
    src.textContent = song.source === "admin" ? "added" : "bundled";
    meta.append(src);
    titleWrap.append(meta);
    head.append(titleWrap);
    card.append(head);

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = song.display_name;
    nameInput.maxLength = 80;
    nameInput.setAttribute("aria-label", `Display name for ${song.display_name}`);
    nameInput.style.cssText = "width:100%;border:1px solid var(--border);border-radius:10px;background:rgba(7,11,24,.7);color:var(--text);padding:.55rem .65rem;font-size:.9rem";
    card.append(nameInput);

    const desc = document.createElement("textarea");
    desc.value = song.description || "";
    desc.placeholder = "Description shown on the player (like SoundCloud)…";
    desc.setAttribute("aria-label", `Description for ${song.display_name}`);
    card.append(desc);

    const fileRow = document.createElement("div");
    fileRow.className = "song-file-row";

    const coverLabel = document.createElement("label");
    coverLabel.className = "file-label";
    coverLabel.textContent = song.cover_url ? "🖼️ Replace cover" : "🖼️ Add cover";
    const coverInput = document.createElement("input");
    coverInput.type = "file";
    coverInput.accept = "image/*";
    coverInput.addEventListener("change", () => {
      coverLabel.textContent = coverInput.files.length ? "🖼️ " + coverInput.files[0].name : "🖼️ Cover";
      coverLabel.append(coverInput);
    });
    coverLabel.append(coverInput);
    fileRow.append(coverLabel);

    const audioLabel = document.createElement("label");
    audioLabel.className = "file-label";
    audioLabel.textContent = song.audio_url ? "🎵 Replace audio" : "🎵 Add audio";
    const audioInput = document.createElement("input");
    audioInput.type = "file";
    audioInput.accept = "audio/*,.mp3,.wav,.ogg,.m4a";
    audioInput.addEventListener("change", () => {
      audioLabel.textContent = audioInput.files.length ? "🎵 " + audioInput.files[0].name : "🎵 Audio";
      audioLabel.append(audioInput);
    });
    audioLabel.append(audioInput);
    fileRow.append(audioLabel);

    const mediaState = document.createElement("span");
    mediaState.className = "mono-small";
    mediaState.textContent = song.audio_url ? "audio ✓" : "no audio file";
    fileRow.append(mediaState);
    card.append(fileRow);

    const actions = document.createElement("div");
    actions.className = "song-card-actions";

    const saveBtn = document.createElement("button");
    saveBtn.className = "admin-btn";
    saveBtn.type = "button";
    saveBtn.textContent = "Save";
    saveBtn.addEventListener("click", async () => {
      saveBtn.disabled = true;
      saveBtn.textContent = "…";
      try {
        const fd = new FormData();
        fd.append("display_name", nameInput.value.trim() || song.display_name);
        fd.append("description", desc.value);
        if (coverInput.files.length) fd.append("cover", coverInput.files[0]);
        if (audioInput.files.length) fd.append("audio", audioInput.files[0]);
        await MusicAPI.adminEditSong(token, song.song, fd);
        showToast(`Saved "${song.display_name}"`, "success");
        loadOverview();
        saveBtn.textContent = "Save";
        saveBtn.disabled = false;
      } catch (error) {
        showToast("Failed: " + error.message, "error");
        saveBtn.textContent = "Save";
        saveBtn.disabled = false;
      }
    });
    actions.append(saveBtn);

    if (song.source === "admin") {
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "admin-btn danger";
      deleteBtn.type = "button";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", async () => {
        if (!confirm(`Delete "${song.display_name}" and all its stats/comments?`)) return;
        deleteBtn.disabled = true;
        try {
          await MusicAPI.adminDeleteSong(token, song.song);
          showToast("Song deleted.", "success");
          loadOverview();
        } catch (error) {
          showToast("Failed: " + error.message, "error");
          deleteBtn.disabled = false;
        }
      });
      actions.append(deleteBtn);
    }

    card.append(actions);
    songsGrid.append(card);
  });
}

addSongForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  addSongStatus.textContent = "";
  const title = newSongTitle.value.trim();
  if (!title) return;

  addSongBtn.disabled = true;
  addSongBtn.textContent = "uploading…";
  try {
    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", newSongDescription.value);
    if (newSongAudio.files.length) fd.append("audio", newSongAudio.files[0]);
    if (newSongCover.files.length) fd.append("cover", newSongCover.files[0]);
    await MusicAPI.adminAddSong(token, fd);
    showToast(`Added "${title}" — it now appears on the site.`, "success");
    newSongTitle.value = "";
    newSongDescription.value = "";
    newSongAudio.value = "";
    newSongCover.value = "";
    loadOverview();
  } catch (error) {
    addSongStatus.textContent = error.message;
    showToast("Failed: " + error.message, "error");
  } finally {
    addSongBtn.disabled = false;
    addSongBtn.textContent = "Add song";
  }
});

/* ---------------- users tab ---------------- */

function renderUsersAdmin() {
  usersBody.innerHTML = "";

  if (!overview.users.length) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 4;
    td.className = "empty-note";
    td.textContent = "No accounts yet — visitors can create one from the Sign in button on the site.";
    tr.append(td);
    usersBody.append(tr);
    return;
  }

  overview.users.forEach((user) => {
    const tr = document.createElement("tr");

    const tdName = document.createElement("td");
    const row = document.createElement("div");
    row.className = "user-row";
    row.append(avatarFor(user.username, user.avatar_url));
    const nameWrap = document.createElement("span");
    nameWrap.textContent = user.username;
    row.append(nameWrap);
    if (user.is_admin) {
      const chip = document.createElement("span");
      chip.className = "acct-badge";
      chip.textContent = "admin";
      row.append(chip);
    }
    if (user.banned) {
      const chip = document.createElement("span");
      chip.className = "user-banned-chip";
      chip.textContent = "banned";
      chip.title = (user.banned.until ? "until " + new Date(user.banned.until).toLocaleString() : "permanent") + " — " + (user.banned.reason || "");
      row.append(chip);
    }
    tdName.append(row);
    tr.append(tdName);

    const tdJoined = document.createElement("td");
    tdJoined.className = "mono-small";
    tdJoined.textContent = fmtDate(user.created_at);
    tr.append(tdJoined);

    const tdActivity = document.createElement("td");
    tdActivity.className = "mono-small";
    tdActivity.textContent = `💬 ${fmtNumber(user.comments_posted)} · ♥ ${fmtNumber(user.likes_given)} · 👥 ${fmtNumber(user.friend_count)} · ✉ ${fmtNumber(user.dms_sent)}`;
    tr.append(tdActivity);

    const tdProfile = document.createElement("td");
    tdProfile.className = "mono-small";
    const visChip = document.createElement("span");
    visChip.className = "ban-kind-chip " + (user.profile_visibility === "public" ? "ip" : "user");
    visChip.textContent = user.profile_visibility === "public" ? "all visible" : "private";
    const dmChip = document.createElement("span");
    dmChip.className = "ban-kind-chip user";
    dmChip.textContent = "dm: " + (user.dm_policy || "anyone");
    tdProfile.append(visChip, document.createTextNode(" "), dmChip);
    tr.append(tdProfile);

    const tdBan = document.createElement("td");
    const controls = document.createElement("div");
    controls.className = "ban-controls";

    const hoursInput = document.createElement("input");
    hoursInput.type = "number";
    hoursInput.min = "0";
    hoursInput.step = "0.5";
    hoursInput.placeholder = "hours";
    hoursInput.title = "Empty or 0 = permanent";
    hoursInput.setAttribute("aria-label", `Ban hours for ${user.username}`);

    const reasonInput = document.createElement("input");
    reasonInput.type = "text";
    reasonInput.placeholder = "reason";
    reasonInput.setAttribute("aria-label", `Ban reason for ${user.username}`);

    const banBtn = document.createElement("button");
    banBtn.className = "admin-btn danger";
    banBtn.type = "button";
    banBtn.textContent = user.banned ? "Re-ban" : "Ban";
    banBtn.addEventListener("click", async () => {
      const hours = hoursInput.value.trim() === "" || Number(hoursInput.value) === 0 ? null : Number(hoursInput.value);
      const reason = reasonInput.value.trim() || "no reason given";
      banBtn.disabled = true;
      try {
        await MusicAPI.adminBanUser(token, user.id, hours, reason);
        showToast(`${user.username} banned${hours ? ` for ${hours}h` : " permanently"}.`, "success");
        loadOverview();
      } catch (error) {
        showToast("Failed: " + error.message, "error");
        banBtn.disabled = false;
      }
    });

    controls.append(hoursInput, reasonInput, banBtn);

    if (user.banned) {
      const unbanBtn = document.createElement("button");
      unbanBtn.className = "admin-btn";
      unbanBtn.type = "button";
      unbanBtn.textContent = "Unban";
      unbanBtn.addEventListener("click", async () => {
        unbanBtn.disabled = true;
        try {
          await MusicAPI.adminUnbanUser(token, user.id);
          showToast(`${user.username} unbanned.`, "success");
          loadOverview();
        } catch (error) {
          showToast("Failed: " + error.message, "error");
          unbanBtn.disabled = false;
        }
      });
      controls.append(unbanBtn);
    }

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "admin-btn danger";
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete";
    deleteBtn.title = "Delete this account (comments stay, flagged as anonymous)";
    deleteBtn.addEventListener("click", async () => {
      if (!confirm(`Delete account "${user.username}"?`)) return;
      deleteBtn.disabled = true;
      try {
        await MusicAPI.adminDeleteUser(token, user.id);
        showToast("Account deleted.", "success");
        loadOverview();
      } catch (error) {
        showToast("Failed: " + error.message, "error");
        deleteBtn.disabled = false;
      }
    });
    controls.append(deleteBtn);

    tdBan.append(controls);
    tr.append(tdBan);
    usersBody.append(tr);
  });
}

/* ---------------- messages tab (DM moderation) ---------------- */

function renderMessagesAdmin() {
  adminMessages.innerHTML = "";
  const list = overview.messages || [];

  if (!list.length) {
    const empty = document.createElement("li");
    empty.className = "comment-empty";
    empty.textContent = "No direct messages have been sent yet.";
    adminMessages.append(empty);
    return;
  }

  list.forEach((msg) => {
    const item = document.createElement("li");
    item.className = "comment-item admin-comment";

    const head = document.createElement("div");
    head.className = "admin-comment-head";

    const meta = document.createElement("div");
    meta.className = "comment-who";
    meta.append(avatarFor(msg.sender_username));

    const sender = document.createElement("strong");
    sender.textContent = msg.sender_username || "?";
    meta.append(sender);

    const arrow = document.createElement("span");
    arrow.className = "dm-arrow";
    arrow.textContent = "→";
    meta.append(arrow);

    const recipient = document.createElement("strong");
    recipient.textContent = msg.recipient_username || "?";
    meta.append(recipient);

    const time = document.createElement("span");
    time.className = "comment-time";
    time.textContent = fmtDate(msg.created_at);
    meta.append(time);

    const unread = document.createElement("span");
    unread.className = "status-badge " + (msg.read_at ? "approved" : "hidden");
    unread.textContent = msg.read_at ? "read" : "unread";
    head.append(meta, unread);

    const text = document.createElement("p");
    text.className = "admin-comment-text";
    text.textContent = msg.text;

    const actions = document.createElement("div");
    actions.className = "admin-comment-actions";

    const viewBtn = document.createElement("a");
    viewBtn.className = "admin-btn";
    viewBtn.href = "/messages?to=" + encodeURIComponent(msg.sender_username);
    viewBtn.textContent = "Open DM";
    actions.append(viewBtn);

    const delBtn = document.createElement("button");
    delBtn.className = "admin-btn danger";
    delBtn.type = "button";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", async () => {
      if (!confirm("Delete this message permanently?")) return;
      delBtn.disabled = true;
      try {
        await MusicAPI.adminDeleteMessage(token, msg.id);
        overview.messages = (overview.messages || []).filter((m) => m.id !== msg.id);
        renderMessagesAdmin();
      } catch (error) {
        showToast("Failed: " + error.message, "error");
        delBtn.disabled = false;
      }
    });
    actions.append(delBtn);

    item.append(head, text, actions);
    adminMessages.append(item);
  });
}

/* ---------------- bans tab ---------------- */

function renderBansAdmin() {
  bansBody.innerHTML = "";

  if (!overview.bans.length) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 5;
    td.className = "empty-note";
    td.textContent = "No active bans. Quiet in here. 🌙";
    tr.append(td);
    bansBody.append(tr);
    return;
  }

  overview.bans.forEach((ban) => {
    const tr = document.createElement("tr");

    const tdKind = document.createElement("td");
    const kind = document.createElement("span");
    kind.className = "ban-kind-chip " + (ban.kind === "ip" ? "ip" : "user");
    kind.textContent = ban.kind === "ip" ? "IP" : "account";
    tdKind.append(kind);
    tr.append(tdKind);

    const tdValue = document.createElement("td");
    tdValue.className = "mono";
    tdValue.textContent = ban.kind === "user" && ban.banned_username ? `${ban.banned_username}` : ban.value;
    if (ban.kind === "user" && ban.banned_username) {
      tdValue.title = "user id: " + ban.value;
    }
    tr.append(tdValue);

    const tdReason = document.createElement("td");
    tdReason.textContent = ban.reason || "—";
    tr.append(tdReason);

    const tdExpiry = document.createElement("td");
    tdExpiry.className = "mono-small";
    tdExpiry.textContent = ban.expires_at ? fmtExpiry(ban.expires_at) : "permanent";
    tr.append(tdExpiry);

    const tdLift = document.createElement("td");
    const liftBtn = document.createElement("button");
    liftBtn.className = "admin-btn";
    liftBtn.type = "button";
    liftBtn.textContent = "Lift";
    liftBtn.addEventListener("click", async () => {
      liftBtn.disabled = true;
      try {
        await MusicAPI.adminLiftBan(token, ban.id);
        showToast("Ban lifted.", "success");
        loadOverview();
      } catch (error) {
        showToast("Failed: " + error.message, "error");
        liftBtn.disabled = false;
      }
    });
    tdLift.append(liftBtn);
    tr.append(tdLift);

    bansBody.append(tr);
  });
}

addBanForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const value = banValue.value.trim();
  if (!value) return;
  const hours = banHours.value.trim() === "" || Number(banHours.value) === 0 ? null : Number(banHours.value);
  const reason = banReason.value.trim() || "no reason given";
  try {
    await MusicAPI.adminAddBan(token, "ip", value, hours, reason);
    showToast(`Banned ${value}${hours ? ` for ${hours}h` : " permanently"}.`, "success");
    banValue.value = "";
    banHours.value = "";
    banReason.value = "";
    loadOverview();
  } catch (error) {
    showToast("Failed: " + error.message, "error");
  }
});

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
  stopZaiPolling();
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
    tabUsers.hidden = target !== "users";
    tabMessages.hidden = target !== "messages";
    tabBans.hidden = target !== "bans";
    tabSite.hidden = target !== "site";
    tabZai.hidden = target !== "zai";
    if (target === "site") loadSiteTab();
    if (target === "zai") {
      initZaiTab();
    } else if (zaiPollTimer) {
      stopZaiPolling();
    }
  });
});

/* ---------------- site tab: maintenance + persistence ---------------- */

async function loadSiteTab() {
  try {
    const m = await MusicAPI.maintenanceGet();
    maintenanceEnabled.checked = Boolean(m.enabled);
    maintenanceMessage.value = m.message || "";
    maintenanceEta.value = m.eta || "";
    maintenanceStatus.textContent = m.updated_at ? `last change ${new Date(m.updated_at).toLocaleString()}` : "";
  } catch (_) {}
  await renderPersistence();
}

async function renderPersistence() {
  try {
    const p = await MusicAPI.persistenceStatus(token);
    if (!p.env_ready) {
      persistenceBox.innerHTML = `
        <p class="persist-bad">Persistence is OFF — accounts reset on every deploy.</p>
        <p class="muted-note" style="font-size: 0.82rem; margin: 0.4rem 0 0">
          Fix (2 minutes): in the Render dashboard open this service →
          <span class="mono">Environment</span> → add
          <span class="mono">GITHUB_TOKEN</span> (a GitHub token with Contents read/write
          for this repo) and <span class="mono">DATA_SECRET</span> (any long random
          passphrase). Snapshots then restore automatically at every boot.
        </p>`;
      return;
    }
    const state = p.enabled
      ? `<p class="persist-ok">Persistence is ON — snapshots go to <span class="mono">${escapeHtml(p.repo)} @ ${escapeHtml(p.branch)}</span></p>`
      : `<p class="persist-bad">Persistence is configured but not active.</p>`;
    persistenceBox.innerHTML = `
      ${state}
      <ul class="muted-note mono persist-meta">
        <li>last backup: ${p.last_backup ? escapeHtml(new Date(p.last_backup).toLocaleString()) : "never"}</li>
        <li>last restore: ${p.last_restore ? escapeHtml(p.last_restore) : "—"}</li>
        ${p.last_error ? `<li class="persist-bad">last error: ${escapeHtml(p.last_error)}</li>` : ""}
      </ul>
      <button id="backup-now" class="btn small-btn" type="button">Back up now</button>`;
    const btn = document.getElementById("backup-now");
    if (btn) {
      btn.addEventListener("click", async () => {
        btn.disabled = true;
        btn.textContent = "Backing up…";
        try {
          const r = await MusicAPI.persistenceBackupNow(token);
          showToast(r.ok ? "Snapshot pushed to GitHub." : `Backup failed: ${(r.status && r.status.last_error) || "unknown"}`, r.ok ? "success" : "error");
        } catch (error) {
          showToast(error.message, "error");
        }
        renderPersistence();
      });
    }
  } catch (error) {
    persistenceBox.innerHTML = `<p class="muted-note mono">could not load: ${escapeHtml(error.message)}</p>`;
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

maintenanceForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  maintenanceSave.disabled = true;
  try {
    await MusicAPI.maintenanceSet(token, {
      enabled: maintenanceEnabled.checked,
      message: maintenanceMessage.value.trim(),
      eta: maintenanceEta.value.trim()
    });
    maintenanceStatus.textContent = `saved ${new Date().toLocaleTimeString()}`;
    showToast(maintenanceEnabled.checked ? "Maintenance banner is now LIVE on every page." : "Maintenance banner switched off.", "success");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    maintenanceSave.disabled = false;
  }
});

/* ---------------- zai tab: Message Z.ai ---------------- */

const ZAI_KEY_STORAGE = "tm-zai-key-v1";
let zaiKey = sessionStorage.getItem(ZAI_KEY_STORAGE) || "";
let zaiPollTimer = null;

function zaiEscape(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function zaiViaLabel(m) {
  if (m.via === "llm") return "auto-reply";
  if (m.via === "developer") return "direct line";
  return "";
}

function renderZaiMessages(messages) {
  if (!messages.length) {
    zaiLog.innerHTML =
      '<p class="muted-note" style="text-align:center; margin: 2rem 1rem">No messages yet — say hi to Z.ai 👋</p>';
    return;
  }
  zaiLog.innerHTML = messages
    .map((m) => {
      const mine = m.role === "admin";
      const via = zaiViaLabel(m);
      return `
        <div class="zai-msg ${mine ? "zai-msg-admin" : "zai-msg-zai"}">
          <div class="zai-bubble">${zaiEscape(m.text).replace(/\n/g, "<br>")}</div>
          <div class="zai-meta mono">${mine ? "You" : "Z.ai"}${via ? " · " + via : ""} · ${new Date(m.created_at).toLocaleString()}</div>
        </div>`;
    })
    .join("");
  zaiLog.scrollTop = zaiLog.scrollHeight;
}

async function loadZaiHistory() {
  if (!token || !zaiKey) return false;
  try {
    const data = await MusicAPI.zaiHistory(token, zaiKey);
    const messages = data.messages || [];
    renderZaiMessages(messages);
    tabZaiCount.textContent = messages.length ? String(messages.length) : "";
    zaiGate.hidden = true;
    zaiChat.hidden = false;
    return true;
  } catch (error) {
    if (error.status === 401 || error.status === 501) {
      sessionStorage.removeItem(ZAI_KEY_STORAGE);
      zaiKey = "";
      zaiGate.hidden = false;
      zaiChat.hidden = true;
      zaiGateStatus.textContent = error.message || "key rejected";
    }
    return false;
  }
}

function startZaiPolling() {
  stopZaiPolling();
  zaiPollTimer = setInterval(() => {
    if (!document.hidden) loadZaiHistory();
  }, 6000);
}

function stopZaiPolling() {
  if (zaiPollTimer) {
    clearInterval(zaiPollTimer);
    zaiPollTimer = null;
  }
}

async function initZaiTab() {
  zaiGateStatus.textContent = "";
  try {
    const cfg = await MusicAPI.zaiConfig();
    if (!cfg.enabled) {
      zaiGate.hidden = false;
      zaiChat.hidden = true;
      zaiGateStatus.textContent =
        "Not configured on the server yet — add ZAI_ACCESS_KEY to the Render environment to enable this chat.";
      return;
    }
    zaiMode.textContent = cfg.auto_reply
      ? `instant auto-reply ON (${cfg.model})`
      : "instant auto-reply OFF — messages queue for the developer";
    if (zaiKey) {
      const ok = await loadZaiHistory();
      if (ok) startZaiPolling();
    } else {
      zaiGate.hidden = false;
      zaiChat.hidden = true;
    }
  } catch (error) {
    zaiGateStatus.textContent = error.message;
  }
}

async function tryZaiUnlock() {
  const key = zaiKeyInput.value.trim();
  if (!key) {
    zaiGateStatus.textContent = "enter the special key first";
    return;
  }
  zaiGateStatus.textContent = "checking…";
  zaiKey = key;
  const ok = await loadZaiHistory();
  if (ok) {
    sessionStorage.setItem(ZAI_KEY_STORAGE, key);
    zaiKeyInput.value = "";
    zaiGateStatus.textContent = "";
    startZaiPolling();
  } else if (zaiKey === key) {
    zaiKey = "";
    zaiGateStatus.textContent = "wrong special key — try again";
  }
}

zaiUnlockBtn.addEventListener("click", tryZaiUnlock);
zaiKeyInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    tryZaiUnlock();
  }
});

zaiForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = zaiText.value.trim();
  if (!text || !zaiKey) return;
  zaiText.value = "";
  zaiSendBtn.disabled = true;
  zaiSendBtn.textContent = "…";
  try {
    const res = await MusicAPI.zaiSend(token, zaiKey, text);
    if (res.queued && !res.reply) {
      showToast("Message saved — Z.ai will reply here soon.", "info");
    }
    await loadZaiHistory();
  } catch (error) {
    zaiText.value = text;
    showToast(error.message || "could not send the message", "error");
  } finally {
    zaiSendBtn.disabled = false;
    zaiSendBtn.textContent = "Send";
  }
});

zaiClearBtn.addEventListener("click", async () => {
  if (!zaiKey || !confirm("Clear the whole Z.ai conversation?")) return;
  try {
    await MusicAPI.zaiClear(token, zaiKey);
    await loadZaiHistory();
  } catch (error) {
    showToast(error.message || "could not clear the chat", "error");
  }
});

zaiRelockBtn.addEventListener("click", () => {
  sessionStorage.removeItem(ZAI_KEY_STORAGE);
  zaiKey = "";
  stopZaiPolling();
  zaiChat.hidden = true;
  zaiGate.hidden = false;
  zaiGateStatus.textContent = "locked — paste the special key to unlock again";
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
    githubBtn.disabled = true;
    return;
  }

  apiStatus.textContent = `backend: ${MusicAPI.base || "same origin"} — ready.`;
  await loadAuthConfig();

  if (handleGithubParams()) return;

  if (token) {
    // Validate the stored token by loading data; on 401 we fall back to login.
    showDash();
    await loadOverview();
  }
})();
