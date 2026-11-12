// Small shared helpers: math, easing, tweens, DOM.

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));
export const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

export const ease = {
  linear: (t) => t,
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  out: (t) => 1 - Math.pow(1 - t, 3),
  outQuint: (t) => 1 - Math.pow(1 - t, 5),
  in: (t) => t * t * t,
  outBack: (t) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
};

// Seeded random, so the room is the same on every visit.
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const tweens = new Set();
/** Run fn(k) with k going 0 → 1 over `dur` seconds. Returns a promise with .cancel(). */
export function tween(dur, fn, e = ease.inOut) {
  let cancel;
  const p = new Promise((resolve) => {
    const tw = { t: 0, dur: Math.max(dur, 0.0001), fn, e, resolve };
    tweens.add(tw);
    cancel = () => { tweens.delete(tw); resolve(false); };
    fn(e(0));
  });
  p.cancel = cancel;
  return p;
}
export function updateTweens(dt) {
  for (const tw of [...tweens]) {
    tw.t += dt;
    const k = clamp(tw.t / tw.dur, 0, 1);
    tw.fn(tw.e(k));
    if (k >= 1) { tweens.delete(tw); tw.resolve(true); }
  }
}
export const wait = (s) => tween(s, () => {}, ease.linear);

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isTouch = () => window.matchMedia('(pointer: coarse)').matches;

const imgCache = new Map();
export function loadImage(url) {
  if (!imgCache.has(url)) {
    imgCache.set(url, new Promise((resolve) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = () => resolve(null);
      im.src = url;
    }));
  }
  return imgCache.get(url);
}
