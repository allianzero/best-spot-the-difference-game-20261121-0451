// Pointer and keyboard input for Twin Lanterns. The canvas is 1280 x 720
// internally but scales to the window, so every pointer event is mapped back
// into canvas coordinates first. Clicks are tested against the two panels'
// difference circles, then against the HUD buttons the UI module reports.

import { SCENE_WIDTH, SCENE_HEIGHT } from './scenes.js';

export const PANEL = {
  left: { x: 24, y: 96 },
  right: { x: 656, y: 96 },
  width: SCENE_WIDTH,
  height: SCENE_HEIGHT,
};

export const BUTTONS = {
  hint: { x: 24, y: 636, w: 150, h: 56 },
  sound: { x: 186, y: 636, w: 150, h: 56 },
  menu: { x: 1106, y: 636, w: 150, h: 56 },
  next: { x: 540, y: 520, w: 200, h: 56 },
  again: { x: 540, y: 520, w: 200, h: 56 },
  playAgain: { x: 470, y: 540, w: 340, h: 56 },
};

export function canvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

export function inside(point, box) {
  return point.x >= box.x && point.x <= box.x + box.w &&
    point.y >= box.y && point.y <= box.y + box.h;
}

// Which panel, if any, holds this canvas point? Returns 'left', 'right' or null.
export function panelAt(point) {
  for (const name of ['left', 'right']) {
    const p = PANEL[name];
    if (point.x >= p.x && point.x <= p.x + PANEL.width &&
      point.y >= p.y && point.y <= p.y + PANEL.height) {
      return name;
    }
  }
  return null;
}

// Scene coordinates of a point inside a panel.
export function scenePoint(point, panelName) {
  const p = PANEL[panelName];
  return { x: point.x - p.x, y: point.y - p.y };
}

// Find the unfound difference under a scene point, if any.
export function differenceAt(scene, point, foundIds) {
  for (const diff of scene.differences) {
    if (foundIds.has(diff.id)) continue;
    const dx = point.x - diff.x;
    const dy = point.y - diff.y;
    if (dx * dx + dy * dy <= diff.r * diff.r) return diff;
  }
  return null;
}

// Find an already-found difference under a scene point, if any, so a
// re-click on a ringed difference is ignored instead of counting as a miss.
export function foundDifferenceAt(scene, point, foundIds) {
  for (const diff of scene.differences) {
    if (!foundIds.has(diff.id)) continue;
    const dx = point.x - diff.x;
    const dy = point.y - diff.y;
    if (dx * dx + dy * dy <= diff.r * diff.r) return diff;
  }
  return null;
}

export function attachInput(canvas, handlers) {
  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    handlers.onPointer(canvasPoint(canvas, event));
  });
  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'h') handlers.onHint();
    else if (key === 'm') handlers.onMute();
    else if (key === 'r') handlers.onRestart();
    else if (key === 'escape') handlers.onMenu();
    else if (key >= '1' && key <= '3') handlers.onLevel(Number(key) - 1);
    else if (key === 'enter' || key === ' ') handlers.onConfirm();
  });
}
