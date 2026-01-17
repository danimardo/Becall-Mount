import { Tray, Menu, app, BrowserWindow, nativeImage } from 'electron';

let tray: Tray | null = null;

export function createTray(mainWindow: BrowserWindow) {
  // Use a generic icon or empty for now if missing
  
  // Try to create from empty if path fails? 
  // Electron Tray requires a valid image.
  // I'll use a 1x1 transparent png data uri for safety if no file.
  const transparentIcon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==');
  
  tray = new Tray(transparentIcon);

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: () => mainWindow.show() },
    { type: 'separator' },
    { label: 'Quit', click: () => {
        app.quit(); 
    }}
  ]);
  
  tray.setToolTip('Cloud Mount');
  tray.setContextMenu(contextMenu);
  
  tray.on('double-click', () => {
      mainWindow.show();
  });
  
  return tray;
}
