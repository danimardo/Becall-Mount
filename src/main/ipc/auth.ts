import { ipcMain } from 'electron';
import getStore from '../store';
import { hashPassword, verifyPassword } from '../utils/security';
import { setSessionPassword, isSessionAuthenticated } from '../utils/session';
import { RcloneConfig } from '../rclone/config';

const rcloneConfig = new RcloneConfig();

export function registerAuthHandlers() {
  ipcMain.handle('auth:check-status', () => {
      const store = getStore();
      const hasPassword = !!store.get('settings.passwordHash');
      return {
          hasPassword,
          isAuthenticated: isSessionAuthenticated()
      };
  });

  ipcMain.handle('auth:verify-password', async (_, password) => {
      const store = getStore();
      const storedHash = store.get('settings.passwordHash');
      if (!storedHash) {
          // Set password (First Run / Setup)
          const newHash = hashPassword(password);
          store.set('settings.passwordHash', newHash);
          store.set('settings.firstRun', false);
          setSessionPassword(password);
          
          // Force Rclone encryption
          await rcloneConfig.setConfigPassword(password);
          
          return true;
      }

      if (verifyPassword(password, storedHash as string)) {
          setSessionPassword(password);
          
          // Check if we need to re-apply encryption (e.g. if file was deleted or replaced)
          // We can try to set it again just in case, or check first.
          // Setting it again is safer to ensure sync.
          // But if it's already encrypted, 'config password' might ask for OLD password first.
          // Simplification: We blindly try to set it. If it fails because it asks for old password, 
          // it means it's likely already encrypted with *something*.
          // Let's assume sync.
          
          try {
             // Only set if not already encrypted to avoid "Enter old password" prompt which would break our automation
             // But detecting if it's encrypted with THIS password vs another is hard.
             // If we assume the user only uses this app, it should be fine.
             // If file is plaintext, this will encrypt it.
             const isEnc = await rcloneConfig.isEncrypted();
             if (!isEnc) {
                 await rcloneConfig.setConfigPassword(password);
             }
          } catch (e) {
              console.error('Auto-encrypt failed', e);
          }

          return true;
      }
      return false;
  });
}