document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".main-nav a");

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.forEach((item) => item.classList.remove("active"));
      link.classList.add("active");
    });
  });
});

/* =============== EDIT YOUR MUSIC HERE =============== */
// Google Drive direct-download endpoint (works for publicly shared files)
const DRIVE = (id) =>
  `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`;

// Ready-made full stems pack — hosted as a GitHub Release asset on this repo.
// (Built from the Drive folder; browsers can't fetch+zip Drive files directly
// because Google Drive sends no CORS headers, so we serve the zip instead.)
const STEMS_ZIP_URL =
  "https://github.com/tomtom-cmd-alt/my-music/releases/latest/download/whispers-stems.zip";

// Tracks — streamed from Google Drive
const tracks = [
  {
    title: "Whispers",
    file: DRIVE("1DXiCsa3iUBdgh1jHcy80Y199uPAPmXiy"),
    note: "single — out now",
  },
];

// Stems — shown in the #stems table + bundled by the "download all" zip button
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
  { name: "Whispers Vocals.wav", id: "1Cbjm9k2JOCvX-oIw7BNZbclP6is_fdTC", size: 93252680 },
];

// Ableton Live Sets — main set first, then every auto-save backup
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
  { name: "Whispers [2026-10-16 122157].als", id: "1amTrIz5_kv33v708lI6FmccQTI-U4rz9", size: 132825 },
];

// Fallback link shown if the browser zip fails (also where new stems get dropped)
const stemsDriveFolder =
  "https://drive.google.com/drive/folders/1gfPI2GZnWvpsMAediP_zaGx_Oy4JrJnH";
/* ==================================================== */

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

let index = -1;

function fmt(t) {
  if (!isFinite(t)) return "0:00";
  const m = Math.floor(t / 60), s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function fmtSize(b) {
  if (b == null) return "—";
  if (b >= 1073741824) return (b / 1073741824).toFixed(2) + " GB";
  if (b >= 1048576) return (b / 1048576).toFixed(1) + " MB";
  if (b >= 1024) return (b / 1024).toFixed(0) + " KB";
  return b + " B";
}

function driveAnchor(id, label, title) {
  const a = document.createElement("a");
  a.href = DRIVE(id);
  a.textContent = label;
  a.title = title;
  a.rel = "noreferrer";
  return a;
}

function loadTrack(i, autoplay = true) {
  index = (i + tracks.length) % tracks.length;
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
    dl.href = t.file;
    dl.download = "";
    dl.textContent = "↓";
    dl.title = "download";
    dl.addEventListener("click", (e) => e.stopPropagation());
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
  if (tracks[index]) npTitle.textContent = tracks[index].title + " — couldn't load (file missing?)";
});

seek.addEventListener("input", () => {
  if (audio.duration) audio.currentTime = (seek.value / 1000) * audio.duration;
});

vol.addEventListener("input", () => {
  audio.volume = vol.value / 100;
});

stems.forEach((s) => {
  const tr = document.createElement("tr");

  const td1 = document.createElement("td");
  td1.textContent = s.name;

  const td2 = document.createElement("td");
  td2.className = "size mono";
  td2.textContent = fmtSize(s.size);

  const td3 = document.createElement("td");
  td3.append(driveAnchor(s.id, "↓ .wav", "download " + s.name));

  tr.append(td1, td2, td3);
  stemsBody.append(tr);
});

/* ---------- ableton live sets table ---------- */
liveSets.forEach((s) => {
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

  const td2 = document.createElement("td");
  td2.className = "size mono";
  td2.textContent = fmtSize(s.size);

  const td3 = document.createElement("td");
  td3.append(driveAnchor(s.id, "↓ .als", "download " + s.name));

  tr.append(td1, td2, td3);
  setsBody.append(tr);
});

/* ---------- "download all stems" -> one-click download of the ready-made zip ---------- */
const zipBtn = document.getElementById("zip-all");
const zipStatus = document.getElementById("zip-status");
const stemsTotal = stems.reduce((n, s) => n + (s.size || 0), 0);
zipStatus.textContent = `16 stems · ${fmtSize(
  stemsTotal
)} — ready-made zip hosted on GitHub Releases`;

zipBtn.addEventListener("click", () => {
  const a = document.createElement("a");
  a.href = STEMS_ZIP_URL;
  a.download = "whispers-stems.zip";
  a.rel = "noopener";
  document.body.append(a);
  a.click();
  a.remove();
  zipStatus.textContent = `downloading whispers-stems.zip (${fmtSize(stemsTotal)}) — check your downloads bar`;
});


renderList();
document.getElementById("year").textContent = new Date().getFullYear();
