// The stage: drum kit, guitar and saxophone, built from primitives and playable.
import * as THREE from 'three';
import { world, M, box, rbox, cyl, disc, group, rod, taperTube, contact, collide, onUpdate, hotspot, clickable } from './build.js';
import * as T from './tex.js';
import { t } from './i18n.js';
import { audio } from './audio.js';

export const PLAY = {
  drums: {
    title: 'drumsTitle',
    pads: [
      { k: ' ', cap: '␣', id: 'kick', t: { ms: 'Bes', en: 'Kick' } },
      { k: 's', id: 'snare', t: { ms: 'Snare', en: 'Snare' } },
      { k: 'h', id: 'hat', t: { ms: 'Hi-hat', en: 'Hi-hat' } },
      { k: 'o', id: 'open', t: { ms: 'Hi-hat buka', en: 'Open hat' } },
      { k: 't', id: 'tom1', t: { ms: 'Tom 1', en: 'Tom 1' } },
      { k: 'y', id: 'tom2', t: { ms: 'Tom 2', en: 'Tom 2' } },
      { k: 'u', id: 'floor', t: { ms: 'Tom lantai', en: 'Floor tom' } },
      { k: 'c', id: 'crash', t: { ms: 'Crash', en: 'Crash' } },
      { k: 'r', id: 'ride', t: { ms: 'Ride', en: 'Ride' } },
    ],
  },
  guitar: {
    title: 'guitarTitle',
    chords: [
      { k: 'q', name: 'Em', notes: [40, 47, 52, 55, 59, 64] },
      { k: 'w', name: 'G', notes: [43, 47, 50, 55, 59, 67] },
      { k: 'e', name: 'D', notes: [50, 57, 62, 66] },
      { k: 'r', name: 'C', notes: [48, 52, 55, 60, 64] },
      { k: 't', name: 'Am', notes: [45, 52, 57, 60, 64] },
    ],
    notes: [['a', 52, 'E'], ['s', 55, 'G'], ['d', 57, 'A'], ['f', 59, 'B'], ['g', 62, 'D'], ['h', 64, 'E'], ['j', 67, 'G'], ['k', 69, 'A']].map(([k, midi, name]) => ({ k, midi, name })),
  },
  sax: {
    title: 'saxTitle', hold: true,
    notes: [['a', 50, 'D'], ['s', 53, 'F'], ['d', 55, 'G'], ['f', 56, 'A♭'], ['g', 57, 'A'], ['h', 60, 'C'], ['j', 62, 'D'], ['k', 65, 'F'], ['l', 67, 'G']].map(([k, midi, name]) => ({ k, midi, name })),
  },
};

export const band = { parts: {}, strings: [], sax: null, views: {}, notes: [] };

export function buildStage(api) {
  notePool();
  drums(api);
  guitar(api);
  sax(api);
  // amp behind the guitar
  const amp = group(4.55, 0.12, -4.5);
  rbox(0.6, 0.5, 0.28, 0.02, M.black, 0, 0.25, 0, amp);
  const grille = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.36), new THREE.MeshStandardMaterial({ map: T.ampTex(), roughness: 0.9 }));
  grille.position.set(0, 0.22, 0.141); amp.add(grille);
  box(0.54, 0.05, 0.01, M.steel, 0, 0.45, 0.141, amp);
  for (let i = 0; i < 5; i++) cyl(0.012, 0.012, 0.016, M.cream, -0.2 + i * 0.1, 0.45, 0.152, amp, 10).rotation.x = Math.PI / 2;
  box(0.012, 0.012, 0.004, M.ledRed, 0.24, 0.45, 0.148, amp);
  collide(4.2, 4.9, -4.75, -4.3);
}

// ---------------------------------------------------------------- notes that float out of the instruments
function notePool() {
  const tx = T.noteTexes();
  for (let i = 0; i < 30; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx[i % 4], transparent: true, depthWrite: false, opacity: 0 }));
    sp.scale.setScalar(0.12); sp.visible = false; sp.renderOrder = 8; world.scene.add(sp);
    band.notes.push({ sp, life: 0, v: new THREE.Vector3(), rot: 0 });
  }
  let cursor = 0;
  band.note = (pos, spread = 0.12) => {
    const n = band.notes[cursor++ % band.notes.length];
    n.sp.position.copy(pos).add(new THREE.Vector3((Math.random() - 0.5) * spread, Math.random() * 0.05, (Math.random() - 0.5) * spread));
    n.v.set((Math.random() - 0.5) * 0.25, 0.42 + Math.random() * 0.3, (Math.random() - 0.5) * 0.25);
    n.life = 1; n.rot = (Math.random() - 0.5) * 2; n.sp.visible = true; n.sp.material.rotation = (Math.random() - 0.5) * 0.6;
    n.sp.scale.setScalar(0.07 + Math.random() * 0.07);
  };
  onUpdate((dt, time) => {
    for (const n of band.notes) {
      if (n.life <= 0) continue;
      n.life -= dt * 0.62;
      n.sp.position.addScaledVector(n.v, dt); n.sp.position.x += Math.sin(time * 4 + n.rot * 9) * dt * 0.12;
      n.sp.material.rotation += n.rot * dt; n.sp.material.opacity = Math.min(1, n.life * 2.2);
      if (n.life <= 0) n.sp.visible = false;
    }
  });
}

// ---------------------------------------------------------------- drums
function drums(api) {
  const K = group(5.6, 0.12, -3.75, -0.85);
  const shell = new THREE.MeshPhysicalMaterial({ color: 0xa5110b, roughness: 0.28, metalness: 0.25, clearcoat: 1, clearcoatRoughness: 0.12 });
  shell.envMapIntensity = 3;
  const head = new THREE.MeshStandardMaterial({ color: 0xebe4d0, roughness: 0.55 });
  const cym = new THREE.MeshStandardMaterial({ color: 0xcfa544, roughness: 0.3, metalness: 1, side: THREE.DoubleSide }); cym.envMapIntensity = 3.4;
  const hoop = (r, y, parent) => { const h = new THREE.Mesh(new THREE.TorusGeometry(r, 0.007, 8, 40), M.chrome); h.rotation.x = Math.PI / 2; h.position.y = y; parent.add(h); };
  const stand = (x, y, z, spread = 0.2) => { rod([x, 0, z], [x, y, z], 0.009, M.chrome, K); for (let i = 0; i < 3; i++) { const a = i * 2.094 + 0.4; rod([x, 0.2, z], [x + Math.cos(a) * spread, 0.005, z + Math.sin(a) * spread], 0.006, M.chrome, K); } };

  const drum = (id, r, h, x, y, z, tx = 0, tz = 0) => {
    const g = group(x, y, z, 0, K); g.rotation.set(tx, 0, tz);
    cyl(r, r, h, shell, 0, 0, 0, g, 40);
    const top = disc(r - 0.004, head, 0, h / 2 + 0.002, 0, g, 40); top.rotation.x = -Math.PI / 2;
    hoop(r + 0.003, h / 2, g); hoop(r + 0.003, -h / 2, g);
    for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.283; box(0.012, h * 0.5, 0.01, M.chrome, Math.cos(a) * (r + 0.004), 0, Math.sin(a) * (r + 0.004), g).rotation.y = -a; }
    band.parts[id] = { g, top, e: 0, kind: 'drum', base: g.position.clone(), topY: h / 2 + 0.002 };
    return g;
  };
  const cymbal = (id, r, x, y, z, tilt = 0.12) => {
    const g = group(x, y, z, 0, K);
    const pts = [[0.012, 0.03], [0.04, 0.028], [0.06, 0.012], [r * 0.7, 0.004], [r, -0.006]].map(([a, b]) => new THREE.Vector2(a, b));
    const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 48), cym); m.castShadow = true; g.add(m);
    g.rotation.x = tilt;
    band.parts[id] = { g, e: 0, kind: 'cymbal', tilt };
    return g;
  };

  // kick, lying on its side with the logo head facing the room
  const kick = group(0, 0.3, 0.12, 0, K);
  const kshell = cyl(0.28, 0.28, 0.4, shell, 0, 0, 0, kick, 48); kshell.rotation.x = Math.PI / 2;
  const front = disc(0.272, new THREE.MeshStandardMaterial({ map: T.drumHeadTex(), roughness: 0.6 }), 0, 0, 0.203, kick, 48);
  const backHead = disc(0.272, head, 0, 0, -0.203, kick, 48); backHead.rotation.y = Math.PI;
  for (const z of [-0.2, 0.2]) { const h = new THREE.Mesh(new THREE.TorusGeometry(0.284, 0.012, 8, 48), new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 0.4 })); h.position.z = z; kick.add(h); }
  for (const x of [-0.22, 0.22]) rod([x, 0.42, 0.26], [x * 1.5, 0.005, 0.44], 0.008, M.chrome, K);
  band.parts.kick = { g: kick, top: front, e: 0, kind: 'kick' };
  box(0.1, 0.02, 0.26, M.metal, 0, 0.012, -0.24, K);                         // pedal
  const beater = group(0, 0.03, -0.14, 0, K); rod([0, 0, 0], [0, 0.26, 0], 0.005, M.chrome, beater); cyl(0.022, 0.022, 0.04, M.cream, 0, 0.27, 0, beater, 12).rotation.x = Math.PI / 2;
  band.parts.kick.beater = beater;

  drum('snare', 0.178, 0.14, -0.42, 0.63, -0.36, 0.08); stand(-0.42, 0.56, -0.36, 0.22);
  drum('tom1', 0.14, 0.2, -0.19, 0.83, 0.0, -0.35, 0.1);
  drum('tom2', 0.16, 0.22, 0.2, 0.84, 0.0, -0.35, -0.1);
  rod([0, 0.58, 0.02], [0, 0.78, 0.02], 0.012, M.chrome, K);
  drum('floor', 0.2, 0.36, 0.58, 0.52, -0.38);
  for (let i = 0; i < 3; i++) { const a = i * 2.094 + 0.5; rod([0.58 + Math.cos(a) * 0.21, 0.5, -0.38 + Math.sin(a) * 0.21], [0.58 + Math.cos(a) * 0.25, 0.005, -0.38 + Math.sin(a) * 0.25], 0.006, M.chrome, K); }

  const hatBottom = cymbal('hatB', 0.17, -0.78, 0.86, -0.22, 0); hatBottom.rotation.x = Math.PI; hatBottom.position.y = 0.875;
  cymbal('hat', 0.17, -0.78, 0.885, -0.22, 0); stand(-0.78, 0.98, -0.22, 0.2);
  cymbal('crash', 0.225, -0.62, 1.3, 0.22, 0.16); stand(-0.62, 1.3, 0.22, 0.24);
  cymbal('ride', 0.26, 0.74, 1.1, 0.02, 0.2); stand(0.74, 1.1, 0.02, 0.24);
  band.parts.open = band.parts.hat;
  // throne
  cyl(0.17, 0.17, 0.07, M.leather, 0, 0.5, -0.82, K, 28); rod([0, 0, -0.82], [0, 0.48, -0.82], 0.014, M.chrome, K);
  for (let i = 0; i < 3; i++) { const a = i * 2.094; rod([0, 0.22, -0.82], [Math.cos(a) * 0.22, 0.005, -0.82 + Math.sin(a) * 0.22], 0.007, M.chrome, K); }
  // sticks resting on the snare
  for (const o of [-0.03, 0.03]) { const st = cyl(0.006, 0.004, 0.4, M.oak, -0.42 + o, 0.715, -0.36, K, 8); st.rotation.set(Math.PI / 2, 0, 0.3 + o * 6); }

  K.updateMatrixWorld(true);
  const local = (v) => K.localToWorld(new THREE.Vector3(...v)).toArray();
  band.views.drums = { pos: local([0, 1.36, -1.42]), look: local([0, 0.66, 0.1]) };
  collide(4.75, 6.4, -4.62, -2.95);
  const act = () => api.play('drums');
  for (const p of Object.values(band.parts)) p.g.traverse((o) => { if (o.isMesh) clickable(o, act, () => t('h_drums')); });
  hotspot({ id: 'drums', pos: local([0, 1.0, 0.1]), label: 'h_drums', icon: 'drum', action: act });

  band.hit = (id) => {
    const p = band.parts[id]; if (!p) return;
    p.e = 1; audio.drum(id);
    if (id === 'open') band.parts.hat.openT = 0.4;
    const wp = new THREE.Vector3(); p.g.getWorldPosition(wp); wp.y += 0.12; band.note(wp, 0.2);
  };
  const tmp = new THREE.Vector3();
  onUpdate((dt, time) => {
    for (const [id, p] of Object.entries(band.parts)) {
      if (id === 'open' || id === 'hatB') continue;
      p.e = Math.max(0, p.e - dt * (p.kind === 'cymbal' ? 1.1 : 5));
      if (p.kind === 'drum') { p.top.position.y = p.topY - p.e * 0.012; p.g.position.copy(p.base); p.g.position.y -= p.e * 0.006; }
      else if (p.kind === 'kick') { const k = 1 + p.e * 0.035; p.top.scale.set(k, k, 1); p.top.position.z = 0.203 + p.e * 0.012; p.beater.rotation.x = p.e * 0.5; }
      else { p.g.rotation.x = p.tilt + Math.sin(time * 21) * p.e * 0.2; p.g.rotation.z = Math.cos(time * 17) * p.e * 0.16; if (id === 'hat') { p.openT = Math.max(0, (p.openT || 0) - dt); p.g.position.y = 0.885 + (p.openT > 0 ? 0.03 : 0) - p.e * 0.006; } }
    }
  });
}

// ---------------------------------------------------------------- guitar
function guitar(api) {
  const G = group(3.8, 0.12, -4.25, 0.35);
  const body = new THREE.Group(); body.position.set(0, 0.1, 0); body.rotation.x = -0.2; G.add(body);
  const sp = new THREE.Shape();
  sp.moveTo(0, 0.02);
  sp.bezierCurveTo(0.14, 0.02, 0.2, 0.08, 0.195, 0.17); sp.bezierCurveTo(0.19, 0.25, 0.115, 0.27, 0.118, 0.33);
  sp.bezierCurveTo(0.12, 0.38, 0.15, 0.39, 0.148, 0.45); sp.bezierCurveTo(0.145, 0.51, 0.08, 0.53, 0, 0.53);
  sp.bezierCurveTo(-0.08, 0.53, -0.145, 0.51, -0.148, 0.45); sp.bezierCurveTo(-0.15, 0.39, -0.12, 0.38, -0.118, 0.33);
  sp.bezierCurveTo(-0.115, 0.27, -0.19, 0.25, -0.195, 0.17); sp.bezierCurveTo(-0.2, 0.08, -0.14, 0.02, 0, 0.02);
  const geo = new THREE.ExtrudeGeometry(sp, { depth: 0.092, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 2, curveSegments: 24 });
  geo.translate(0, 0, -0.046);
  const topMat = new THREE.MeshPhysicalMaterial({ color: 0xc98a3c, roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.2 });
  const sideMat = new THREE.MeshPhysicalMaterial({ color: 0x4a2412, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.2 });
  topMat.envMapIntensity = sideMat.envMapIntensity = 2.4;
  const bm = new THREE.Mesh(geo, [topMat, sideMat]); bm.castShadow = true; body.add(bm);
  disc(0.047, new THREE.MeshBasicMaterial({ color: 0x050403 }), 0, 0.36, 0.0535, body);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.05, 0.062, 40), new THREE.MeshStandardMaterial({ color: 0x241208, roughness: 0.5 })); ring.position.set(0, 0.36, 0.0532); body.add(ring);
  box(0.15, 0.024, 0.012, M.darkwood, 0, 0.19, 0.058, body); box(0.09, 0.004, 0.006, M.cream, 0, 0.195, 0.066, body);
  const neckMat = new THREE.MeshStandardMaterial({ color: 0x3a2010, roughness: 0.5 });
  box(0.05, 0.4, 0.024, neckMat, 0, 0.7, 0.04, body); box(0.054, 0.47, 0.006, M.black, 0, 0.655, 0.056, body);
  const NUT = 0.89, SCALE = 0.7;
  for (let n = 1; n <= 14; n++) box(0.054, 0.0025, 0.003, M.chrome, 0, NUT - SCALE * (1 - Math.pow(2, -n / 12)), 0.0595, body);
  for (const n of [3, 5, 7, 9, 12]) { const y = NUT - SCALE * (1 - Math.pow(2, -(n - 0.5) / 12)); disc(0.004, M.cream, 0, y, 0.0594, body, 10); }
  box(0.056, 0.006, 0.008, M.cream, 0, NUT, 0.058, body);
  const hs = box(0.074, 0.17, 0.016, neckMat, 0, NUT + 0.09, 0.036, body); hs.rotation.x = -0.1;
  for (let i = 0; i < 6; i++) { const side = i < 3 ? -1 : 1, y = NUT + 0.04 + (i % 3) * 0.045; cyl(0.006, 0.006, 0.02, M.chrome, side * 0.022, y, 0.05, body, 8).rotation.x = Math.PI / 2; rbox(0.02, 0.012, 0.008, 0.003, M.cream, side * 0.05, y, 0.03, body); }
  for (let i = 0; i < 6; i++) {
    const k = i / 5 - 0.5, st = rod([k * 0.058, 0.195, 0.066], [k * 0.042, NUT, 0.0625], 0.0013 - i * 0.00016, i < 3 ? M.brass : M.steel, body, 6);
    st.castShadow = false; band.strings.push({ m: st, x: st.position.x, e: 0, ph: i * 1.7 });
  }
  // stand
  rod([-0.2, 0, 0.16], [0, 0.42, -0.1], 0.008, M.black, G); rod([0.2, 0, 0.16], [0, 0.42, -0.1], 0.008, M.black, G); rod([0, 0, -0.28], [0, 0.42, -0.1], 0.008, M.black, G);
  rod([-0.1, 0.1, 0.08], [0.1, 0.1, 0.08], 0.008, M.rubber, G); rod([0, 0.42, -0.1], [0, 0.78, -0.13], 0.008, M.black, G);
  contact(0.9, 0.8, 3.8, -4.25, 0.126, 0.5); collide(3.5, 4.1, -4.55, -4.0);

  G.updateMatrixWorld(true);
  const local = (v) => G.localToWorld(new THREE.Vector3(...v)).toArray();
  band.views.guitar = { pos: local([0.12, 0.92, 1.02]), look: local([0, 0.55, 0]) };
  const act = () => api.play('guitar');
  clickable(bm, act, () => t('h_guitar'));
  hotspot({ id: 'guitar', pos: local([0, 0.62, 0.12]), label: 'h_guitar', icon: 'note', action: act });

  const stringFor = (midi) => (midi < 45 ? 0 : midi < 50 ? 1 : midi < 55 ? 2 : midi < 59 ? 3 : midi < 64 ? 4 : 5);
  const hole = new THREE.Vector3();
  band.pluck = (midi) => { audio.pluck(midi, { vol: 0.55 }); band.strings[stringFor(midi)].e = 1; body.localToWorld(hole.set(0, 0.36, 0.1)); band.note(hole); };
  band.strum = (notes) => { audio.strum(notes); notes.forEach((m, i) => { const s = band.strings[Math.min(5, i + (6 - notes.length))]; setTimeout(() => { s.e = 1; }, i * 22); }); body.localToWorld(hole.set(0, 0.36, 0.1)); band.note(hole); band.note(hole); };
  onUpdate((dt, time) => {
    for (const s of band.strings) {
      if (s.e <= 0.001) { if (s.m.scale.x !== 1) { s.m.scale.x = 1; s.m.position.x = s.x; } continue; }
      s.e *= Math.exp(-dt * 2.6);
      s.m.position.x = s.x + Math.sin(time * 190 + s.ph) * s.e * 0.0022; s.m.scale.x = 1 + s.e * 3.5;
    }
  });
}

// ---------------------------------------------------------------- saxophone
function sax(api) {
  const S = group(3.75, 0.12, -2.2, 0.9);
  const brass = new THREE.MeshStandardMaterial({ color: 0xd9a93f, roughness: 0.2, metalness: 1, side: THREE.DoubleSide }); brass.envMapIntensity = 3.6;
  const horn = new THREE.Group(); S.add(horn);
  const pts = [[-0.17, 0.665, 0], [-0.11, 0.705, 0], [-0.03, 0.7, 0], [0.0, 0.63, 0], [0.0, 0.42, 0], [0.0, 0.15, 0], [0.005, 0.05, 0], [0.05, 0.0, 0], [0.105, 0.005, 0], [0.14, 0.06, 0], [0.15, 0.19, 0], [0.17, 0.29, 0], [0.2, 0.345, 0]];
  const radius = (u) => {
    if (u < 0.1) return 0.007 + u * 0.05;            // mouthpiece and neck
    if (u < 0.6) return 0.012 + (u - 0.1) * 0.056;   // body
    if (u < 0.86) return 0.04 + (u - 0.6) * 0.045;   // bow
    return 0.052 + Math.pow((u - 0.86) / 0.14, 2.2) * 0.05; // bell flare
  };
  const tube = taperTube(pts, radius, brass, { parent: horn, segs: 110, radial: 24 });
  const curve = tube.userData.curve;
  const mp = cyl(0.009, 0.012, 0.075, M.rubber, -0.185, 0.652, 0, horn, 12); mp.rotation.z = 1.05;
  const P = new THREE.Vector3(), keys = [];
  for (let i = 0; i < 14; i++) {
    const u = 0.2 + i * 0.03; curve.getPointAt(u, P);
    const r = radius(u), side = i % 3 === 0 ? -1 : 1;
    const key = cyl(0.011 + (i % 4) * 0.002, 0.011 + (i % 4) * 0.002, 0.004, brass, P.x + (i > 9 ? 0 : 0), P.y, side * (r + 0.006), horn, 14);
    key.rotation.x = Math.PI / 2; keys.push({ m: key, z: key.position.z, side, e: 0 });
  }
  rod([0.012, 0.6, 0.03], [0.012, 0.16, 0.05], 0.0025, brass, horn); rod([-0.012, 0.6, -0.03], [-0.012, 0.2, -0.05], 0.0025, brass, horn);
  const bellRing = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.004, 8, 40), brass); bellRing.position.set(0.2, 0.345, 0); bellRing.rotation.set(Math.PI / 2, 0.52, 0); horn.add(bellRing);
  // stand
  cyl(0.16, 0.17, 0.015, M.black, 0.03, 0.008, 0, S, 24); rod([0.03, 0.01, 0], [0.03, 0.3, 0], 0.01, M.black, S);
  rod([0.03, 0.3, 0], [0.11, 0.36, 0], 0.008, M.black, S); rod([0.03, 0.2, 0], [-0.05, 0.36, 0], 0.008, M.black, S);
  horn.position.set(-0.03, 0.28, 0); horn.rotation.z = 0.12;
  contact(0.7, 0.7, 3.75, -2.2, 0.126, 0.5); collide(3.5, 4.0, -2.45, -1.95);

  S.updateMatrixWorld(true);
  const local = (v) => S.localToWorld(new THREE.Vector3(...v)).toArray();
  band.views.sax = { pos: local([0.1, 1.02, 1.05]), look: local([0.04, 0.82, 0]) };
  const act = () => api.play('sax');
  clickable(tube, act, () => t('h_sax'));
  hotspot({ id: 'sax', pos: local([0, 0.95, 0.05]), label: 'h_sax', icon: 'note', action: act });

  const st = band.sax = { horn, held: 0, lift: 0, active: false, blow: 0 };
  const bell = new THREE.Vector3();
  let noteClock = 0;
  band.saxOn = (midi) => { audio.saxOn(midi); st.held++; st.blow = 1; const k = keys[(midi * 5) % keys.length]; k.e = 1; horn.localToWorld(bell.set(0.2, 0.36, 0)); band.note(bell); };
  band.saxOff = (midi) => { audio.saxOff(midi); st.held = Math.max(0, st.held - 1); };
  band.saxMode = (on) => { st.active = on; if (!on) { st.held = 0; audio.saxAllOff(); } };
  onUpdate((dt, time) => {
    st.lift += ((st.active ? 1 : 0) - st.lift) * Math.min(1, dt * 3);
    st.blow = Math.max(0, st.blow - dt * (st.held ? 0 : 2.5));
    horn.position.set(-0.03, 0.28 + st.lift * 0.36 + Math.sin(time * 2.1) * 0.012 * st.lift, st.lift * 0.08);
    horn.rotation.z = 0.12 + st.lift * (0.16 + Math.sin(time * 1.3) * 0.05 + st.blow * 0.05);
    horn.rotation.y = st.lift * (-0.35 + Math.sin(time * 0.9) * 0.08);
    for (const k of keys) { k.e = Math.max(0, k.e - dt * 5); k.m.position.z = k.z - k.side * k.e * 0.005; }
    if (st.held) { noteClock += dt; if (noteClock > 0.28) { noteClock = 0; horn.localToWorld(bell.set(0.2, 0.36, 0)); band.note(bell); } }
  });
}
