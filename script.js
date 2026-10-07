/* =============== EDIT YOUR MUSIC HERE =============== */
const tracks = [
  { title: "First Track",  file: "./demo.mp3",  note: "demo — replace me" },
  { title: "Second Track", file: "music/second-track.mp3", note: "" },
];

const stems = [
  { song: "First Track", file: "stems/first-track.zip", size: "—" },
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

stems.forEach(s => {
  const tr = document.createElement("tr");
  const td1 = document.createElement("td"); td1.textContent = s.song;
  const td2 = document.createElement("td");
  const a = document.createElement("a");
  a.href = s.file; a.download = ""; a.textContent = "download .zip";
  td2.append(a);
  const td3 = document.createElement("td"); td3.textContent = s.size;
  tr.append(td1, td2, td3);
  stemsBody.append(tr);
});

renderList();
document.getElementById("year").textContent = new Date().getFullYear();
