// The record player: choose or drop songs, read their tags and cover art in
// the browser, play them on the studio turntable. Nothing is uploaded.
import { world } from './build.js';
import { generatedCover } from './tex.js';
import { t } from './i18n.js';
import { $, $$, esc } from './util.js';
import { audio } from './audio.js';

const be32 = (b, o) => ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;
const le32 = (b, o) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;
const safe32 = (b, o) => ((b[o] & 127) << 21) | ((b[o + 1] & 127) << 14) | ((b[o + 2] & 127) << 7) | (b[o + 3] & 127);
const latin = (b, o, n) => { let s = ''; for (let i = 0; i < n && o + i < b.length; i++) s += String.fromCharCode(b[o + i]); return s; };
const bytes = async (file, a, b) => new Uint8Array(await file.slice(a, b).arrayBuffer());
const unsync = (b) => { const out = new Uint8Array(b.length); let n = 0; for (let i = 0; i < b.length; i++) { out[n++] = b[i]; if (b[i] === 0xff && b[i + 1] === 0) i++; } return out.subarray(0, n); };
function text(body) {
  const enc = body[0], d = body.subarray(1);
  let s = '';
  try { s = new TextDecoder(['iso-8859-1', 'utf-16', 'utf-16be', 'utf-8'][enc] || 'utf-8').decode(d); } catch (e) { s = latin(d, 0, d.length); }
  return s.replace(/^﻿/, '').split('\u0000')[0].trim();
}
function endOfString(b, i, wide) {
  if (!wide) { while (i < b.length && b[i] !== 0) i++; return i + 1; }
  while (i + 1 < b.length && (b[i] !== 0 || b[i + 1] !== 0)) i += 2; return i + 2;
}

async function id3(file, head) {
  const ver = head[3], flags = head[5], size = safe32(head, 6);
  if (size > 40e6) return {};
  let d = await bytes(file, 10, 10 + size);
  if ((flags & 0x80) && ver < 4) d = unsync(d);
  let p = 0; const out = {};
  if (flags & 0x40) p += ver === 4 ? safe32(d, 0) : be32(d, 0) + 4;
  const idLen = ver === 2 ? 3 : 4, hdr = ver === 2 ? 6 : 10;
  while (p + hdr <= d.length) {
    const id = latin(d, p, idLen);
    if (!/^[A-Z0-9]+$/.test(id)) break;
    const sz = ver === 2 ? (d[p + 3] << 16) | (d[p + 4] << 8) | d[p + 5] : ver === 4 ? safe32(d, p + 4) : be32(d, p + 4);
    const ff = ver === 2 ? 0 : d[p + 9];
    let body = d.subarray(p + hdr, p + hdr + sz); p += hdr + sz;
    if (!sz) continue;
    if (ver === 4) { if (ff & 1) body = body.subarray(4); if (ff & 2) body = unsync(body); }
    if (id === 'TIT2' || id === 'TT2') out.title = text(body);
    else if (id === 'TPE1' || id === 'TP1') out.artist = text(body);
    else if (id === 'TALB' || id === 'TAL') out.album = text(body);
    else if ((id === 'APIC' || id === 'PIC') && !out.picture) {
      const enc = body[0], wide = enc === 1 || enc === 2; let i = 1, mime;
      if (id === 'PIC') { mime = latin(body, 1, 3).toUpperCase() === 'PNG' ? 'image/png' : 'image/jpeg'; i = 4; } else { const e = endOfString(body, 1, false); mime = latin(body, 1, e - 2) || 'image/jpeg'; i = e; }
      i += 1;                               // picture type
      i = endOfString(body, i, wide);       // description
      if (i < body.length) out.picture = new Blob([body.subarray(i)], { type: mime.includes('/') ? mime : 'image/jpeg' });
    }
  }
  return out;
}
async function flac(file) {
  let p = 4; const out = {};
  for (let n = 0; n < 40 && p < file.size; n++) {
    const h = await bytes(file, p, p + 4); if (h.length < 4) break;
    const last = h[0] & 0x80, type = h[0] & 0x7f, len = (h[1] << 16) | (h[2] << 8) | h[3];
    if (type === 4) {
      const b = await bytes(file, p + 4, p + 4 + len); let i = 4 + le32(b, 0); const count = le32(b, i); i += 4;
      for (let k = 0; k < count && i < b.length; k++) {
        const l = le32(b, i); i += 4; const s = new TextDecoder().decode(b.subarray(i, i + l)); i += l;
        const eq = s.indexOf('='), key = s.slice(0, eq).toUpperCase(), val = s.slice(eq + 1);
        if (key === 'TITLE') out.title = val; else if (key === 'ARTIST') out.artist = val; else if (key === 'ALBUM') out.album = val;
      }
    } else if (type === 6 && !out.picture) {
      const b = await bytes(file, p + 4, p + 4 + len); let i = 4; const ml = be32(b, i); i += 4; const mime = latin(b, i, ml); i += ml;
      const dl = be32(b, i); i += 4 + dl + 16; const pl = be32(b, i); i += 4;
      out.picture = new Blob([b.subarray(i, i + pl)], { type: mime || 'image/jpeg' });
    }
    p += 4 + len; if (last) break;
  }
  return out;
}
async function mp4(file) {
  let p = 0;
  while (p + 8 <= file.size) {
    const h = await bytes(file, p, p + 16); let sz = be32(h, 0), hdr = 8; const type = latin(h, 4, 4);
    if (sz === 1) { sz = be32(h, 8) * 4294967296 + be32(h, 12); hdr = 16; } else if (sz === 0) sz = file.size - p;
    if (type === 'moov') {
      if (sz > 60e6) return {};
      const b = await bytes(file, p + hdr, p + sz), out = {};
      const find = (start, end, name) => { let i = start; while (i + 8 <= end) { const s = be32(b, i); if (s < 8) break; if (latin(b, i + 4, 4) === name) return [i + 8, i + s]; i += s; } return null; };
      const udta = find(0, b.length, 'udta'); if (!udta) return out;
      const meta = find(udta[0], udta[1], 'meta'); if (!meta) return out;
      const ilst = find(meta[0] + 4, meta[1], 'ilst'); if (!ilst) return out;
      let i = ilst[0];
      while (i + 8 <= ilst[1]) {
        const s = be32(b, i), name = latin(b, i + 4, 4); if (s < 8) break;
        const data = find(i + 8, i + s, 'data');
        if (data) {
          const kind = be32(b, data[0]) & 0xffffff, pay = b.subarray(data[0] + 8, data[1]);
          if (name === '©nam') out.title = new TextDecoder().decode(pay);
          else if (name === '©ART') out.artist = new TextDecoder().decode(pay);
          else if (name === '©alb') out.album = new TextDecoder().decode(pay);
          else if (name === 'covr' && !out.picture) out.picture = new Blob([pay], { type: kind === 14 ? 'image/png' : 'image/jpeg' });
        }
        i += s;
      }
      return out;
    }
    if (sz < 8) break; p += sz;
  }
  return {};
}
/** Title, artist, album and embedded picture from an audio file, when it has them. */
export async function readMeta(file) {
  try {
    const head = await bytes(file, 0, 12);
    if (latin(head, 0, 3) === 'ID3') return await id3(file, head);
    if (latin(head, 0, 4) === 'fLaC') return await flac(file);
    if (latin(head, 4, 4) === 'ftyp') return await mp4(file);
  } catch (e) { /* unreadable tags: fall back to the file name */ }
  return {};
}

const fmt = (s) => (isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '–:––');
const I = {
  play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5z"/></svg>', pause: '<svg viewBox="0 0 24 24"><path d="M6 4h4.5v16H6zM13.5 4H18v16h-4.5z"/></svg>',
  prev: '<svg viewBox="0 0 24 24"><path d="M6 5h2.5v14H6zM20 5v14L9.5 12z"/></svg>', next: '<svg viewBox="0 0 24 24"><path d="M15.5 5H18v14h-2.5zM4 5v14l10.5-7z"/></svg>',
};

export function initVinyl(app) {
  const el = new Audio(); el.preload = 'auto';
  const v = app.vinyl = { el, tracks: [], index: -1, crackle: true, root: null, error: '' };
  const input = $('#songs'), mini = $('#mini');
  const cur = () => v.tracks[v.index];

  async function add(files) {
    const list = [...files].filter((f) => f.type.startsWith('audio/') || /\.(mp3|m4a|aac|flac|wav|ogg|opus)$/i.test(f.name));
    if (!list.length) { v.error = t('vinylBad'); paint(); return; }
    v.error = ''; const first = v.tracks.length;
    for (const file of list) {
      const meta = await readMeta(file);
      const tr = { file, url: URL.createObjectURL(file), title: meta.title || file.name.replace(/\.[^.]+$/, '').replace(/[_]+/g, ' '), artist: meta.artist || '', album: meta.album || '', duration: NaN };
      if (meta.picture) {
        tr.cover = URL.createObjectURL(meta.picture);
        tr.image = await new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = tr.cover; });
      }
      if (!tr.image) { tr.image = generatedCover(tr.title, tr.artist); tr.cover = tr.image.toDataURL('image/jpeg', 0.85); }
      const probe = new Audio(); probe.preload = 'metadata'; probe.src = tr.url;
      probe.onloadedmetadata = () => { tr.duration = probe.duration; if (v.root) paintQueue(); };
      v.tracks.push(tr);
    }
    if (el.paused) start(first); else paint();
  }
  function start(i) {
    if (!v.tracks[i]) return;
    v.index = i; const tr = cur();
    audio.init(); audio.attachMedia(el);
    el.src = tr.url;
    el.play().then(() => { audio.play('needle', { vol: 0.5 }); }).catch(() => { v.error = t('vinylBad'); paint(); });
    world.refs.deck.setCover(tr.image);
    paint();
  }
  const toggle = () => { if (!cur()) { input.click(); return; } if (el.paused) el.play(); else el.pause(); };
  const step = (d) => { if (!v.tracks.length) return; start((v.index + d + v.tracks.length) % v.tracks.length); };
  v.add = add; v.toggle = toggle;

  const sync = () => {
    const playing = !el.paused && !el.ended;
    world.refs.deck.playing = playing;
    audio.crackle(playing && v.crackle);
    audio.loopLevel('projector', playing ? 0.1 : app.projectorLevel || 0.3, 0.8);
    mini.classList.toggle('is-paused', !playing);
    if (v.root) { $('.plinth', v.root).classList.toggle('is-playing', playing); const b = $('[data-v="toggle"]', v.root); b.innerHTML = playing ? I.pause : I.play; b.setAttribute('aria-label', t(playing ? 'pause' : 'play')); }
    app.musicPlaying = playing;
  };
  el.addEventListener('play', sync); el.addEventListener('pause', () => { sync(); if (!el.ended) audio.play('vinyl_stop', { vol: 0.4 }); });
  el.addEventListener('ended', () => { if (v.index < v.tracks.length - 1) start(v.index + 1); else sync(); });
  el.addEventListener('error', () => { if (!cur()) return; v.error = t('vinylBad'); v.tracks.splice(v.index, 1); v.index = -1; sync(); paint(); });
  el.addEventListener('loadedmetadata', () => { if (cur()) { cur().duration = el.duration; if (v.root) paintQueue(); } });

  input.addEventListener('change', () => { add(input.files); input.value = ''; });
  window.addEventListener('dragover', (e) => { e.preventDefault(); const d = v.root && $('.drop', v.root); if (d) d.classList.add('is-over'); });
  window.addEventListener('dragleave', () => { const d = v.root && $('.drop', v.root); if (d) d.classList.remove('is-over'); });
  window.addEventListener('drop', (e) => {
    e.preventDefault(); const d = v.root && $('.drop', v.root); if (d) d.classList.remove('is-over');
    if (e.dataTransfer && e.dataTransfer.files.length) { add(e.dataTransfer.files); if (!v.root && app.player.enabled) app.open('vinyl'); }
  });
  mini.addEventListener('click', () => { audio.click(0.4); app.open('vinyl'); });

  function paintMini() {
    const tr = cur(); mini.hidden = !tr; if (!tr) return;
    mini.innerHTML = `<i class="a" style="background-image:url('${tr.cover}')"></i><span><b>${esc(tr.title)}</b><small>${esc(tr.artist || t('vinylUnknown'))}</small></span>`;
  }
  function paintQueue() {
    const q = v.root && $('.queue', v.root); if (!q) return;
    q.innerHTML = v.tracks.map((tr, i) => `<li class="${i === v.index ? 'on' : ''}" data-i="${i}"><i class="a" style="background-image:url('${tr.cover}')"></i><span><b>${esc(tr.title)}</b><small>${esc(tr.artist || t('vinylUnknown'))}</small></span><time>${fmt(tr.duration)}</time></li>`).join('');
  }
  function paint() {
    paintMini();
    const root = v.root; if (!root) return;
    const tr = cur();
    root.innerHTML = `
      <h1 class="h1">${t('vinylTitle')}</h1>
      <div class="deck">
        <div class="plinth">
          <div class="platter"><div class="disc"><div class="label"${tr ? ` style="background-image:url('${tr.cover}')"` : ''}></div></div></div>
          <div class="arm"></div><div class="viz">${'<i></i>'.repeat(9)}</div><div class="led"></div>
        </div>
        ${tr ? `<div class="sleeve"><div class="art" style="background-image:url('${tr.cover}')"></div><div><h3>${esc(tr.title)}</h3><p>${esc(tr.artist || t('vinylUnknown'))}${tr.album ? ' · ' + esc(tr.album) : ''}</p></div></div>` : `<p class="lead">${t('vinylEmpty')}</p>`}
        <div class="transport">
          <button class="round" type="button" data-v="prev" aria-label="${t('prevTrack')}">${I.prev}</button>
          <button class="round is-main" type="button" data-v="toggle" aria-label="${t('play')}">${I.play}</button>
          <button class="round" type="button" data-v="next" aria-label="${t('nextTrack')}">${I.next}</button>
          <div class="seek"><input type="range" min="0" max="1000" value="0" aria-label="Seek"><small><span data-v="now">0:00</span><span data-v="len">–:––</span></small></div>
        </div>
        <div class="vol"><span>${t('volume')}</span><input type="range" min="0" max="100" value="${Math.round(el.volume * 100)}" aria-label="${t('volume')}"><label><input type="checkbox" ${v.crackle ? 'checked' : ''}> ${t('vinylCrackle')}</label></div>
        <button class="drop" type="button"><b>${t('vinylDrop')}</b><span>${t('vinylDropSub')}</span></button>
        ${v.error ? `<p class="err">${esc(v.error)}</p>` : ''}
        ${v.tracks.length ? `<h2 class="h2">${t('vinylQueue')}</h2><ul class="queue"></ul>` : ''}
      </div>`;
    [...root.children].forEach((c, i) => c.style.setProperty('--i', i));
    paintQueue(); sync();
    $('.drop', root).addEventListener('click', () => input.click());
    $('[data-v="toggle"]', root).addEventListener('click', toggle);
    $('[data-v="prev"]', root).addEventListener('click', () => step(-1));
    $('[data-v="next"]', root).addEventListener('click', () => step(1));
    const seek = $('.seek input', root);
    seek.addEventListener('input', () => { if (isFinite(el.duration)) el.currentTime = (seek.value / 1000) * el.duration; });
    $('.vol input[type=range]', root).addEventListener('input', (e) => { el.volume = e.target.value / 100; });
    $('.vol input[type=checkbox]', root).addEventListener('change', (e) => { v.crackle = e.target.checked; sync(); });
    const q = $('.queue', root); if (q) q.addEventListener('click', (e) => { const li = e.target.closest('li'); if (li) start(Number(li.dataset.i)); });
  }
  v.render = (root) => { v.root = root; paint(); };
  v.unmount = () => { v.root = null; };
  /** Called every frame while the panel is open. */
  v.tick = () => {
    const root = v.root; if (!root) return;
    const seek = $('.seek input', root); if (!seek) return;
    const k = isFinite(el.duration) && el.duration ? el.currentTime / el.duration : 0;
    if (document.activeElement !== seek) seek.value = String(Math.round(k * 1000));
    $('[data-v="now"]', root).textContent = fmt(el.currentTime); $('[data-v="len"]', root).textContent = fmt(el.duration);
    $('.plinth', root).style.setProperty('--prog', k.toFixed(3));
    const sp = audio.spectrum(), bars = $$('.viz i', root);
    if (sp) bars.forEach((b, i) => { b.style.height = `${4 + (sp[2 + i * 4] / 255) * 96}%`; });
  };
}
