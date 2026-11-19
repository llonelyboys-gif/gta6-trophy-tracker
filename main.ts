// Platinum Road — the gta6-trophy-guide-01 entry program (Node 22, standard
// library only). The guide itself is plain static files in app/ (index.html,
// its modules, its styles and app/data/trophies.json) and works offline in a
// desktop browser. This program hands the guide in: it copies app/ and
// screenshots/ from this repository into /output and writes /output/dossier.json
// with buildDossier from the vendored make.fun library, which the scorer
// rebuilds and compares byte for byte — so vendor/makefun-frontend.ts must
// stay exactly as the kit shipped it.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// It is deterministic: two runs over the same files write the same bytes.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Start from a clean output directory so a stale file from an earlier run can
// never leak into the entry.
if (existsSync(outputDir)) rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

const appOut = join(outputDir, 'app');
cpSync(join(repoRoot, 'app'), appOut, { recursive: true });

const shotsOut = join(outputDir, 'screenshots');
mkdirSync(shotsOut, { recursive: true });
const shotsIn = join(repoRoot, 'screenshots');
if (existsSync(shotsIn)) {
  for (const name of readdirSync(shotsIn)) {
    if (name.startsWith('.')) continue;
    cpSync(join(shotsIn, name), join(shotsOut, name));
  }
}

// The scorer's own caps: the dossier text is capped at 160 KiB, at most 4
// screenshots of at most 256 KiB each, app/ at most 993 files and
// directories and 48 MiB. buildDossier refuses anything past them.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log(`wrote ${outputDir}/dossier.json (${dossier.length} bytes)`);
