import { registerSystemHandlers } from './system';
import { registerAuthHandlers } from './auth';
import { registerServiceHandlers } from './services';

export function registerIpcHandlers() {
  console.log('Registering IPC handlers...');
  registerSystemHandlers();
  registerAuthHandlers();
  registerServiceHandlers();
}