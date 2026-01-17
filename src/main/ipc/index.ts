import { registerSystemHandlers } from './system';
import { registerAuthHandlers } from './auth';

export function registerIpcHandlers() {
  console.log('Registering IPC handlers...');
  registerSystemHandlers();
  registerAuthHandlers();
}