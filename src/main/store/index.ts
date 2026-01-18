import Store from 'electron-store';
import { AppSettings, MountState } from '../../contracts/types';

interface MountPreference {
  lastMountType: 'drive' | 'folder';
  lastDriveLetter?: string;
  lastFolderPath?: string;
  remotePath?: string;
}

interface StoreSchema {
  settings: AppSettings & { lastDriverUpdateCheck?: number };
  mounts: MountState[];
  mountPreferences: Record<string, MountPreference>;
}

const store = new Store<StoreSchema>({
  defaults: {
    settings: {
      theme: 'system',
      rclonePath: 'bin/rclone.exe',
      firstRun: true,
      lastDriverUpdateCheck: 0,
    },
    mounts: [],
    mountPreferences: {}
  },
});

export default store;