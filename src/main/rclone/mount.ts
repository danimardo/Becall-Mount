import { spawn, exec } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import util from 'util';
import { RCLONE_EXE_PATH, LOGS_PATH, RCLONE_CONFIG_PATH } from '../utils/paths';
import { getSessionPassword } from '../utils/session';
import store from '../store';
import { MountState } from '../../contracts/types';
import { RcloneConfig } from './config';
import { setDriveIconAndLabel, clearDriveIconAndLabel } from '../utils/registry';

const execAsync = util.promisify(exec);

export class MountManager {
  private config: RcloneConfig;

  constructor() {
    this.config = new RcloneConfig();
  }

  private resolveIcoPath(schemaPath: string): string | null {
      if (!schemaPath) return null;
      const icoName = path.parse(schemaPath).name + '.ico';
      const possiblePaths = [
          // 1. ExtraResource (Producción - Método recomendado)
          path.join(process.resourcesPath, 'icons', icoName),
          // 2. Legacy ASAR Unpacked
          path.join(process.resourcesPath, 'app.asar.unpacked', 'public', 'icons', icoName),
          // 3. Desarrollo
          path.join(__dirname, '../../public/icons', icoName),
          path.join(__dirname, '../public/icons', icoName),
          path.join(process.cwd(), 'public', 'icons', icoName),
      ];
      for (const p of possiblePaths) {
          if (fs.existsSync(p)) return p;
      }
      return null;
  }

  async mount(serviceName: string, mountType: 'drive' | 'folder', target: string, extraArgs: string[] = [], schemaIconPath?: string): Promise<void> {
    const existingMounts = store.get('mounts') || [];
    const existingIndex = existingMounts.findIndex(m => m.mountPoint === target);
    
    if (existingIndex !== -1) {
        const isRunning = await this.checkPid(existingMounts[existingIndex].pid);
        if (isRunning) throw new Error(`El destino ${target} ya está montado.`);
        // Si no está corriendo, lo eliminamos para re-crearlo
        existingMounts.splice(existingIndex, 1);
        store.set('mounts', existingMounts);
    }

    if (mountType === 'drive') {
        try {
            const { stdout } = await execAsync('wmic logicaldisk get name');
            if (stdout.includes(`${target.replace(':', '')}:`)) {
                throw new Error(`La unidad ${target}: ya está en uso por el sistema.`);
            }
        } catch (e) {
            console.warn('Failed to check drive availability', e);
        }
        if (!target.endsWith(':')) target += ':';
    } else {
        if (fs.existsSync(target)) {
            throw new Error(`La carpeta de destino "${target}" ya existe.`);
        }
    }

    const pid = await this.spawnRclone(serviceName, target, extraArgs, schemaIconPath);

    const mounts = store.get('mounts') || [];
    mounts.push({
        serviceName,
        driveLetter: mountType === 'drive' ? target.replace(':', '') : undefined,
        mountPoint: target,
        mountType,
        pid,
        startTime: new Date().toISOString(),
        status: 'mounted',
        iconPath: schemaIconPath,
        extraArgs
    });
    store.set('mounts', mounts);
  }

  private async spawnRclone(serviceName: string, target: string, extraArgs: string[], schemaIconPath?: string): Promise<number> {
    const logFile = path.join(LOGS_PATH, `mount-${serviceName}-${Date.now()}.log`);
    await fs.ensureDir(LOGS_PATH);

    const env = { ...process.env, RCLONE_CONFIG_PASS: getSessionPassword() };
    const remoteConfig = await this.config.getRemoteConfig(serviceName);
    const bucket = remoteConfig['bucket'] || '';
    const remotePath = remoteConfig['path'] || '';

    let remotePathFull = `${serviceName}:`;
    if (bucket) {
      remotePathFull += bucket;
      if (remotePath) remotePathFull += `/${remotePath}`;
    } else if (remotePath) {
      // For SFTP/FTP that use 'path' instead of 'bucket'
      // Ensure we don't double slash if path starts with it
      remotePathFull += remotePath.startsWith('/') ? remotePath.substring(1) : remotePath;
    }

    // Aplicar Registro
    if (target.includes(':') && schemaIconPath) {
        const icoPath = this.resolveIcoPath(schemaIconPath);
        if (icoPath) await setDriveIconAndLabel(target, icoPath, serviceName);
    }

    const args = [
        'mount', remotePathFull, target,
        '--config', RCLONE_CONFIG_PATH,
        '--vfs-cache-mode', 'full',
        '--no-console',
        '--log-file', logFile,
        '--log-level', 'INFO',
        ...extraArgs
    ];

    const child = spawn(RCLONE_EXE_PATH, args, { env, detached: true, stdio: 'ignore' });
    child.unref();

    if (!child.pid) throw new Error('No se pudo iniciar rclone.');

    await new Promise(resolve => setTimeout(resolve, 2000));
    const isRunning = await this.checkPid(child.pid);
    if (!isRunning) {
        let log = '';
        try { log = await fs.readFile(logFile, 'utf-8'); } catch (e) {}
        throw new Error(`Error en rclone: ${log.slice(0, 200)}`);
    }

    return child.pid;
  }

  async autoMountAll(): Promise<void> {
      const mounts = store.get('mounts') || [];
      for (let i = 0; i < mounts.length; i++) {
          const m = mounts[i];
          const isRunning = await this.checkPid(m.pid);
          if (!isRunning) {
              console.log(`[MountManager] Re-mounting ${m.serviceName}...`);
              try {
                  const newPid = await this.spawnRclone(m.serviceName, m.mountPoint, m.extraArgs || [], m.iconPath);
                  mounts[i].pid = newPid;
                  mounts[i].startTime = new Date().toISOString();
              } catch (e) {
                  console.error(`[MountManager] Auto-mount failed for ${m.serviceName}`, e);
              }
          }
      }
      store.set('mounts', mounts);
  }

  async unmount(mountPoint: string): Promise<void> {
      const mounts = store.get('mounts') || [];
      const mount = mounts.find(m => m.mountPoint === mountPoint || (m.driveLetter && mountPoint.startsWith(m.driveLetter)));
      if (!mount) return;

      if (mount.pid) {
          try { await execAsync(`taskkill /PID ${mount.pid} /F`); } catch (e) {}
      }

      if (mount.mountType === 'drive') await clearDriveIconAndLabel(mount.mountPoint);
      
      const newMounts = (store.get('mounts') || []).filter(m => m.mountPoint !== mount.mountPoint);
      store.set('mounts', newMounts);
  }

  async unmountAll(): Promise<{ success: boolean; unmountedCount: number; errors: string[] }> {
      const mounts = [...(store.get('mounts') || [])];
      let count = 0;
      for (const m of mounts) {
          try {
              await this.unmount(m.mountPoint);
              count++;
          } catch (e) {}
      }
      return { success: true, unmountedCount: count, errors: [] };
  }

  async restoreState(): Promise<void> {
      // Solo actualiza el estado de los que ya están corriendo sin intentar montar nada
      const mounts = store.get('mounts') || [];
      const updatedMounts = [];
      for (const m of mounts) {
          if (await this.checkPid(m.pid)) updatedMounts.push(m);
          // Si no está corriendo, lo mantenemos en el store pero no como 'active'?
          // No, lo mantenemos para que autoMountAll lo intente luego
          else updatedMounts.push(m); 
      }
      store.set('mounts', updatedMounts);
  }

  getMounts(): MountState[] {
      return store.get('mounts') || [];
  }

  private async checkPid(pid: number): Promise<boolean> {
      if (!pid) return false;
      try {
          const { stdout } = await execAsync(`tasklist /FI "PID eq ${pid}" /NH`);
          return stdout.includes(pid.toString());
      } catch { return false; }
  }
}