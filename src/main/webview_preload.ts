const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    postMessage: (data) => ipcRenderer.sendToHost(data),
  },
});
