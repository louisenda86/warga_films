// The main room: screening lounge, library, narrator's desk, workflow board,
// script archive, record corner, film rack, TV and the stage riser.
import * as THREE from 'three';
import { world, M, box, rbox, cyl, plane, disc, group, rod, contact, collide, onUpdate, hotspot, clickable, glow, texMat, framed, pointLight } from './build.js';
import * as T from './tex.js';
import { FILMS, BOOKS, WORKFLOW, SCRIPTS } from './content.js';
import { t, L, onLang, getLang } from './i18n.js';
import { rng, loadImage, clamp } from './util.js';
import { audio } from './audio.js';

const UP = new THREE.Vector3(0, 1, 0), ONE = new THREE.Vector3(1, 1, 1);
const H = 3.5;

export async function buildStudio(api) {
  shell();
  lights();
  lounge(api);
  await screening();
  library(api);
  desk(api);
  await southWall(api);
  recordCorner(api);
  await filmRack(api);
  doorway(api);
  stageRiser();
  await posters(api);
  tvCorner(api);
  plants();
}

// ---------------------------------------------------------------- shell
function shell() {
  const s = world.scene;
  const floor = plane(14, 10, new THREE.MeshStandardMaterial({ map: T.floorTex(), roughness: 0.48, metalness: 0.05 }), 0, 0, 0);
  floor.rotation.x = -Math.PI / 2; floor.name = 'floor'; s.add(floor); world.refs.floors = [floor];
  const ceil = plane(14, 10, M.ceiling, 0, H, 0); ceil.rotation.x = Math.PI / 2; s.add(ceil);
  s.add(box(14.6, H, 0.2, M.wall, 0, H / 2, -5.1), box(14.6, H, 0.2, M.wall, 0, H / 2, 5.1), box(0.2, H, 10.4, M.wall, -7.1, H / 2, 0));
  s.add(box(0.25, H, 7.2, M.wall, 7.125, H / 2, -1.4), box(0.25, H, 1.2, M.wall, 7.125, H / 2, 4.4), box(0.25, 1.2, 1.6, M.wall, 7.125, 2.9, 3.0));

  // timber slats on the walls, as in the studio renders
  const segs = [[-7, -5, -2.75, -5, 0, 1], [2.75, -5, 7, -5, 0, 1], [7, -5, 7, 2.1, -1, 0], [7, 3.9, 7, 5, -1, 0], [7, 5, 2.75, 5, 0, -1], [-2.75, 5, -7, 5, 0, -1], [-7, 5, -7, 0.75, 1, 0]];
  const pitch = 0.075, list = [];
  for (const [x0, z0, x1, z1, nx, nz] of segs) {
    const n = Math.floor(Math.hypot(x1 - x0, z1 - z0) / pitch);
    for (let i = 0; i < n; i++) { const k = (i + 0.5) / n; list.push([x0 + (x1 - x0) * k + nx * 0.02, z0 + (z1 - z0) * k + nz * 0.02, nx !== 0]); }
  }
  const slats = new THREE.InstancedMesh(new THREE.BoxGeometry(0.042, 3.1, 0.036), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }), list.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color(), r = rng(5);
  list.forEach(([x, z, turn], i) => {
    q.setFromAxisAngle(UP, turn ? Math.PI / 2 : 0);
    slats.setMatrixAt(i, m4.compose(new THREE.Vector3(x, 1.68, z), q, ONE));
    const v = 0.75 + r() * 0.5; slats.setColorAt(i, col.setRGB(0.4 * v, 0.25 * v, 0.15 * v, THREE.SRGBColorSpace));
  });
  slats.receiveShadow = true; s.add(slats);

  // red LED lines
  const led = (w, d, x, y, z) => s.add(box(w, 0.022, d, M.ledRed, x, y, z));
  led(14, 0.022, 0, 3.32, -4.94); led(14, 0.022, 0, 3.32, 4.94); led(0.022, 10, -6.94, 3.32, 0); led(0.022, 10, 6.94, 3.32, 0);
  led(4.2, 0.022, -4.9, 0.95, -4.935); led(4.2, 0.022, 4.9, 0.95, -4.935);
  led(0.022, 4.2, -6.935, 0.95, 2.9); led(4.2, 0.022, -4.9, 0.95, 4.935); led(4.2, 0.022, 4.9, 0.95, 4.935);

  // ceiling tracks with spot cans
  for (const z of [-1.6, 1.9]) {
    s.add(box(11, 0.03, 0.05, M.black, 0, H - 0.05, z));
    for (let x = -5; x <= 5; x += 2.5) { cyl(0.05, 0.06, 0.14, M.black, x, H - 0.14, z, s, 14); const d = disc(0.045, M.ledWarm, x, H - 0.212, z, s, 14); d.rotation.x = Math.PI / 2; }
  }
}

function lights() {
  const s = world.scene;
  s.add(new THREE.HemisphereLight(0x646c88, 0x16100c, 0.8));
  const spot = (color, intensity, pos, target, angle, shadow) => {
    const l = new THREE.SpotLight(color, intensity, 14, angle, 0.75, 1.6);
    l.position.set(...pos); l.target.position.set(...target); s.add(l, l.target);
    if (shadow) { l.castShadow = true; l.shadow.mapSize.set(1024, 1024); l.shadow.bias = -0.0004; l.shadow.radius = 4; l.shadow.camera.near = 0.5; l.shadow.camera.far = 9; }
    return l;
  };
  world.refs.shadowLights = [spot(0xffd9b0, 17, [0.2, 3.42, 1.1], [0, 0, 0.2], 0.8, true), spot(0xffe0b8, 30, [4.1, 3.42, -1.7], [5.3, 0.5, -3.6], 0.62, true)];
  pointLight(0xffb070, 5.5, -5.4, 2.2, -3.3, 6); pointLight(0xffb070, 5.5, -5.4, 2.2, -0.7, 6);
  pointLight(0xffc890, 6, -4.9, 1.9, 2.9, 5);
  pointLight(0xffdcb0, 6, -1.5, 2.8, 3.7, 6); pointLight(0xffdcb0, 6, 1.5, 2.8, 3.7, 6);
  pointLight(0xffa850, 6, 5.0, 1.9, 3.7, 5);
  pointLight(0xffc890, 6, 5.7, 2.2, 0.3, 5);
  pointLight(0xff2a18, 5, 6.3, 0.9, -4.5, 5); pointLight(0xff2a18, 4, -3.4, 3.0, -4.5, 6); pointLight(0xff2a18, 4, 3.4, 3.0, 4.5, 6);
}

// ---------------------------------------------------------------- lounge
function lounge(api) {
  const s = world.scene;
  const rug = plane(4.4, 3.2, texMat(T.rugTex(), 0.95), 0, 0.006, -0.35); rug.rotation.x = -Math.PI / 2; s.add(rug);

  const sofa = group(0, 0, 1.0);
  rbox(2.4, 0.24, 0.95, 0.05, M.leather, 0, 0.2, 0, sofa);
  for (const x of [-0.74, 0, 0.74]) {
    rbox(0.73, 0.17, 0.72, 0.06, M.leather, x, 0.4, -0.09, sofa);
    const b = rbox(0.73, 0.4, 0.17, 0.07, M.leather, x, 0.68, 0.23, sofa); b.rotation.x = -0.13;
  }
  rbox(2.4, 0.56, 0.2, 0.06, M.leather, 0, 0.56, 0.38, sofa);
  for (const x of [-1.31, 1.31]) rbox(0.22, 0.44, 0.95, 0.07, M.leather, x, 0.42, 0, sofa);
  for (const [x, z] of [[-1.3, -0.4], [1.3, -0.4], [-1.3, 0.4], [1.3, 0.4]]) cyl(0.02, 0.015, 0.09, M.chrome, x, 0.045, z, sofa, 10);
  contact(3.3, 1.5, 0, 1.0, 0.012); collide(-1.45, 1.45, 0.5, 1.5);
  hotspot({ id: 'sit', pos: [0, 0.75, 0.8], label: 'h_sit', icon: 'sofa', action: () => api.sit() });
  world.refs.seat = { pos: [0, 1.1, 0.9], look: [0, 1.8, -4.9], exit: [0, 1.62, 0.07] };

  const tb = group(0, 0, -0.75);
  rbox(1.3, 0.045, 0.65, 0.015, M.marble, 0, 0.4, 0, tb);
  for (const x of [-0.58, 0.58]) { box(0.03, 0.38, 0.55, M.black, x, 0.19, 0, tb); }
  box(1.16, 0.03, 0.03, M.black, 0, 0.1, 0, tb);
  const mags = [0xd1140d, 0x14225e, 0xede6d3];
  mags.forEach((c, i) => { const m = box(0.22, 0.012, 0.3, new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 }), -0.3, 0.43 + i * 0.012, 0.02, tb); m.rotation.y = 0.2 - i * 0.22; });
  const clap = group(0.28, 0.425, -0.02, -0.4, tb);
  box(0.3, 0.02, 0.22, M.black, 0, 0.01, 0, clap);
  const stick = box(0.3, 0.03, 0.035, M.cream, 0, 0.035, -0.095, clap); stick.rotation.z = 0.0;
  for (let i = 0; i < 5; i++) box(0.03, 0.032, 0.037, M.black, -0.12 + i * 0.06, 0.035, -0.095, clap);
  cyl(0.04, 0.035, 0.09, M.red, 0.02, 0.47, 0.2, tb, 16);
  contact(1.7, 1.0, 0, -0.75, 0.011, 0.6); collide(-0.65, 0.65, -1.08, -0.42);

  // floor lamp
  const lamp = group(-1.95, 0, 1.3);
  cyl(0.14, 0.16, 0.02, M.black, 0, 0.01, 0, lamp); cyl(0.012, 0.012, 1.5, M.brass, 0, 0.76, 0, lamp, 8);
  const shade = cyl(0.13, 0.19, 0.24, M.shade, 0, 1.56, 0, lamp, 24); shade.castShadow = false;
  pointLight(0xffc98c, 6, -1.95, 1.5, 1.3, 5);
  collide(-2.1, -1.8, 1.15, 1.45);
}

// ---------------------------------------------------------------- screen + projector
async function screening() {
  const s = world.scene;
  const SW = 5.0, SH = 2.8125, SY = 1.95, SZ = -4.9;
  s.add(box(SW + 0.24, SH + 0.24, 0.05, M.felt, 0, SY, SZ - 0.04));
  s.add(box(SW + 0.4, 0.13, 0.14, M.black, 0, SY + SH / 2 + 0.16, SZ - 0.01));
  const [cv, ctx] = T.canvas(768, 432);
  const screenTex = T.tex(cv, { aniso: 4 });
  const screen = plane(SW, SH, glow(0xffffff, 1.35, { map: screenTex }), 0, SY, SZ); s.add(screen);
  world.refs.screen = screen;

  const imgs = (await Promise.all(Array.from({ length: 12 }, (_, i) => loadImage(`assets/img/reel/r${String(i + 1).padStart(2, '0')}.jpg`)))).filter(Boolean);
  const [pc, pctx] = T.canvas(4, 4);
  const avg = imgs.map((im) => { pctx.drawImage(im, 0, 0, 4, 4); const d = pctx.getImageData(0, 0, 4, 4).data; let r = 0, g = 0, b = 0; for (let i = 0; i < 64; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; } return new THREE.Color(r / 4080, g / 4080, b / 4080); });
  const vig = ctx.createRadialGradient(384, 216, 150, 384, 216, 470); vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.6)');
  const bounce = pointLight(0xbfd0ff, 12, 0, 1.9, -3.7, 9, 1.5);
  const state = { i: 0, t: 0, acc: 0, hold: 5.2, fade: 0.9, leader: 0 };
  world.refs.screening = state;
  const drawSlide = (im, k, alpha) => {
    if (!im) return;
    ctx.globalAlpha = alpha; const z = 1.02 + k * 0.05, w = 768 * z, h = 432 * z;
    ctx.drawImage(im, (768 - w) / 2, (432 - h) / 2, w, h); ctx.globalAlpha = 1;
  };
  const draw = (dt) => {
    state.t += dt;
    const cur = imgs[state.i % imgs.length], nxt = imgs[(state.i + 1) % imgs.length];
    ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, 768, 432);
    if (state.leader > 0) {
      // film leader countdown when someone sits down
      state.leader -= dt; const n = Math.ceil(state.leader);
      ctx.fillStyle = '#cfc7b2'; ctx.fillRect(0, 0, 768, 432);
      ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(384, 216, 150, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(384, 216, 128, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, 216); ctx.lineTo(768, 216); ctx.moveTo(384, 0); ctx.lineTo(384, 432); ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.moveTo(384, 216); ctx.arc(384, 216, 150, -Math.PI / 2, -Math.PI / 2 + (1 - (state.leader % 1)) * Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#111'; ctx.font = T.F.serif(190); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(Math.max(1, n)), 384, 228);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      if (state.leader <= 0) state.t = 0;
    } else {
      const k = state.t / (state.hold + state.fade);
      drawSlide(cur, k, 1);
      if (state.t > state.hold) drawSlide(nxt, 0, clamp((state.t - state.hold) / state.fade, 0, 1));
      if (state.t >= state.hold + state.fade) { state.t = 0; state.i++; }
      // a burn between reels
      const edge = Math.abs(state.t - state.hold - state.fade / 2);
      if (edge < 0.35 && state.i % 3 === 2) { ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(255,${120 + Math.random() * 60},30,${(0.35 - edge) * 1.8})`; ctx.fillRect(0, 0, 768, 432); ctx.globalCompositeOperation = 'source-over'; }
    }
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.09})`; ctx.fillRect(0, 0, 768, 432);
    if (Math.random() < 0.3) { ctx.fillStyle = 'rgba(255,250,235,0.35)'; ctx.fillRect(Math.random() * 768, 0, 1, 432); }
    for (let n = 0; n < 4; n++) { ctx.fillStyle = 'rgba(10,10,10,0.5)'; ctx.fillRect(Math.random() * 768, Math.random() * 432, 2 + Math.random() * 3, 2); }
    ctx.fillStyle = vig; ctx.fillRect(0, 0, 768, 432);
    screenTex.needsUpdate = true;
    const c = state.leader > 0 ? new THREE.Color(0.8, 0.76, 0.66) : avg[state.i % avg.length];
    bounce.color.lerp(c.clone().lerp(new THREE.Color(1, 1, 1), 0.35), 0.2);
  };
  draw(0);
  onUpdate((dt) => { state.acc += dt; if (state.acc > 1 / 18) { draw(state.acc); state.acc = 0; bounce.intensity = 10 + Math.random() * 3.5; } });

  // 16 mm projector on a cart
  const P = new THREE.Vector3(2.35, 1.0, 1.25), target = new THREE.Vector3(0, SY, SZ);
  const cart = group(P.x, 0, P.z);
  box(0.6, 0.03, 0.48, M.darkwood, 0, 0.8, 0, cart); box(0.6, 0.03, 0.48, M.darkwood, 0, 0.3, 0, cart);
  for (const [x, z] of [[-0.27, -0.21], [0.27, -0.21], [-0.27, 0.21], [0.27, 0.21]]) cyl(0.014, 0.014, 0.8, M.black, x, 0.4, z, cart, 8);
  for (let i = 0; i < 3; i++) cyl(0.15, 0.15, 0.035, M.steel, -0.05 + i * 0.03, 0.335 + i * 0.037, 0.02, cart, 28);
  contact(1.0, 0.9, P.x, P.z, 0.011, 0.6); collide(2.02, 2.68, 0.98, 1.52);

  const proj = group(P.x, P.y, P.z); proj.lookAt(target);
  rbox(0.2, 0.3, 0.44, 0.02, M.hammer, 0, 0, 0, proj);
  box(0.21, 0.1, 0.2, M.metal, 0, -0.1, -0.05, proj);
  const lens = cyl(0.04, 0.045, 0.16, M.metal, 0, 0.02, 0.29, proj, 20); lens.rotation.x = Math.PI / 2;
  const glass = disc(0.036, glow(0xfff2d6, 3.2), 0, 0.02, 0.372, proj, 20);
  rod([0.06, 0.1, 0.12], [0.06, 0.42, 0.27], 0.012, M.hammer, proj); rod([0.06, 0.1, -0.12], [0.06, 0.4, -0.3], 0.012, M.hammer, proj);
  const reels = [];
  for (const [y, z] of [[0.42, 0.27], [0.4, -0.3]]) {
    const reel = group(0.085, y, z, 0, proj);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.008, 8, 40), M.steel); rim.rotation.y = Math.PI / 2; reel.add(rim);
    const hub = cyl(0.03, 0.03, 0.03, M.steel, 0, 0, 0, reel, 16); hub.rotation.z = Math.PI / 2;
    for (let k = 0; k < 3; k++) { const sp = box(0.006, 0.29, 0.03, M.steel, 0, 0, 0, reel); sp.rotation.x = (k * Math.PI) / 3; }
    const film = cyl(0.1, 0.1, 0.016, M.rubber, 0, 0, 0, reel, 28); film.rotation.z = Math.PI / 2;
    reels.push(reel);
  }
  // light cone from the lens to the four screen corners
  const apex = proj.localToWorld(new THREE.Vector3(0, 0.02, 0.38));
  const corners = [[-SW / 2, SY + SH / 2], [SW / 2, SY + SH / 2], [SW / 2, SY - SH / 2], [-SW / 2, SY - SH / 2]].map(([x, y]) => new THREE.Vector3(x, y, SZ + 0.02));
  const bg = new THREE.BufferGeometry();
  const pos = [apex, ...corners].flatMap((v) => [v.x, v.y, v.z]);
  bg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  bg.setAttribute('color', new THREE.Float32BufferAttribute([1, 1, 1, 0.16, 0.16, 0.16, 0.16, 0.16, 0.16, 0.16, 0.16, 0.16, 0.16, 0.16, 0.16], 3));
  bg.setIndex([0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 1]);
  const beamMat = new THREE.MeshBasicMaterial({ color: 0xfff0d6, vertexColors: true, transparent: true, opacity: 0.11, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const beam = new THREE.Mesh(bg, beamMat); beam.renderOrder = 5; s.add(beam);
  // dust in the light
  const N = 150, dust = new Float32Array(N * 3), seeds = [], r = rng(77);
  for (let i = 0; i < N; i++) seeds.push([0.08 + r() * 0.9, r() * 2 - 1, r() * 2 - 1, r() * 6.28, 0.2 + r() * 0.6]);
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dust, 3));
  const dustPts = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xfff4dc, size: 0.014, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
  dustPts.renderOrder = 6; s.add(dustPts);
  const c0 = new THREE.Vector3(0, SY, SZ), v = new THREE.Vector3();
  onUpdate((dt, time) => {
    reels[0].rotation.x -= dt * 2.4; reels[1].rotation.x -= dt * 1.7;
    beamMat.opacity = 0.085 + Math.random() * 0.045; glass.material.color.setScalar(2.6 + Math.random() * 1.2);
    for (let i = 0; i < N; i++) {
      const [u, a, b, ph, sp] = seeds[i];
      const aa = a + Math.sin(time * sp * 0.3 + ph) * 0.12, bb = b + Math.cos(time * sp * 0.22 + ph) * 0.12;
      const uu = (u + time * 0.004 * sp) % 1;
      v.set(c0.x + aa * SW * 0.5, c0.y + bb * SH * 0.5, SZ).sub(apex).multiplyScalar(uu).add(apex);
      dust[i * 3] = v.x; dust[i * 3 + 1] = v.y; dust[i * 3 + 2] = v.z;
    }
    dg.attributes.position.needsUpdate = true;
  });
  world.refs.projectorPos = P;
}

// ---------------------------------------------------------------- library
function library(api) {
  const s = world.scene;
  const X0 = -6.95, D = 0.35, Z0 = -4.6, Z1 = 0.6, bay = (Z1 - Z0) / 3;
  const ys = [0.08, 0.52, 0.96, 1.4, 1.84, 2.28, 2.72];
  s.add(box(0.03, 2.72, Z1 - Z0, M.darkwood, X0 - 0.005, 1.4, (Z0 + Z1) / 2));
  for (let i = 0; i <= 3; i++) s.add(box(D, 2.76, 0.035, M.darkwood, X0 + D / 2, 1.4, Z0 + i * bay));
  ys.forEach((y, i) => {
    for (let b = 0; b < 3; b++) {
      if (b === 1 && (i === 3 || i === 4)) continue;      // the poster niche
      s.add(box(D, 0.03, bay - 0.03, M.darkwood, X0 + D / 2, y, Z0 + bay * (b + 0.5)));
      if (i >= 2 && i <= 5 && !(b === 1 && i === 2)) s.add(box(0.012, 0.008, bay - 0.1, M.ledWarm, X0 + D - 0.03, y - 0.02, Z0 + bay * (b + 0.5)));
    }
  });
  s.add(box(D + 0.02, 0.08, Z1 - Z0 + 0.04, M.darkwood, X0 + D / 2, 0.04, (Z0 + Z1) / 2));
  framed(T.bauhausTex(), 0.82, 1.15, X0 + 0.03, 1.62, Z0 + bay * 1.5, Math.PI / 2, { frame: M.black });
  s.add(box(0.03, 0.02, 0.5, M.ledWarm, X0 + 0.2, 2.25, Z0 + bay * 1.5));

  // books
  const pal = [0xe6dcc4, 0xd8c9a3, 0x7a1f17, 0xb5140e, 0x1c2a5a, 0x14225e, 0x23423a, 0xc9952b, 0x15161a, 0x2b2d33, 0x6b4a2e, 0x8a7a66, 0x3d1f1a, 0xbdb5a4];
  const feature = { '0:3': true, '2:3': true }, items = [], r = rng(2009);
  for (let b = 0; b < 3; b++) for (let row = 0; row < 6; row++) {
    if (b === 1 && row >= 2 && row <= 4) continue;
    const zA = Z0 + bay * b + 0.04, zB = Z0 + bay * (b + 1) - 0.04, y0 = ys[row] + 0.015;
    if (feature[`${b}:${row}`]) {
      // leave room for the face-out books: only a short stack at each end
      for (const zc of [zA + 0.1, zB - 0.1]) for (let k = 0; k < 3; k++) items.push([X0 + 0.14, y0 + 0.02 + k * 0.042, zc, 0.2, 0.038, 0.15 + r() * 0.03, pal[Math.floor(r() * pal.length)], 0]);
      continue;
    }
    let z = zA;
    while (z < zB - 0.06) {
      const th = 0.022 + r() * 0.034;
      if (r() < 0.05) { z += 0.05 + r() * 0.08; continue; }
      const hh = Math.min(0.39, 0.22 + r() * 0.15), dd = 0.17 + r() * 0.08;
      items.push([X0 + 0.03 + dd / 2, y0 + hh / 2, z + th / 2, dd, hh, th, pal[Math.floor(r() * pal.length)], r() < 0.06 ? 0.12 : 0]);
      z += th + 0.002;
    }
  }
  const books = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.82 }), items.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color(), e = new THREE.Euler();
  items.forEach(([x, y, z, dx, dy, dz, c, lean], i) => {
    q.setFromEuler(e.set(lean, 0, 0));
    books.setMatrixAt(i, m4.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(dx, dy, dz)));
    col.setHex(c, THREE.SRGBColorSpace).multiplyScalar(0.7 + r() * 0.5); books.setColorAt(i, col);
  });
  books.castShadow = false; books.receiveShadow = true; s.add(books);

  // the four books that can be read, face out at eye level
  const spots = [Z0 + bay * 0.36, Z0 + bay * 0.66, Z0 + bay * 2.34, Z0 + bay * 2.64];
  const covers = [];
  BOOKS.forEach((bk, i) => {
    const z = spots[i], plain = new THREE.MeshStandardMaterial({ color: bk.color, roughness: 0.7 }), page = M.paper;
    const cover = new THREE.MeshStandardMaterial({ map: T.bookCoverTex(bk), roughness: 0.6, emissive: 0xffffff, emissiveIntensity: 0.32 }); cover.emissiveMap = cover.map;
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.275, 0.195), [cover, plain, page, page, plain, page]);
    m.position.set(X0 + 0.2, ys[3] + 0.015 + 0.14, z); m.rotation.z = 0.13; m.castShadow = true; s.add(m);
    covers.push([cover, bk]);
    const act = () => api.open('book', bk.id);
    clickable(m, act, () => L(bk.title));
    hotspot({ id: 'book-' + bk.id, pos: [X0 + 0.36, ys[3] + 0.36, z], label: () => L(bk.title), icon: 'book', range: 3.6, view: { pos: [-5.5, 1.62, z], look: [X0, 1.52, z] }, action: act });
  });
  onLang(() => covers.forEach(([mat, bk]) => { mat.map.dispose(); mat.map = mat.emissiveMap = T.bookCoverTex(bk); }));
  contact(1.0, 5.6, X0 + 0.3, (Z0 + Z1) / 2, 0.011, 0.7); collide(-7, -6.56, Z0 - 0.1, Z1 + 0.1);
}

// ---------------------------------------------------------------- narrator's desk
function desk(api) {
  const s = world.scene;
  const d = group(-5.0, 0, 3.35);
  rbox(1.9, 0.045, 0.8, 0.012, M.walnut, 0, 0.745, 0, d);
  for (const x of [-0.85, 0.85]) { box(0.045, 0.72, 0.045, M.black, x, 0.36, -0.33, d); box(0.045, 0.72, 0.045, M.black, x, 0.36, 0.33, d); box(0.045, 0.045, 0.7, M.black, x, 0.03, 0, d); }
  const Y = 0.768;
  // boom arm + microphone
  cyl(0.03, 0.035, 0.05, M.black, -0.8, Y + 0.025, -0.28, d, 14);
  rod([-0.8, Y, -0.28], [-0.62, Y + 0.52, -0.05], 0.011, M.black, d); rod([-0.62, Y + 0.52, -0.05], [-0.22, Y + 0.4, 0.3], 0.011, M.black, d);
  const mic = group(-0.2, Y + 0.36, 0.33, 0, d); mic.rotation.set(0.5, 0.5, 0);
  const body = cyl(0.03, 0.03, 0.17, M.metal, 0, 0, 0, mic, 18); body.rotation.x = Math.PI / 2;
  const foam = cyl(0.034, 0.034, 0.07, M.rubber, 0, 0, 0.11, mic, 18); foam.rotation.x = Math.PI / 2;
  const band = cyl(0.0305, 0.0305, 0.012, M.red, 0, 0, 0.02, mic, 18); band.rotation.x = Math.PI / 2;
  // pad controller
  rbox(0.32, 0.03, 0.2, 0.008, M.plastic, 0.32, Y + 0.015, 0.05, d);
  const padCols = [0xff3b30, 0xffb83f, 0x58d6f2, 0xede6d3];
  for (let i = 0; i < 8; i++) box(0.05, 0.008, 0.05, glow(padCols[i % 4], 0.9), 0.2 + (i % 4) * 0.07, Y + 0.034, 0.01 + Math.floor(i / 4) * 0.07, d);
  // notebook and pen
  const nb = box(0.2, 0.014, 0.27, M.cream, -0.28, Y + 0.007, -0.12, d); nb.rotation.y = 0.15;
  const pen = cyl(0.005, 0.005, 0.14, M.red, -0.2, Y + 0.02, -0.1, d, 8); pen.rotation.set(Math.PI / 2, 0, 0.6);
  cyl(0.04, 0.034, 0.09, M.black, -0.55, Y + 0.045, -0.2, d, 16);
  // the hat and the dark glasses: he is never in the room
  const hat = fedora(); hat.position.set(0.68, Y, -0.16); hat.rotation.y = 0.5; d.add(hat);
  const gl = group(0.5, Y + 0.02, 0.2, -0.4, d);
  for (const x of [-0.034, 0.034]) { const ln = cyl(0.029, 0.029, 0.004, M.glassDark, x, 0, 0, gl, 20); ln.rotation.x = Math.PI / 2 - 0.2; }
  box(0.014, 0.004, 0.004, M.black, 0, 0.01, 0, gl);
  for (const x of [-0.064, 0.064]) { const arm = box(0.004, 0.004, 0.12, M.black, x, 0.008, -0.06, gl); arm.rotation.y = x > 0 ? -0.08 : 0.08; }
  contact(2.4, 1.2, -5.0, 3.35, 0.011, 0.6); collide(-5.97, -4.03, 2.93, 3.77);

  // chair
  const ch = group(-5.0, 0, 4.12, Math.PI);
  rbox(0.56, 0.1, 0.54, 0.04, M.leather, 0, 0.5, 0, ch);
  const back = rbox(0.54, 0.78, 0.1, 0.045, M.leather, 0, 0.94, -0.26, ch); back.rotation.x = -0.1;
  cyl(0.03, 0.03, 0.34, M.chrome, 0, 0.28, 0, ch, 12);
  for (let i = 0; i < 5; i++) { const a = (i / 5) * 6.283; rod([0, 0.1, 0], [Math.cos(a) * 0.3, 0.05, Math.sin(a) * 0.3], 0.016, M.black, ch); }
  for (const x of [-0.3, 0.3]) box(0.05, 0.03, 0.3, M.black, x, 0.68, 0.02, ch);
  collide(-5.35, -4.65, 3.8, 4.5);

  // lit sign and sconces on the wall behind the chair
  const sign = framed(T.logoSignTex(), 2.3, 0.943, -5.0, 2.35, 4.925, Math.PI, { lit: true });
  sign.userData.art.material.color.setScalar(1.5);
  for (const x of [-6.45, -3.55]) { cyl(0.035, 0.035, 0.34, M.shade, x, 2.2, 4.88, s, 12); pointLight(0xffb878, 2.4, x, 2.2, 4.6, 3.5); }
  loadImage('assets/img/brand/crew.jpg').then((im) => {
    if (!im) return; const tx = new THREE.Texture(im); tx.colorSpace = THREE.SRGBColorSpace; tx.needsUpdate = true;
    const fr = framed(tx, 1.15, 0.647, -6.925, 1.95, 3.0, Math.PI / 2);
    clickable(fr.userData.art, () => api.open('founder'), () => t('h_founder'));
  });
  hotspot({ id: 'founder', pos: [-4.32, 1.02, 3.19], label: 'h_founder', icon: 'hat', view: { pos: [-4.3, 1.62, 2.0], look: [-4.5, 0.9, 3.4] }, action: () => api.open('founder') });
}

export function fedora(color = 0x121214) {
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.92, side: THREE.DoubleSide });
  const g = new THREE.Group();
  const pts = [[0.0, 0.118], [0.05, 0.122], [0.082, 0.116], [0.094, 0.095], [0.098, 0.05], [0.1, 0.012], [0.11, 0.004], [0.14, 0.0], [0.162, 0.004], [0.17, 0.011]].map(([x, y]) => new THREE.Vector2(x, y));
  const crown = new THREE.Mesh(new THREE.LatheGeometry(pts, 40), mat); crown.scale.set(1, 1, 1.18); crown.castShadow = true; g.add(crown);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.102, 0.03, 40, 1, true), new THREE.MeshStandardMaterial({ color: 0x050506, roughness: 0.5, side: THREE.DoubleSide }));
  band.position.y = 0.03; band.scale.set(1, 1, 1.18); g.add(band);
  const sq = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.02, 0.02), M.red); sq.position.set(0.102, 0.03, 0); g.add(sq);
  return g;
}

// ---------------------------------------------------------------- workflow board + script archive
async function southWall(api) {
  const s = world.scene;
  const bw = 5.0, bh = (bw * 740) / 2048;
  const boardMat = texMat(await T.boardTex(WORKFLOW), 0.85);
  const fr = framed(boardMat.map, bw, bh, 0, 2.08, 4.925, Math.PI, { frame: M.darkwood, depth: 0.05 });
  fr.userData.art.material = boardMat;
  onLang(async () => { const tx = await T.boardTex(WORKFLOW); boardMat.map.dispose(); boardMat.map = tx; });
  for (const x of [-1.5, 1.5]) { s.add(box(0.7, 0.02, 0.04, M.brass, x, 3.08, 4.82)); s.add(box(0.6, 0.012, 0.03, M.ledWarm, x, 3.068, 4.82)); }
  const openFlow = () => api.open('workflow');
  clickable(fr.userData.art, openFlow, () => t('h_workflow'));
  hotspot({ id: 'workflow', pos: [0, 2.08, 4.88], label: 'h_workflow', icon: 'board', view: { pos: [0, 1.66, 2.35], look: [0, 2.0, 4.95] }, action: openFlow });

  // archive credenza: one column of drawers per film
  const cab = group(0, 0, 4.68);
  rbox(3.6, 0.78, 0.5, 0.012, M.walnut, 0, 0.46, 0, cab);
  for (const x of [-1.7, 1.7]) for (const z of [-0.2, 0.2]) cyl(0.02, 0.014, 0.08, M.brass, x, 0.04, z, cab, 8);
  FILMS.forEach((f, i) => {
    const x = 1.32 - i * 0.88;             // the cabinet faces north, so film 1 sits on the visitor's left
    for (let row = 0; row < 2; row++) {
      const y = 0.66 - row * 0.38;
      const dr = rbox(0.84, 0.34, 0.03, 0.008, M.walnut, x, y, -0.262, cab);
      rod([x - 0.09, y - 0.09, -0.29], [x + 0.09, y - 0.09, -0.29], 0.008, M.brass, cab);
      const lab = plane(0.3, 0.1125, texMat(T.labelTex(row ? f.dur : f.code, { sub: row ? 'SKRIP · VO' : L(f.short) }), 0.8), x, y + 0.05, -0.279, Math.PI, cab);
      clickable(dr, () => api.open('scripts', f.id), () => t('h_scripts'));
      clickable(lab, () => api.open('scripts', f.id), () => t('h_scripts'));
    }
  });
  // typewriter
  const tw = group(-0.9, 0.85, -0.02, Math.PI, cab);
  const enamel = new THREE.MeshStandardMaterial({ color: 0x1d3a36, roughness: 0.35, metalness: 0.3 });
  rbox(0.36, 0.07, 0.32, 0.02, enamel, 0, 0.035, 0, tw);
  rbox(0.36, 0.08, 0.14, 0.02, enamel, 0, 0.1, -0.09, tw);
  const platen = cyl(0.026, 0.026, 0.4, M.rubber, 0, 0.16, -0.11, tw, 16); platen.rotation.z = Math.PI / 2;
  for (const x of [-0.21, 0.21]) { const k = cyl(0.02, 0.02, 0.012, M.chrome, x, 0.16, -0.11, tw, 14); k.rotation.z = Math.PI / 2; }
  const keys = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.0085, 0.0085, 0.008, 12), new THREE.MeshStandardMaterial({ color: 0x9c968a, roughness: 0.6 }), 40);
  const km = new THREE.Matrix4();
  for (let row = 0; row < 4; row++) for (let c = 0; c < 10; c++) keys.setMatrixAt(row * 10 + c, km.makeTranslation(-0.125 + c * 0.0278 + (row % 2) * 0.012, 0.078 + (3 - row) * 0.008, 0.13 - (3 - row) * 0.034));
  tw.add(keys);
  box(0.2, 0.006, 0.02, M.chrome, 0, 0.075, 0.155, tw);
  const [pc, pctx] = T.canvas(420, 520);
  T.grainFill(pctx, 0, 0, 420, 520, '#f3eee1', 0.05, 4);
  pctx.fillStyle = '#1a1a1c'; pctx.font = T.F.mono(17, 700); pctx.fillText('29 · 05 · 1973', 40, 60); pctx.font = T.F.mono(13); pctx.fillText('KUALA LUMPUR', 40, 82);
  pctx.font = T.F.mono(15); let py = 130;
  for (const ln of SCRIPTS[3].lines.ms.slice(0, 3)) for (const w of T.wrapLines(pctx, ln, 340)) { pctx.fillText(w, 40, py); py += 24; }
  pctx.fillRect(40, py - 12, 10, 16);
  const sheet = plane(0.21, 0.26, new THREE.MeshStandardMaterial({ map: T.tex(pc), roughness: 0.9, side: THREE.DoubleSide }), 0, 0.3, -0.135, 0, tw); sheet.rotation.x = -0.16;
  // papers, film cans, banker's lamp
  const stack = box(0.22, 0.05, 0.3, M.paper, 0.15, 0.875, 0, cab); stack.rotation.y = 0.08;
  for (let i = 0; i < 3; i++) cyl(0.14, 0.14, 0.036, M.steel, 1.25, 0.868 + i * 0.038, 0.0, cab, 30);
  cyl(0.06, 0.07, 0.015, M.brass, -0.3, 0.857, 0.12, cab, 16); rod([-0.3, 0.86, 0.12], [-0.3, 1.1, 0.12], 0.008, M.brass, cab);
  const shade = cyl(0.045, 0.045, 0.24, glow(0x2f8f5f, 1.1), -0.3, 1.11, 0.07, cab, 14); shade.rotation.z = Math.PI / 2;
  pointLight(0xffe0b0, 1.1, -0.3, 1.3, 4.3, 2.5);
  contact(4.2, 1.0, 0, 4.6, 0.011, 0.7); collide(-1.85, 1.85, 4.35, 5);
  hotspot({ id: 'scripts', pos: [-0.9, 1.12, 4.56], label: 'h_scripts', icon: 'page', view: { pos: [-0.9, 1.62, 3.3], look: [-0.9, 1.0, 4.7] }, action: () => api.open('scripts') });
}

// ---------------------------------------------------------------- record corner
function recordCorner(api) {
  const s = world.scene;
  const g = group(5.0, 0, 4.68, Math.PI);       // faces north, into the room
  rbox(1.7, 0.5, 0.46, 0.012, M.walnut, 0, 0.47, 0, g);
  for (const x of [-0.75, 0.75]) for (const z of [-0.17, 0.17]) cyl(0.022, 0.012, 0.22, M.brass, x, 0.11, z, g, 8);
  box(0.78, 0.4, 0.02, M.black, -0.4, 0.47, 0.225, g);
  const r = rng(33), sleeveCols = [0xd1140d, 0xede6d3, 0x14225e, 0xf2b01e, 0x1f4d45, 0x15161a, 0xb89b72];
  for (let i = 0; i < 20; i++) box(0.012, 0.34 + r() * 0.03, 0.34, new THREE.MeshStandardMaterial({ color: sleeveCols[Math.floor(r() * 7)], roughness: 0.8 }), -0.74 + i * 0.036, 0.46, 0.05, g);
  for (const x of [0.2, 0.6]) box(0.38, 0.42, 0.012, M.oak, x, 0.47, 0.232, g);
  const Y = 0.72;
  // turntable
  const tt = group(-0.3, Y, 0, 0, g);
  rbox(0.48, 0.06, 0.37, 0.012, M.black, 0, 0.03, 0, tt); box(0.482, 0.012, 0.372, M.walnut, 0, 0.012, 0, tt);
  cyl(0.158, 0.158, 0.018, M.steel, -0.04, 0.07, 0, tt, 48);
  const recMat = new THREE.MeshStandardMaterial({ map: T.recordTex(), roughness: 0.35, metalness: 0.2, transparent: true });
  const rec = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.004, 64), [M.rubber, recMat, M.rubber]);
  rec.position.set(-0.04, 0.082, 0); tt.add(rec);
  cyl(0.004, 0.004, 0.02, M.chrome, -0.04, 0.09, 0, tt, 8);
  const arm = group(0.17, 0.075, -0.125, 0, tt);
  cyl(0.022, 0.026, 0.03, M.chrome, 0, 0.015, 0, arm, 16);
  rod([0, 0.035, 0], [0, 0.03, 0.215], 0.0045, M.chrome, arm); box(0.018, 0.012, 0.035, M.black, 0, 0.026, 0.225, arm);
  cyl(0.014, 0.014, 0.03, M.steel, 0, 0.035, -0.045, arm, 12).rotation.x = Math.PI / 2;
  arm.rotation.y = -0.1;
  box(0.03, 0.006, 0.03, glow(0xff3b30, 2), 0.2, 0.062, 0.14, tt);
  // amplifier
  const amp = group(0.45, Y, 0.0, 0, g);
  rbox(0.4, 0.13, 0.3, 0.008, M.steel, 0, 0.065, 0, amp); box(0.402, 0.02, 0.302, M.walnut, 0, 0.14, 0, amp);
  const vu = [];
  for (const x of [-0.09, 0.09]) { plane(0.12, 0.06, glow(0xffc468, 1.3), x, 0.08, 0.152, 0, amp); const n = box(0.003, 0.045, 0.002, M.black, x, 0.07, 0.155, amp); n.geometry.translate(0, 0.02, 0); vu.push(n); }
  for (const x of [-0.16, 0, 0.16]) cyl(0.014, 0.014, 0.02, M.black, x, 0.03, 0.155, amp, 12).rotation.x = Math.PI / 2;
  // speakers
  const cones = [];
  for (const x of [-1.12, 1.12]) {
    const sp = group(x, 0, 0.02, 0, g);
    cyl(0.02, 0.02, 0.62, M.black, 0, 0.31, 0, sp, 8); cyl(0.14, 0.15, 0.02, M.black, 0, 0.01, 0, sp, 20);
    rbox(0.3, 0.5, 0.26, 0.012, M.walnut, 0, 0.88, 0, sp); box(0.27, 0.47, 0.01, M.black, 0, 0.88, 0.131, sp);
    const cone = cyl(0.095, 0.05, 0.03, M.plastic, 0, 0.8, 0.15, sp, 28); cone.rotation.x = -Math.PI / 2; cones.push(cone);
    cyl(0.03, 0.03, 0.012, M.steel, 0, 1.0, 0.14, sp, 16).rotation.x = Math.PI / 2;
  }
  // covers on the wall: the middle one shows what is playing
  const mk = (c) => { const tx = T.tex(c); return tx; };
  const now = framed(mk(T.generatedCover('Sesi Studio Warga', 'Warga Films')), 0.62, 0.62, 5.0, 1.78, 4.925, Math.PI);
  framed(mk(T.generatedCover('Getaran Borneo', 'Lelaki Tanpa Nama')), 0.42, 0.42, 4.2, 1.78, 4.925, Math.PI);
  framed(mk(T.generatedCover('Malam Render', 'Warga Crew')), 0.42, 0.42, 5.8, 1.78, 4.925, Math.PI);
  contact(3.0, 1.0, 5.0, 4.6, 0.011, 0.7); collide(3.72, 6.28, 4.38, 5);

  const openV = () => api.open('vinyl');
  clickable(rec, openV, () => t('h_vinyl'));
  hotspot({ id: 'vinyl', pos: [5.3, 1.0, 4.62], label: 'h_vinyl', icon: 'vinyl', view: { pos: [5.15, 1.56, 3.35], look: [5.2, 0.9, 4.75] }, action: openV });

  const deck = world.refs.deck = { rec, recMat, arm, now: now.userData.art, playing: false, spin: 0, level: 0 };
  /** Put a new sleeve image on the record label and in the frame. */
  deck.setCover = (image) => {
    recMat.map.dispose(); recMat.map = T.recordTex(image); recMat.needsUpdate = true;
    const [c, ctx] = T.canvas(512, 512); T.coverImage(ctx, image, 0, 0, 512, 512);
    const m = deck.now.material; if (m.map) m.map.dispose(); m.map = T.tex(c); m.needsUpdate = true;
  };
  onUpdate((dt, time) => {
    deck.spin += ((deck.playing ? 1 : 0) - deck.spin) * Math.min(1, dt * 2.2);
    rec.rotation.y -= dt * 3.49 * deck.spin;       // 33⅓ rpm
    arm.rotation.y += ((deck.playing ? 0.36 + Math.sin(time * 0.6) * 0.012 : -0.1) - arm.rotation.y) * Math.min(1, dt * 2.5);
    const lv = deck.playing ? audio.musicLevel() : 0; deck.level += (lv - deck.level) * Math.min(1, dt * 14);
    cones.forEach((c) => { c.position.z = 0.15 + deck.level * 0.016; });
    vu.forEach((n, i) => { n.rotation.z = 0.7 - clamp(deck.level * 1.9 + Math.sin(time * 9 + i) * 0.04 * deck.spin, 0, 1) * 1.4; });
  });
}

// ---------------------------------------------------------------- film rack + split-flap board
async function filmRack(api) {
  const s = world.scene;
  const X = 6.96, Zc = 0.3;
  s.add(box(0.04, 2.0, 2.5, M.darkwood, X, 1.0, Zc));
  for (const z of [-0.95, 1.55]) s.add(box(0.34, 2.0, 0.04, M.darkwood, X - 0.17, 1.0, z));
  for (const y of [0.1, 0.52, 1.14, 1.8]) s.add(box(0.34, 0.035, 2.5, M.darkwood, X - 0.17, y, Zc));
  for (let i = 1; i < 4; i++) s.add(box(0.32, 0.64, 0.02, M.darkwood, X - 0.17, 1.47, -0.95 + i * 0.625));
  for (let i = 0; i < FILMS.length; i++) {
    const f = FILMS[i], z = -0.95 + (i + 0.5) * 0.625;
    const cover = new THREE.MeshStandardMaterial({ map: await T.vhsCoverTex(f), roughness: 0.55 });
    const spine = new THREE.MeshStandardMaterial({ color: 0x111216, roughness: 0.6 });
    const vhs = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.455, 0.26), [spine, cover, spine, spine, spine, spine]);
    vhs.position.set(X - 0.13, 1.16 + 0.018 + 0.228, z); vhs.rotation.z = -0.09; vhs.castShadow = true; s.add(vhs);
    s.add(box(0.012, 0.01, 0.5, M.ledWarm, X - 0.31, 1.775, z));
    plane(0.34, 0.085, texMat(T.labelTex(f.code, { w: 384, h: 96, sub: f.dur + ' · 4K60' }), 0.8), X - 0.345, 1.118, z, -Math.PI / 2, s);
    const act = () => api.open('films', f.id);
    clickable(vhs, act, () => L(f.title));
    vhs.userData.baseX = vhs.position.x;
    onUpdate((dt) => { const tx = vhs.userData.baseX - (vhs.userData.hover ? 0.05 : 0); vhs.position.x += (tx - vhs.position.x) * Math.min(1, dt * 10); vhs.userData.hover = false; });
  }
  // lower shelves: film cans, loose tapes
  const r = rng(8);
  for (let i = 0; i < 4; i++) for (let k = 0; k < 2 + (i % 2); k++) cyl(0.135, 0.135, 0.034, k % 2 ? M.steel : M.metal, X - 0.17, 0.555 + k * 0.036, -0.65 + i * 0.62, s, 28);
  for (let i = 0; i < FILMS.length; i++) {
    const tape = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.36), [M.plastic, new THREE.MeshStandardMaterial({ map: T.vhsSpineTex(FILMS[i]), roughness: 0.7 }), M.plastic, M.plastic, M.plastic, M.plastic]);
    tape.position.set(X - 0.18, 0.135 + (i % 2) * 0.031, -0.5 + Math.floor(i / 2) * 1.3 + (i % 2) * 0.03); tape.rotation.y = (r() - 0.5) * 0.2; s.add(tape);
  }
  contact(1.0, 2.9, X - 0.25, Zc, 0.011, 0.7); collide(6.56, 7, -1.05, 1.65);
  hotspot({ id: 'films', pos: [X - 0.3, 1.5, Zc], label: 'h_films', icon: 'film', view: { pos: [5.05, 1.62, Zc], look: [X, 1.45, Zc] }, action: () => api.open('films') });

  // split-flap board above the rack
  const COLS = 16, ROWS = 2, CW = 60, CHh = 104, PADX = 32, PADY = 26;
  const [fc, fx] = T.canvas(COLS * CW + PADX * 2, ROWS * CHh + PADY * 2 + 8);
  const CH = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-·&?';
  const cells = Array.from({ length: COLS * ROWS }, () => ({ cur: 0, tgt: 0, ph: 0 }));
  const flapTex = T.tex(fc);
  s.add(box(0.09, 0.72, 2.46, M.black, X - 0.03, 2.3, Zc));
  plane(2.36, (2.36 * fc.height) / fc.width, glow(0xffffff, 1.05, { map: flapTex }), X - 0.078, 2.3, Zc, -Math.PI / 2, s);
  const glyph = (ch, x, y, clipTop) => {
    fx.save(); fx.beginPath(); fx.rect(x, clipTop ? y : y + CHh / 2, CW - 4, CHh / 2); fx.clip();
    fx.fillStyle = '#17181c'; fx.fillRect(x, y, CW - 4, CHh);
    fx.fillStyle = '#efe7d2'; fx.font = T.F.cond(84); fx.textAlign = 'center'; fx.textBaseline = 'middle'; fx.fillText(ch, x + (CW - 4) / 2, y + CHh / 2 + 5);
    fx.restore();
  };
  const drawFlap = () => {
    fx.fillStyle = '#060607'; fx.fillRect(0, 0, fc.width, fc.height);
    cells.forEach((c, i) => {
      const x = PADX + (i % COLS) * CW + 2, y = PADY + Math.floor(i / COLS) * (CHh + 8);
      const a = CH[c.cur], b = CH[(c.cur + 1) % CH.length];
      if (c.cur === c.tgt && c.ph === 0) { glyph(a, x, y, true); glyph(a, x, y, false); } else {
        glyph(b, x, y, true); glyph(a, x, y, false);
        fx.save();
        if (c.ph < 0.5) { fx.translate(0, y + CHh / 2); fx.scale(1, 1 - c.ph * 2); fx.translate(0, -(y + CHh / 2)); glyph(a, x, y, true); }
        else { fx.translate(0, y + CHh / 2); fx.scale(1, c.ph * 2 - 1); fx.translate(0, -(y + CHh / 2)); glyph(b, x, y, false); }
        fx.restore();
      }
      fx.fillStyle = 'rgba(0,0,0,0.75)'; fx.fillRect(x, y + CHh / 2 - 1.5, CW - 4, 3);
    });
    flapTex.needsUpdate = true;
  };
  const setText = (lines) => {
    lines.forEach((ln, row) => {
      const txt = ln.toUpperCase().slice(0, COLS), pad = Math.floor((COLS - txt.length) / 2);
      for (let c = 0; c < COLS; c++) { const ch = txt[c - pad] || ' '; cells[row * COLS + c].tgt = Math.max(0, CH.indexOf(ch)); }
    });
  };
  const msgs = ['flapWelcome', 'flapSince', 'flapFilms', 'flapMotto'];
  let mi = 0, timer = 0, acc = 0, busy = false;
  setText(t(msgs[0])); cells.forEach((c) => { c.cur = c.tgt; }); drawFlap();
  const flapPos = new THREE.Vector3(X, 2.3, Zc);
  const next = (k) => { mi = k % msgs.length; setText(t(msgs[mi])); timer = 0; const d = world.refs.camera ? world.refs.camera.position.distanceTo(flapPos) : 99; if (d < 8) audio.play('flap', { vol: 0.34 * (1 - d / 8) }); };
  onLang(() => next(0));
  onUpdate((dt) => {
    timer += dt; acc += dt;
    if (timer > 10 && !busy) next(mi + 1);
    if (acc < 1 / 30) return;
    busy = false;
    for (const c of cells) {
      if (c.cur !== c.tgt || c.ph > 0) {
        busy = true; c.ph += acc * 16;
        if (c.ph >= 1) { c.ph = 0; c.cur = (c.cur + 1) % CH.length; }
      }
    }
    acc = 0; if (busy) drawFlap(); else if (world.refs.flapDirty) { drawFlap(); world.refs.flapDirty = false; }
  });
}

// ---------------------------------------------------------------- door to the merch room
function doorway(api) {
  const s = world.scene, X = 6.99;
  for (const z of [2.17, 3.83]) s.add(box(0.33, 2.36, 0.07, M.walnut, 7.11, 1.18, z));
  s.add(box(0.33, 0.07, 1.73, M.walnut, 7.11, 2.335, 3.0));
  plane(1.3, 0.325, glow(0xffffff, 1.4, { map: T.textSignTex('KEDAI MERCH', { w: 640, h: 160, size: 84, gap: 10 }) }), X - 0.02, 2.68, 3.0, -Math.PI / 2, s);
  s.add(box(0.03, 0.36, 1.36, M.black, X - 0.01, 2.68, 3.0));
  hotspot({ id: 'merch', pos: [6.85, 1.35, 3.0], label: 'h_merch', icon: 'shirt', range: 6, action: () => api.go('merch') });
}

function stageRiser() {
  const s = world.scene;
  s.add(box(3.6, 0.12, 3.2, M.darkwood, 5.0, 0.06, -3.2));
  s.add(box(3.6, 0.012, 0.012, M.ledAmber, 5.0, 0.03, -1.595)); s.add(box(0.012, 0.012, 3.2, M.ledAmber, 3.195, 0.03, -3.2));
  const rug = new THREE.Mesh(new THREE.CircleGeometry(1.42, 48), new THREE.MeshStandardMaterial({ map: T.stageRugTex(), roughness: 0.95, transparent: true }));
  rug.rotation.x = -Math.PI / 2; rug.position.set(5.4, 0.124, -3.55); rug.receiveShadow = true; s.add(rug);
  world.refs.riser = { x0: 3.2, x1: 6.8, z0: -4.8, z1: -1.6, y: 0.12 };
  const art = framed(T.abstractArtTex(), 1.74, 1.16, 6.925, 2.0, -3.3, -Math.PI / 2);
  art.userData.art.material.roughness = 0.7;
}

async function posters(api) {
  const spots = [[-3.62, 0], [-4.86, 1], [4.0, 3], [5.22, 2]];
  for (const [x, i] of spots) {
    const f = FILMS[i];
    const fr = framed(await T.posterTex(f), 0.84, 1.187, x, 1.86, -4.925, 0);
    clickable(fr.userData.art, () => api.open('films', f.id), () => L(f.title));
    world.scene.add(box(0.5, 0.015, 0.03, M.ledWarm, x, 2.52, -4.86));
  }
}

// ---------------------------------------------------------------- the TV that shows YouTube
function tvCorner(api) {
  const g = group(-5.45, 0, -4.2, 0.62);
  rbox(1.0, 0.42, 0.46, 0.012, M.darkwood, 0, 0.27, 0, g);
  for (const x of [-0.42, 0.42]) for (const z of [-0.17, 0.17]) cyl(0.02, 0.012, 0.07, M.brass, x, 0.035, z, g, 8);
  rbox(0.4, 0.07, 0.26, 0.008, M.metal, 0.05, 0.3, 0.11, g);        // VCR in the open shelf
  box(0.42, 0.02, 0.01, glow(0x38ff7a, 0.9), 0.05, 0.3, 0.243, g).scale.set(0.2, 0.6, 1);
  rbox(0.74, 0.58, 0.5, 0.04, M.plastic, 0, 0.775, -0.02, g);
  box(0.6, 0.46, 0.02, M.black, -0.04, 0.79, 0.225, g);
  const [c, ctx] = T.canvas(256, 196);
  const tvTex = T.tex(c, { aniso: 2 });
  const scr = plane(0.54, 0.41, glow(0xffffff, 1.5, { map: tvTex }), -0.04, 0.79, 0.238, 0, g);
  for (const y of [0.9, 0.82]) cyl(0.016, 0.016, 0.012, M.steel, 0.31, y, 0.235, g, 12).rotation.x = Math.PI / 2;
  rod([0, 1.065, -0.1], [-0.26, 1.5, -0.2], 0.004, M.chrome, g); rod([0, 1.065, -0.1], [0.24, 1.46, -0.22], 0.004, M.chrome, g);
  const light = pointLight(0x9fc4ff, 3, -5.15, 0.85, -3.75, 3.5);
  const drawTV = (time) => {
    const id = ctx.createImageData(64, 49), d = id.data;
    for (let i = 0; i < d.length; i += 4) { const v = 20 + Math.random() * 70; d[i] = v; d[i + 1] = v; d[i + 2] = v + 12; d[i + 3] = 255; }
    ctx.putImageData(id, 0, 0); ctx.imageSmoothingEnabled = false; ctx.drawImage(c, 0, 0, 64, 49, 0, 0, 256, 196);
    ctx.fillStyle = 'rgba(8,8,14,0.55)'; ctx.fillRect(0, 0, 256, 196);
    const j = Math.random() < 0.08 ? (Math.random() - 0.5) * 10 : 0;
    ctx.fillStyle = '#e6170f'; ctx.beginPath(); ctx.roundRect(88 + j, 52, 80, 56, 16); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(118 + j, 66); ctx.lineTo(118 + j, 94); ctx.lineTo(142 + j, 80); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f2ecdc'; ctx.font = T.F.cond(28); ctx.textAlign = 'center'; ctx.fillText('WARGA FILMS', 128 + j, 142);
    ctx.font = T.F.mono(11); ctx.fillStyle = 'rgba(242,236,220,0.8)'; ctx.fillText('@wargafilms', 128, 160);
    ctx.textAlign = 'left'; ctx.fillStyle = '#7dff9a'; ctx.font = T.F.mono(11, 700); ctx.fillText('PLAY ▶', 12, 20); ctx.fillText('SP', 12, 184);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; for (let y = (Math.floor(time * 30) % 3); y < 196; y += 3) ctx.fillRect(0, y, 256, 1);
    const band = (time * 60) % 260; ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(0, band - 30, 256, 22);
    tvTex.needsUpdate = true; light.intensity = 2.4 + Math.random() * 1.2;
  };
  let acc = 1; onUpdate((dt, time) => { acc += dt; if (acc > 0.09) { acc = 0; drawTV(time); } });
  contact(1.5, 1.1, -5.45, -4.2, 0.011, 0.7); collide(-6.1, -4.85, -4.75, -3.72);
  const act = () => api.open('youtube');
  clickable(scr, act, () => t('h_youtube'));
  hotspot({ id: 'youtube', pos: [-5.3, 0.95, -3.95], label: 'h_youtube', icon: 'play', view: { pos: [-4.35, 1.4, -2.75], look: [-5.45, 0.8, -4.2] }, action: act });
  world.refs.tvPos = new THREE.Vector3(-5.45, 0.8, -4.2);
}

function plants() {
  for (const [x, z, sc] of [[-6.35, 1.25, 1], [-3.05, 4.55, 0.85], [6.45, -1.3, 0.9]]) {
    const g = group(x, 0, z); g.scale.setScalar(sc);
    cyl(0.17, 0.13, 0.32, M.pot, 0, 0.16, 0, g, 18);
    const r = rng(Math.round(x * 10 + 50));
    for (let i = 0; i < 9; i++) {
      const h = 0.55 + r() * 0.55, leaf = new THREE.Mesh(new THREE.ConeGeometry(0.06, h, 5), M.plant);
      leaf.scale.z = 0.22; leaf.position.set((r() - 0.5) * 0.14, 0.3 + h / 2, (r() - 0.5) * 0.14);
      leaf.rotation.set((r() - 0.5) * 0.5, r() * 3.14, (r() - 0.5) * 0.5); leaf.castShadow = true; g.add(leaf);
    }
    contact(0.7, 0.7, x, z, 0.011, 0.6); collide(x - 0.17, x + 0.17, z - 0.17, z + 0.17);
  }
}
