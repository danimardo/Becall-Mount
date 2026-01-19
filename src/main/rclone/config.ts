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
    
    for (let [key, value] of Object.entries(params)) {
        // Enmascarar contraseña si es el campo 'pass' o 'key' (Azure)
        if ((key === 'pass' || (type === 'azureblob' && key === 'key')) && value) {
            const looksObscured = /^[a-zA-Z0-9_-]{20,}$/.test(value) && !value.includes(' ');
            
            if (!looksObscured) {
                try {
                    value = await this.obscurePassword(value);
                } catch (e) {
                    console.error('Failed to obscure password', e);
                }
            }
        }
        args.push(key, value);
    }
    await this.wrapper.execute(args);
  }

  async obscurePassword(password: string): Promise<string> {
      return await this.wrapper.execute(['obscure', password]);
  }

  async deleteRemote(name: string): Promise<void> {
    await this.wrapper.execute(['config', 'delete', name, '--config', RCLONE_CONFIG_PATH]);
  }

  async testConnection(type: string, params: Record<string, string>): Promise<void> {
    const tempName = `temp-test-${Date.now()}`;
    try {
        // Create temporary remote
        await this.createRemote(tempName, type, params);
        
        // Determine the folder to test (bucket for GCS/S3, path for SFTP/FTP)
        const folder = params.bucket || params.path || '';
        const testTarget = folder ? `${tempName}:${folder}` : `${tempName}:`;

        // Try to list using 'lsf' which is more robust than 'lsd' for various protocols
        await this.wrapper.execute([
            'lsf', 
            testTarget, 
            '--config', RCLONE_CONFIG_PATH, 
            '--max-depth', '1',
            '--contimeout', '15s',
            '--format', 'p' // Minimal output
        ]);

        // Cleanup
        await this.deleteRemote(tempName);
    } catch (e) {
        // Ensure cleanup even on failure
        try { await this.deleteRemote(tempName); } catch {}
        throw e;
    }
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
      console.log('Setting Rclone config password via "config encryption set"...');
      
      await fs.ensureFile(RCLONE_CONFIG_PATH);

      return new Promise((resolve, reject) => {
          const child = spawn(RCLONE_EXE_PATH, ['config', 'encryption', 'set', '--config', RCLONE_CONFIG_PATH], { 
              env: { ...process.env }, 
              stdio: ['pipe', 'pipe', 'pipe'] 
          });

          let buffer = '';
          const write = (msg: string) => child.stdin.write(msg);

          const timeout = setTimeout(() => {
              child.kill();
              reject(new Error('Timeout waiting for rclone config encryption set'));
          }, 10000);

          const onData = (data: Buffer) => {
              const str = data.toString();
              buffer += str;
              // console.log('Rclone output chunk:', str); 
              
              if (buffer.toLowerCase().includes('password:')) {
                  // console.log('Detected password prompt, sending password...');
                  buffer = ''; 
                  write(`${password}\n`);
              }
          };

          child.stdout.on('data', onData);
          child.stderr.on('data', onData);

          child.on('close', (code) => {
              clearTimeout(timeout);
              if (code === 0) {
                  console.log('Rclone config password set successfully.');
                  resolve();
              } else {
                  console.error('Rclone failed. Full output buffer:', buffer);
                  reject(new Error(`Rclone exited with code ${code}`));
              }
          });
      });
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
