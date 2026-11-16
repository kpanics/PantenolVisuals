/* ══════════════ PANTENOL VISUALS · ЛОГИКА ЛАУНЧЕРА v2.6 ══════════════ */
"use strict";

const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* ───────── Хранилище ─────────
   В Electron-приложении данные лежат в ФАЙЛЕ:
   ~/.config/PantenolVisuals/pv-db.json (без localStorage).
   В браузерном превью — демо-режим на localStorage. */
const mem = {};
const DISK = !!window.pvStore;
if (DISK) {
  /* гидратируем кэш из файла БД до любого рендера */
  try { Object.assign(mem, (await window.pvStore.getAll()) || {}); } catch {}
}
const kv = {
  get(k, d) {
    if (k in mem) return mem[k];
    if (!DISK) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } }
    return d;
  },
  set(k, v) {
    mem[k] = v;
    if (DISK) window.pvStore.set(k, v).catch(() => {});
    else { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  },
  del(k) {
    delete mem[k];
    if (DISK) window.pvStore.set(k, null).catch(() => {});
    else { try { localStorage.removeItem(k); } catch {} }
  },
};

/* ───────── Данные ───────── */
/* Все версии — Fabric-based, диапазон 1.21.11 → 26.3 */
const VERSIONS = [
  { num: "26.3",    loader: "Fabric", tags: ["Iris", "Sodium"], size: "1.6 ГБ", note: "Рекомендуемая" },
  { num: "26.2",    loader: "Fabric", tags: ["Iris", "Sodium"], size: "1.6 ГБ" },
  { num: "26.1",    loader: "Fabric", tags: ["Sodium"],         size: "1.5 ГБ" },
  { num: "25.3",    loader: "Fabric", tags: ["Sodium"],         size: "1.5 ГБ" },
  { num: "25.1",    loader: "Fabric", tags: ["Sodium"],         size: "1.4 ГБ" },
  { num: "1.21.11", loader: "Fabric", tags: ["Sodium"],         size: "1.4 ГБ" },
];

const SERVERS = [
  { name: "Pantenol SMP",     ip: "mc.pantenol.ru",      players: "2 341 / 5 000", ping: 23,  bars: 4, official: true,  online: true,
    desc: "Выживание · Сезон II · ресурспаки сети применяются онлайн" },
  { name: "Pantenol Anarchy", ip: "anarchy.pantenol.ru", players: "986 / 2 000",   ping: 31,  bars: 4, official: true,  online: true,
    desc: "Анархия без правил, вайп раз в год" },
  { name: "CubeWars",         ip: "play.cubewars.net",   players: "3 512 / 8 000", ping: 41,  bars: 3, official: false, online: true,
    desc: "BedWars · SkyWars · партнёр сети" },
  { name: "BuildBattle Pro",  ip: "bb.probuilds.gg",     players: "—",             ping: 112, bars: 1, official: false, online: false,
    desc: "Стройка на скорость · техработы" },
];

/* Базовые моды (Fabric); сверху докладываются установленные из Modrinth */
const MODS = [
  { name: "Sodium",            ver: "0.6.3",  cat: "perf",    catName: "Оптимизация", desc: "Современный движок рендера, до 400% к FPS", on: true,  c1: "#34d399", c2: "#0d9488" },
  { name: "Iris Shaders",      ver: "1.8.1",  cat: "shaders", catName: "Шейдеры",     desc: "Полная поддержка шейдерпаков на Fabric",      on: true,  c1: "#a78bfa", c2: "#6d28d9" },
  { name: "Lithium",           ver: "0.14.2", cat: "perf",    catName: "Оптимизация", desc: "Оптимизация логики сервера и тиков",          on: true,  c1: "#38bdf8", c2: "#0369a1" },
  { name: "Fabric API",        ver: "0.110",  cat: "perf",    catName: "Оптимизация", desc: "База почти всех Fabric-модов",                on: true,  c1: "#fbbf24", c2: "#b45309" },
  { name: "Complementary RP",  ver: "5.2",    cat: "shaders", catName: "Шейдеры",     desc: "Шейдерпак Reimagined, пресет «Кино»",         on: true,  c1: "#fb7185", c2: "#be123c" },
  { name: "PvP HUD+",          ver: "2.1.0",  cat: "pvp",     catName: "PvP",         desc: "Индикаторы кристаллов, таймеры тотемов",      on: true,  c1: "#ef4444", c2: "#7f1d1d" },
  { name: "Keystrokes Lite",   ver: "1.4",    cat: "hud",     catName: "HUD",         desc: "Отображение WASD и CPS на экране",            on: false, c1: "#64748b", c2: "#1e293b" },
  { name: "Jade",              ver: "15.8",   cat: "hud",     catName: "HUD",         desc: "Информация о блоке, на который смотришь",     on: true,  c1: "#22d3ee", c2: "#0e7490" },
  { name: "Terralith",         ver: "2.5.7",  cat: "world",   catName: "Мир",         desc: "Сотни новых биомов без новых блоков",         on: false, c1: "#4ade80", c2: "#166534" },
  { name: "Simple Voice Chat", ver: "2.5.26", cat: "hud",     catName: "HUD",         desc: "Голосовой чат прямо в игре",                  on: false, c1: "#c084fc", c2: "#581c87" },
];
kv.get("pv_extra_mods", []).forEach((m) => MODS.unshift(m));

const PRODUCTS = [
  { id: "rp-foton",    cat: "rp",      flag: "ХИТ",  flagClass: "flag-hit", img: "assets/shop-realistic.jpg", name: "Ресурспак «Фотон» 1024x",    author: "Pantenol Studio", price: 499, old: 699 },
  { id: "rp-anime",    cat: "rp",      flag: "NEW",  flagClass: "flag-new", img: "assets/shop-anime.jpg",     name: "Ресурспак «Тюльпан»",       author: "MikaDraws",       price: 299 },
  { id: "rp-pvp",      cat: "rp",      flag: null,   flagClass: "",         img: "assets/shop-pvp.jpg",       name: "PvP-пак «Неон»",            author: "Pantenol Studio", price: 199 },
  { id: "cfg-fixpal",  cat: "blogger", flag: "ХИТ",  flagClass: "flag-hit", img: "assets/shop-blogger.jpg",   name: "Конфиг «Как у ФиксПэла»",   author: "FixPal",          price: 349 },
  { id: "cfg-nerkin",  cat: "blogger", flag: null,   flagClass: "",         img: "assets/news-update.jpg",    name: "Конфиг Неркина",            author: "Nerkin",          price: 249 },
  { id: "cfg-admin",   cat: "admin",   flag: "NEW",  flagClass: "flag-new", img: "assets/news-event.jpg",     name: "Админ-конфиг Pantenol SMP", author: "Администрация",   price: 449 },
  /* Кастомные модели — бесплатно, ставятся кнопкой из меню, сервер покупать не нужно */
  { id: "md-weapons",  cat: "models",  flag: "FREE", flagClass: "flag-new", img: "assets/shop-pvp.jpg",       name: "3D-модели: Оружие+",        author: "Pantenol Studio", price: 0 },
  { id: "md-pets",     cat: "models",  flag: "FREE", flagClass: "flag-new", img: "assets/shop-anime.jpg",     name: "3D-модели: Питомцы",        author: "Pantenol Studio", price: 0 },
  { id: "md-furn",     cat: "models",  flag: null,   flagClass: "",         img: "assets/shop-realistic.jpg", name: "3D-модели: Мебель",         author: "CubeCraft RU",    price: 0 },
];

const RANKS = {
  player:    { name: "Игрок",     color: "#8b98a8" },
  media:     { name: "Медиа",     color: "#a78bfa" },
  moderator: { name: "Модератор", color: "#38bdf8" },
  admin:     { name: "Админ",     color: "#fb7185" },
};
const ADMIN_NICK = "kpanic";

const TAB_TITLES = { home: "Главная", play: "Играть", servers: "Серверы", mods: "Моды", shop: "Магазин", settings: "Настройки", admin: "Админ-панель" };

/* ───────── Состояние ───────── */
const state = {
  version: VERSIONS[VERSIONS.length - 1],
  account: null,
  isAdmin: false,
  cart: new Set(),
  launching: false,
};
state.version = VERSIONS[0];

/* ───────── Аккаунты (файл БД в приложении / localStorage только в демо-превью) ───────── */
const store = {
  get users()    { return kv.get("pv_users", {}); },
  set users(v)   { kv.set("pv_users", v); },
  get session()  { return kv.get("pv_session", null); },
  set session(v) { v ? kv.set("pv_session", v) : kv.del("pv_session"); },
};

function getRank(nick) {
  if (nick && nick.toLowerCase() === ADMIN_NICK) return "admin";
  return kv.get("pv_ranks", {})[nick] || "player";
}
function setRank(nick, r) {
  const all = kv.get("pv_ranks", {});
  all[nick] = r;
  kv.set("pv_ranks", all);
}

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

/* ───────── Выпадающие списки ───────── */
const dropdowns = [];
function registerDropdown(btn, menu, renderItems) {
  if (!btn || !menu) return;
  dropdowns.push({ btn, menu });
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

/* ═══════════ АВТОРИЗАЦИЯ (только Pantenol ID) ═══════════ */
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
  applyAdmin();
  authScreen.classList.add("hidden");
  setTimeout(() => { authScreen.style.display = "none"; }, 480);
  app.hidden = false;
  toast(`Привет, ${user.name}! 👋`, "Pantenol ID · приятной игры", "👤");
}

/* Подстраницы Вход ⇄ Регистрация */
function showAuthPage(page) {
  const toRegister = page === "register";
  $("#authPageRegister").hidden = !toRegister;
  $("#authPageLogin").hidden = toRegister;
  const visible = toRegister ? $("#authPageRegister") : $("#authPageLogin");
  visible.style.animation = "none";
  void visible.offsetWidth;
  visible.style.animation = "";
}
$("#goRegister").addEventListener("click", () => showAuthPage("register"));
$("#goLogin").addEventListener("click", () => showAuthPage("login"));

function authError(el, card, msg) {
  el.textContent = msg;
  card.classList.remove("shake");
  void card.offsetWidth;
  card.classList.add("shake");
}

$("#formLogin").addEventListener("submit", (e) => {
  e.preventDefault();
  const nick = $("#loginNick").value.trim();
  const pass = $("#loginPass").value;
  const errEl = $("#loginErr");
  if (nick.length < 3) return authError(errEl, $("#loginCard"), "Ник короче 3 символов");
  const user = store.users[nick];
  if (!user) return authError(errEl, $("#loginCard"), "Аккаунт не найден — зарегистрируйтесь");
  if (user.pass !== pass) return authError(errEl, $("#loginCard"), "Неверный пароль");
  errEl.textContent = "";
  if ($("#loginRemember").checked) store.session = nick;
  enterLauncher({ name: nick, type: "Pantenol ID" });
});

$("#formRegister").addEventListener("submit", (e) => {
  e.preventDefault();
  const nick = $("#regNick").value.trim();
  const pass = $("#regPass").value;
  const pass2 = $("#regPass2").value;
  const errEl = $("#regErr");
  if (!/^\w{3,16}$/.test(nick)) return authError(errEl, $("#regCard"), "Ник: 3–16 латинских букв, цифр или _");
  if (pass.length < 8) return authError(errEl, $("#regCard"), "Пароль короче 8 символов");
  if (pass !== pass2) return authError(errEl, $("#regCard"), "Пароли не совпадают");
  const users = store.users;
  if (users[nick]) return authError(errEl, $("#regCard"), "Этот ник уже занят");
  users[nick] = { pass, created: Date.now() };
  store.users = users;
  store.session = nick;
  errEl.textContent = "";
  toast("Аккаунт создан 🎉", `Добро пожаловать, ${nick}!`, "★");
  enterLauncher({ name: nick, type: "Pantenol ID" });
});

/* ───────── Аккаунт / Личный кабинет ───────── */
function applyAccount() {
  $("#accountBtnName").textContent = state.account ? state.account.name : "Аккаунт";
}

function applyAdmin() {
  state.isAdmin = !!state.account && state.account.name.toLowerCase() === ADMIN_NICK;
  $("#navAdmin").hidden = !state.isAdmin;
}

registerDropdown($("#accountMenuBtn"), $("#accountMenu"), (menu, close) => {
  const users = store.users;

  const head = document.createElement("div");
  head.className = "dropdown-head";
  head.textContent = "Аккаунт";
  menu.appendChild(head);

  /* Личный кабинет */
  const cab = document.createElement("button");
  cab.type = "button";
  cab.className = "dropdown-item";
  cab.innerHTML = `<span>👤 <b>Личный кабинет</b></span><span class="dim">профиль, покупки</span>`;
  cab.addEventListener("click", (e) => { e.stopPropagation(); close(); openProfile(); });
  menu.appendChild(cab);

  /* Админ-панель (только владельцу) */
  if (state.isAdmin) {
    const adm = document.createElement("button");
    adm.type = "button";
    adm.className = "dropdown-item";
    adm.innerHTML = `<span style="color:#fb7185">🛡 <b>Админ-панель</b></span>`;
    adm.addEventListener("click", (e) => {
      e.stopPropagation();
      close();
      document.querySelector('[data-tab="admin"]').click();
    });
    menu.appendChild(adm);
  }

  const d1 = document.createElement("div");
  d1.className = "dropdown-divider";
  menu.appendChild(d1);

  const head2 = document.createElement("div");
  head2.className = "dropdown-head";
  head2.textContent = "Переключиться";
  menu.appendChild(head2);

  Object.keys(users).forEach((n) => {
    const isCurrent = state.account && state.account.name === n;
    const item = document.createElement("button");
    item.type = "button";
    item.className = "dropdown-item";
    item.innerHTML = `
      <img src="assets/avatar.png" alt="">
      <span><b>${n}</b>${isCurrent ? ' <span style="color:var(--accent)">· текущий</span>' : ""}</span>
      <span class="dim">${RANKS[getRank(n)].name}</span>`;
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      state.account = { name: n, type: "Pantenol ID" };
      store.session = n;
      applyAccount();
      applyAdmin();
      close();
      toast("Аккаунт переключён", `Теперь вы играете как ${n}`, "👤");
    });
    menu.appendChild(item);
  });

  const d2 = document.createElement("div");
  d2.className = "dropdown-divider";
  menu.appendChild(d2);

  const add = document.createElement("button");
  add.type = "button";
  add.className = "dropdown-item";
  add.innerHTML = `<span style="color:var(--accent)">＋ Добавить аккаунт</span>`;
  add.addEventListener("click", (e) => { e.stopPropagation(); close(); store.session = null; showAuthPage("register"); showAuth(); });
  menu.appendChild(add);

  const out = document.createElement("button");
  out.type = "button";
  out.className = "dropdown-item danger";
  out.innerHTML = `<span>Выйти из аккаунта</span>`;
  out.addEventListener("click", (e) => {
    e.stopPropagation();
    close();
    logout();
  });
  menu.appendChild(out);
});

function logout() {
  store.session = null;
  state.account = null;
  applyAdmin();
  closeProfile();
  showAuthPage("login");
  showAuth();
  toast("Вы вышли", "Сессия завершена", "👋");
}
$("#logoutBtn").addEventListener("click", logout);

/* Личный кабинет — модалка */
function openProfile() {
  if (!state.account) return;
  const nick = state.account.name;
  const rank = RANKS[getRank(nick)];
  $("#profileName").textContent = nick;
  const badge = $("#profileRank");
  badge.textContent = rank.name;
  badge.style.background = rank.color + "22";
  badge.style.color = rank.color;

  let h = 0;
  for (const ch of nick) h = (h * 31 + ch.charCodeAt(0)) % 89999 + 10000;
  $("#profileId").textContent = "#" + h;

  const created = store.users[nick] && store.users[nick].created;
  $("#profileDate").textContent = created
    ? new Date(created).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  const buys = kv.get("pv_purchases", []).filter((p) => p.user === nick);
  $("#profileBuys").textContent = buys.length;
  const box = $("#profilePurchases");
  box.innerHTML = "";
  if (!buys.length) {
    box.innerHTML = `<div class="purchases-empty">Пока пусто — загляните в Магазин 🛒</div>`;
  } else {
    buys.slice().reverse().forEach((p) => {
      const row = document.createElement("div");
      row.className = "purchase-row";
      row.innerHTML = `<span>${p.name}</span><span class="dim">${p.price} ₽ · ${new Date(p.date).toLocaleDateString("ru-RU")}</span>`;
      box.appendChild(row);
    });
  }
  $("#profileModal").hidden = false;
}
function closeProfile() { $("#profileModal").hidden = true; }
$("#profileClose").addEventListener("click", closeProfile);
$("#profileModal").addEventListener("click", (e) => { if (e.target === $("#profileModal")) closeProfile(); });
$("#profileLogout").addEventListener("click", logout);
$("#profileSettings").addEventListener("click", () => {
  closeProfile();
  document.querySelector('[data-tab="settings"]').click();
});

/* ───────── Вкладки ───────── */
$$(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.dataset.tab === "admin" && !state.isAdmin) {
      toast("Нет доступа", "Админ-панель доступна только владельцу сети", "🔒");
      return;
    }
    $$(".nav-item").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    $$(".page").forEach((p) => p.classList.remove("active"));
    $("#page-" + btn.dataset.tab).classList.add("active");
    $("#topbarTitle").textContent = TAB_TITLES[btn.dataset.tab] || "";
    closeAllDropdowns();
    $(".content").scrollTo({ top: 0, behavior: "smooth" });
    if (btn.dataset.tab === "admin" && state.isAdmin) renderAdmin();
    if (btn.dataset.tab === "mods" && !mrLoadedOnce) { mrLoadedOnce = true; mrSearchRun(); }
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
  $("#playLoaderLabel").textContent = [v.loader, ...v.tags].join(" · ");
  $("#mrVer").textContent = v.num;
  renderVersionGrid();
}

/* ───────── Счётчики статистики ───────── */
function animateCounters() {
  $$(".stat-num").forEach((el) => {
    const target = +el.dataset.count;
    const dur = 1100, t0 = performance.now();
    (function tick() {
      const p = Math.min((performance.now() - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString("ru-RU");
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

function resetLaunchUi() {
  state.launching = false;
  const bigBtn = $("#bigPlayBtn");
  bigBtn.style.opacity = "";
  bigBtn.style.pointerEvents = "";
  $("#bigPlayText").textContent = "ИГРАТЬ";
  $("#progressWrap").hidden = true;
}

function launchGame() {
  if (state.launching) return;
  state.launching = true;
  const bigBtn = $("#bigPlayBtn");
  $("#progressWrap").hidden = false;
  bigBtn.style.opacity = ".55";
  bigBtn.style.pointerEvents = "none";
  $("#progressFill").style.width = "0%";

  if (window.pvMC) {
    mcLaunchFlow()
      .catch((e) => toast("Ошибка запуска", String(e && e.message || e), "✕"))
      .finally(resetLaunchUi);
    return;
  }
  simulateLaunch();
}

/* Настоящий запуск: скачивание с Mojang + старт java-процесса */
async function mcLaunchFlow() {
  const ver = ($("#vanillaSelect") && $("#vanillaSelect").value) || (await pvMC.latest());
  const name = state.account ? state.account.name : "Player";
  const ramMb = Math.max(1024, (state.ram || 4) * 1024);

  const installed = await pvMC.status(ver);
  if (!installed) {
    $("#bigPlayText").textContent = "СКАЧИВАЮ…";
    await pvMC.install(ver); /* прогресс приходит через pvMC.onProgress */
    toast("Minecraft установлен ⬇", `Релиз ${ver} · vanilla · серверы Mojang`, "⬇");
    updateVanillaStatus();
  }

  $("#bigPlayText").textContent = "ЗАПУСК…";
  $("#progressStage").textContent = `JVM (${state.ram || 4} ГБ) · запуск процесса…`;
  $("#progressPct").textContent = "100%";
  $("#progressFill").style.width = "100%";

  const res = await pvMC.launch({ version: ver, username: name, ramMb });
  if (res && res.noJava) {
    toast("Нужна Java ☕", "sudo apt install openjdk-21-jre — потом перезапустите", "⚠");
    return;
  }
  toast("Игра запущена 🎮", `Minecraft ${ver} · аккаунт ${name} · PID ${res && res.pid ? res.pid : "—"}`, "▶");
}

/* Симуляция для браузерного превью */
function simulateLaunch() {
  let stage = 0;
  (function nextStage() {
    if (stage >= LAUNCH_STAGES.length) {
      resetLaunchUi();
      const name = state.account ? state.account.name : "Игрок";
      toast("Режим предпросмотра", "Настоящая загрузка работает в десктоп-приложении", "👀");
      return;
    }
    const [label, pct] = LAUNCH_STAGES[stage];
    $("#progressStage").textContent = label.replace("JVM…", `JVM (${state.ram || 8} ГБ)…`);
    $("#progressPct").textContent = pct + "%";
    $("#progressFill").style.width = pct + "%";
    if (stage === LAUNCH_STAGES.length - 1) $("#bigPlayText").textContent = "ЗАПУСК…";
    stage++;
    setTimeout(nextStage, 750 + Math.random() * 500);
  })();
}

/* ─── Настоящие релизы Minecraft (список с Mojang) ─── */
async function initVanilla() {
  const sel = $("#vanillaSelect");
  if (!sel) return;
  try {
    let ids;
    if (window.pvMC) {
      ids = await pvMC.versions();
    } else {
      const m = await fetch("https://piston-meta.mojang.com/mc/game/version_manifest_v2.json").then((r) => r.json());
      ids = m.versions.filter((v) => v.type === "release").slice(0, 25).map((v) => v.id);
    }
    sel.innerHTML = "";
    ids.forEach((id, i) => {
      const o = document.createElement("option");
      o.value = id;
      o.textContent = id + (i === 0 ? " · последний" : "");
      sel.appendChild(o);
    });
    sel.addEventListener("change", updateVanillaStatus);
    updateVanillaStatus();
  } catch {
    sel.innerHTML = "<option>Нет сети</option>";
    $("#vanillaStatus").textContent = "оффлайн";
    $("#vanillaStatus").className = "vanilla-status warn";
  }
}

async function updateVanillaStatus() {
  const el = $("#vanillaStatus");
  const ver = $("#vanillaSelect").value;
  if (!window.pvMC) {
    el.textContent = "в приложении — настоящая загрузка";
    el.className = "vanilla-status warn";
    return;
  }
  const ok = await pvMC.status(ver);
  el.textContent = ok ? "✓ установлен" : "скачается при запуске";
  el.className = ok ? "vanilla-status ok" : "vanilla-status warn";
}

/* прогресс установки Minecraft → в красивый прогресс-бар */
if (window.pvMC) {
  pvMC.onProgress(({ stage, pct }) => {
    $("#progressStage").textContent = stage;
    $("#progressPct").textContent = pct + "%";
    $("#progressFill").style.width = pct + "%";
  });
  pvMC.java().then((has) => {
    $("#metaJava").textContent = has ? "✓ java найдена" : "⚠ нужна Java";
  });
}

/* ─── Баннер автообновления ─── */
if (window.pvApp) {
  pvApp.onUpdateReady(({ sha }) => {
    $("#updateSha").textContent = "#" + sha;
    $("#updateBanner").hidden = false;
  });
  $("#updRestart").addEventListener("click", () => pvApp.restart());
  $("#updLater").addEventListener("click", () => { $("#updateBanner").hidden = true; });
}

$("#homePlayBtn").addEventListener("click", () => {
  document.querySelector('[data-tab="play"]').click();
  setTimeout(launchGame, 350);
});
$("#bigPlayBtn").addEventListener("click", launchGame);

/* ───────── СЕРВЕРЫ ───────── */
function getCustomServers() { return kv.get("pv_custom_servers", []); }

function renderServersPage() {
  const grid = $("#serversGrid");
  grid.innerHTML = "";
  const custom = getCustomServers().map((s, i) => ({
    name: s.name, ip: s.ip, players: "—", online: true, official: false, custom: i,
    desc: "Ваш сервер · Pantenol ID подходит", ping: null, bars: 3,
  }));
  [...SERVERS, ...custom].forEach((s) => {
    const el = document.createElement("div");
    el.className = "server-card card";
    el.innerHTML = `
      ${s.custom !== undefined ? '<button type="button" class="server-del" title="Удалить">✕</button>' : ""}
      <div class="server-card-top">
        <div class="server-icon">${s.name[0]}</div>
        <div>
          <div class="server-card-name">${s.name}
            <span class="pill ${s.online ? "pill-on" : "pill-off"}">${s.online ? "ОНЛАЙН" : "ОФФЛАЙН"}</span>
            ${s.official ? '<span class="pill pill-official">ОФИЦИАЛЬНЫЙ</span>' : ""}
          </div>
        </div>
      </div>
      <div class="server-card-desc">${s.desc}</div>
      <div class="server-card-foot">
        <button type="button" class="server-ip" title="Нажмите, чтобы скопировать">${s.ip}</button>
        <span class="server-players">${s.online ? s.players + " игр." : "недоступен"}</span>
      </div>`;
    el.querySelector(".server-ip").addEventListener("click", () => {
      const done = () => toast("IP скопирован 📋", s.ip, "⧉");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(s.ip).then(done).catch(done);
      } else done();
    });
    const del = el.querySelector(".server-del");
    if (del) del.addEventListener("click", () => {
      const list = getCustomServers();
      list.splice(s.custom, 1);
      kv.set("pv_custom_servers", list);
      renderServersPage();
      toast("Сервер удалён", s.name, "✕");
    });
    grid.appendChild(el);
  });
}
renderServersPage();

$("#serverAddForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("#srvName").value.trim();
  const ip = $("#srvIp").value.trim();
  if (name.length < 2) return toast("Название короткое", "Минимум 2 символа", "✕");
  if (!/^[\w.\-:]+$/.test(ip)) return toast("Некорректный IP", "Пример: play.myserver.ru", "✕");
  const list = getCustomServers();
  if (list.some((s) => s.ip === ip)) return toast("Уже добавлен", ip, "!");
  list.push({ name, ip });
  kv.set("pv_custom_servers", list);
  $("#srvName").value = "";
  $("#srvIp").value = "";
  renderServersPage();
  toast("Сервер добавлен 🌐", `${name} · ${ip}`);
});

$("#btnQuickJoin").addEventListener("click", () => {
  toast("Подключение…", `${SERVERS[0].name} · ${SERVERS[0].ip}`, "🌐");
  setTimeout(() => toast("Вы в игре! 🎮", "Аккаунт Pantenol ID подтверждён онлайн", "✓"), 1600);
});

/* Быстрые серверы на вкладке «Играть» */
function renderQuickServers() {
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
        <span class="ping-ms">${s.online ? s.ping + " мс" : "офф"}</span>
      </div>`;
    el.addEventListener("click", () => toast(s.online ? "Подключение…" : "Сервер недоступен", `${s.name} · ${s.ip}`, "🌐"));
    list.appendChild(el);
  });
}
renderQuickServers();

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
      <div class="version-size">Fabric · установлено · ${v.size}</div>`;
    el.addEventListener("click", () => {
      selectVersion(v);
      toast("Версия выбрана", `Minecraft ${v.num} · Fabric`, "⬇");
    });
    grid.appendChild(el);
  });
}
renderVersionGrid();

/* ───────── МОДЫ: локальный список ───────── */
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
    const icon = m.icon
      ? `<div class="mod-icon"><img src="${m.icon}" alt=""></div>`
      : `<div class="mod-icon" style="--c1:${m.c1};--c2:${m.c2}">${m.name.slice(0, 2).toUpperCase()}</div>`;
    el.innerHTML = `
      ${icon}
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
updateModsBadge();
renderMods();

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

/* ───────── МОДЫ: живой каталог Modrinth ───────── */
let mrLoadedOnce = false;
let mrResults = [];

async function mrSearchRun() {
  const q = $("#mrSearch").value.trim();
  const ver = state.version.num;
  const list = $("#mrList");
  list.innerHTML = `<div class="card mr-hint">Загружаю с Modrinth…</div>`;
  try {
    const facets = JSON.stringify([["project_type:mod"], ["categories:fabric"], ["versions:" + ver]]);
    const url = `https://api.modrinth.com/v2/search?limit=10&index=downloads&query=${encodeURIComponent(q)}&facets=${encodeURIComponent(facets)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("http " + res.status);
    const data = await res.json();
    mrResults = data.hits || [];
    renderMr();
  } catch {
    list.innerHTML = `<div class="card mr-hint">Не удалось связаться с Modrinth (нужен интернет). Установленные моды выше работают всегда.</div>`;
  }
}

async function installMr(idx, btn) {
  const hit = mrResults[idx];
  if (!hit) return;
  btn.disabled = true;
  btn.textContent = "…";
  const ver = state.version.num;
  try {
    const q = `loaders=${encodeURIComponent('["fabric"]')}&game_versions=${encodeURIComponent('["' + ver + '"]')}`;
    const res = await fetch(`https://api.modrinth.com/v2/project/${encodeURIComponent(hit.slug)}/version?${q}`);
    const versions = await res.json();
    const file = versions && versions[0] && (versions[0].files.find((f) => f.primary) || versions[0].files[0]);
    if (!file) throw new Error("nofile");

    if (window.pvMods) {
      btn.textContent = "Скачивание…";
      await window.pvMods.install({ url: file.url, name: file.filename, version: ver });
      toast("Мод установлен ⚡", `${hit.title} → mods/ (${ver})`, "⬇");
    } else {
      toast("Мод загружен", `${file.filename} — в десктоп-приложении положится в mods/ само`, "⬇");
      window.open(file.url, "_blank");
    }

    const extra = kv.get("pv_extra_mods", []);
    extra.unshift({ name: hit.title, ver: "MR · " + ver, cat: "world", catName: "Modrinth", desc: hit.description, on: true, c1: "#34d399", c2: "#0d9488", icon: hit.icon_url || null });
    kv.set("pv_extra_mods", extra);
    MODS.unshift(extra[0]);
    updateModsBadge();
    renderMods();
    btn.textContent = "Установлен ✓";
    btn.classList.add("done");
  } catch {
    btn.disabled = false;
    btn.textContent = "Установить";
    toast("Не удалось", `Нет Fabric-сборки под ${ver}`, "✕");
  }
}

function renderMr() {
  const list = $("#mrList");
  list.innerHTML = "";
  if (!mrResults.length) {
    list.innerHTML = `<div class="card mr-hint">Под версию ${state.version.num} ничего не нашлось — попробуйте другой запрос.</div>`;
    return;
  }
  mrResults.forEach((h, i) => {
    const el = document.createElement("div");
    el.className = "mod";
    const already = MODS.some((m) => m.icon && m.icon === h.icon_url && m.name === h.title);
    el.innerHTML = `
      <div class="mod-icon">${h.icon_url ? `<img src="${h.icon_url}" alt="" loading="lazy">` : h.title.slice(0, 2).toUpperCase()}</div>
      <div class="mod-info">
        <span class="mod-name">${h.title} <span class="mod-ver">${h.author || "modrinth"}</span></span>
        <span class="mod-desc">${h.description || ""}</span>
      </div>
      <span class="mod-dl">${Intl.NumberFormat("ru-RU", { notation: "compact" }).format(h.downloads || 0)} ⬇</span>
      <button type="button" class="btn-install ${already ? "done" : ""}" ${already ? "disabled" : ""}>${already ? "Установлен ✓" : "Установить"}</button>`;
    el.querySelector(".btn-install").addEventListener("click", (e) => installMr(i, e.currentTarget));
    list.appendChild(el);
  });
}

$("#mrGo").addEventListener("click", mrSearchRun);
$("#mrSearch").addEventListener("keydown", (e) => { if (e.key === "Enter") mrSearchRun(); });

/* ───────── МАГАЗИН ───────── */
let shopCat = "all";

function renderShop() {
  const grid = $("#shopGrid");
  grid.innerHTML = "";
  PRODUCTS.filter((p) => shopCat === "all" || p.cat === shopCat).forEach((p) => {
    const inCart = state.cart.has(p.id);
    const free = p.price === 0;
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
          <span class="product-price">${free ? "Бесплатно" : (p.old ? `<s>${p.old} ₽</s>` : "") + p.price + " ₽"}</span>
          <button type="button" class="btn-buy ${inCart ? "added" : ""}" data-buy="${p.id}">${inCart ? (free ? "Установлено" : "В корзине") : free ? "Установить" : "Купить"}</button>
        </div>
      </div>`;
    grid.appendChild(el);
  });
}
renderShop();

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
  if (p.price === 0) {
    /* Кастомная модель — ставится сразу, без покупки сервера */
    toast("Модель установлена 🎁", `${p.name} → применится при входе в игру`, "🧩");
  } else {
    const buys = kv.get("pv_purchases", []);
    buys.push({ user: state.account ? state.account.name : "—", pid: p.id, name: p.name, price: p.price, date: Date.now() });
    kv.set("pv_purchases", buys);
    toast("Добавлено в корзину 🛒", `${p.name} · ${p.price} ₽`, "🛍");
  }
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
  ramSlider.style.setProperty("--fill", ((v - +ramSlider.min) / (+ramSlider.max - +ramSlider.min)) * 100 + "%");
}
ramSlider.addEventListener("input", syncRam);
syncRam();

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

/* ═══════════ АДМИН-ПАНЕЛЬ (KPanic) ═══════════ */
function getPacks() {
  let packs = kv.get("pv_packs", null);
  if (!packs) {
    packs = [
      { id: "p1", name: "Ресурспак «Фотон» 1024x", ver: "26.3", size: "48 МБ", img: "assets/shop-realistic.jpg", on: true },
      { id: "p2", name: "Ресурспак «Тюльпан»",     ver: "26.3", size: "22 МБ", img: "assets/shop-anime.jpg",     on: false },
      { id: "p3", name: "PvP-пак «Неон»",          ver: "26.2", size: "14 МБ", img: "assets/shop-pvp.jpg",       on: true },
    ];
    kv.set("pv_packs", packs);
  }
  return packs;
}

function renderAdmin() {
  renderAdminPacks();
  renderRankList();
  const cfg = kv.get("pv_admin_cfg", { forcePack: true, autoUpdate: true, openReg: true, api: "https://api.pantenol.ru" });
  $("#admForcePack").checked = cfg.forcePack;
  $("#admAutoUpdate").checked = cfg.autoUpdate;
  $("#admOpenReg").checked = cfg.openReg;
  $("#admApi").value = cfg.api;
}

["admForcePack", "admAutoUpdate", "admOpenReg"].forEach((id) => {
  $("#" + id).addEventListener("change", () => {
    const cfg = kv.get("pv_admin_cfg", { forcePack: true, autoUpdate: true, openReg: true, api: "https://api.pantenol.ru" });
    cfg.forcePack = $("#admForcePack").checked;
    cfg.autoUpdate = $("#admAutoUpdate").checked;
    cfg.openReg = $("#admOpenReg").checked;
    cfg.api = $("#admApi").value;
    kv.set("pv_admin_cfg", cfg);
    toast("Настройка сети сохранена", "", "⚙");
  });
});
$("#admApi").addEventListener("change", () => {
  const cfg = kv.get("pv_admin_cfg", { forcePack: true, autoUpdate: true, openReg: true, api: "https://api.pantenol.ru" });
  cfg.api = $("#admApi").value.trim();
  kv.set("pv_admin_cfg", cfg);
  toast("API сервера обновлён", cfg.api, "⚙");
});

function renderAdminPacks() {
  const box = $("#adminPacks");
  box.innerHTML = "";
  const packs = getPacks();
  if (!packs.length) {
    box.innerHTML = `<div class="purchases-empty">Паков нет — загрузите первый ниже ⬇</div>`;
    return;
  }
  packs.forEach((p, i) => {
    const row = document.createElement("div");
    row.className = "pack-row";
    row.innerHTML = `
      <img src="${p.img}" alt="">
      <div class="pack-row-info">
        <div class="pack-row-name">${p.name}</div>
        <div class="pack-row-meta">${p.ver} · ${p.size} · ${p.on ? '<b style="color:var(--accent)">загружается игрокам</b>' : "выключен"}</div>
      </div>
      <label class="switch" title="Загружать игрокам"><input type="checkbox" ${p.on ? "checked" : ""}><i></i></label>
      <button type="button" class="pack-del" title="Удалить пак">✕</button>`;
    row.querySelector("input").addEventListener("change", (ev) => {
      packs[i].on = ev.target.checked;
      kv.set("pv_packs", packs);
      renderAdminPacks();
      toast(ev.target.checked ? "Пак включён" : "Пак выключен", `${p.name} ${ev.target.checked ? "будет загружаться игрокам" : "убран из автозагрузки"}`, ev.target.checked ? "✓" : "✕");
    });
    row.querySelector(".pack-del").addEventListener("click", () => {
      packs.splice(i, 1);
      kv.set("pv_packs", packs);
      renderAdminPacks();
      toast("Пак удалён", p.name, "🗑");
    });
    box.appendChild(row);
  });
}

$("#packFileBtn").addEventListener("click", () => $("#packFile").click());
$("#packFile").addEventListener("change", (e) => {
  const f = e.target.files && e.target.files[0];
  $("#packFileName").textContent = f ? f.name : "не выбран";
});
$("#packUpload").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("#packName").value.trim();
  const ver = $("#packVer").value.trim() || state.version.num;
  const fname = $("#packFileName").textContent;
  if (name.length < 3) return toast("Название короткое", "Минимум 3 символа", "✕");
  if (fname === "не выбран" || !fname.toLowerCase().endsWith(".zip")) return toast("Выберите .zip", "Ресурспак должен быть zip-архивом", "✕");
  const packs = getPacks();
  packs.unshift({ id: "p" + Date.now(), name, ver, size: fname, img: "assets/logo.png", on: true });
  kv.set("pv_packs", packs);
  $("#packName").value = "";
  $("#packVer").value = "";
  $("#packFile").value = "";
  $("#packFileName").textContent = "не выбран";
  renderAdminPacks();
  toast("Пак загружен ✅", `${name} (${fname}) — включён в автозагрузку`, "⬆");
});

function renderRankList() {
  const box = $("#rankList");
  box.innerHTML = "";
  const names = new Set(Object.keys(store.users));
  if (state.account) names.add(state.account.name);
  names.add("KPanic");
  names.add("Steve_RU");
  names.add("Notch_Fan88");
  [...names].forEach((n) => {
    const rk = getRank(n);
    const locked = n.toLowerCase() === ADMIN_NICK;
    const row = document.createElement("div");
    row.className = "rank-row";
    row.innerHTML = `
      <img src="assets/avatar.png" alt="">
      <div class="rank-row-name">${n}
        <span class="dim">${locked ? "владелец сети" : state.account && state.account.name === n ? "это вы" : "Pantenol ID"}</span>
      </div>
      <select class="rank-select" ${locked ? "disabled" : ""}>
        ${Object.entries(RANKS).map(([kk, r]) => `<option value="${kk}" ${kk === rk ? "selected" : ""}>${r.name}</option>`).join("")}
      </select>`;
    const sel = row.querySelector("select");
    sel.style.color = RANKS[rk].color;
    sel.addEventListener("change", () => {
      setRank(n, sel.value);
      sel.style.color = RANKS[sel.value].color;
      toast("Ранг обновлён", `${n} → ${RANKS[sel.value].name}`, "🎖");
    });
    box.appendChild(row);
  });
}

/* ───────── Режим Electron ───────── */
if (window.pvWindow) {
  document.body.classList.add("electron");
  $("#winMin").addEventListener("click", () => window.pvWindow.minimize());
  $("#winMax").addEventListener("click", () => window.pvWindow.toggleMaximize());
  $("#winClose").addEventListener("click", () => window.pvWindow.close());
}

/* ───────── Старт ───────── */
/* Все оверлеи гарантированно закрыты при запуске —
   личный кабинет открывается ТОЛЬКО по клику в меню аккаунта */
closeProfile();
$("#profileModal").hidden = true;
closeAllDropdowns();

/* Escape закрывает модалку, выпадашки и плейлист плеера */
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!$("#profileModal").hidden) closeProfile();
  closeAllDropdowns();
  const pop = document.getElementById("scPopover");
  if (pop) pop.classList.remove("open");
});

$("#mrVer").textContent = state.version.num;
selectVersion(state.version);
initVanilla();

const savedSession = store.session;
if (savedSession && store.users[savedSession]) {
  state.account = { name: savedSession, type: "Pantenol ID" };
  applyAccount();
  applyAdmin();
  authScreen.style.display = "none";
  app.hidden = false;
  toast(`С возвращением, ${savedSession}!`, "Сессия восстановлена", "👤");
} else {
  showAuth();
}
animateCounters();
