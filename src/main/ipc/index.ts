import { registerSystemHandlers } from './system';
import { registerAuthHandlers } from './auth';
import { registerServiceHandlers } from './services';
import { registerMountHandlers } from './mount';
import { registerSettingsHandlers } from './settings';
import { registerConfigTransferHandlers } from './config-transfer';
import { registerADHandlers } from './ad';

export function registerIpcHandlers() {
  console.log('Registering IPC handlers...');
  registerSystemHandlers();
  registerAuthHandlers();
  registerServiceHandlers();
  registerMountHandlers();
  registerSettingsHandlers();
  registerConfigTransferHandlers();
  registerADHandlers();
}
