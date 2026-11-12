// Canvas-drawn textures: paper, posters, signs, covers. Everything analog in the
// studio is drawn here so the collage look stays one system.
import * as THREE from 'three';
import { rng, loadImage } from './util.js';
import { L, getLang } from './i18n.js';

export const C = {
  char: '#0E1014', cream: '#EDE6D3', red: '#D1140D', amber: '#FFB83F', cyan: '#58D6F2',
  cobalt: '#14225e', marigold: '#F2B01E', walnut: '#3a2416', kraft: '#b89b72', ink: '#16171b',
};
export const F = {
  serif: (px, w = 900) => `${w} ${px}px Butler, "Bodoni 72", Didot, Georgia, serif`,
  cond: (px, w = 700) => `${w} ${px}px "WF Cond", "Barlow Condensed", "Arial Narrow", sans-serif`,
  mono: (px, w = 400) => `${w} ${px}px "JetBrains Mono", ui-monospace, Menlo, monospace`,
};

export async function fontsReady() {
  const list = [F.serif(40), F.serif(40, 700), F.serif(40, 400), F.cond(40), F.cond(40, 600), F.mono(20), F.mono(20, 700)];
  try { await Promise.all(list.map((f) => document.fonts.load(f, 'WARGA Films 0123'))); } catch (e) { /* fall back to system faces */ }
}

export function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}
export function tex(c, { repeat = null, aniso = 8, srgb = true } = {}) {
  const tx = new THREE.CanvasTexture(c);
  if (srgb) tx.colorSpace = THREE.SRGBColorSpace;
  tx.anisotropy = aniso;
  if (repeat) { tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(repeat[0], repeat[1]); }
  return tx;
}

// ---------- drawing primitives ----------
export function grainFill(ctx, x, y, w, h, color, amount = 0.08, seed = 7) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  const r = rng(seed);
  const n = Math.round((w * h) / 90);
  for (let i = 0; i < n; i++) {
    const a = r() * amount;
    ctx.fillStyle = r() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a * 1.3})`;
    ctx.fillRect(x + r() * w, y + r() * h, 1 + r() * 2, 1 + r() * 2);
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.05)';
  for (let i = 0; i < n / 60; i++) {
    const px = x + r() * w, py = y + r() * h;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + (r() - 0.5) * 30, py + (r() - 0.5) * 6); ctx.stroke();
  }
}
/** A rectangle with torn-paper edges. */
export function tornPath(ctx, x, y, w, h, jag = 5, seed = 3) {
  const r = rng(seed);
  const step = 11;
  ctx.beginPath();
  ctx.moveTo(x, y);
  for (let i = step; i < w; i += step) ctx.lineTo(x + i, y + (r() - 0.5) * jag);
  ctx.lineTo(x + w, y);
  for (let i = step; i < h; i += step) ctx.lineTo(x + w + (r() - 0.5) * jag, y + i);
  ctx.lineTo(x + w, y + h);
  for (let i = w - step; i > 0; i -= step) ctx.lineTo(x + i, y + h + (r() - 0.5) * jag);
  ctx.lineTo(x, y + h);
  for (let i = h - step; i > 0; i -= step) ctx.lineTo(x + (r() - 0.5) * jag, y + i);
  ctx.closePath();
}
export function paperPiece(ctx, x, y, w, h, color, { rot = 0, jag = 5, seed = 1, shadow = true } = {}) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  if (shadow) { ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 5; }
  tornPath(ctx, -w / 2, -h / 2, w, h, jag, seed);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.clip();
  const r = rng(seed + 11);
  for (let i = 0; i < (w * h) / 260; i++) {
    ctx.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    ctx.fillRect(-w / 2 + r() * w, -h / 2 + r() * h, 2, 2);
  }
  return () => ctx.restore();
}
export function coverImage(ctx, img, x, y, w, h, fx = 0.5, fy = 0.5) {
  if (!img) { ctx.fillStyle = '#222'; ctx.fillRect(x, y, w, h); return; }
  const s = Math.max(w / img.width, h / img.height);
  const sw = w / s, sh = h / s;
  ctx.drawImage(img, (img.width - sw) * fx, (img.height - sh) * fy, sw, sh, x, y, w, h);
}
export function spaced(ctx, text, x, y, gap) {
  let px = x;
  for (const ch of text) { ctx.fillText(ch, px, y); px += ctx.measureText(ch).width + gap; }
  return px - gap;
}
export function spacedWidth(ctx, text, gap) {
  let w = 0;
  for (const ch of text) w += ctx.measureText(ch).width + gap;
  return w - gap;
}
export function wrapLines(ctx, text, maxW) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}
export function tape(ctx, x, y, w, h, rot, color = 'rgba(237,230,211,0.55)') {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = color;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(-w / 2, -h / 2, w, h * 0.3);
  ctx.restore();
}
export function halftone(ctx, x, y, w, h, color, step = 9, maxR = 3.2) {
  ctx.fillStyle = color;
  for (let j = 0; j < h; j += step) {
    for (let i = (j / step) % 2 ? step / 2 : 0; i < w; i += step) {
      const k = 1 - j / h;
      ctx.beginPath(); ctx.arc(x + i, y + j, maxR * k, 0, 7); ctx.fill();
    }
  }
}
export function burst(ctx, cx, cy, r1, r2, n, color) {
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2;
    const r = i % 2 ? r1 : r2;
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fillStyle = color; ctx.fill();
}
/** The WARGA ■ FILMS lockup. Returns its width. `h` is the cap height of WARGA. */
export function drawLogo(ctx, x, y, h, fg = C.cream, withTag = false) {
  const size = h / 0.7;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = fg;
  ctx.font = F.serif(size);
  const w = spaced(ctx, 'WARGA', x, y + h, size * 0.02) - x;
  const fh = h * 0.42;
  ctx.fillStyle = C.red;
  ctx.fillRect(x + 1, y + h * 1.26, fh * 0.78, fh * 0.78);
  ctx.fillStyle = fg;
  ctx.font = F.cond(fh / 0.7);
  spaced(ctx, 'FILMS', x + fh * 1.28, y + h * 1.26 + fh * 0.8, fh * 0.3);
  if (withTag) {
    ctx.fillStyle = 'rgba(237,230,211,0.6)';
    ctx.font = F.mono(h * 0.16);
    spaced(ctx, 'DOKUMENTARI · BAHASA MELAYU', x, y + h * 2.15, h * 0.07);
  }
  return w;
}

// ---------- room surfaces ----------
export function floorTex() {
  const [c, ctx] = canvas(1024, 1024);
  const r = rng(21);
  ctx.fillStyle = '#17120e'; ctx.fillRect(0, 0, 1024, 1024);
  const pw = 128;
  for (let i = 0; i < 8; i++) {
    let y = -r() * 400;
    while (y < 1024) {
      const len = 300 + r() * 420;
      const v = 18 + r() * 16;
      ctx.fillStyle = `rgb(${v + 12},${v + 3},${v - 5})`;
      ctx.fillRect(i * pw + 1, y + 1, pw - 2, len - 2);
      for (let k = 0; k < 26; k++) {
        ctx.strokeStyle = `rgba(${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 220 : 0},${r() > 0.5 ? 180 : 0},${0.02 + r() * 0.035})`;
        const gx = i * pw + r() * pw;
        ctx.beginPath(); ctx.moveTo(gx, y); ctx.bezierCurveTo(gx + (r() - 0.5) * 12, y + len * 0.3, gx + (r() - 0.5) * 12, y + len * 0.7, gx + (r() - 0.5) * 8, y + len); ctx.stroke();
      }
      y += len;
    }
  }
  return tex(c, { repeat: [5, 3.6] });
}
export function rugTex() {
  const [c, ctx] = canvas(1024, 744);
  grainFill(ctx, 0, 0, 1024, 744, '#191b22', 0.1, 4);
  ctx.strokeStyle = C.cream; ctx.lineWidth = 10; ctx.strokeRect(34, 34, 956, 676);
  ctx.lineWidth = 3; ctx.strokeRect(58, 58, 908, 628);
  ctx.strokeStyle = C.red; ctx.lineWidth = 6; ctx.strokeRect(76, 76, 872, 592);
  ctx.strokeStyle = 'rgba(237,230,211,0.16)'; ctx.lineWidth = 2;
  for (let i = 0; i < 26; i++) {
    ctx.beginPath(); ctx.moveTo(110 + i * 32, 110); ctx.lineTo(110 + i * 32 + 60, 634); ctx.stroke();
  }
  ctx.fillStyle = '#191b22'; ctx.fillRect(250, 250, 524, 244);
  drawLogo(ctx, 318, 292, 78, C.cream);
  const r = rng(9);
  for (let i = 0; i < 7000; i++) { ctx.fillStyle = `rgba(0,0,0,${r() * 0.25})`; ctx.fillRect(r() * 1024, r() * 744, 2, 3); }
  return tex(c);
}
export function stageRugTex() {
  const [c, ctx] = canvas(768, 768);
  ctx.clearRect(0, 0, 768, 768);
  ctx.save(); ctx.beginPath(); ctx.arc(384, 384, 380, 0, 7); ctx.clip();
  grainFill(ctx, 0, 0, 768, 768, '#5c1410', 0.12, 12);
  const rings = [[350, C.cream, 8], [320, '#1a1a1e', 22], [280, C.marigold, 5], [200, C.cream, 3], [120, '#1a1a1e', 16]];
  for (const [rr, col, lw] of rings) { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.arc(384, 384, rr, 0, 7); ctx.stroke(); }
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    ctx.fillStyle = i % 2 ? C.cream : C.marigold;
    ctx.beginPath(); ctx.arc(384 + Math.cos(a) * 240, 384 + Math.sin(a) * 240, 9, 0, 7); ctx.fill();
  }
  ctx.restore();
  return tex(c);
}
export function checkerTex() {
  const [c, ctx] = canvas(512, 512);
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
    grainFill(ctx, i * 128, j * 128, 128, 128, (i + j) % 2 ? '#e4dcc6' : '#23262d', 0.07, 30 + i * 4 + j);
  }
  return tex(c, { repeat: [3, 3] });
}
export function paperWallTex() {
  const [c, ctx] = canvas(1024, 512);
  grainFill(ctx, 0, 0, 1024, 512, '#e6dcc4', 0.06, 77);
  const r = rng(5);
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(160,120,70,${r() * 0.05})`;
    ctx.beginPath(); ctx.arc(r() * 1024, r() * 512, 20 + r() * 90, 0, 7); ctx.fill();
  }
  return tex(c, { repeat: [3, 1] });
}

// ---------- signs and art ----------
export function logoSignTex(tag = true) {
  const [c, ctx] = canvas(1024, 420);
  ctx.fillStyle = '#08090b'; ctx.fillRect(0, 0, 1024, 420);
  drawLogo(ctx, 150, 70, 132, '#fff6e2', tag);
  return tex(c);
}
export function textSignTex(text, { w = 512, h = 128, bg = '#0b0c0f', fg = '#fff3da', font = 'cond', size = 76, gap = 14, dot = true } = {}) {
  const [c, ctx] = canvas(w, h);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  ctx.font = font === 'serif' ? F.serif(size) : font === 'mono' ? F.mono(size, 700) : F.cond(size);
  ctx.textBaseline = 'middle';
  const tw = spacedWidth(ctx, text, gap) + (dot ? size * 0.9 : 0);
  let x = (w - tw) / 2;
  if (dot) { ctx.fillStyle = C.red; ctx.fillRect(x, h / 2 - size * 0.3, size * 0.56, size * 0.56); x += size * 0.9; }
  ctx.fillStyle = fg;
  spaced(ctx, text, x, h / 2 + size * 0.04, gap);
  return tex(c);
}
export function bauhausTex() {
  const [c, ctx] = canvas(512, 720);
  grainFill(ctx, 0, 0, 512, 720, '#e9e1cc', 0.07, 3);
  ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(300, 250, 150, 0, 7); ctx.fill();
  ctx.fillStyle = '#121316';
  ctx.beginPath(); ctx.moveTo(60, 470); ctx.arc(60, 470, 210, -Math.PI / 2, 0); ctx.closePath(); ctx.fill();
  ctx.fillRect(60, 520, 392, 26); ctx.fillRect(60, 560, 250, 10);
  ctx.save(); ctx.translate(360, 430); ctx.rotate(-0.5); ctx.fillRect(-150, -9, 300, 18); ctx.restore();
  ctx.fillStyle = C.marigold; ctx.fillRect(360, 580, 92, 92);
  ctx.fillStyle = '#121316'; ctx.font = F.cond(30); spaced(ctx, 'WARGA 2009', 60, 640, 5);
  ctx.font = F.mono(13); ctx.fillText('PULAU BORNEO', 62, 668);
  return tex(c);
}
export function abstractArtTex() {
  const [c, ctx] = canvas(768, 512);
  grainFill(ctx, 0, 0, 768, 512, '#e7dfca', 0.07, 41);
  ctx.fillStyle = '#121316'; ctx.fillRect(0, 0, 768, 150);
  ctx.fillStyle = C.red; ctx.fillRect(0, 362, 768, 150);
  ctx.fillStyle = C.marigold; ctx.beginPath(); ctx.arc(250, 256, 130, 0, 7); ctx.fill();
  ctx.strokeStyle = '#121316'; ctx.lineWidth = 12;
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(430 + i * 46, 180); ctx.lineTo(520 + i * 46, 332); ctx.stroke(); }
  halftone(ctx, 0, 362, 768, 150, 'rgba(0,0,0,0.25)', 12, 4);
  return tex(c);
}
export function ampTex() {
  const [c, ctx] = canvas(256, 256);
  ctx.fillStyle = '#1c1a17'; ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = 'rgba(190,160,110,0.35)'; ctx.lineWidth = 1;
  for (let i = -256; i < 256; i += 6) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 256, 256); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(i + 256, 0); ctx.lineTo(i, 256); ctx.stroke();
  }
  ctx.fillStyle = C.cream; ctx.font = F.serif(26); ctx.fillText('Warga', 16, 40);
  return tex(c);
}
export function drumHeadTex() {
  const [c, ctx] = canvas(512, 512);
  ctx.fillStyle = '#ece5d2'; ctx.beginPath(); ctx.arc(256, 256, 256, 0, 7); ctx.fill();
  const g = ctx.createRadialGradient(256, 256, 40, 256, 256, 256);
  g.addColorStop(0, 'rgba(255,255,255,0.25)'); g.addColorStop(1, 'rgba(120,100,70,0.25)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(256, 256, 256, 0, 7); ctx.fill();
  ctx.fillStyle = '#15161a'; ctx.font = F.serif(84); ctx.textAlign = 'center';
  ctx.fillText('WARGA', 256, 262);
  ctx.fillStyle = C.red; ctx.fillRect(176, 292, 30, 30);
  ctx.fillStyle = '#15161a'; ctx.font = F.cond(46); ctx.textAlign = 'left'; spaced(ctx, 'FILMS', 220, 324, 12);
  ctx.font = F.mono(15); ctx.textAlign = 'center'; ctx.fillText('SEJAK 2009 · BORNEO', 256, 372);
  return tex(c);
}

// ---------- posters, covers, labels ----------
const POSTER_ART = { fl: 'assets/img/reel/r11.jpg', bt: 'assets/img/reel/r06.jpg', kk: 'assets/img/reel/r04.jpg', pr: 'assets/img/reel/r02.jpg' };
const POSTER_BG = { fl: '#0f1a30', bt: '#f0b21f', kk: '#b5140e', pr: '#152569' };
const POSTER_INK = { fl: C.cream, bt: '#111216', kk: C.cream, pr: C.marigold };

export async function posterTex(film) {
  const W = 600, H = 848;
  const [c, ctx] = canvas(W, H);
  const img = await loadImage(POSTER_ART[film.id]);
  const ink = POSTER_INK[film.id];
  grainFill(ctx, 0, 0, W, H, POSTER_BG[film.id], 0.09, film.id.charCodeAt(0));
  if (film.id === 'pr' || film.id === 'bt') burst(ctx, 330, 300, 250, 330, 14, film.id === 'pr' ? C.marigold : C.red);
  if (film.id === 'kk') halftone(ctx, 0, 60, W, 420, 'rgba(0,0,0,0.3)', 14, 5);
  if (film.id === 'fl') { ctx.strokeStyle = 'rgba(88,214,242,0.35)'; ctx.lineWidth = 2; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(300, 300, 40 + i * 34, 0, 7); ctx.stroke(); } }
  // photo cut-out with white border
  const done = paperPiece(ctx, 62, 96, 476, 330, '#f3efe4', { rot: film.id === 'kk' ? 0.035 : -0.03, jag: 6, seed: 5 });
  coverImage(ctx, img, -226, -153, 452, 306);
  ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(210,190,150,0.25)'; ctx.fillRect(-226, -153, 452, 306);
  ctx.globalCompositeOperation = 'source-over';
  done();
  tape(ctx, 110, 96, 110, 30, -0.25); tape(ctx, 500, 110, 96, 28, 0.3);
  // title on a paper strip
  ctx.font = F.serif(56);
  const title = L(film.sub).length < 30 ? L(film.sub) : L(film.title);
  let lines = wrapLines(ctx, title, 470);
  let size = 56;
  while (lines.length > 4 && size > 34) { size -= 4; ctx.font = F.serif(size); lines = wrapLines(ctx, title, 470); }
  ctx.fillStyle = ink; ctx.textBaseline = 'alphabetic';
  lines.forEach((ln, i) => ctx.fillText(ln, 60, 520 + i * size * 1.06));
  const yb = 520 + lines.length * size * 1.06;
  ctx.fillStyle = film.id === 'bt' ? '#111216' : C.red; ctx.fillRect(60, yb - size * 0.5, 22, 22);
  ctx.fillStyle = ink; ctx.font = F.cond(30, 600); spaced(ctx, 'SEBUAH DOKUMENTARI WARGA FILMS', 94, yb - size * 0.5 + 21, 3);
  // footer
  ctx.fillStyle = ink; ctx.globalAlpha = 0.85;
  ctx.font = F.mono(15, 700); ctx.fillText(`${film.code}  ·  ${film.dur}  ·  4K 60 FPS`, 60, H - 54);
  ctx.font = F.mono(13); ctx.fillText('WARGA CREW (NARATOR)  ·  BAHASA MELAYU', 60, H - 32);
  ctx.globalAlpha = 1;
  // stamp
  ctx.save(); ctx.translate(486, H - 150); ctx.rotate(-0.22);
  ctx.strokeStyle = film.id === 'kk' ? C.cream : C.red; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 54, 0, 7); ctx.stroke();
  ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 45, 0, 7); ctx.stroke();
  ctx.fillStyle = ctx.strokeStyle; ctx.font = F.serif(40); ctx.textAlign = 'center'; ctx.fillText('WF', 0, 12);
  ctx.restore();
  return tex(c);
}

export async function vhsCoverTex(film) {
  const W = 320, H = 560;
  const [c, ctx] = canvas(W, H);
  const img = await loadImage(film.img);
  grainFill(ctx, 0, 0, W, H, '#111216', 0.08, 8);
  coverImage(ctx, img, 0, 0, W, 300, film.id === 'kk' || film.id === 'pr' ? 0.0 : 0.72, 0.5);
  const g = ctx.createLinearGradient(0, 200, 0, 300); g.addColorStop(0, 'rgba(17,18,22,0)'); g.addColorStop(1, '#111216');
  ctx.fillStyle = g; ctx.fillRect(0, 200, W, 102);
  ctx.fillStyle = C.red; ctx.fillRect(0, 300, W, 8);
  ctx.fillStyle = C.cream; ctx.font = F.serif(30);
  const lines = wrapLines(ctx, L(film.short), 280);
  lines.slice(0, 2).forEach((ln, i) => ctx.fillText(ln, 20, 356 + i * 34));
  ctx.font = F.cond(22, 600); ctx.fillStyle = 'rgba(237,230,211,0.75)';
  wrapLines(ctx, L(film.sub), 280).slice(0, 3).forEach((ln, i) => ctx.fillText(ln, 20, 356 + lines.length * 34 + 6 + i * 25));
  ctx.fillStyle = C.cream; ctx.fillRect(20, H - 78, 84, 44);
  ctx.fillStyle = '#111216'; ctx.font = F.cond(40); ctx.fillText('VHS', 28, H - 43);
  ctx.fillStyle = C.cream; ctx.font = F.mono(14, 700); ctx.fillText(film.code, 118, H - 60);
  ctx.font = F.mono(13); ctx.fillText(film.dur + '  PAL', 118, H - 42);
  drawLogo(ctx, 216, H - 82, 16, C.cream);
  return tex(c);
}
export function vhsSpineTex(film) {
  const [c, ctx] = canvas(560, 72);
  grainFill(ctx, 0, 0, 560, 72, '#e9e2cf', 0.07, 2);
  ctx.fillStyle = C.red; ctx.fillRect(0, 0, 70, 72);
  ctx.fillStyle = C.cream; ctx.font = F.mono(15, 700); ctx.fillText(film.code.replace('WF-', ''), 18, 43);
  ctx.fillStyle = '#131418'; ctx.font = F.cond(38); spaced(ctx, L(film.short), 88, 50, 3);
  ctx.font = F.mono(13); ctx.textAlign = 'right'; ctx.fillText(film.dur, 544, 44);
  return tex(c);
}
export function bookCoverTex(book) {
  const [c, ctx] = canvas(384, 544);
  grainFill(ctx, 0, 0, 384, 544, book.color, 0.08, book.id.length * 5);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, 0, 18, 544);
  ctx.strokeStyle = book.ink; ctx.lineWidth = 3; ctx.strokeRect(38, 30, 316, 484);
  ctx.fillStyle = book.ink;
  ctx.font = F.serif(46);
  wrapLines(ctx, L(book.title), 270).forEach((ln, i) => ctx.fillText(ln, 60, 120 + i * 50));
  ctx.font = F.mono(15); ctx.fillText(L(book.by).toUpperCase(), 60, 420);
  ctx.fillRect(60, 446, 26, 26);
  ctx.font = F.cond(30); spaced(ctx, 'WARGA FILMS', 98, 470, 4);
  if (book.id === 'skrip') { ctx.font = F.mono(120, 700); ctx.globalAlpha = 0.18; ctx.fillText('?', 250, 390); ctx.globalAlpha = 1; }
  if (book.id === 'lakon') { ctx.globalAlpha = 0.5; for (let i = 0; i < 7; i++) ctx.fillRect(60, 300 + i * 13, 120 + ((i * 53) % 130), 4); ctx.globalAlpha = 1; }
  if (book.id === 'filem') { ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(250, 330, 52, 0, 7); ctx.stroke(); for (let i = 0; i < 5; i++) { const a = i * 1.257; ctx.beginPath(); ctx.arc(250 + Math.cos(a) * 28, 330 + Math.sin(a) * 28, 10, 0, 7); ctx.fill(); } }
  if (book.id === 'nota') { ctx.globalAlpha = 0.6; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 60; i++) { const a = i * 0.35, rr = 6 + i * 1.1; ctx.lineTo(250 + Math.cos(a) * rr, 330 + Math.sin(a) * rr); } ctx.stroke(); ctx.globalAlpha = 1; }
  return tex(c);
}
export function labelTex(text, { w = 256, h = 96, bg = '#e9e2cf', fg = '#16171b', sub = '', accent = C.red } = {}) {
  const [c, ctx] = canvas(w, h);
  grainFill(ctx, 0, 0, w, h, bg, 0.07, text.length + 2);
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 2; ctx.strokeRect(5, 5, w - 10, h - 10);
  ctx.fillStyle = accent; ctx.fillRect(14, h / 2 - 9, 18, 18);
  ctx.fillStyle = fg; ctx.font = F.mono(Math.round(h * 0.25), 700); ctx.textBaseline = 'middle';
  ctx.fillText(text, 42, sub ? h * 0.38 : h / 2 + 1);
  if (sub) { ctx.font = F.mono(Math.round(h * 0.16)); ctx.fillText(sub, 42, h * 0.68); }
  return tex(c);
}

// ---------- workflow pinboard ----------
export async function boardTex(steps) {
  const W = 2048, H = 740;
  const [c, ctx] = canvas(W, H);
  grainFill(ctx, 0, 0, W, H, '#191b20', 0.12, 99);
  const bts = await Promise.all([1, 2, 3, 4, 5, 6].map((i) => loadImage(`assets/img/bts/b0${i}.jpg`)));
  ctx.fillStyle = 'rgba(237,230,211,0.5)'; ctx.font = F.mono(17);
  spaced(ctx, getLang() === 'ms' ? 'PAPAN SIASATAN  ·  ALIRAN KERJA DOKUMENTARI  ·  WARGA FILMS' : 'INVESTIGATION BOARD  ·  DOCUMENTARY WORKFLOW  ·  WARGA FILMS', 46, 44, 3);
  const pins = [];
  const cw = 282, ch = 214;
  steps.forEach((s, i) => {
    const col = i % 5, row = Math.floor(i / 5);
    const x = (row ? 384 : 44) + col * 322, y = 84 + row * 322 + ((col % 2) ? 24 : 0);
    const rot = ((i * 37) % 11 - 5) * 0.008;
    const colors = ['#efe8d6', '#e6dcc0', '#f1ead9', '#dfd4b6'];
    const done = paperPiece(ctx, x, y, cw, ch, colors[i % 4], { rot, jag: 5, seed: 30 + i });
    ctx.fillStyle = C.red; ctx.font = F.cond(64); ctx.textBaseline = 'alphabetic';
    ctx.fillText(String(i + 1).padStart(2, '0'), -cw / 2 + 20, -ch / 2 + 68);
    ctx.fillStyle = '#131418'; ctx.font = F.serif(34);
    wrapLines(ctx, L(s.t), cw - 104).slice(0, 2).forEach((ln, k) => ctx.fillText(ln, -cw / 2 + 96, -ch / 2 + 50 + k * 36));
    ctx.font = F.mono(13.5); ctx.fillStyle = 'rgba(19,20,24,0.78)';
    wrapLines(ctx, L(s.d), cw - 40).slice(0, 5).forEach((ln, k) => ctx.fillText(ln, -cw / 2 + 20, -ch / 2 + 110 + k * 18));
    done();
    pins.push([x + cw / 2 + ((i * 13) % 40) - 20, y + 8]);
  });
  // photos tucked between the cards
  const spots = [[1690, 96, 0.04], [48, 412, -0.05]];
  [bts[0], bts[1]].forEach((im, i) => {
    const [x, y, rot] = spots[i];
    const done = paperPiece(ctx, x, y, 300, 220, '#f4f1e8', { rot, jag: 2, seed: 60 + i });
    coverImage(ctx, im, -138, -98, 276, 160);
    ctx.fillStyle = '#222'; ctx.font = F.mono(13); ctx.fillText(i ? 'Fig. 02  mentah lwn. akhir' : 'Fig. 01  pelan studio', -134, 90);
    done();
    tape(ctx, x + 150, y + 4, 90, 26, rot + 0.1);
  });
  // red string through the pins, in order
  ctx.strokeStyle = C.red; ctx.lineWidth = 3.5; ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 5; ctx.shadowOffsetY = 3;
  ctx.beginPath();
  pins.forEach(([x, y], i) => {
    if (!i) ctx.moveTo(x, y);
    else { const [px, py] = pins[i - 1]; ctx.quadraticCurveTo((px + x) / 2, Math.max(py, y) + 34, x, y); }
  });
  ctx.stroke();
  ctx.shadowColor = 'transparent';
  for (const [x, y] of pins) {
    ctx.fillStyle = '#7d0d08'; ctx.beginPath(); ctx.arc(x, y, 10, 0, 7); ctx.fill();
    ctx.fillStyle = '#f04a40'; ctx.beginPath(); ctx.arc(x - 2, y - 3, 5, 0, 7); ctx.fill();
  }
  // stamp
  ctx.save(); ctx.translate(1850, 372); ctx.rotate(-0.16);
  ctx.strokeStyle = C.red; ctx.lineWidth = 5; ctx.strokeRect(-92, -34, 184, 68);
  ctx.fillStyle = C.red; ctx.font = F.cond(50); ctx.textAlign = 'center'; ctx.fillText(getLang() === 'ms' ? 'LULUS' : 'APPROVED', 0, 18);
  ctx.restore();
  return tex(c);
}

// ---------- records and generated cover art ----------
export function recordTex(cover = null) {
  const [c, ctx] = canvas(1024, 1024);
  ctx.clearRect(0, 0, 1024, 1024);
  ctx.fillStyle = '#0a0a0b'; ctx.beginPath(); ctx.arc(512, 512, 510, 0, 7); ctx.fill();
  for (let r = 196; r < 500; r += 3) {
    ctx.strokeStyle = `rgba(255,255,255,${0.03 + ((r * 7) % 5) * 0.012})`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(512, 512, r, 0, 7); ctx.stroke();
  }
  for (let i = 0; i < 4; i++) {
    const g = ctx.createConicGradient(i * 1.6, 512, 512);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.04, 'rgba(255,255,255,0.11)'); g.addColorStop(0.08, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(512, 512, 500, 0, 7); ctx.fill();
  }
  ctx.save(); ctx.beginPath(); ctx.arc(512, 512, 180, 0, 7); ctx.clip();
  if (cover) coverImage(ctx, cover, 332, 332, 360, 360);
  else {
    ctx.fillStyle = C.red; ctx.fillRect(332, 332, 360, 360);
    ctx.fillStyle = C.cream; ctx.font = F.serif(58); ctx.textAlign = 'center'; ctx.fillText('WARGA', 512, 470);
    ctx.font = F.cond(30); ctx.fillText('S E S I   S T U D I O', 512, 610);
    ctx.font = F.mono(17); ctx.fillText('33⅓ RPM · SISI A', 512, 646);
  }
  ctx.restore();
  ctx.fillStyle = '#0a0a0b'; ctx.beginPath(); ctx.arc(512, 512, 13, 0, 7); ctx.fill();
  return tex(c);
}
/** Collage cover for songs that carry no artwork. Returns a canvas. */
export function generatedCover(title = 'Warga', artist = '') {
  const [c, ctx] = canvas(640, 640);
  let seed = 0;
  for (const ch of title + artist) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const r = rng(seed || 1);
  const pal = [[C.cobalt, C.marigold, C.cream], ['#b5140e', C.cream, '#111216'], ['#111216', C.red, C.cream], [C.marigold, '#111216', C.red], ['#1f4d45', C.cream, C.marigold]][Math.floor(r() * 5)];
  grainFill(ctx, 0, 0, 640, 640, pal[0], 0.1, seed);
  if (r() > 0.4) burst(ctx, 200 + r() * 240, 220 + r() * 120, 150, 230, 12 + Math.floor(r() * 8), pal[1]);
  else { ctx.fillStyle = pal[1]; ctx.beginPath(); ctx.arc(200 + r() * 240, 240 + r() * 100, 170, 0, 7); ctx.fill(); }
  halftone(ctx, 0, 300, 640, 340, 'rgba(0,0,0,0.22)', 13, 4.5);
  for (let i = 0; i < 3; i++) {
    const done = paperPiece(ctx, 40 + r() * 380, 60 + r() * 300, 120 + r() * 160, 40 + r() * 80, i ? pal[2] : '#f2ede0', { rot: (r() - 0.5) * 0.5, seed: seed + i });
    done();
  }
  ctx.fillStyle = pal[2]; ctx.fillRect(0, 468, 640, 172);
  ctx.fillStyle = pal[0]; ctx.font = F.serif(60);
  let lines = wrapLines(ctx, title, 580);
  if (lines.length > 2) { ctx.font = F.serif(42); lines = wrapLines(ctx, title, 580).slice(0, 2); }
  lines.forEach((ln, i) => ctx.fillText(ln, 30, 536 + i * (lines.length > 1 ? 48 : 60)));
  ctx.font = F.mono(18, 700); ctx.fillText((artist || 'WARGA FILMS').toUpperCase().slice(0, 44), 32, 618);
  ctx.fillStyle = C.red; ctx.fillRect(578, 30, 32, 32);
  return c;
}
/** Paper-cut music notes for the instruments. */
export function noteTexes() {
  return ['♪', '♫', '♩', '♬'].map((g, i) => {
    const [c, ctx] = canvas(128, 128);
    ctx.font = '900 96px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round'; ctx.strokeStyle = '#f4f0e4'; ctx.lineWidth = 16; ctx.strokeText(g, 64, 68);
    ctx.fillStyle = [C.red, '#15161a', C.marigold, C.cobalt][i]; ctx.fillText(g, 64, 68);
    return tex(c);
  });
}
