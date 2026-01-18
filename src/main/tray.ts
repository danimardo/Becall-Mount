import { Tray, Menu, app, BrowserWindow, nativeImage } from 'electron';
import path from 'node:path';

let tray: Tray | null = null;

export function createTray(mainWindow: BrowserWindow) {
  // Cargar el icono desde el archivo .ico (igual que la ventana principal)
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
        console.log('Icono del tray cargado desde:', iconPath);
        break;
      }
    } catch (e) {
      // Continuar con la siguiente ruta
    }
  }

  // Si no se pudo cargar el .ico, intentar con PNG como fallback
  if (!icon) {
    const pngPaths = [
      path.join(process.resourcesPath, 'app.asar.unpacked', 'public', 'icon.png'),
      path.join(__dirname, '../public/icon.png'),
      path.join(__dirname, '../../public/icon.png'),
    ];

    for (const iconPath of pngPaths) {
      try {
        const testIcon = nativeImage.createFromPath(iconPath);
        if (!testIcon.isEmpty()) {
          icon = testIcon;
          console.log('Icono del tray (PNG) cargado desde:', iconPath);
          break;
        }
      } catch (e) {
        // Continuar
      }
    }
  }

  if (!icon) {
    console.warn('No se pudo cargar el icono del tray desde ninguna ubicación');
  }

  // Asegurar tamaño correcto para el system tray (16x16 recomendado)
  if (icon && !icon.isEmpty()) {
    // Windows ajusta automáticamente, pero podemos asegurarnos de que sea de buena calidad
    icon = icon.resize({ width: 16, height: 16 });
  }

  tray = new Tray(icon);

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
