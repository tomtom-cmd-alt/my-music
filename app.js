// Configuration
const CONFIG = {
  musicFolder: 'music',
  stemsFolder: 'stems'
};

// Supported audio formats
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.flac', '.ogg', '.m4a'];

// Initialize app on page load
document.addEventListener('DOMContentLoaded', () => {
  loadTracks();
});

/**
 * Load tracks from music and stems folders
 */
async function loadTracks() {
  try {
    // Load music tracks
    const musicTracks = await fetchTracksFromFolder(CONFIG.musicFolder);
    displayTracks(musicTracks, 'musicGrid', '🎶');

    // Load stems
    const stemTracks = await fetchTracksFromFolder(CONFIG.stemsFolder);
    displayTracks(stemTracks, 'stemsGrid', '🎚️');
  } catch (error) {
    console.error('Error loading tracks:', error);
  }
}

/**
 * Fetch audio files from a folder (GitHub API or local file system)
 */
async function fetchTracksFromFolder(folderPath) {
  const tracks = [];

  try {
    // Try to fetch from GitHub API if this is a GitHub Pages site
    const owner = getGitHubRepoOwner();
    const repo = getGitHubRepoName();

    if (owner && repo) {
      const githubTracks = await fetchFromGitHub(owner, repo, folderPath);
      return githubTracks;
    }
  } catch (error) {
    console.log(`Could not fetch from GitHub API: ${error.message}`);
  }

  // Fallback: Try to fetch from local folder
  try {
    const response = await fetch(`${folderPath}/`);
    if (response.ok) {
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Extract file links from directory listing
      const links = doc.querySelectorAll('a[href]');
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (isAudioFile(href) && !href.startsWith('?')) {
          tracks.push({
            name: decodeURIComponent(href),
            path: `${folderPath}/${href}`,
            size: null
          });
        }
      });
    }
  } catch (error) {
    console.log(`Could not fetch local folder ${folderPath}: ${error.message}`);
  }

  return tracks;
}

/**
 * Fetch tracks from GitHub API
 */
async function fetchFromGitHub(owner, repo, folderPath) {
  const tracks = [];
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}`;

  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`GitHub folder not found: ${folderPath}`);
        return [];
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const files = await response.json();

    if (Array.isArray(files)) {
      files.forEach(file => {
        if (isAudioFile(file.name)) {
          tracks.push({
            name: file.name,
            path: file.download_url,
            size: file.size
          });
        }
      });
    }

    return tracks.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error(`Error fetching from GitHub: ${error.message}`);
    return [];
  }
}

/**
 * Check if a file is an audio file
 */
function isAudioFile(filename) {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return AUDIO_EXTENSIONS.includes(ext);
}

/**
 * Display tracks in the grid
 */
function displayTracks(tracks, gridId, icon) {
  const grid = document.getElementById(gridId);

  if (!tracks || tracks.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <p>No ${gridId === 'musicGrid' ? 'tracks' : 'stems'} found yet. 
        Add your audio files to the <code>${gridId === 'musicGrid' ? 'music' : 'stems'}/</code> folder.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = '';

  tracks.forEach((track, index) => {
    const card = createTrackCard(track, icon, index);
    grid.appendChild(card);
  });
}

/**
 * Create a track card element
 */
function createTrackCard(track, icon, index) {
  const card = document.createElement('div');
  card.className = 'track-card';
  card.innerHTML = `
    <div class="track-icon">${icon}</div>
    <h3 class="track-title" title="${track.name}">${formatTrackName(track.name)}</h3>
    <div class="track-info">${formatFileSize(track.size)}</div>
    <audio class="audio-player" controls>
      <source src="${track.path}" type="${getAudioMimeType(track.name)}">
      Your browser does not support the audio element.
    </audio>
    <a href="${track.path}" download="${track.name}" class="download-btn">
      ⬇️ Download
    </a>
  `;
  return card;
}

/**
 * Format track name by removing file extension
 */
function formatTrackName(filename) {
  return filename.substring(0, filename.lastIndexOf('.')) || filename;
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes) {
  if (!bytes) return '';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Get MIME type for audio file
 */
function getAudioMimeType(filename) {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  const mimeTypes = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.flac': 'audio/flac',
    '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4'
  };
  return mimeTypes[ext] || 'audio/mpeg';
}

/**
 * Extract GitHub owner from current page
 */
function getGitHubRepoOwner() {
  const pathParts = window.location.pathname.split('/').filter(p => p);
  return pathParts[0] || null;
}

/**
 * Extract GitHub repo name from current page
 */
function getGitHubRepoName() {
  const pathParts = window.location.pathname.split('/').filter(p => p);
  return pathParts[1] || null;
}
