/* ══════════════════════════════════════════════════════════
   PantenolVisuals — нативное приложение (Electron, frameless)
   Своё окно как у Discord: без рамки ОС и без браузера.
   ══════════════════════════════════════════════════════════ */
const { app, BrowserWindow, ipcMain, shell, Menu } = require("electron");
const path = require("path");
const os = require("os");
const fs = require("fs");
const https = require("https");

app.setName("PantenolVisuals");

/* Убираем системное меню целиком (File/Edit/View…, вылезает по Alt) */
Menu.setApplicationMenu(null);

/* ───────── Файл-база данных (вместо localStorage) ───────── */
const DB_PATH = path.join(app.getPath("userData"), "pv-db.json");
function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch { return {}; }
}
function writeDB(db) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}
ipcMain.handle("store-all", () => readDB());
ipcMain.handle("store-set", (_e, { k, v }) => {
  const db = readDB();
  if (v === null) delete db[k]; else db[k] = v;
  writeDB(db);
  return true;
});

/* ───────── Установка модов в папку версии ───────── */
const INSTANCES = path.join(os.homedir(), ".pantenolvisuals", "instances");

function download(url, dest, hops = 0) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && hops < 5) {
        res.resume();
        return download(res.headers.location, dest, hops + 1).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error("HTTP " + res.statusCode));
      }
      const out = fs.createWriteStream(dest);
      res.pipe(out);
      out.on("finish", () => out.close(resolve));
      out.on("error", reject);
    }).on("error", reject);
  });
}

ipcMain.handle("mods-install", async (_e, { url, name, version }) => {
  const dir = path.join(INSTANCES, version, "mods");
  fs.mkdirSync(dir, { recursive: true });
  const safe = name.replace(/[^\w.\-()\[\] ]/g, "_");
  const dest = path.join(dir, safe);
  await download(url, dest);
  return { ok: true, dest };
});

ipcMain.handle("mods-list", async (_e, version) => {
  const dir = path.join(INSTANCES, version, "mods");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".jar") || f.endsWith(".disabled"));
});

ipcMain.handle("mods-remove", async (_e, { name, version }) => {
  const f = path.join(INSTANCES, version, "mods", name);
  if (fs.existsSync(f)) fs.unlinkSync(f);
  return { ok: true };
});

/* Одна копия приложения */
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  let win = null;

  function createWindow() {
    win = new BrowserWindow({
      width: 1300,
      height: 820,
      minWidth: 980,
      minHeight: 620,
      title: "PantenolVisuals",
      icon: path.join(__dirname, "..", "assets", "logo.png"),
      backgroundColor: "#070b10",
      frame: false,               // своя рамка — кнопки окна рисует интерфейс лаунчера
      titleBarStyle: "hidden",
      autoHideMenuBar: true,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    win.loadFile(path.join(__dirname, "..", "index.html"));
    win.once("ready-to-show", () => win.show());

    // Внешние ссылки открываем в системном браузере, а не в окне лаунчера
    win.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: "deny" };
    });

    // Никакой контекстной менюшки по правой кнопке — это приложение
    win.webContents.on("context-menu", (e) => e.preventDefault());
  }

  /* Кнопки окна из интерфейса */
  ipcMain.on("win-min", () => win && win.minimize());
  ipcMain.on("win-max", () => {
    if (!win) return;
    win.isMaximized() ? win.unmaximize() : win.maximize();
  });
  ipcMain.on("win-close", () => win && win.close());

  app.whenReady().then(() => {
    createWindow();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on("second-instance", () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.on("window-all-closed", () => app.quit());
}
