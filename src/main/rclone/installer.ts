import fs from 'fs-extra';
import path from 'path';
import AdmZip from 'adm-zip';
import { exec } from 'child_process';
import { promisify } from 'util';
import { BIN_PATH, RCLONE_EXE_PATH } from '../utils/paths';
import { downloadFile } from '../utils/download';
import getStore from '../store';

const execAsync = promisify(exec);

export async function isRcloneInstalled(): Promise<boolean> {
  return fs.pathExists(RCLONE_EXE_PATH);
}

export async function installRclone(onProgress?: (percent: number) => void, targetVersion: string = '1.72.1', force: boolean = false): Promise<void> {
  if (!force && await isRcloneInstalled()) return;

  await fs.ensureDir(BIN_PATH);

  const url = `https://downloads.rclone.org/v${targetVersion}/rclone-v${targetVersion}-windows-amd64.zip`;
  const zipPath = path.join(BIN_PATH, 'rclone.zip');

  await downloadFile(url, zipPath, onProgress);

  // Unzip
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(BIN_PATH, true);

  // Move exe from subfolder to BIN_PATH
  const extractedFolder = path.join(BIN_PATH, `rclone-v${targetVersion}-windows-amd64`);
  const sourceExe = path.join(extractedFolder, 'rclone.exe');
  
  if (await fs.pathExists(sourceExe)) {
      await fs.move(sourceExe, RCLONE_EXE_PATH, { overwrite: true });
  } else {
      throw new Error(`rclone.exe not found in extracted folder: ${sourceExe}`);
  }

  // Cleanup
  await fs.remove(zipPath);
  await fs.remove(extractedFolder);
}

function compareVersions(v1: string, v2: string): number {
    const p1 = v1.split('.').map(Number);
    const p2 = v2.split('.').map(Number);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
        const n1 = p1[i] || 0;
        const n2 = p2[i] || 0;
        if (n1 > n2) return 1;
        if (n1 < n2) return -1;
    }
    return 0;
}

export async function checkAndAutoUpdateRclone(onStatus?: (msg: string) => void): Promise<void> {
    const store = getStore();
    const lastCheck = store.get('settings.lastDriverUpdateCheck') || 0;
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    
    // Check if 30 days have passed
    if (now - lastCheck < thirtyDaysMs) return;
  
    try {
        if (onStatus) onStatus('Verificando Drivers Cloud...');
        // Small delay so user can read the message
        await new Promise(resolve => setTimeout(resolve, 800));

        if (!(await isRcloneInstalled())) return;

        // Get Local Version
        const { stdout } = await execAsync(`"${RCLONE_EXE_PATH}" --version`);
        const localVersionMatch = stdout.match(/v(\d+\.\d+\.\d+)/);
        const localVersion = localVersionMatch ? localVersionMatch[1] : null;

        if (!localVersion) return;
  
        // Get Remote Version
        const versionUrl = 'https://downloads.rclone.org/version.txt';
        const response = await fetch(versionUrl);
        const versionText = await response.text();
        const remoteVersionMatch = versionText.match(/rclone v(\d+\.\d+\.\d+)/);
        const remoteVersion = remoteVersionMatch ? remoteVersionMatch[1] : null;
  
        if (remoteVersion && compareVersions(remoteVersion, localVersion) > 0) {
           const msg = `Actualizando Drivers Cloud a v${remoteVersion}...`;
           console.log(msg);
           if (onStatus) onStatus(msg);
           await installRclone(undefined, remoteVersion, true);
        }
        
        // Update check time
        store.set('settings.lastDriverUpdateCheck', now);
    } catch (e) {
        console.error('Auto-update check failed:', e);
        // Update timestamp anyway to avoid retrying on every boot if it's a network issue
        store.set('settings.lastDriverUpdateCheck', now);
    }
  }