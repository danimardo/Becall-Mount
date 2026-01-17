import { registerSystemHandlers } from './system';
import { registerAuthHandlers } from './auth';
import { registerServiceHandlers } from './services';
import { registerMountHandlers } from './mount';
import { registerSettingsHandlers } from './settings';

export function registerIpcHandlers() {
  console.log('Registering IPC handlers...');
  registerSystemHandlers();
  registerAuthHandlers();
  registerServiceHandlers();
  registerMountHandlers();
  registerSettingsHandlers();
}