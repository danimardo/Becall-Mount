import Store from 'electron-store';
import { AppSettings, MountState } from '../../contracts/types';

interface MountPreference {
  lastMountType: 'drive' | 'folder';
  lastDriveLetter?: string;
  lastFolderPath?: string;
  remotePath?: string;
}

interface WindowBounds {
  width: number;
  height: number;
  x?: number;
  y?: number;
}

interface StoreSchema {
  settings: AppSettings & { lastDriverUpdateCheck?: number };
  mounts: MountState[];
  mountPreferences: Record<string, MountPreference>;
  windowBounds?: WindowBounds;
  serviceMountOptions: Record<string, Record<string, string>>;
}

let store: Store<StoreSchema>;

export default function getStore(): Store<StoreSchema> {
  if (!store) {
    store = new Store<StoreSchema>({
      defaults: {
        settings: {
          theme: 'system',
          rclonePath: 'bin/rclone.exe',
          firstRun: true,
          lastDriverUpdateCheck: 0,
          autoLaunch: false,
          mountPercentageLimit: 80,
        },
        mounts: [],
        mountPreferences: {},
        windowBounds: { width: 1000, height: 800 },
        serviceMountOptions: {}
      },
    });
  }
  return store;
}