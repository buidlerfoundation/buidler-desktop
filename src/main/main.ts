/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  dialog,
  Notification,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.setFeedURL({
      provider: 'github',
      repo: 'buidler-desktop',
      owner: 'buidlerfoundation',
    });
    autoUpdater.checkForUpdatesAndNotify();
  }
}

function getNotification(data: any) {
  const notification = new Notification({
    title: data.title,
    body: data.body,
    icon: data.icon,
    subtitle: data.subtitle,
  });
  return notification;
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDevelopment) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDevelopment) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1440,
    height: 1120,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      webviewTag: true,
      nodeIntegration: true,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: {
      x: 20,
      y: 18,
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  app.on('open-url', (evt, data) => {
    evt.preventDefault();
    mainWindow?.webContents.send('open-url', data);
  });

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('enter-full-screen', () => {
    mainWindow?.webContents.send('enter-fullscreen');
  });
  mainWindow.on('leave-full-screen', () => {
    mainWindow?.webContents.send('leave-fullscreen');
  });

  mainWindow.on('focus', () => {
    mainWindow?.webContents.send('window-focus');
  });

  mainWindow.on('blur', () => {
    mainWindow?.webContents.send('window-blur');
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

ipcMain.on('show-badge', (event, arg) => {
  app.dock.setBadge('•');
});

ipcMain.on('hide-badge', (event, arg) => {
  app.dock.setBadge('');
});

ipcMain.on('doing-login', (event, arg) => {
  app.removeAllListeners('open-url');
  app.on('open-url', (evt, data) => {
    evt.preventDefault();
    event.reply('login-response', data);
  });
});

ipcMain.on('doing-notification', (event, arg) => {
  const notification = getNotification(arg);
  notification.on('click', (evt) => {
    event.reply('notification-click', arg);
  });
  notification.show();
});

ipcMain.on('force-update', (event, arg) => {
  autoUpdater.checkForUpdatesAndNotify();
  autoUpdater.removeAllListeners();
  autoUpdater.on('update-downloaded', () => {
    console.log('update-downloaded lats quitAndInstall');
    dialog
      .showMessageBox({
        type: 'info',
        title: 'Update Available',
        message: 'A new version of Buidler is ready to be installed.',
        buttons: ['Install now'],
      })
      .then(({ response }) => {
        if (response === 0) {
          const isSilent = true;
          const isForceRunAfter = true;
          autoUpdater.quitAndInstall(isSilent, isForceRunAfter);
        } else {
          // updater.enabled = true
          // updater = null
        }
        return null;
      })
      .catch((e) => {
        console.log(e);
      });
  });
});

app.setAsDefaultProtocolClient('notableapp');

autoUpdater.on('update-downloaded', () => {
  console.log('update-downloaded lats quitAndInstall');
  dialog
    .showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: 'A new version of Buidler is ready to be installed.',
      buttons: ['Install now', 'Install on next launch'],
    })
    .then(({ response }) => {
      if (response === 0) {
        const isSilent = true;
        const isForceRunAfter = true;
        autoUpdater.quitAndInstall(isSilent, isForceRunAfter);
      } else {
        // updater.enabled = true
        // updater = null
      }
      return null;
    })
    .catch((e) => {
      console.log(e);
    });
});
