/* Мост между интерфейсом лаунчера и окном Electron (безопасный) */
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("pvWindow", {
  minimize: () => ipcRenderer.send("win-min"),
  toggleMaximize: () => ipcRenderer.send("win-max"),
  close: () => ipcRenderer.send("win-close"),
});
