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
      
      // Obtener el nombre base sin extensión y añadir .ico
      const icoName = path.parse(schemaPath).name + '.ico';
      
      const possiblePaths = [
          // Producción: carpeta unpacked
          path.join(process.resourcesPath, 'app.asar.unpacked', 'public', 'icons', icoName),
          // Desarrollo
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
    // Check if target is already in use by OUR app
    const existingTarget = (store.get('mounts') || []).find(m => m.mountPoint === target);
    if (existingTarget) {
        const isRunning = await this.checkPid(existingTarget.pid);
        if (isRunning) throw new Error(`El destino ${target} ya está montado en esta aplicación.`);
        this.removeMount(target);
    }

    if (mountType === 'drive') {
        // Check drive availability
        try {
            const { stdout } = await execAsync('wmic logicaldisk get name');
            if (stdout.includes(`${target.replace(':', '')}:`)) {
                throw new Error(`La unidad ${target}: ya está en uso por el sistema.`);
            }
        } catch (e) {
            console.warn('Failed to check drive availability via wmic', e);
        }
        if (!target.endsWith(':')) target += ':';

        // Personalizar Icono y Etiqueta en el Registro
        if (schemaIconPath) {
            const icoPath = this.resolveIcoPath(schemaIconPath);
            if (icoPath) {
                await setDriveIconAndLabel(target, icoPath, serviceName);
            }
        }
    } else {
        // Validación para montaje en CARPETA (Windows/WinFsp)
        // La carpeta de destino NO DEBE EXISTIR
        if (fs.existsSync(target)) {
            throw new Error(`La carpeta de destino "${target}" ya existe. El montaje requiere que la carpeta no exista (Rclone la creará).`);
        }
        
        const parentDir = path.dirname(target);
        if (!fs.existsSync(parentDir)) {
            throw new Error(`La carpeta superior "${parentDir}" no existe. Debe existir para poder crear el punto de montaje.`);
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

    // Construir el path remoto: remoto:bucket/path
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
        '--log-level', 'INFO',
        ...extraArgs
    ];

    console.log('Executing rclone mount with args:', args);

    const child = spawn(RCLONE_EXE_PATH, args, { 
        env, 
        detached: true, 
        stdio: 'ignore' 
    });
    
    child.unref();

    if (!child.pid) throw new Error('No se pudo iniciar el proceso de rclone.');

    // Wait and check if process is still alive after 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    const isRunning = await this.checkPid(child.pid);
    
    if (!isRunning) {
        let log = '';
        try {
            log = await fs.readFile(logFile, 'utf-8');
        } catch (e) {}
        throw new Error(`El montaje falló. Log de error: ${log.slice(0, 300)}...`);
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
      console.log(`[MountManager] Request to unmount: ${mountPoint}`);
      const mounts = store.get('mounts') || [];
      const mount = mounts.find(m => 
          m.mountPoint === mountPoint || 
          (m.driveLetter && (mountPoint === m.driveLetter || mountPoint === `${m.driveLetter}:`))
      );
      
      if (!mount) {
          console.warn(`[MountManager] Mount not found in store for ${mountPoint}`);
          return;
      }

      if (mount.pid) {
          try {
              console.log(`[MountManager] Killing PID ${mount.pid}`);
              await execAsync(`taskkill /PID ${mount.pid} /F`);
          } catch (e: any) {
              console.warn(`[MountManager] Failed to kill PID ${mount.pid}`, e.message);
          }
      }

      // Limpiar personalización de disco en el registro
      if (mount.mountType === 'drive') {
          await clearDriveIconAndLabel(mountPoint);
      }
      
      this.removeMount(mount.mountPoint || mount.driveLetter || mountPoint);
  }

  async unmountAll(): Promise<{ success: boolean; unmountedCount: number; errors: string[] }> {
      const mounts = this.getMounts();
      console.log(`[MountManager] UnmountAll: Found ${mounts.length} mounts`);

      let count = 0;
      const errors: string[] = [];
      const mountsToUnmount = [...mounts];

      for (const m of mountsToUnmount) {
          const target = m.mountPoint || (m.driveLetter ? `${m.driveLetter}:` : undefined);
          console.log(`[MountManager] Processing mount: Service=${m.serviceName}, Target=${target}`);
          
          if (!target) {
              this.removeMount('FORCE_CLEANUP_INVALID'); 
              continue;
          }
          try {
              await this.unmount(target);
              count++;
          } catch (e: any) {
              console.error(`[MountManager] Error unmounting ${target}:`, e);
              errors.push(`${m.serviceName}: ${e.message}`);
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
      if (target === 'FORCE_CLEANUP_INVALID') {
          store.set('mounts', mounts.filter(m => m.mountPoint || m.driveLetter));
          return;
      }
      store.set('mounts', mounts.filter(m => {
          const driveLetterWithoutColon = m.driveLetter ? m.driveLetter.replace(':', '') : '';
          const targetWithoutColon = target.replace(':', '');
          return m.mountPoint !== target && m.driveLetter !== target && driveLetterWithoutColon !== targetWithoutColon;
      }));
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