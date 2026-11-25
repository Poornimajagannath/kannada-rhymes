(function () {
  const MISSING = "Amma hasn’t recorded this one yet";
  const KEY = "samaya-kannada-rhymes";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const NUMBERS = [null,
    { kn: "Ondu", en: "one" },
    { kn: "Eradu", en: "two" },
    { kn: "Mooru", en: "three" },
  ];

  const FRIENDS = [
    { id: "ane", name: "Ane", what: "Mangoes", fruit: "mango", idle: "images/friends/ane-idle.webp", cheer: "images/friends/ane-cheer.webp", pose: "images/friends/ane-sad.webp", win: "images/friends/ane-win.webp", line: "Ane’s mangoes are up in the tree. Let’s count them into her basket!", winLine: "Five mangoes!" },
    { id: "myna", name: "Myna", what: "Apples", fruit: "apple", idle: "images/friends/myna-idle.webp", cheer: "images/friends/myna-cheer.webp", pose: "images/friends/myna-idle.webp", win: "images/friends/myna-cheer.webp", line: "Myna’s apples are up in the tree. Let’s count them into her basket!", winLine: "Five apples!" },
    { id: "kapi", name: "Kapi", what: "Bananas", fruit: "banana", idle: "images/friends/kapi-idle.webp", cheer: "images/friends/kapi-cheer.webp", pose: "images/friends/kapi-idle.webp", win: "images/friends/kapi-cheer.webp", line: "Kapi’s bananas are up in the tree. Let’s count them into her basket!", winLine: "Five bananas!" },
    { id: "ziggy", name: "Ziggy", what: "Balls", fruit: "ball", idle: "images/friends/ziggy-idle.webp", cheer: "images/friends/ziggy-cheer.webp", pose: "images/friends/ziggy-stand.webp", win: "images/friends/ziggy-cheer.webp", line: "Ziggy’s balls are in the yard. Let’s count them into the basket!", winLine: "Five balls!" },
  ];

  const SPOTS = [
    { id: 1, left: "64%", top: "20%" },
    { id: 2, left: "80%", top: "17%" },
    { id: 3, left: "72%", top: "29%" },
    { id: 4, left: "86%", top: "31%" },
    { id: 5, left: "76%", top: "40%" },
  ];

  const BACK = {
    week: "home",
    sing: "week",
    all: "week",
    gate: "home",
    parent: "home",
    mango: "home",
    pick: "mango",
    count: "pick",
    win: "home",
    blocks: "home",
    together: "blocks",
  };

  const state = {
    screen: "home",
    from: "home",
    rhymeId: "aane-banthondu-aane",
    chunk: 0,
    playing: false,
    chunkPlay: false,
    atBlank: false,
    clap: null,
    family: null,
    friend: "ane",
    found: [],
    blocks: 1,
    joined: false,
    nav: false,
  };

  const audioCache = Object.create(null);
  const audio = new Audio();
  audio.preload = "none";
  let tickOn = false;
  let loadedUrl = "";
  let holdingEl = null;
  let holdTimer = 0;

  const app = document.getElementById("app");
  const views = document.getElementById("views");

  const iconBack = `<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M14.5 5.5 8 12l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const iconNext = `<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M9.5 5.5 16 12l-6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const iconPlay = `<svg class="icon-play" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M8 5.5v13l11-6.5L8 5.5z" fill="currentColor"/></svg>`;
  const iconPause = `<svg class="icon-pause" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><rect x="6" y="5" width="4.2" height="14" rx="1.2" fill="currentColor"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.2" fill="currentColor"/></svg>`;
  const iconNote = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M9 17.5a2.5 2.5 0 1 1-2-2.45V6.8l10-2v8.2a2.5 2.5 0 1 1-2-2.45V7.2l-6 1.2v9.1z" fill="currentColor"/></svg>`;

  function rhyme() {
    return window.RHYMES.find((item) => item.id === state.rhymeId) || window.RHYMES[0];
  }

  function wholeOf(id) {
    return (window.WHOLE || []).find((item) => item.id === id) || { lines: [] };
  }

  function friend() {
    return FRIENDS.find((item) => item.id === state.friend) || FRIENDS[0];
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if (saved && window.RHYMES.some((item) => item.id === saved.rhymeId)) state.rhymeId = saved.rhymeId;
    } catch (err) { /* keep this week’s default */ }
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify({ rhymeId: state.rhymeId }));
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function knownAudio(id) {
    return Object.prototype.hasOwnProperty.call(audioCache, id) ? audioCache[id] : undefined;
  }

  async function findAudio(id) {
    if (Object.prototype.hasOwnProperty.call(audioCache, id)) return audioCache[id];
    for (const ext of ["m4a", "mp3"]) {
      const url = new URL(`audio/${id}.${ext}`, document.baseURI).href;
      const probe = new URL(url);
      probe.searchParams.set("probe", "1");
      try {
        const res = await fetch(probe.href, {
          method: "GET",
          cache: "no-store",
          headers: { Range: "bytes=0-15" },
        });
        if (res.body) res.body.cancel();
        if (res.ok) {
          audioCache[id] = url;
          return url;
        }
      } catch (err) { /* try the other extension */ }
    }
    audioCache[id] = null;
    return null;
  }

  function prime(url) {
    if (loadedUrl === url) return;
    const source = document.createElement("source");
    source.src = url;
    source.type = url.endsWith(".m4a") ? "audio/mp4" : "audio/mpeg";
    audio.replaceChildren(source);
    audio.load();
    loadedUrl = url;
  }

  function stopAudio() {
    audio.pause();
    tickOn = false;
    state.playing = false;
    state.chunkPlay = false;
  }

  function singStatus() {
    const item = rhyme();
    if (knownAudio(item.id) === null) return MISSING;
    if (state.playing) {
      const spec = state.chunkPlay && item.audioChunks && item.audioChunks[state.chunk];
      return spec ? "Playing — will pause at the blank" : "Playing the whole song";
    }
    if (state.atBlank) return "Paused at the blank for Samaya";
    return "Amma’s voice";
  }

  function partsHtml(parts) {
    return parts.map((part) => (part.br ? "<br>" : escapeHtml(part.blank || part.text || ""))).join("");
  }

  function backButton(label) {
    return `<button class="back" type="button" data-back aria-label="${label}">${iconBack}</button>`;
  }

  function voiceButton(from) {
    const on = state.playing;
    const visual = on ? "Pause" : "Play Amma’s voice";
    const aria = on ? "Pause Amma’s voice" : "Play Amma’s voice";
    return `<button class="btn btn-kumkum${on ? " is-playing" : ""}" id="voiceBtn" type="button" data-audio="${from}" aria-pressed="${on}" aria-label="${aria}"><span class="icon-swap" aria-hidden="true">${iconPlay}${iconPause}</span><span class="voice-label">${visual}</span></button>`;
  }

  function stars(highOnly) {
    const dots = [[14, 12], [72, 8], [40, 22], [88, 18], [22, 36], [60, 44], [8, 58], [80, 62], [30, 74], [66, 82], [48, 30], [16, 88]];
    const shown = highOnly ? dots.filter(([, y]) => y < 52) : dots;
    return `<div class="stars" aria-hidden="true">${shown.map(([x, y], i) => `<span class="star star-twinkle" style="left:${x}%;top:${y}%;animation-delay:${i * 0.28}s"></span>`).join("")}</div>`;
  }

  function earth(id) {
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="${id}" cx="36%" cy="32%" r="70%"><stop offset="0%" stop-color="#9ad7ff"/><stop offset="45%" stop-color="#3b8fd4"/><stop offset="100%" stop-color="#1a4d86"/></radialGradient></defs><circle cx="50" cy="50" r="47" fill="url(#${id})"/><path d="M18 48c10-8 18-6 28-2 8 4 14-2 22-8 6 8 4 16-2 22-8 8-20 10-32 4-8-4-14-8-16-16z" fill="#3fae6a"/><path d="M60 30c8 2 16 8 14 16-6 2-10-2-14-8z" fill="#2f8a52"/></svg>`;
  }

  function fruitSvg(kind) {
    if (kind === "apple") return `<svg viewBox="0 0 80 88" aria-hidden="true"><circle cx="40" cy="52" r="26" fill="#d23b2a"/><ellipse cx="30" cy="42" rx="8" ry="5" fill="#f4a090" opacity=".8"/><path d="M40 26c6-8 14-8 12 0" fill="#0f7a43"/><path d="M40 28c1-10 8-14 12-10" fill="none" stroke="#6b3a1e" stroke-width="3" stroke-linecap="round"/></svg>`;
    if (kind === "banana") return `<svg viewBox="0 0 80 88" aria-hidden="true"><path d="M20 28c10 18 16 34 30 40 12 4 20-4 16-12-8 6-18 2-24-8-8-14-14-28-20-36-2-4-6 0-2 16z" fill="#f2c14e"/><path d="M22 24c8-8 12-4 6 4" fill="#0f7a43"/></svg>`;
    if (kind === "ball") return `<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="28" fill="#e8871a"/><path d="M14 40h52M40 12c10 12 10 44 0 56M40 12c-10 12-10 44 0 56" fill="none" stroke="#3a1208" stroke-width="2.4"/></svg>`;
    return `<svg viewBox="0 0 80 88" aria-hidden="true"><path d="M44 18c18 6 30 24 26 42-4 20-22 30-38 26C14 82 8 62 14 44 20 28 30 16 44 18z" fill="#f0a020"/><path d="M28 40c8-10 20-14 30-10-4 8-12 12-22 14-4 0-8-2-8-4z" fill="#f7c14a"/><path d="M48 10c10-2 16 6 12 14-8 2-14 0-18-6-2-4 0-8 6-8z" fill="#0f7a43"/><path d="M54 8c1-6 8-10 12-6" fill="none" stroke="#6b3a1e" stroke-width="3" stroke-linecap="round"/></svg>`;
  }

  function renderHome(_item, enter) {
    return `<section class="view${enter}"><div class="stage">
      <header class="home-title">
        <img class="home-mark" src="images/friends/ane-idle.webp" alt="">
        <p class="kicker">For</p>
        <h1 class="display-lg">Samaya</h1>
      </header>
      <div class="doors">
        <button class="door" type="button" data-go="week">
          <img class="door-photo" src="images/aane.jpg" alt="">
          <span class="door-wash"></span>
          <span class="door-label">Rhymes</span>
        </button>
        <button class="door" type="button" data-go="mango">
          <img class="door-yard" src="images/friends/bg-backyard.webp" alt="">
          <img class="door-pal" src="images/friends/ane-cheer.webp" alt="">
          <span class="door-wash door-wash-green"></span>
          <span class="door-label">Mangoes</span>
        </button>
        <button class="door" type="button" data-go="blocks" data-reset="1">
          <span class="door-sky">${stars(true)}<span class="planet">${earth("door-earth")}</span></span>
          <span class="door-label">Blocks</span>
        </button>
      </div>
      <button class="hold" type="button" data-hold="gate" aria-label="Hold for Amma">
        <svg width="44" height="44" viewBox="0 0 36 36" aria-hidden="true">
          <circle class="ring-track" cx="18" cy="18" r="16"/>
          <circle class="ring-fill" cx="18" cy="18" r="16" transform="rotate(-90 18 18)"/>
          <circle class="ring-dot" cx="18" cy="18" r="3.5"/>
        </svg>
      </button>
    </div></section>`;
  }

  function renderWeek(item, enter) {
    const others = window.RHYMES.filter((entry) => entry.id !== item.id);
    const row = others.map((entry) => `<button class="thumb-btn" type="button" data-rhyme="${entry.id}"><span class="thumb"><img src="${entry.image}" alt="">${badge(entry.id)}</span><span class="thumb-name">${escapeHtml(entry.short)}</span></button>`).join("");
    return `<section class="view${enter}">
      <div class="stage">
        ${backButton("Home")}
        <p class="kicker">This week</p>
        <h1>${escapeHtml(item.title)}</h1>
        <button class="hero" type="button" data-go="sing" aria-label="${escapeHtml(item.title)} picture"><img src="${item.image}" alt="${escapeHtml(item.alt)}"></button>
        <div class="stack">
          ${voiceButton("week")}
          <button class="btn btn-cream" type="button" data-go="sing">Let’s sing</button>
        </div>
        <p class="note" id="missingNote" hidden>${MISSING}</p>
        <div class="more-head"><p>More rhymes</p><button class="linkish" type="button" data-go="all">See all</button></div>
        <div class="more-row">${row}</div>
      </div>
      <div class="below">
        <button class="btn btn-cream" type="button" data-go="words">Play with the words</button>
        <button class="btn btn-cream" type="button" data-go="story">Tell the story</button>
      </div>
    </section>`;
  }

  function badge(id) {
    return `<span class="badge" data-badge="${id}" hidden>${iconNote}</span>`;
  }

  function renderSing(item, enter) {
    const chunk = item.chunks[state.chunk] || item.chunks[0];
    const first = chunk[0];
    const second = chunk[1];
    return `<section class="view${enter}"><div class="stage">
      ${backButton("This week’s rhyme")}
      <p class="kicker">Sing with me</p>
      <h1>${escapeHtml(item.title)}</h1>
      <div class="hero"><img src="${item.image}" alt="${escapeHtml(item.alt)}"></div>
      <article class="lyric-card">
        <p class="kicker" id="chunkStatus">${escapeHtml(singStatus())}</p>
        <p class="lyric" lang="kn-Latn">${partsHtml(first.parts)}</p>
        ${second ? `<p class="lyric-next" lang="kn-Latn">${partsHtml(second.parts)}</p>` : ""}
      </article>
      <div class="stack">${voiceButton("sing")}</div>
      <p class="note" id="missingNote" hidden>${MISSING}</p>
      <div class="chunk-nav">
        <button class="btn btn-cream" type="button" data-chunk="-1"${state.chunk === 0 ? " disabled" : ""}>Earlier</button>
        <button class="btn btn-cream" type="button" data-chunk="1"${state.chunk >= item.chunks.length - 1 ? " disabled" : ""}>Next lines</button>
      </div>
      <p class="part">Part ${state.chunk + 1} of ${item.chunks.length}</p>
      <button class="linkish" type="button" data-go="lines" style="width:100%">See whole rhyme</button>
    </div></section>`;
  }

  function renderAll(_item, enter) {
    const cards = window.RHYMES.map((item) => {
      const on = item.id === state.rhymeId;
      return `<button class="rhyme-card" type="button" data-rhyme="${item.id}">
        <span class="rhyme-art"><img src="${item.image}" alt="">${on ? `<span class="pill">This week</span>` : ""}${badge(item.id)}</span>
        <span class="rhyme-copy"><strong>${escapeHtml(item.short)}</strong><span data-recorded="${item.id}"></span></span>
      </button>`;
    }).join("");
    return `<section class="view${enter}"><div class="scroll-page">
      ${backButton("This week’s rhyme")}
      <h1>All rhymes</h1>
      <div class="grid" style="margin-top:14px">${cards}</div>
    </div></section>`;
  }

  function renderGate(_item, enter) {
    return `<section class="view${enter}"><div class="stage gate">
      <p class="kicker">Amma</p>
      <h1>Hold to open</h1>
      <button class="hold-lg" type="button" data-hold="parent" aria-label="Hold to open the parent corner">
        <svg width="140" height="140" viewBox="0 0 132 132" aria-hidden="true">
          <circle class="ring-track" cx="66" cy="66" r="54"/>
          <circle class="ring-fill" cx="66" cy="66" r="54" transform="rotate(-90 66 66)"/>
          <circle class="ring-dot" cx="66" cy="66" r="10"/>
        </svg>
      </button>
      <p class="keep">Keep holding. Samaya’s games stay closed.</p>
      <button class="linkish back-text" type="button" data-back>Back to Samaya</button>
    </div></section>`;
  }

  function renderParent(item, enter) {
    const rows = window.RHYMES.slice().sort((a, b) => {
      const rank = (entry) => (knownAudio(entry.id) ? 0 : 1);
      return rank(a) - rank(b) || window.RHYMES.indexOf(a) - window.RHYMES.indexOf(b);
    }).map((entry) => {
      const known = knownAudio(entry.id);
      const yes = !!known;
      const label = known === undefined ? "" : yes ? "Recorded" : "Not yet";
      return `<li class="clip"><b>${escapeHtml(entry.short)}</b><span class="tag ${yes ? "yes" : "no"}" data-clip="${entry.id}">${label}</span></li>`;
    }).join("");
    const voice = knownAudio(item.id);
    const lede = voice ? "Amma’s voice is on this one. Sing it again this week." : voice === null ? MISSING : "Checking this week’s recording.";
    return `<section class="view${enter}"><div class="scroll-page">
      ${backButton("Home")}
      <p class="kicker">For Amma</p>
      <h1>Parent corner</h1>
      <section class="card" style="margin-top:14px">
        <p class="kicker">This week</p>
        <h2>${escapeHtml(item.title)}</h2>
        <p class="lede">${lede}</p>
      </section>
      <section class="card">
        <p class="kicker">Voice clips</p>
        <ul style="list-style:none;margin-top:6px">${rows}</ul>
      </section>
      <section class="card">
        <p class="kicker">Her apps</p>
        <div class="apps">
          <p><strong>Rhymes.</strong> One song a week, words in English letters, some in Amma’s voice.</p>
          <p><strong>Mangoes.</strong> Tap five things into a basket with Ane, Myna, Kapi, or Ziggy.</p>
          <p><strong>Blocks.</strong> A quiet space count, with Kannada numbers. Not a backyard game.</p>
          <p><strong>Shlokas.</strong> Lives on its own page. Gajaananam is waiting for a recording.</p>
        </div>
      </section>
      <section class="card">
        <p class="kicker">Practice</p>
        <div class="stack">
          <button class="btn btn-cream" type="button" data-go="lines">See whole rhyme</button>
          <button class="btn btn-cream" type="button" data-go="words">Play with the words</button>
          <button class="btn btn-cream" type="button" data-go="story">Tell the story</button>
        </div>
      </section>
    </div></section>`;
  }

  function renderLines(item, enter) {
    const pack = wholeOf(item.id);
    const lines = pack.lines.map((line, index) => `<li class="whole-line" data-whole-line><span class="whole-num">${index + 1}</span><p class="whole-text">${escapeHtml(line.text)}</p></li>`).join("");
    return `<section class="view${enter}"><div class="scroll-page">
      ${backButton("Back")}
      <p class="kicker">All the lines</p>
      <h1>${escapeHtml(item.title)}</h1>
      <ol class="whole-list">${lines}</ol>
    </div></section>`;
  }

  function renderWords(item, enter) {
    const clapIndex = state.clap == null ? item.defaultClap : state.clap;
    const clap = item.claps[clapIndex];
    const buttons = clap.pieces.map((piece) => `<button class="clap" type="button" aria-label="Clap ${escapeHtml(piece)}">${escapeHtml(piece)}</button>`).join("");
    const chips = item.claps.map((word, index) => `<button class="wchip${index === clapIndex ? " on" : ""}" type="button" data-word="${index}">${escapeHtml(word.pieces.join("-"))}</button>`).join("");
    const families = item.families.map((family, familyIndex) => {
      const twins = family.words.map((word, wordIndex) => {
        const key = family.solo ? `${familyIndex}:${wordIndex}` : `${familyIndex}`;
        const on = state.family === key ? " is-pop" : "";
        return `<button class="twin${word.wide ? " wide" : ""}${on}" type="button" data-family="${familyIndex}" data-twin="${wordIndex}">${escapeHtml(word.w)}</button>`;
      }).join("");
      return `<section class="card"><div class="twins-head"><h2>${escapeHtml(family.title || "Rhyme twins")}</h2><p>${escapeHtml(family.note || "they sound the same at the end")}</p></div><div class="twin-row">${twins}</div></section>`;
    }).join("");
    return `<section class="view${enter}"><div class="scroll-page">
      ${backButton("Back")}
      <h1>Play with the words</h1>
      <p class="aside">Noticing, not a quiz</p>
      <section class="card" style="margin-top:12px">
        <div class="play-top"><div class="mini-art"><img src="${item.image}" alt=""></div><div><p class="hop">${escapeHtml(clap.say)}</p><p class="aside">${escapeHtml(clap.aside || "clap along")}</p></div></div>
        <div class="claps">${buttons}</div>
        <div class="word-row">${chips}</div>
      </section>
      ${families}
    </div></section>`;
  }

  function renderStory(item, enter) {
    const steps = item.steps.map((step, index) => `<article class="scard"><div class="num">${index + 1}</div><p>${escapeHtml(step.w)}</p></article>`).join("");
    return `<section class="view${enter}"><div class="scroll-page">
      ${backButton("Back")}
      <h1>Tell the story</h1>
      <p class="aside">${escapeHtml(item.storyNote)}</p>
      <p class="aside">${escapeHtml(item.gesture)}</p>
      <div class="story-art"><img src="${item.image}" alt="${escapeHtml(item.alt)}"></div>
      <div class="steps">${steps}</div>
      <section class="card speak">
        <p class="kicker">You say it</p>
        <p class="speak-q">${escapeHtml(item.speak.prompt)}</p>
        <button class="answer-chip" type="button">${escapeHtml(item.speak.answer)}</button>
      </section>
    </div></section>`;
  }

  function renderMango(_item, enter) {
    const who = friend();
    return `<section class="view scene${enter}">
      <img class="scene-bg" src="images/friends/bg-backyard.webp" alt="">
      <div class="scene-ui">
        ${backButton("Home")}
        <div style="flex:1"></div>
        <img class="pal bob" src="${who.pose}" alt="">
        <p class="bubble">${escapeHtml(who.line)}</p>
        <div class="stack"><button class="btn btn-mango" type="button" data-go="pick">Let’s count!</button></div>
      </div>
    </section>`;
  }

  function renderPick(_item, enter) {
    const cards = FRIENDS.map((who) => `<button class="friend" type="button" data-friend="${who.id}"><img src="${who.idle}" alt=""><strong>${who.name}</strong><span>${who.what}</span></button>`).join("");
    return `<section class="view scene${enter}">
      <img class="scene-bg" src="images/friends/bg-backyard.webp" alt="">
      <div class="scene-ui">
        ${backButton("Story")}
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:14px">
          <p class="bubble">Who are we counting with?</p>
          <div class="friend-grid">${cards}</div>
        </div>
      </div>
    </section>`;
  }

  function renderCount(_item, enter) {
    const who = friend();
    const left = SPOTS.filter((spot) => !state.found.includes(spot.id));
    const fruits = left.map((spot) => `<button class="fruit" type="button" data-fruit="${spot.id}" aria-label="${who.what.slice(0, -1)}" style="left:${spot.left};top:${spot.top}">${fruitSvg(who.fruit)}</button>`).join("");
    const picked = state.found.map((id, index) => `<span class="basket-fruit" style="left:${18 + index * 14}%">${fruitSvg(who.fruit)}</span>`).join("");
    return `<section class="view scene${enter}">
      <img class="scene-bg" src="images/friends/bg-backyard.webp" alt="">
      <div class="scene-ui">
        <div class="scene-head">
          ${backButton("Pick a friend")}
          <p class="score"><span class="score-fruit">${fruitSvg(who.fruit)}</span>${state.found.length}/5</p>
        </div>
      </div>
      ${fruits}
      <img class="cast bob" src="${who.idle}" alt="">
      <div class="basket-wrap">
        ${picked}
        <svg viewBox="0 0 320 140" aria-hidden="true"><path d="M70 28c40-20 140-20 180 0" fill="none" stroke="#8a4e1c" stroke-width="10" stroke-linecap="round"/><path d="M40 48h240l-16 72c-4 14-16 20-36 20H92c-20 0-32-6-36-20L40 48z" fill="#c47a32"/><path d="M54 64h212" stroke="#f2c14e" stroke-width="5" stroke-linecap="round" opacity=".7"/></svg>
      </div>
    </section>`;
  }

  function renderWin(_item, enter) {
    const who = friend();
    return `<section class="view scene${enter}">
      <img class="scene-bg" src="images/friends/bg-backyard.webp" alt="">
      <div class="scene-ui">
        <div class="scene-head">${backButton("Home")}<p class="score">5/5</p></div>
        <div style="flex:1"></div>
        <img class="pal bob" src="${who.win}" alt="">
        <p class="bubble">${escapeHtml(who.winLine)}</p>
        <div class="stack">
          <button class="btn btn-mango" type="button" data-go="count">Play again</button>
          <button class="btn btn-cream" type="button" data-go="pick">Another friend</button>
        </div>
      </div>
    </section>`;
  }

  function planet(name, fill) {
    return `<svg width="100" height="100" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="${fill}"/></svg>`;
  }

  function renderBlocks(_item, enter) {
    const word = NUMBERS[state.blocks] || NUMBERS[1];
    const built = [
      { name: "Mercury", node: planet("Mercury", "#c5ccd6"), show: state.blocks >= 1 },
      { name: "Venus", node: planet("Venus", "#e0a15a"), show: state.blocks >= 2 },
      { name: "Earth", node: earth("block-earth"), show: state.blocks >= 3 },
    ].filter((item) => item.show);
    const planets = built.slice().reverse().map((item) => `<div><div style="width:${item.name === "Earth" ? 112 : item.name === "Venus" ? 100 : 88}px;margin:0 auto">${item.node}</div><p class="planet-label">${item.name}</p></div>`).join("");
    const add = state.blocks < 3 ? `<button class="add" type="button" data-add aria-label="Add one">+</button>` : "";
    return `<section class="view night${enter}"><div class="stage" style="background:transparent">
      ${stars()}
      <div class="night-head">
        ${backButton("Home")}
        <div><p class="count-num">${state.blocks}</p><p class="count-word">${word.kn}</p><p class="count-en">${word.en}</p></div>
        <button class="sq" type="button" data-go="together" aria-label="Next">${iconNext}</button>
      </div>
      <div class="stack-planets">${add}${planets}</div>
      <p class="build">Build 3.</p>
    </div></section>`;
  }

  function star(size) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true"><path d="M32 6l7.2 16.4L57 25.2 42.6 36.2 47 54 32 44.8 17 54l4.4-17.8L7 25.2l17.8-2.8L32 6z" fill="#f2c14e"/></svg>`;
  }

  function renderTogether(_item, enter) {
    const group = (count) => `<div class="star-row">${Array.from({ length: count }, () => star(64)).join("")}</div>`;
    const body = state.joined
      ? `<div><div class="star-row">${Array.from({ length: 5 }, (_, i) => star(i === 2 ? 84 : 64)).join("")}</div><p class="made">3 and 2 make 5</p></div>`
      : `<div class="star-row">${group(3)}<p class="join-word">and</p>${group(2)}</div>`;
    const foot = state.joined
      ? `<p class="build">Five together.</p>`
      : `<p class="build">Tap to join.</p><button class="btn btn-gold" type="button" data-join>Join</button>`;
    return `<section class="view night${enter}"><div class="stage" style="background:transparent">
      <div class="night-head" style="grid-template-columns:64px 1fr 64px">
        ${backButton("Blocks")}
        <h1 style="text-align:center;font-size:var(--display)">Together</h1>
        <span></span>
      </div>
      <div class="stack-planets" style="justify-content:center">${body}</div>
      ${foot}
    </div></section>`;
  }

  const screens = {
    home: renderHome,
    week: renderWeek,
    sing: renderSing,
    all: renderAll,
    gate: renderGate,
    parent: renderParent,
    lines: renderLines,
    words: renderWords,
    story: renderStory,
    mango: renderMango,
    pick: renderPick,
    count: renderCount,
    win: renderWin,
    blocks: renderBlocks,
    together: renderTogether,
  };

  function render() {
    const item = rhyme();
    const enter = state.nav && !reduce ? " is-enter" : "";
    app.dataset.screen = state.screen;
    const theme = document.querySelector('meta[name="theme-color"]');
    const night = state.screen === "blocks" || state.screen === "together";
    if (theme) theme.setAttribute("content", night ? "#071E36" : "#FFD15C");
    views.innerHTML = (screens[state.screen] || renderHome)(item, enter);
    if (state.nav) views.scrollTop = 0;
    paintRecorded();
  }

  function go(screen, opts = {}) {
    if (!opts.keepAudio) stopAudio();
    if (opts.from) state.from = opts.from;
    if (screen === "count" && state.screen !== "count") state.found = [];
    if (screen === "together" && state.screen !== "together") state.joined = false;
    if (screen === "blocks" && opts.reset) state.blocks = 1;
    state.screen = screen;
    state.nav = !opts.quiet;
    render();
    state.nav = false;
  }

  function back() {
    const screen = state.screen;
    let dest = BACK[screen] || "home";
    if (screen === "lines" || screen === "words" || screen === "story") dest = state.from || "week";
    const keep = (screen === "sing" && dest === "week") || (screen === "lines" && dest === "sing" && state.playing);
    go(dest, { keepAudio: keep });
  }

  function paintRecorded() {
    document.querySelectorAll("[data-recorded]").forEach((el) => {
      const known = knownAudio(el.dataset.recorded);
      if (known === undefined) return;
      el.textContent = known ? "Amma’s voice" : "Not yet";
      el.classList.toggle("is-rec", !!known);
      el.classList.toggle("is-wait", !known);
    });
    document.querySelectorAll("[data-badge]").forEach((el) => {
      el.hidden = !knownAudio(el.dataset.badge);
    });
    document.querySelectorAll("[data-clip]").forEach((el) => {
      const known = knownAudio(el.dataset.clip);
      if (known === undefined) return;
      el.textContent = known ? "Recorded" : "Not yet";
      el.classList.toggle("yes", !!known);
      el.classList.toggle("no", !known);
    });
    const note = document.getElementById("missingNote");
    const known = knownAudio(rhyme().id);
    if (note && known !== undefined) note.hidden = known !== null;
  }

  function paintPlaying() {
    const on = state.playing;
    document.querySelectorAll("[data-audio]").forEach((btn) => {
      btn.classList.toggle("is-playing", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.setAttribute("aria-label", on ? "Pause Amma’s voice" : "Play Amma’s voice");
      const text = btn.querySelector(".voice-label");
      if (text) text.textContent = on ? "Pause" : "Play Amma’s voice";
    });
    const status = document.getElementById("chunkStatus");
    if (status) status.textContent = singStatus();
  }

  function showMissing() {
    stopAudio();
    state.atBlank = false;
    const note = document.getElementById("missingNote");
    if (note) note.hidden = false;
    const status = document.getElementById("chunkStatus");
    if (status) status.textContent = MISSING;
    paintPlaying();
  }

  async function toggleAudio(from) {
    const item = rhyme();
    const known = knownAudio(item.id);
    const url = known !== undefined ? known : await findAudio(item.id);
    if (!url) {
      showMissing();
      return;
    }
    if (state.playing && loadedUrl === url) {
      stopAudio();
      state.atBlank = false;
      paintPlaying();
      return;
    }
    stopAudio();
    prime(url);
    const spec = from === "sing" ? item.audioChunks && item.audioChunks[state.chunk] : null;
    state.chunkPlay = !!spec;
    state.atBlank = false;
    if (spec) {
      tickOn = true;
      const start = Number(spec.start) || 0;
      const seek = () => { try { audio.currentTime = start; } catch (err) { /* metadata not ready yet */ } };
      if (audio.readyState >= 1) seek();
      else audio.addEventListener("loadedmetadata", seek, { once: true });
    }
    const pending = audio.play();
    state.playing = true;
    paintPlaying();
    pending.then(() => {
      if (from === "week" && state.playing && state.screen === "week") go("sing", { keepAudio: true });
    }).catch(() => {
      stopAudio();
      paintPlaying();
    });
  }

  function setRhyme(id) {
    if (!window.RHYMES.some((item) => item.id === id)) return;
    if (id !== state.rhymeId) {
      stopAudio();
      state.rhymeId = id;
      state.chunk = 0;
      state.clap = null;
      state.family = null;
      state.atBlank = false;
      save();
    }
    go("sing");
  }

  function startHold(btn, event) {
    if (holdingEl) return;
    if (event.button != null && event.button !== 0) return;
    holdingEl = btn;
    try { btn.setPointerCapture(event.pointerId); } catch (err) { /* synthetic clicks still count */ }
    btn.classList.add("is-holding");
    holdTimer = window.setTimeout(() => {
      const dest = btn.dataset.hold;
      cancelHold();
      if (dest) go(dest);
    }, 1000);
  }

  function cancelHold() {
    if (holdingEl) holdingEl.classList.remove("is-holding");
    holdingEl = null;
    window.clearTimeout(holdTimer);
  }

  audio.addEventListener("timeupdate", () => {
    if (!tickOn || !state.playing) return;
    const spec = rhyme().audioChunks && rhyme().audioChunks[state.chunk];
    if (!spec) return;
    const stopAt = spec.pauseAt != null ? Number(spec.pauseAt) : Number(spec.end);
    if (!Number.isFinite(stopAt)) return;
    if (audio.currentTime >= stopAt - 0.05) {
      const atBlank = spec.pauseAt != null;
      stopAudio();
      state.atBlank = atBlank;
      paintPlaying();
    }
  });

  audio.addEventListener("ended", () => {
    stopAudio();
    state.atBlank = false;
    paintPlaying();
  });

  document.addEventListener("click", (event) => {
    const target = event.target.closest("button");
    if (!target || target.disabled) return;
    if (target.dataset.back != null) back();
    else if (target.dataset.go) {
      const dest = target.dataset.go;
      const from = state.screen;
      if (dest === "lines") go("lines", { keepAudio: true, from });
      else if (dest === "words" || dest === "story") go(dest, { from });
      else if (dest === "blocks") go("blocks", { reset: true });
      else if (dest === "sing" && from === "week") go("sing", { keepAudio: true });
      else go(dest);
    } else if (target.dataset.rhyme) setRhyme(target.dataset.rhyme);
    else if (target.dataset.audio) toggleAudio(target.dataset.audio);
    else if (target.dataset.chunk) {
      const next = state.chunk + Number(target.dataset.chunk);
      const count = rhyme().chunks.length;
      if (next < 0 || next >= count) return;
      stopAudio();
      state.atBlank = false;
      state.chunk = next;
      go("sing", { keepAudio: true, quiet: true });
    } else if (target.dataset.word) {
      state.clap = Number(target.dataset.word);
      go("words", { keepAudio: true, quiet: true, from: state.from });
    } else if (target.dataset.family) {
      const family = rhyme().families[Number(target.dataset.family)];
      state.family = family && family.solo ? `${target.dataset.family}:${target.dataset.twin}` : target.dataset.family;
      go("words", { keepAudio: true, quiet: true, from: state.from });
    } else if (target.dataset.friend) {
      state.friend = target.dataset.friend;
      go("count");
    } else if (target.dataset.fruit) {
      const id = Number(target.dataset.fruit);
      if (state.found.includes(id)) return;
      state.found.push(id);
      const done = state.found.length >= 5;
      go("count", { keepAudio: true, quiet: true });
      if (done) window.setTimeout(() => go("win"), reduce ? 0 : 220);
    } else if (target.dataset.add != null) {
      state.blocks = Math.min(3, state.blocks + 1);
      go("blocks", { keepAudio: true, quiet: true });
    } else if (target.dataset.join != null) {
      state.joined = true;
      go("together", { keepAudio: true, quiet: true });
    }
  });

  document.addEventListener("pointerdown", (event) => {
    const btn = event.target.closest("[data-hold]");
    if (btn) startHold(btn, event);
  });

  document.addEventListener("pointerup", cancelHold);
  document.addEventListener("pointercancel", cancelHold);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.screen !== "home") back();
  });

  load();
  render();
  Promise.all(window.RHYMES.map((item) => findAudio(item.id))).then(() => {
    if (!state.playing) paintRecorded();
    const note = document.getElementById("missingNote");
    const known = knownAudio(rhyme().id);
    if (note && known !== undefined) note.hidden = known !== null;
    const status = document.getElementById("chunkStatus");
    if (status && !state.playing) status.textContent = singStatus();
  });

  })();
