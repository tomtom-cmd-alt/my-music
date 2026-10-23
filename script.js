/* =============== EDIT YOUR MUSIC HERE =============== */
// Google Drive direct-download endpoint (works for publicly shared files)
const DRIVE = (id) => `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`;

const tracks = [
  { title: "Whispers", file: "audio/Whispers.mp3", dl: DRIVE("1DXiCsa3iUBdgh1jHcy80Y199uPAPmXiy"), note: "single — out now" },
  { title: "When I Think About You", file: "audio/When I Think About You.mp3" },
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
