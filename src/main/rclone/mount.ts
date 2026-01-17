import { spawn, exec } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import util from 'util';
import { RCLONE_EXE_PATH, LOGS_PATH, RCLONE_CONFIG_PATH } from '../utils/paths';
import { getSessionPassword } from '../utils/session';
import store from '../store';
import { MountState } from '../../contracts/types';

const execAsync = util.promisify(exec);

export class MountManager {
  
  async mount(serviceName: string, driveLetter: string): Promise<void> {
    const existing = (store.get('mounts') || []).find(m => m.driveLetter === driveLetter);
    if (existing) {
        const isRunning = await this.checkPid(existing.pid);
        if (isRunning) throw new Error(`Drive ${driveLetter} is already mounted`);
        this.removeMount(driveLetter);
    }

    const logFile = path.join(LOGS_PATH, `mount-${driveLetter}.log`);
    await fs.ensureDir(LOGS_PATH);
    
    await fs.writeFile(logFile, '');

    const env = { 
        ...process.env, 
        RCLONE_CONFIG_PASS: getSessionPassword() 
    };
    
    const args = [
        'mount', 
        `${serviceName}:`, 
        `${driveLetter}:`, 
        '--config', RCLONE_CONFIG_PATH,
        '--vfs-cache-mode', 'full', 
        '--no-console',
        '--log-file', logFile,
        '--log-level', 'INFO'
    ];

    const child = spawn(RCLONE_EXE_PATH, args, { 
        env, 
        detached: true, 
        stdio: 'ignore' 
    });
    
    child.unref();

    if (!child.pid) throw new Error('Failed to spawn mount process');

    // Wait and check
    await new Promise(resolve => setTimeout(resolve, 2000));
    const isRunning = await this.checkPid(child.pid);
    
    if (!isRunning) {
        let log = '';
        try {
            log = await fs.readFile(logFile, 'utf-8');
        } catch (e) {
            // Ignore log reading errors
        }
        throw new Error(`Mount failed: ${log.slice(0, 300)}...`);
    }

    const mounts = store.get('mounts') || [];
    mounts.push({
        serviceName,
        driveLetter,
        pid: child.pid,
        startTime: new Date().toISOString(),
        status: 'mounted'
    });
    store.set('mounts', mounts);
  }

  async unmount(driveLetter: string): Promise<void> {
      const mounts = store.get('mounts') || [];
      const mount = mounts.find(m => m.driveLetter === driveLetter);
      if (!mount) return;

      if (mount.pid) {
          try {
              await execAsync(`taskkill /PID ${mount.pid} /F`);
          } catch (e) {
              console.warn(`Failed to kill PID ${mount.pid}`, e);
          }
      }
      
      this.removeMount(driveLetter);
  }

  async restoreState(): Promise<void> {
      const mounts = store.get('mounts') || [];
      const validMounts: MountState[] = [];

      for (const m of mounts) {
          if (m.pid) {
              const isRunning = await this.checkPid(m.pid);
              if (isRunning) {
                  validMounts.push(m);
              } else {
                  console.log(`Dropping dead mount: ${m.driveLetter} (PID ${m.pid})`);
              }
          }
      }
      store.set('mounts', validMounts);
  }

  getMounts(): MountState[] {
      return store.get('mounts') || [];
  }

  private removeMount(driveLetter: string) {
      const mounts = store.get('mounts') || [];
      store.set('mounts', mounts.filter(m => m.driveLetter !== driveLetter));
  }

  private async checkPid(pid: number): Promise<boolean> {
      try {
          const { stdout } = await execAsync(`tasklist /FI "PID eq ${pid}" /NH`);
          return stdout.includes(pid.toString());
      } catch {
          return false;
      }
  }
}
