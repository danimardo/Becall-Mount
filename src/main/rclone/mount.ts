import { spawn, exec } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import util from 'util';
import { RCLONE_EXE_PATH, LOGS_PATH, RCLONE_CONFIG_PATH } from '../utils/paths';
import { getSessionPassword } from '../utils/session';
import store from '../store';
import { MountState } from '../../contracts/types';
import { RcloneConfig } from './config';

const execAsync = util.promisify(exec);

export class MountManager {
  private config: RcloneConfig;

  constructor() {
    this.config = new RcloneConfig();
  }

  async mount(serviceName: string, mountType: 'drive' | 'folder', target: string, force: boolean = false): Promise<void> {
    // Check if service is already mounted
    const existing = (store.get('mounts') || []).find(m => m.serviceName === serviceName);
    if (existing) {
        // Just checking by service name for simplicity, though multiple mounts of same service is a requirement (HU-3.3)
        // If we allow multiple, we should check by target (mountPoint).
        // Spec HU-3.3: Mount same service multiple times.
        // So we check by target.
    }
    
    // Check if target is already in use by OUR app
    const existingTarget = (store.get('mounts') || []).find(m => m.mountPoint === target);
    if (existingTarget) {
        const isRunning = await this.checkPid(existingTarget.pid);
        if (isRunning) throw new Error(`Target ${target} is already mounted in our app`);
        this.removeMount(target);
    }

    if (mountType === 'drive') {
        // Check drive availability
        try {
            const { stdout } = await execAsync('wmic logicaldisk get name');
            if (stdout.includes(`${target}:`)) {
                throw new Error(`Drive ${target}: is already in use by the system`);
            }
        } catch (e) {
            console.warn('Failed to check drive availability via wmic', e);
        }
        // Normalize drive letter to include colon for rclone if needed?
        // Rclone expects "Z:"
        if (!target.endsWith(':')) target += ':';
    } else {
        // Folder mounting
        if (!fs.existsSync(target)) {
            throw new Error(`Directory ${target} does not exist`);
        }
        const isEmpty = fs.readdirSync(target).length === 0;
        if (!isEmpty && !force) {
            throw new Error('FOLDER_NOT_EMPTY');
        }
    }

    const logFile = path.join(LOGS_PATH, `mount-${serviceName}-${Date.now()}.log`);
    await fs.ensureDir(LOGS_PATH);
    await fs.writeFile(logFile, '');

    const env = {
        ...process.env,
        RCLONE_CONFIG_PASS: getSessionPassword()
    };

    const remoteConfig = await this.config.getRemoteConfig(serviceName);
    const bucket = remoteConfig['bucket'] || '';
    const remotePath = remoteConfig['path'] || '';

    let remotePathFull = `${serviceName}:`;
    if (bucket) {
      remotePathFull += bucket;
      if (remotePath) {
        remotePathFull += `/${remotePath}`;
      }
    }

    // Persist preference
    store.set(`mountPreferences.${serviceName}`, {
        lastMountType: mountType,
        lastDriveLetter: mountType === 'drive' ? target.replace(':', '') : undefined,
        lastFolderPath: mountType === 'folder' ? target : undefined
    });

    const args = [
        'mount',
        remotePathFull,
        target,
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

    await new Promise(resolve => setTimeout(resolve, 2000));
    const isRunning = await this.checkPid(child.pid);
    
    if (!isRunning) {
        let log = '';
        try {
            log = await fs.readFile(logFile, 'utf-8');
        } catch (e) {
            // Ignore
        }
        throw new Error(`Mount failed: ${log.slice(0, 300)}...`);
    }

    const mounts = store.get('mounts') || [];
    mounts.push({
        serviceName,
        driveLetter: mountType === 'drive' ? target.replace(':', '') : undefined,
        mountPoint: target,
        mountType,
        pid: child.pid,
        startTime: new Date().toISOString(),
        status: 'mounted'
    });
    store.set('mounts', mounts);
  }

  async unmount(mountPoint: string): Promise<void> {
      const mounts = store.get('mounts') || [];
      const mount = mounts.find(m => m.mountPoint === mountPoint || (m.driveLetter && mountPoint === m.driveLetter));
      if (!mount) return;

      if (mount.pid) {
          try {
              await execAsync(`taskkill /PID ${mount.pid} /F`);
          } catch (e) {
              console.warn(`Failed to kill PID ${mount.pid}`, e);
          }
      }
      
      this.removeMount(mount.mountPoint);
  }

  async unmountAll(): Promise<{ success: boolean; unmountedCount: number; errors: string[] }> {
      const mounts = this.getMounts();
      let count = 0;
      const errors: string[] = [];

      for (const m of mounts) {
          try {
              await this.unmount(m.mountPoint);
              count++;
          } catch (e: any) {
              console.error(`Failed to unmount ${m.mountPoint}`, e);
              errors.push(`${m.serviceName} (${m.mountPoint}): ${e.message}`);
          }
      }

      return {
          success: errors.length === 0,
          unmountedCount: count,
          errors
      };
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
                  console.log(`Dropping dead mount: ${m.mountPoint} (PID ${m.pid})`);
              }
          }
      }
      store.set('mounts', validMounts);
  }

  getMounts(): MountState[] {
      return store.get('mounts') || [];
  }

  private removeMount(target: string) {
      const mounts = store.get('mounts') || [];
      store.set('mounts', mounts.filter(m => m.mountPoint !== target));
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
