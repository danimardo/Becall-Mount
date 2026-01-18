import { spawn } from 'child_process';
import { RcloneWrapper } from './wrapper';
import { RCLONE_CONFIG_PATH, RCLONE_EXE_PATH } from '../utils/paths';
import fs from 'fs-extra';

export class RcloneConfig {
  private wrapper: RcloneWrapper;

  constructor() {
    this.wrapper = new RcloneWrapper();
  }

  async listRemotes(): Promise<{ name: string; type: string }[]> {
    try {
        const output = await this.wrapper.execute(['listremotes', '--long', '--config', RCLONE_CONFIG_PATH]);
        return output.split('\n')
            .filter(line => line.trim())
            .map(line => {
                const [name, type] = line.split(':').map(s => s.trim());
                return { name, type };
            });
    } catch (e) {
        console.error("List remotes failed", e);
        return [];
    }
  }

  async createRemote(name: string, type: string, params: Record<string, string>): Promise<void> {
    const args = ['config', 'create', name, type, '--config', RCLONE_CONFIG_PATH];
    for (const [key, value] of Object.entries(params)) {
        args.push(key, value);
    }
    await this.wrapper.execute(args);
  }

  async deleteRemote(name: string): Promise<void> {
    await this.wrapper.execute(['config', 'delete', name, '--config', RCLONE_CONFIG_PATH]);
  }

  async getRemoteConfig(name: string): Promise<Record<string, string>> {
    try {
      const output = await this.wrapper.execute(['config', 'dump', '--config', RCLONE_CONFIG_PATH]);
      const config = JSON.parse(output);

      if (config[name]) {
        return config[name];
      }

      return {};
    } catch (e) {
      console.error(`Failed to get config for remote ${name}:`, e);
      return {};
    }
  }

  async setConfigPassword(password: string): Promise<void> {
      console.log('Launching visible terminal for Rclone config...');
      // Launch a new terminal window running 'rclone config'
      // Windows specific: start cmd /c "rclone config"
      // We can't easily auto-fill the password in a new window securely without sendkeys/macros.
      // So we'll let the user do it.
      
      const cmd = `start "Configurar Contraseña Rclone" "${RCLONE_EXE_PATH}" config --config "${RCLONE_CONFIG_PATH}"`;
      
      require('child_process').exec(cmd);
      
      // Return immediately, we can't wait for user in a detached terminal easily without polling
      return Promise.resolve();
  }

  async isEncrypted(): Promise<boolean> {
      if (!fs.existsSync(RCLONE_CONFIG_PATH)) return false;
      try {
          const content = await fs.readFile(RCLONE_CONFIG_PATH, 'utf-8');
          // If it contains "type =" or "[RemoteName]", it's likely plaintext
          return !content.includes('type =');
      } catch {
          return false;
      }
  }
}