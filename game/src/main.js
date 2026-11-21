// Twin Lanterns — game state, loop and rules. The pictures are painted by
// draw.js, the interface by ui.js; this module owns the state machine
// (menu → playing → levelClear → gameClear / timeUp), the timer, the score
// and every click. It is the only module that mutates state.

import { SCENES } from './scenes.js';
import { drawGame, menuCardAt } from './ui.js';
import {
  attachInput, panelAt, scenePoint, differenceAt, foundDifferenceAt, BUTTONS, inside,
} from './input.js';
import {
  unlockAudio, playFound, playMiss, playHint, playLevelClear, playTick,
  toggleMute, isMuted,
} from './audio.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

const BEST_KEY = 'twin-lanterns-best-v1';

function loadBest() {
  try {
    const raw = window.localStorage.getItem(BEST_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed) && parsed.length === SCENES.length) return parsed;
  } catch {
    // Private mode or no storage: best scores simply stay blank.
  }
  return SCENES.map(() => 0);
}

function saveBest(best) {
  try {
    window.localStorage.setItem(BEST_KEY, JSON.stringify(best));
  } catch {
    // Best scores are a nicety; the game plays on without them.
  }
}

function freshState() {
  return {
    screen: 'menu',
    levelIndex: 0,
    score: 0,
    scoreAtLevelStart: 0,
    levelBonus: 0,
    combo: 0,
    bestCombo: 0,
    found: new Set(),
    timeLeft: SCENES[0].timeLimit,
    hintsLeft: 3,
    muted: isMuted(),
    misses: 0,
    finds: 0,
    totalClicks: 0,
    accuracy: 100,
    best: loadBest(),
    menuHover: -1,
    effects: { bursts: [], missFlash: null, hint: null, toast: null },
  };
}

const state = freshState();
let lastTickSecond = -1;
let lastTime = performance.now();

function announce(message) {
  statusEl.textContent = message;
}

function startLevel(index) {
  state.levelIndex = index;
  state.screen = 'playing';
  state.scoreAtLevelStart = state.score;
  state.found = new Set();
  state.timeLeft = SCENES[index].timeLimit;
  state.hintsLeft = 3;
  state.combo = 0;
  state.effects = { bursts: [], missFlash: null, hint: null, toast: null };
  lastTickSecond = -1;
  const scene = SCENES[index];
  announce(`${scene.name}. Find ${scene.differences.length} differences. ${scene.timeLimit} seconds.`);
}

function finishLevel() {
  const scene = SCENES[state.levelIndex];
  state.levelBonus = Math.round(state.timeLeft) * 5;
  state.score += state.levelBonus;
  state.accuracy = state.totalClicks === 0 ? 100
    : Math.round((state.finds / state.totalClicks) * 100);
  if (state.score > state.best[state.levelIndex]) {
    state.best[state.levelIndex] = state.score;
    saveBest(state.best);
  }
  state.screen = 'levelClear';
  playLevelClear();
  announce(`Level clear! ${scene.name} complete. Score ${state.score}.`);
}

function finishGame() {
  state.screen = 'gameClear';
  announce(`You found them all! Total score ${state.score}.`);
}

function nextAfterClear() {
  if (state.levelIndex < SCENES.length - 1) {
    startLevel(state.levelIndex + 1);
  } else {
    finishGame();
  }
}

function useHint() {
  if (state.screen !== 'playing' || state.hintsLeft <= 0) return;
  const scene = SCENES[state.levelIndex];
  const remaining = scene.differences.filter((d) => !state.found.has(d.id));
  if (remaining.length === 0) return;
  const picked = remaining[Math.floor(Math.random() * remaining.length)];
  state.hintsLeft -= 1;
  state.score = Math.max(0, state.score - 50);
  state.effects.hint = { diff: picked, at: performance.now() };
  state.effects.toast = { text: `Hint: look near the ${picked.label.toLowerCase()}…  ·  −50`, at: performance.now() };
  playHint();
  announce(`Hint used. ${state.hintsLeft} hints left.`);
}

function onFound(diff, panelName) {
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  const points = 100 + 25 * (state.combo - 1);
  state.score += points;
  state.finds += 1;
  state.found.add(diff.id);
  state.effects.bursts.push({ x: diff.x, y: diff.y, r: diff.r, at: performance.now() });
  state.effects.toast = {
    text: `Found: ${diff.label}  ·  +${points}${state.combo > 1 ? `  (combo x${state.combo})` : ''}`,
    at: performance.now(),
  };
  playFound();
  announce(`Found ${diff.label}. ${state.found.size} of ${SCENES[state.levelIndex].differences.length}.`);
  if (state.found.size === SCENES[state.levelIndex].differences.length) finishLevel();
}

function onMiss(point) {
  state.timeLeft = Math.max(0, state.timeLeft - 5);
  state.combo = 0;
  state.misses += 1;
  state.effects.missFlash = { x: point.x, y: point.y, at: performance.now() };
  state.effects.toast = { text: 'Not a difference  ·  −5s', at: performance.now() };
  playMiss();
  announce('Not a difference. Five seconds lost.');
}

function onPointer(point) {
  unlockAudio();
  if (state.screen === 'menu') {
    const card = menuCardAt(point);
    if (card >= 0) startLevel(card);
    return;
  }

  // Bottom-bar buttons work on every screen that shows them.
  if (inside(point, BUTTONS.hint) && state.screen === 'playing') { useHint(); return; }
  if (inside(point, BUTTONS.sound)) {
    state.muted = toggleMute();
    return;
  }
  if (inside(point, BUTTONS.menu)) {
    state.screen = 'menu';
    announce('Menu.');
    return;
  }

  if (state.screen === 'levelClear' && inside(point, BUTTONS.next)) { nextAfterClear(); return; }
  if (state.screen === 'gameClear' && inside(point, BUTTONS.playAgain)) {
    state.score = 0;
    state.finds = 0;
    state.misses = 0;
    state.totalClicks = 0;
    state.bestCombo = 0;
    startLevel(0);
    return;
  }
  if (state.screen === 'timeUp' && inside(point, BUTTONS.again)) {
    state.score = state.scoreAtLevelStart;
    startLevel(state.levelIndex);
    return;
  }

  if (state.screen !== 'playing') return;

  const panelName = panelAt(point);
  if (!panelName) return;
  const scene = SCENES[state.levelIndex];
  const sp = scenePoint(point, panelName);
  // A click on a difference already found does nothing: no score, no
  // penalty, and it does not count toward accuracy.
  if (foundDifferenceAt(scene, sp, state.found)) return;
  state.totalClicks += 1;
  const diff = differenceAt(scene, sp, state.found);
  if (diff) onFound(diff, panelName);
  else onMiss(point);
}

function onConfirm() {
  if (state.screen === 'levelClear') nextAfterClear();
  else if (state.screen === 'timeUp') {
    state.score = state.scoreAtLevelStart;
    startLevel(state.levelIndex);
  } else if (state.screen === 'gameClear') {
    state.score = 0;
    state.finds = 0;
    state.misses = 0;
    state.totalClicks = 0;
    state.bestCombo = 0;
    startLevel(0);
  }
}

attachInput(canvas, {
  onPointer,
  onHint: () => { unlockAudio(); useHint(); },
  onMute: () => { unlockAudio(); state.muted = toggleMute(); },
  onRestart: () => {
    if (state.screen === 'playing' || state.screen === 'timeUp' || state.screen === 'levelClear') {
      state.score = state.scoreAtLevelStart;
      startLevel(state.levelIndex);
    }
  },
  onMenu: () => { state.screen = 'menu'; announce('Menu.'); },
  onLevel: (index) => { if (state.screen === 'menu') startLevel(index); },
  onConfirm,
});

canvas.addEventListener('pointermove', (event) => {
  if (state.screen !== 'menu') return;
  const rect = canvas.getBoundingClientRect();
  const point = {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height),
  };
  state.menuHover = menuCardAt(point);
});

function frame(now) {
  const dt = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;

  if (state.screen === 'playing') {
    state.timeLeft -= dt;
    const whole = Math.ceil(state.timeLeft);
    if (state.timeLeft <= 10 && whole !== lastTickSecond && state.timeLeft > 0) {
      lastTickSecond = whole;
      playTick();
    }
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.accuracy = state.totalClicks === 0 ? 100
        : Math.round((state.finds / state.totalClicks) * 100);
      state.screen = 'timeUp';
      playMiss();
      announce("Time's up!");
    }
  }

  drawGame(ctx, state, now);
  requestAnimationFrame(frame);
}

// Staged screenshot states (shots.js) run before the first frame.
applyShot(state, new URLSearchParams(window.location.search));
announce('Twin Lanterns. Choose a scene to start.');
requestAnimationFrame(frame);
