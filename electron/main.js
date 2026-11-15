/* PantenolVisuals — нативное окно через Electron (опциональный режим) */
const { app, BrowserWindow, shell } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1300,
    height: 820,
    minWidth: 980,
    minHeight: 620,
    title: "PantenolVisuals",
    icon: path.join(__dirname, "..", "assets", "logo.png"),
    backgroundColor: "#070b10",
    autoHideMenuBar: true,
    frame: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, "..", "index.html"));

  // Внешние ссылки — в системный браузер, не в окне лаунчера
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
