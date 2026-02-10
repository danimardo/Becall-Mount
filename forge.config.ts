import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerWix } from '@electron-forge/maker-wix';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    extraResource: [
      'public/icons',
      'public/icon.ico',
      'public/configs',
      'public/Nuevo_logo_BeCall_2024.png'
    ],
    icon: './public/icon', 
  },
  rebuildConfig: {},
  makers: [
    new MakerWix({
      language: 1034, // Español
      manufacturer: 'Becall',
      description: 'Becall-Mount - Acceso a unidades en la nube',
      shortcutFolderName: 'Becall-Mount',
      upgradeCode: 'F7A23D81-4C5B-4D9E-AF01-B2C3D4E5F6A7',
      ui: {
        chooseDirectory: true,
      },
      icon: './public/icon.ico',
      setupIcon: './public/icon.ico',
      // Solucionar el problema de los dos iconos en "Agregar o quitar programas"
      // electron-wix-msi crea entradas de registro con sufijo .msq que generan una entrada duplicada
      beforeCreate: async (creator: any) => {
        // Sobrescribir el método getRegistryKeys para que no genere las entradas .msq
        // que causan el icono duplicado
        const originalGetRegistryKeys = (creator as any).getRegistryKeys.bind(creator);
        (creator as any).getRegistryKeys = function() {
          const registry = originalGetRegistryKeys();
          // Filtrar para eliminar las entradas que crean el icono duplicado
          // Mantener solo las que no tengan .msq en la key
          return registry.filter((item: any) => !item.key?.includes('.msq'));
        };
      },
    }),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: 'src/main/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
        {
          name: 'splash_window',
          config: 'vite.renderer.config.ts', 
        }
      ],
    }),
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;