// First-person visitor: drag to look, WASD or click the floor to walk,
// a thumb stick on touch screens, and smooth or cut moves between stations.
import * as THREE from 'three';
import { world } from './build.js';
import { clamp, damp, tween, ease, reducedMotion } from './util.js';

const R = 0.28, EYE = 1.62;
const ZONES = [[-6.6, 6.6, -4.6, 4.6], [6.4, 7.8, 2.5, 3.5], [7.6, 12.68, 0.32, 5.68]];

export class Player {
  constructor(camera, dom) {
    this.cam = camera; this.dom = dom;
    this.pos = new THREE.Vector3(0, EYE, 3.3); this.yaw = 0; this.pitch = 0;
    this.vel = new THREE.Vector2(); this.keys = new Set(); this.stick = new THREE.Vector2();
    this.enabled = false; this.locked = false; this.flying = false; this.keysOff = false;
    this.target = null; this.bob = 0; this.stuck = 0; this.groundY = 0;
    this.on = { tap: () => {}, hover: () => {}, use: () => {}, escape: () => {}, key: () => false, moved: () => {} };
    this.transition = async (mid) => mid();
    camera.rotation.order = 'YXZ';
    this._bind();
  }
  get room() { return this.pos.x > 7.3 ? 'merch' : 'studio'; }

  _bind() {
    const d = this.dom; let drag = null;
    d.addEventListener('pointerdown', (e) => {
      if (!this.enabled) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now(), moved: 0 };
      try { d.setPointerCapture(e.pointerId); } catch (err) { /* synthetic pointers cannot be captured */ }
      d.classList.add('is-drag');
    });
    d.addEventListener('pointermove', (e) => {
      if (drag && e.pointerId === drag.id) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        drag.x = e.clientX; drag.y = e.clientY; drag.moved += Math.abs(dx) + Math.abs(dy);
        if (drag.moved > 5 && !this.flying) {
          const k = e.pointerType === 'touch' ? 0.0052 : 0.0034;
          this.yaw += dx * k; this.pitch = clamp(this.pitch + dy * k, -1.15, 1.15); this.target = null;
        }
      } else if (this.enabled && e.pointerType !== 'touch') this.on.hover(e.clientX, e.clientY);
    });
    const up = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      d.classList.remove('is-drag');
      const tap = drag.moved < 7 && performance.now() - drag.t < 600;
      const { sx, sy } = drag; drag = null;
      if (tap && this.enabled) this.on.tap(sx, sy);
    };
    d.addEventListener('pointerup', up); d.addEventListener('pointercancel', up);
    d.addEventListener('contextmenu', (e) => e.preventDefault());

    window.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === 'escape') { this.on.escape(); return; }
      if (!this.enabled) return;
      if (this.on.key(k, true, e)) { e.preventDefault(); return; }
      if (this.keysOff) return;
      if (k === 'e' || k === 'enter') { if (tag !== 'BUTTON' && tag !== 'A') this.on.use(); return; }
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'].includes(k)) { this.keys.add(k); if (k.startsWith('arrow')) e.preventDefault(); }
    });
    window.addEventListener('keyup', (e) => { const k = e.key.toLowerCase(); this.keys.delete(k); this.on.key(k, false, e); });
    window.addEventListener('blur', () => this.keys.clear());

    // thumb stick
    const st = document.getElementById('stick');
    if (st) {
      const knob = st.firstElementChild; let sid = null;
      const set = (e) => { const r = st.getBoundingClientRect(); let x = (e.clientX - r.left - r.width / 2) / (r.width / 2), y = (e.clientY - r.top - r.height / 2) / (r.height / 2); const m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; } this.stick.set(x, y); knob.style.transform = `translate(${x * 30}px, ${y * 30}px)`; };
      st.addEventListener('pointerdown', (e) => { sid = e.pointerId; st.setPointerCapture(sid); set(e); });
      st.addEventListener('pointermove', (e) => { if (e.pointerId === sid) set(e); });
      const end = (e) => { if (e.pointerId === sid) { sid = null; this.stick.set(0, 0); knob.style.transform = ''; } };
      st.addEventListener('pointerup', end); st.addEventListener('pointercancel', end);
    }
  }

  walkable(x, z) {
    let inside = false;
    for (const [x0, x1, z0, z1] of ZONES) if (x >= x0 && x <= x1 && z >= z0 && z <= z1) { inside = true; break; }
    if (!inside) return false;
    for (const c of world.colliders) if (x > c.x0 - R && x < c.x1 + R && z > c.z0 - R && z < c.z1 + R) return false;
    return true;
  }
  /** Nearest free spot to (x, z), searched in widening rings. */
  free(x, z) {
    if (this.walkable(x, z)) return [x, z];
    for (let r = 0.15; r < 2.5; r += 0.15) for (let a = 0; a < 6.283; a += 0.5) { const px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r; if (this.walkable(px, pz)) return [px, pz]; }
    return [0, 3.3];
  }
  walkTo(x, z) { if (this.locked || this.flying) return; this.target = new THREE.Vector2(x, z); this.stuck = 0; }

  angles(view) {
    const d = new THREE.Vector3(...view.look).sub(new THREE.Vector3(...view.pos));
    return { yaw: Math.atan2(-d.x, -d.z), pitch: Math.atan2(d.y, Math.hypot(d.x, d.z)) };
  }
  /** Move the camera to a view. Long moves, or moves between rooms, cut with a film burn. */
  async goTo(view, { cut = false, dur = 1.25 } = {}) {
    const to = new THREE.Vector3(...view.pos), a = this.angles(view), from = this.pos.clone();
    const y0 = this.yaw, p0 = this.pitch;
    let dy = a.yaw - y0; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    this.target = null; this.vel.set(0, 0);
    const far = from.distanceTo(to) > 4.2 || (from.x > 7.3) !== (to.x > 7.3);
    this.flying = true;
    if (cut || far || reducedMotion()) {
      await this.transition(() => { this.pos.copy(to); this.yaw = a.yaw; this.pitch = a.pitch; this._apply(0); });
    } else {
      await tween(dur, (k) => { this.pos.lerpVectors(from, to, k); this.yaw = y0 + dy * k; this.pitch = p0 + (a.pitch - p0) * k; }, ease.inOut);
    }
    this.flying = false; this.yaw = Math.atan2(Math.sin(this.yaw), Math.cos(this.yaw));
  }
  lock(on) { this.locked = on; this.target = null; this.keys.clear(); this.vel.set(0, 0); }

  _apply(dt) {
    const ry = world.refs.riser;
    const gy = ry && this.pos.x > ry.x0 && this.pos.x < ry.x1 && this.pos.z > ry.z0 && this.pos.z < ry.z1 ? ry.y : 0;
    this.groundY = dt ? damp(this.groundY, gy, 10, dt) : gy;
    const bob = reducedMotion() ? 0 : Math.sin(this.bob * 2) * 0.016 * clamp(this.vel.length() / 2, 0, 1);
    const stand = this.locked || this.flying ? 0 : this.groundY;
    this.cam.position.set(this.pos.x, this.pos.y + stand + bob, this.pos.z);
    this.cam.rotation.set(this.pitch, this.yaw, 0);
  }

  update(dt) {
    if (this.enabled && !this.locked && !this.flying) {
      const k = this.keys;
      let f = (k.has('w') || k.has('arrowup') ? 1 : 0) - (k.has('s') || k.has('arrowdown') ? 1 : 0) - this.stick.y;
      let s = (k.has('d') || k.has('arrowright') ? 1 : 0) - (k.has('a') || k.has('arrowleft') ? 1 : 0) + this.stick.x;
      const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
      let wx = -sin * f + cos * s, wz = -cos * f - sin * s;
      const manual = Math.hypot(wx, wz) > 0.05;
      if (manual) this.target = null;
      else if (this.target) {
        const dx = this.target.x - this.pos.x, dz = this.target.y - this.pos.z, dist = Math.hypot(dx, dz);
        if (dist < 0.12) this.target = null; else { const sp = Math.min(1, dist / 0.6 + 0.25); wx = (dx / dist) * sp; wz = (dz / dist) * sp; }
      }
      const m = Math.hypot(wx, wz); if (m > 1) { wx /= m; wz /= m; }
      const speed = k.has('shift') ? 4.4 : 2.5;
      this.vel.x = damp(this.vel.x, wx * speed, 9, dt); this.vel.y = damp(this.vel.y, wz * speed, 9, dt);
      const nx = this.pos.x + this.vel.x * dt, nz = this.pos.z + this.vel.y * dt;
      let moved = false;
      if (this.walkable(nx, this.pos.z)) { this.pos.x = nx; moved = true; } else this.vel.x = 0;
      if (this.walkable(this.pos.x, nz)) { this.pos.z = nz; moved = true; } else this.vel.y = 0;
      if (this.target) { this.stuck = moved && this.vel.length() > 0.3 ? 0 : this.stuck + dt; if (this.stuck > 0.5) this.target = null; }
      this.bob += this.vel.length() * dt * 3.1;
      this.pos.y = EYE;
      if (this.vel.length() > 0.2) this.on.moved();
    }
    this._apply(dt);
  }
}
