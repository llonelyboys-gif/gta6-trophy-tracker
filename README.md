# Platinum Road — GTA 6 Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/llonelyboys-gif/gta6-trophy-tracker/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/llonelyboys-gif/gta6-trophy-tracker/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies of Grand Theft Auto VI** (1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden). Built for [make.fun's gta6-trophy-guide-01 bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## What it does

- **Checklist tracker** — every trophy with its official name, description and grade, ticked off as you earn it. Progress saves in the browser (localStorage) and can be exported to a file and imported back.
- **Filters** — by kind (story, missable, collectibles, activities, combat & crime, exploration, money & property), by grade, by earned / not earned, plus full-text search.
- **Spoiler setting** — hides the names and descriptions of story trophies until you earn them.
- **Roadmap to the platinum** — six stages in the order to play them, built from the official trophy descriptions.
- **Missables** — 10 trophies flagged as missable, each tied to a single specific moment in its official description, with advice to keep a manual save before it.
- **A guide to every trophy** in our own words, with its sources named beside it: the official list on Exophase for the name, description and grade, PSNProfiles for PSN's counts, and our own advice drawn from the official description — honestly labelled as not yet checked in the game, since GTA VI released on 19 November 2026.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network: `app/` is plain static files and the guide makes no network request at run time. It works from any static host, or straight from the files.

## How it is built

- `app/index.html` — the page; `app/style.css` — the look; `app/app.js` — boot, checklist and detail pane; `app/data.js` — loads the trophy list; `app/progress.js` — localStorage save, export/import; `app/roadmap.js` — roadmap and missables pages.
- `app/data/trophies.json` — the 55 official trophies with a guide each.
- `main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to `/output` and writes `dossier.json` with the vendored `vendor/makefun-frontend.ts`:
  ```sh
  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
  ```
- `shots.json` describes the four screenshots in `screenshots/` (cover first).

## Notes

- Trophy names and descriptions are shown as PlayStation publishes them. The guides are our own words and cite their sources; they never copy another guide's text.
- An unofficial, fan-made guide. No Rockstar logo or official artwork anywhere.
- MIT licensed. See `LICENSE`.
