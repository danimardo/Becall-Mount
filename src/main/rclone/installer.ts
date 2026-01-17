import fs from 'fs-extra';
import path from 'path';
import AdmZip from 'adm-zip';
import { BIN_PATH, RCLONE_EXE_PATH } from '../utils/paths';
import { downloadFile } from '../utils/download';

export async function isRcloneInstalled(): Promise<boolean> {
  return fs.pathExists(RCLONE_EXE_PATH);
}

export async function installRclone(onProgress?: (percent: number) => void): Promise<void> {
  if (await isRcloneInstalled()) return;

  await fs.ensureDir(BIN_PATH);

  const url = 'https://downloads.rclone.org/v1.65.0/rclone-v1.65.0-windows-amd64.zip';
  const zipPath = path.join(BIN_PATH, 'rclone.zip');

  await downloadFile(url, zipPath, onProgress);

  // Unzip
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(BIN_PATH, true);

  // Move exe from subfolder to BIN_PATH
  const extractedFolder = path.join(BIN_PATH, 'rclone-v1.65.0-windows-amd64');
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