import { safeStorage } from 'electron';
import getStore from '../store';

/**
 * Utilidad para almacenar datos sensibles cifrados en el sistema.
 */
export class SecureStorage {
  private static readonly STORAGE_KEY = 'encryptedMasterPassword';

  /**
   * Comprueba si el cifrado de safeStorage está disponible en esta plataforma.
   */
  static isEncryptionAvailable(): boolean {
    return safeStorage.isEncryptionAvailable();
  }

  /**
   * Cifra y guarda la contraseña maestro.
   */
  static async savePassword(password: string): Promise<void> {
    if (!this.isEncryptionAvailable()) {
      throw new Error('Encryption is not available on this system.');
    }

    const buffer = safeStorage.encryptString(password);
    const store = getStore();
    // Guardamos el buffer como hex string en el store
    store.set(this.STORAGE_KEY, buffer.toString('hex'));
  }

  /**
   * Recupera y descifra la contraseña maestro.
   */
  static async getPassword(): Promise<string | null> {
    const store = getStore();
    const hex = store.get(this.STORAGE_KEY) as string;

    if (!hex) return null;

    if (!this.isEncryptionAvailable()) {
      throw new Error('Encryption is not available on this system.');
    }

    try {
      const buffer = Buffer.from(hex, 'hex');
      return safeStorage.decryptString(buffer);
    } catch (error) {
      console.error('[SecureStorage] Failed to decrypt password:', error);
      return null;
    }
  }

  /**
   * Elimina la contraseña guardada.
   */
  static async clearPassword(): Promise<void> {
    const store = getStore();
    store.delete(this.STORAGE_KEY);
  }
}
