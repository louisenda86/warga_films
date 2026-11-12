// Warga Films studio — entry point. Builds the rooms, then runs the visit.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { world, initMaterials } from './build.js';
import { fontsReady } from './tex.js';
import { buildStudio } from './studio.js';
import { buildStage, band, PLAY } from './instruments.js';
import { buildMerch } from './merch.js';
import { Player } from './player.js';
import { createFx } from './fx.js';
import { initHud, STATIONS } from './hud.js';
import { initPanels } from './panels.js';
import { initVinyl } from './vinyl.js';
import { audio } from './audio.js';
import { t, L, onLang } from './i18n.js';
import { $, $$, tween, updateTweens, ease, clamp, damp, esc } from './util.js';

const canvas = $('#gl');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', stencil: false });
} catch (e) {
  $('#enterLabel').textContent = 'WebGL tidak tersedia · WebGL is not available';
  $('#introLine').innerHTML = 'Pelayar ini tidak dapat memaparkan studio 3D. Tonton filem kami di <a href="https://www.youtube.com/@wargafilms">YouTube</a>.';
  throw e;
}
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.2;

const scene = world.scene = new THREE.Scene();
scene.background = new THREE.Color(0x050506);
scene.fog = new THREE.FogExp2(0x070709, 0.014);
const camera = world.refs.camera = new THREE.PerspectiveCamera(60, 1, 0.05, 60);
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.3;

const fx = createFx(renderer, scene, camera);
fx.burnTo = (v, dur) => { const u = fx.film.uniforms.burn, a = u.value; return tween(dur, (k) => { u.value = a + (v - a) * k; }, ease.out); };
const player = new Player(camera, canvas);
const app = { scene, camera, renderer, player, fx, busy: false, mode: null, introCam: true, shift: 0, shiftTo: 0, musicPlaying: false };
window.wf = app;

const setBusy = (b) => { app.busy = b; document.body.classList.toggle('is-busy', b); if (b) { $('#tip').classList.remove('is-on'); canvas.classList.remove('is-point'); } };
const spot = (id) => world.hotspots.find((h) => h.id === id);
function viewFor(kind, arg) {
  const id = { films: 'films', founder: 'founder', workflow: 'workflow', scripts: 'scripts', vinyl: 'vinyl', youtube: 'youtube', book: 'book-' + (arg || 'skrip'), merch: 'merch-' + (arg || 'tee') }[kind];
  const h = id && spot(id); return h ? h.view : null;
}

// ---------------------------------------------------------------- panels
app.open = async (kind, arg) => {
  if (app.opening || app.introCam) return; app.opening = true;
  try {
    if (app.mode) await app.leaveModes();
    setBusy(true); player.lock(true);
    const view = viewFor(kind, arg);
    if (view) {
      const a = player.angles(view), d = player.pos.distanceTo(new THREE.Vector3(...view.pos));
      if (d > 0.2 || Math.abs(Math.atan2(Math.sin(a.yaw - player.yaw), Math.cos(a.yaw - player.yaw))) > 0.15 || Math.abs(a.pitch - player.pitch) > 0.15) await player.goTo(view);
    }
    app.panels.show(kind, arg); app.shiftTo = 1;
  } finally { app.opening = false; }
};
app.close = async (release = true) => {
  if (!app.panels.state.kind) return;
  app.panels.hide(); app.shiftTo = 0;
  if (release && !app.mode) await standFree();
};
async function standFree() {
  const [x, z] = player.free(player.pos.x, player.pos.z), from = player.pos.clone();
  if (from.distanceTo(new THREE.Vector3(x, 1.62, z)) > 0.01) await tween(0.45, (k) => { player.pos.set(from.x + (x - from.x) * k, from.y + (1.62 - from.y) * k, from.z + (z - from.z) * k); }, ease.inOut);
  player.lock(false); setBusy(false);
}
app.activate = (h) => { if (app.opening) return; audio.click(); h.action(); };

// ---------------------------------------------------------------- sitting on the sofa
const seatBar = $('#seat');
app.sit = async () => {
  if (app.mode === 'seat' || app.opening) return;
  await app.close(false); if (app.mode) await app.leaveModes();
  app.mode = 'seat'; setBusy(true); player.lock(true);
  const s = world.refs.seat; audio.play('couch', { vol: 0.5 });
  await player.goTo({ pos: s.pos, look: s.look }, { dur: 1.5 });
  world.refs.screening.leader = 3.99; audio.play('projector_start', { vol: 0.45 });
  paintSeat(); seatBar.hidden = false;
};
function paintSeat() {
  seatBar.innerHTML = `<i class="rec"></i><span>${t('nowShowing')} · Warga Films<br><small style="opacity:.65">${t('seatHint')}</small></span><button class="btn is-cream" type="button">${t('standUp')}</button>`;
  $('button', seatBar).addEventListener('click', () => { audio.click(0.4); app.leaveModes(); });
}

// ---------------------------------------------------------------- playing an instrument
const playBar = $('#play');
let pads = [];
app.play = async (id) => {
  if (app.opening || app.mode === 'play:' + id) return;
  await app.close(false); if (app.mode) await app.leaveModes();
  app.mode = 'play:' + id; setBusy(true); player.lock(true);
  await player.goTo(band.views[id]);
  if (id === 'sax') band.saxMode(true);
  paintPlay(id); playBar.hidden = false;
};
function paintPlay(id) {
  const P = PLAY[id], cap = (k) => (k === ' ' ? '␣' : k.toUpperCase());
  const pad = (k, label, cls = '') => `<button class="pad ${cls}" type="button" data-k="${k === ' ' ? 'space' : k}"><kbd>${cap(k)}</kbd><span>${esc(label)}</span></button>`;
  let html = `<div class="play-head"><div><h2>${t(P.title)}</h2><p>${t('playHint')}${P.hold ? ' · ' + t('holdNote') : ''}</p></div><button class="btn is-cream" type="button" data-stop>${t('stopPlaying')}</button></div>`;
  pads = [];
  if (id === 'drums') { html += `<div class="pads">${P.pads.map((p) => pad(p.k, L(p.t))).join('')}</div>`; P.pads.forEach((p) => pads.push({ k: p.k, down: () => band.hit(p.id) })); }
  if (id === 'guitar') {
    html += `<p class="pads-label">${t('chords')}</p><div class="pads">${P.chords.map((c) => pad(c.k, c.name, 'is-chord')).join('')}</div><p class="pads-label">${t('notes')}</p><div class="pads">${P.notes.map((n) => pad(n.k, n.name)).join('')}</div>`;
    P.chords.forEach((c) => pads.push({ k: c.k, down: () => band.strum(c.notes) })); P.notes.forEach((n) => pads.push({ k: n.k, down: () => band.pluck(n.midi) }));
  }
  if (id === 'sax') { html += `<div class="pads">${P.notes.map((n) => pad(n.k, n.name)).join('')}</div>`; P.notes.forEach((n) => pads.push({ k: n.k, hold: true, down: () => band.saxOn(n.midi), up: () => band.saxOff(n.midi) })); }
  playBar.innerHTML = html;
  $('[data-stop]', playBar).addEventListener('click', () => { audio.click(0.4); app.leaveModes(); });
  for (const p of pads) {
    p.el = $(`[data-k="${p.k === ' ' ? 'space' : p.k}"]`, playBar); p.on = false;
    p.el.addEventListener('pointerdown', (e) => { e.preventDefault(); press(p, true); });
    for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) p.el.addEventListener(ev, () => press(p, false));
  }
}
function press(p, down) {
  if (down) {
    if (p.on && p.hold) return;
    p.on = true; p.down(); p.el.classList.add('is-down');
    if (!p.hold) setTimeout(() => { p.el.classList.remove('is-down'); p.on = false; }, 110);
  } else if (p.on && p.hold) { p.on = false; p.up(); p.el.classList.remove('is-down'); }
}
player.on.key = (k, down, e) => {
  if (app.mode && app.mode.startsWith('play')) {
    const p = pads.find((x) => x.k === k);
    if (p) { if (down && !e.repeat) press(p, true); else if (!down) press(p, false); return true; }
    return down && (k === ' ');
  }
  if (down && app.panels.state.kind === 'book') return app.panels.pageKey(k);
  return false;
};

app.leaveModes = async () => {
  const m = app.mode;
  await app.close(false);
  if (!m) { if (app.busy && !app.opening) await standFree(); return; }
  app.mode = null;
  if (m === 'seat') { seatBar.hidden = true; const s = world.refs.seat; await player.goTo({ pos: s.exit, look: s.look }, { dur: 1.0 }); }
  else { playBar.hidden = true; pads.forEach((p) => press(p, false)); band.saxMode(false); await player.goTo(STATIONS.find((s) => s.id === 'stage').view, { dur: 1.0 }); }
  player.lock(false); setBusy(false);
};
app.go = async (where) => {
  if (app.opening) return;
  await app.leaveModes(); audio.play('door', { vol: 0.35, delay: 0.25 });
  await player.goTo(where === 'merch' ? STATIONS.find((s) => s.id === 'merch').view : { pos: [5.6, 1.62, 3.0], look: [1.5, 1.5, 1.6] }, { cut: true });
};
player.on.escape = () => { if (app.introCam) return; if (app.panels.state.kind) { audio.click(0.4); app.close(); } else if (app.mode) { audio.click(0.4); app.leaveModes(); } };
world.refs.api = { open: app.open, sit: app.sit, play: app.play, go: app.go };
onLang(() => { if (app.mode === 'seat') paintSeat(); else if (app.mode) paintPlay(app.mode.split(':')[1]); });
document.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('a.btn, a.linkish')) audio.click(0.4); });

// ---------------------------------------------------------------- start
app.enter = async () => {
  if (!app.introCam || app.entering) return; app.entering = true;
  audio.init(); await audio.decode();
  audio.play('winder', { vol: 0.5 });
  await app.hud.burn(() => {
    $('#intro').classList.add('is-gone'); document.body.classList.remove('is-intro');
    app.introCam = false; player.pos.set(0, 1.62, 3.3); player.yaw = 0; player.pitch = 0.02;
  });
  player.enabled = true; app.hud.hint(); app.enteredAt = performance.now();
};

function resize() {
  const w = innerWidth, h = innerHeight, pr = Math.min(devicePixelRatio || 1, app.lowQ ? 1 : 1.5);
  renderer.setPixelRatio(pr); renderer.setSize(w, h, false);
  // keep roughly the same width of room in view on tall and narrow screens
  camera.aspect = w / h; camera.fov = clamp(THREE.MathUtils.radToDeg(2 * Math.atan(0.966 / camera.aspect)), 58, 76); camera.updateProjectionMatrix();
  fx.resize(w, h, pr);
}
addEventListener('resize', resize);

let last = performance.now(), time = 0, ambT = 0, frames = 0, slow = 0;
const lookAt = new THREE.Vector3();
function frame(now) {
  requestAnimationFrame(frame);
  const raw = (now - last) / 1000, dt = Math.min(0.05, raw); last = now; time += dt;
  updateTweens(dt);
  if (app.introCam) {
    const a = time * 0.05;
    camera.position.set(Math.sin(a) * 3.1, 1.55 + Math.sin(a * 1.7) * 0.1, 3.7 - Math.cos(a) * 0.5);
    camera.lookAt(lookAt.set(Math.sin(a + 1) * 1.6, 1.55, -3));
  } else player.update(dt);
  for (const fn of world.updaters) fn(dt, time);

  // slide the view aside while the panel is open, so the object stays in sight
  // (and lift it while the instrument keys cover the bottom of the screen)
  app.shift = damp(app.shift, app.shiftTo, 5, dt);
  app.lift = damp(app.lift || 0, app.mode && app.mode.startsWith('play') ? 1 : 0, 4, dt);
  if (app.shift > 0.002 || app.lift > 0.002) {
    const w = innerWidth, h = innerHeight, wide = w > 860;
    camera.setViewOffset(w, h, wide ? app.shift * Math.min(620, w * 0.46) * 0.5 : 0, (wide ? 0 : app.shift * h * 0.3) + app.lift * Math.min(150, h * 0.17), w, h);
  } else if (camera.view) camera.clearViewOffset();

  app.hud.update();
  if (app.panels.state.kind === 'vinyl') app.vinyl.tick();

  ambT += dt;
  if (ambT > 0.25 && audio.ready) {
    ambT = 0;
    const d = camera.position.distanceTo(world.refs.projectorPos);
    app.projectorLevel = clamp(1 - d / 11, 0.14, 1) * (app.mode === 'seat' ? 0.62 : 0.4) * (app.introCam ? 0 : 1);
    if (!app.musicPlaying) audio.loopLevel('projector', app.projectorLevel, 0.5);
    audio.loopLevel('static', app.introCam ? 0 : clamp(1 - camera.position.distanceTo(world.refs.tvPos) / 3.6, 0, 1) * 0.1, 0.5);
  }
  fx.render(time);

  // step the quality down once if the machine cannot keep up
  if (app.enteredAt && !app.lowQ && now - app.enteredAt > 1500) {
    frames++; if (raw > 1 / 28) slow++;
    if (frames === 240) { if (slow > 150) { app.lowQ = true; fx.low(); world.refs.shadowLights.forEach((l) => { l.castShadow = false; }); resize(); } }
  }
}

async function boot() {
  initMaterials(); resize();
  initHud(app); initPanels(app); initVinyl(app);
  let built = 0, loaded = 0;
  const prog = () => app.hud.progress(Math.min(0.999, built * 0.8 + loaded * 0.2));
  const sounds = audio.load((k) => { loaded = k; prog(); });
  requestAnimationFrame(frame);
  await fontsReady(); built = 0.12; prog();
  await buildStudio(world.refs.api); built = 0.6; prog();
  buildStage(world.refs.api); built = 0.72; prog();
  await buildMerch(world.refs.api); built = 0.95; prog();
  renderer.compile(scene, camera);
  await sounds; built = 1; loaded = 1;
  app.hud.ready(); app.hud.progress(1);
}
boot().catch((err) => {
  console.error(err);
  $('#enterLabel').textContent = 'Studio gagal dimuat · The studio failed to load';
  $('#introLine').textContent = String(err && err.message ? err.message : err);
});
