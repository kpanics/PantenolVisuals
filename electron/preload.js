/* Мост между интерфейсом лаунчера и Electron (безопасный) */
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("pvWindow", {
  minimize: () => ipcRenderer.send("win-min"),
  toggleMaximize: () => ipcRenderer.send("win-max"),
  close: () => ipcRenderer.send("win-close"),
});

/* Моды: установка/список/удаление файлов в ~/.pantenolvisuals/instances/<версия>/mods */
contextBridge.exposeInMainWorld("pvMods", {
  install: (opts) => ipcRenderer.invoke("mods-install", opts),
  list: (version) => ipcRenderer.invoke("mods-list", version),
  remove: (opts) => ipcRenderer.invoke("mods-remove", opts),
});

/* База данных лаунчера — файл на диске (НЕ localStorage):
   ~/.config/PantenolVisuals/pv-db.json */
contextBridge.exposeInMainWorld("pvStore", {
  getAll: () => ipcRenderer.invoke("store-all"),
  set: (k, v) => ipcRenderer.invoke("store-set", { k, v }),
});

/* Minecraft: настоящие версии Mojang, загрузка и запуск игры */
contextBridge.exposeInMainWorld("pvMC", {
  versions: () => ipcRenderer.invoke("mc-versions"),
  latest: () => ipcRenderer.invoke("mc-latest"),
  status: (v) => ipcRenderer.invoke("mc-status", v),
  java: () => ipcRenderer.invoke("mc-java"),
  install: (v) => ipcRenderer.invoke("mc-install", v),
  launch: (opts) => ipcRenderer.invoke("mc-launch", opts),
  onProgress: (cb) => ipcRenderer.on("mc-progress", (_e, d) => cb(d)),
  onExit: (cb) => ipcRenderer.on("mc-exit", (_e, d) => cb(d)),
});

/* Автообновление приложения */
contextBridge.exposeInMainWorld("pvApp", {
  onUpdateReady: (cb) => ipcRenderer.on("app-update-ready", (_e, d) => cb(d)),
  restart: () => ipcRenderer.send("app-restart"),
});
