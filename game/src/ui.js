// All on-canvas interface for Twin Lanterns: the frame, the HUD with its
// timer and "left" counter, the found-difference markers, the bottom buttons
// and every overlay screen (menu, level clear, game clear, time up). The
// game state lives in main.js; this module only draws what it is given.

import { SCENES } from './scenes.js';
import { PAINTERS, circle, rr } from './draw.js';
import { PANEL, BUTTONS, inside } from './input.js';

const W = 1280;
const H = 720;

function text(ctx, str, x, y, font, color, align = 'left') {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function button(ctx, box, label, sub, enabled, accent) {
  ctx.fillStyle = enabled ? (accent ? '#f5b301' : '#2e3a5c') : '#232a3d';
  rr(ctx, box.x, box.y, box.w, box.h, 12);
  ctx.fill();
  ctx.strokeStyle = enabled ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, label, box.x + box.w / 2, box.y + (sub ? 20 : box.h / 2),
    'bold 20px Georgia, serif', enabled ? '#fff6d8' : '#7c86a3', 'center');
  if (sub) {
    text(ctx, sub, box.x + box.w / 2, box.y + 40,
      '13px Georgia, serif', enabled ? '#ffe9a8' : '#5d6784', 'center');
  }
}

function drawPanelFrame(ctx, x, label, foundCount, total) {
  ctx.fillStyle = '#0e1226';
  rr(ctx, x - 6, 90, 612, 532, 14);
  ctx.fill();
  ctx.strokeStyle = '#3a4470';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, label, x + 6, 76, 'bold 15px Georgia, serif', '#9aa5c8');
  text(ctx, `${foundCount} / ${total} found`, x + 594, 76,
    'bold 15px Georgia, serif', '#ffe9a8', 'right');
}

function drawMarkers(ctx, state, time) {
  const scene = SCENES[state.levelIndex];
  for (const id of state.found) {
    const diff = scene.differences.find((d) => d.id === id);
    if (!diff) continue;
    for (const name of ['left', 'right']) {
      const p = PANEL[name];
      const cx = p.x + diff.x;
      const cy = p.y + diff.y;
      // A gold ring with a soft glow, drawn on both panels at once.
      ctx.strokeStyle = 'rgba(245,179,1,0.35)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(cx, cy, diff.r + 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#ffd93b';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(cx, cy, diff.r, 0, Math.PI * 2);
      ctx.stroke();
      // A small check mark inside the ring.
      ctx.strokeStyle = '#fff6d8';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 9, cy);
      ctx.lineTo(cx - 2, cy + 7);
      ctx.lineTo(cx + 10, cy - 7);
      ctx.stroke();
    }
  }

  // Found bursts: expanding rings that fade out where a difference was found.
  for (const burst of state.effects.bursts) {
    const age = (time - burst.at) / 600;
    if (age >= 1) continue;
    for (const name of ['left', 'right']) {
      const p = PANEL[name];
      ctx.strokeStyle = `rgba(255,217,59,${1 - age})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(p.x + burst.x, p.y + burst.y, burst.r + age * 26, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Miss flash: a red X where the player clicked empty space.
  const miss = state.effects.missFlash;
  if (miss) {
    const age = (time - miss.at) / 500;
    if (age < 1) {
      ctx.strokeStyle = `rgba(230,57,70,${1 - age})`;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      const s = 12;
      ctx.beginPath();
      ctx.moveTo(miss.x - s, miss.y - s);
      ctx.lineTo(miss.x + s, miss.y + s);
      ctx.moveTo(miss.x + s, miss.y - s);
      ctx.lineTo(miss.x - s, miss.y + s);
      ctx.stroke();
    }
  }

  // Hint pulse: a breathing ring around the hinted difference.
  const hint = state.effects.hint;
  if (hint) {
    const age = (time - hint.at) / 2200;
    if (age < 1) {
      const pulse = 1 + 0.18 * Math.sin(time / 130);
      for (const name of ['left', 'right']) {
        const p = PANEL[name];
        ctx.strokeStyle = `rgba(127,182,255,${0.95 - age * 0.5})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(p.x + hint.diff.x, p.y + hint.diff.y, hint.diff.r * pulse + 4, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }
}

function drawHud(ctx, state, time) {
  const scene = SCENES[state.levelIndex];
  const total = scene.differences.length;
  const left = total - state.found.size;

  // Top bar.
  ctx.fillStyle = '#1d2340';
  ctx.fillRect(0, 0, W, 64);
  ctx.fillStyle = '#f5b301';
  ctx.fillRect(0, 64, W, 3);
  text(ctx, 'TWIN LANTERNS', 24, 22, 'bold 24px Georgia, serif', '#fff6d8');
  text(ctx, `${scene.name} · ${scene.difficulty}`, 24, 46,
    '15px Georgia, serif', '#9aa5c8');

  // Timer bar in the middle.
  const frac = Math.max(0, state.timeLeft / scene.timeLimit);
  const barX = 470;
  const barW = 340;
  ctx.fillStyle = '#12172b';
  rr(ctx, barX, 18, barW, 26, 13);
  ctx.fill();
  ctx.fillStyle = frac > 0.33 ? '#2a9d8f' : (frac > 0.15 ? '#f5b301' : '#e63946');
  if (frac > 0) {
    rr(ctx, barX, 18, barW * frac, 26, 13);
    ctx.fill();
  }
  text(ctx, `${Math.ceil(state.timeLeft)}s`, barX + barW / 2, 31,
    'bold 17px Georgia, serif', '#ffffff', 'center');
  if (state.timeLeft <= 10 && state.screen === 'playing') {
    text(ctx, 'HURRY!', barX + barW / 2, 54, 'bold 13px Georgia, serif', '#ff8a94', 'center');
  }

  // Score and the counter that matters most: how many are left.
  text(ctx, `Score  ${state.score}`, 1256, 20, 'bold 20px Georgia, serif', '#fff6d8', 'right');
  text(ctx, `${state.found.size} / ${total} found  ·  ${left} left`, 1256, 44,
    'bold 16px Georgia, serif', left === 0 ? '#7ee787' : '#ffd93b', 'right');
  if (state.combo >= 2) {
    text(ctx, `Combo x${state.combo}`, 830, 31, 'bold 17px Georgia, serif', '#ff9f1c');
  }

  // Bottom bar.
  ctx.fillStyle = '#1d2340';
  ctx.fillRect(0, 628, W, 92);
  ctx.fillStyle = '#f5b301';
  ctx.fillRect(0, 628, W, 3);
  button(ctx, BUTTONS.hint, 'Hint', `H · ${state.hintsLeft} left`, state.hintsLeft > 0 && state.screen === 'playing');
  button(ctx, BUTTONS.sound, state.muted ? 'Muted' : 'Sound', 'M', true);
  button(ctx, BUTTONS.menu, 'Menu', 'Esc', true);
  // Level dots.
  for (let i = 0; i < SCENES.length; i += 1) {
    const cx = 600 + i * 40;
    ctx.fillStyle = i < state.levelIndex ? '#7ee787' : (i === state.levelIndex ? '#f5b301' : '#3a4470');
    circle(ctx, cx, 664, 11);
    text(ctx, `${i + 1}`, cx, 665, 'bold 13px Georgia, serif', '#12172b', 'center');
  }
  text(ctx, state.screen === 'playing'
    ? 'Click a difference in either picture · wrong clicks cost 5s'
    : 'Twin Lanterns — find all 7 differences in each scene', 640, 700,
    '14px Georgia, serif', '#9aa5c8', 'center');

  // Toast line for the last found difference.
  const toast = state.effects.toast;
  if (toast && time - toast.at < 2200) {
    const alpha = Math.min(1, (2200 - (time - toast.at)) / 500);
    ctx.globalAlpha = alpha;
    text(ctx, toast.text, 640, 606, 'bold 19px Georgia, serif', '#7ee787', 'center');
    ctx.globalAlpha = 1;
  }
}

function dim(ctx) {
  ctx.fillStyle = 'rgba(10,12,28,0.72)';
  ctx.fillRect(0, 0, W, H);
}

function panel(ctx, title, lines, accent) {
  const w = 640;
  const h = 300;
  const x = (W - w) / 2;
  const y = (H - h) / 2 - 20;
  ctx.fillStyle = '#1d2340';
  rr(ctx, x, y, w, h, 18);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, title, W / 2, y + 44, 'bold 34px Georgia, serif', '#fff6d8', 'center');
  let ly = y + 96;
  for (const line of lines) {
    text(ctx, line, W / 2, ly, '20px Georgia, serif', '#d5dbf0', 'center');
    ly += 34;
  }
  return { x, y, w, h };
}

export function drawGame(ctx, state, time) {
  // Backdrop.
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#241b3d');
  bg.addColorStop(1, '#141126');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const scene = SCENES[state.levelIndex];

  if (state.screen === 'menu') {
    drawMenu(ctx, state, time);
    return;
  }

  // Panels.
  drawPanelFrame(ctx, PANEL.left.x, 'PICTURE A', state.found.size, scene.differences.length);
  drawPanelFrame(ctx, PANEL.right.x, 'PICTURE B', state.found.size, scene.differences.length);
  for (const name of ['left', 'right']) {
    const p = PANEL[name];
    ctx.save();
    ctx.beginPath();
    ctx.rect(p.x, p.y, PANEL.width, PANEL.height);
    ctx.clip();
    ctx.translate(p.x, p.y);
    PAINTERS[scene.painter](ctx, name === 'right', time);
    ctx.restore();
  }
  drawMarkers(ctx, state, time);
  drawHud(ctx, state, time);

  if (state.screen === 'levelClear') {
    dim(ctx);
    const stars = state.timeLeft / scene.timeLimit > 0.5 ? 3 : (state.timeLeft / scene.timeLimit > 0.2 ? 2 : 1);
    const p = panel(ctx, 'Level Clear!', [
      `${scene.name} — all ${scene.differences.length} differences found`,
      `Time bonus  +${state.levelBonus}   ·   Score ${state.score}`,
      `Accuracy ${state.accuracy}%  ·  Best combo x${state.bestCombo}`,
    ], '#7ee787');
    text(ctx, '★'.repeat(stars) + '☆'.repeat(3 - stars), W / 2, p.y + 208,
      'bold 40px Georgia, serif', '#ffd93b', 'center');
    const last = state.levelIndex === SCENES.length - 1;
    button(ctx, BUTTONS.next, last ? 'See Results' : 'Next Level →', 'Enter', true, true);
  } else if (state.screen === 'gameClear') {
    dim(ctx);
    const p = panel(ctx, 'You Found Them All!', [
      `Total score  ${state.score}`,
      `Accuracy ${state.accuracy}%  ·  ${state.finds} found, ${state.misses} misses`,
      'Three scenes, twenty-one differences — sharp eyes, bray!',
    ], '#ffd93b');
    text(ctx, '★ ★ ★', W / 2, p.y + 208, 'bold 40px Georgia, serif', '#ffd93b', 'center');
    button(ctx, BUTTONS.playAgain, 'Play Again', 'R', true, true);
  } else if (state.screen === 'timeUp') {
    dim(ctx);
    panel(ctx, "Time's Up!", [
      `${scene.name} — ${state.found.size} of ${scene.differences.length} found`,
      `Score ${state.score} — so close, the lanterns are still waiting.`,
      'Try again: the differences never move, but your eyes get faster.',
    ], '#e63946');
    button(ctx, BUTTONS.again, 'Try Again', 'R', true, true);
  }
}

function drawMenu(ctx, state, time) {
  // Title.
  text(ctx, 'TWIN LANTERNS', W / 2, 108, 'bold 54px Georgia, serif', '#ffd93b', 'center');
  text(ctx, 'A spot-the-difference hunt in three hand-drawn scenes', W / 2, 158,
    '22px Georgia, serif', '#d5dbf0', 'center');
  text(ctx, 'Two pictures side by side · 7 differences in each · click what changed', W / 2, 190,
    '18px Georgia, serif', '#9aa5c8', 'center');

  // Level cards.
  const cardW = 360;
  const cardH = 250;
  const gap = 30;
  const totalW = cardW * 3 + gap * 2;
  const x0 = (W - totalW) / 2;
  const y0 = 240;
  SCENES.forEach((scene, i) => {
    const x = x0 + i * (cardW + gap);
    const hover = state.menuHover === i;
    ctx.fillStyle = hover ? '#2b3358' : '#1d2340';
    rr(ctx, x, y0, cardW, cardH, 16);
    ctx.fill();
    ctx.strokeStyle = i === 0 ? '#f5b301' : '#3a4470';
    ctx.lineWidth = 2;
    ctx.stroke();
    // A tiny preview: the scene painted small.
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 14, y0 + 14, cardW - 28, 130);
    ctx.clip();
    ctx.translate(x + 14, y0 + 14);
    ctx.scale((cardW - 28) / 600, 130 / 520);
    PAINTERS[scene.painter](ctx, false, time);
    ctx.restore();
    text(ctx, `${i + 1}. ${scene.name}`, x + cardW / 2, y0 + 178,
      'bold 22px Georgia, serif', '#fff6d8', 'center');
    text(ctx, `${scene.difficulty} · ${scene.timeLimit}s · 7 differences`, x + cardW / 2, y0 + 208,
      '16px Georgia, serif', '#9aa5c8', 'center');
    text(ctx, state.best[i] ? `Best score: ${state.best[i]}` : 'Not played yet', x + cardW / 2, y0 + 232,
      '15px Georgia, serif', '#7ee787', 'center');
  });

  text(ctx, 'Click a scene, or press 1 – 3 · H hint · M sound · R restart · Esc menu', W / 2, 548,
    '17px Georgia, serif', '#9aa5c8', 'center');
  text(ctx, 'Wrong clicks cost 5 seconds. Hints cost 50 points. Streaks multiply your score.',
    W / 2, 580, '16px Georgia, serif', '#7c86a3', 'center');

  // Footer strip with the rules of the hunt, drawn as a mini scene strip.
  ctx.fillStyle = '#1d2340';
  rr(ctx, 240, 620, 800, 56, 12);
  ctx.fill();
  text(ctx, 'Find them all before the lanterns burn down.', 640, 649,
    'italic 18px Georgia, serif', '#ffe9a8', 'center');
}

// Re-exported so main.js can ask which menu card a point falls on.
export function menuCardAt(point) {
  const cardW = 360;
  const cardH = 250;
  const gap = 30;
  const totalW = cardW * 3 + gap * 2;
  const x0 = (W - totalW) / 2;
  const y0 = 240;
  if (point.y < y0 || point.y > y0 + cardH) return -1;
  for (let i = 0; i < 3; i += 1) {
    const x = x0 + i * (cardW + gap);
    if (point.x >= x && point.x <= x + cardW) return i;
  }
  return -1;
}

export { inside, BUTTONS };
