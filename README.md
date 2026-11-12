# Warga Films — studio website

A walkable three.js version of the Warga Films studio, in Bahasa Melayu and English.
Plain static files: no build step, no server code.

Live: https://louisenda86.github.io/warga_films/ · Channel: https://www.youtube.com/@wargafilms

## Run it

```bash
python3 tools/serve.py
```

Then open http://127.0.0.1:8787. Any static host works too (upload the whole `Website` folder).
It needs to be served over http(s); opening `index.html` straight from disk will not load the modules.

## What is in the room

| Place | What it does |
|---|---|
| Sofa | Sit and watch the reel on the projector screen |
| Library | Four readable books: how to build a script, writing a good screenplay, the guide to making films, the founder's notebook |
| Narrator's desk | The founder: the man with no name |
| Workflow board | The ten steps from one question to a 4K master |
| Script archive | One drawer per film: director's idea, first page, structure |
| Record player | Choose or drop songs; tags and cover art are read in the browser, nothing is uploaded |
| Film rack | The four films, with chapters and YouTube links |
| Stage | Playable drums, guitar and saxophone |
| TV | The YouTube channel |
| Merch room | T-shirt, hoodie, jacket, hat, cap, disc, VHS (marked "coming soon", no prices) |

## Where to change things

- `js/content.js` — all film, founder, workflow, script, book and merch text, in both languages.
  To add film five: add an entry to `FILMS` and `SCRIPTS`, put its images in `assets/img/films/`,
  and set `yt` to the YouTube video id once it is uploaded (leave `null` for "coming soon").
- `js/i18n.js` — interface strings.
- `js/studio.js`, `js/instruments.js`, `js/merch.js` — the 3D rooms.
- `js/tex.js` — every drawn texture (posters, signs, covers, the pinboard).
- `css/style.css` — the liquid-glass interface and the paper collage.
- `assets/img` and `assets/sfx` are prepared from the film projects by a local script that is not part of this repository.

## Publishing

The site is served by GitHub Pages from the `main` branch. To update the live site, commit and push:

```bash
git add -A && git commit -m "Update the studio" && git push
```

## Credits

- three.js r184, MIT licence (`vendor/three/LICENSE`).
- Butler typeface by Fabian De Smet, unmodified, free for personal and commercial use (Butler Font License v1.1 / CC BY-SA 4.0).
- Barlow Condensed and JetBrains Mono, SIL Open Font License.
- Sound effects trimmed from Pixabay clips (Pixabay Content License), listed in `assets/sfx/SOURCES.md`.
- Films, images and text © Warga Films.
