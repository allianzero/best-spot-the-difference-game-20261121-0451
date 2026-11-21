// Twin Lanterns — the entry program (Node 22, standard library only).
// It hands the game in: it copies this repository's game/ and screenshots/
// beside this file into /output and writes /output/dossier.json, the summary
// the judge reads, with the vendored make.fun library. Outside the grader's
// container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// The program is deterministic: run it twice and the bytes in /output are
// identical, because it copies files and lets buildDossier summarise them.
//
// Play the game locally first with `node serve.ts`, then open
// http://localhost:8080 in desktop Chrome.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Start from a clean output directory so a stale file can never leak in.
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

// The game itself: plain static files, no build step, no network request.
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });

// The maker's own screenshots of the game running in desktop Chrome.
// The first by name is the cover the judge sees largest.
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The dossier, built by the kit's own library from the files just copied,
// with the scorer's caps: text capped at 160 KiB, at most 4 screenshots of
// at most 256 KiB each, game/ at most 993 files and 48 MiB in all.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

console.log(`Twin Lanterns handed in to ${out}`);
