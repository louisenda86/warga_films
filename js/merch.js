// The merch room: a bright paper-collage shop off the east wall of the studio.
import * as THREE from 'three';
import { world, M, box, rbox, cyl, plane, disc, group, rod, contact, collide, onUpdate, hotspot, clickable, glow, texMat, framed, pointLight } from './build.js';
import * as T from './tex.js';
import { FILMS, MERCH } from './content.js';
import { t, L, onLang, getLang } from './i18n.js';
import { loadImage } from './util.js';
import { fedora } from './studio.js';

const X0 = 7.25, X1 = 13.0, Z0 = 0.0, Z1 = 6.0, H = 3.2;

export async function buildMerch(api) {
  const s = world.scene;
  const cx = (X0 + X1) / 2, cz = (Z0 + Z1) / 2, w = X1 - X0, d = Z1 - Z0;
  const floor = plane(w, d, new THREE.MeshStandardMaterial({ map: T.checkerTex(), roughness: 0.55 }), cx, 0.001, cz);
  floor.rotation.x = -Math.PI / 2; s.add(floor); world.refs.floors.push(floor);
  const ceil = plane(w, d, new THREE.MeshStandardMaterial({ color: 0xe9e1cc, roughness: 1 }), cx, H, cz); ceil.rotation.x = Math.PI / 2; s.add(ceil);
  const wallMat = texMat(T.paperWallTex(), 0.95), redMat = new THREE.MeshStandardMaterial({ color: 0xa5140e, roughness: 0.9 });
  const wall = (len, x, z, ry, y0 = 0, h = H) => {
    plane(len, h - Math.max(y0, 0.95), wallMat, x, (h + Math.max(y0, 0.95)) / 2, z, ry, s);
    if (y0 < 0.95) { plane(len, 0.95 - y0, redMat, x, (0.95 + y0) / 2, z, ry, s); const rail = plane(len, 0.03, M.black, x, 0.965, z, ry, s); rail.translateZ(0.004); }
  };
  wall(w, cx, Z0, 0); wall(w, cx, Z1, Math.PI); wall(d, X1, cz, -Math.PI / 2);
  wall(2.2, X0 + 0.005, 1.1, Math.PI / 2); wall(2.2, X0 + 0.005, 4.9, Math.PI / 2); wall(1.6, X0 + 0.005, 3.0, Math.PI / 2, 2.3);
  s.add(box(0.25, H, 1.0, M.wall, 7.125, H / 2, 5.5));
  for (const [x, z] of [[9, 3], [11.5, 3]]) { const p = disc(0.42, glow(0xfff1dc, 1.9), x, H - 0.01, z, s, 32); p.rotation.x = Math.PI / 2; pointLight(0xffecd2, 7.5, x, 2.7, z, 8, 1.6); }
  pointLight(0xffe6c4, 3.2, 10.2, 2.3, 1.3, 5); pointLight(0xffe6c4, 2.6, 10.2, 2.2, 4.9, 5);

  // sign
  framed(T.textSignTex('KEDAI WARGA', { w: 768, h: 180, bg: '#a5140e', fg: '#fff3da', size: 96, gap: 12, dot: false }), 2.3, 0.54, 10.25, 2.62, Z0 + 0.03, 0, { lit: true, frame: M.black });
  loadImage('assets/img/brand/stamp.jpg').then((im) => { if (!im) return; const tx = new THREE.Texture(im); tx.colorSpace = THREE.SRGBColorSpace; tx.needsUpdate = true; framed(tx, 0.95, 0.95, X0 + 0.04, 1.85, 1.1, Math.PI / 2, { frame: M.darkwood }); });
  const note = () => { const [c, ctx] = T.canvas(512, 640); T.grainFill(ctx, 0, 0, 512, 640, '#f1ead8', 0.06, 6);
    ctx.fillStyle = T.C.red; ctx.fillRect(40, 44, 34, 34); ctx.fillStyle = '#15161a'; ctx.font = T.F.cond(58); T.spaced(ctx, t('collection').toUpperCase(), 90, 78, 6);
    ctx.font = T.F.serif(50); T.wrapLines(ctx, getLang() === 'ms' ? 'Segera hadir.' : 'Coming soon.', 430).forEach((ln, i) => ctx.fillText(ln, 40, 190 + i * 54));
    ctx.font = T.F.mono(18); T.wrapLines(ctx, t('merchSoon'), 430).forEach((ln, i) => ctx.fillText(ln, 40, 290 + i * 28));
    T.drawLogo(ctx, 40, 500, 46, '#15161a'); return T.tex(c); };
  const noteFr = framed(note(), 0.72, 0.9, X0 + 0.04, 1.85, 4.9, Math.PI / 2, { frame: M.black });
  onLang(() => { const m = noteFr.userData.art.material; m.map.dispose(); m.map = note(); });

  // a collage wall above the hats, and the four film posters above the tapes
  const [cc, cx2] = T.canvas(1280, 560);
  T.grainFill(cx2, 0, 0, 1280, 560, '#14225e', 0.1, 3); T.burst(cx2, 300, 300, 190, 270, 16, T.C.marigold); T.halftone(cx2, 640, 0, 640, 560, 'rgba(0,0,0,0.28)', 14, 5);
  let done = T.paperPiece(cx2, 560, 60, 640, 200, '#efe8d6', { rot: -0.03, seed: 4 }); cx2.fillStyle = '#15161a'; cx2.font = T.F.serif(122); cx2.fillText('Koleksi 01', -296, 42); done();
  done = T.paperPiece(cx2, 720, 310, 420, 120, T.C.red, { rot: 0.04, seed: 8 }); cx2.fillStyle = '#fff3da'; cx2.font = T.F.cond(74); T.spaced(cx2, 'SEJAK 2009', -176, 27, 8); done();
  done = T.paperPiece(cx2, 110, 180, 380, 230, '#f3efe4', { rot: 0.05, seed: 9 }); T.drawLogo(cx2, -160, -86, 78, '#15161a'); done();
  T.tape(cx2, 300, 182, 130, 34, -0.2); T.tape(cx2, 1150, 70, 110, 32, 0.4);
  cx2.fillStyle = '#f6e9c8'; cx2.font = T.F.mono(20, 700); T.spaced(cx2, 'PULAU BORNEO  ·  DOKUMENTARI  ·  BAHASA MELAYU', 60, 520, 3);
  framed(T.tex(cc), 3.3, 1.44, X1 - 0.03, 2.3, 3.0, -Math.PI / 2, { frame: M.black });
  for (let i = 0; i < FILMS.length; i++) framed(await T.posterTex(FILMS[i]), 0.6, 0.848, 8.85 + i * 0.86, 2.2, Z1 - 0.03, Math.PI, { frame: M.black });

  rail(api); shelfEast(api); await shelfSouth(api); await plinth();
  hotspot({ id: 'studio', pos: [7.42, 1.35, 3.0], label: 'h_studio', icon: 'door', room: 'merch', range: 6, action: () => api.go('studio') });
}

const item = (id, pos, view, meshes) => {
  const act = () => world.refs.api.open('merch', id);
  const m = MERCH.find((x) => x.id === id);
  hotspot({ id: 'merch-' + id, pos, label: () => L(m.name), icon: 'tag', room: 'merch', range: 4.2, view, action: act });
  for (const g of meshes) g.traverse((o) => { if (o.isMesh) clickable(o, act, () => L(m.name)); });
};

// ---------------------------------------------------------------- clothes on the rail
function garmentShape(kind) {
  const s = new THREE.Shape();
  if (kind === 'tee') {
    s.moveTo(-0.085, 0); s.lineTo(-0.25, -0.035); s.lineTo(-0.375, -0.13); s.lineTo(-0.33, -0.24); s.lineTo(-0.228, -0.19);
    s.lineTo(-0.235, -0.66); s.lineTo(0.235, -0.66); s.lineTo(0.228, -0.19); s.lineTo(0.33, -0.24); s.lineTo(0.375, -0.13); s.lineTo(0.25, -0.035); s.lineTo(0.085, 0);
    s.quadraticCurveTo(0, -0.085, -0.085, 0);
  } else {
    s.moveTo(-0.09, 0); s.lineTo(-0.265, -0.04); s.quadraticCurveTo(-0.36, -0.2, -0.405, -0.56); s.lineTo(-0.31, -0.6); s.lineTo(-0.245, -0.24);
    s.lineTo(-0.25, -0.7); s.lineTo(0.25, -0.7); s.lineTo(0.245, -0.24); s.lineTo(0.31, -0.6); s.lineTo(0.405, -0.56); s.quadraticCurveTo(0.36, -0.2, 0.265, -0.04); s.lineTo(0.09, 0);
    s.quadraticCurveTo(0, kind === 'jacket' ? -0.12 : -0.075, -0.09, 0);
  }
  return s;
}
function garment(kind, color) {
  const g = new THREE.Group();
  const geo = new THREE.ExtrudeGeometry(garmentShape(kind), { depth: 0.028, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 3, curveSegments: 14 });
  geo.translate(0, 0, -0.014);
  const cloth = new THREE.MeshStandardMaterial({ color, roughness: 0.96 });
  const m = new THREE.Mesh(geo, cloth); m.castShadow = true; g.add(m);
  const [c, ctx] = T.canvas(512, 512); ctx.clearRect(0, 0, 512, 512);
  if (kind === 'tee') { T.drawLogo(ctx, 146, 150, 62, '#15161a'); }
  if (kind === 'hoodie') {
    ctx.fillStyle = T.C.red; ctx.font = T.F.serif(58); ctx.textAlign = 'center'; ctx.fillText('Persoalkan', 256, 190); ctx.fillText('segala-galanya.', 256, 250);
    ctx.fillStyle = 'rgba(237,230,211,0.9)'; ctx.font = T.F.mono(17); ctx.fillText('WARGA FILMS · SEJAK 2009', 256, 292);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.moveTo(140, 400); ctx.lineTo(372, 400); ctx.lineTo(392, 492); ctx.lineTo(120, 492); ctx.closePath(); ctx.fill();
  }
  if (kind === 'jacket') {
    ctx.fillStyle = '#c9cdd3'; ctx.fillRect(253, 60, 6, 452);
    T.grainFill(ctx, 300, 150, 130, 34, '#e6dfcb', 0.06, 3); ctx.fillStyle = '#15161a'; ctx.font = T.F.mono(17, 700); ctx.fillText('WARGA CREW', 310, 173);
    ctx.fillStyle = '#0b0c0f'; ctx.fillRect(86, 140, 120, 62); ctx.strokeStyle = '#d8d0ba'; ctx.lineWidth = 2; ctx.strokeRect(89, 143, 114, 56); T.drawLogo(ctx, 100, 152, 19, '#ede6d3');
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(90, 330, 130, 8); ctx.fillRect(292, 330, 130, 8);
  }
  const print = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshStandardMaterial({ map: T.tex(c), transparent: true, roughness: 0.9, depthWrite: false }));
  print.position.set(0, -0.36 + (kind === 'tee' ? 0.02 : 0), 0.026); g.add(print);
  if (kind === 'hoodie') {
    const hood = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.62), cloth); hood.scale.set(1, 1.05, 0.5); hood.position.set(0, 0.0, -0.035); hood.castShadow = true; g.add(hood);
    for (const x of [-0.035, 0.035]) rod([x, -0.07, 0.03], [x * 1.3, -0.27, 0.032], 0.004, M.cream, g);
  }
  if (kind === 'jacket') for (const sx of [-1, 1]) { const col = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.05, 0.012), cloth); col.position.set(sx * 0.075, -0.045, 0.03); col.rotation.z = sx * -0.75; g.add(col); }
  // hanger
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.004, 8, 20, Math.PI * 1.4), M.chrome); hook.position.set(0, 0.075, 0); hook.rotation.z = -0.3; g.add(hook);
  rod([0, 0.045, 0], [0, 0.0, 0], 0.004, M.chrome, g); rod([0, 0.01, 0], [-0.24, -0.045, 0], 0.006, M.oak, g); rod([0, 0.01, 0], [0.24, -0.045, 0], 0.006, M.oak, g);
  return g;
}
function rail(api) {
  const s = world.scene, Y = 1.93, Z = 0.36;
  rod([8.25, Y, Z], [12.25, Y, Z], 0.014, M.chrome, s, 14);
  for (const x of [8.3, 12.2]) { rod([x, Y, Z], [x, Y, 0.02], 0.01, M.chrome, s); }
  const list = [['tee', 8.95, 0xece5d2], ['hoodie', 10.25, 0x1b1c21], ['jacket', 11.55, 0x161b26]];
  list.forEach(([kind, x, color], i) => {
    const g = garment(kind, color); g.position.set(x, Y - 0.105, Z); g.rotation.y = (i - 1) * -0.08; s.add(g);
    item(kind, [x, 1.5, Z + 0.1], { pos: [x, 1.6, 1.85], look: [x, 1.42, Z] }, [g]);
    onUpdate((dt, time) => { g.rotation.z = Math.sin(time * 0.7 + i * 2) * 0.012; });
  });
  contact(4.2, 0.7, 10.25, 0.4, 0.008, 0.35); collide(8.2, 12.3, 0, 0.72);
}

// ---------------------------------------------------------------- hats
function cap() {
  const g = new THREE.Group();
  const cloth = new THREE.MeshStandardMaterial({ color: 0x17181c, roughness: 0.95, side: THREE.DoubleSide });
  const crown = new THREE.Mesh(new THREE.SphereGeometry(0.095, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2), cloth); crown.scale.set(1, 0.9, 1.08); crown.castShadow = true; g.add(crown);
  const brimShape = new THREE.Shape(); brimShape.moveTo(-0.093, 0); brimShape.bezierCurveTo(-0.09, 0.1, 0.09, 0.1, 0.093, 0); brimShape.bezierCurveTo(0.05, 0.025, -0.05, 0.025, -0.093, 0);
  const brim = new THREE.Mesh(new THREE.ExtrudeGeometry(brimShape, { depth: 0.006, bevelEnabled: false, curveSegments: 16 }), new THREE.MeshStandardMaterial({ color: 0xa5140e, roughness: 0.9 }));
  brim.rotation.x = Math.PI / 2 + 0.12; brim.position.set(0, 0.012, 0.085); g.add(brim);
  cyl(0.008, 0.008, 0.006, cloth, 0, 0.086, 0, g, 10);
  const [c, ctx] = T.canvas(128, 96); ctx.fillStyle = '#ede6d3'; ctx.font = T.F.serif(72); ctx.fillText('W', 14, 70); ctx.fillStyle = T.C.red; ctx.fillRect(92, 46, 24, 24);
  const patch = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.052), new THREE.MeshStandardMaterial({ map: T.tex(c), transparent: true, roughness: 0.9 }));
  patch.position.set(0, 0.045, 0.097); patch.rotation.x = -0.35; g.add(patch);
  return g;
}
function shelfEast(api) {
  const s = world.scene, X = X1 - 0.17;
  s.add(rbox(0.32, 0.04, 2.4, 0.008, M.oak, X, 1.2, 3.0));
  for (const z of [2.1, 3.9]) s.add(box(0.26, 0.03, 0.03, M.black, X, 1.165, z));
  const form = (z) => { const g = group(X - 0.02, 1.22, z, -Math.PI / 2); cyl(0.07, 0.08, 0.012, M.oak, 0, 0.006, 0, g, 20); cyl(0.012, 0.012, 0.16, M.oak, 0, 0.09, 0, g, 10);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.086, 24, 18), M.oak); head.scale.set(1, 1.15, 1.12); head.position.y = 0.25; head.castShadow = true; g.add(head); return g; };
  const f1 = form(2.4), hat = fedora(); hat.position.y = 0.29; hat.rotation.z = -0.06; f1.add(hat);
  const f2 = form(3.6), cp = cap(); cp.position.y = 0.285; f2.add(cp);
  item('hat', [X - 0.2, 1.62, 2.4], { pos: [11.35, 1.6, 2.4], look: [X, 1.48, 2.4] }, [f1]);
  item('cap', [X - 0.2, 1.62, 3.6], { pos: [11.35, 1.6, 3.6], look: [X, 1.48, 3.6] }, [f2]);
  onUpdate((dt) => { f1.rotation.y += dt * 0.25; f2.rotation.y -= dt * 0.25; });
  collide(X1 - 0.45, X1, 1.7, 4.3);
}

// ---------------------------------------------------------------- tapes and the disc
async function shelfSouth(api) {
  const s = world.scene, Z = Z1 - 0.17;
  s.add(rbox(3.2, 0.04, 0.32, 0.008, M.oak, 10.15, 1.12, Z));
  for (const x of [8.8, 11.5]) s.add(box(0.03, 0.03, 0.26, M.black, x, 1.085, Z));
  const tapes = [];
  for (let i = 0; i < FILMS.length; i++) {
    const cover = new THREE.MeshStandardMaterial({ map: await T.vhsCoverTex(FILMS[i]), roughness: 0.6 });
    const side = new THREE.MeshStandardMaterial({ color: 0x111216, roughness: 0.6 });
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 0.05), [side, side, side, side, side, cover]);
    m.position.set(8.9 + i * 0.36, 1.14 + 0.18, Z - 0.03); m.rotation.x = 0.1; m.castShadow = true; s.add(m); tapes.push(m);
  }
  item('vhs', [9.45, 1.62, Z - 0.15], { pos: [9.45, 1.6, 4.35], look: [9.45, 1.3, Z] }, tapes);
  // disc in its case
  const dg = group(11.25, 1.14, Z - 0.03, Math.PI);
  const art = T.tex(T.generatedCover('Empat Filem', 'Warga Films · Koleksi 01'));
  const caseM = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.014), [M.plastic, M.plastic, M.plastic, M.plastic, new THREE.MeshStandardMaterial({ map: art, roughness: 0.35 }), M.plastic]);
  caseM.position.set(-0.08, 0.125, 0); caseM.rotation.x = -0.12; caseM.castShadow = true; dg.add(caseM);
  const discMat = new THREE.MeshPhysicalMaterial({ color: 0xe8e8ee, metalness: 1, roughness: 0.16, iridescence: 1, iridescenceIOR: 1.8, iridescenceThicknessRange: [200, 700] }); discMat.envMapIntensity = 5;
  const cd = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.0015, 48), discMat); cd.rotation.x = Math.PI / 2 - 0.25; cd.position.set(0.14, 0.065, 0.03); dg.add(cd);
  const hub = new THREE.Mesh(new THREE.RingGeometry(0.0075, 0.018, 24), new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.4 })); hub.position.set(0, 0.00085, 0); hub.rotation.x = -Math.PI / 2; cd.add(hub);
  item('disc', [11.3, 1.5, Z - 0.15], { pos: [11.3, 1.6, 4.4], look: [11.3, 1.25, Z] }, [dg]);
  contact(3.6, 0.7, 10.15, Z - 0.1, 0.008, 0.3); collide(8.5, 11.8, Z1 - 0.48, Z1);
}

// ---------------------------------------------------------------- centre plinth with a turning cassette
async function plinth() {
  const s = world.scene, X = 10.15, Z = 3.0;
  cyl(0.42, 0.46, 0.9, new THREE.MeshStandardMaterial({ color: 0xe9e1cc, roughness: 0.85 }), X, 0.45, Z, s, 40);
  cyl(0.44, 0.44, 0.03, M.red, X, 0.915, Z, s, 40);
  const hero = group(X, 1.2, Z);
  const tape = new THREE.Group(); hero.add(tape);
  rbox(0.38, 0.21, 0.05, 0.01, M.plastic, 0, 0, 0, tape);
  const [c, ctx] = T.canvas(512, 256); T.grainFill(ctx, 0, 0, 512, 256, '#ece5d2', 0.06, 9);
  ctx.fillStyle = T.C.red; ctx.fillRect(0, 0, 512, 46); ctx.fillStyle = '#ede6d3'; ctx.font = T.F.mono(20, 700); ctx.fillText('WARGA FILMS · KOLEKSI 01', 18, 31);
  ctx.fillStyle = '#15161a'; ctx.font = T.F.serif(64); ctx.fillText('WF-001–004', 18, 126); ctx.font = T.F.mono(19); ctx.fillText('129 MIN · PAL · BAHASA MELAYU', 18, 164);
  ctx.fillStyle = '#0c0c0e'; ctx.beginPath(); ctx.roundRect(110, 184, 292, 60, 10); ctx.fill();
  const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.15), texMat(T.tex(c), 0.7)); lab.position.set(0, 0.005, 0.0262); tape.add(lab);
  const reels = [];
  for (const x of [-0.075, 0.075]) { const r = cyl(0.03, 0.03, 0.054, M.cream, x, -0.045, 0, tape, 6); r.rotation.x = Math.PI / 2; reels.push(r); }
  tape.rotation.x = -0.15;
  onUpdate((dt, time) => { hero.rotation.y += dt * 0.5; hero.position.y = 1.2 + Math.sin(time * 1.2) * 0.02; reels.forEach((r) => { r.rotation.y += dt * 2; }); });
  contact(1.4, 1.4, X, Z, 0.008, 0.45); collide(X - 0.46, X + 0.46, Z - 0.46, Z + 0.46);
}
