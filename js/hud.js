// Heads-up layer: top bar, station dock, hotspot pills, hover tip, toast,
// the film-burn cut and the opening title.
import * as THREE from 'three';
import { world } from './build.js';
import { t, L, getLang, setLang, onLang } from './i18n.js';
import { $, $$, wait, reducedMotion, isTouch } from './util.js';
import { audio } from './audio.js';

export const ICON = {
  sofa: '<path d="M4 12V9a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3M3 12a1.5 1.5 0 0 1 3 0v3h12v-3a1.5 1.5 0 0 1 3 0v6H3zM6 18v2M18 18v2"/>',
  book: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11M9 8h6"/>',
  hat: '<path d="M2 17c3 2 17 2 20 0M6 16.5V11c0-3 2-5 6-5s6 2 6 5v5.5M6 13.5c4 1 8 1 12 0"/>',
  board: '<path d="M3 5h18v12H3zM7 9h4v4H7zM14 9h3M14 12h3M8 21l2-4M16 21l-2-4"/>',
  page: '<path d="M6 3h9l4 4v14H6zM15 3v4h4M9 12h7M9 15h7M9 18h4"/>',
  vinyl: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M5.6 9.5A7 7 0 0 1 9.5 5.6"/>',
  film: '<path d="M4 4h16v16H4zM8 4v16M16 4v16M4 8h4M4 12h4M4 16h4M16 8h4M16 12h4M16 16h4"/>',
  note: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
  play: '<rect x="3" y="6" width="18" height="12" rx="4"/><path d="M10.5 9.5v5l4-2.5z"/>',
  shirt: '<path d="M8 4l4 2 4-2 5 3-2 4-3-1v10H8V10l-3 1-2-4z"/>',
  soundOn: '<path d="M4 10v4h3l5 4V6L7 10zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
  soundOff: '<path d="M4 10v4h3l5 4V6L7 10zM16 9l5 6M21 9l-5 6"/>',
  index: '<path d="M4 6h16M4 12h16M4 18h10"/>',
};
export const svg = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name] || ''}</svg>`;

export const STATIONS = [
  { id: 'lounge', icon: 'sofa', label: 's_lounge', view: { pos: [0, 1.62, 3.0], look: [0, 1.6, -4.9] } },
  { id: 'library', icon: 'book', label: 's_library', view: { pos: [-4.9, 1.62, -2.0], look: [-6.9, 1.5, -2.0] } },
  { id: 'desk', icon: 'hat', label: 's_desk', view: { pos: [-4.3, 1.62, 1.9], look: [-4.9, 1.2, 3.6] } },
  { id: 'workflow', icon: 'board', label: 's_workflow', view: { pos: [0.4, 1.62, 2.4], look: [0.2, 1.9, 4.95] } },
  { id: 'scripts', icon: 'page', label: 's_scripts', view: { pos: [-0.9, 1.62, 3.2], look: [-0.9, 1.0, 4.7] } },
  { id: 'vinyl', icon: 'vinyl', label: 's_vinyl', view: { pos: [5.0, 1.62, 3.1], look: [5.05, 1.15, 4.75] } },
  { id: 'films', icon: 'film', label: 's_films', view: { pos: [4.7, 1.62, 0.3], look: [6.96, 1.6, 0.3] } },
  { id: 'stage', icon: 'note', label: 's_stage', view: { pos: [3.1, 1.62, -1.1], look: [5.3, 0.95, -3.6] } },
  { id: 'youtube', icon: 'play', label: 's_youtube', view: { pos: [-4.2, 1.62, -2.6], look: [-5.45, 0.85, -4.2] } },
  { id: 'merch', icon: 'shirt', label: 's_merch', view: { pos: [8.15, 1.62, 4.35], look: [11.3, 1.35, 1.3] } },
];

export function initHud(app) {
  const { player, camera } = app;
  const hud = app.hud = {};
  document.documentElement.lang = getLang() === 'ms' ? 'ms' : 'en';

  // ---------- language + sound + index
  const paintLang = () => {
    $$('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === getLang())));
    $$('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
    $('#soundBtn').innerHTML = svg(audio.muted ? 'soundOff' : 'soundOn') + `<span>${t(audio.muted ? 'soundOff' : 'soundOn')}</span>`;
    $('#indexBtn').innerHTML = svg('index') + `<span>${t('index')}</span>`;
    $('#panelClose').setAttribute('aria-label', t('close'));
  };
  $$('[data-lang]').forEach((b) => b.addEventListener('click', () => { if (b.dataset.lang !== getLang()) { setLang(b.dataset.lang); audio.click(0.4); } }));
  $('#soundBtn').addEventListener('click', () => { audio.setMuted(!audio.muted); $('#soundBtn').setAttribute('aria-pressed', String(!audio.muted)); paintLang(); if (!audio.muted) audio.click(0.4); });
  $('#indexBtn').addEventListener('click', () => { audio.click(0.4); app.open('index'); });
  $('#brandBtn').addEventListener('click', () => { audio.click(0.4); app.open('index'); });
  $('#panelClose').addEventListener('click', () => { audio.click(0.4); app.close(); });

  // pointer-following highlight on glass
  document.addEventListener('pointermove', (e) => {
    const g = e.target.closest && e.target.closest('.glass'); if (!g) return;
    const r = g.getBoundingClientRect(); g.style.setProperty('--mx', `${e.clientX - r.left}px`); g.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, { passive: true });

  // ---------- dock
  const dock = $('#dock');
  const paintDock = () => {
    dock.innerHTML = STATIONS.map((s) => `<button type="button" data-st="${s.id}">${svg(s.icon)}<span>${t(s.label)}</span></button>`).join('');
  };
  dock.addEventListener('click', (e) => { const b = e.target.closest('[data-st]'); if (b) { audio.click(0.45); hud.station(b.dataset.st); } });
  hud.station = async (id) => {
    const s = STATIONS.find((x) => x.id === id); if (!s) return;
    $$('#dock button').forEach((b) => b.classList.toggle('is-here', b.dataset.st === id));
    await app.leaveModes();
    await player.goTo(s.view);
  };
  player.on.moved = () => { const b = $('#dock .is-here'); if (b) b.classList.remove('is-here'); };

  // ---------- hotspots
  const layer = $('#hotspots'), v = new THREE.Vector3();
  const label = (h) => (typeof h.label === 'function' ? h.label() : t(h.label));
  const buildSpots = () => {
    layer.innerHTML = '';
    for (const h of world.hotspots) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'hs';
      b.innerHTML = `<span class="hs-dot"></span><span class="hs-key">E</span><span class="hs-label"></span>`;
      b.addEventListener('click', () => app.activate(h));
      layer.appendChild(b); h.el = b; h.lab = b.lastElementChild;
    }
    paintSpots();
  };
  const paintSpots = () => { for (const h of world.hotspots) if (h.lab) { h.lab.textContent = label(h); h.el.setAttribute('aria-label', label(h)); } };
  hud.focus = null;
  hud.update = () => {
    if (app.busy || !player.enabled) { hud.focus = null; return; }
    const w = innerWidth, hgt = innerHeight, room = player.room;
    let best = null, bestD = 0.42;
    for (const h of world.hotspots) {
      if (!h.el) continue;
      const dist = camera.position.distanceTo(h.pos);
      v.copy(h.pos).project(camera);
      const on = h.room === room && dist < h.range && v.z < 1 && Math.abs(v.x) < 1.02 && Math.abs(v.y) < 1.02;
      if (on !== h.on) { h.on = on; h.el.classList.toggle('is-on', on); h.el.tabIndex = on ? 0 : -1; }
      if (!on) continue;
      h.el.style.transform = `translate3d(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * hgt}px, 0)`;
      const near = dist < 3.1; if (near !== h.near) { h.near = near; h.el.classList.toggle('is-near', near); }
      const c = Math.hypot(v.x, v.y * 0.8);
      if (dist < 4 && c < bestD) { bestD = c; best = h; }
    }
    if (best !== hud.focus) { if (hud.focus) hud.focus.el.classList.remove('is-focus'); hud.focus = best; if (best) best.el.classList.add('is-focus'); }
  };
  player.on.use = () => { if (hud.focus && !app.busy) app.activate(hud.focus); };

  // ---------- clicks and hover in the 3D view
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), tip = $('#tip'), gl = $('#gl');
  const pick = (x, y) => {
    ndc.set((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(world.clickables, false)[0];
    const floor = ray.intersectObjects(world.refs.floors, false)[0];
    if (hit && hit.distance < 8 && (!floor || hit.distance < floor.distance + 0.4)) return { obj: hit.object };
    if (floor) return { floor: floor.point };
    return {};
  };
  player.on.tap = (x, y) => {
    if (app.busy) return;
    const p = pick(x, y);
    if (p.obj) { audio.click(); p.obj.userData.click(); } else if (p.floor) { const [fx, fz] = player.free(p.floor.x, p.floor.z); player.walkTo(fx, fz); audio.play('tap', { vol: 0.25 }); }
  };
  let lastHover = 0;
  player.on.hover = (x, y) => {
    const now = performance.now(); if (now - lastHover < 70) return; lastHover = now;
    if (app.busy) { tip.classList.remove('is-on'); gl.classList.remove('is-point'); return; }
    const p = pick(x, y);
    if (p.obj) {
      p.obj.userData.hover = true;
      const lb = p.obj.userData.label; tip.textContent = typeof lb === 'function' ? lb() : lb || '';
      tip.style.transform = `translate(${Math.min(x + 16, innerWidth - 240)}px, ${y + 18}px)`; tip.classList.add('is-on'); gl.classList.add('is-point');
    } else { tip.classList.remove('is-on'); gl.classList.remove('is-point'); }
  };

  // ---------- toast
  let toastTimer = 0;
  hud.toast = (text, ms = 6000) => { const el = $('#toast'); el.textContent = text; el.classList.add('is-on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('is-on'), ms); };

  // ---------- the cut: a film burn that hides an instant camera move
  const burn = $('#burn');
  hud.burn = async (mid) => {
    if (reducedMotion()) { mid(); return; }
    burn.classList.remove('go'); void burn.offsetWidth; burn.classList.add('go');
    audio.play('burn', { vol: 0.5 }); audio.play('shutter', { vol: 0.5, delay: 0.3 });
    app.fx.burnTo(1, 0.36);
    await wait(0.38); mid(); app.fx.burnTo(0, 0.55);
    await wait(0.57); burn.classList.remove('go');
  };
  player.transition = hud.burn;

  // ---------- opening title
  const strip = $('#stripTrack');
  const frames = Array.from({ length: 12 }, (_, i) => `<img src="assets/img/reel/r${String(i + 1).padStart(2, '0')}.jpg" alt="" loading="lazy">`).join('');
  strip.innerHTML = frames + frames;
  let typeTimer = 0;
  const typeLine = () => {
    const el = $('#introLine'), text = t('introLine'); let i = 0; el.textContent = ''; clearInterval(typeTimer);
    typeTimer = setInterval(() => { el.textContent = text.slice(0, ++i); if (i >= text.length) clearInterval(typeTimer); }, 34);
  };
  setTimeout(typeLine, 1500);
  hud.progress = (k) => {
    $('#leaderArc').style.strokeDashoffset = String(119.4 * (1 - k));
    $('#leaderNum').textContent = k >= 1 ? '▶' : String(3 - Math.min(2, Math.floor(k * 3)));
    $('#enterLabel').textContent = k >= 1 ? t('enter') : `${t('loading')} ${Math.round(k * 100)}%`;
    $('#enter').disabled = k < 1; hud._k = k;
  };
  hud.progress(0);
  $('#enter').addEventListener('click', () => app.enter());

  const repaint = () => { paintLang(); paintDock(); paintSpots(); hud.progress(hud._k || 0); };
  onLang(() => { repaint(); if (document.body.classList.contains('is-intro')) typeLine(); });
  hud.ready = () => { buildSpots(); repaint(); };
  hud.hint = () => hud.toast(t(isTouch() ? 'hintTouch' : 'hintWalk'), 9000);
  repaint();
}
