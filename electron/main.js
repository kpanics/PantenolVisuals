/* ══════════════════════════════════════════════════════════
   PantenolVisuals — нативное приложение (Electron, frameless)
   Своё окно как у Discord: без рамки ОС и без браузера.
   ══════════════════════════════════════════════════════════ */
const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");

app.setName("PantenolVisuals");

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
