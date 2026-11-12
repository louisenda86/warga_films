// Sound: samples (camera click, projector, vinyl), looping room ambience, and
// three small synthesised instruments (guitar, drums, saxophone).

const SAMPLES = ['click1', 'click2', 'click3', 'shutter', 'winder', 'tw1', 'tw2', 'tw3', 'tw4', 'bell', 'carriage', 'vhs',
  'tv_on', 'tv_static', 'paper', 'rustle', 'burn', 'stamp', 'tap', 'whoosh', 'projector_start', 'projector', 'crackle',
  'needle', 'vinyl_stop', 'room', 'flap', 'couch', 'clap', 'door'];

class CrossLoop {
  // Loops a buffer with a crossfade so encoder padding never clicks.
  constructor(ctx, buffer, dest, xf = 1.2) {
    this.ctx = ctx; this.buffer = buffer; this.xf = xf;
    this.gain = ctx.createGain(); this.gain.gain.value = 0; this.gain.connect(dest);
    this.next = 0; this.timer = null; this.nodes = new Set();
  }
  start() {
    if (this.timer || !this.buffer) return;
    this.next = this.ctx.currentTime + 0.05;
    const tick = () => {
      while (this.next < this.ctx.currentTime + 2.5) {
        const src = this.ctx.createBufferSource(); src.buffer = this.buffer;
        const g = this.ctx.createGain();
        const t0 = this.next, d = this.buffer.duration;
        g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(1, t0 + this.xf);
        g.gain.setValueAtTime(1, t0 + d - this.xf); g.gain.linearRampToValueAtTime(0, t0 + d);
        src.connect(g).connect(this.gain); src.start(t0);
        this.nodes.add(src); src.onended = () => this.nodes.delete(src);
        this.next = t0 + d - this.xf;
      }
    };
    tick(); this.timer = setInterval(tick, 800);
  }
  stop() {
    clearInterval(this.timer); this.timer = null;
    for (const n of this.nodes) { try { n.stop(); } catch (e) { /* already stopped */ } }
    this.nodes.clear();
  }
  level(v, time = 0.4) {
    const g = this.gain.gain, now = this.ctx.currentTime;
    g.cancelScheduledValues(now); g.setTargetAtTime(v, now, time / 3);
  }
}

export const audio = {
  ctx: null, ready: false, muted: false, buffers: {}, loops: {},

  init() {
    if (this.ctx) { this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = this.ctx = new AC();
    this.master = ctx.createGain(); this.master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.2;
    this.master.connect(comp).connect(ctx.destination);
    this.sfx = ctx.createGain(); this.sfx.gain.value = 0.9; this.sfx.connect(this.master);
    this.amb = ctx.createGain(); this.amb.gain.value = 1; this.amb.connect(this.master);
    this.inst = ctx.createGain(); this.inst.gain.value = 0.85; this.inst.connect(this.master);
    this.music = ctx.createGain(); this.music.gain.value = 0.9; this.music.connect(this.master);
    this.analyser = ctx.createAnalyser(); this.analyser.fftSize = 256; this.analyser.smoothingTimeConstant = 0.82;
    this.music.connect(this.analyser);
    // small room reverb from a generated impulse
    const len = Math.floor(ctx.sampleRate * 1.7), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    this.reverb = ctx.createConvolver(); this.reverb.buffer = ir;
    const wet = ctx.createGain(); wet.gain.value = 0.22;
    this.reverb.connect(wet).connect(this.master);
    this.inst.connect(this.reverb);
    this.noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const nd = this.noise.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  },

  async load(onProgress) {
    let done = 0;
    await Promise.all(SAMPLES.map(async (name) => {
      try {
        const res = await fetch(`assets/sfx/${name}.mp3`);
        const buf = await res.arrayBuffer();
        this.raw = this.raw || {};
        this.raw[name] = buf;
      } catch (e) { /* a missing sound must never stop the studio loading */ }
      done++; if (onProgress) onProgress(done / SAMPLES.length);
    }));
  },
  async decode() {
    if (!this.ctx || !this.raw) return;
    await Promise.all(Object.entries(this.raw).map(async ([name, buf]) => {
      try { this.buffers[name] = await this.ctx.decodeAudioData(buf.slice(0)); } catch (e) { /* skip undecodable */ }
    }));
    this.raw = null; this.ready = true;
    this.loops.projector = new CrossLoop(this.ctx, this.buffers.projector, this.amb, 1.2);
    this.loops.room = new CrossLoop(this.ctx, this.buffers.room, this.amb, 1.5);
    this.loops.crackle = new CrossLoop(this.ctx, this.buffers.crackle, this.amb, 1.2);
    this.loops.static = new CrossLoop(this.ctx, this.buffers.tv_static, this.amb, 0.5);
    for (const k of ['projector', 'room', 'static']) this.loops[k].start();
    this.loops.room.level(0.16, 2);
  },

  play(name, { vol = 1, rate = 1, pan = 0, delay = 0 } = {}) {
    const buf = this.buffers[name];
    if (!this.ctx || !buf) return null;
    const src = this.ctx.createBufferSource(); src.buffer = buf; src.playbackRate.value = rate;
    const g = this.ctx.createGain(); g.gain.value = vol;
    let node = src.connect(g);
    if (pan && this.ctx.createStereoPanner) { const p = this.ctx.createStereoPanner(); p.pan.value = pan; node = node.connect(p); }
    node.connect(this.sfx);
    src.start(this.ctx.currentTime + delay);
    return src;
  },
  /** The interface click: a camera shutter. */
  click(vol = 0.5) { this.play('click' + (1 + Math.floor(Math.random() * 3)), { vol, rate: 0.96 + Math.random() * 0.1 }); },
  key() { this.play('tw' + (1 + Math.floor(Math.random() * 4)), { vol: 0.35, rate: 0.9 + Math.random() * 0.25 }); },

  setMuted(m) {
    this.muted = m;
    if (this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 0.9, this.ctx.currentTime, 0.05);
  },
  loopLevel(name, v, time) { if (this.loops[name]) this.loops[name].level(v, time); },
  crackle(on) {
    const l = this.loops.crackle; if (!l) return;
    if (on) { l.start(); l.level(0.5, 0.6); } else { l.level(0, 0.5); setTimeout(() => { if (l.gain.gain.value < 0.02) l.stop(); }, 1200); }
  },
  /** Route an <audio> element (the record player) through the mixer. */
  attachMedia(el) {
    if (!this.ctx || el._wfNode) return;
    el._wfNode = this.ctx.createMediaElementSource(el);
    el._wfNode.connect(this.music);
  },
  musicLevel() {
    if (!this.analyser) return 0;
    this._fd = this._fd || new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(this._fd);
    let s = 0; for (let i = 1; i < 24; i++) s += this._fd[i];
    return s / (23 * 255);
  },
  spectrum() {
    if (!this.analyser) return null;
    this._fd = this._fd || new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(this._fd);
    return this._fd;
  },

  // ---------- guitar: Karplus-Strong plucked string ----------
  _pluckBuf(freq) {
    this._kb = this._kb || {};
    const key = Math.round(freq * 10);
    if (this._kb[key]) return this._kb[key];
    const sr = this.ctx.sampleRate, N = Math.max(2, Math.round(sr / freq)), len = Math.floor(sr * 3.2);
    const out = this.ctx.createBuffer(1, len, sr), d = out.getChannelData(0), ring = new Float32Array(N);
    let prev = 0;
    for (let i = 0; i < N; i++) { const n = Math.random() * 2 - 1; prev = prev * 0.45 + n * 0.55; ring[i] = prev; }
    const decay = 0.996 - Math.min(0.004, freq / 200000);
    let idx = 0;
    for (let i = 0; i < len; i++) {
      const a = ring[idx], b = ring[(idx + 1) % N];
      d[i] = a; ring[idx] = (a + b) * 0.5 * decay; idx = (idx + 1) % N;
    }
    for (let i = 0; i < 60; i++) d[i] *= i / 60;
    return (this._kb[key] = out);
  },
  pluck(midi, { vol = 0.5, delay = 0 } = {}) {
    if (!this.ctx) return;
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    const src = this.ctx.createBufferSource(); src.buffer = this._pluckBuf(freq);
    const body = this.ctx.createBiquadFilter(); body.type = 'peaking'; body.frequency.value = 190; body.Q.value = 1.2; body.gain.value = 5;
    const lp = this.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 4200;
    const g = this.ctx.createGain(); g.gain.value = vol;
    src.connect(body).connect(lp).connect(g).connect(this.inst);
    src.start(this.ctx.currentTime + delay);
  },
  strum(midis, down = true) {
    const order = down ? midis : [...midis].reverse();
    order.forEach((m, i) => this.pluck(m, { vol: 0.34, delay: i * 0.022 }));
  },

  // ---------- drums ----------
  drum(name) {
    const c = this.ctx; if (!c) return;
    const t = c.currentTime, out = this.inst;
    const noise = (dur, type, freq, q, vol, attack = 0.001) => {
      const s = c.createBufferSource(); s.buffer = this.noise; s.loop = true;
      const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
      const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f).connect(g).connect(out); s.start(t, Math.random()); s.stop(t + dur + 0.05);
    };
    const tone = (f0, f1, dur, vol, type = 'sine') => {
      const o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.7);
      const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(out); o.start(t); o.stop(t + dur + 0.05);
    };
    const metal = (dur, vol, hp) => {
      const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp;
      for (const fr of [205.3, 304.4, 369.6, 522.7, 540, 800]) { const o = c.createOscillator(); o.type = 'square'; o.frequency.value = fr * 3.1; o.connect(f); o.start(t); o.stop(t + dur + 0.05); }
      f.connect(g).connect(out);
    };
    switch (name) {
      case 'kick': tone(150, 42, 0.42, 1.0); noise(0.03, 'lowpass', 1800, 0.5, 0.5); break;
      case 'snare': tone(210, 150, 0.14, 0.5, 'triangle'); noise(0.22, 'bandpass', 2400, 0.6, 0.75); break;
      case 'hat': noise(0.06, 'highpass', 7500, 0.8, 0.4); metal(0.05, 0.035, 7000); break;
      case 'open': noise(0.38, 'highpass', 6800, 0.8, 0.34); metal(0.35, 0.035, 6500); break;
      case 'tom1': tone(230, 150, 0.34, 0.8); noise(0.03, 'lowpass', 1500, 0.5, 0.25); break;
      case 'tom2': tone(175, 112, 0.4, 0.85); noise(0.03, 'lowpass', 1300, 0.5, 0.25); break;
      case 'floor': tone(120, 72, 0.55, 0.95); noise(0.03, 'lowpass', 1000, 0.5, 0.25); break;
      case 'crash': noise(1.5, 'highpass', 4200, 0.5, 0.42, 0.002); metal(1.2, 0.03, 5000); break;
      case 'ride': noise(0.7, 'bandpass', 6200, 1.5, 0.2); metal(0.8, 0.045, 5500); break;
      default: break;
    }
  },

  // ---------- saxophone: one breathy voice with legato ----------
  saxOn(midi) {
    const c = this.ctx; if (!c) return;
    const t = c.currentTime, freq = 440 * Math.pow(2, (midi - 69) / 12);
    if (!this._sax) {
      const o1 = c.createOscillator(), o2 = c.createOscillator(); o1.type = 'sawtooth'; o2.type = 'square';
      const m1 = c.createGain(), m2 = c.createGain(); m1.gain.value = 0.55; m2.gain.value = 0.22;
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.Q.value = 2.2;
      const f1 = c.createBiquadFilter(); f1.type = 'peaking'; f1.frequency.value = 1150; f1.Q.value = 2.5; f1.gain.value = 9;
      const f2 = c.createBiquadFilter(); f2.type = 'peaking'; f2.frequency.value = 2700; f2.Q.value = 3; f2.gain.value = 5;
      const amp = c.createGain(); amp.gain.value = 0;
      const lfo = c.createOscillator(); lfo.frequency.value = 5.2; const lg = c.createGain(); lg.gain.value = 0;
      lfo.connect(lg); lg.connect(o1.frequency); lg.connect(o2.frequency);
      const br = c.createBufferSource(); br.buffer = this.noise; br.loop = true;
      const bf = c.createBiquadFilter(); bf.type = 'bandpass'; bf.frequency.value = 2200; bf.Q.value = 0.7; const bg = c.createGain(); bg.gain.value = 0.05;
      br.connect(bf).connect(bg).connect(amp);
      o1.connect(m1).connect(lp); o2.connect(m2).connect(lp); lp.connect(f1).connect(f2).connect(amp).connect(this.inst);
      o1.start(); o2.start(); lfo.start(); br.start();
      this._sax = { o1, o2, lp, amp, lg, held: [] };
    }
    const s = this._sax;
    const legato = s.held.length > 0;
    s.held = s.held.filter((m) => m !== midi); s.held.push(midi);
    const glide = legato ? 0.035 : 0.004;
    s.o1.frequency.setTargetAtTime(freq, t, glide); s.o2.frequency.setTargetAtTime(freq * 1.003, t, glide);
    s.amp.gain.cancelScheduledValues(t); s.amp.gain.setTargetAtTime(0.42, t, legato ? 0.02 : 0.035);
    s.lp.frequency.cancelScheduledValues(t); s.lp.frequency.setTargetAtTime(Math.min(3600, 900 + freq * 3.2), t, 0.06);
    s.lg.gain.cancelScheduledValues(t); s.lg.gain.setValueAtTime(legato ? s.lg.gain.value : 0, t); s.lg.gain.setTargetAtTime(freq * 0.012, t + 0.25, 0.3);
  },
  saxOff(midi) {
    const s = this._sax; if (!s) return;
    const t = this.ctx.currentTime;
    s.held = s.held.filter((m) => m !== midi);
    if (s.held.length) {
      const f = 440 * Math.pow(2, (s.held[s.held.length - 1] - 69) / 12);
      s.o1.frequency.setTargetAtTime(f, t, 0.03); s.o2.frequency.setTargetAtTime(f * 1.003, t, 0.03);
    } else {
      s.amp.gain.cancelScheduledValues(t); s.amp.gain.setTargetAtTime(0, t, 0.07);
      s.lp.frequency.setTargetAtTime(700, t, 0.1); s.lg.gain.cancelScheduledValues(t); s.lg.gain.setTargetAtTime(0, t, 0.05);
    }
  },
  saxAllOff() { if (this._sax) { for (const m of [...this._sax.held]) this.saxOff(m); } },
};
