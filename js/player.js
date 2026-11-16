/* ══════════ PANTENOL VISUALS · ВСТРОЕННЫЙ SOUNDCLOUD-ПЛЕЕР ══════════
   Официальный SoundCloud Widget API (iframe + w.soundcloud.com/player/api.js).
   Работает и в Electron, и в браузере. Нужен интернет. */
"use strict";

const iframe  = document.getElementById("scWidget");
const cover   = document.getElementById("scCover");
const titleEl = document.getElementById("scTitle");
const artEl   = document.getElementById("scArtist");
const playBtn = document.getElementById("scPlay");
const playIco = document.getElementById("scPlayIco");
const prevBtn = document.getElementById("scPrev");
const nextBtn = document.getElementById("scNext");
const vol     = document.getElementById("scVol");
const bar     = document.getElementById("scBar");
const fill    = document.getElementById("scFill");
const credit  = document.getElementById("scCredit");
const player  = document.getElementById("scPlayer");
const popover = document.getElementById("scPopover");
const listBtn = document.getElementById("scListBtn");
const tracks  = document.getElementById("scTracks");
const urlIn   = document.getElementById("scUrl");
const loadBtn = document.getElementById("scLoad");

const DEFAULT_URL = "https://soundcloud.com/c418";
const WIDGET_BASE =
  "https://w.soundcloud.com/player/?hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=false&auto_play=false&url=";

const ICO_PLAY  = '<path d="M7 4.5v15l13-7.5z"/>';
const ICO_PAUSE = '<path d="M6 5h4v14H6zm8 0h4v14h-4z"/>';

let widget = null;
let ready = false;
let scSounds = [];
let duration = 0;
let offline = false;

function setStatus(t, a) {
  titleEl.textContent = t;
  artEl.textContent = a;
}

/* Догружаем API-скрипт SoundCloud */
let apiPromise = null;
function loadApi() {
  if (window.SC && window.SC.Widget) return Promise.resolve();
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://w.soundcloud.com/player/api.js";
    s.onload = resolve;
    s.onerror = reject;
    document.body.appendChild(s);
  });
  return apiPromise;
}

function initWidget(url) {
  iframe.src = WIDGET_BASE + encodeURIComponent(url);
  widget = SC.Widget(iframe);

  widget.bind(SC.Widget.Events.READY, () => {
    ready = true;
    offline = false;
    widget.setVolume(+vol.value);
    refreshTracksSoon();
    setStatus("Готово ✔", "нажмите ▶ — заиграет музыка");
  });

  widget.bind(SC.Widget.Events.PLAY, () => {
    playingSet(true);
    widget.getCurrentSound((s) => s && updateTrackUI(s));
    widget.getDuration((d) => { duration = d; });
  });
  widget.bind(SC.Widget.Events.PAUSE, () => playingSet(false));
  widget.bind(SC.Widget.Events.FINISH, () => widget.next());
  widget.bind(SC.Widget.Events.PLAY_PROGRESS, (d) => {
    fill.style.width = (d.relativePosition * 100).toFixed(1) + "%";
  });
  widget.bind(SC.Widget.Events.ERROR, () => {
    setStatus("Трек недоступен", "пробую следующий…");
    widget.next();
  });
}

function playingSet(on) {
  player.classList.toggle("playing", on);
  playIco.innerHTML = on ? ICO_PAUSE : ICO_PLAY;
}

function updateTrackUI(s) {
  setStatus(s.title || "Без названия", s.user && s.user.username ? s.user.username : "SoundCloud");
  if (s.artwork_url) cover.src = s.artwork_url.replace("-large", "-t200x200");
  else cover.src = "assets/logo.png";
  if (s.permalink_url) credit.href = s.permalink_url;
  markPlayingInList(s.permalink_url);
}

function markPlayingInList(url) {
  tracks.querySelectorAll(".sc-track-btn").forEach((b) => b.classList.toggle("playing", b.dataset.url === url));
}

function refreshTracksSoon() {
  setTimeout(() => {
    if (!widget) return;
    widget.getSounds((list) => {
      scSounds = list || [];
      renderTrackList();
    });
  }, 900);
}

function renderTrackList() {
  tracks.innerHTML = "";
  if (!scSounds.length) {
    tracks.innerHTML = `<div class="sc-track-empty">Список пуст или нужен интернет</div>`;
    return;
  }
  scSounds.forEach((s, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sc-track-btn";
    b.dataset.url = s.permalink_url || "";
    b.innerHTML = `
      <img src="${s.artwork_url ? s.artwork_url.replace("-large", "-t200x200") : "assets/logo.png"}" alt="" loading="lazy">
      <span>${s.title || "Трек " + (i + 1)}</span>`;
    b.addEventListener("click", () => {
      widget.skip(i);
      widget.play();
    });
    tracks.appendChild(b);
  });
}

function loadSource(url) {
  if (!ready || !widget) return;
  setStatus("Загружаю канал…", "SoundCloud");
  widget.load(url, { auto_play: true, hide_related: true, show_comments: false, visual: false });
  refreshTracksSoon();
}

/* ── Управление ── */
playBtn.addEventListener("click", async () => {
  if (offline) return setStatus("Нет интернета", "SoundCloud недоступен");
  try {
    await loadApi();
  } catch {
    offline = true;
    return setStatus("Нет интернета", "SoundCloud недоступен — проверьте сеть");
  }
  if (!widget) initWidget(DEFAULT_URL);
  else if (ready) widget.toggle();
});

prevBtn.addEventListener("click", () => ready && widget.prev());
nextBtn.addEventListener("click", () => ready && widget.next());

vol.addEventListener("input", () => {
  const v = +vol.value;
  vol.style.setProperty("--fill", v + "%");
  if (ready) widget.setVolume(v);
});

bar.addEventListener("click", (e) => {
  if (!ready || !duration) return;
  const r = bar.getBoundingClientRect();
  const x = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
  widget.seekTo(duration * x);
});

/* Плейлист/каналы */
listBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  popover.classList.toggle("open");
});
document.addEventListener("click", (e) => {
  if (!popover.contains(e.target) && e.target !== listBtn) popover.classList.remove("open");
});

document.querySelectorAll(".sc-channel").forEach((ch) => {
  ch.addEventListener("click", () => {
    document.querySelectorAll(".sc-channel").forEach((c) => c.classList.remove("active"));
    ch.classList.add("active");
    loadSource(ch.dataset.url);
  });
});

loadBtn.addEventListener("click", () => {
  let v = urlIn.value.trim();
  if (!v) return;
  if (!/^https?:\/\//.test(v)) v = "https://soundcloud.com/" + v.replace(/^\/+/, "");
  if (!v.includes("soundcloud.com")) return setStatus("Это не SoundCloud", "вставьте ссылку вида soundcloud.com/артист");
  document.querySelectorAll(".sc-channel").forEach((c) => c.classList.remove("active"));
  loadSource(v);
  urlIn.value = "";
});
urlIn.addEventListener("keydown", (e) => { if (e.key === "Enter") loadBtn.click(); });

/* Если совсем оффлайн — приглушаем плеер */
if (!navigator.onLine) {
  setStatus("Нет интернета", "модуль музыки ждёт сеть");
}
