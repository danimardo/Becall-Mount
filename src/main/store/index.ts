import Store from 'electron-store';
import { AppSettings, MountState } from '../../contracts/types';

interface MountPreference {
  lastMountType: 'drive' | 'folder';
  lastDriveLetter?: string;
  lastFolderPath?: string;
  remotePath?: string;
}

interface StoreSchema {
  settings: AppSettings;
  mounts: MountState[];
  mountPreferences: Record<string, MountPreference>;
}

const store = new Store<StoreSchema>({
  defaults: {
    settings: {
      theme: 'system',
      rclonePath: 'bin/rclone.exe',
      firstRun: true,
    },
    mounts: [],
    mountPreferences: {}
  },
});

export default store;