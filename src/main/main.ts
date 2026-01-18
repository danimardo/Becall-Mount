import { app, BrowserWindow, Menu, nativeImage } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { registerIpcHandlers } from './ipc';
import { createTray } from './tray';
import { mountManager } from './ipc/mount';

// Declare globals from Vite plugin
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;
declare const SPLASH_WINDOW_VITE_DEV_SERVER_URL: string;
declare const SPLASH_WINDOW_VITE_NAME: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let isQuitting = false;

app.on('before-quit', () => {
  isQuitting = true;
});

// Helper to get icon
const getIcon = () => {
  const iconPaths = [
    path.join(process.resourcesPath, 'app.asar.unpacked', 'public', 'icon.ico'),
    path.join(__dirname, '../public/icon.ico'),
    path.join(__dirname, '../../public/icon.ico'),
  ];
  for (const iconPath of iconPaths) {
    try {
      const testIcon = nativeImage.createFromPath(iconPath);
      if (!testIcon.isEmpty()) return testIcon;
    } catch (e) {}
  }
  return undefined;
};

const createSplashWindow = (): BrowserWindow => {
  console.log('Creating Splash Window...');
  const splash = new BrowserWindow({
    width: 640,
    height: 360,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    center: true,
    icon: getIcon(),
    webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js') // Reuse preload or specific one
    }
  });

  if (SPLASH_WINDOW_VITE_DEV_SERVER_URL) {
    console.log('Loading Splash from DEV URL:', SPLASH_WINDOW_VITE_DEV_SERVER_URL);
    // Vite dev server serves from root.
    splash.loadURL(`${SPLASH_WINDOW_VITE_DEV_SERVER_URL}/src/renderer/splash.html`);
  } else {
    console.log('Loading Splash from FILE:', path.join(__dirname, `../renderer/${SPLASH_WINDOW_VITE_NAME}/src/renderer/splash.html`));
    splash.loadFile(path.join(__dirname, `../renderer/${SPLASH_WINDOW_VITE_NAME}/src/renderer/splash.html`));
  }
  
  splash.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Splash failed to load:', errorCode, errorDescription);
  });

  return splash;
};

const createMainWindow = async (splash: BrowserWindow) => {
  const icon = getIcon();

  // Wait for splash to be visible to user
  await new Promise<void>(resolve => {
      splash.once('ready-to-show', () => {
          splash.show();
          resolve();
      });
      // Safety timeout in case ready-to-show never fires (transparent windows sometimes behave oddly)
      setTimeout(resolve, 1000);
  });

  // Start the timer NOW that splash is visible
  const minTimePromise = new Promise(resolve => setTimeout(resolve, 3000));

  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    show: false, // Hidden initially
    ...(icon && { icon }),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Load the index.html of the app.
  const loadPromise = MAIN_WINDOW_VITE_DEV_SERVER_URL
    ? mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
    : mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  
  // Also wait for mount restore?
  await Promise.all([loadPromise, minTimePromise, mountManager.restoreState()]);

  splash.close();
  mainWindow.show();

  // Re-enable DevTools shortcut
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if ((input.control && input.shift && input.key.toLowerCase() === 'i') || input.key === 'F12') {
      mainWindow.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
  });

  createTray(mainWindow);
};

app.on('ready', async () => {
  Menu.setApplicationMenu(null);
  registerIpcHandlers();
  
  const splash = createSplashWindow();
  createMainWindow(splash);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    // If activating, we might skip splash or show it again?
    // For simplicity, show splash again
    const splash = createSplashWindow();
    createMainWindow(splash);
  }
});