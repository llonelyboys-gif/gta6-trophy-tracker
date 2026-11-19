// Entry program for gta6-trophy-guide-01 ("Platinum Road").
//
// Node 22, standard library only, no network. The guide is plain static
// files under app/ (index.html, its modules and styles, plus
// app/data/trophies.json) and runs offline in a desktop browser. This script
// stages the entry: it copies app/ and screenshots/ out of this repository
// into the output directory and writes dossier.json there, built by
// buildDossier from the vendored make.fun library. The scorer rebuilds the
// dossier from the same files and compares it byte for byte, so
// vendor/makefun-frontend.ts must stay exactly as the kit shipped it.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for
// /output, e.g.:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// It is deterministic: two runs over the same files write the same bytes.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Make sure the output directory exists, then empty it without ever
// removing the directory itself. In the grader /output is a mounted
// volume, so deleting the mount point fails with EBUSY; wiping only the
// entries inside it is safe there and still drops every stale file from
// an earlier run.
mkdirSync(outputDir, { recursive: true });
for (const entry of readdirSync(outputDir)) {
  rmSync(join(outputDir, entry), { recursive: true, force: true });
}

// Copy the guide itself.
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });

// Copy the screenshots, skipping any hidden files.
const shotsDir = join(repoRoot, 'screenshots');
if (existsSync(shotsDir)) {
  const shotsOut = join(outputDir, 'screenshots');
  mkdirSync(shotsOut, { recursive: true });
  for (const name of readdirSync(shotsDir)) {
    if (!name.startsWith('.')) {
      cpSync(join(shotsDir, name), join(shotsOut, name));
    }
  }
}

// The scorer's caps, mirrored here so buildDossier rejects anything the
// grader would: dossier text at most 160 KiB, at most 4 screenshots of at
// most 256 KiB each, app/ at most 993 files and directories and 48 MiB.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log(`wrote ${outputDir}/dossier.json (${dossier.length} bytes)`);
