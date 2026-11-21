(function () {
  const STEPS = ["hear", "fill", "play", "lead"];
  const STEP_LABEL = { hear: "Hear", fill: "Fill", play: "Play", lead: "Lead" };
  const KEY = "samaya-kannada-rhymes";
  const MISSING = "Amma hasn’t recorded this one yet";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const state = {
    rhymeId: "aane-banthondu-aane",
    step: "hear",
    tab: "week",
    chunk: 0,
    clap: null,
    revealed: {},
    family: null,
    playing: false,
    origin: null,
  };

  const audioCache = Object.create(null);
  const audio = new Audio();
  audio.preload = "none";
  let tickOn = false;

  const app = document.getElementById("app");
  const views = document.getElementById("views");
  const picker = document.getElementById("picker");
  const whole = document.getElementById("whole");
  const tabs = [...document.querySelectorAll(".tab")];

  function rhyme() {
    return window.RHYMES.find((item) => item.id === state.rhymeId) || window.RHYMES[0];
  }

  function wholeOf(id) {
    return (window.WHOLE || []).find((item) => item.id === id) || { lines: [], cues: [] };
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!saved) return;
      if (window.RHYMES.some((item) => item.id === saved.rhymeId)) state.rhymeId = saved.rhymeId;
      if (STEPS.includes(saved.step)) state.step = saved.step;
    } catch (err) {
      /* keep the first-week defaults */
    }
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify({ rhymeId: state.rhymeId, step: state.step }));
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function iconPlay(cls, size) {
    if (size === 20) {
      return `<svg class="${cls}" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M9 4.2 5.8 7H3.4A1.4 1.4 0 0 0 2 8.4v3.2A1.4 1.4 0 0 0 3.4 13h2.4L9 15.8V4.2z" fill="#F8F7F7"/><path d="M12.2 7.2a3.4 3.4 0 0 1 0 5.6" stroke="#F8F7F7" stroke-width="1.5" stroke-linecap="round"/><path d="M14.4 5.4a6 6 0 0 1 0 9.2" stroke="#F8F7F7" stroke-width="1.5" stroke-linecap="round"/></svg>`;
    }
    return `<svg class="${cls}" width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M4 2.2v9.6L12 7 4 2.2z" fill="#F8F7F7"/></svg>`;
  }

  function iconPause(cls, size) {
    const box = size === 20 ? "20" : "14";
    if (size === 20) {
      return `<svg class="${cls}" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="5" y="4" width="3.2" height="12" rx="1" fill="#F8F7F7"/><rect x="11.8" y="4" width="3.2" height="12" rx="1" fill="#F8F7F7"/></svg>`;
    }
    return `<svg class="${cls}" width="${box}" height="${box}" viewBox="0 0 14 14" fill="none" aria-hidden="true"><rect x="3" y="2.2" width="2.6" height="9.6" rx="0.7" fill="#F8F7F7"/><rect x="8.4" y="2.2" width="2.6" height="9.6" rx="0.7" fill="#F8F7F7"/></svg>`;
  }

  const badgePlay = `<span class="badge play" aria-hidden="true"><svg width="7" height="7" viewBox="0 0 8 8" fill="none"><path d="M2 1.2v5.6L7 4 2 1.2z" fill="#F8F7F7"/></svg></span>`;
  const badgeUnrec = `<span class="badge unrec" aria-hidden="true"><svg width="9" height="9" viewBox="0 0 10 10" fill="none"><rect x="3.2" y="1.4" width="3.6" height="4.2" rx="1.8" stroke="#4A433C" stroke-width="1"/><path d="M2.2 5.4a2.8 2.8 0 0 0 5.6 0" stroke="#4A433C" stroke-width="1" stroke-linecap="round"/><path d="M1.6 1.6l6.8 6.8" stroke="#4A433C" stroke-width="1.1" stroke-linecap="round"/></svg></span>`;
  const check = `<svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.2 6.2 4.8 8.8 9.8 3.4" stroke="#F8F7F7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  function knownAudio(id) {
    return Object.prototype.hasOwnProperty.call(audioCache, id) ? audioCache[id] : undefined;
  }

  function missing(id) {
    return knownAudio(id) !== undefined && knownAudio(id) === null;
  }

  async function findAudio(id) {
    if (Object.prototype.hasOwnProperty.call(audioCache, id)) return audioCache[id];
    // Try .m4a first, then .mp3. Probe a side URL with a one-byte GET.
    // iOS Safari will not play an m4a if a HEAD of that same URL is cached with an empty body.
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
      } catch (err) {
        /* try the other extension */
      }
    }
    audioCache[id] = null;
    return null;
  }

  let loadedUrl = "";

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
    state.origin = null;
  }

  function singStatus() {
    const item = rhyme();
    if (missing(item.id) || knownAudio(item.id) == null) return MISSING;
    if (state.playing && state.origin === "sing") {
      const spec = item.audioChunks && item.audioChunks[state.chunk];
      return spec ? "Playing — will pause at the blank" : "Playing the whole song";
    }
    const spec = item.audioChunks && item.audioChunks[state.chunk];
    if (spec && spec.pauseAt != null) return "Paused at the blank for Samaya";
    return spec ? "Ready for this part" : "Play the whole song";
  }

  function tag(role) {
    if (role === "amma") return "Amma";
    if (role === "samaya") return "Samaya";
    return "Together";
  }

  function turn(item, row) {
    if (row.role === "amma") return "Amma’s turn";
    if (row.role === "samaya") return item.theme === "ziggy" ? "Your turn · Ziggy waits" : "Your turn";
    return "Sing together";
  }

  function partsHtml(parts, key) {
    return parts.map((part, index) => {
      if (part.br) return "<br>";
      if (part.blank) {
        const id = `${key}-${index}`;
        const shown = state.revealed[id];
        return `<button type="button" class="blank${shown ? " is-filled" : ""}" data-reveal="${id}">${shown ? escapeHtml(part.blank) : ""}</button>`;
      }
      return escapeHtml(part.text || "");
    }).join("");
  }

  function rowWaiting(parts, key) {
    return parts.some((part, index) => part.blank && !state.revealed[`${key}-${index}`]);
  }

  function art(item, extra) {
    return `<div class="${extra || ""}"><div class="art-mat ${item.theme === "ziggy" ? "ziggy-wag" : ""}"><div class="frame"><img src="${item.image}" width="1152" height="864" alt="${escapeHtml(item.alt)}"></div></div></div>`;
  }

  function renderWeek(item) {
    const index = STEPS.indexOf(state.step);
    const steps = STEPS.map((id, stepIndex) => {
      const kind = stepIndex < index ? "done" : stepIndex === index ? "current" : "todo";
      return `<button class="step ${kind}" type="button" role="radio" aria-checked="${kind === "current" ? "true" : "false"}" data-step="${id}"><span class="dot">${kind === "done" ? check : ""}</span><span class="lab">${STEP_LABEL[id]}</span></button>${stepIndex < STEPS.length - 1 ? `<div class="rail${stepIndex < index ? " on" : ""}"></div>` : ""}`;
    }).join("");
    const others = window.RHYMES.filter((entry) => entry.id !== item.id);
    const row = others.map((entry) => {
      const recorded = knownAudio(entry.id);
      const badge = recorded ? badgePlay : badgeUnrec;
      return `<button class="more-item" type="button" data-rhyme="${entry.id}"><span class="thumb"><span class="thumb-mat"><img src="${entry.image}" width="1152" height="864" alt=""></span>${badge}</span><span class="nm">${escapeHtml(entry.short)}</span></button>`;
    }).join("");
    const gone = missing(item.id) || knownAudio(item.id) == null;
    return `<section class="view is-on" data-view="week">
      <div class="kicker"><p class="eyebrow">This week’s rhyme</p><span class="week-chip">This week</span></div>
      ${art(item)}
      <h1 class="rhyme-title">${escapeHtml(item.title)}</h1>
      <button class="btn btn-secondary" type="button" data-whole>See whole rhyme</button>
      <div class="progress" role="radiogroup" aria-label="This week’s step">${steps}</div>
      <button class="btn btn-voice${state.playing && state.origin === "week" ? " is-playing" : ""}" id="voiceBtn" type="button" data-audio="week" aria-pressed="${state.playing && state.origin === "week" ? "true" : "false"}">
        <span class="icon-swap" aria-hidden="true">${iconPlay("icon-play", 20)}${iconPause("icon-pause", 20)}</span>
        <span class="voice-label" id="voiceLabel">${state.playing && state.origin === "week" ? "Pause Amma’s voice" : "Play Amma’s voice"}</span>
      </button>
      <p class="unrec-note" id="missingNote"${gone ? "" : " hidden"}>${MISSING}</p>
      <button class="btn btn-secondary" type="button" data-tab="sing">Let’s sing</button>
      <div class="more">
        <div class="more-head"><p class="more-label">More rhymes</p><button class="chip-btn" type="button" data-picker>All 6</button></div>
        <div class="more-row">${row}</div>
      </div>
    </section>`;
  }

  function renderSing(item) {
    const chunk = item.chunks[state.chunk] || item.chunks[0];
    const cards = chunk.map((row, rowIndex) => {
      const key = `${state.chunk}-${rowIndex}`;
      const waiting = rowWaiting(row.parts, key);
      return `<article class="line-card${waiting ? " waiting" : ""}">
        <div class="line-head"><span class="tag ${row.role}">${tag(row.role)}</span><span class="turn">${escapeHtml(turn(item, row))}</span></div>
        <div class="lyric">${partsHtml(row.parts, key)}</div>
      </article>`;
    }).join("");
    const caption = item.theme === "ziggy"
      ? `<p class="anim-cap"><strong>Ziggy</strong> bounces and wags on his turn</p>`
      : `<p class="anim-cap">${escapeHtml(item.gesture)}</p>`;
    const ziggy = item.theme === "ziggy" ? "ziggy-live" : "";
    return `<section class="view is-on ${ziggy}" data-view="sing">
      <p class="eyebrow">Sing with me</p>
      <h1 class="title">${escapeHtml(item.short)}</h1>
      <button class="btn btn-secondary" type="button" data-whole>See whole rhyme</button>
      ${item.theme === "ziggy" ? `<div class="ziggy-bounce">${art(item)}</div>` : art(item)}
      ${caption}
      <div class="audio-bar">
        <button class="audio-btn${state.playing && state.origin === "sing" ? " is-playing" : ""}" id="chunkBtn" type="button" data-audio="sing" aria-pressed="${state.playing && state.origin === "sing" ? "true" : "false"}" aria-label="Amma’s voice">
          ${iconPlay("ic-play", 14)}${iconPause("ic-pause", 14)}
        </button>
        <div>
          <div class="audio-title">Amma’s voice</div>
          <p class="audio-status" id="chunkStatus">${escapeHtml(singStatus())}</p>
        </div>
      </div>
      ${cards}
      <div class="part-row">
        <p class="part-label">Part ${state.chunk + 1} of ${item.chunks.length}</p>
        <div class="chunk-nav">
          <button class="btn btn-secondary" type="button" data-chunk="-1"${state.chunk === 0 ? " disabled" : ""}>Earlier</button>
          <button class="btn btn-secondary" type="button" data-chunk="1"${state.chunk >= item.chunks.length - 1 ? " disabled" : ""}>Next lines</button>
        </div>
      </div>
    </section>`;
  }

  function renderWords(item) {
    const clapIndex = state.clap == null ? item.defaultClap : state.clap;
    const clap = item.claps[clapIndex];
    const buttons = clap.pieces.map((piece, index) => `<button class="clap" type="button" data-clap="${index}"><span class="syl">${escapeHtml(piece)}</span><span class="n">clap</span></button>`).join("");
    const chips = item.claps.map((word, index) => `<button class="wchip${index === clapIndex ? " on" : ""}" type="button" data-word="${index}"><div class="w">${escapeHtml(word.pieces.join("-"))}</div></button>`).join("");
    const families = item.families.map((family, familyIndex) => {
      const twins = family.words.map((word, wordIndex) => {
        const key = family.solo ? `${familyIndex}:${wordIndex}` : `${familyIndex}`;
        const on = state.family === key ? " is-pop" : "";
        return `<button class="twin${word.wide ? " wide" : ""}${on}" type="button" data-family="${familyIndex}" data-twin="${wordIndex}"><div class="w">${escapeHtml(word.w)}</div></button>`;
      }).join("");
      const title = family.title || "Rhyme twins";
      const note = family.note || "they sound the same at the end";
      return `<section class="card">
        <div class="twins-head"><h2 class="twins-title">${escapeHtml(title)}</h2><p class="sub">${escapeHtml(note)}</p></div>
        <div class="twin-row">${twins}</div>
      </section>`;
    }).join("");
    return `<section class="view is-on" data-view="words">
      <h1 class="eyebrow">Play with the words</h1>
      <p class="mean" style="margin-top:2px">Noticing, not a quiz</p>
      <section class="card">
        <div class="play-top">
          <div class="ane-chip"><img src="${item.image}" width="1152" height="864" alt=""></div>
          <div>
            <p class="hop">${escapeHtml(clap.say)}</p>
            <p class="mean">${escapeHtml(clap.aside || "clap along")}</p>
          </div>
        </div>
        <div class="claps">${buttons}</div>
        <div class="word-row">${chips}</div>
      </section>
      ${families}
    </section>`;
  }

  function renderStory(item) {
    const steps = item.steps.map((step, index) => `<article class="scard"><div class="num">${index + 1}</div><div class="scaption"><div class="w">${escapeHtml(step.w)}</div></div></article>`).join("");
    return `<section class="view is-on" data-view="story">
      <h1 class="eyebrow">Tell the story</h1>
      <p class="mean" style="margin-top:2px">${escapeHtml(item.storyNote)}</p>
      ${art(item)}
      <div class="steps">${steps}</div>
      <section class="speak">
        <div class="line-head"><span class="tag amma">Amma</span><span class="turn">You say it</span></div>
        <p class="speak-q">${escapeHtml(item.speak.prompt)}</p>
        <div class="answer-row">
          <span class="tag samaya">Samaya</span>
          <button class="answer-chip" type="button">
            <div class="w">${escapeHtml(item.speak.answer)}</div>
          </button>
        </div>
      </section>
    </section>`;
  }

  function renderPicker() {
    const list = document.getElementById("pickerList");
    const current = rhyme();
    list.innerHTML = window.RHYMES.map((item) => {
      const on = item.id === current.id;
      return `<button class="pick${on ? " is-current" : ""}" type="button" data-rhyme="${item.id}"${on ? ' aria-current="true"' : ""}>
        <span class="pick-art"><img src="${item.image}" width="1152" height="864" alt=""></span>
        <span class="pick-copy">
          <span class="pick-title">${escapeHtml(item.title)}</span>
          ${on ? '<span class="week-chip pick-now">This week</span>' : ""}
        </span>
      </button>`;
    }).join("");
  }

  function renderWhole() {
    const item = rhyme();
    const pack = wholeOf(item.id);
    const lines = pack.lines.map((line, index) => `<li class="whole-line" data-whole-line>
      <span class="whole-num">${index + 1}</span>
      <p class="whole-text">${escapeHtml(line.text)}</p>
    </li>`).join("");
    document.getElementById("wholeBody").innerHTML = `<p class="whole-kicker title">${escapeHtml(item.title)}</p>
      <ol class="whole-list">${lines}</ol>`;
  }

  function render() {
    const item = rhyme();
    app.dataset.rhyme = item.theme;
    app.style.background = "";
    document.querySelector('meta[name="theme-color"]').setAttribute("content", item.theme === "ziggy" ? "#EFEFED" : "#F1F0EF");
    const view = { week: renderWeek, sing: renderSing, words: renderWords, story: renderStory }[state.tab](item);
    views.innerHTML = view;
    views.scrollTop = 0;
    tabs.forEach((tab) => {
      const on = tab.dataset.tab === state.tab;
      tab.classList.toggle("is-on", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    renderPicker();
    renderWhole();
  }

  function setTab(id) {
    if (!["week", "sing", "words", "story"].includes(id)) return;
    stopAudio();
    state.tab = id;
    render();
  }

  function setRhyme(id) {
    if (!window.RHYMES.some((item) => item.id === id) || id === state.rhymeId) {
      closePicker();
      return;
    }
    stopAudio();
    state.rhymeId = id;
    state.chunk = 0;
    state.clap = null;
    state.revealed = {};
    state.family = null;
    save();
    closePicker();
    render();
  }

  function openPicker() {
    closeWhole();
    picker.hidden = false;
    document.body.classList.add("picker-open");
    const close = picker.querySelector(".picker-close");
    if (close) close.focus();
  }

  function closePicker() {
    if (picker.hidden) return;
    picker.hidden = true;
    document.body.classList.remove("picker-open");
  }

  function openWhole() {
    closePicker();
    renderWhole();
    whole.hidden = false;
    whole.querySelector(".picker-sheet").scrollTop = 0;
    document.body.classList.add("picker-open");
    const close = whole.querySelector(".picker-close");
    if (close) close.focus();
  }

  function closeWhole() {
    if (whole.hidden) return;
    whole.hidden = true;
    if (picker.hidden) document.body.classList.remove("picker-open");
  }

  function squish(el) {
    if (reduce || !el || !el.animate) return;
    el.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(0.86)", offset: 0.28 },
        { transform: "scale(1.08)", offset: 0.52 },
        { transform: "scale(0.98)", offset: 0.76 },
        { transform: "scale(1)" },
      ],
      { duration: 480, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
    );
  }

  function showMissing() {
    const note = document.getElementById("missingNote");
    if (note) note.hidden = false;
    const status = document.getElementById("chunkStatus");
    if (status) status.textContent = MISSING;
    state.playing = false;
    state.origin = null;
    render();
  }

  async function toggleAudio(origin) {
    const item = rhyme();
    const known = knownAudio(item.id);
    // Call play() in this tap when the file is already known. iOS drops the gesture if play() waits on the probe.
    const url = known !== undefined ? known : await findAudio(item.id);
    if (!url) {
      showMissing();
      return;
    }
    const spec = origin === "sing" ? item.audioChunks && item.audioChunks[state.chunk] : null;
    const same = state.playing && state.origin === origin && loadedUrl === url;
    if (same) {
      stopAudio();
      render();
      return;
    }
    stopAudio();
    prime(url);
    if (spec) {
      const start = Number(spec.start) || 0;
      tickOn = true;
      const seek = () => {
        try { audio.currentTime = start; } catch (err) { /* metadata not ready yet */ }
      };
      if (audio.readyState >= 1) seek();
      else audio.addEventListener("loadedmetadata", seek, { once: true });
    }
    try {
      await audio.play();
    } catch (err) {
      stopAudio();
      render();
      return;
    }
    state.playing = true;
    state.origin = origin;
    render();
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
      render();
      const status = document.getElementById("chunkStatus");
      if (status && atBlank) status.textContent = "Paused at the blank for Samaya";
    }
  });

  audio.addEventListener("ended", () => {
    stopAudio();
    render();
  });

  document.addEventListener("click", (event) => {
    const target = event.target.closest("button");
    if (!target) return;
    if (target.dataset.tab) setTab(target.dataset.tab);
    else if (target.dataset.step) {
      state.step = target.dataset.step;
      save();
      render();
    } else if (target.dataset.rhyme) setRhyme(target.dataset.rhyme);
    else if (target.hasAttribute("data-picker")) openPicker();
    else if (target.hasAttribute("data-whole")) openWhole();
    else if (target.hasAttribute("data-close-whole")) closeWhole();
    else if (target.hasAttribute("data-close-picker") || target.classList.contains("picker-backdrop")) closePicker();
    else if (target.dataset.audio) toggleAudio(target.dataset.audio);
    else if (target.dataset.chunk) {
      const next = state.chunk + Number(target.dataset.chunk);
      const count = rhyme().chunks.length;
      if (next < 0 || next >= count) return;
      stopAudio();
      state.chunk = next;
      state.revealed = {};
      render();
    } else if (target.dataset.reveal) {
      state.revealed[target.dataset.reveal] = true;
      render();
    } else if (target.dataset.word) {
      state.clap = Number(target.dataset.word);
      render();
    } else if (target.classList.contains("clap")) {
      squish(target);
    } else if (target.dataset.family) {
      const family = rhyme().families[Number(target.dataset.family)];
      state.family = family && family.solo
        ? `${target.dataset.family}:${target.dataset.twin}`
        : target.dataset.family;
      render();
      const popped = views.querySelector(`.twin[data-family="${target.dataset.family}"][data-twin="${target.dataset.twin}"]`);
      if (popped && !reduce && popped.animate) {
        popped.animate(
          [{ transform: "scale(1)" }, { transform: "scale(1.06)", offset: 0.4 }, { transform: "scale(1)" }],
          { duration: 280, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
        );
      }
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!whole.hidden) closeWhole();
    else closePicker();
  });

  picker.addEventListener("click", (event) => {
    if (event.target === picker || event.target.classList.contains("picker-backdrop")) closePicker();
  });

  load();
  render();
  Promise.all(window.RHYMES.map((item) => findAudio(item.id))).then(() => {
    if (!state.playing) render();
  });
})();
