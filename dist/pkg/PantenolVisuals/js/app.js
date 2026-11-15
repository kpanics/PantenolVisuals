/* ══════════════ PANTENOL VISUALS · ЛОГИКА ЛАУНЧЕРА ══════════════ */
"use strict";

const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* ───────── Данные ───────── */
const VERSIONS = [
  { num: "1.21.3",  loader: "Fabric",  tags: ["Iris", "Sodium"], size: "1.4 ГБ", note: "Рекомендуемая" },
  { num: "1.21.1",  loader: "Forge",   tags: ["OptiFine"],       size: "1.3 ГБ" },
  { num: "1.20.4",  loader: "Fabric",  tags: ["Iris", "Sodium"], size: "1.2 ГБ" },
  { num: "1.19.2",  loader: "Quilt",   tags: ["Sodium"],         size: "1.1 ГБ" },
  { num: "1.16.5",  loader: "Forge",   tags: ["OptiFine"],       size: "980 МБ" },
  { num: "1.12.2",  loader: "Vanilla", tags: [],                 size: "720 МБ" },
];

const SERVERS = [
  { name: "Pantenol SMP",      desc: "Выживание · Сезон II",        ping: 23,  bars: 4 },
  { name: "CubeWars",          desc: "BedWars · 1.8 PvP",           ping: 41,  bars: 3 },
  { name: "Анархия RU",        desc: "Без правил · 6 217 игроков",  ping: 78,  bars: 2 },
  { name: "Buildbattle Pro",   desc: "Стройка на скорость",         ping: 112, bars: 1 },
];

const MODS = [
  { name: "Sodium",            ver: "0.6.3",  cat: "perf",    catName: "Оптимизация", desc: "Современный движок рендера, до 400% к FPS", on: true,  c1: "#34d399", c2: "#0d9488" },
  { name: "Iris Shaders",      ver: "1.8.1",  cat: "shaders", catName: "Шейдеры",     desc: "Полная поддержка шейдерпаков на Fabric",      on: true,  c1: "#a78bfa", c2: "#6d28d9" },
  { name: "Lithium",           ver: "0.14.2", cat: "perf",    catName: "Оптимизация", desc: "Оптимизация логики сервера и тиков",          on: true,  c1: "#38bdf8", c2: "#0369a1" },
  { name: "Dynamic FPS",       ver: "3.7.6",  cat: "perf",    catName: "Оптимизация", desc: "Снижает FPS, когда игра свёрнута",            on: false, c1: "#fbbf24", c2: "#b45309" },
  { name: "Complementary RP",  ver: "5.2",    cat: "shaders", catName: "Шейдеры",     desc: "Шейдерпак Reimagined, пресет «Кино»",         on: true,  c1: "#fb7185", c2: "#be123c" },
  { name: "PvP HUD+",          ver: "2.1.0",  cat: "pvp",     catName: "PvP",         desc: "Индикаторы кристаллов, таймеры тотемов",      on: true,  c1: "#ef4444", c2: "#7f1d1d" },
  { name: "Keystrokes Lite",   ver: "1.4",    cat: "hud",     catName: "HUD",         desc: "Отображение WASD и CPS на экране",            on: false, c1: "#64748b", c2: "#1e293b" },
  { name: "Jade",              ver: "15.8",   cat: "hud",     catName: "HUD",         desc: "Информация о блоке, на который смотришь",     on: true,  c1: "#22d3ee", c2: "#0e7490" },
  { name: "Terralith",         ver: "2.5.7",  cat: "world",   catName: "Мир",         desc: "Сотни новых биомов без новых блоков",         on: false, c1: "#4ade80", c2: "#166534" },
  { name: "Waystones",         ver: "18.0.1", cat: "world",   catName: "Мир",         desc: "Камни телепортации между точками",            on: false, c1: "#c084fc", c2: "#581c87" },
];

const PRODUCTS = [
  { id: "rp-foton",    cat: "rp",      flag: "ХИТ",  flagClass: "flag-hit", img: "assets/shop-realistic.jpg", name: "Ресурспак «Фотон» 1024x",    author: "Pantenol Studio", price: 499, old: 699 },
  { id: "rp-anime",    cat: "rp",      flag: "NEW",  flagClass: "flag-new", img: "assets/shop-anime.jpg",     name: "Ресурспак «Тюльпан»",       author: "MikaDraws",       price: 299 },
  { id: "rp-pvp",      cat: "rp",      flag: null,   flagClass: "",         img: "assets/shop-pvp.jpg",       name: "PvP-пак «Неон»",            author: "Pantenol Studio", price: 199 },
  { id: "cfg-fixpal",  cat: "blogger", flag: "ХИТ",  flagClass: "flag-hit", img: "assets/shop-blogger.jpg",   name: "Конфиг «Как у ФиксПэла»",   author: "FixPal",          price: 349 },
  { id: "cfg-nerkin",  cat: "blogger", flag: null,   flagClass: "",         img: "assets/news-update.jpg",    name: "Конфиг Неркина",            author: "Nerkin",          price: 249 },
  { id: "cfg-admin",   cat: "admin",   flag: "NEW",  flagClass: "flag-new", img: "assets/news-event.jpg",     name: "Админ-конфиг Pantenol SMP", author: "Администрация",   price: 449 },
];

const TAB_TITLES = { home: "Главная", play: "Играть", mods: "Моды", shop: "Магазин", settings: "Настройки" };

/* ───────── Состояние ───────── */
const state = {
  version: VERSIONS[0],
  account: null,
  cart: new Set(),
  launching: false,
};

/* ───────── Хранилище аккаунтов ───────── */
const store = {
  get users()    { try { return JSON.parse(localStorage.getItem("pv_users") || "{}"); } catch { return {}; } },
  set users(v)   { localStorage.setItem("pv_users", JSON.stringify(v)); },
  get session()  { return localStorage.getItem("pv_session"); },
  set session(v) { v ? localStorage.setItem("pv_session", v) : localStorage.removeItem("pv_session"); },
};

/* ───────── Уведомления ───────── */
function toast(title, sub = "", icon = "✓") {
  const box = $("#toasts");
  if (!box) return;
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-text"><b>${title}</b><span>${sub}</span></div>`;
  box.appendChild(el);
  setTimeout(() => {
    el.classList.add("hide");
    setTimeout(() => el.remove(), 260);
  }, 3400);
}

/* ───────── Универсальный выпадающий список ─────────
   Каждый дропдаун регистрируется через registerDropdown:
   - btn:  кнопка-триггер (класс .open навешивается автоматически)
   - menu: контейнер .dropdown (закрытие — классом)
   - renderItems(menu, close): заполняет список при каждом открытии
*/
const dropdowns = [];

function registerDropdown(btn, menu, renderItems) {
  if (!btn || !menu) return;
  const dd = { btn, menu };
  dropdowns.push(dd);
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !menu.classList.contains("open");
    closeAllDropdowns();
    if (!willOpen) return;
    menu.innerHTML = "";
    renderItems(menu, closeAllDropdowns);
    menu.classList.add("open");
    btn.classList.add("open");
  });
}

function closeAllDropdowns() {
  dropdowns.forEach(({ btn, menu }) => {
    menu.classList.remove("open");
    btn.classList.remove("open");
  });
}
document.addEventListener("click", closeAllDropdowns);

/* ───────── ЭКРАН АВТОРИЗАЦИИ ───────── */
const authScreen = $("#authScreen");
const app = $("#app");

function showAuth() {
  app.hidden = true;
  authScreen.classList.remove("hidden");
  authScreen.style.display = "flex";
}

function enterLauncher(user) {
  state.account = user;
  applyAccount();
  authScreen.classList.add("hidden");
  setTimeout(() => { authScreen.style.display = "none"; }, 480);
  app.hidden = false;
  toast(`Привет, ${user.name}! 👋`, user.type === "Оффлайн" ? "Оффлайн-режим активен" : "Сессия восстановлена", "👤");
}

/* Переключение вкладок Вход/Регистрация */
$("#tabLogin").addEventListener("click", () => {
  $("#tabLogin").classList.add("active");
  $("#tabRegister").classList.remove("active");
  $("#formLogin").hidden = false;
  $("#formRegister").hidden = true;
});
$("#tabRegister").addEventListener("click", () => {
  $("#tabRegister").classList.add("active");
  $("#tabLogin").classList.remove("active");
  $("#formRegister").hidden = false;
  $("#formLogin").hidden = true;
});

function authError(el, card, msg) {
  el.textContent = msg;
  card.classList.remove("shake");
  void card.offsetWidth; /* перезапуск анимации */
  card.classList.add("shake");
}

/* Вход */
$("#formLogin").addEventListener("submit", (e) => {
  e.preventDefault();
  const card = $("#authCard");
  const nick = $("#loginNick").value.trim();
  const pass = $("#loginPass").value;
  const errEl = $("#loginErr");

  if (nick.length < 3) return authError(errEl, card, "Ник короче 3 символов");
  const user = store.users[nick];
  if (!user) return authError(errEl, card, "Аккаунт не найден — зарегистрируйтесь");
  if (user.pass !== pass) return authError(errEl, card, "Неверный пароль");

  errEl.textContent = "";
  if ($("#loginRemember").checked) store.session = nick;
  enterLauncher({ name: nick, type: "Pantenol ID" });
});

/* Регистрация */
$("#formRegister").addEventListener("submit", (e) => {
  e.preventDefault();
  const card = $("#authCard");
  const nick = $("#regNick").value.trim();
  const pass = $("#regPass").value;
  const pass2 = $("#regPass2").value;
  const errEl = $("#regErr");

  if (!/^\w{3,16}$/.test(nick)) return authError(errEl, card, "Ник: 3–16 латинских букв, цифр или _");
  if (pass.length < 6) return authError(errEl, card, "Пароль короче 6 символов");
  if (pass !== pass2) return authError(errEl, card, "Пароли не совпадают");
  const users = store.users;
  if (users[nick]) return authError(errEl, card, "Этот ник уже занят");

  users[nick] = { pass, created: Date.now() };
  store.users = users;
  store.session = nick;
  errEl.textContent = "";
  toast("Аккаунт создан 🎉", `Добро пожаловать, ${nick}!`, "★");
  enterLauncher({ name: nick, type: "Pantenol ID" });
});

/* Microsoft — мок OAuth */
$("#btnMicrosoft").addEventListener("click", () => {
  toast("Microsoft OAuth", "Окно авторизации откроется в браузере (демо)", "🪟");
});

/* Оффлайн-режим */
$("#btnGuest").addEventListener("click", () => {
  enterLauncher({ name: "Гость", type: "Оффлайн" });
});

/* ───────── Кнопка «Аккаунт» справа сверху ───────── */
function applyAccount() {
  const name = state.account ? state.account.name : "Аккаунт";
  $("#accountBtnName").textContent = name;
}

registerDropdown($("#accountMenuBtn"), $("#accountMenu"), (menu, close) => {
  const users = store.users;
  const names = Object.keys(users);

  const head = document.createElement("div");
  head.className = "dropdown-head";
  head.textContent = "Аккаунты";
  menu.appendChild(head);

  /* Текущий оффлайн/гость */
  if (state.account && !users[state.account.name]) {
    menu.appendChild(accountItem(state.account.name, state.account.type, true, close));
  }
  names.forEach((n) => {
    menu.appendChild(accountItem(n, "Pantenol ID", state.account && state.account.name === n, close));
  });

  const div1 = document.createElement("div");
  div1.className = "dropdown-divider";
  menu.appendChild(div1);

  const add = document.createElement("button");
  add.type = "button";
  add.className = "dropdown-item";
  add.innerHTML = `<span style="color:var(--accent)">＋ Добавить аккаунт</span>`;
  add.addEventListener("click", (e) => { e.stopPropagation(); close(); store.session = null; showAuth(); });
  menu.appendChild(add);

  const out = document.createElement("button");
  out.type = "button";
  out.className = "dropdown-item danger";
  out.innerHTML = `<span>Выйти из аккаунта</span>`;
  out.addEventListener("click", (e) => {
    e.stopPropagation();
    close();
    store.session = null;
    state.account = null;
    showAuth();
    toast("Вы вышли", "Сессия завершена", "👋");
  });
  menu.appendChild(out);
});

function accountItem(name, type, isCurrent, close) {
  const item = document.createElement("button");
  item.type = "button";
  item.className = "dropdown-item";
  item.innerHTML = `
    <img src="assets/avatar.png" alt="">
    <span><b>${name}</b>${isCurrent ? ' <span style="color:var(--accent)">· текущий</span>' : ""}</span>
    <span class="dim">${type}</span>`;
  item.addEventListener("click", (e) => {
    e.stopPropagation();
    state.account = { name, type };
    store.session = name;
    applyAccount();
    close();
    toast("Аккаунт переключён", `Теперь вы играете как ${name}`, "👤");
  });
  return item;
}

$("#logoutBtn").addEventListener("click", () => {
  store.session = null;
  state.account = null;
  closeAllDropdowns();
  showAuth();
});

/* ───────── Вкладки ───────── */
$$(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    $$(".nav-item").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    $$(".page").forEach((p) => p.classList.remove("active"));
    $("#page-" + btn.dataset.tab).classList.add("active");
    $("#topbarTitle").textContent = TAB_TITLES[btn.dataset.tab] || "";
    closeAllDropdowns();
    $(".content").scrollTo({ top: 0, behavior: "smooth" });
  });
});

/* ───────── Выбор релиза ───────── */
registerDropdown($("#versionBtn"), $("#versionDropdown"), (menu, close) => {
  VERSIONS.forEach((v) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "dropdown-item";
    item.innerHTML = `
      <span><b>${v.num}</b>${v.note ? ' · <span style="color:var(--accent)">' + v.note + "</span>" : ""}</span>
      <span class="dim">${v.loader} · ${v.size}</span>`;
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      selectVersion(v);
      close();
    });
    menu.appendChild(item);
  });
});

function selectVersion(v) {
  state.version = v;
  $("#versionValue").textContent = `${v.num} · ${v.loader}`;
  $("#playVersionLabel").textContent = v.num;
  $("#playLoaderLabel").textContent = [v.loader, ...v.tags].join(" · ") || "Vanilla";
  renderVersionGrid();
}

/* ───────── Счётчики статистики ───────── */
function animateCounters() {
  $$(".stat-num").forEach((el) => {
    const target = +el.dataset.count;
    const dur = 1100;
    const t0 = performance.now();
    (function tick() {
      const p = Math.min((performance.now() - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("ru-RU");
      if (p < 1) requestAnimationFrame(tick);
    })();
  });
}

/* ───────── Запуск игры ───────── */
const LAUNCH_STAGES = [
  ["Проверка целостности файлов…", 18],
  ["Загрузка библиотек Fabric…", 42],
  ["Применение шейдерпака…", 61],
  ["Инициализация JVM…", 82],
  ["Запуск Minecraft…", 100],
];

function launchGame() {
  if (state.launching) return;
  state.launching = true;

  const wrap = $("#progressWrap");
  const fill = $("#progressFill");
  const stageEl = $("#progressStage");
  const pctEl = $("#progressPct");
  const bigBtn = $("#bigPlayBtn");

  wrap.hidden = false;
  bigBtn.style.opacity = ".55";
  bigBtn.style.pointerEvents = "none";
  fill.style.width = "0%";

  let stage = 0;
  function nextStage() {
    if (stage >= LAUNCH_STAGES.length) {
      state.launching = false;
      bigBtn.style.opacity = "";
      bigBtn.style.pointerEvents = "";
      $("#bigPlayText").textContent = "ИГРАТЬ";
      wrap.hidden = true;
      const name = state.account ? state.account.name : "Игрок";
      toast("Игра запущена 🎮", `Minecraft ${state.version.num} · аккаунт ${name}`, "▶");
      return;
    }
    const [label, pct] = LAUNCH_STAGES[stage];
    stageEl.textContent = label.replace("JVM…", `JVM (${state.ram || 8} ГБ)…`);
    pctEl.textContent = pct + "%";
    fill.style.width = pct + "%";
    if (stage === LAUNCH_STAGES.length - 1) $("#bigPlayText").textContent = "ЗАПУСК…";
    stage++;
    setTimeout(nextStage, 750 + Math.random() * 500);
  }
  nextStage();
}

$("#homePlayBtn").addEventListener("click", () => {
  document.querySelector('[data-tab="play"]').click();
  setTimeout(launchGame, 350);
});
$("#bigPlayBtn").addEventListener("click", launchGame);

/* ───────── Серверы ───────── */
function renderServers() {
  const list = $("#serverList");
  list.innerHTML = "";
  SERVERS.forEach((s) => {
    const el = document.createElement("div");
    el.className = "server";
    el.innerHTML = `
      <div class="server-icon">${s.name[0]}</div>
      <div class="server-info">
        <span class="server-name">${s.name}</span>
        <span class="server-desc">${s.desc}</span>
      </div>
      <div class="server-ping">
        <div class="ping-bars">${[1, 2, 3, 4].map((i) => `<i class="${i <= s.bars ? "" : "off"}"></i>`).join("")}</div>
        <span class="ping-ms">${s.ping} мс</span>
      </div>`;
    el.addEventListener("click", () => toast("Подключение…", `${s.name} · ${s.ping} мс`, "🌐"));
    list.appendChild(el);
  });
}

/* ───────── Сетка версий ───────── */
function renderVersionGrid() {
  const grid = $("#versionGrid");
  grid.innerHTML = "";
  VERSIONS.forEach((v) => {
    const el = document.createElement("div");
    el.className = "version-card card" + (v === state.version ? " selected" : "");
    el.innerHTML = `
      <div class="version-num">${v.num}</div>
      <div class="version-tags">
        <span class="version-tag loader">${v.loader}</span>
        ${v.tags.map((t) => `<span class="version-tag">${t}</span>`).join("")}
      </div>
      <div class="version-size">Установлено · ${v.size}</div>`;
    el.addEventListener("click", () => {
      selectVersion(v);
      toast("Версия выбрана", `Minecraft ${v.num} · ${v.loader}`, "⬇");
    });
    grid.appendChild(el);
  });
}

/* ───────── Моды ───────── */
let modCat = "all";
let modQuery = "";

function renderMods() {
  const list = $("#modList");
  list.innerHTML = "";
  const filtered = MODS.filter((m) => {
    const okCat = modCat === "all" || m.cat === modCat;
    const q = modQuery.trim().toLowerCase();
    return okCat && (!q || m.name.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q));
  });

  if (!filtered.length) {
    list.innerHTML = `<div class="card" style="padding:34px;text-align:center;color:var(--text-dim);font-weight:700">Ничего не найдено. Попробуйте другой запрос.</div>`;
    return;
  }

  filtered.forEach((m) => {
    const el = document.createElement("div");
    el.className = "mod" + (m.on ? "" : " off");
    el.innerHTML = `
      <div class="mod-icon" style="--c1:${m.c1};--c2:${m.c2}">${m.name.slice(0, 2).toUpperCase()}</div>
      <div class="mod-info">
        <span class="mod-name">${m.name} <span class="mod-ver">${m.ver}</span></span>
        <span class="mod-desc">${m.desc}</span>
      </div>
      <span class="mod-cat">${m.catName}</span>
      <label class="switch"><input type="checkbox" ${m.on ? "checked" : ""}><i></i></label>`;

    el.querySelector("input").addEventListener("change", (ev) => {
      m.on = ev.target.checked;
      el.classList.toggle("off", !m.on);
      updateModsBadge();
      toast(m.on ? "Мод включён" : "Мод выключен", `${m.name} ${m.ver}`, m.on ? "✓" : "✕");
    });
    list.appendChild(el);
  });
}

function updateModsBadge() {
  $("#modsBadge").textContent = MODS.filter((m) => m.on).length;
}

$("#modSearch").addEventListener("input", (e) => {
  modQuery = e.target.value;
  renderMods();
});
$("#modChips").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  $$("#modChips .chip").forEach((c) => c.classList.remove("active"));
  chip.classList.add("active");
  modCat = chip.dataset.cat;
  renderMods();
});

/* ───────── Магазин ───────── */
let shopCat = "all";

function renderShop() {
  const grid = $("#shopGrid");
  grid.innerHTML = "";
  PRODUCTS.filter((p) => shopCat === "all" || p.cat === shopCat).forEach((p) => {
    const inCart = state.cart.has(p.id);
    const el = document.createElement("div");
    el.className = "product card";
    el.innerHTML = `
      <div class="product-img">
        <img src="${p.img}" alt="${p.name}">
        ${p.flag ? `<span class="product-flag ${p.flagClass}">${p.flag}</span>` : ""}
      </div>
      <div class="product-body">
        <span class="product-name">${p.name}</span>
        <span class="product-author">автор: <b>${p.author}</b></span>
        <div class="product-foot">
          <span class="product-price">${p.old ? `<s>${p.old} ₽</s>` : ""}${p.price} ₽</span>
          <button type="button" class="btn-buy ${inCart ? "added" : ""}" data-buy="${p.id}">${inCart ? "В корзине" : "Купить"}</button>
        </div>
      </div>`;
    grid.appendChild(el);
  });
}

$("#shopChips").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  $$("#shopChips .chip").forEach((c) => c.classList.remove("active"));
  chip.classList.add("active");
  shopCat = chip.dataset.cat;
  renderShop();
});

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-buy]");
  if (!btn || btn.classList.contains("added")) return;
  const p = PRODUCTS.find((x) => x.id === btn.dataset.buy);
  if (!p) return;
  state.cart.add(p.id);
  updateCartBadge();
  renderShop();
  if (btn.closest(".shop-featured")) {
    btn.textContent = "В корзине";
    btn.classList.add("added");
  }
  toast("Добавлено в корзину 🛒", `${p.name} · ${p.price} ₽`, "🛍");
});

function updateCartBadge() {
  const badge = $("#cartBadge");
  badge.hidden = state.cart.size === 0;
  badge.textContent = state.cart.size;
}

/* ───────── Настройки ───────── */
const ramSlider = $("#ramSlider");
function syncRam() {
  const v = +ramSlider.value;
  state.ram = v;
  $("#ramValue").textContent = v + " ГБ";
  $("#metaRam").textContent = v + " ГБ";
  const pct = ((v - +ramSlider.min) / (+ramSlider.max - +ramSlider.min)) * 100;
  ramSlider.style.setProperty("--fill", pct + "%");
}
ramSlider.addEventListener("input", syncRam);

$("#accentPicker").addEventListener("click", (e) => {
  const btn = e.target.closest(".accent");
  if (!btn) return;
  $$(".accent").forEach((a) => a.classList.remove("active"));
  btn.classList.add("active");
  const color = btn.dataset.accent;
  const root = document.documentElement.style;
  root.setProperty("--accent", color);
  root.setProperty("--accent-soft", color + "24");
  root.setProperty("--accent-glow", color + "73");
  toast("Тема обновлена", "Акцентный цвет применён ко всему лаунчеру", "🎨");
});

/* ───────── Старт ───────── */
renderServers();
renderVersionGrid();
updateModsBadge();
renderMods();
renderShop();
syncRam();

const savedSession = store.session;
if (savedSession && store.users[savedSession]) {
  /* Сессия сохранена — заходим без экрана входа */
  state.account = { name: savedSession, type: "Pantenol ID" };
  applyAccount();
  authScreen.style.display = "none";
  app.hidden = false;
  toast(`С возвращением, ${savedSession}!`, "Сессия восстановлена", "👤");
} else {
  showAuth();
}
animateCounters();
