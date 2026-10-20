/* =============== EDIT YOUR MUSIC HERE =============== */
// Google Drive direct-download endpoint (works for publicly shared files)
const DRIVE = (id) => `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`;

const tracks = [
  { title: "Whispers", file: "audio/Whispers.mp3", dl: DRIVE("1DXiCsa3iUBdgh1jHcy80Y199uPAPmXiy"), note: "single — out now" },
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

const audio = document.getElementById("audio");
const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const seek = document.getElementById("seek");
const vol = document.getElementById("volume");
const npTitle = document.getElementById("np-title");
const npTime = document.getElementById("np-time");
const list = document.getElementById("tracklist");
const stemsBody = document.getElementById("stems-body");
const setsBody = document.getElementById("sets-body");

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

const LIKED_STORAGE_KEY = "tm-music-likes-v1";
const LOCAL_DB_KEY = "tm-music-localdb-v2";
const SESSION_LISTEN_KEY = "tm-music-session-listen-v1";
const COMMENT_LIMIT = 20;

let index = -1;
let currentSong = "whispers";
let currentComments = [];
let allStats = {}; // song -> { listens, likes, comments }

/* ---- localStorage fallback (used only when no backend is reachable) ---- */

function readJson(key, fallback) {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "null");
    return raw && typeof raw === "object" ? raw : fallback;
  } catch (_) {
    return fallback;
  }
}

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
  return Boolean(getLikedMap()[song]);
}

function setLiked(song, value) {
  const map = getLikedMap();
  if (value) map[song] = true;
  else delete map[song];
  try { localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(map)); } catch (_) {}
}

function normalizeSongName(title) {
  return String(title || "whispers")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "whispers";
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}

function statsFor(song) {
  if (allStats[song]) return allStats[song];
  if (MusicAPI.mode === "local") return localGetSong(song);
  return { listens: 0, likes: 0, comments: 0 };
}

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
  const track = tracks[index] || tracks.find((t) => normalizeSongName(t.title) === currentSong);
  const stats = statsFor(currentSong);
  communitySong.textContent = track ? track.title : currentSong;
  commentSongEl.textContent = track ? track.title : currentSong;

  songListensEl.textContent = formatNumber(stats.listens);
  songLikesEl.textContent = formatNumber(stats.likes);
  songCommentsEl.textContent = formatNumber(Math.max(stats.comments, currentComments.length));

  const liked = isLiked(currentSong);
  likeBtn.setAttribute("aria-pressed", String(liked));
  likeBtn.textContent = liked ? "♥ Liked this track" : "♡ Like this track";
}

function renderComments() {
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

    const author = document.createElement("strong");
    author.textContent = comment.author || "Anonymous";

    const time = document.createElement("span");
    time.className = "comment-time";
    const date = new Date(comment.created_at || comment.createdAt || Date.now());
    time.textContent = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });

    meta.append(author, time);

    const text = document.createElement("p");
    text.textContent = comment.text;

    item.append(meta, text);
    commentList.append(item);
  });
}

/* ---- data refresh (server first, localStorage fallback) ---- */

async function refreshAllStats() {
  try {
    const data = await MusicAPI.all();
    allStats = {};
    data.songs.forEach((s) => {
      allStats[s.song] = { listens: s.listens, likes: s.likes, comments: s.comments };
    });
  } catch (_) {
    allStats = {};
  }
  renderCommunityStats();
  renderList();
}

async function refreshCurrentStats() {
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
  const song = currentSong;

  try {
    const data = await MusicAPI.comments(song, 50);
    if (song !== currentSong) return;
    currentComments = data.comments.map((c) => ({
      id: c.id,
      author: c.author,
      text: c.text,
      created_at: c.created_at
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
  } catch (_) {
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
    const data = await MusicAPI.like(song, wantLike);
    allStats[song] = { listens: data.listens, likes: data.likes, comments: data.comments };
  } catch (_) {
    const s = localLike(song, wantLike);
    allStats[song] = s;
  }
  renderCommunityStats();
  renderList();
}

likeBtn.addEventListener("click", () => {
  toggleLike();
});

commentForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const author = (commentName.value || "Anonymous").trim().slice(0, 24) || "Anonymous";
  const text = commentText.value.trim();
  const song = currentSong;

  if (!text) return;

  const submitBtn = commentForm.querySelector("button[type=submit]");
  submitBtn.disabled = true;

  let posted = false;

  try {
    const data = await MusicAPI.addComment({ song, author, text });
    if (data.comment && data.comment.status === "approved") {
      currentComments.unshift({
        id: data.comment.id,
        author: data.comment.author,
        text: data.comment.text,
        created_at: data.comment.created_at
      });
      posted = true;
    }
    allStats[song] = { listens: data.listens, likes: data.likes, comments: data.comments };
  } catch (_) {
    const localComment = {
      id: `comment-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      author,
      text,
      created_at: new Date().toISOString()
    };
    localAddComment(song, localComment);
    currentComments.unshift(localComment);
    posted = true;
  }

  submitBtn.disabled = false;
  commentForm.reset();

  if (posted) {
    renderComments();
    renderCommunityStats();
    renderList();
  }
});

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

function loadTrack(i, autoplay = true) {
  index = (i + tracks.length) % tracks.length;
  usedFallbackSrc = false;
  const nextTrack = tracks[index];
  currentSong = normalizeSongName(nextTrack.title);
  audio.src = nextTrack.file;
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
  list.innerHTML = "";
  tracks.forEach((t, i) => {
    const li = document.createElement("li");
    if (i === index) li.className = "active";

    const num = document.createElement("span");
    num.className = "num";
    num.textContent = i === index ? "▶" : String(i + 1).padStart(2, "0");

    const title = document.createElement("span");
    title.className = "title";
    title.textContent = t.title;
    li.append(num, title);

    if (t.note) {
      const note = document.createElement("span");
      note.className = "note";
      note.textContent = t.note;
      li.append(note);
    }

    const songKey = normalizeSongName(t.title);
    const s = allStats[songKey];
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
    dl.addEventListener("click", (event) => event.stopPropagation());
    li.append(dl);

    li.addEventListener("click", () => loadTrack(i));
    list.append(li);
  });
}

playBtn.addEventListener("click", () => {
  if (index === -1) return loadTrack(0);
  audio.paused ? audio.play() : audio.pause();
});

prevBtn.addEventListener("click", () => loadTrack(index - 1));
nextBtn.addEventListener("click", () => loadTrack(index + 1));

audio.addEventListener("play", () => {
  playBtn.textContent = "⏸";
  renderList();
  registerListen();
});

audio.addEventListener("pause", () => {
  playBtn.textContent = "▶";
  renderList();
});

audio.addEventListener("ended", () => loadTrack(index + 1));
audio.addEventListener("loadedmetadata", () => {
  npTime.textContent = `0:00 / ${fmt(audio.duration)}`;
});
audio.addEventListener("timeupdate", () => {
  npTime.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
  if (audio.duration) seek.value = (audio.currentTime / audio.duration) * 1000;
});

audio.addEventListener("error", () => {
  const track = tracks[index];
  if (track && !usedFallbackSrc) {
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
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
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

/* ---- init ---- */

renderCommunityStats();
renderComments();
renderList();
document.getElementById("year").textContent = new Date().getFullYear();

MusicAPI.onChange(() => {
  renderApiMode();
  refreshAllStats();
  refreshCurrentStats();
  loadComments();
});

MusicAPI.detect().then(({ mode }) => {
  renderApiMode();
  refreshAllStats();
  refreshCurrentStats();
  loadComments();
  console.info(`[music] storage mode: ${mode}${mode === "server" ? ` (${MusicAPI.base || "same origin"})` : " (localStorage fallback)"}`);
});
