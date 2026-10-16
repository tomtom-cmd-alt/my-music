/* =============== EDIT YOUR MUSIC HERE =============== */
// Google Drive direct-download endpoint (works for publicly shared files)
const DRIVE = (id) => `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`;

// Tracks — `file` = streaming source (self-hosted on this site: reliable,
//          range requests for seeking, no Drive quota/cookie issues).
//          `dl`  = download link (the Google Drive original).
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
  { title: "Solar Synth", file: "audio/Thomas Miller - Solar Synth.mp3" },
];

// Stems — shown in the #stems table + bundled by the "download all" zip button
const stems = [
  { name: "Whispers Bass.wav",          id: "19OKpuqGuI6Jrrh5CUGuI4Y2bBSOp7q_r", size: 93252680 },
  { name: "Whispers Crash.wav",         id: "1ktt3SCUM6WaXHfQzlWXLhrLsPd2W0cTh", size: 93252680 },
  { name: "Whispers Donk Bass.wav",     id: "1qE22QT46MgxgTKXYEGXI8T_Z48ZuzqhT", size: 93252680 },
  { name: "Whispers Drop Bass Top.wav", id: "1Ts1vOVFXjqgFbvr0GX9nWhs-bVtO0cDB", size: 93252680 },
  { name: "Whispers Drums.wav",         id: "1ffb6izvXS8KOFcLJTm78d-M8iTYs5cKl", size: 93252680 },
  { name: "Whispers FX.wav",            id: "1GdohHjQfnTCflSVMZKRVVrNDFtue3rzh", size: 93252680 },
  { name: "Whispers Impacts_Risers.wav",id: "1AmPh0_JhMBwnOGYBsmNHw6lQ5xeUc0g8", size: 93252680 },
  { name: "Whispers Kick.wav",          id: "1WhrSvKwITXYS2fd3vTsZzGJzX-xYqdDE", size: 93252680 },
  { name: "Whispers Lead-1.wav",        id: "1uwm1ez3yjRoTCTgxbyltNnejoun2RGpm", size: 93252680 },
  { name: "Whispers Lead.wav",          id: "1zGp8RCjfMmms-EAh3n7wzHxuSz7aTiu8", size: 93252680 },
  { name: "Whispers Leads.wav",         id: "1dbpEYreicpPecgy3kQGzE66tHqXVwsdi", size: 93252680 },
  { name: "Whispers Reece Bass.wav",    id: "12zrNxW12hkx1bTTIQ25GR6rMEE9Pxq8H", size: 93252680 },
  { name: "Whispers Tops.wav",          id: "1h3RBtoCEQRv4Nq_rqe0QF7ESZTtaCe4D", size: 93252680 },
  { name: "Whispers Vocals-1.wav",      id: "164Wi1MeDvsY4b53TbSMx5okp9ODaFbB7", size: 93252680 },
  { name: "Whispers Vocals-2.wav",      id: "1bBpgtPiShVvptUW4EOB1CzhDapr29-I1", size: 93252680 },
  { name: "Whispers Vocals.wav",        id: "1Cbjm9k2JOCvX-oIw7BNZbclP6is_fdTC", size: 93252680 },
];

// Ableton Live Sets — main set first, then every auto-save backup
const liveSets = [
  { name: "Whispers.als",                   id: "1EjwPdfksk_h9KIbxSG-7xJ2hlZTIq_uU", size: 132828, main: true },
  { name: "Whispers [2026-10-15 202437].als", id: "1SMU_g8_79c2Cc4Toq1hj3tKd2_bpm235", size: 113655 },
  { name: "Whispers [2026-10-16 115808].als", id: "1SLH49tfKtrVAjsjfjJE4yjhqChwLeTVs", size: 113629 },
  { name: "Whispers [2026-10-16 115836].als", id: "1uT-BhLLQ7EgkhU9o8K1GayRkgHkx-b9c", size: 113012 },
  { name: "Whispers [2026-10-16 115901].als", id: "1mjwSZUUgZnobORlRcLRs_zzTtscJ3y-f", size: 113975 },
  { name: "Whispers [2026-10-16 115930].als", id: "1mI5Gkekgv4gZQ1BnES__K3pYwgQM-oWG", size: 115063 },
  { name: "Whispers [2026-10-16 120424].als", id: "1PZvI2ZFq-sVnVOIx7gcuwrH5BQFWiwbA", size: 115108 },
  { name: "Whispers [2026-10-16 120910].als", id: "1cI0gHg2AeHrBwouz-uyFPRAHezFcPfSl", size: 120915 },
  { name: "Whispers [2026-10-16 121401].als", id: "1SRb1qIU9tGgApfLqcElVAO-0RUxTGj3F", size: 120951 },
  { name: "Whispers [2026-10-16 121814].als", id: "1AsYW2Fs2nbpDqh0t-3oa52khyoNLxpOL", size: 128532 },
  { name: "Whispers [2026-10-16 122157].als", id: "1amTrIz5_kv33v708lI6FmccQTI-U4rz9", size: 132825 },
];

// Fallback link shown if the browser zip fails (also where new stems get dropped)
const stemsDriveFolder = "https://drive.google.com/drive/folders/1gfPI2GZnWvpsMAediP_zaGx_Oy4JrJnH";
/* ==================================================== */

const audio    = document.getElementById("audio");
const playBtn  = document.getElementById("play");
const prevBtn  = document.getElementById("prev");
const nextBtn  = document.getElementById("next");
const seek     = document.getElementById("seek");
const vol      = document.getElementById("volume");
const npTitle  = document.getElementById("np-title");
const npTime   = document.getElementById("np-time");
const list     = document.getElementById("tracklist");
const stemsBody = document.getElementById("stems-body");
const setsBody  = document.getElementById("sets-body");

let index = -1;

function fmt(t) {
  if (!isFinite(t)) return "0:00";
  const m = Math.floor(t / 60), s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function fmtSize(b) {
  if (b == null) return "—";
  if (b >= 1073741824) return (b / 1073741824).toFixed(2) + " GB";
  if (b >= 1048576)    return (b / 1048576).toFixed(1) + " MB";
  if (b >= 1024)       return (b / 1024).toFixed(0) + " KB";
  return b + " B";
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
  audio.src = tracks[index].file;
  npTitle.textContent = tracks[index].title;
  renderList();
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
    dl.addEventListener("click", e => e.stopPropagation());
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

audio.addEventListener("play",  () => { playBtn.textContent = "⏸"; renderList(); });
audio.addEventListener("pause", () => { playBtn.textContent = "▶";  renderList(); });
audio.addEventListener("ended", () => loadTrack(index + 1));
audio.addEventListener("loadedmetadata", () => {
  npTime.textContent = `0:00 / ${fmt(audio.duration)}`;
});
audio.addEventListener("timeupdate", () => {
  npTime.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
  if (audio.duration) seek.value = (audio.currentTime / audio.duration) * 1000;
});
audio.addEventListener("error", () => {
  const t = tracks[index];
  if (t && !usedFallbackSrc) {
    // self-hosted copy failed — try the Drive original before giving up
    usedFallbackSrc = true;
    audio.src = t.dl || t.file;
    audio.play().catch(() => {});
    return;
  }
  if (t) npTitle.textContent = t.title + " — couldn't load (file missing?)";
});

seek.addEventListener("input", () => {
  if (audio.duration) audio.currentTime = (seek.value / 1000) * audio.duration;
});
vol.addEventListener("input", () => { audio.volume = vol.value / 100; });

/* ---------- stems table ---------- */
stems.forEach(s => {
  const tr = document.createElement("tr");
  const td1 = document.createElement("td"); td1.textContent = s.name;
  const td2 = document.createElement("td"); td2.className = "size mono"; td2.textContent = fmtSize(s.size);
  const td3 = document.createElement("td");
  td3.append(driveAnchor(s.id, "↓ .wav", "download " + s.name));
  tr.append(td1, td2, td3);
  stemsBody.append(tr);
});

/* ---------- ableton live sets table ---------- */
liveSets.forEach(s => {
  const tr = document.createElement("tr");
  if (s.main) tr.className = "set-main";
  const td1 = document.createElement("td");
  td1.textContent = s.name;
  if (s.main) {
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = "main";
    td1.append(badge);
  }
  const td2 = document.createElement("td"); td2.className = "size mono"; td2.textContent = fmtSize(s.size);
  const td3 = document.createElement("td");
  td3.append(driveAnchor(s.id, "↓ .als", "download " + s.name));
  tr.append(td1, td2, td3);
  setsBody.append(tr);
});

/* ==== zip-writer:start ==== */
// Minimal streaming .zip builder (STORE method) — no external libraries.
// Files are fetched one-by-one and appended to a Blob, so even large
// stem packs don't need to fit in memory all at once.
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crcChunk(crc, u8) {
  let c = ~crc;
  for (let i = 0; i < u8.length; i++) c = CRC_TABLE[(c ^ u8[i]) & 0xff] ^ (c >>> 8);
  return ~c;
}

function dosDateTime() {
  const d = new Date();
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
  const date = (((d.getFullYear() - 1980) & 0x7f) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  return { time, date };
}

function zipLocalHeader(nameBytes, crc, size, time, date) {
  const buf = new Uint8Array(30 + nameBytes.length);
  const dv = new DataView(buf.buffer);
  dv.setUint32(0, 0x04034b50, true);
  dv.setUint16(4, 20, true);          // version needed
  dv.setUint16(6, 0, true);           // flags
  dv.setUint16(8, 0, true);           // method: store
  dv.setUint16(10, time, true);
  dv.setUint16(12, date, true);
  dv.setUint32(14, crc, true);
  dv.setUint32(18, size, true);       // compressed size
  dv.setUint32(22, size, true);       // uncompressed size
  dv.setUint16(26, nameBytes.length, true);
  dv.setUint16(28, 0, true);          // extra length
  buf.set(nameBytes, 30);
  return buf;
}

function zipCentralEntry(nameBytes, crc, size, offset, time, date) {
  const buf = new Uint8Array(46 + nameBytes.length);
  const dv = new DataView(buf.buffer);
  dv.setUint32(0, 0x02014b50, true);
  dv.setUint16(4, 20, true);          // version made by
  dv.setUint16(6, 20, true);          // version needed
  dv.setUint16(8, 0, true);           // flags
  dv.setUint16(10, 0, true);          // method
  dv.setUint16(12, time, true);
  dv.setUint16(14, date, true);
  dv.setUint32(16, crc, true);
  dv.setUint32(20, size, true);
  dv.setUint32(24, size, true);
  dv.setUint16(28, nameBytes.length, true);
  dv.setUint16(30, 0, true);          // extra length
  dv.setUint16(32, 0, true);          // comment length
  dv.setUint16(34, 0, true);          // disk number
  dv.setUint16(36, 0, true);          // internal attrs
  dv.setUint32(38, 0, true);          // external attrs
  dv.setUint32(42, offset, true);     // local header offset
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
/* ==== zip-writer:end ==== */

/* ---------- "download all stems" -> builds Whispers_Stems.zip in the browser ---------- */
const zipBtn = document.getElementById("zip-all");
const zipStatus = document.getElementById("zip-status");
const stemsTotal = stems.reduce((n, s) => n + (s.size || 0), 0);
zipStatus.textContent = `${stems.length} stems · ${fmtSize(stemsTotal)} — zip is built right in your browser`;

async function buildStemsZip(onProgress) {
  const enc = new TextEncoder();
  const { time, date } = dosDateTime();
  const parts = [];
  const central = [];
  let offset = 0;
  let fetched = 0;

  for (let i = 0; i < stems.length; i++) {
    const s = stems[i];
    const res = await fetch(DRIVE(s.id));
    const ctype = (res.headers.get("content-type") || "").toLowerCase();
    if (!res.ok || ctype.includes("text/html")) {
      throw new Error(`${s.name}: HTTP ${res.status}`);
    }

    const nameBytes = enc.encode(s.name);
    const localOffset = offset;
    const headerSlot = parts.length;
    parts.push(new Uint8Array(0)); // placeholder — patched after streaming

    let crc = 0, size = 0;
    if (res.body && res.body.getReader) {
      const reader = res.body.getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        parts.push(value);
        crc = crcChunk(crc, value);
        size += value.length;
        fetched += value.length;
        onProgress(i, s, fetched, stemsTotal);
      }
    } else {
      const value = new Uint8Array(await res.arrayBuffer());
      parts.push(value);
      crc = crcChunk(crc, value);
      size = value.length;
      fetched += size;
      onProgress(i, s, fetched, stemsTotal);
    }

    parts[headerSlot] = zipLocalHeader(nameBytes, crc >>> 0, size, time, date);
    offset = localOffset + 30 + nameBytes.length + size;
    central.push(zipCentralEntry(nameBytes, crc >>> 0, size, localOffset, time, date));
  }

  const cdStart = offset;
  let cdSize = 0;
  for (const e of central) { parts.push(e); cdSize += e.length; }
  parts.push(zipEOCD(central.length, cdSize, cdStart));

  return new Blob(parts, { type: "application/zip" });
}

zipBtn.addEventListener("click", async () => {
  if (zipBtn.disabled) return;
  zipBtn.disabled = true;
  const originalLabel = zipBtn.textContent;
  try {
    const blob = await buildStemsZip((i, s, fetched, total) => {
      zipBtn.textContent = `↓ zipping ${i + 1}/${stems.length}…`;
      zipStatus.textContent = `fetching ${s.name} — ${fmtSize(fetched)} / ${fmtSize(total)}`;
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Whispers_Stems.zip";
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    zipStatus.textContent = `done — Whispers_Stems.zip (${fmtSize(blob.size)})`;
    zipBtn.textContent = originalLabel;
  } catch (err) {
    console.error("zip build failed:", err);
    zipBtn.textContent = originalLabel;
    zipStatus.textContent = "";
    const msg = document.createTextNode("zip failed — grab stems individually below or open the ");
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

renderList();
document.getElementById("year").textContent = new Date().getFullYear();
