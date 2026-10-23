/* =============== EDIT YOUR MUSIC HERE =============== */
// Google Drive direct-download endpoint (works for publicly shared files)
const DRIVE = (id) => `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`;

const tracks = [
  { title: "Whispers", file: "audio/Whispers.mp3", dl: DRIVE("1DXiCsa3iUBdgh1jHcy80Y199uPAPmXiy"), note: "single — out now" },
  { title: "When I Think About You", file: "audio/When I Think About You.mp3", note: "new single" },
  { title: "Deep Space", file: "audio/Thomas Miller - Deep Space.mp3" },
  { title: "Insterstellar Roadtrip (Slowed)", file: "audio/Thomas Miller - Insterstellar Roadtrip (Slowed).mp3" },
  { title: "Interstellar Roadtrip (Sped)", file: "audio/Thomas Miller - Interstellar Roadtrip (Sped).mp3" },
  { title: "Interstellar Roadtrip", file: "audio/Thomas Miller - Interstellar Roadtrip.mp3" },
  { title: "Late Night Disco", file: "audio/Thomas Miller - Late Night Disco.mp3" },
  { title: "Light in the Dark", file: "audio/Thomas Miller - Light in the Dark.mp3" },
  { title: "Sands of Time", file: "audio/Thomas Miller - Sands of Time.mp3" },
  { title: "Solar Synth Relift", file: "audio/Thomas Miller - Solar Synth Relift.mp3" },
  { title: "Solar Synth", file: "audio/Thomas Miller - Solar Synth.mp3" }
];

const stems = [
  { name: "Whispers Bass.wav", id: "19OKpuqGuI6Jrrh5CUGuI4Y2bBSOp7q_r", size: 93252680 },
  { name: "Whispers Crash.wav", id: "1ktt3SCUM6WaXHfQzlWXLhrLsPd2W0cTh", size: 93252680 },
  { name: "Whispers Donk Bass.wav", id: "1qE22QT46MgxgTKXYEGXI8T_Z48ZuzqhT", size: 93252680 },
  { name: "Whispers Drop Bass Top.wav", id: "1Ts1vOVFXjqgFbvr0GX9nWhs-bVtO0cDB", size: 93252680 },
  { name: "Whispers Drums.wav", id: "1ffb6izvXS8KOFcLJTm78d-M8iTYs5cKl", size: 93252680 },
  { name: "Whispers FX.wav", id: "1GdohHjQfnTCflSVMZKRVVrNDFtue3rzh", size: 93252680 },
  { name: "Whispers Impacts_Risers.wav", id: "1AmPh0_JhMBwnOGYBsmNHw6lQ5xeUc0g8", size: 93252680 },
  { name: "Whispers Kick.wav", id: "1WhrSvKwITXYS2fd3vTsZzGJzX-xYqdDE", size: 93252680 },
  { name: "Whispers Lead-1.wav", id: "1uwm1ez3yjRoTCTgxbyltNnejoun2RGpm", size: 93252680 },
  { name: "Whispers Lead.wav", id: "1zGp8RCjfMmms-EAh3n7wzHxuSz7aTiu8", size: 93252680 },
  { name: "Whispers Leads.wav", id: "1dbpEYreicpPecgy3kQGzE66tHqXVwsdi", size: 93252680 },
  { name: "Whispers Reece Bass.wav", id: "12zrNxW12hkx1bTTIQ25GR6rMEE9Pxq8H", size: 93252680 },
  { name: "Whispers Tops.wav", id: "1h3RBtoCEQRv4Nq_rqe0QF7ESZTtaCe4D", size: 93252680 },
  { name: "Whispers Vocals-1.wav", id: "164Wi1MeDvsY4b53TbSMx5okp9ODaFbB7", size: 93252680 },
  { name: "Whispers Vocals-2.wav", id: "1bBpgtPiShVvptUW4EOB1CzhDapr29-I1", size: 93252680 },
  { name: "Whispers Vocals.wav", id: "1Cbjm9k2JOCvX-oIw7BNZbclP6is_fdTC", size: 93252680 }
];

const liveSets = [
  { name: "Whispers.als", id: "1EjwPdfksk_h9KIbxSG-7xJ2hlZTIq_uU", size: 132828, main: true },
  { name: "Whispers [2026-10-15 202437].als", id: "1SMU_g8_79c2Cc4Toq1hj3tKd2_bpm235", size: 113655 },
  { name: "Whispers [2026-10-16 115808].als", id: "1SLH49tfKtrVAjsjfjJE4yjhqChwLeTVs", size: 113629 },
  { name: "Whispers [2026-10-16 115836].als", id: "1uT-BhLLQ7EgkhU9o8K1GayRkgHkx-b9c", size: 113012 },
  { name: "Whispers [2026-10-16 115901].als", id: "1mjwSZUUgZnobORlRcLRs_zzTtscJ3y-f", size: 113975 },
  { name: "Whispers [2026-10-16 115930].als", id: "1mI5Gkekgv4gZQ1BnES__K3pYwgQM-oWG", size: 115063 },
  { name: "Whispers [2026-10-16 120424].als", id: "1PZvI2ZFq-sVnVOIx7gcuwrH5BQFWiwbA", size: 115108 },
  { name: "Whispers [2026-10-16 120910].als", id: "1cI0gHg2AeHrBwouz-uyFPRAHezFcPfSl", size: 120915 },
  { name: "Whispers [2026-10-16 121401].als", id: "1SRb1qIU9tGgApfLqcElVAO-0RUxTGj3F", size: 120951 },
  { name: "Whispers [2026-10-16 121814].als", id: "1AsYW2Fs2nbpDqh0t-3oa52khyoNLxpOL", size: 128532 },
  { name: "Whispers [2026-10-16 122157].als", id: "1amTrIz5_kv33v708lI6FmccQTI-U4rz9", size: 132825 }
];

const stemsDriveFolder = "https://drive.google.com/drive/folders/1gfPI2GZnWvpsMAediP_zaGx_Oy4JrJnH";

/* =============== element refs (page-aware: each sub-site has some of these) =============== */

const audio = document.getElementById("audio");
const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const seek = document.getElementById("seek");
const vol = document.getElementById("volume");
const npTitle = document.getElementById("np-title");
const npTime = document.getElementById("np-time");
const npCover = document.getElementById("np-cover");
const npDescription = document.getElementById("np-description");
const npSourceBadge = document.getElementById("np-source-badge");
const coverFallback = document.getElementById("cover-fallback");
const list = document.getElementById("tracklist");
const stemsBody = document.getElementById("stems-body");
const setsBody = document.getElementById("sets-body");
const heroVinyl = document.getElementById("hero-vinyl");
const heroSongCount = document.getElementById("hero-song-count");

/* ---- per-song community state (listens / likes / comments) ---- */

const communitySong = document.getElementById("community-song");
const songListensEl = document.getElementById("song-listens");
const songLikesEl = document.getElementById("song-likes");
const songCommentsEl = document.getElementById("song-comments");
const apiModeEl = document.getElementById("api-mode");
const apiModeTextEl = document.getElementById("api-mode-text");
const commentSongEl = document.getElementById("comment-song");

const likeBtn = document.getElementById("like-btn");
const commentForm = document.getElementById("comment-form");
const commentName = document.getElementById("comment-name");
const commentText = document.getElementById("comment-text");
const commentList = document.getElementById("comment-list");

/* ---- account refs (shared header on every page) ---- */

const signinBtn = document.getElementById("signin-btn");
const userChip = document.getElementById("user-chip");
const userAvatar = document.getElementById("user-avatar");
const userNameEl = document.getElementById("user-name");
const signoutBtn = document.getElementById("signout-btn");
const authModal = document.getElementById("auth-modal");
const authClose = document.getElementById("auth-close");
const authError = document.getElementById("auth-error");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const loginUsername = document.getElementById("login-username");
const loginPassword = document.getElementById("login-password");
const regUsername = document.getElementById("reg-username");
const regPassword = document.getElementById("reg-password");
const msgBadge = document.getElementById("msg-badge");

const LIKED_STORAGE_KEY = "tm-music-likes-v1";
const LOCAL_DB_KEY = "tm-music-localdb-v2";
const SESSION_LISTEN_KEY = "tm-music-session-listen-v1";
const ACCOUNT_KEY = "tm-music-account-v2";
const COMMENT_LIMIT = 20;

let index = -1;
let currentSong = "whispers";
let currentComments = [];
let allStats = {};          // song -> { listens, likes, comments }
let dynamicSongs = [];      // songs from the backend (metadata: description, covers, audio)
let viewTracks = [];        // merged static + dynamic track list
let banToastShown = false;  // avoid spamming the ban notice

/* =============== toasts =============== */

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

function announceBanIfAny(error) {
  if (error && error.banned && !banToastShown) {
    banToastShown = true;
    showToast(error.message, "error", 9000);
  }
}

/* =============== account state =============== */

function readJson(key, fallback) {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "null");
    return raw && typeof raw === "object" ? raw : fallback;
  } catch (_) {
    return fallback;
  }
}

let account = readJson(ACCOUNT_KEY, null); // { token, id, username, avatar_url, is_admin }
let likedFromAccount = new Set();
let unreadMessages = 0;

function saveAccount(value) {
  account = value;
  try {
    if (value) localStorage.setItem(ACCOUNT_KEY, JSON.stringify(value));
    else localStorage.removeItem(ACCOUNT_KEY);
  } catch (_) {}
}

function initialsFor(name) {
  return (String(name || "?").trim()[0] || "?").toUpperCase();
}

function hueFor(str) {
  let h = 0;
  for (let i = 0; i < String(str).length; i++) h = (h * 31 + String(str).charCodeAt(i)) % 360;
  return h;
}

function avatarImageFor(name, avatarUrl, cls) {
  const span = document.createElement("span");
  span.className = cls || "avatar avatar-small";
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

function updateAuthUI() {
  if (!signinBtn || !userChip) return;
  if (account) {
    signinBtn.hidden = true;
    userChip.hidden = false;
    userNameEl.textContent = account.username;
    const fresh = avatarImageFor(account.username, account.avatar_url, "avatar");
    userAvatar.replaceWith(fresh);
    fresh.id = "user-avatar";
    const menu = document.getElementById("user-menu");
    if (menu) {
      menu.querySelector("#menu-profile").href = "/profile";
      menu.querySelector("#menu-my-comments").href = `/profile?u=${encodeURIComponent(account.username)}`;
      const adminLink = menu.querySelector("#menu-admin");
      if (adminLink) adminLink.hidden = !account.is_admin;
    }
    refreshUnreadBadge();
  } else {
    signinBtn.hidden = false;
    userChip.hidden = true;
  }
}

async function refreshUnreadBadge() {
  if (!msgBadge) return;
  if (!account || MusicAPI.mode !== "server") { msgBadge.hidden = true; return; }
  try {
    const data = await MusicAPI.unreadCount(account.token);
    unreadMessages = Number(data.unread || 0);
    msgBadge.textContent = unreadMessages > 99 ? "99+" : String(unreadMessages);
    msgBadge.hidden = unreadMessages === 0;
  } catch (_) { msgBadge.hidden = true; }
}

async function restoreAccount() {
  if (!account) return;
  if (MusicAPI.mode !== "server") return;
  try {
    const data = await MusicAPI.me(account.token);
    account = {
      token: account.token,
      id: data.user.id,
      username: data.user.username,
      avatar_url: data.user.avatar_url || null,
      bio: data.user.bio || "",
      is_admin: Boolean(data.user.is_admin)
    };
    saveAccount(account);
    likedFromAccount = new Set(data.likes || []);
    if (data.user.banned) {
      const when = data.user.banned.permanent ? "permanently" : "until " + new Date(data.user.banned.until).toLocaleString();
      showToast(`Your account is banned ${when} — ${data.user.banned.reason}`, "error", 9000);
    }
  } catch (error) {
    if (error.status === 401) saveAccount(null);
  }
  updateAuthUI();
  refreshCurrentStats();
}

/* =============== localStorage fallback (no backend) =============== */

function localDb() {
  const db = readJson(LOCAL_DB_KEY, null);
  if (db && db.songs) return db;
  return { songs: {} };
}

function localSong(song) {
  const db = localDb();
  if (!db.songs[song]) db.songs[song] = { listens: 0, likes: 0, comments: [] };
  return db;
}

function localSaveSong(song, data) {
  const db = localSong(song);
  db.songs[song] = data;
  try { localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(db)); } catch (_) {}
}

function localGetSong(song) {
  const db = localSong(song);
  const s = db.songs[song];
  return {
    listens: Number(s.listens) || 0,
    likes: Number(s.likes) || 0,
    comments: Array.isArray(s.comments) ? s.comments.slice() : []
  };
}

function localListen(song) {
  const s = localGetSong(song);
  s.listens += 1;
  localSaveSong(song, s);
  return s;
}

function localLike(song, wantLike) {
  const s = localGetSong(song);
  s.likes = Math.max(0, s.likes + (wantLike ? 1 : -1));
  localSaveSong(song, s);
  return s;
}

function localAddComment(song, comment) {
  const s = localGetSong(song);
  s.comments.unshift(comment);
  s.comments = s.comments.slice(0, 100);
  localSaveSong(song, s);
  return s;
}

function getLikedMap() {
  return readJson(LIKED_STORAGE_KEY, {});
}

function isLiked(song) {
  if (account) return likedFromAccount.has(song);
  return Boolean(getLikedMap()[song]);
}

function setLiked(song, value) {
  if (account) return; // server-side for accounts
  const map = getLikedMap();
  if (value) map[song] = true;
  else delete map[song];
  try { localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(map)); } catch (_) {}
}

/* =============== track catalog (static + server-added) =============== */

function normalizeSongName(title) {
  return String(title || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}

function hashString(str) {
  let h = 5381;
  for (let i = 0; i < String(str).length; i++) h = ((h << 5) + h + String(str).charCodeAt(i)) >>> 0;
  return h;
}

// Procedural SVG cover — gradient + rings + initials, unique per song.
function proceduralCover(songKey, title) {
  const h = hashString(songKey || title || "x");
  const hue1 = h % 360;
  const hue2 = (hue1 + 70 + (h % 90)) % 360;
  const initials = (String(title || songKey || "?").trim()
    .split(/\s+/).slice(0, 2).map((w) => w[0]).join("") || "?").toUpperCase();
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="hsl(${hue1},72%,52%)"/>` +
    `<stop offset="1" stop-color="hsl(${hue2},80%,38%)"/>` +
    `</linearGradient></defs>` +
    `<rect width="320" height="320" fill="url(#g)"/>` +
    `<circle cx="320" cy="0" r="150" fill="rgba(255,255,255,0.10)"/>` +
    `<circle cx="0" cy="320" r="110" fill="rgba(0,0,0,0.16)"/>` +
    `<circle cx="160" cy="160" r="86" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="3"/>` +
    `<circle cx="160" cy="160" r="64" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="2"/>` +
    `<text x="160" y="184" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="800" ` +
    `fill="rgba(255,255,255,0.92)" text-anchor="middle">${initials}</text>` +
    `</svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function coverFor(track) {
  if (track && track.cover_url) return MusicAPI.mediaUrl(track.cover_url);
  return proceduralCover(track ? track.songKey : "", track ? track.title : "");
}

function rebuildViewTracks() {
  const dynByKey = new Map(dynamicSongs.map((s) => [s.song, s]));
  const merged = tracks.map((t) => {
    const key = normalizeSongName(t.title);
    const d = dynByKey.get(key);
    return {
      ...t,
      songKey: key,
      description: d ? d.description || "" : "",
      cover_url: d ? d.cover_url : null,
      audio_url: d ? d.audio_url : null,
      adminAdded: false
    };
  });

  for (const d of dynamicSongs) {
    if (merged.some((t) => t.songKey === d.song)) continue;
    merged.push({
      title: d.display_name,
      file: d.audio_url ? MusicAPI.mediaUrl(d.audio_url) : "",
      dl: d.audio_url ? MusicAPI.mediaUrl(d.audio_url) : "",
      note: "added via admin",
      songKey: d.song,
      description: d.description || "",
      cover_url: d.cover_url,
      audio_url: d.audio_url,
      adminAdded: true
    });
  }

  viewTracks = merged;
  if (heroSongCount) heroSongCount.textContent = String(merged.length);
}

function statsFor(song) {
  if (allStats[song]) return allStats[song];
  if (MusicAPI.mode === "local") return localGetSong(song);
  return { listens: 0, likes: 0, comments: 0 };
}

/* =============== rendering =============== */

function renderApiMode() {
  if (!apiModeEl) return;
  if (MusicAPI.mode === "server") {
    apiModeEl.classList.remove("local");
    apiModeEl.classList.add("live");
    apiModeEl.title = "Saved to the live database — visible to every visitor" + (MusicAPI.base ? ` (${MusicAPI.base})` : "");
    apiModeTextEl.textContent = "live database";
  } else {
    apiModeEl.classList.remove("live");
    apiModeEl.classList.add("local");
    apiModeEl.title = "No backend configured — data is saved on this device only. Set apiBase in config.js to go global.";
    apiModeTextEl.textContent = "saved on this device";
  }
}

function renderCommunityStats() {
  if (!communitySong) return;
  const track = viewTracks[index] || viewTracks.find((t) => t.songKey === currentSong);
  const stats = statsFor(currentSong);
  communitySong.textContent = track ? track.title : currentSong;
  if (commentSongEl) commentSongEl.textContent = track ? track.title : currentSong;

  songListensEl.textContent = formatNumber(stats.listens);
  songLikesEl.textContent = formatNumber(stats.likes);
  songCommentsEl.textContent = formatNumber(Math.max(stats.comments, currentComments.length));

  const liked = isLiked(currentSong);
  likeBtn.setAttribute("aria-pressed", String(liked));
  likeBtn.textContent = liked ? "♥" : "♡";
  likeBtn.title = liked ? "Liked — click to unlike" : "Like this track";

  // player artwork + description
  if (track) {
    npCover.src = coverFor(track);
    npCover.onerror = () => { npCover.src = proceduralCover(track.songKey, track.title); };
    coverFallback.style.display = "none";
    npSourceBadge.hidden = !track.adminAdded;
    if (track.description) {
      npDescription.textContent = track.description;
      npDescription.hidden = false;
    } else {
      npDescription.hidden = true;
    }
  }
}

function avatarEl(name, isAccount, avatarUrl) {
  const span = avatarImageFor(name, avatarUrl, "avatar avatar-small");
  if (isAccount) span.title = "posted with an account";
  return span;
}

function renderComments() {
  if (!commentList) return;
  commentList.innerHTML = "";

  if (!currentComments.length) {
    const empty = document.createElement("li");
    empty.className = "comment-empty";
    empty.textContent = "No comments yet — be the first to leave one.";
    commentList.append(empty);
    return;
  }

  currentComments.slice(0, COMMENT_LIMIT).forEach((comment) => {
    const item = document.createElement("li");
    item.className = "comment-item";
    item.dataset.id = comment.id || "";

    const meta = document.createElement("div");
    meta.className = "comment-meta";

    const who = document.createElement("div");
    who.className = "comment-who";
    who.append(avatarEl(comment.author, Boolean(comment.user_id), comment.avatar_url));

    const author = document.createElement("strong");
    author.textContent = comment.author || "Anonymous";
    who.append(author);

    if (comment.user_id) {
      const acct = document.createElement("span");
      acct.className = "acct-badge";
      acct.title = "posted from a member account";
      acct.textContent = "member";
      who.append(acct);
    }

    const time = document.createElement("span");
    time.className = "comment-time";
    const date = new Date(comment.created_at || comment.createdAt || Date.now());
    time.textContent = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });

    meta.append(who, time);

    const text = document.createElement("p");
    text.textContent = comment.text;

    item.append(meta, text);

    if (comment.user_id) {
      item.style.cursor = "pointer";
      item.title = "View profile";
      item.addEventListener("click", () => {
        window.location.href = "/profile?u=" + encodeURIComponent(comment.author);
      });
    }

    commentList.append(item);
  });
}

/* =============== data refresh =============== */

async function refreshAllStats() {
  try {
    const data = await MusicAPI.all();
    allStats = {};
    dynamicSongs = data.songs.map((s) => ({
      song: s.song,
      display_name: s.display_name,
      description: s.description,
      cover_url: s.cover_url,
      audio_url: s.audio_url,
      source: s.source
    }));
    data.songs.forEach((s) => {
      allStats[s.song] = { listens: s.listens, likes: s.likes, comments: s.comments };
    });
  } catch (_) {
    allStats = {};
  }
  rebuildViewTracks();
  renderCommunityStats();
  renderList();
}

async function refreshCurrentStats() {
  if (!likeBtn) return;
  const song = currentSong;
  try {
    const data = await MusicAPI.stats(song);
    if (song !== currentSong) return;
    allStats[song] = { listens: data.listens, likes: data.likes, comments: data.comments };
  } catch (_) {
    if (MusicAPI.mode === "local") {
      allStats[song] = localGetSong(song);
    }
  }
  renderCommunityStats();
  renderList();
}

async function loadComments() {
  if (!commentList) return;
  const song = currentSong;

  try {
    const data = await MusicAPI.comments(song, 50);
    if (song !== currentSong) return;
    currentComments = data.comments.map((c) => ({
      id: c.id,
      author: c.author,
      text: c.text,
      created_at: c.created_at,
      user_id: c.user_id,
      avatar_url: c.avatar_url
    }));
  } catch (_) {
    if (MusicAPI.mode === "local") {
      currentComments = localGetSong(song).comments;
    } else {
      currentComments = [];
    }
  }
  renderCommunityStats();
  renderComments();
}

function loadStatsFromDb() {
  return refreshCurrentStats();
}

async function registerListen() {
  const song = currentSong;
  const alreadyLogged = sessionStorage.getItem(`${SESSION_LISTEN_KEY}:${song}`);
  if (alreadyLogged) return;
  sessionStorage.setItem(`${SESSION_LISTEN_KEY}:${song}`, "1");

  try {
    const data = await MusicAPI.listen(song);
    allStats[song] = { listens: data.listens, likes: data.likes, comments: data.comments };
  } catch (error) {
    announceBanIfAny(error);
    const s = localListen(song);
    allStats[song] = s;
  }
  renderCommunityStats();
  renderList();
}

async function toggleLike() {
  const song = currentSong;
  const wantLike = !isLiked(song);
  setLiked(song, wantLike);

  try {
    const data = await MusicAPI.like(song, wantLike, account ? account.token : undefined);
    allStats[song] = { listens: data.listens, likes: data.likes, comments: data.comments };
    if (account) {
      if (wantLike) likedFromAccount.add(song);
      else likedFromAccount.delete(song);
    }
  } catch (error) {
    if (error.status === 409) {
      // account already-liked / not-liked — resync
      showToast(error.message, "info");
      if (account) {
        wantLike ? likedFromAccount.add(song) : likedFromAccount.delete(song);
      }
    } else {
      announceBanIfAny(error);
      const s = localLike(song, wantLike);
      allStats[song] = s;
    }
  }
  renderCommunityStats();
  renderList();
}

if (likeBtn) {
  likeBtn.addEventListener("click", () => { toggleLike(); });
}

if (commentForm) {
  commentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const author = account ? account.username : ((commentName.value || "Anonymous").trim().slice(0, 24) || "Anonymous");
    const text = commentText.value.trim();
    const song = currentSong;

    if (!text) return;

    const submitBtn = commentForm.querySelector("button[type=submit]");
    submitBtn.disabled = true;

    let posted = false;

    try {
      const data = await MusicAPI.addComment({ song, author, text }, account ? account.token : undefined);
      if (data.comment && data.comment.status === "approved") {
        currentComments.unshift({
          id: data.comment.id,
          author: data.comment.author,
          text: data.comment.text,
          created_at: data.comment.created_at,
          user_id: data.comment.user_id,
          avatar_url: data.comment.avatar_url
        });
        posted = true;
      } else if (data.comment) {
        showToast("Comment received — waiting for moderator approval.", "info");
      }
      allStats[song] = { listens: data.listens, likes: data.likes, comments: data.comments };
    } catch (error) {
      announceBanIfAny(error);
      if (error.banned) {
        showToast("You are banned — comment not sent.", "error");
      } else if (MusicAPI.mode === "local") {
        const localComment = {
          id: `comment-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          author,
          text,
          created_at: new Date().toISOString()
        };
        localAddComment(song, localComment);
        currentComments.unshift(localComment);
        posted = true;
      } else {
        showToast("Could not post: " + error.message, "error");
      }
    }

    submitBtn.disabled = false;
    commentForm.reset();

    if (posted) {
      renderComments();
      renderCommunityStats();
      renderList();
    }
  });
}

/* =============== player =============== */

function fmt(seconds) {
  if (!isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function fmtSize(bytes) {
  if (bytes == null) return "—";
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + " GB";
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(0) + " KB";
  return bytes + " B";
}

function driveAnchor(id, label, title) {
  const a = document.createElement("a");
  a.href = DRIVE(id);
  a.textContent = label;
  a.title = title;
  a.rel = "noopener";
  return a;
}

let usedFallbackSrc = false;

function setPlayingVisual(playing) {
  document.body.classList.toggle("is-playing", Boolean(playing));
  if (heroVinyl) heroVinyl.classList.toggle("spinning", Boolean(playing));
}

function loadTrack(i, autoplay = true) {
  if (!viewTracks.length) rebuildViewTracks();
  index = (i + viewTracks.length) % viewTracks.length;
  usedFallbackSrc = false;
  const nextTrack = viewTracks[index];
  currentSong = nextTrack.songKey || normalizeSongName(nextTrack.title);
  audio.src = nextTrack.file || nextTrack.dl || "";
  audio.dataset.trackPlayLogged = "false";
  npTitle.textContent = nextTrack.title;
  currentComments = [];
  renderComments();
  renderCommunityStats();
  renderList();
  loadStatsFromDb();
  loadComments();
  if (autoplay) audio.play().catch(() => {});
}

function renderList() {
  if (!list) return;
  list.innerHTML = "";
  viewTracks.forEach((t, i) => {
    const li = document.createElement("li");
    if (i === index) li.className = "active";

    const thumb = document.createElement("img");
    thumb.className = "row-cover";
    thumb.src = coverFor(t);
    thumb.alt = "";
    thumb.loading = "lazy";
    thumb.onerror = () => { thumb.src = proceduralCover(t.songKey, t.title); };
    li.append(thumb);

    const num = document.createElement("span");
    num.className = "num";
    num.textContent = i === index ? "▶" : String(i + 1).padStart(2, "0");

    const titleWrap = document.createElement("span");
    titleWrap.className = "title-wrap";

    const title = document.createElement("span");
    title.className = "title";
    title.textContent = t.title;
    titleWrap.append(title);

    if (t.description) {
      const desc = document.createElement("span");
      desc.className = "row-desc";
      desc.textContent = t.description.length > 64 ? t.description.slice(0, 64) + "…" : t.description;
      titleWrap.append(desc);
    }
    li.append(num, titleWrap);

    if (t.note) {
      const note = document.createElement("span");
      note.className = "note";
      note.textContent = t.note;
      li.append(note);
    }

    const s = allStats[t.songKey];
    if (s) {
      const rowStats = document.createElement("span");
      rowStats.className = "row-stats mono";
      rowStats.title = `${s.listens} listens · ${s.likes} likes`;
      rowStats.textContent = `▶ ${formatNumber(s.listens)} · ♥ ${formatNumber(s.likes)}`;
      li.append(rowStats);
    }

    const dl = document.createElement("a");
    dl.className = "dl";
    dl.href = t.dl || t.file;
    dl.download = "";
    dl.textContent = "↓";
    dl.title = "download";
    if (!t.dl && !t.file) dl.style.display = "none";
    dl.addEventListener("click", (event) => event.stopPropagation());
    li.append(dl);

    li.addEventListener("click", () => loadTrack(i));
    list.append(li);
  });
}

if (playBtn) {
  playBtn.addEventListener("click", () => {
    if (index === -1) return loadTrack(0);
    audio.paused ? audio.play() : audio.pause();
  });

  prevBtn.addEventListener("click", () => loadTrack(index - 1));
  nextBtn.addEventListener("click", () => loadTrack(index + 1));

  audio.addEventListener("play", () => {
    playBtn.textContent = "⏸";
    setPlayingVisual(true);
    renderList();
    registerListen();
  });

  audio.addEventListener("pause", () => {
    playBtn.textContent = "▶";
    setPlayingVisual(false);
    renderList();
  });

  audio.addEventListener("ended", () => loadTrack(index + 1));
  audio.addEventListener("loadedmetadata", () => {
    npTime.textContent = `0:00 / ${fmt(audio.duration)}`;
  });
  audio.addEventListener("timeupdate", () => {
    npTime.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
    if (audio.duration) {
      const pct = (audio.currentTime / audio.duration) * 100;
      seek.value = (audio.currentTime / audio.duration) * 1000;
      seek.style.setProperty("--p", pct + "%");
    }
  });

  audio.addEventListener("error", () => {
    const track = viewTracks[index];
    if (track && !usedFallbackSrc && (track.dl || track.file)) {
      usedFallbackSrc = true;
      audio.src = track.dl || track.file;
      audio.play().catch(() => {});
      return;
    }
    if (track) npTitle.textContent = `${track.title} — couldn't load (file missing?)`;
  });

  seek.addEventListener("input", () => {
    if (audio.duration) audio.currentTime = (seek.value / 1000) * audio.duration;
  });

  vol.addEventListener("input", () => {
    audio.volume = vol.value / 100;
  });
}

/* =============== account modal =============== */

function openAuthModal() {
  if (MusicAPI.mode !== "server") {
    showToast("Accounts need the database backend — set apiBase in config.js.", "info", 6000);
    return;
  }
  authError.hidden = true;
  authModal.hidden = false;
  setTimeout(() => loginUsername.focus(), 60);
}

function closeAuthModal() {
  authModal.hidden = true;
}

if (signinBtn) {
  signinBtn.addEventListener("click", openAuthModal);
  authClose.addEventListener("click", closeAuthModal);
  authModal.addEventListener("click", (event) => {
    if (event.target === authModal) closeAuthModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !authModal.hidden) closeAuthModal();
  });

  document.querySelectorAll(".modal-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".modal-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const which = tab.dataset.authTab;
      loginForm.hidden = which !== "login";
      registerForm.hidden = which !== "register";
      authError.hidden = true;
    });
  });
}

function authFail(message) {
  authError.textContent = message;
  authError.hidden = false;
}

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    authError.hidden = true;
    const btn = loginForm.querySelector("button[type=submit]");
    btn.disabled = true;
    try {
      const data = await MusicAPI.login(loginUsername.value.trim(), loginPassword.value);
      account = { token: data.token, id: data.user.id, username: data.user.username, avatar_url: data.user.avatar_url || null, is_admin: Boolean(data.user.is_admin) };
      saveAccount(account);
      loginForm.reset();
      closeAuthModal();
      updateAuthUI();
      showToast(`Welcome back, ${account.username}!`, "success");
      await restoreAccount();
    } catch (error) {
      authFail(error.message);
    } finally {
      btn.disabled = false;
    }
  });

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    authError.hidden = true;
    const btn = registerForm.querySelector("button[type=submit]");
    btn.disabled = true;
    try {
      const data = await MusicAPI.register(regUsername.value.trim(), regPassword.value);
      account = { token: data.token, id: data.user.id, username: data.user.username, avatar_url: null, is_admin: false };
      saveAccount(account);
      registerForm.reset();
      closeAuthModal();
      updateAuthUI();
      showToast(`Account created — welcome, ${account.username}!`, "success");
      await restoreAccount();
    } catch (error) {
      authFail(error.message);
    } finally {
      btn.disabled = false;
    }
  });

  signoutBtn.addEventListener("click", async () => {
    const wasAccount = account;
    saveAccount(null);
    likedFromAccount = new Set();
    updateAuthUI();
    renderCommunityStats();
    if (wasAccount && MusicAPI.mode === "server") {
      try { await MusicAPI.logout(wasAccount.token); } catch (_) {}
    }
    showToast("Signed out.", "info");
  });
}

/* =============== stems & live sets tables =============== */

if (stemsBody) {
  stems.forEach((stem) => {
    const tr = document.createElement("tr");
    const td1 = document.createElement("td");
    td1.textContent = stem.name;

    const td2 = document.createElement("td");
    td2.className = "size mono";
    td2.textContent = fmtSize(stem.size);

    const td3 = document.createElement("td");
    td3.append(driveAnchor(stem.id, "↓ .wav", "download " + stem.name));

    tr.append(td1, td2, td3);
    stemsBody.append(tr);
  });

  const zipBtn = document.getElementById("zip-all");
  const zipStatus = document.getElementById("zip-status");
  const stemsTotal = stems.reduce((sum, stem) => sum + (stem.size || 0), 0);
  zipStatus.textContent = `${stems.length} stems · ${fmtSize(stemsTotal)} — zip is built right in your browser`;

  async function buildStemsZip(onProgress) {
    const enc = new TextEncoder();
    const date = new Date();
    const time = (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
    const dt = (((date.getFullYear() - 1980) & 0x7f) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();

    const CRC_TABLE = (() => {
      const table = new Uint32Array(256);
      for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 8;
        table[n] = c >>> 0;
      }
      return table;
    })();

    function crcChunk(crc, bytes) {
      let c = ~crc;
      for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
      return ~c;
    }

    function zipLocalHeader(nameBytes, crc, size) {
      const buf = new Uint8Array(30 + nameBytes.length);
      const dv = new DataView(buf.buffer);
      dv.setUint32(0, 0x04034b50, true);
      dv.setUint16(4, 20, true);
      dv.setUint16(6, 0, true);
      dv.setUint16(8, 0, true);
      dv.setUint16(10, time, true);
      dv.setUint16(12, dt, true);
      dv.setUint32(14, crc >>> 0, true);
      dv.setUint32(18, size, true);
      dv.setUint32(22, size, true);
      dv.setUint16(26, nameBytes.length, true);
      dv.setUint16(28, 0, true);
      buf.set(nameBytes, 30);
      return buf;
    }

    function zipCentralEntry(nameBytes, crc, size, offset) {
      const buf = new Uint8Array(46 + nameBytes.length);
      const dv = new DataView(buf.buffer);
      dv.setUint32(0, 0x02014b50, true);
      dv.setUint16(4, 20, true);
      dv.setUint16(6, 20, true);
      dv.setUint16(8, 0, true);
      dv.setUint16(10, 0, true);
      dv.setUint16(12, time, true);
      dv.setUint16(14, dt, true);
      dv.setUint32(16, crc >>> 0, true);
      dv.setUint32(20, size, true);
      dv.setUint32(24, size, true);
      dv.setUint16(28, nameBytes.length, true);
      dv.setUint16(30, 0, true);
      dv.setUint16(32, 0, true);
      dv.setUint16(34, 0, true);
      dv.setUint16(36, 0, true);
      dv.setUint32(38, 0, true);
      dv.setUint32(42, offset, true);
      buf.set(nameBytes, 46);
      return buf;
    }

    function zipEOCD(count, cdSize, cdOffset) {
      const buf = new Uint8Array(22);
      const dv = new DataView(buf.buffer);
      dv.setUint32(0, 0x06054b50, true);
      dv.setUint16(4, 0, true);
      dv.setUint16(6, 0, true);
      dv.setUint16(8, count, true);
      dv.setUint16(10, count, true);
      dv.setUint32(12, cdSize, true);
      dv.setUint32(16, cdOffset, true);
      dv.setUint16(20, 0, true);
      return buf;
    }

    const parts = [];
    const central = [];
    let offset = 0;
    let fetched = 0;

    for (let i = 0; i < stems.length; i++) {
      const stem = stems[i];
      const res = await fetch(DRIVE(stem.id));
      const headerType = (res.headers.get("content-type") || "").toLowerCase();
      if (!res.ok || headerType.includes("text/html")) {
        throw new Error(`${stem.name}: HTTP ${res.status}`);
      }

      const nameBytes = enc.encode(stem.name);
      const localOffset = offset;
      const headerSlot = parts.length;
      parts.push(new Uint8Array(0));

      let crc = 0;
      let size = 0;

      if (res.body && res.body.getReader) {
        const reader = res.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          parts.push(value);
          crc = crcChunk(crc, value);
          size += value.length;
          fetched += value.length;
          onProgress(i, stem, fetched, stemsTotal);
        }
      } else {
        const value = new Uint8Array(await res.arrayBuffer());
        parts.push(value);
        crc = crcChunk(crc, value);
        size = value.length;
        fetched += size;
        onProgress(i, stem, fetched, stemsTotal);
      }

      parts[headerSlot] = zipLocalHeader(nameBytes, crc, size);
      offset = localOffset + 30 + nameBytes.length + size;
      central.push(zipCentralEntry(nameBytes, crc, size, localOffset));
    }

    const centralStart = offset;
    let centralSize = 0;
    for (const entry of central) {
      parts.push(entry);
      centralSize += entry.length;
    }

    parts.push(zipEOCD(central.length, centralSize, centralStart));
    return new Blob(parts, { type: "application/zip" });
  }

  zipBtn.addEventListener("click", async () => {
    if (zipBtn.disabled) return;
    zipBtn.disabled = true;
    const originalLabel = zipBtn.textContent;

    try {
      const blob = await buildStemsZip((i, stem, fetched, total) => {
        zipBtn.textContent = `↓ zipping ${i + 1}/${stems.length}…`;
        zipStatus.textContent = `fetching ${stem.name} — ${fmtSize(fetched)} / ${fmtSize(total)}`;
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Whispers_Stems.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);

      zipStatus.textContent = `done — Whispers_Stems.zip (${fmtSize(blob.size)})`;
      zipBtn.textContent = originalLabel;
    } catch (error) {
      console.error("zip build failed:", error);
      zipBtn.textContent = originalLabel;
      zipStatus.textContent = "";

      const msg = document.createTextNode("zip failed — grab stems individually below or use the ");
      const link = document.createElement("a");
      link.href = stemsDriveFolder;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "Drive folder ↗";
      zipStatus.append(msg, link);
    } finally {
      zipBtn.disabled = false;
    }
  });
}

if (setsBody) {
  liveSets.forEach((set) => {
    const tr = document.createElement("tr");
    if (set.main) tr.className = "set-main";

    const td1 = document.createElement("td");
    td1.textContent = set.name;
    if (set.main) {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = "main";
      td1.append(badge);
    }

    const td2 = document.createElement("td");
    td2.className = "size mono";
    td2.textContent = fmtSize(set.size);

    const td3 = document.createElement("td");
    td3.append(driveAnchor(set.id, "↓ .als", "download " + set.name));

    tr.append(td1, td2, td3);
    setsBody.append(tr);
  });
}

/* =============== user menu dropdown (shared) =============== */

(function initUserMenu() {
  const chip = document.getElementById("user-chip");
  const menu = document.getElementById("user-menu");
  if (!chip || !menu) return;

  chip.addEventListener("click", (event) => {
    if (event.target.closest("#signout-btn")) return;
    menu.classList.toggle("open");
  });
  document.addEventListener("click", (event) => {
    if (!chip.contains(event.target) && !menu.contains(event.target)) menu.classList.remove("open");
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") menu.classList.remove("open");
  });
})();

/* ---- init (page-aware) ---- */

rebuildViewTracks();
renderCommunityStats();
renderComments();
renderList();
updateAuthUI();
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

MusicAPI.onChange(() => {
  renderApiMode();
  refreshAllStats();
  refreshCurrentStats();
  loadComments();
  restoreAccount();
  refreshUnreadBadge();
});

MusicAPI.detect().then(({ mode }) => {
  renderApiMode();
  refreshAllStats();
  restoreAccount().then(() => {
    refreshCurrentStats();
    loadComments();
    refreshUnreadBadge();
  });
  console.info(`[music] storage mode: ${mode}${mode === "server" ? ` (${MusicAPI.base || "same origin"})` : " (localStorage fallback)"}`);
});

/* ================= maintenance banner ================= */
/* Polls /api/maintenance; when enabled it covers the page with a
   full-screen "we're improving things" banner. Staff (admins) get a
   dismiss button + a small corner ribbon instead. */

(function () {
  const ACK_KEY = "mm-maintenance-staff-ack";
  let overlay = null;
  let ribbon = null;
  let wasActive = false;

  function account() {
    try { return JSON.parse(localStorage.getItem("tm-music-account-v2") || "null"); }
    catch (_) { return null; }
  }

  function isStaff() {
    const acct = account();
    return Boolean(acct && acct.is_admin);
  }

  function ensureOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.className = "maintenance-overlay";
    overlay.setAttribute("role", "alertdialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.innerHTML = `
      <div class="maintenance-card">
        <div class="maintenance-pulse" aria-hidden="true"><span></span><span></span><span></span></div>
        <p class="maintenance-kicker">Scheduled improvements</p>
        <h2 class="maintenance-title"></h2>
        <p class="maintenance-eta mono"></p>
        <div class="maintenance-bar" aria-hidden="true"><i></i></div>
        <p class="maintenance-note">This page will reopen automatically when we're done.</p>
        <div class="maintenance-staff" hidden>
          <button type="button" class="btn small-btn maintenance-continue">I'm staff — continue anyway</button>
        </div>
      </div>`;
    overlay.querySelector(".maintenance-continue").addEventListener("click", () => {
      try { sessionStorage.setItem(ACK_KEY, overlay.dataset.updated || "1"); } catch (_) {}
      hide();
      checkRibbon(true);
    });
    document.body.append(overlay);
    return overlay;
  }

  function ensureRibbon() {
    if (ribbon) return ribbon;
    ribbon = document.createElement("a");
    ribbon.className = "maintenance-ribbon";
    ribbon.href = "/admin.html";
    ribbon.textContent = "Maintenance mode is ON";
    document.body.append(ribbon);
    return ribbon;
  }

  function hide() {
    if (overlay) overlay.remove();
    overlay = null;
  }

  function checkRibbon(forceHideOverlay) {
    if (ribbon) ribbon.remove();
    ribbon = null;
    if (!wasActive && !forceHideOverlay) return;
    let acked = null;
    try { acked = sessionStorage.getItem(ACK_KEY); } catch (_) {}
    if (isStaff() && acked) {
      ensureRibbon();
    }
  }

  async function check() {
    let data = null;
    try {
      const res = await fetch("/api/maintenance", { cache: "no-store" });
      if (res.ok) data = await res.json();
    } catch (_) { return; }
    if (!data || !data.enabled) {
      if (wasActive) {
        // maintenance just ended — drop the user back into the live site
        wasActive = false;
        location.reload();
        return;
      }
      hide();
      checkRibbon(false);
      return;
    }

    let acked = null;
    try { acked = sessionStorage.getItem(ACK_KEY); } catch (_) {}
    if (isStaff() && acked && acked === data.updated_at) {
      hide();
      checkRibbon(true);
      return;
    }

    wasActive = true;
    const el = ensureOverlay();
    el.dataset.updated = data.updated_at || "1";
    el.querySelector(".maintenance-title").textContent = data.message || "Hold on, our team is working on improving your experience!";
    el.querySelector(".maintenance-eta").textContent = data.eta ? `ETA: ${data.eta}` : "ETA: coming right up";
    el.querySelector(".maintenance-staff").hidden = !isStaff();
  }

  check();
  setInterval(check, 30000);
})();
