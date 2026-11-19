// Platinum Road — boot, checklist, detail pane, filters and routing.
// The checklist is the heart of the guide: every trophy with its official
// name, description and grade, a tick box saved in localStorage, and a guide
// with its sources beside it.

import { loadTrophyData, KIND_LABELS, KIND_ORDER } from './data.js';
import {
  loadEarned, saveEarned, loadSpoilersHidden, saveSpoilersHidden,
  parseImportedProgress, exportProgress, resetProgress,
} from './progress.js';
import { renderRoadmap, renderMissables } from './roadmap.js';

const $ = (id) => document.getElementById(id);

const doc = await loadTrophyData();
const earned = loadEarned();
let spoilersHidden = loadSpoilersHidden();
let kindFilter = 'all';
let gradeFilter = 'all';
let earnedFilter = 'all';
let query = '';
let selectedId = null;

const STORY_HIDDEN_NAME = 'Hidden story trophy';
const STORY_HIDDEN_DESC = 'Hidden until earned — turn the spoiler setting off, or earn it, to reveal it.';

function isSpoilerHidden(t) {
  return spoilersHidden && t.kind === 'story' && !earned.has(t.name);
}

function visibleName(t) {
  return isSpoilerHidden(t) ? STORY_HIDDEN_NAME : t.name;
}

function visibleDesc(t) {
  return isSpoilerHidden(t) ? STORY_HIDDEN_DESC : t.description;
}

function medalSpan(grade) {
  const span = document.createElement('span');
  span.className = `medal ${grade}`;
  span.title = grade;
  return span;
}

function kindTag(t) {
  const tag = document.createElement('span');
  tag.className = 'tag';
  tag.textContent = KIND_LABELS[t.kind] ?? t.kind;
  return tag;
}

function updateProgress() {
  $('earned-count').textContent = String(earned.size);
  $('progress-fill').style.width = `${Math.round((earned.size / doc.trophies.length) * 100)}%`;
  $('missable-count').textContent = String(doc.trophies.filter((t) => t.missable).length);
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of doc.trophies) if (earned.has(t.name)) counts[t.grade] += 1;
  $('grade-line').textContent =
    `${counts.platinum}/1 platinum · ${counts.gold}/2 gold · ${counts.silver}/6 silver · ${counts.bronze}/46 bronze`;
}

function matchesFilters(t) {
  if (kindFilter === 'missable') {
    if (!t.missable) return false;
  } else if (kindFilter !== 'all' && t.kind !== kindFilter) {
    return false;
  }
  if (gradeFilter !== 'all' && t.grade !== gradeFilter) return false;
  if (earnedFilter === 'earned' && !earned.has(t.name)) return false;
  if (earnedFilter === 'todo' && earned.has(t.name)) return false;
  if (query) {
    const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
    if (!hay.includes(query)) return false;
  }
  return true;
}

function renderList() {
  const list = $('trophy-list');
  list.replaceChildren();
  const shown = doc.trophies.filter(matchesFilters);
  for (const t of shown) {
    const li = document.createElement('li');
    li.className = `trophy-row${earned.has(t.name) ? ' earned' : ''}${selectedId === t.id ? ' selected' : ''}`;
    li.dataset.id = String(t.id);

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', `Earned: ${t.name}`);
    box.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleEarned(t);
    });

    const body = document.createElement('div');
    const name = document.createElement('p');
    name.className = 'trophy-name';
    name.textContent = visibleName(t);
    const desc = document.createElement('p');
    desc.className = 'trophy-desc';
    desc.textContent = visibleDesc(t);
    const meta = document.createElement('div');
    meta.className = 'trophy-meta';
    meta.append(kindTag(t));
    if (t.missable) {
      const m = document.createElement('span');
      m.className = 'tag missable';
      m.textContent = 'Missable';
      meta.append(m);
    }
    if (isSpoilerHidden(t)) {
      const s = document.createElement('span');
      s.className = 'tag spoiler';
      s.textContent = 'Spoiler hidden';
      meta.append(s);
    }
    if (t.target) {
      const target = document.createElement('span');
      target.className = 'tag';
      target.textContent = `PSN target: ${t.target.toLocaleString('en-US')}`;
      meta.append(target);
    }
    body.append(name, desc, meta);

    const grade = document.createElement('div');
    grade.append(medalSpan(t.grade));
    const gradeText = document.createElement('span');
    gradeText.className = 'grade-text';
    gradeText.textContent = t.grade;
    grade.append(gradeText);

    li.append(box, body, grade);
    li.addEventListener('click', () => selectTrophy(t.id));
    li.tabIndex = 0;
    li.setAttribute('role', 'button');
    li.setAttribute('aria-label', `${visibleName(t)} — ${t.grade}`);
    li.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectTrophy(t.id);
      }
    });
    list.append(li);
  }
  $('empty-note').hidden = shown.length > 0;
  $('list-count').textContent = `${shown.length} of ${doc.trophies.length} shown`;
}

function toggleEarned(t) {
  if (earned.has(t.name)) earned.delete(t.name);
  else earned.add(t.name);
  saveEarned(earned);
  updateProgress();
  renderList();
  renderDetail();
  renderSaveStats();
  renderRoadmap(doc, earned, $('roadmap-stages'));
  renderMissables(doc, earned, spoilersHidden, $('missables-list'));
}

function renderDetail() {
  const card = $('detail-card');
  const empty = $('detail-empty');
  const t = doc.trophies.find((x) => x.id === selectedId);
  if (!t) {
    card.hidden = true;
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  card.hidden = false;
  const hidden = isSpoilerHidden(t);
  $('detail-medal').className = `medal ${t.grade}`;
  $('detail-grade-text').textContent = t.grade;
  $('detail-kind').textContent = KIND_LABELS[t.kind] ?? t.kind;
  $('detail-name').textContent = hidden ? STORY_HIDDEN_NAME : t.name;
  $('detail-desc').textContent = hidden ? STORY_HIDDEN_DESC : t.description;
  const target = $('detail-target');
  if (t.target && !hidden) {
    target.hidden = false;
    target.textContent = `PSN tracks this one: ${t.target.toLocaleString('en-US')} — see PSNProfiles in the sources.`;
  } else {
    target.hidden = true;
  }
  $('detail-missable').hidden = !t.missable;
  $('detail-guide').textContent = hidden
    ? 'This is a story trophy, hidden by your spoiler setting. Earn it in the game (or turn the spoiler setting off) to read its guide.'
    : t.guide;
  const sources = $('detail-sources');
  sources.replaceChildren();
  for (const key of t.sources ?? []) {
    const info = doc.sources[key];
    if (!info) continue;
    const li = document.createElement('li');
    if (info.url) {
      const a = document.createElement('a');
      a.href = info.url;
      a.textContent = info.label;
      a.target = '_blank';
      a.rel = 'noopener';
      li.append(a);
    } else {
      li.textContent = info.label;
    }
    sources.append(li);
  }
  const check = $('detail-earned');
  check.checked = earned.has(t.name);
  check.onchange = () => toggleEarned(t);
  $('detail-note').textContent = earned.has(t.name)
    ? 'Ticked as earned. Untick it if that was a mistake.'
    : 'This tracker is separate from your PSN account — tick the box when the trophy pops on your console.';
}

function selectTrophy(id) {
  selectedId = id;
  renderList();
  renderDetail();
}

function renderKindChips() {
  const row = $('kind-chips');
  row.replaceChildren();
  const chips = [{ value: 'all', label: 'All kinds' }, ...KIND_ORDER.map((k) => ({
    value: k,
    label: k === 'missable' ? 'Missable' : KIND_LABELS[k] ?? k,
  }))];
  for (const chip of chips) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `chip${kindFilter === chip.value ? ' active' : ''}`;
    button.textContent = chip.label;
    button.addEventListener('click', () => {
      kindFilter = chip.value;
      renderKindChips();
      renderList();
    });
    row.append(button);
  }
}

function renderSaveStats() {
  const stats = $('save-stats');
  stats.replaceChildren();
  const byKind = {};
  for (const t of doc.trophies) {
    byKind[t.kind] = byKind[t.kind] ?? { done: 0, total: 0 };
    byKind[t.kind].total += 1;
    if (earned.has(t.name)) byKind[t.kind].done += 1;
  }
  const entries = [
    ['Earned', `${earned.size} / ${doc.trophies.length}`],
    ['Missable earned', `${doc.trophies.filter((t) => t.missable && earned.has(t.name)).length} / ${doc.trophies.filter((t) => t.missable).length}`],
    ['Story earned', `${byKind.story.done} / ${byKind.story.total}`],
    ['Collectibles', `${byKind.collectibles.done} / ${byKind.collectibles.total}`],
  ];
  for (const [label, value] of entries) {
    const div = document.createElement('div');
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    div.append(dt, dd);
    stats.append(div);
  }
}

function showTab(tab) {
  for (const link of document.querySelectorAll('.tab')) {
    link.classList.toggle('active', link.dataset.tab === tab);
  }
  const onList = tab === 'list';
  $('toolbar').style.display = onList ? '' : 'none';
  document.querySelector('.layout').style.display = onList ? '' : 'none';
  $('roadmap-page').hidden = tab !== 'roadmap';
  $('missables-page').hidden = tab !== 'missables';
  $('save-page').hidden = tab !== 'save';
  if (tab === 'save') renderSaveStats();
}

function route() {
  const hash = location.hash.replace(/^#\//, '');
  showTab(['list', 'roadmap', 'missables', 'save'].includes(hash) ? hash : 'list');
}

function wireControls() {
  $('search').addEventListener('input', (e) => {
    query = e.target.value.trim().toLowerCase();
    renderList();
  });
  $('grade-filter').addEventListener('change', (e) => {
    gradeFilter = e.target.value;
    renderList();
  });
  $('earned-filter').addEventListener('change', (e) => {
    earnedFilter = e.target.value;
    renderList();
  });
  const spoiler = $('spoiler-toggle');
  spoiler.checked = spoilersHidden;
  spoiler.addEventListener('change', () => {
    spoilersHidden = spoiler.checked;
    saveSpoilersHidden(spoilersHidden);
    renderList();
    renderDetail();
    renderMissables(doc, earned, spoilersHidden, $('missables-list'));
  });
  $('export-btn').addEventListener('click', () => {
    exportProgress(earned, doc.trophies.map((t) => t.name));
  });
  $('import-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    const status = $('import-status');
    if (!file) return;
    try {
      const names = parseImportedProgress(await file.text());
      const known = new Set(doc.trophies.map((t) => t.name));
      let added = 0;
      for (const name of names) {
        if (known.has(name) && !earned.has(name)) {
          earned.add(name);
          added += 1;
        }
      }
      saveEarned(earned);
      updateProgress();
      renderList();
      renderDetail();
      renderSaveStats();
      renderRoadmap(doc, earned, $('roadmap-stages'));
      renderMissables(doc, earned, spoilersHidden, $('missables-list'));
      status.textContent = `Imported ${added} new tick${added === 1 ? '' : 's'} from ${file.name}.`;
    } catch {
      status.textContent = 'That file is not a progress file from this guide.';
    }
    e.target.value = '';
  });
  $('reset-btn').addEventListener('click', () => {
    if (!window.confirm('Clear every tick in this browser? Export first if you want a backup.')) return;
    resetProgress();
    earned.clear();
    updateProgress();
    renderList();
    renderDetail();
    renderSaveStats();
    renderRoadmap(doc, earned, $('roadmap-stages'));
    renderMissables(doc, earned, spoilersHidden, $('missables-list'));
  });
  window.addEventListener('hashchange', route);
}

renderKindChips();
wireControls();
updateProgress();
renderList();
renderDetail();
renderSaveStats();
renderRoadmap(doc, earned, $('roadmap-stages'));
renderMissables(doc, earned, spoilersHidden, $('missables-list'));
route();
window.__shotReady = true;
