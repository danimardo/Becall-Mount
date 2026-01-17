import { spawn } from 'child_process';
import { RCLONE_EXE_PATH } from '../utils/paths';
import { getSessionPassword } from '../utils/session';

export class RcloneWrapper {
  constructor(private rclonePath: string = RCLONE_EXE_PATH) {}

  async execute(args: string[]): Promise<string> {
    const password = getSessionPassword();
    const env = { 
        ...process.env, 
        RCLONE_CONFIG_PASS: password // Pass master password for config encryption
    };

    return new Promise((resolve, reject) => {
      const child = spawn(this.rclonePath, args, { env });
      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          reject(new Error(`Rclone exited with code ${code}: ${stderr}`));
        }
      });
      
      child.on('error', (err) => {
          reject(err);
      });
    });
  }
}