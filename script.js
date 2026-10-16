/* =============== EDIT YOUR MUSIC HERE =============== */

// Google Drive helper — paste a Drive file ID, get a direct-download URL.
const drive = (id) => `https://drive.google.com/uc?export=download&confirm=t&id=${id}`;

// "Download all stems (.zip)" — hosted as a GitHub Release asset on this repo.
const STEMS_ZIP_URL =
  "https://github.com/tomtom-cmd-alt/my-music/releases/latest/download/whispers-stems.zip";

// — player tracks (streamed from Drive) —
const tracks = [
  { title: "Whispers", file: drive("1DXiCsa3iUBdgh1jHcy80Y199uPAPmXiy"), note: "master" },
];

// — stems: per-stem direct downloads (full pack via the .zip button) —
const stems = [
  { name: "Whispers Bass.wav",           id: "19OKpuqGuI6Jrrh5CUGuI4Y2bBSOp7q_r", size: "93 MB" },
  { name: "Whispers Crash.wav",          id: "1ktt3SCUM6WaXHfQzlWXLhrLsPd2W0cTh", size: "93 MB" },
  { name: "Whispers Donk Bass.wav",      id: "1qE22QT46MgxgTKXYEGXI8T_Z48ZuzqhT", size: "93 MB" },
  { name: "Whispers Drop Bass Top.wav",  id: "1Ts1vOVFXjqgFbvr0GX9nWhs-bVtO0cDB", size: "93 MB" },
  { name: "Whispers Drums.wav",          id: "1ffb6izvXS8KOFcLJTm78d-M8iTYs5cKl", size: "93 MB" },
  { name: "Whispers FX.wav",             id: "1GdohHjQfnTCflSVMZKRVVrNDFtue3rzh", size: "93 MB" },
  { name: "Whispers Impacts_Risers.wav", id: "1AmPh0_JhMBwnOGYBsmNHw6lQ5xeUc0g8", size: "93 MB" },
  { name: "Whispers Kick.wav",           id: "1WhrSvKwITXYS2fd3vTsZzGJzX-xYqdDE", size: "93 MB" },
  { name: "Whispers Lead-1.wav",         id: "1uwm1ez3yjRoTCTgxbyltNnejoun2RGpm", size: "93 MB" },
  { name: "Whispers Lead.wav",           id: "1zGp8RCjfMmms-EAh3n7wzHxuSz7aTiu8", size: "93 MB" },
  { name: "Whispers Leads.wav",          id: "1dbpEYreicpPecgy3kQGzE66tHqXVwsdi", size: "93 MB" },
  { name: "Whispers Reece Bass.wav",     id: "12zrNxW12hkx1bTTIQ25GR6rMEE9Pxq8H", size: "93 MB" },
  { name: "Whispers Tops.wav",           id: "1h3RBtoCEQRv4Nq_rqe0QF7ESZTtaCe4D", size: "93 MB" },
  { name: "Whispers Vocals.wav",         id: "1Cbjm9k2JOCvX-oIw7BNZbclP6is_fdTC", size: "93 MB" },
  { name: "Whispers Vocals-1.wav",       id: "164Wi1MeDvsY4b53TbSMx5okp9ODaFbB7", size: "93 MB" },
  { name: "Whispers Vocals-2.wav",       id: "1bBpgtPiShVvptUW4EOB1CzhDapr29-I1", size: "93 MB" },
];

// — Ableton Live Sets (.als) —
const liveSets = [
  { name: "Whispers", id: "1EjwPdfksk_h9KIbxSG-7xJ2hlZTIq_uU", note: "current version" },
];

// — older auto-saved versions (rollback / archaeology) —
const setBackups = [
  { name: "Whispers [2026-10-15 202437].als", id: "1SMU_g8_79c2Cc4Toq1hj3tKd2_bpm235" },
  { name: "Whispers [2026-10-16 115808].als", id: "1SLH49tfKtrVAjsjfjJE4yjhqChwLeTVs" },
  { name: "Whispers [2026-10-16 115836].als", id: "1uT-BhLLQ7EgkhU9o8K1GayRkgHkx-b9c" },
  { name: "Whispers [2026-10-16 115901].als", id: "1mjwSZUUgZnobORlRcLRs_zzTtscJ3y-f" },
  { name: "Whispers [2026-10-16 115930].als", id: "1mI5Gkekgv4gZQ1BnES__K3pYwgQM-oWG" },
  { name: "Whispers [2026-10-16 120424].als", id: "1PZvI2ZFq-sVnVOIx7gcuwrH5BQFWiwbA" },
  { name: "Whispers [2026-10-16 120910].als", id: "1cI0gHg2AeHrBwouz-uyFPRAHezFcPfSl" },
  { name: "Whispers [2026-10-16 121401].als", id: "1SRb1qIU9tGgApfLqcElVAO-0RUxTGj3F" },
  { name: "Whispers [2026-10-16 121814].als", id: "1AsYW2Fs2nbpDqh0t-3oa52khyoNLxpOL" },
  { name: "Whispers [2026-10-16 122157].als", id: "1amTrIz5_kv33v708lI6FmccQTI-U4rz9" },
];

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
const zipCta   = document.getElementById("zip-cta");

let index = -1;

function fmt(t) {
  if (!isFinite(t)) return "0:00";
  const m = Math.floor(t / 60), s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
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
    dl.addEventListener("click", e => e.stopPropagation());
    li.append(dl);

    li.addEventListener("click", () => loadTrack(i));
    list.append(li);
  });
}

/* — stems table — */
stems.forEach(s => {
  const tr = document.createElement("tr");
  const td1 = document.createElement("td");
  td1.className = "mono stem-name";
  td1.textContent = s.name;
  const td2 = document.createElement("td");
  td2.className = "note";
  td2.textContent = s.size;
  const td3 = document.createElement("td");
  const a = document.createElement("a");
  a.href = drive(s.id);
  a.download = "";
  a.textContent = "↓ wav";
  a.title = "download " + s.name;
  td3.append(a);
  tr.append(td1, td2, td3);
  stemsBody.append(tr);
});

/* — zip button — */
if (zipCta) {
  zipCta.href = STEMS_ZIP_URL;
  zipCta.setAttribute("download", "");
}

/* — live sets — */
function setRow(s, i, numbered) {
  const li = document.createElement("li");
  li.className = "set-row";

  if (numbered) {
    const num = document.createElement("span");
    num.className = "num";
    num.textContent = String(i + 1).padStart(2, "0");
    li.append(num);
  }

  const name = document.createElement("span");
  name.className = "set-name mono";
  name.textContent = s.name;
  li.append(name);

  if (s.note) {
    const note = document.createElement("span");
    note.className = "note";
    note.textContent = s.note;
    li.append(note);
  }

  const a = document.createElement("a");
  a.className = "btn-dl";
  a.href = drive(s.id);
  a.download = "";
  a.textContent = "↓ .als";
  a.title = "download " + s.name;
  li.append(a);

  return li;
}

const setsList = document.getElementById("sets-list");
liveSets.forEach((s, i) => setsList.append(setRow(s, i, true)));

const backupsList = document.getElementById("set-backups");
if (backupsList) setBackups.forEach((s, i) => backupsList.append(setRow(s, i, false)));

/* — player wiring — */
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
  if (tracks[index]) npTitle.textContent = tracks[index].title + " — couldn't load (file missing?)";
});

seek.addEventListener("input", () => {
  if (audio.duration) audio.currentTime = (seek.value / 1000) * audio.duration;
});
vol.addEventListener("input", () => { audio.volume = vol.value / 100; });

renderList();
document.getElementById("year").textContent = new Date().getFullYear();
