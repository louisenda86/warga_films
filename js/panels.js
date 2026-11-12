// The glass side panel and everything that can appear inside it.
import { FILMS, FOUNDER, WORKFLOW, SCRIPTS, BOOKS, MERCH, CHANNEL } from './content.js';
import { t, L, onLang } from './i18n.js';
import { $, $$, esc } from './util.js';
import { audio } from './audio.js';
import { STATIONS, svg } from './hud.js';

const YT_TITLE = {
  fl: 'Ekornya Ditemui 6 KM Jauh — Apa Sebenarnya Berlaku Pada Jet Florida N722BD?',
  bt: 'Apa Sebenarnya Yang BIG TECH Mahukan Daripada Malaysia?',
};
const film = (id) => FILMS.find((f) => f.id === id) || FILMS[0];
const ransom = (s) => `<div class="ransom" role="heading" aria-level="1" aria-label="${esc(s)}">${s.split(' ').map((w) => `<span class="w" aria-hidden="true">${[...w].map((c) => `<b>${esc(c)}</b>`).join('')}</span>`).join('')}</div>`;
const ytUrl = (id) => `https://www.youtube.com/watch?v=${id}`;

export function initPanels(app) {
  const panel = $('#panel'), body = $('#panelBody'), kicker = $('#panelKicker');
  const st = { kind: null, arg: null, timers: [] };
  const P = app.panels = { state: st };
  const clearTimers = () => { st.timers.forEach((x) => { clearInterval(x); clearTimeout(x); }); st.timers = []; };
  const lay = () => [...body.children].forEach((c, i) => c.style.setProperty('--i', i));
  const setKicker = (n, key) => { kicker.textContent = `Fig. ${String(n).padStart(2, '0')} · ${t(key)}`; };

  // ---------------------------------------------------------- films
  function films(id) {
    const f = film(id || st.arg || 'fl'); st.arg = f.id; setKicker(7, 's_films');
    body.innerHTML = `
      <h1 class="h1">${t('filmsTitle')}</h1>
      <p class="lead">${t('filmsLead')}</p>
      <div class="tabs" role="tablist">${FILMS.map((x) => `<button class="tab" role="tab" type="button" data-film="${x.id}" aria-selected="${x.id === f.id}"><img src="${x.img}" alt=""><span>${x.code}</span></button>`).join('')}</div>
      <figure class="film-hero"><div class="photo"><i class="tape"></i><img src="${f.img2}" alt=""><figcaption>${f.code} · ${f.year} · Warga Films</figcaption></div>${f.yt ? '' : `<span class="stamp">${t('soon')}</span>`}</figure>
      <h2 class="h1">${esc(L(f.title))}</h2>
      <p class="cap">${esc(L(f.sub))}</p>
      <ul class="meta"><li><b>${f.dur}</b> ${t('runtime').toLowerCase()}</li><li>4K · 60 fps</li><li>Bahasa Melayu</li></ul>
      <p class="lead">${esc(L(f.synopsis))}</p>
      <div class="row">
        ${f.yt ? `<a class="btn" href="${ytUrl(f.yt)}" target="_blank" rel="noopener">${svg('play')}${t('watch')}</a>` : `<button class="btn is-ghost" type="button" disabled>${t('soon')}</button>`}
        <button class="btn is-ghost" type="button" data-script="${f.id}">${t('readScript')}</button>
      </div>
      <h3 class="h2">${t('chapters')}</h3>
      <ol class="board">${f.chapters.map(([tm, n]) => `<li><time>${tm}</time><span>${esc(L(n))}</span></li>`).join('')}</ol>
      <h3 class="h2">${t('howMade')}</h3>
      <p class="cap">${esc(L(f.craft))}</p>`;
    lay();
    $$('[data-film]', body).forEach((b) => b.addEventListener('click', () => { audio.play('vhs', { vol: 0.35 }); films(b.dataset.film); body.scrollTop = 0; }));
    $('[data-script]', body).addEventListener('click', () => { audio.click(0.4); app.open('scripts', f.id); });
  }

  // ---------------------------------------------------------- founder
  function founder() {
    setKicker(3, 'founderTitle');
    body.innerHTML = `
      ${ransom(L(FOUNDER.name).toUpperCase())}
      <div class="founder-top">
        <figure class="photo" style="margin:0"><i class="tape"></i><img src="${FOUNDER.img}" alt=""><figcaption>${esc(L(FOUNDER.role))}</figcaption></figure>
        <div class="paper is-kraft" style="transform:rotate(1.2deg)"><i class="tape r"></i>
          <dl class="facts">${FOUNDER.facts.map(([k, v]) => `<div><dt>${esc(L(k))}</dt><dd>${esc(L(v))}</dd></div>`).join('')}</dl>
        </div>
      </div>
      <div class="body">${L(FOUNDER.body).map((p) => `<p>${esc(p)}</p>`).join('')}</div>
      <p class="cap" style="margin-top:22px">${t('talksAbout')}</p>
      <ul class="tags">${FOUNDER.topics.map((x) => `<li>${esc(L(x))}</li>`).join('')}</ul>
      <p class="quote">${esc(L(CHANNEL.motto))}</p>
      <p class="cap">Warga Crew</p>`;
    lay();
  }

  // ---------------------------------------------------------- workflow
  function workflow() {
    setKicker(4, 's_workflow');
    const caps = { ms: ['Pelan studio dalam Blender', 'Render mentah lwn. akhir', 'Kolaj dibina lapis demi lapis', 'Urutan papan split-flap', 'Model Learjet, rangka dawai', 'Studio 3D, sudut lebar'], en: ['Studio layout in Blender', 'Raw render vs. final', 'A collage built layer by layer', 'Split-flap board sequence', 'Learjet model, wireframe', 'The 3D studio, wide'] };
    body.innerHTML = `
      <h1 class="h1">${t('workflowTitle')}</h1>
      <p class="lead">${t('workflowLead')}</p>
      <ol class="flow">${WORKFLOW.map((s, i) => `<li style="--i:${i}"><div class="paper"><h3>${esc(L(s.t))}</h3><p>${esc(L(s.d))}</p><small>${esc(L(s.tool))}</small></div></li>`).join('')}</ol>
      <h2 class="h2">${t('behind')}</h2>
      <div class="gallery">${L(caps).map((c, i) => `<figure class="photo" style="margin:0"><img src="assets/img/bts/b0${i + 1}.jpg" alt="" loading="lazy"><figcaption>${esc(c)}</figcaption></figure>`).join('')}</div>`;
    lay();
    audio.play('stamp', { vol: 0.35, delay: 0.5 });
  }

  // ---------------------------------------------------------- script archive
  function scripts(id) {
    const s = SCRIPTS.find((x) => x.film === (id || st.arg)) || SCRIPTS[3]; st.arg = s.film; const f = film(s.film); setKicker(5, 's_scripts');
    clearTimers();
    body.innerHTML = `
      <h1 class="h1">${t('scriptsTitle')}</h1>
      <p class="lead">${t('scriptsLead')}</p>
      <div><div class="folders" role="tablist">${SCRIPTS.map((x) => `<button class="folder" role="tab" type="button" data-s="${x.film}" aria-selected="${x.film === s.film}">${film(x.film).code}</button>`).join('')}</div>
      <article class="sheet"><i class="holes"></i>
        <div class="date">${s.date}</div><div class="place">${s.place}</div>
        <h3>${esc(L(f.title))}</h3>
        <h4>${t('directorIdea')}</h4><p style="margin:0">${esc(L(s.idea))}</p>
        <h4>${t('firstPage')}</h4><div class="typed" aria-label="${esc(L(s.lines).join(' '))}"></div>
        <h4>${t('structure')}</h4><ol>${f.chapters.map(([tm, n]) => `<li><time>${tm}</time><span>${esc(L(n))}</span></li>`).join('')}</ol>
      </article></div>`;
    lay();
    $$('[data-s]', body).forEach((b) => b.addEventListener('click', () => { audio.play('paper', { vol: 0.4 }); scripts(b.dataset.s); }));
    // type the first page, one key at a time
    const out = $('.typed', body), full = L(s.lines).join('\n'); let i = 0;
    st.timers.push(setTimeout(() => {
      const id2 = setInterval(() => {
        const step = Math.random() < 0.15 ? 2 : 1; i = Math.min(full.length, i + step); out.textContent = full.slice(0, i);
        const ch = full[i - 1]; if (ch === '\n') audio.play('carriage', { vol: 0.16 }); else if (ch !== ' ' && i % 2) audio.key();
        if (i >= full.length) { clearInterval(id2); audio.play('bell', { vol: 0.25 }); }
      }, 46);
      st.timers.push(id2);
    }, 700));
  }

  // ---------------------------------------------------------- books
  function book(id, page = 0, turn = false) {
    const bk = BOOKS.find((b) => b.id === (id || st.arg)) || BOOKS[0]; st.arg = bk.id; st.page = page; setKicker(2, 's_library');
    const pg = bk.pages[page], n = bk.pages.length;
    const inkOnPaper = bk.id === 'nota' ? '#D1140D' : bk.color;
    body.innerHTML = `
      <h1 class="h1">${t('libraryTitle')}</h1>
      <p class="lead">${t('libraryLead')}</p>
      <div class="shelf" role="tablist">${BOOKS.map((b) => `<button class="bk" role="tab" type="button" data-b="${b.id}" aria-selected="${b.id === bk.id}" style="--bk:${b.color};--bk-ink:${b.ink}"><b>${esc(L(b.title))}</b><small>${esc(L(b.by))}</small></button>`).join('')}</div>
      <div class="reader"><article class="leaf${turn ? ' turn' : ''}" style="--bk:${inkOnPaper}">
        <span class="no">${String(page + 1).padStart(2, '0')}</span>
        <h3>${esc(L(pg.h))}</h3><p>${esc(L(pg.p))}</p>
        <footer><span>${esc(L(bk.title))}</span><span>${t('page')} ${page + 1} / ${n}</span></footer>
      </article></div>
      <div class="pager">
        <button class="btn is-ghost" type="button" data-pg="-1" ${page === 0 ? 'disabled' : ''}>${t('prev')}</button>
        <div class="dots">${bk.pages.map((_, i) => `<i class="${i === page ? 'on' : ''}"></i>`).join('')}</div>
        <button class="btn is-cream" type="button" data-pg="1" ${page === n - 1 ? 'disabled' : ''}>${t('next')}</button>
      </div>`;
    if (!turn) lay(); else [...body.children].forEach((c) => { c.style.animation = 'none'; });
    $$('[data-b]', body).forEach((b) => b.addEventListener('click', () => { audio.play('paper', { vol: 0.45 }); app.open('book', b.dataset.b); }));
    $$('[data-pg]', body).forEach((b) => b.addEventListener('click', () => { audio.play('rustle', { vol: 0.5 }); book(bk.id, page + Number(b.dataset.pg), true); }));
  }
  P.pageKey = (k) => {
    if (st.kind !== 'book') return false;
    const bk = BOOKS.find((b) => b.id === st.arg); if (!bk) return false;
    const d = k === 'arrowright' ? 1 : k === 'arrowleft' ? -1 : 0; if (!d) return false;
    const np = st.page + d; if (np < 0 || np >= bk.pages.length) return true;
    audio.play('rustle', { vol: 0.5 }); book(bk.id, np, true); return true;
  };

  // ---------------------------------------------------------- merch
  function merch(id) {
    const m = MERCH.find((x) => x.id === (id || st.arg)) || MERCH[0]; st.arg = m.id; setKicker(10, 's_merch');
    body.innerHTML = `
      <p class="cap">${t('collection')} · ${esc(L(m.kind))}</p>
      <h1 class="h1">${esc(L(m.name))}</h1>
      <p class="lead">${esc(L(m.d))}</p>
      <ul class="meta"><li>${esc(L(m.spec))}</li></ul>
      <div class="paper" style="transform:rotate(-.8deg);margin:22px 0 8px"><i class="tape"></i><p style="font:500 14px/1.55 var(--mono)">${t('merchSoon')}</p></div>
      <div class="row"><a class="btn" href="${CHANNEL.subscribe}" target="_blank" rel="noopener">${t('notify')}</a></div>
      <h2 class="h2">${t('otherItems')}</h2>
      <div class="others">${MERCH.map((x) => `<button type="button" data-m="${x.id}" aria-current="${x.id === m.id}">${esc(L(x.kind))}</button>`).join('')}</div>`;
    lay();
    $$('[data-m]', body).forEach((b) => b.addEventListener('click', () => { audio.click(0.4); app.open('merch', b.dataset.m); }));
  }

  // ---------------------------------------------------------- youtube
  function youtube() {
    setKicker(9, 's_youtube');
    const live = FILMS.filter((f) => f.yt), soon = FILMS.filter((f) => !f.yt);
    body.innerHTML = `
      <div class="yt-head"><img src="assets/img/brand/stamp.jpg" alt=""><div><h2>Warga Films</h2><p class="cap" style="margin:0">${CHANNEL.handle} · youtube.com</p></div></div>
      <p class="lead">${esc(L(CHANNEL.about))}</p>
      <div class="row" style="margin-top:0"><a class="btn" href="${CHANNEL.subscribe}" target="_blank" rel="noopener">${svg('play')}${t('subscribe')}</a><a class="btn is-ghost" href="${CHANNEL.url}" target="_blank" rel="noopener">${t('openChannel')}</a></div>
      <h2 class="h2">${t('onChannel')}</h2>
      <ul class="yt-list">${live.map((f) => `<li class="yt-card"><button class="thumb" type="button" data-yt="${f.yt}" aria-label="${t('playHere')}: ${esc(YT_TITLE[f.id] || L(f.title))}"><img src="${f.img}" alt=""><i class="pl"></i><span class="dur">${f.dur}</span></button>
        <div><h3>${esc(YT_TITLE[f.id] || L(f.title))}</h3><p class="cap">${f.code} · ${f.dur}</p><a class="linkish" href="${ytUrl(f.yt)}" target="_blank" rel="noopener">${t('watch')}</a></div></li>`).join('')}</ul>
      <h2 class="h2">${t('comingUp')}</h2>
      <ul class="yt-list">${soon.map((f) => `<li class="yt-card is-soon"><span class="thumb"><img src="${f.img}" alt=""><span class="stamp">${t('soon')}</span></span>
        <div><h3>${esc(L(f.title))}</h3><p class="cap">${f.code} · ${f.dur}</p></div></li>`).join('')}</ul>
      <p class="quote">${esc(L(CHANNEL.motto))}</p>`;
    lay();
    $$('[data-yt]', body).forEach((b) => b.addEventListener('click', () => {
      audio.play('tv_on', { vol: 0.4 });
      const fr = document.createElement('div'); fr.className = 'yt-frame';
      fr.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${b.dataset.yt}?autoplay=1&rel=0" title="YouTube" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
      const card = b.closest('.yt-card'); card.style.gridTemplateColumns = '1fr'; b.replaceWith(fr);
      if (app.vinyl && !app.vinyl.el.paused) app.vinyl.el.pause();
      audio.loopLevel('projector', 0.04, 0.5);
    }));
  }

  // ---------------------------------------------------------- index
  function index() {
    setKicker(0, 'index');
    const item = (icon, label, attr) => `<li><button type="button" ${attr}>${svg(icon)}<span>${esc(label)}</span></button></li>`;
    body.innerHTML = `
      <h1 class="h1">${t('indexTitle')}</h1>
      <p class="lead">${t('indexLead')}</p>
      <h2 class="h2" style="margin-top:8px">${t('rooms')}</h2>
      <ul class="idx">${STATIONS.map((s) => item(s.icon, t(s.label), `data-go="${s.id}"`)).join('')}</ul>
      <h2 class="h2">${t('toRead')}</h2>
      <ul class="idx">
        ${item('film', t('filmsTitle'), 'data-open="films"')}${item('hat', L(FOUNDER.name), 'data-open="founder"')}
        ${item('board', t('workflowTitle'), 'data-open="workflow"')}${item('page', t('scriptsTitle'), 'data-open="scripts"')}
        ${BOOKS.map((b) => item('book', L(b.title), `data-open="book" data-arg="${b.id}"`)).join('')}
        ${item('play', t('ytTitle'), 'data-open="youtube"')}${item('shirt', t('merchTitle'), 'data-open="merch" data-arg="tee"')}
      </ul>
      <h2 class="h2">${t('toPlay')}</h2>
      <ul class="idx">
        ${item('vinyl', t('vinylTitle'), 'data-open="vinyl"')}${item('sofa', t('h_sit'), 'data-do="sit"')}
        ${item('note', t('h_drums'), 'data-do="drums"')}${item('note', t('h_guitar'), 'data-do="guitar"')}${item('note', t('h_sax'), 'data-do="sax"')}
      </ul>
      <h2 class="h2">${t('controls')}</h2>
      <ul class="keys"><li>${t('c_look')}</li><li>${t('c_walk')}</li><li>${t('c_click')}</li><li>${t('c_use')}</li><li>${t('c_esc')}</li></ul>
      <h2 class="h2">${t('credits')}</h2>
      <p class="cap">${t('creditsBody')}</p>`;
    lay();
    body.onclick = (e) => {
      const b = e.target.closest('button'); if (!b || st.kind !== 'index') return;
      audio.click(0.45);
      if (b.dataset.go) { app.close(false).then(() => app.hud.station(b.dataset.go)); }
      else if (b.dataset.open) app.open(b.dataset.open, b.dataset.arg);
      else if (b.dataset.do === 'sit') app.close(false).then(() => app.sit());
      else if (b.dataset.do) app.close(false).then(() => app.play(b.dataset.do));
    };
  }

  const render = { films, founder, workflow, scripts, book, merch, youtube, index, vinyl: () => { setKicker(6, 's_vinyl'); app.vinyl.render(body); } };
  P.show = (kind, arg) => {
    clearTimers(); body.onclick = null; if (st.kind === 'vinyl' && kind !== 'vinyl') app.vinyl.unmount();
    st.kind = kind; st.arg = arg || null; st.page = 0;
    body.scrollTop = 0; render[kind](arg);
    panel.classList.add('is-open'); panel.setAttribute('aria-hidden', 'false');
    audio.play('whoosh', { vol: 0.16 });
  };
  P.hide = () => {
    clearTimers(); if (st.kind === 'vinyl') app.vinyl.unmount();
    st.kind = null; panel.classList.remove('is-open'); panel.setAttribute('aria-hidden', 'true');
    setTimeout(() => { if (!st.kind) body.innerHTML = ''; }, 700);
  };
  onLang(() => { if (st.kind) { clearTimers(); render[st.kind](st.arg, st.page); } });
}
