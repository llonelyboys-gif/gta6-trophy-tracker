// Progress storage: the earned ticks live in localStorage under one key, and
// export / import / reset move them as a plain JSON file. Nothing here touches
// the network; the file is made in the browser with a blob URL.

export const PROGRESS_KEY = 'platinum-road-gta6-v1';
export const SPOILER_KEY = 'platinum-road-gta6-spoilers';

export function loadEarned() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((name) => typeof name === 'string'));
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned].sort()));
}

export function loadSpoilersHidden() {
  return localStorage.getItem(SPOILER_KEY) === '1';
}

export function saveSpoilersHidden(hidden) {
  localStorage.setItem(SPOILER_KEY, hidden ? '1' : '0');
}

// Parses an imported progress file. Accepts the shape exportProgress writes
// ({ app, trophies: [names] }) and a bare array of trophy names.
export function parseImportedProgress(text) {
  const parsed = JSON.parse(text);
  const names = Array.isArray(parsed) ? parsed : parsed.trophies;
  if (!Array.isArray(names)) throw new Error('not a progress file');
  return names.filter((name) => typeof name === 'string');
}

export function exportProgress(earned, allNames) {
  const payload = {
    app: 'Platinum Road — GTA 6 trophy guide',
    exported_at: new Date().toISOString(),
    trophies: [...earned].sort(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gta6-trophy-progress.json';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return payload.trophies.length;
}

export function resetProgress() {
  localStorage.removeItem(PROGRESS_KEY);
}
