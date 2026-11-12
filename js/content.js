// Everything the studio says, in Bahasa Melayu (ms) and English (en).
// Film facts come from each project's YOUTUBE_PACKAGE.md and SCREENPLAY.md.

export const CHANNEL = {
  url: 'https://www.youtube.com/@wargafilms',
  subscribe: 'https://www.youtube.com/@wargafilms?sub_confirmation=1',
  handle: '@wargafilms',
  about: {
    ms: 'Dokumentari yang meneroka sisi gelap sejarah dan realiti pelik dunia kita. Sumber diteliti, peristiwa dibina semula, dan tempat yang dilupakan dihidupkan kembali melalui persekitaran 3D dan naratif sinematik. Video baharu terbit apabila kisahnya benar-benar siap, bukan untuk memenuhi tuntutan algoritma.',
    en: 'Documentaries about the dark side of history and the strange reality of our world. Sources are checked, events are rebuilt, and forgotten places come back through 3D environments and cinematic narration. A new film comes out when the story is ready, not when the algorithm asks for one.',
  },
  motto: {
    ms: 'Teruskan rasa ingin tahu. Persoalkan segala-galanya.',
    en: 'Stay curious. Question everything.',
  },
};

export const FILMS = [
  {
    id: 'fl', code: 'WF-001', img: 'assets/img/films/fl.jpg', img2: 'assets/img/films/fl2.jpg',
    yt: 'vK7G81trQsQ', dur: '19:41', year: 2026, tone: '#1d2a44',
    title: { ms: '35 Saat Sebelum Nahas', en: '35 Seconds Before the Crash' },
    sub: { ms: 'Misteri jet Florida yang terbelah di udara', en: 'The Florida jet that came apart in the air' },
    short: { ms: '35 SAAT', en: '35 SECONDS' },
    synopsis: {
      ms: 'Sebuah Learjet 60 menjunam dari 35,000 kaki dan terhempas di Greenacres, Florida. Dua hari kemudian, penyiasat menemukan serpihan pengemudi ketinggian kiri sehingga enam kilometer dari kawah hentaman. Filem ini menyusun semula urutan peristiwa daripada rakaman radio ATC, data penerbangan awam dan taklimat NTSB, lalu memisahkan apa yang sudah diketahui daripada apa yang masih menjadi persoalan.',
      en: 'A Learjet 60 dives from 35,000 feet and crashes in Greenacres, Florida. Two days later investigators find pieces of the left elevator up to six kilometres from the crater. The film rebuilds the sequence from ATC radio, public flight data and NTSB briefings, and keeps what is known apart from what is still a question.',
    },
    chapters: [
      ['0:00', { ms: 'Pembukaan', en: 'Opening' }],
      ['1:46', { ms: 'Penerbangan N722BD', en: 'Flight N722BD' }],
      ['3:24', { ms: 'Ribut di hadapan', en: 'The storm ahead' }],
      ['5:08', { ms: '35,000 kaki', en: '35,000 feet' }],
      ['7:07', { ms: 'Mayday', en: 'Mayday' }],
      ['8:42', { ms: 'Had aerodinamik', en: 'The aerodynamic limit' }],
      ['9:37', { ms: '"We\'re out of time"', en: '"We\'re out of time"' }],
      ['10:57', { ms: 'Military Trail', en: 'Military Trail' }],
      ['12:11', { ms: 'Serpihan 6 kilometer', en: 'Six kilometres of debris' }],
      ['14:35', { ms: 'Perakam suara kokpit', en: 'The cockpit voice recorder' }],
      ['15:33', { ms: 'Spekulasi', en: 'Speculation' }],
      ['16:13', { ms: 'Sembilan nyawa', en: 'Nine lives' }],
      ['17:28', { ms: 'Persoalan yang tinggal', en: 'The questions that remain' }],
    ],
    craft: { ms: 'Learjet 60 dibina khas dalam Blender · peta OpenStreetMap · radio ATC', en: 'Learjet 60 modelled from scratch in Blender · OpenStreetMap maps · ATC radio' },
  },
  {
    id: 'bt', code: 'WF-002', img: 'assets/img/films/bt.jpg', img2: 'assets/img/films/bt2.jpg',
    yt: 'bQeA4SjmXxM', dur: '34:31', year: 2026, tone: '#3a2a12',
    title: { ms: 'Kenapa Big Tech Mahukan Air dan Elektrik Malaysia?', en: 'Why Does Big Tech Want Malaysia\'s Water and Power?' },
    sub: { ms: '"The Cloud" berdiri di atas tanah', en: 'The Cloud stands on the ground' },
    short: { ms: 'AIR & ELEKTRIK', en: 'WATER & POWER' },
    synopsis: {
      ms: 'Setiap soalan yang ditaip ke dalam AI menghidupkan ribuan cip, dan cip itu perlu disejukkan. PETRA mengunjurkan 389.04 juta liter air sehari dan sehingga 8,391 MW elektrik untuk pusat data menjelang 2030, sementara Sarawak bergerak ke arah AI Grid. Filem ini bertanya soalan yang lebih sukar: siapa membekalkan sumbernya, siapa memiliki teknologinya, dan siapa benar-benar menikmati hasilnya?',
      en: 'Every question typed into an AI wakes thousands of chips, and the chips have to be cooled. PETRA projects 389.04 million litres of water a day and up to 8,391 MW of electricity for data centres by 2030, while Sarawak moves toward an AI Grid. The film asks the harder question: who supplies the resources, who owns the technology, and who actually enjoys the result?',
    },
    chapters: [
      ['0:00', { ms: 'Pembuka: Wawasan 2020', en: 'Cold open: Wawasan 2020' }],
      ['0:24', { ms: 'Harga sebenar satu soalan', en: 'The real price of one question' }],
      ['1:10', { ms: 'Dua angka dari PETRA', en: 'Two numbers from PETRA' }],
      ['2:50', { ms: 'Sarawak dan AI Grid', en: 'Sarawak and the AI Grid' }],
      ['4:27', { ms: 'Kenapa Malaysia?', en: 'Why Malaysia?' }],
      ['6:20', { ms: 'Air: kenapa komputer perlukan air', en: 'Water: why computers need it' }],
      ['8:44', { ms: 'Elektrik: siang dan malam', en: 'Power: day and night' }],
      ['10:42', { ms: 'Empangan Sarawak', en: 'Sarawak\'s dams' }],
      ['13:35', { ms: 'Kenapa dunia terdesak membina AI', en: 'Why the world is racing to build AI' }],
      ['16:45', { ms: 'Robot di rumah kita', en: 'Robots in our homes' }],
      ['19:53', { ms: 'Siapa menikmati hasilnya?', en: 'Who enjoys the result?' }],
      ['23:33', { ms: 'Hukum fizik: Sarawak bukan Sweden', en: 'Physics: Sarawak is not Sweden' }],
      ['27:57', { ms: 'Empat syarat', en: 'Four conditions' }],
      ['31:18', { ms: 'The Cloud berdiri di atas tanah', en: 'The Cloud stands on the ground' }],
    ],
    craft: { ms: 'Dewan pusat data 3D · air sentiasa sian, elektrik sentiasa ambar · papan siasatan', en: '3D data hall · water is always cyan, power is always amber · investigation board' },
  },
  {
    id: 'kk', code: 'WF-003', img: 'assets/img/films/kk.jpg', img2: 'assets/img/films/kk2.jpg',
    yt: null, dur: '28:18', year: 2026, tone: '#40140f',
    title: { ms: 'Kenapa Kad Kredit Buat Kita Rasa Macam Belum Bayar?', en: 'Why Does a Credit Card Feel Like We Haven\'t Paid Yet?' },
    sub: { ms: 'Sisi Gelap Kad Kredit', en: 'The Dark Side of the Credit Card' },
    short: { ms: 'KAD KREDIT', en: 'CREDIT CARD' },
    synopsis: {
      ms: 'Satu bip di kaunter mengambil masa kurang daripada satu saat. Beberapa minggu kemudian, penyata tiba. Filem ini menjejaki kad kredit dari peti surat di Fresno pada 1958, ke meja restoran Diners Club, ke penyata hari ini dan akhirnya ke skrin PayLater di telefon kita, dengan angka sebenar dari Malaysia, Indonesia, Singapura dan Brunei.',
      en: 'One beep at the counter takes less than a second. A few weeks later the statement arrives. The film follows the credit card from a Fresno mailbox in 1958 to a Diners Club restaurant table, to today\'s statement and finally to the PayLater screen on our phones, with real figures from Malaysia, Indonesia, Singapore and Brunei.',
    },
    chapters: [
      ['0:00', { ms: 'Pembukaan: dua angka', en: 'Opening: two numbers' }],
      ['0:47', { ms: 'Sampul yang tak pernah diminta', en: 'The envelope nobody asked for' }],
      ['3:31', { ms: 'Eksperimen Fresno dan jalan menuju Visa', en: 'The Fresno experiment and the road to Visa' }],
      ['7:13', { ms: 'RM500 yang semakin kecil', en: 'The RM500 that keeps shrinking' }],
      ['10:45', { ms: 'Dua harga untuk tiket yang sama', en: 'Two prices for the same ticket' }],
      ['14:31', { ms: 'Siapa bayar untuk mata ganjaran?', en: 'Who pays for reward points?' }],
      ['17:32', { ms: 'Ansuran yang bertemu pada hari yang sama', en: 'Instalments that land on the same day' }],
      ['20:51', { ms: 'Empat negara, empat jenis angka', en: 'Four countries, four kinds of numbers' }],
      ['25:06', { ms: 'Bunyi yang datang dahulu', en: 'The sound that comes first' }],
    ],
    craft: { ms: 'Kolaj Fresno · papan split-flap · kajian otak dalam three.js · peta Sentinel-2', en: 'Fresno collage · split-flap board · brain study in three.js · Sentinel-2 maps' },
  },
  {
    id: 'pr', code: 'WF-004', img: 'assets/img/films/pr.jpg', img2: 'assets/img/films/pr2.jpg',
    yt: null, dur: '46:52', year: 2026, tone: '#14225e',
    title: { ms: 'Apa Sebenarnya Berlaku kepada P. Ramlee?', en: 'What Really Happened to P. Ramlee?' },
    sub: { ms: 'Mengenali P. Ramlee', en: 'Getting to Know P. Ramlee' },
    short: { ms: 'P. RAMLEE', en: 'P. RAMLEE' },
    synopsis: {
      ms: 'Pada 30 Mei 1973, muka depan The Star melaporkan kematian P. Ramlee. Di dalamnya ada satu ayat pendek: malam sebelum dia meninggal, dia masih meneliti sebuah skrip. Filem ini menjejak semula perjalanannya dari Pulau Pinang ke Jalan Ampas, ke Hulu Kelang dan kembali ke Singapura, dan bertanya siapa yang menjaga filemnya sekarang.',
      en: 'On 30 May 1973 the front page of The Star reported the death of P. Ramlee. Inside was one short sentence: the night before he died, he was still looking over a script. The film retraces his road from Penang to Jalan Ampas, to Hulu Kelang and back to Singapore, and asks who looks after his films now.',
    },
    chapters: [
      ['0:00', { ms: 'Skrip pada malam terakhir', en: 'The script on the last night' }],
      ['0:56', { ms: 'Seminggu terakhir', en: 'The final week' }],
      ['3:13', { ms: 'Suara dari Pulau Pinang', en: 'A voice from Penang' }],
      ['6:17', { ms: 'Sebelum wajahnya memenuhi skrin', en: 'Before his face filled the screen' }],
      ['8:56', { ms: 'Kelas sosial, diukur dengan jarak', en: 'Class, measured in distance' }],
      ['12:10', { ms: 'Apa yang muzik tahu dahulu', en: 'What the music knew first' }],
      ['15:47', { ms: 'Studio mentertawakan dirinya sendiri', en: 'The studio laughs at itself' }],
      ['18:42', { ms: 'Sila baca sebelum bersetuju', en: 'Read before you agree' }],
      ['21:28', { ms: 'Saloma dan siapa yang mengisi bingkai', en: 'Saloma and who fills the frame' }],
      ['24:24', { ms: 'Tahun piala dan tahun mogok', en: 'The year of trophies and strikes' }],
      ['27:37', { ms: 'Tiga tahun antara dua pintu', en: 'Three years between two doors' }],
      ['33:31', { ms: 'Panggung berpindah ke ruang tamu', en: 'The cinema moves to the living room' }],
      ['39:24', { ms: 'Kembali ke Singapura', en: 'Back to Singapore' }],
      ['42:26', { ms: 'Siapa menjaga filemnya sekarang?', en: 'Who looks after his films now?' }],
    ],
    craft: { ms: 'Kolaj kertas potong · projektor 16 mm · gelendong filem three.js · saksofon crew', en: 'Cut-paper collage · 16 mm projector · three.js film reel · the crew\'s saxophone' },
  },
];

export const FOUNDER = {
  name: { ms: 'Lelaki Tanpa Nama', en: 'The Man With No Name' },
  role: { ms: 'Pengasas · Warga Crew (Narator)', en: 'Founder · Warga Crew (Narrator)' },
  img: 'assets/img/brand/crew.jpg',
  facts: [
    [{ ms: 'Diasaskan', en: 'Founded' }, { ms: '2009', en: '2009' }],
    [{ ms: 'Tempat', en: 'Place' }, { ms: 'Pulau Borneo', en: 'Borneo Island' }],
    [{ ms: 'Kru', en: 'Crew' }, { ms: 'Seorang', en: 'One' }],
    [{ ms: 'Nama', en: 'Name' }, { ms: 'Tidak dicatat', en: 'Not recorded' }],
  ],
  body: {
    ms: [
      'Warga Films bermula pada 2009 di Pulau Borneo, daripada seorang lelaki yang lebih suka bertanya daripada memperkenalkan diri. Dia tidak pernah menulis namanya pada mana-mana kredit. Di skrin, dia hanyalah Warga Crew: topi, kaca mata gelap, jaket kerja dan sebuah mikrofon.',
      'Di luar kerja, dia mendengar muzik dan membaca. Rak di belakang anda penuh dengan buku falsafah dan agama, dan saksofon di pentas itu memang dimainkan. Perbualan kegemarannya sentiasa berpusing pada soalan yang sama: apa itu kecerdasan, ke mana AI membawa kita, dan apa yang membuat sesebuah peradaban bertahan.',
      'Warga bermaksud warganegara, orang biasa. Itulah sudut pandang setiap filem di sini: bukan pakar yang bersyarah, tetapi seorang warga yang membaca sumbernya sendiri dan menunjukkan apa yang ditemuinya.',
    ],
    en: [
      'Warga Films began in 2009 on Borneo Island, with a man who would rather ask a question than introduce himself. He has never written his name on a credit. On screen he is only the Warga Crew: a hat, dark glasses, a work jacket and a microphone.',
      'Away from the work he listens to music and reads. The shelves behind you are full of philosophy and religion, and the saxophone on the stage does get played. His favourite conversations circle the same questions: what intelligence is, where AI is taking us, and what makes a civilisation last.',
      'Warga means citizen, an ordinary person. That is the point of view of every film here: not an expert giving a lecture, but a citizen who reads the sources himself and shows what he found.',
    ],
  },
  topics: [
    { ms: 'Muzik', en: 'Music' }, { ms: 'Buku', en: 'Books' }, { ms: 'Falsafah', en: 'Philosophy' },
    { ms: 'Agama', en: 'Religion' }, { ms: 'AI', en: 'AI' }, { ms: 'Kecerdasan', en: 'Intelligence' },
    { ms: 'Peradaban', en: 'Civilisation' },
  ],
};

export const WORKFLOW = [
  {
    t: { ms: 'Satu soalan', en: 'One question' },
    d: { ms: 'Setiap filem bermula dengan satu soalan yang boleh dijawab oleh sumber, bukan dengan satu topik. "Siapa P. Ramlee?" terlalu luas. "Kenapa akhbar pagi itu menyebut dia masih membaca skrip?" boleh disiasat.', en: 'Every film starts with one question that sources can answer, not with a topic. "Who was P. Ramlee?" is too wide. "Why did that morning\'s paper say he was still reading a script?" can be investigated.' },
    tool: { ms: 'Buku nota', en: 'Notebook' },
  },
  {
    t: { ms: 'Sumber dahulu', en: 'Sources first' },
    d: { ms: 'Laporan rasmi, akhbar asal, kertas kajian dan arkib dikumpul sebelum satu ayat pun ditulis. Setiap dakwaan mendapat sumber dan tarikhnya. Apa yang tidak dapat disahkan dilabel belum disahkan.', en: 'Official reports, original newspapers, research papers and archives are gathered before a single line is written. Every claim gets its source and date. What cannot be confirmed is labelled unconfirmed.' },
    tool: { ms: 'Arkib · PDF · rujukan', en: 'Archives · PDFs · references' },
  },
  {
    t: { ms: 'Skrip', en: 'Script' },
    d: { ms: 'Skrip ditulis untuk telinga: ayat pendek, satu idea setiap ayat. Bab dibahagi supaya setiap satu menjawab sebahagian daripada soalan utama dan meninggalkan satu soalan baharu.', en: 'The script is written for the ear: short sentences, one idea each. Chapters are split so each one answers part of the main question and leaves a new one behind.' },
    tool: { ms: 'Mesin taip', en: 'Typewriter' },
  },
  {
    t: { ms: 'Suara', en: 'Voice' },
    d: { ms: 'Narasi dirakam dalam beberapa bahagian. Hanya senyap yang dipotong. Setiap perkataan diselaraskan dengan skrip supaya tipografi dan potongan boleh mengikut suara hingga ke suku kata.', en: 'The narration is recorded in parts. Only silence is cut. Every word is aligned to the script so type and cuts can follow the voice down to the syllable.' },
    tool: { ms: 'SM7B · Whisper', en: 'SM7B · Whisper' },
  },
  {
    t: { ms: 'Papan gaya', en: 'Style boards' },
    d: { ms: 'Sebelum sebarang render, setiap bahasa visual dibuktikan sebagai imej pegun: kolaj, CRT, papan split-flap, peta, studio. Tiada render bermula sebelum papan ini diluluskan.', en: 'Before any render, every visual language is proven as a still: collage, CRT, split-flap board, maps, the studio. No render starts until the boards are approved.' },
    tool: { ms: 'Still board', en: 'Still boards' },
  },
  {
    t: { ms: 'Dunia 3D', en: 'The 3D world' },
    d: { ms: 'Studio, narator dan rekonstruksi dibina dalam Blender, kebanyakannya dengan skrip Python: sebuah Learjet, sebuah dewan pusat data, sebuah projektor 16 mm. Rahang narator bergerak mengikut gelombang suaranya.', en: 'The studio, the narrator and the reconstructions are built in Blender, mostly by Python script: a Learjet, a data hall, a 16 mm projector. The narrator\'s jaw moves to the waveform of his own voice.' },
    tool: { ms: 'Blender · Python', en: 'Blender · Python' },
  },
  {
    t: { ms: 'Reka gerak', en: 'Motion design' },
    d: { ms: 'Kolaj analog untuk imej arkib, bingkai CRT 1:1 untuk rakaman resolusi rendah, papan split-flap untuk bab, three.js untuk sains, dan teks mesin taip sebagai ganti sari kata. Butiran filem dan film burn pada setiap bingkai.', en: 'Analog collage for archive images, 1:1 CRT frames for low-resolution footage, a split-flap board for chapters, three.js for the science, and typewriter text instead of subtitles. Film grain and film burn on every frame.' },
    tool: { ms: 'Enjin 2D · three.js', en: '2D engine · three.js' },
  },
  {
    t: { ms: 'Bunyi', en: 'Sound' },
    d: { ms: 'Klik pengatup pada potongan imej, dengung projektor di studio, keretak piring hitam pada tajuk. Muzik sentiasa di bawah suara. Adunan akhir disasarkan pada −14 LUFS.', en: 'A shutter click on image cuts, projector hum in the studio, vinyl crackle on titles. Music always sits under the voice. The final mix targets −14 LUFS.' },
    tool: { ms: '−14 LUFS · −1 dBTP', en: '−14 LUFS · −1 dBTP' },
  },
  {
    t: { ms: 'Semakan', en: 'Checking' },
    d: { ms: 'Setiap bahagian diimbas untuk bingkai hitam dan beku, dilihat pada helaian kontak, dan suara disemak semula perkataan demi perkataan. Kesilapan dibaiki dan hanya bahagian yang terjejas dirender semula.', en: 'Every chunk is scanned for black and frozen frames, viewed on contact sheets, and the voice is checked again word by word. Mistakes are fixed and only the affected chunks are rendered again.' },
    tool: { ms: 'Helaian kontak', en: 'Contact sheets' },
  },
  {
    t: { ms: 'Master 4K', en: '4K master' },
    d: { ms: 'Master 3840 × 2160 pada 60 bingkai sesaat, bersama thumbnail, bab, senarai sumber dan satu Short 59 saat. Kemudian filem itu keluar ke YouTube, dan soalan seterusnya bermula.', en: 'A 3840 × 2160 master at 60 frames a second, with thumbnails, chapters, the source list and a 59-second Short. Then the film goes to YouTube, and the next question begins.' },
    tool: { ms: '4K · 60 fps', en: '4K · 60 fps' },
  },
];

export const SCRIPTS = [
  {
    film: 'fl', date: '01 · 11 · 2026', place: 'GREENACRES, FLORIDA',
    idea: { ms: 'Bina semula 35 saat terakhir hanya daripada apa yang direkodkan: radio, data penerbangan, taklimat penyiasat. Label setiap tafsiran sebagai tafsiran.', en: 'Rebuild the last 35 seconds only from what was recorded: radio, flight data, investigator briefings. Label every interpretation as interpretation.' },
    lines: {
      ms: ['Sebuah pesawat sedang menjunam dari ketinggian 35,000 kaki.', 'Di ruang kokpit, juruterbang melaporkan kadar penurunan melebihi 20,000 kaki seminit.', 'Kemudian, satu mesej terakhir kedengaran melalui radio.', '[RADIO ATC] "We\'re out of time… we\'re out of time."', 'Ini bukan sekadar pesawat yang terhempas.'],
      en: ['An aircraft is diving from 35,000 feet.', 'In the cockpit, the pilot reports a descent rate above 20,000 feet a minute.', 'Then one last message comes over the radio.', '[ATC RADIO] "We\'re out of time… we\'re out of time."', 'This is not just an aircraft that crashed.'],
    },
  },
  {
    film: 'bt', date: '28 · 02 · 1991', place: 'WAWASAN 2020',
    idea: { ms: '"The Cloud has weight." Setiap janji dalam skrip mendapat pemberat fizikal di skrin: angka menjadi meter, slogan menjadi paip, awan menjadi bangunan di atas tanah.', en: '"The Cloud has weight." Every promise in the script gets a physical counterweight on screen: a number becomes a meter, a slogan becomes a pipe, a cloud becomes a building on the ground.' },
    lines: {
      ms: ['Setiap kali anda menaip soalan dalam ChatGPT, ribuan cip mula bekerja.', 'Haba naik. Sistem penyejukan berjalan. Elektrik terus mengalir.', 'Dokumentari ini bukan tentang sama ada AI baik atau buruk.', 'Ia tentang soalan yang lebih sukar: siapa yang membekalkan sumbernya?', '"The Cloud" tidak terapung di langit.'],
      en: ['Every time you type a question into ChatGPT, thousands of chips start working.', 'Heat rises. The cooling runs. The electricity keeps flowing.', 'This documentary is not about whether AI is good or bad.', 'It is about a harder question: who supplies the resources?', 'The Cloud does not float in the sky.'],
    },
  },
  {
    film: 'kk', date: '18 · 09 · 1958', place: 'FRESNO, CALIFORNIA',
    idea: { ms: 'Mula dengan satu bunyi: bip di kaunter. Tutup dengan bunyi yang sama. Di antaranya, tunjukkan setiap angka pada dokumen sebenar, dengan label yang betul.', en: 'Open on one sound: the beep at the counter. Close on the same sound. In between, show every number on the real document, with the right label.' },
    lines: {
      ms: ['Bunyi ini mengambil masa kurang daripada satu saat.', 'Beberapa minggu kemudian, penyata tiba.', 'Bakinya sepuluh ribu ringgit. Bayaran minimum, cuma lima ratus.', 'Berapa lama lagi kita akan membayar?', 'Satu bip, satu baki, tapi belum?'],
      en: ['This sound takes less than one second.', 'A few weeks later, the statement arrives.', 'The balance is ten thousand ringgit. The minimum payment, only five hundred.', 'How much longer will we be paying?', 'One beep, one balance, but not yet?'],
    },
  },
  {
    film: 'pr', date: '29 · 05 · 1973', place: 'KUALA LUMPUR',
    idea: { ms: 'Skrip ini tidak bertanya "siapa P. Ramlee". Soalannya lebih sempit: mengapa kita ingat cerita seorang lelaki yang ditinggalkan, sedangkan akhbar pagi itu menyebut dia masih membaca skrip? Helaian skrip menjadi motif yang kembali tiga kali.', en: 'This script does not ask "who was P. Ramlee". The question is narrower: why do we remember the story of a man left behind, when that morning\'s paper said he was still reading a script? The script page becomes a motif that returns three times.' },
    lines: {
      ms: ['Malam sebelumnya, dia masih membaca sebuah skrip.', '"Last night Ramlee was still looking over a script."', 'Jadi bagaimana kita lebih mengenali cerita tentang dia yang ditinggalkan?', 'Setiap dakwaan dalam filem ini ditunjukkan bersama sumbernya.', 'Perkara yang tidak dapat disahkan disebut sebagai belum disahkan.'],
      en: ['The night before, he was still reading a script.', '"Last night Ramlee was still looking over a script."', 'So how did we come to know the story of the man left behind better?', 'Every claim in this film is shown with its source.', 'What could not be confirmed is called unconfirmed.'],
    },
  },
];

export const BOOKS = [
  {
    id: 'skrip', color: '#D1140D', ink: '#EDE6D3',
    title: { ms: 'Cara Membina Skrip', en: 'How to Build a Script' },
    by: { ms: 'Buku kerja dokumentari', en: 'A documentary workbook' },
    pages: [
      { h: { ms: 'Mula dengan soalan', en: 'Start with a question' }, p: { ms: 'Topik bukan cerita. "Kad kredit" ialah topik. "Kenapa kad kredit buat kita rasa macam belum bayar?" ialah soalan, dan soalan memberi penonton sebab untuk terus menonton. Tulis soalan anda dalam satu ayat. Kalau ia tidak muat dalam satu ayat, anda masih memegang topik.', en: 'A topic is not a story. "Credit cards" is a topic. "Why does a credit card feel like we haven\'t paid yet?" is a question, and a question gives the viewer a reason to stay. Write yours in one sentence. If it will not fit in one sentence, you are still holding a topic.' } },
      { h: { ms: 'Kumpul sebelum menulis', en: 'Gather before you write' }, p: { ms: 'Baca sumber asal dahulu: laporan, akhbar pada hari kejadian, kertas kajian. Untuk setiap fakta, catat tiga perkara: apa yang dikatakan, siapa yang berkata, dan bila. Fakta tanpa tiga perkara ini belum boleh masuk skrip.', en: 'Read the original sources first: the report, the newspaper from the day, the research paper. For every fact, note three things: what was said, who said it, and when. A fact without those three is not ready for the script.' } },
      { h: { ms: 'Cari satu objek', en: 'Find one object' }, p: { ms: 'Skrip yang kuat ada satu benda yang kembali. Dalam filem P. Ramlee, bendanya ialah sehelai skrip. Dalam filem kad kredit, satu bunyi bip. Objek itu memegang cerita anda apabila angka dan tarikh mula bertimbun.', en: 'A strong script has one thing that comes back. In the P. Ramlee film it is a page of script. In the credit card film, a single beep. That object holds your story together when the dates and numbers start to pile up.' } },
      { h: { ms: 'Pembukaan 30 saat', en: 'The 30-second opening' }, p: { ms: 'Buka dengan satu detik yang konkrit: tarikh, tempat, satu perbuatan. Kemudian nyatakan percanggahan yang membuat soalan anda penting. Jangan perkenalkan diri, jangan terangkan apa yang akan anda terangkan. Penonton memutuskan dalam 30 saat.', en: 'Open on one concrete moment: a date, a place, an action. Then state the contradiction that makes your question matter. Do not introduce yourself and do not explain what you are about to explain. The viewer decides in 30 seconds.' } },
      { h: { ms: 'Bab sebagai anak tangga', en: 'Chapters as steps' }, p: { ms: 'Setiap bab menjawab satu bahagian soalan dan membuka satu soalan baharu. Beri setiap bab nama yang membuat orang ingin tahu, bukan label seperti "Latar belakang". Kalau sebuah bab boleh dibuang tanpa merosakkan bab selepasnya, buanglah.', en: 'Each chapter answers one part of the question and opens a new one. Give each a name that makes people curious, not a label like "Background". If a chapter can be removed without breaking the next one, remove it.' } },
      { h: { ms: 'Tulis untuk telinga', en: 'Write for the ear' }, p: { ms: 'Narasi didengar sekali sahaja. Gunakan ayat pendek, satu idea setiap ayat, dan letak perkataan paling penting di hujung. Baca dengan kuat. Di mana anda tersekat, penonton juga akan tersekat.', en: 'Narration is heard only once. Use short sentences, one idea each, and put the most important word at the end. Read it aloud. Where you stumble, the viewer will stumble too.' } },
      { h: { ms: 'Jujur tentang yang tidak diketahui', en: 'Be honest about what is unknown' }, p: { ms: 'Katakan "belum disahkan" apabila ia belum disahkan. Penonton memaafkan jawapan yang tidak lengkap, tetapi tidak memaafkan keyakinan yang palsu. Tutup dengan apa yang sudah diketahui, apa yang belum, dan soalan yang tinggal.', en: 'Say "unconfirmed" when it is unconfirmed. Viewers forgive an incomplete answer, but not false confidence. Close with what is known, what is not, and the question that remains.' } },
    ],
  },
  {
    id: 'lakon', color: '#14225e', ink: '#F2B01E',
    title: { ms: 'Menulis Lakon Layar yang Baik', en: 'Writing a Good Screenplay' },
    by: { ms: 'Catatan dari bilik suntingan', en: 'Notes from the edit room' },
    pages: [
      { h: { ms: 'Lakon layar ialah arahan', en: 'A screenplay is a set of instructions' }, p: { ms: 'Skrip narasi memberitahu apa yang didengar. Lakon layar memberitahu apa yang dilihat dan didengar, saat demi saat. Ia ditulis untuk orang yang akan membina filem itu, walaupun orang itu ialah anda sendiri enam minggu kemudian.', en: 'A narration script says what is heard. A screenplay says what is seen and heard, moment by moment. It is written for the person who will build the film, even when that person is you six weeks from now.' } },
      { h: { ms: 'Tunjuk, baru sebut', en: 'Show, then say' }, p: { ms: 'Kalau gambar boleh membawa maklumat itu, biar gambar yang membawanya. Narasi yang mengulang apa yang sudah kelihatan membazirkan dua saluran sekali gus. Tanya untuk setiap ayat: apa yang ada di skrin ketika ini, dan adakah ia menambah sesuatu?', en: 'If the picture can carry the information, let the picture carry it. Narration that repeats what is already visible wastes both channels at once. Ask of every line: what is on screen right now, and does it add anything?' } },
      { h: { ms: 'Setiap babak mengubah sesuatu', en: 'Every scene changes something' }, p: { ms: 'Babak yang baik bermula dengan satu keadaan dan berakhir dengan keadaan lain: penonton tahu lebih, atau percaya sesuatu yang berbeza, atau bimbang tentang perkara baharu. Kalau tiada apa yang berubah, itu bukan babak. Itu hiasan.', en: 'A good scene starts in one state and ends in another: the viewer knows more, or believes something different, or worries about something new. If nothing changes, it is not a scene. It is decoration.' } },
      { h: { ms: 'Dua lajur', en: 'Two columns' }, p: { ms: 'Tulis dalam dua lajur: gambar di kiri, bunyi di kanan, cap masa di tepi. Format ini memaksa anda memutuskan apa yang berlaku pada setiap baris narasi. Lajur gambar yang kosong ialah masalah yang lebih murah dibaiki di atas kertas.', en: 'Write in two columns: picture on the left, sound on the right, timecode at the side. The format forces you to decide what happens under every line of narration. An empty picture column is a problem that is cheaper to fix on paper.' } },
      { h: { ms: 'Beri setiap jenis maklumat satu rupa', en: 'Give each kind of information one look' }, p: { ms: 'Dalam filem Warga, fakta bersumber muncul sebagai dokumen sebenar yang disorot. Rakaman lama sentiasa berada dalam bingkai CRT. Air sentiasa sian, elektrik sentiasa ambar. Apabila rupa itu konsisten, penonton belajar kodnya tanpa diberitahu.', en: 'In a Warga film, a sourced fact appears as the real document with a highlight. Old footage always sits in a CRT frame. Water is always cyan, power is always amber. When the look is consistent, viewers learn the code without being told.' } },
      { h: { ms: 'Rentak dan senyap', en: 'Rhythm and silence' }, p: { ms: 'Tandakan jeda di dalam lakon layar. Selepas satu angka besar, biarkan 1.5 saat tanpa suara. Senyap ialah tempat penonton mengejar anda. Filem yang tidak pernah berhenti bercakap tidak memberi sesiapa masa untuk berfikir.', en: 'Mark the pauses in the screenplay. After a big number, leave 1.5 seconds without voice. Silence is where the viewer catches up with you. A film that never stops talking gives nobody time to think.' } },
      { h: { ms: 'Tulis semula dengan gunting', en: 'Rewrite with scissors' }, p: { ms: 'Draf pertama memberitahu anda apa ceritanya. Draf kedua membuang semua yang bukan cerita itu. Potong pengenalan yang memanaskan enjin, potong ayat yang anda sayang tetapi tidak diperlukan, dan periksa bahawa pengakhiran menjawab soalan pembukaan.', en: 'The first draft tells you what the story is. The second removes everything that is not that story. Cut the warm-up introduction, cut the line you love but do not need, and check that the ending answers the opening question.' } },
    ],
  },
  {
    id: 'filem', color: '#F2B01E', ink: '#0E1014',
    title: { ms: 'Panduan Membikin Filem', en: 'The Guide to Making Films' },
    by: { ms: 'Dari idea ke master', en: 'From idea to master' },
    pages: [
      { h: { ms: 'Mula dengan apa yang ada', en: 'Start with what you have' }, p: { ms: 'Warga Films ialah satu orang, satu komputer dan satu mikrofon. Kekangan ialah gaya: rakaman resolusi rendah menjadi bingkai CRT, imej internet menjadi kolaj kertas. Jangan tunggu peralatan. Putuskan apa yang peralatan anda boleh buat dengan baik.', en: 'Warga Films is one person, one computer and one microphone. Constraint becomes style: low-resolution footage becomes a CRT frame, internet images become paper collage. Do not wait for equipment. Decide what your equipment can do well.' } },
      { h: { ms: 'Pra-produksi ialah filemnya', en: 'Pre-production is the film' }, p: { ms: 'Skrip yang dikunci, senarai sumber, dan papan gaya yang diluluskan. Tiga perkara ini menentukan hampir segalanya. Setiap jam di sini menjimatkan sepuluh jam render. Jangan mula membina sebelum anda boleh menunjukkan filem itu sebagai dua puluh imej pegun.', en: 'A locked script, a source list, and approved style boards. Those three things decide almost everything. Every hour here saves ten hours of rendering. Do not start building until you can show the film as twenty stills.' } },
      { h: { ms: 'Suara dahulu', en: 'Voice first' }, p: { ms: 'Rakam narasi sebelum gambar. Suara menetapkan panjang, rentak dan nada, dan gambar dipotong mengikutnya. Rakam di bilik yang senyap, dekat dengan mikrofon, dan simpan nafas yang bermakna. Narasi yang jelas menyelamatkan gambar yang sederhana, tetapi tidak sebaliknya.', en: 'Record the narration before the pictures. The voice sets the length, the rhythm and the tone, and the pictures are cut to it. Record in a quiet room, close to the microphone, and keep the breaths that mean something. Clear narration saves average pictures, but never the other way round.' } },
      { h: { ms: 'Bahasa visual yang kecil', en: 'A small visual language' }, p: { ms: 'Pilih lima atau enam rawatan dan gunakan berulang kali: satu untuk arkib, satu untuk data, satu untuk peta, satu untuk narator. Satu palet, tiga fon. Filem yang menggunakan dua puluh gaya kelihatan seperti dua puluh filem.', en: 'Pick five or six treatments and use them again and again: one for archive, one for data, one for maps, one for the narrator. One palette, three typefaces. A film that uses twenty styles looks like twenty films.' } },
      { h: { ms: 'Bunyi ialah separuh gambar', en: 'Sound is half the picture' }, p: { ms: 'Setiap potongan patut ada bunyi: klik, geseran kertas, dengung bilik. Letak muzik di bawah suara dan turunkan lagi apabila angka penting disebut. Sasarkan −14 LUFS supaya filem anda sama kuat dengan filem di sebelahnya.', en: 'Every cut should have a sound: a click, paper sliding, room hum. Put the music under the voice and pull it lower when an important number is spoken. Aim for −14 LUFS so your film is as loud as the one next to it.' } },
      { h: { ms: 'Bina dalam ketulan', en: 'Build in chunks' }, p: { ms: 'Bahagikan filem kepada ketulan pendek dan render setiap satu secara berasingan. Apabila satu syot salah, anda membaiki satu ketulan, bukan seluruh filem. Simpan semua fail perantaraan sehingga master diluluskan.', en: 'Split the film into short chunks and render each one separately. When one shot is wrong, you fix one chunk, not the whole film. Keep every intermediate file until the master is approved.' } },
      { h: { ms: 'Semak seperti orang asing', en: 'Check like a stranger' }, p: { ms: 'Tonton dari awal hingga akhir tanpa berhenti, pada skrin kecil, dengan pembesar suara telefon. Catat di mana anda bosan dan di mana anda keliru. Kemudian semak setiap nama, tarikh dan angka sekali lagi dengan sumbernya.', en: 'Watch it start to finish without stopping, on a small screen, through a phone speaker. Note where you get bored and where you get lost. Then check every name, date and number against its source one more time.' } },
      { h: { ms: 'Terbit, kemudian belajar', en: 'Publish, then learn' }, p: { ms: 'Thumbnail dan tajuk ialah babak pertama filem anda, jadi bina beberapa pilihan dan uji. Sertakan sumber dalam penerangan. Selepas terbit, baca di mana penonton berhenti menonton. Itu nota untuk filem seterusnya.', en: 'The thumbnail and title are the first scene of your film, so build several and test them. Put your sources in the description. After release, look at where viewers stop watching. That is your note for the next film.' } },
    ],
  },
  {
    id: 'nota', color: '#EDE6D3', ink: '#D1140D',
    title: { ms: 'Buku Nota Pengasas', en: 'The Founder\'s Notebook' },
    by: { ms: 'Soalan, bukan jawapan', en: 'Questions, not answers' },
    pages: [
      { h: { ms: 'Tentang falsafah', en: 'On philosophy' }, p: { ms: 'Falsafah bermula apabila kita berhenti menerima sesuatu hanya kerana ia biasa. Soalan yang baik tidak membuat kita kelihatan bijak. Ia membuat kita kurang pasti, dan itu permulaan yang lebih jujur.', en: 'Philosophy starts when we stop accepting something only because it is familiar. A good question does not make us look clever. It makes us less certain, and that is a more honest place to begin.' } },
      { h: { ms: 'Tentang agama', en: 'On religion' }, p: { ms: 'Setiap tradisi menyimpan soalan yang sama tentang makna, kematian dan cara hidup bersama. Membacanya dengan hormat, termasuk tradisi yang bukan milik kita, ialah satu cara memahami manusia.', en: 'Every tradition keeps the same questions about meaning, death and how to live together. Reading them with respect, including the ones that are not ours, is one way of understanding people.' } },
      { h: { ms: 'Tentang AI', en: 'On AI' }, p: { ms: 'Mesin kini boleh menulis, melukis dan bercakap. Soalan yang menarik bukan sama ada ia pintar, tetapi apa yang kita mahu terus lakukan sendiri. Alat ini membina studio ini bersama saya. Soalannya tetap milik saya.', en: 'Machines can now write, draw and speak. The interesting question is not whether they are smart, but what we want to keep doing ourselves. These tools built this studio with me. The questions are still mine.' } },
      { h: { ms: 'Tentang kecerdasan', en: 'On intelligence' }, p: { ms: 'Kecerdasan bukan jumlah yang kita tahu. Ia ialah betapa cepat kita mengubah fikiran apabila bukti berubah. Orang yang paling saya hormati sering berkata "saya tidak pasti".', en: 'Intelligence is not how much we know. It is how quickly we change our mind when the evidence changes. The people I respect most often say "I am not sure".' } },
      { h: { ms: 'Tentang peradaban', en: 'On civilisation' }, p: { ms: 'Peradaban diukur melalui apa yang disimpannya: arkib, filem, surat khabar lama. Apabila sebuah masyarakat lupa menjaga rekodnya, orang lain akan menulis ceritanya. Itulah sebab studio ini wujud.', en: 'A civilisation is measured by what it keeps: archives, films, old newspapers. When a society forgets to look after its records, someone else writes its story. That is why this studio exists.' } },
    ],
  },
];

export const MERCH = [
  { id: 'tee', name: { ms: 'Baju-T Warga', en: 'Warga T-shirt' }, kind: { ms: 'Baju-T', en: 'T-shirt' },
    d: { ms: 'Kapas tebal warna krim dengan logo WARGA ■ FILMS di dada dan cop WF bulat di belakang. Potongan longgar, seperti baju kerja studio.', en: 'Heavy cream cotton with the WARGA ■ FILMS logo on the chest and the round WF stamp on the back. A loose cut, like a studio work shirt.' },
    spec: { ms: 'Kapas 240 gsm · krim atau arang', en: '240 gsm cotton · cream or charcoal' } },
  { id: 'hoodie', name: { ms: 'Hoodie "Persoalkan"', en: '"Question Everything" Hoodie' }, kind: { ms: 'Hoodie', en: 'Hoodie' },
    d: { ms: 'Hoodie arang dengan moto saluran dicetak merah: Persoalkan segala-galanya. Untuk malam render yang panjang.', en: 'A charcoal hoodie with the channel motto printed in red: Question everything. Made for long render nights.' },
    spec: { ms: 'Fleece berat · cetakan saring', en: 'Heavyweight fleece · screen print' } },
  { id: 'jacket', name: { ms: 'Jaket Crew', en: 'Crew Jacket' }, kind: { ms: 'Jaket', en: 'Jacket' },
    d: { ms: 'Jaket kerja yang dipakai narator di skrin: kain gelap, zip hadapan, tampalan WARGA FILMS dan pita nama "WARGA CREW". Tiada nama lain.', en: 'The work jacket the narrator wears on screen: dark cloth, front zip, a WARGA FILMS patch and a "WARGA CREW" name tape. No other name.' },
    spec: { ms: 'Twill kapas · tampalan sulam', en: 'Cotton twill · embroidered patches' } },
  { id: 'hat', name: { ms: 'Topi Lelaki Tanpa Nama', en: 'The No-Name Hat' }, kind: { ms: 'Topi', en: 'Hat' },
    d: { ms: 'Topi fedora hitam berbirai lebar, sama seperti yang ditinggalkan di atas meja narator. Reben gelap dengan satu petak merah kecil.', en: 'A black wide-brim fedora, the same one left on the narrator\'s desk. A dark ribbon with one small red square.' },
    spec: { ms: 'Felt bulu · satu saiz boleh laras', en: 'Wool felt · one adjustable size' } },
  { id: 'cap', name: { ms: 'Kep W■', en: 'W■ Cap' }, kind: { ms: 'Kep', en: 'Cap' },
    d: { ms: 'Kep enam panel dengan huruf W dan petak merah disulam di hadapan. Untuk hari di lokasi.', en: 'A six-panel cap with the W and the red square embroidered on the front. For days on location.' },
    spec: { ms: 'Twill kapas · tali laras logam', en: 'Cotton twill · metal strap' } },
  { id: 'disc', name: { ms: 'Cakera Koleksi', en: 'Collector\'s Disc' }, kind: { ms: 'Cakera', en: 'Disc' },
    d: { ms: 'Empat filem pertama pada satu cakera, bersama papan gaya, lakon layar dan rakaman di sebalik tabir. Sarung kertas berkolaj.', en: 'The first four films on one disc, with the style boards, screenplays and behind-the-scenes captures. A collaged paper sleeve.' },
    spec: { ms: '4 filem · 2 jam 9 minit', en: '4 films · 2 hours 9 minutes' } },
  { id: 'vhs', name: { ms: 'Pita VHS', en: 'VHS Tape' }, kind: { ms: 'VHS', en: 'VHS' },
    d: { ms: 'Setiap filem sebagai pita VHS dalam kotak kadbod, dengan label yang ditaip. Bolehkah ia dimainkan? Itu bergantung pada pemain di rumah datuk anda.', en: 'Each film as a VHS tape in a cardboard sleeve, with a typed label. Will it play? That depends on the deck at your grandfather\'s house.' },
    spec: { ms: 'Satu pita setiap filem · WF-001 hingga WF-004', en: 'One tape per film · WF-001 to WF-004' } },
];
