import { ipcMain } from 'electron';
import store from '../store';
import { hashPassword, verifyPassword } from '../utils/security';

let isSessionAuthenticated = false;

export function registerAuthHandlers() {
  ipcMain.handle('auth:check-status', () => {
      const hasPassword = !!store.get('settings.passwordHash');
      return {
          hasPassword,
          isAuthenticated: isSessionAuthenticated
      };
  });

  ipcMain.handle('auth:verify-password', async (_, password) => {
      const storedHash = store.get('settings.passwordHash');
      if (!storedHash) {
          // Set password (First Run / Setup)
          const newHash = hashPassword(password);
          store.set('settings.passwordHash', newHash);
          store.set('settings.firstRun', false);
          isSessionAuthenticated = true;
          return true;
      }

      if (verifyPassword(password, storedHash as string)) {
          isSessionAuthenticated = true;
          return true;
      }
      return false;
  });
}
