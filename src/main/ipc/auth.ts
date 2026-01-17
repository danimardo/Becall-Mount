import { ipcMain } from 'electron';
import store from '../store';
import { hashPassword, verifyPassword } from '../utils/security';
import { setSessionPassword, isSessionAuthenticated } from '../utils/session';

export function registerAuthHandlers() {
  ipcMain.handle('auth:check-status', () => {
      const hasPassword = !!store.get('settings.passwordHash');
      return {
          hasPassword,
          isAuthenticated: isSessionAuthenticated()
      };
  });

  ipcMain.handle('auth:verify-password', async (_, password) => {
      const storedHash = store.get('settings.passwordHash');
      if (!storedHash) {
          // Set password (First Run / Setup)
          const newHash = hashPassword(password);
          store.set('settings.passwordHash', newHash);
          store.set('settings.firstRun', false);
          setSessionPassword(password);
          return true;
      }

      if (verifyPassword(password, storedHash as string)) {
          setSessionPassword(password);
          return true;
      }
      return false;
  });
}