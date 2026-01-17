import fs from 'fs-extra';
import path from 'path';
import { spawn } from 'child_process';
import { app } from 'electron';
import { downloadFile } from './download';

export async function isWinFspInstalled(): Promise<boolean> {
  // Check standard paths
  const path64 = 'C:\\Program Files (x86)\\WinFsp\\bin\\launch-winfsp.bat';
  const path32 = 'C:\\Program Files\\WinFsp\\bin\\launch-winfsp.bat';
  return (await fs.pathExists(path64)) || (await fs.pathExists(path32));
}

export async function installWinFsp(onProgress?: (percent: number) => void): Promise<void> {
  const url = 'https://github.com/winfsp/winfsp/releases/download/v2.0/winfsp-2.0.23075.msi';
  const msiPath = path.join(app.getPath('temp'), 'winfsp.msi');

  await downloadFile(url, msiPath, onProgress);

  // Run MSI
  const child = spawn('msiexec', ['/i', msiPath], { detached: true, stdio: 'ignore' });
  child.unref();
}
