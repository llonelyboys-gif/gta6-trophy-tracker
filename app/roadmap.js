// Roadmap to the platinum and the missables page. Both are built from the
// official trophy descriptions alone — the stages group trophies by the order
// to play them, and a trophy is flagged missable when its description ties it
// to a single specific moment that may not come back.

import { KIND_LABELS } from './data.js';

export const STAGES = [
  {
    n: 1,
    title: 'Play the story',
    blurb:
      'Chapters 1 to 4, the named story missions and the final mission. Story trophies pop as you play — nothing here needs grinding. Before each story beat, keep a manual save: three story trophies below are flagged missable because a story choice or moment locks them in.',
    stages: [1],
  },
  {
    n: 2,
    title: 'Meet the strangers',
    blurb:
      'The strangers of Leonida: finish the mission strands for Andy, Kenton, Billy, Randy and Tyrone, and any 8 stranger strands in total. Strands unlock as you explore, so pick them up whenever their marker appears — they run alongside the story.',
    stages: [2],
  },
  {
    n: 3,
    title: 'Try everything once',
    blurb:
      'The activities sampler: fishing against Cal, an arcade game, bowling at the Kolt & Associates alley, meditation, the hunt for Bret, the Shooting Range and the first races. Do the one-off activities now, while the map is still fresh.',
    kinds: ['activities'],
    stages: [2, 3],
  },
  {
    n: 4,
    title: 'The long counts',
    blurb:
      'Collectibles and grinds that build up over the whole game: Collectible Card sets, WAiNK spots, discovering vehicles, exploring Leonida, 250 stunts and 50 Challenges. Start these early and tick them off as you travel — never save them all for last.',
    kinds: ['collectibles', 'exploration'],
    stages: [3, 4],
  },
  {
    n: 5,
    title: 'Crime pays',
    blurb:
      'Partner robberies, bank vaults, armored trucks, gang operations and Combat Focus. Bring your partner for the two partner trophies, and attempt the VCIA stunt and the showroom smash on your first visit — both are flagged missable.',
    kinds: ['combat'],
    stages: [5],
  },
  {
    n: 6,
    title: 'Money and the platinum',
    blurb:
      'Launder $250,000 of Marked Bills, spend $100,000 in shops, buy the garages and register 10 vehicles, then check the 100% completion stat. When the last trophy pops, the platinum follows it.',
    kinds: ['economy', 'completion', 'platinum'],
    stages: [6],
  },
];

function stageTrophies(doc, stage) {
  return doc.trophies.filter((t) => {
    if (stage.stages && !stage.stages.includes(t.stage)) return false;
    if (stage.kinds && !stage.kinds.includes(t.kind)) return false;
    return true;
  });
}

export function renderRoadmap(doc, earned, container) {
  container.replaceChildren();
  for (const stage of STAGES) {
    const list = stageTrophies(doc, stage);
    const done = list.filter((t) => earned.has(t.name)).length;
    const box = document.createElement('article');
    box.className = 'stage';
    const head = document.createElement('h3');
    const num = document.createElement('span');
    num.className = 'stage-num';
    num.textContent = `Stage ${stage.n}`;
    head.append(num, document.createTextNode(stage.title));
    const blurb = document.createElement('p');
    blurb.textContent = stage.blurb;
    const prog = document.createElement('p');
    prog.className = 'stage-progress';
    prog.textContent = `${done} of ${list.length} earned in this stage`;
    const ul = document.createElement('ul');
    for (const t of list) {
      const li = document.createElement('li');
      li.textContent = `${earned.has(t.name) ? '✓ ' : '○ '}${t.name} — ${KIND_LABELS[t.kind] ?? t.kind}${t.missable ? ' — missable' : ''}`;
      ul.append(li);
    }
    box.append(head, blurb, prog, ul);
    container.append(box);
  }
}

export function renderMissables(doc, earned, spoilersHidden, container) {
  container.replaceChildren();
  const missables = doc.trophies.filter((t) => t.missable);
  for (const t of missables) {
    const box = document.createElement('article');
    box.className = 'missable-item';
    const hidden = spoilersHidden && t.kind === 'story' && !earned.has(t.name);
    const head = document.createElement('h3');
    head.textContent = hidden ? 'Hidden story trophy' : t.name;
    const why = document.createElement('p');
    why.className = 'why';
    why.textContent = hidden
      ? 'A story trophy hidden by your spoiler setting — earn it to reveal it. It is flagged missable, so check the tip below before you play past the next story beat.'
      : `Why it is flagged: ${t.description} — the description ties this trophy to one specific moment, not a count you can grind later.`;
    const guide = document.createElement('p');
    guide.textContent = t.guide;
    const state = document.createElement('p');
    state.textContent = earned.has(t.name)
      ? '✓ Earned — safe.'
      : 'Not earned yet. Keep a manual save before the story beat or stunt it belongs to.';
    box.append(head, why, guide, state);
    container.append(box);
  }
}
