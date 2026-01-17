import fs from 'fs-extra';
import path from 'path';
import { spawn, exec } from 'child_process';
import { app } from 'electron';
import util from 'util';
import { downloadFile } from './download';

const execAsync = util.promisify(exec);

export async function isWinFspInstalled(): Promise<boolean> {
  // Method 1: Check service using PowerShell with wildcard (as suggested by user)
  try {
    const { stdout } = await execAsync('powershell -NoProfile -Command "Get-Service -Name WinFsp* -ErrorAction SilentlyContinue"');
    // If the output contains any service, it's installed
    if (stdout.trim().length > 0 && stdout.includes('WinFsp')) return true;
  } catch (e) {
    // Service not found or error
  }

  // Method 2: Check standard paths as fallback
  const path64 = 'C:\\Program Files (x86)\\WinFsp\\bin\\launch-winfsp.bat';
  const path32 = 'C:\\Program Files\\WinFsp\\bin\\launch-winfsp.bat';
  const pathNative = 'C:\\Program Files\\WinFsp\\bin\\launch-winfsp.bat';
  
  if (await fs.pathExists(path64)) return true;
  if (await fs.pathExists(path32)) return true;
  if (await fs.pathExists(pathNative)) return true;

  return false;
}

export async function installWinFsp(onProgress?: (percent: number) => void): Promise<void> {
  const url = 'https://github.com/winfsp/winfsp/releases/download/v2.0/winfsp-2.0.23075.msi';
  const msiPath = path.join(app.getPath('temp'), 'winfsp.msi');

  await downloadFile(url, msiPath, onProgress);

  // Run MSI
  const child = spawn('msiexec', ['/i', msiPath], { detached: true, stdio: 'ignore' });
  child.unref();
}