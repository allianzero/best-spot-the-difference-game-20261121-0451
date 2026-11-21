// Screenshot staging for Twin Lanterns. When the page is opened with a
// `?shot=` query (see shots.json), the game jumps straight into a fixed,
// deterministic state so a screenshot shows the game at its best:
//   ?shot=start  the menu with all three scenes
//   ?shot=play   level 1 mid-hunt: 3 differences found, 4 still to find
//   ?shot=hint   level 2 with a hint pulsing on an unfound difference
//   ?shot=end    the final results screen after all three scenes
// Without the query the game starts normally on the menu. Staging never
// changes the rules — it only pre-plays the same actions a player would.

import { SCENES } from './scenes.js';

export function applyShot(state, params) {
  const shot = params.get('shot');
  if (!shot) return false;
  const now = performance.now();

  if (shot === 'start') {
    state.screen = 'menu';
    return true;
  }

  if (shot === 'play') {
    state.levelIndex = 0;
    state.screen = 'playing';
    state.timeLeft = 84;
    state.score = 340;
    state.combo = 2;
    const firstThree = SCENES[0].differences.slice(0, 3);
    for (const diff of firstThree) {
      state.found.add(diff.id);
      state.finds += 1;
    }
    state.effects.toast = { text: 'Found: Chimney smoke  ·  +100', at: now - 400 };
    return true;
  }

  if (shot === 'hint') {
    state.levelIndex = 1;
    state.screen = 'playing';
    state.timeLeft = 61;
    state.score = 520;
    state.combo = 1;
    const firstTwo = SCENES[1].differences.slice(0, 2);
    for (const diff of firstTwo) {
      state.found.add(diff.id);
      state.finds += 1;
    }
    state.hintsLeft = 2;
    const hinted = SCENES[1].differences[4];
    state.effects.hint = { diff: hinted, at: now - 300 };
    state.effects.toast = { text: 'Hint: look near the water…  ·  −50', at: now - 400 };
    return true;
  }

  if (shot === 'end') {
    state.levelIndex = 2;
    state.screen = 'gameClear';
    state.timeLeft = 23;
    state.score = 2140;
    state.finds = 21;
    state.misses = 3;
    state.totalClicks = 24;
    state.bestCombo = 5;
    state.accuracy = 88;
    // Only this scene's differences are ringed on its board; the totals
    // (21 found across the game) live in the results panel, not the counter.
    for (const diff of SCENES[2].differences) state.found.add(diff.id);
    return true;
  }

  return false;
}

// The staged states the screenshots use, kept beside the code so a human
// can see what each shot is supposed to show.
export const SHOTS = [
  { name: '1-play.jpg', query: '?shot=play&seed=1' },
  { name: '2-start.jpg', query: '?shot=start&seed=1' },
  { name: '3-hint.jpg', query: '?shot=hint&seed=1' },
  { name: '4-end.jpg', query: '?shot=end&seed=1' },
];
