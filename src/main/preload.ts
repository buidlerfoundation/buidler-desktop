import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import storage from 'electron-json-storage';
import path from 'path';

const usr = require('os').homedir();

export type Channels = 'ipc-example';

contextBridge.exposeInMainWorld('electron', {
  cookies: {
    setPath() {
      if (process.platform === 'darwin') {
        storage.setDataPath(
          `${usr}/Library/Application Support/today-remote/storage`
        );
      } else {
        storage.setDataPath(path.join(__dirname, '../storage'));
      }
    },
    set(key: string, value: string, callback: (error: any) => void) {
      storage.set(key, value, callback);
    },
    get(key: string, callback: (error: any, data: any) => void) {
      storage.get(key, callback);
    },
  },
  ipcRenderer: {
    removeListener(channel: Channels, listener: (args: unknown[]) => void) {
      ipcRenderer.removeListener(channel, listener);
    },
    removeAllListeners(channel: Channels) {
      ipcRenderer.removeAllListeners(channel);
    },
    sendMessage(channel: Channels, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => ipcRenderer.removeListener(channel, subscription);
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
});
