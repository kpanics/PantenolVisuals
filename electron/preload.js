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
