/* ══════════════ PANTENOL VISUALS · ЛОГИКА ЛАУНЧЕРА ══════════════ */

/* ───────── Данные ───────── */
const VERSIONS = [
  { num: "1.21.3",  loader: "Fabric",  tags: ["Iris", "Sodium"], size: "1.4 ГБ", note: "Рекомендуемая" },
  { num: "1.21.1",  loader: "Forge",   tags: ["OptiFine"],       size: "1.3 ГБ" },
  { num: "1.20.4",  loader: "Fabric",  tags: ["Iris", "Sodium"], size: "1.2 ГБ" },
  { num: "1.19.2",  loader: "Quilt",   tags: ["Sodium"],         size: "1.1 ГБ" },
  { num: "1.16.5",  loader: "Forge",   tags: ["OptiFine"],       size: "980 МБ" },
  { num: "1.12.2",  loader: "Vanilla", tags: [],                 size: "720 МБ" },
];

const ACCOUNTS = [
  { name: "Steve_RU",    type: "Лицензия", ava: "assets/avatar.png" },
  { name: "Notch_Fan88", type: "Ely.by",   ava: "assets/avatar.png" },
  { name: "Гость",       type: "Оффлайн",  ava: "assets/avatar.png" },
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
  { name: "PvP HUD+",          ver: "2.1.0",  cat: "pvp",     catName: "PvP",         desc: "Кристалл-аура индикаторы, таймеры тотемов",   on: true,  c1: "#ef4444", c2: "#7f1d1d" },
  { name: "Keystrokes Lite",   ver: "1.4",    cat: "hud",     catName: "HUD",         desc: "Отображение WASD и CPS на экране",            on: false, c1: "#64748b", c2: "#1e293b" },
  { name: "Jade",              ver: "15.8",   cat: "hud",     catName: "HUD",         desc: "Информация о блоке, на который смотришь",     on: true,  c1: "#22d3ee", c2: "#0e7490" },
  { name: "Terralith",         ver: "2.5.7",  cat: "world",   catName: "Мир",         desc: "Сотни новых биомов без новых блоков",         on: false, c1: "#4ade80", c2: "#166534" },
  { name: "Waystones",         ver: "18.0.1", cat: "world",   catName: "Мир",         desc: "Камни телепортации между точками",            on: false, c1: "#c084fc", c2: "#581c87" },
];

const PRODUCTS = [
  { id: "rp-foton",    cat: "rp",      flag: "ХИТ",  flagClass: "flag-hit", img: "assets/shop-realistic.jpg", name: "Ресурспак «Фотон» 1024x",   author: "Pantenol Studio", price: 499, old: 699 },
  { id: "rp-anime",    cat: "rp",      flag: "NEW",  flagClass: "flag-new", img: "assets/shop-anime.jpg",    name: "Ресурспак «Тюльпан»",      author: "MikaDraws",       price: 299 },
  { id: "rp-pvp",      cat: "rp",      flag: null,   flagClass: "",         img: "assets/shop-pvp.jpg",      name: "PvP-пак «Неон»",           author: "Pantenol Studio", price: 199 },
  { id: "cfg-fixpal",  cat: "blogger", flag: "ХИТ",  flagClass: "flag-hit", img: "assets/shop-blogger.jpg",  name: "Конфиг «Как у ФиксПэла»",  author: "FixPal",          price: 349 },
  { id: "cfg-nerkin",  cat: "blogger", flag: null,   flagClass: "",         img: "assets/news-update.jpg",   name: "Конфиг Неркина",           author: "Nerkin",          price: 249 },
  { id: "cfg-admin",   cat: "admin",   flag: "NEW",  flagClass: "flag-new", img: "assets/news-event.jpg",    name: "Админ-конфиг Pantenol SMP", author: "Администрация",   price: 449 },
];

/* ───────── Состояние ───────── */
const state = {
  version: VERSIONS[0],
  account: ACCOUNTS[0],
  cart: new Set(),
  launching: false,
};

const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* ───────── Уведомления ───────── */
function toast(title, sub = "", icon = "✓") {
  const box = $("#toasts");
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

/* ───────── Вкладки ───────── */
$$(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    $$(".nav-item").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    $$(".page").forEach((p) => p.classList.remove("active"));
    $("#page-" + btn.dataset.tab).classList.add("active");
    $(".content").scrollTo({ top: 0, behavior: "smooth" });
  });
});

/* ───────── Выпадающие списки ───────── */
function setupDropdown(btnId, dropId, renderItem, onPick, closeSiblings) {
  const btn = $(btnId);
  const drop = $(dropId);
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeSiblings();
    drop.classList.toggle("open");
    btn.classList.toggle("open", drop.classList.contains("open"));
    if (drop.classList.contains("open")) {
      drop.innerHTML = "";
      renderItem(drop, () => {
        drop.classList.remove("open");
        btn.classList.remove("open");
      });
      onPick._done = true;
    }
  });
}

function closeAllDropdowns() {
  $$(".dropdown").forEach((d) => d.classList.remove("open"));
  $$(".select-btn").forEach((b) => b.classList.remove("open"));
}
document.addEventListener("click", closeAllDropdowns);

setupDropdown("#versionBtn", "#versionDropdown", (drop, close) => {
  VERSIONS.forEach((v) => {
    const item = document.createElement("button");
    item.className = "dropdown-item";
    item.innerHTML = `
      <span><b>${v.num}</b> ${v.note ? "· <span style='color:var(--accent)'>" + v.note + "</span>" : ""}</span>
      <span class="dim">${v.loader}</span>`;
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      selectVersion(v);
      close();
    });
    drop.appendChild(item);
  });
});

setupDropdown("#accountBtn", "#accountDropdown", (drop, close) => {
  ACCOUNTS.forEach((a) => {
    const item = document.createElement("button");
    item.className = "dropdown-item";
    item.innerHTML = `
      <img src="${a.ava}" alt="">
      <span><b>${a.name}</b></span>
      <span class="dim">${a.type}</span>`;
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      selectAccount(a);
      close();
    });
    drop.appendChild(item);
  });
  const add = document.createElement("button");
  add.className = "dropdown-item";
  add.innerHTML = `<span style="color:var(--accent)">＋ Добавить аккаунт</span>`;
  add.addEventListener("click", (e) => {
    e.stopPropagation();
    close();
    toast("Добавление аккаунта", "Окно авторизации Microsoft откроется в системном браузере", "＋");
  });
  drop.appendChild(add);
});

function selectVersion(v) {
  state.version = v;
  $("#versionValue").textContent = `${v.num} · ${v.loader}`;
  $("#playVersionLabel").textContent = v.num;
  $("#playLoaderLabel").textContent = [v.loader, ...v.tags].join(" · ") || "Vanilla";
  renderVersionGrid();
}

function selectAccount(a) {
  state.account = a;
  $("#accountValue").textContent = `${a.name} · ${a.type}`;
  $("#accountName").textContent = a.name;
  toast("Аккаунт переключён", `Теперь вы играете как ${a.name}`, "👤");
}

$("#accountChip").addEventListener("click", () => {
  toast("Профиль Steve_RU", "Управление аккаунтами — во вкладке «Главная»", "👤");
});

/* ───────── Счётчики статистики ───────── */
function animateCounters() {
  $$(".stat-num").forEach((el) => {
    const target = +el.dataset.count;
    const dur = 1100;
    const t0 = performance.now();
    (function tick(t) {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("ru-RU");
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  });
}
animateCounters();

/* ───────── Запуск игры ───────── */
const LAUNCH_STAGES = [
  ["Проверка целостности файлов…", 18],
  ["Загрузка библиотек Fabric…", 42],
  ["Применение шейдерпака…", 61],
  ["Инициализация JVM (8 ГБ)…", 82],
  ["Запуск Minecraft…", 100],
];

function launchGame() {
  if (state.launching) return;
  state.launching = true;
  if (state.ram) $("#metaRam").textContent = state.ram + " ГБ";

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
      toast("Игра запущена 🎮", `Minecraft ${state.version.num} · аккаунт ${state.account.name}`, "▶");
      return;
    }
    const [label, pct] = LAUNCH_STAGES[stage];
    stageEl.textContent = label;
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
renderServers();

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
renderVersionGrid();

/* ───────── Моды ───────── */
let modCat = "all";
let modQuery = "";

function renderMods() {
  const list = $("#modList");
  list.innerHTML = "";
  const filtered = MODS.filter((m) => {
    const okCat = modCat === "all" || m.cat === modCat;
    const q = modQuery.trim().toLowerCase();
    const okQ = !q || m.name.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q);
    return okCat && okQ;
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
          <button class="btn-buy ${inCart ? "added" : ""}" data-buy="${p.id}">${inCart ? "В корзине" : "Купить"}</button>
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
