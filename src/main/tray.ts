import { Tray, Menu, app, BrowserWindow, nativeImage } from 'electron';
import path from 'node:path';

let tray: Tray | null = null;

export function createTray(mainWindow: BrowserWindow) {
  let icon = null;
  
  // Lista priorizada de rutas para el icono
  const possiblePaths = [
    // 1. Producción (Resources raíz - via extraResource en forge.config.ts)
    path.join(process.resourcesPath, 'icon.ico'),
    path.join(process.resourcesPath, 'icon.png'),
    
    // 2. Desarrollo (Relativo a src/main/ o dist/main/)
    path.join(__dirname, '../../public/icon.ico'), // Desde .vite/build/main.js
    path.join(__dirname, '../public/icon.ico'),    // Estructura src plana
    path.join(process.cwd(), 'public', 'icon.ico'), // Fallback a root de proyecto en dev
  ];

  for (const p of possiblePaths) {
    try {
      const img = nativeImage.createFromPath(p);
      if (!img.isEmpty()) {
        console.log('Tray icon loaded successfully from:', p);
        icon = img;
        break;
      }
    } catch (e) { 
       // Silenciosamente ignorar errores de lectura, probar siguiente path
    }
  }

  if (!icon || icon.isEmpty()) {
    console.error('CRITICAL: Tray icon not found in any expected location.');
    // Intentar cargar uno por defecto de sistema o simplemente fallar con log claro
    // Usar empty image causará el bug de "transparente", pero es mejor que crash.
    icon = nativeImage.createEmpty();
  } else {
    // Windows Tray prefiere 16x16, pero si damos una imagen de alta calidad,
    // es mejor dejar que el OS la escale o redimensionarla suavemente.
    // Si es ICO, suele tener varios tamaños. Si es PNG grande, redimensionamos.
    if (icon.getSize().width > 32) {
       icon = icon.resize({ width: 16, height: 16, quality: 'high' });
    }
  }

  try {
      tray = new Tray(icon);

      const contextMenu = Menu.buildFromTemplate([
        { label: 'Abrir Becall-Mount', click: () => mainWindow.show() },
        { type: 'separator' },
        { label: 'Salir', click: () => {
            app.quit(); 
        }}
      ]);
      
      tray.setToolTip('Becall-Mount');
      tray.setContextMenu(contextMenu);
      
      // Permitir abrir con un solo clic o doble clic
      tray.on('double-click', () => mainWindow.show());
      tray.on('click', () => mainWindow.show());
      
      return tray;
  } catch (e) {
      console.error('Error creando el Tray:', e);
      return null;
  }
}