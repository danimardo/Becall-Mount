import { app, BrowserWindow, Menu, nativeImage } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { registerIpcHandlers } from './ipc';
import { createTray } from './tray';
import { mountManager } from './ipc/mount';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let isQuitting = false;

app.on('before-quit', () => {
  isQuitting = true;
});

const createWindow = () => {
  // Cargar el icono desde el archivo .ico
  // En desarrollo y producción: buscar en múltiples ubicaciones posibles
  let icon;
  const iconPaths = [
    // Para producción con asarUnpack
    path.join(process.resourcesPath, 'app.asar.unpacked', 'public', 'icon.ico'),
    path.join(__dirname, '../public/icon.ico'),
    // Para desarrollo
    path.join(__dirname, '../../public/icon.ico'),
  ];

  for (const iconPath of iconPaths) {
    try {
      const testIcon = nativeImage.createFromPath(iconPath);
      if (!testIcon.isEmpty()) {
        icon = testIcon;
        console.log('Icono cargado desde:', iconPath);
        break;
      }
    } catch (e) {
      // Continuar con la siguiente ruta
    }
  }

  if (!icon) {
    console.warn('No se pudo cargar el icono desde ninguna ubicación');
  }

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    ...(icon && { icon }),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Re-enable DevTools shortcut (Ctrl+Shift+I and F12) manually since menu is null
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  // Quitar el menú de la aplicación (File, Edit, View, etc.)
  Menu.setApplicationMenu(null);

  await mountManager.restoreState();
  registerIpcHandlers();
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
