// Loads the trophy list and holds the labels the rest of the app shares.
// The list itself lives in data/trophies.json: every trophy's official name,
// description and grade as PlayStation publishes them, plus this guide's own
// kind, missable flag, roadmap stage and guide text.

export const KIND_LABELS = {
  story: 'Story',
  activities: 'Activities',
  collectibles: 'Collectibles',
  combat: 'Combat & crime',
  exploration: 'Exploration',
  economy: 'Money & property',
  completion: 'Completion',
  platinum: 'Platinum',
};

export const KIND_ORDER = ['story', 'missable', 'collectibles', 'activities', 'combat', 'exploration', 'economy'];

export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

export async function loadTrophyData() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error(`trophies.json failed to load (${response.status})`);
  const doc = await response.json();
  if (!Array.isArray(doc.trophies) || doc.trophies.length !== 55) {
    throw new Error('trophies.json does not hold the 55 trophies');
  }
  return doc;
}

export function trophyById(doc, id) {
  return doc.trophies.find((t) => t.id === id);
}

export function gradeCounts(doc) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of doc.trophies) counts[t.grade] += 1;
  return counts;
}
