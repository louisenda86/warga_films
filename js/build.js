// Shared scene registry, materials and small mesh builders.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { canvas } from './tex.js';

export const world = {
  scene: null,
  colliders: [],   // {x0, x1, z0, z1} boxes the visitor cannot walk through
  hotspots: [],    // things that can be used
  clickables: [],  // meshes that answer a direct click
  updaters: [],    // fn(dt, time)
  refs: {},        // named objects other modules need
};
export const collide = (x0, x1, z0, z1) => world.colliders.push({ x0: Math.min(x0, x1), x1: Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1) });
export const onUpdate = (fn) => world.updaters.push(fn);
/** Register something usable. view = {pos:[x,y,z], look:[x,y,z]} is where the camera goes. */
export function hotspot(h) {
  const hs = { range: 5.5, room: 'studio', ...h, pos: new THREE.Vector3(...h.pos) };
  world.hotspots.push(hs);
  return hs;
}
export function clickable(mesh, action, label) {
  mesh.userData.click = action; mesh.userData.label = label;
  world.clickables.push(mesh);
}

export const M = {};
const std = (color, roughness = 0.7, metalness = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
/** A surface that gives off light (bloom picks up anything above 1). */
export const glow = (color, k = 1.6, extra = {}) => { const m = new THREE.MeshBasicMaterial({ color, ...extra }); m.color.multiplyScalar(k); return m; };

export function initMaterials() {
  Object.assign(M, {
    wall: std(0x14151a, 0.95), ceiling: std(0x0b0c0f, 1), black: std(0x0b0b0d, 0.6), felt: std(0x08080a, 1),
    walnut: std(0x4a2e1c, 0.55), darkwood: std(0x1e1611, 0.6), oak: std(0x8a633c, 0.6),
    leather: std(0x17171b, 0.42), fabric: std(0x23252c, 0.95), metal: std(0x1d1e22, 0.38, 0.85),
    chrome: std(0xd8dadd, 0.16, 1), brass: std(0xd0a23f, 0.24, 1), steel: std(0x8d9096, 0.35, 0.9),
    cream: std(0xede6d3, 0.8), paper: std(0xf1ecdf, 0.9), red: std(0xd1140d, 0.5), marble: std(0xcfc9bd, 0.3),
    plastic: std(0x2a2b30, 0.5), rubber: std(0x101012, 0.9), glassDark: std(0x050506, 0.08, 0.6),
    hammer: std(0x55604f, 0.5, 0.55), plant: std(0x2c5a3a, 0.7), pot: std(0x8b4a2c, 0.85),
    ledRed: glow(0xff1c10, 3.0), ledWarm: glow(0xffb262, 2.1), ledAmber: glow(0xffa030, 2.4), shade: glow(0xffc98a, 0.82),
  });
  for (const k of ['brass', 'steel', 'metal', 'marble', 'leather']) M[k].envMapIntensity = 3.2;
  M.chrome.envMapIntensity = 1.9;
}

const sh = (m, cast = true, recv = true) => { m.castShadow = cast; m.receiveShadow = recv; return m; };
export function box(w, h, d, mat, x = 0, y = 0, z = 0, parent = null) {
  const m = sh(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat));
  m.position.set(x, y, z); if (parent) parent.add(m); return m;
}
export function rbox(w, h, d, r, mat, x = 0, y = 0, z = 0, parent = null) {
  const m = sh(new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2)), mat));
  m.position.set(x, y, z); if (parent) parent.add(m); return m;
}
export function cyl(rt, rb, h, mat, x = 0, y = 0, z = 0, parent = null, seg = 24) {
  const m = sh(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat));
  m.position.set(x, y, z); if (parent) parent.add(m); return m;
}
export function plane(w, h, mat, x = 0, y = 0, z = 0, ry = 0, parent = null) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true; if (parent) parent.add(m); return m;
}
export function disc(r, mat, x = 0, y = 0, z = 0, parent = null, seg = 40) {
  const m = new THREE.Mesh(new THREE.CircleGeometry(r, seg), mat);
  m.position.set(x, y, z); if (parent) parent.add(m); return m;
}
export function group(x = 0, y = 0, z = 0, ry = 0, parent = null) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry;
  (parent || world.scene).add(g); return g;
}
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
/** A thin cylinder between two points. */
export function rod(a, b, r, mat, parent = null, seg = 10) {
  _a.set(...a); _b.set(...b);
  const len = _a.distanceTo(_b);
  const m = sh(new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), mat));
  m.position.copy(_a).add(_b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(_up, _b.clone().sub(_a).normalize());
  if (parent) parent.add(m); return m;
}
/** A tube that changes radius along a curve (saxophone body, lamp necks). */
export function taperTube(points, radiusAt, mat, { segs = 90, radial = 20, parent = null } = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, 'catmullrom', 0.5);
  const frames = curve.computeFrenetFrames(segs, false);
  const pos = [], idx = [], uv = [];
  const P = new THREE.Vector3();
  for (let i = 0; i <= segs; i++) {
    const t = i / segs; curve.getPointAt(t, P);
    const N = frames.normals[i], B = frames.binormals[i], r = radiusAt(t);
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      pos.push(P.x + r * (c * N.x + s * B.x), P.y + r * (c * N.y + s * B.y), P.z + r * (c * N.z + s * B.z));
      uv.push(j / radial, t);
    }
  }
  for (let i = 0; i < segs; i++) for (let j = 0; j < radial; j++) {
    const a = i * (radial + 1) + j, b = a + radial + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  const m = sh(new THREE.Mesh(g, mat)); if (parent) parent.add(m);
  m.userData.curve = curve; return m;
}

let blobTex = null;
/** A soft dark patch under furniture, so things sit on the floor. */
export function contact(w, d, x, z, y = 0.004, opacity = 0.75, parent = null) {
  if (!blobTex) {
    const [c, ctx] = canvas(128, 128);
    const g = ctx.createRadialGradient(64, 64, 8, 64, 64, 64);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.6, 'rgba(0,0,0,0.55)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
    blobTex = new THREE.CanvasTexture(c);
  }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, opacity, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.renderOrder = 1;
  (parent || world.scene).add(m); return m;
}
export const texMat = (map, roughness = 0.8, extra = {}) => new THREE.MeshStandardMaterial({ map, roughness, ...extra });
/** Picture in a frame, hung flat on a wall. ry turns it to face the room. */
export function framed(map, w, h, x, y, z, ry, { lit = false, frame = M.black, depth = 0.03 } = {}) {
  const g = group(x, y, z, ry);
  box(w + 0.06, h + 0.06, depth, frame, 0, 0, -depth / 2, g);
  const art = plane(w, h, lit ? glow(0xffffff, 1.15, { map }) : texMat(map, 0.65), 0, 0, 0.004, 0, g);
  g.userData.art = art;
  return g;
}
export function pointLight(color, intensity, x, y, z, distance = 7, decay = 1.8) {
  const l = new THREE.PointLight(color, intensity, distance, decay);
  l.position.set(x, y, z); world.scene.add(l); return l;
}
