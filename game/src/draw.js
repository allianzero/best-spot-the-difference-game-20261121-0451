// Scene painters for Twin Lanterns. Each painter draws one whole scene into
// the current 600 x 520 clip. It is called twice per frame: once plain for the
// left panel and once with `changed` true for the right panel, where every
// difference in scenes.js is applied. Nothing is loaded from disk — all art
// is vector shapes drawn here, so the game plays with no network request.

import { seededRandom } from './scenes.js';

export function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

export function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function poly(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

// ---------------------------------------------------------------- garden --

export function paintGarden(ctx, changed, time) {
  // Sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 520);
  sky.addColorStop(0, '#8ec9ee');
  sky.addColorStop(0.55, '#cfeefb');
  sky.addColorStop(1, '#eaf9e4');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 520);

  // Sun with rays (difference: rays vanish on the right).
  ctx.fillStyle = '#ffd93b';
  circle(ctx, 90, 70, 34);
  ctx.fillStyle = '#ffedb0';
  circle(ctx, 90, 70, 26);
  if (!changed) {
    ctx.strokeStyle = '#f5b301';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2;
      line(ctx, 90 + Math.cos(a) * 42, 70 + Math.sin(a) * 42,
        90 + Math.cos(a) * 54, 70 + Math.sin(a) * 54);
    }
  }

  // Clouds drift a touch with time.
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  const drift = Math.sin(time / 2400) * 6;
  ellipse(ctx, 210 + drift, 58, 46, 18);
  ellipse(ctx, 240 + drift, 66, 38, 15);
  ellipse(ctx, 430 - drift, 88, 52, 18);
  ellipse(ctx, 462 - drift, 96, 36, 14);
  ellipse(ctx, 520 + drift, 48, 34, 13);

  // Rolling hills.
  ctx.fillStyle = '#7cc46a';
  ctx.beginPath();
  ctx.moveTo(0, 330);
  ctx.quadraticCurveTo(180, 280, 360, 330);
  ctx.quadraticCurveTo(480, 365, 600, 320);
  ctx.lineTo(600, 520);
  ctx.lineTo(0, 520);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#69b455';
  ctx.beginPath();
  ctx.moveTo(0, 400);
  ctx.quadraticCurveTo(200, 360, 420, 405);
  ctx.quadraticCurveTo(520, 425, 600, 395);
  ctx.lineTo(600, 520);
  ctx.lineTo(0, 520);
  ctx.closePath();
  ctx.fill();

  // Cottage.
  ctx.fillStyle = '#fff3d6';
  ctx.fillRect(150, 260, 180, 160);
  ctx.fillStyle = '#e2603f';
  poly(ctx, [[132, 266], [348, 266], [240, 182]]);
  ctx.fillStyle = '#b94a2e';
  poly(ctx, [[132, 266], [348, 266], [336, 278], [144, 278]]);
  // Chimney and its smoke (difference: smoke vanishes on the right).
  ctx.fillStyle = '#9c6b4f';
  ctx.fillRect(300, 202, 26, 64);
  ctx.fillStyle = '#7d543d';
  ctx.fillRect(296, 196, 34, 10);
  if (!changed) {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    circle(ctx, 312, 182, 12);
    circle(ctx, 322, 166, 15);
    circle(ctx, 308, 148, 11);
  }
  // Door.
  ctx.fillStyle = '#8a5a2b';
  rr(ctx, 224, 328, 52, 92, 6);
  ctx.fill();
  ctx.fillStyle = '#ffd93b';
  circle(ctx, 266, 376, 4);
  // Window with cross bars and a flower box (difference: box vanishes).
  ctx.fillStyle = '#7fb6d9';
  ctx.fillRect(168, 300, 48, 46);
  ctx.strokeStyle = '#fff3d6';
  ctx.lineWidth = 5;
  line(ctx, 192, 300, 192, 346);
  line(ctx, 168, 323, 216, 323);
  if (!changed) {
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(162, 346, 60, 12);
    ctx.fillStyle = '#ff5d8f';
    circle(ctx, 172, 344, 6);
    circle(ctx, 192, 342, 6);
    circle(ctx, 212, 344, 6);
    ctx.fillStyle = '#3f9e4d';
    circle(ctx, 182, 346, 4);
    circle(ctx, 202, 346, 4);
  }

  // Tree with apples (difference: one apple is missing on the right).
  ctx.fillStyle = '#7a4a21';
  ctx.fillRect(472, 300, 22, 122);
  ctx.fillStyle = '#4e9e44';
  circle(ctx, 482, 248, 58);
  circle(ctx, 436, 272, 42);
  circle(ctx, 528, 272, 42);
  ctx.fillStyle = '#67b957';
  circle(ctx, 462, 232, 30);
  circle(ctx, 505, 238, 26);
  ctx.fillStyle = '#e63946';
  if (!changed) circle(ctx, 445, 278, 9);
  circle(ctx, 500, 270, 9);
  circle(ctx, 480, 228, 9);

  // Garden path.
  ctx.fillStyle = '#e8d5a7';
  poly(ctx, [[232, 420], [268, 420], [292, 520], [208, 520]]);

  // Picket fence (difference: one picket is missing on the right).
  ctx.fillStyle = '#f7f3e8';
  ctx.fillRect(40, 428, 520, 8);
  for (let x = 60; x <= 540; x += 40) {
    if (changed && x === 120) continue;
    ctx.fillRect(x, 414, 10, 28);
    poly(ctx, [[x, 414], [x + 10, 414], [x + 5, 404]]);
  }

  // Flower bed: tulips, one of which changes colour (difference).
  const tulipXs = [80, 160, 240, 320, 400, 480, 520];
  for (const x of tulipXs) {
    ctx.strokeStyle = '#3f9e4d';
    ctx.lineWidth = 4;
    line(ctx, x, 470, x, 500);
    ctx.fillStyle = x === 520 ? (changed ? '#ffd93b' : '#e63946') : '#ff5d8f';
    circle(ctx, x, 466, 9);
    ctx.fillStyle = '#3f9e4d';
    ellipse(ctx, x - 8, 488, 7, 4);
  }

  // Butterfly (difference: gone on the right). It bobs gently with time.
  if (!changed) {
    const bob = Math.sin(time / 500) * 6;
    const bx = 352;
    const by = 182 + bob;
    ctx.fillStyle = '#b388ff';
    ellipse(ctx, bx - 12, by, 13, 9);
    ellipse(ctx, bx + 12, by, 13, 9);
    ctx.fillStyle = '#7c4dff';
    ellipse(ctx, bx - 12, by, 7, 5);
    ellipse(ctx, bx + 12, by, 7, 5);
    ctx.fillStyle = '#3d2b63';
    ellipse(ctx, bx, by, 3, 9);
  }

  // Grass tufts and pebbles.
  ctx.strokeStyle = '#4e9e44';
  ctx.lineWidth = 3;
  for (const [gx, gy] of [[60, 505], [340, 505], [560, 500], [30, 455], [575, 455]]) {
    line(ctx, gx, gy, gx - 4, gy - 10);
    line(ctx, gx, gy, gx + 4, gy - 10);
  }
}

// --------------------------------------------------------------- harbour --

export function paintHarbour(ctx, changed, time) {
  // Dusk sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 320);
  sky.addColorStop(0, '#232f5e');
  sky.addColorStop(0.6, '#5b4a7d');
  sky.addColorStop(1, '#e8915a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 320);

  // Early stars, fixed by seed so both panels agree.
  const rand = seededRandom(7);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  for (let i = 0; i < 26; i += 1) {
    const sx = 20 + rand() * 560;
    const sy = 12 + rand() * 130;
    const tw = 0.5 + 0.5 * Math.sin(time / 700 + i);
    ctx.globalAlpha = 0.35 + 0.5 * tw;
    circle(ctx, sx, sy, 1.6);
  }
  ctx.globalAlpha = 1;

  // Moon: full on the left, a crescent on the right (difference).
  ctx.fillStyle = '#fdf3c4';
  circle(ctx, 480, 70, 28);
  ctx.fillStyle = '#e8d795';
  circle(ctx, 472, 64, 5);
  circle(ctx, 488, 78, 4);
  if (changed) {
    ctx.fillStyle = '#3a4470';
    circle(ctx, 492, 62, 24);
  }

  // Sea.
  const sea = ctx.createLinearGradient(0, 300, 0, 520);
  sea.addColorStop(0, '#33507e');
  sea.addColorStop(1, '#1b2c4e');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 300, 600, 220);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 2;
  for (let y = 330; y < 510; y += 36) {
    const off = (y * 7) % 60;
    line(ctx, 30 + off, y, 150 + off, y);
    line(ctx, 330 + off, y + 14, 470 + off, y + 14);
  }

  // Lighthouse.
  ctx.fillStyle = '#f4ede0';
  ctx.fillRect(60, 120, 50, 200);
  ctx.fillStyle = '#d94f3d';
  ctx.fillRect(60, 160, 50, 26);
  ctx.fillRect(60, 230, 50, 26);
  ctx.fillStyle = '#3a3f4a';
  ctx.fillRect(54, 96, 62, 26);
  ctx.fillStyle = '#ffe08a';
  ctx.fillRect(66, 104, 38, 12);
  ctx.fillStyle = '#3a3f4a';
  poly(ctx, [[50, 98], [120, 98], [85, 78]]);
  // Lamp-room window: lit on the left, dark on the right (difference).
  ctx.fillStyle = changed ? '#2c3242' : '#ffe08a';
  ctx.fillRect(78, 196, 14, 18);
  // Beam: shining on the left, off on the right (difference).
  if (!changed) {
    ctx.fillStyle = 'rgba(255,224,138,0.30)';
    poly(ctx, [[110, 108], [330, 78], [330, 168]]);
    ctx.fillStyle = 'rgba(255,224,138,0.16)';
    poly(ctx, [[110, 112], [380, 96], [380, 150]]);
  }

  // Pier with crates (difference: the top crate is missing on the right).
  ctx.fillStyle = '#8a6a45';
  ctx.fillRect(180, 380, 380, 16);
  ctx.fillStyle = '#6e5233';
  for (let x = 180; x < 560; x += 28) ctx.fillRect(x, 380, 3, 16);
  ctx.fillStyle = '#a87c4f';
  ctx.fillRect(200, 396, 10, 40);
  ctx.fillRect(520, 396, 10, 40);
  ctx.fillStyle = '#c99a5b';
  ctx.fillRect(196, 352, 44, 28);
  ctx.fillRect(240, 352, 44, 28);
  if (!changed) ctx.fillRect(218, 324, 44, 28);
  ctx.strokeStyle = '#8a6a45';
  ctx.lineWidth = 2;
  ctx.strokeRect(196, 352, 44, 28);
  ctx.strokeRect(240, 352, 44, 28);
  if (!changed) ctx.strokeRect(218, 324, 44, 28);

  // Boat one with sail and flag (difference: flag gone on the right).
  ctx.fillStyle = '#5b3a29';
  poly(ctx, [[228, 332], [292, 332], [282, 356], [238, 356]]);
  ctx.fillStyle = '#7a4a21';
  ctx.fillRect(256, 288, 6, 46);
  ctx.fillStyle = '#fdf6e3';
  poly(ctx, [[262, 292], [262, 330], [296, 330]]);
  if (!changed) {
    ctx.fillStyle = '#d94f3d';
    poly(ctx, [[262, 284], [286, 290], [262, 296]]);
  }

  // Boat two.
  ctx.fillStyle = '#31456b';
  poly(ctx, [[408, 358], [472, 358], [462, 380], [418, 380]]);
  ctx.fillStyle = '#7a4a21';
  ctx.fillRect(436, 318, 6, 42);
  ctx.fillStyle = '#ffd93b';
  poly(ctx, [[442, 322], [442, 356], [472, 356]]);

  // Gulls (difference: one gull fewer on the right).
  ctx.strokeStyle = '#20263f';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  const gulls = [[180, 80], [300, 92], [380, 70]];
  for (const [gx, gy] of gulls) {
    if (changed && gx === 300) continue;
    ctx.beginPath();
    ctx.moveTo(gx - 12, gy);
    ctx.quadraticCurveTo(gx - 4, gy - 8, gx, gy);
    ctx.quadraticCurveTo(gx + 4, gy - 8, gx + 12, gy);
    ctx.stroke();
  }

  // Buoy (difference: gone on the right).
  if (!changed) {
    ctx.fillStyle = '#d94f3d';
    poly(ctx, [[506, 446], [534, 446], [528, 420], [512, 420]]);
    ctx.fillStyle = '#fdf6e3';
    ctx.fillRect(508, 432, 24, 7);
    ctx.fillStyle = '#3a3f4a';
    circle(ctx, 520, 414, 4);
  }

  // Moonlight and lamplight on the water.
  ctx.fillStyle = 'rgba(253,243,196,0.35)';
  ctx.fillRect(470, 320, 20, 160);
  ctx.fillStyle = 'rgba(255,224,138,0.20)';
  ctx.fillRect(80, 320, 14, 120);
}

// ---------------------------------------------------------------- market --

export function paintMarket(ctx, changed, time) {
  // Night sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 520);
  sky.addColorStop(0, '#10142b');
  sky.addColorStop(0.7, '#1d2340');
  sky.addColorStop(1, '#2c2a4a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 520);

  // Stars, fixed by seed (difference: one star is missing on the right).
  const rand = seededRandom(21);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  for (let i = 0; i < 30; i += 1) {
    const sx = 16 + rand() * 568;
    const sy = 10 + rand() * 120;
    const tw = 0.5 + 0.5 * Math.sin(time / 600 + i * 1.7);
    ctx.globalAlpha = 0.3 + 0.6 * tw;
    circle(ctx, sx, sy, 1.7);
  }
  ctx.globalAlpha = 1;
  // One named star is drawn exactly here on the left only, so the
  // "missing star" difference always exists (difference).
  if (!changed) {
    ctx.fillStyle = '#fff6c9';
    circle(ctx, 420, 52, 2.6);
    ctx.fillStyle = 'rgba(255,246,201,0.4)';
    circle(ctx, 420, 52, 6);
  }

  // Moon.
  ctx.fillStyle = '#f4ead0';
  circle(ctx, 90, 60, 24);
  ctx.fillStyle = '#ddd2ae';
  circle(ctx, 82, 54, 4);
  circle(ctx, 96, 66, 3);

  // String lights across the top (difference: one bulb is dark on the right).
  ctx.strokeStyle = '#0c0f1f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(20, 36);
  ctx.quadraticCurveTo(300, 108, 580, 36);
  ctx.stroke();
  for (let i = 0; i <= 12; i += 1) {
    const t = i / 12;
    const bx = 20 + t * 560;
    const by = 36 + Math.sin(t * Math.PI) * 36;
    const lit = !(changed && i === 4);
    ctx.fillStyle = lit ? '#ffd93b' : '#3a3f4a';
    circle(ctx, bx, by + 8, 6);
    if (lit) {
      ctx.fillStyle = 'rgba(255,217,59,0.25)';
      circle(ctx, bx, by + 8, 12);
    }
  }

  // Hanging banner (difference: its tassel is missing on the right).
  ctx.fillStyle = '#8e2f3c';
  ctx.fillRect(296, 118, 74, 40);
  ctx.strokeStyle = '#d9a441';
  ctx.lineWidth = 3;
  ctx.strokeRect(296, 118, 74, 40);
  ctx.fillStyle = '#f4d58d';
  circle(ctx, 333, 138, 9);
  if (!changed) {
    ctx.strokeStyle = '#d9a441';
    ctx.lineWidth = 3;
    line(ctx, 333, 158, 333, 170);
    ctx.fillStyle = '#d9a441';
    poly(ctx, [[327, 170], [339, 170], [333, 182]]);
  }

  // Stall left: striped awning, counter, fruit baskets.
  const awning = (x0, c1, c2, stripeChanged) => {
    for (let i = 0; i < 5; i += 1) {
      let c = i % 2 === 0 ? c1 : c2;
      if (stripeChanged && i === 2) c = '#e8913a';
      ctx.fillStyle = c;
      ctx.fillRect(x0 + i * 40, 140, 40, 40);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(x0, 172, 200, 8);
  };
  awning(60, '#d94f3d', '#fdf6e3', false);
  ctx.fillStyle = '#6e4a2f';
  ctx.fillRect(60, 300, 200, 40);
  ctx.fillStyle = '#8a6a45';
  ctx.fillRect(56, 296, 208, 10);
  // Fruit baskets on the counter.
  ctx.fillStyle = '#a87c4f';
  ellipse(ctx, 110, 296, 34, 10);
  ellipse(ctx, 210, 296, 34, 10);
  ctx.fillStyle = '#e63946';
  circle(ctx, 98, 288, 8);
  circle(ctx, 118, 286, 8);
  circle(ctx, 108, 278, 8);
  ctx.fillStyle = '#ff9f1c';
  circle(ctx, 202, 288, 8);
  circle(ctx, 220, 286, 8);
  circle(ctx, 210, 278, 8);
  // A single apple sits on the counter between the baskets
  // (difference: missing on the right).
  if (!changed) {
    ctx.fillStyle = '#e63946';
    circle(ctx, 160, 292, 9);
    ctx.fillStyle = '#3f9e4d';
    ellipse(ctx, 166, 284, 5, 3);
  }

  // Stall right: awning with one stripe recoloured (difference).
  awning(340, '#2a9d8f', '#fdf6e3', changed);
  ctx.fillStyle = '#6e4a2f';
  ctx.fillRect(340, 300, 200, 40);
  ctx.fillStyle = '#8a6a45';
  ctx.fillRect(336, 296, 208, 10);
  // Jars and pots on the counter.
  ctx.fillStyle = '#7fb6d9';
  rr(ctx, 370, 268, 26, 28, 5);
  ctx.fill();
  ctx.fillStyle = '#e8915a';
  rr(ctx, 410, 264, 26, 32, 5);
  ctx.fill();
  ctx.fillStyle = '#b388ff';
  rr(ctx, 450, 270, 26, 26, 5);
  ctx.fill();
  ctx.fillStyle = '#ffd93b';
  rr(ctx, 490, 266, 26, 30, 5);
  ctx.fill();

  // Paper lanterns (difference: the middle one is green, not red, on the right).
  const lanternXs = [90, 180, 300, 400, 500];
  const sway = Math.sin(time / 900) * 3;
  for (const lx of lanternXs) {
    const ly = 232;
    ctx.strokeStyle = '#0c0f1f';
    ctx.lineWidth = 2;
    line(ctx, lx, 196, lx, 208);
    const isMiddle = lx === 300;
    ctx.fillStyle = isMiddle ? (changed ? '#2a9d8f' : '#d94f3d') : '#e8913a';
    ctx.globalAlpha = 0.9;
    ellipse(ctx, lx + sway, ly, 20, 26);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#8e2f3c';
    ctx.fillRect(lx + sway - 8, ly - 30, 16, 7);
    ctx.fillRect(lx + sway - 8, ly + 24, 16, 7);
    ctx.fillStyle = 'rgba(255,217,59,0.30)';
    circle(ctx, lx + sway, ly, 30);
  }

  // Cobbles.
  ctx.fillStyle = '#262b47';
  ctx.fillRect(0, 420, 600, 100);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 2;
  for (let y = 440; y < 520; y += 26) line(ctx, 0, y, 600, y);
  for (let x = 40; x < 600; x += 52) line(ctx, x, 420, x, 520);

  // Crate with the market cat (difference: the cat is gone on the right).
  ctx.fillStyle = '#a87c4f';
  ctx.fillRect(448, 388, 64, 34);
  ctx.strokeStyle = '#6e4a2f';
  ctx.lineWidth = 2;
  ctx.strokeRect(448, 388, 64, 34);
  line(ctx, 448, 405, 512, 405);
  if (!changed) {
    ctx.fillStyle = '#3d2b63';
    ellipse(ctx, 480, 380, 22, 14);
    circle(ctx, 496, 362, 12);
    poly(ctx, [[488, 352], [492, 340], [498, 351]]);
    poly(ctx, [[500, 351], [506, 340], [508, 353]]);
    ctx.strokeStyle = '#3d2b63';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(460, 388);
    ctx.quadraticCurveTo(446, 378, 452, 362);
    ctx.stroke();
    ctx.fillStyle = '#ffd93b';
    circle(ctx, 500, 360, 2);
  }
}

export const PAINTERS = { paintGarden, paintHarbour, paintMarket };
