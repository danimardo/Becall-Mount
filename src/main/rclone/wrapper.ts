import { spawn } from 'child_process';
import { RCLONE_EXE_PATH } from '../utils/paths';

export class RcloneWrapper {
  constructor(private rclonePath: string = RCLONE_EXE_PATH) {}

  async execute(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn(this.rclonePath, args);
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
