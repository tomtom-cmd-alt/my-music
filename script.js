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

const communityStats = {
  listens: document.getElementById("global-listens"),
  likes: document.getElementById("global-likes"),
  comments: document.getElementById("global-comments")
};

const likeBtn = document.getElementById("like-btn");
const commentForm = document.getElementById("comment-form");
const commentName = document.getElementById("comment-name");
const commentText = document.getElementById("comment-text");
const commentList = document.getElementById("comment-list");

const COMMUNITY_STORAGE_KEY = "tm-music-community-v1";
const SESSION_LISTEN_KEY = "tm-music-session-listen-v1";
const COMMENT_LIMIT = 12;

let index = -1;
let currentSong = "whispers";
let likedByCurrentUser = false;

const DEFAULT_COMMUNITY = {
  listens: 10,
  likes: 7,
  comments: [
    { id: "seed-1", author: "Ari", text: "The atmosphere on this is unreal.", createdAt: "2026-10-18T18:45:00.000Z" },
    { id: "seed-2", author: "Mila", text: "Love the textures and mood here.", createdAt: "2026-10-19T08:15:00.000Z" }
  ],
  likedByCurrentUser: false
};

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

function getCommunityState() {
  try {
    const raw = JSON.parse(localStorage.getItem(COMMUNITY_STORAGE_KEY) || "null");
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_COMMUNITY));

    return {
      listens: Number(raw.listens) || DEFAULT_COMMUNITY.listens,
      likes: Number(raw.likes) || DEFAULT_COMMUNITY.likes,
      comments: Array.isArray(raw.comments) && raw.comments.length ? raw.comments : DEFAULT_COMMUNITY.comments,
      likedByCurrentUser: Boolean(raw.likedByCurrentUser)
    };
  } catch (error) {
    return JSON.parse(JSON.stringify(DEFAULT_COMMUNITY));
  }
}

let communityState = getCommunityState();

function persistCommunityState() {
  localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(communityState));
}

function renderCommunityStats() {
  communityStats.listens.textContent = formatNumber(communityState.listens);
  communityStats.likes.textContent = formatNumber(communityState.likes);
  communityStats.comments.textContent = formatNumber(communityState.comments.length);

  likeBtn.setAttribute("aria-pressed", String(communityState.likedByCurrentUser));
  likeBtn.textContent = communityState.likedByCurrentUser ? "♥ Liked" : "♡ Like this project";
}

function renderComments() {
  commentList.innerHTML = "";

  if (!communityState.comments.length) {
    const empty = document.createElement("li");
    empty.className = "comment-empty";
    empty.textContent = "No comments yet — be the first to leave one.";
    commentList.append(empty);
    return;
  }

  communityState.comments.slice(0, COMMENT_LIMIT).forEach((comment) => {
    const item = document.createElement("li");
    item.className = "comment-item";

    const meta = document.createElement("div");
    meta.className = "comment-meta";

    const author = document.createElement("strong");
    author.textContent = comment.author || "Anonymous";

    const time = document.createElement("span");
    time.className = "comment-time";
    const date = new Date(comment.createdAt || Date.now());
    time.textContent = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });

    meta.append(author, time);

    const text = document.createElement("p");
    text.textContent = comment.text;

    item.append(meta, text);
    commentList.append(item);
  });
}

async function loadStatsFromDb() {
  const song = currentSong;

  try {
    const res = await fetch(`/api/stats?song=${encodeURIComponent(song)}`);
    if (!res.ok) throw new Error("stats request failed");
    const data = await res.json();

    communityState.listens = Number(data.listens || 0);
    communityState.likes = Number(data.likes || 0);
    renderCommunityStats();
  } catch (error) {
    console.warn("Falling back to local stats", error);
    renderCommunityStats();
  }
}

async function registerListen() {
  const song = currentSong;
  const alreadyLogged = sessionStorage.getItem(`${SESSION_LISTEN_KEY}:${song}`);
  if (alreadyLogged) return;
  sessionStorage.setItem(`${SESSION_LISTEN_KEY}:${song}`, "1");

  try {
    const res = await fetch("/api/listen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ song })
    });

    if (!res.ok) throw new Error("listen request failed");
    const data = await res.json();
    communityState.listens = Number(data.listens || 0);
    renderCommunityStats();
  } catch (error) {
    console.warn("Listen could not be saved to the database", error);
    communityState.listens += 1;
    persistCommunityState();
    renderCommunityStats();
  }
}

async function toggleLike() {
  if (communityState.likedByCurrentUser) {
    communityState.likedByCurrentUser = false;
    renderCommunityStats();
    return;
  }

  communityState.likedByCurrentUser = true;

  try {
    const res = await fetch("/api/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ song: currentSong })
    });

    if (!res.ok) throw new Error("like request failed");
    const data = await res.json();
    communityState.likes = Number(data.likes || 0);
  } catch (error) {
    console.warn("Like could not be saved to the database", error);
    communityState.likes += 1;
  }

  persistCommunityState();
  renderCommunityStats();
}

likeBtn.addEventListener("click", () => {
  toggleLike();
});

commentForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const author = (commentName.value || "Anonymous").trim().slice(0, 24) || "Anonymous";
  const text = commentText.value.trim();

  if (!text) return;

  const newComment = {
    id: `comment-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    author,
    text,
    createdAt: new Date().toISOString()
  };

  communityState.comments.unshift(newComment);
  communityState.comments = communityState.comments.slice(0, 30);
  persistCommunityState();
  renderComments();
  renderCommunityStats();
  commentForm.reset();
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
  renderList();
  loadStatsFromDb();
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

renderCommunityStats();
renderComments();
loadStatsFromDb();
renderList();
document.getElementById("year").textContent = new Date().getFullYear();
