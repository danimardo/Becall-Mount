import Store from 'electron-store';
import { AppSettings, MountState } from '../../contracts/types';

interface StoreSchema {
  settings: AppSettings;
  mounts: MountState[];
}

const store = new Store<StoreSchema>({
  defaults: {
    settings: {
      theme: 'system',
      rclonePath: 'bin/rclone.exe',
      firstRun: true,
    },
    mounts: [],
  },
});

export default store;
