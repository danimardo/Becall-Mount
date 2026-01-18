import { RcloneWrapper } from './wrapper';
import { RCLONE_CONFIG_PATH } from '../utils/paths';

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

      // Rclone dump devuelve la configuración con el nombre del remote como clave
      if (config[name]) {
        return config[name];
      }

      return {};
    } catch (e) {
      console.error(`Failed to get config for remote ${name}:`, e);
      return {};
    }
  }
}
