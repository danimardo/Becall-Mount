import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export async function getFreeDiskSpaceGB(drive = 'C'): Promise<number> {
  try {
    // Usamos PowerShell para obtener el espacio libre en bytes de forma precisa
    const command = `powershell -NoProfile -Command "(Get-PSDrive ${drive}).Free / 1GB"`;
    const { stdout } = await execAsync(command);
    const freeSpace = parseFloat(stdout.trim());
    return isNaN(freeSpace) ? 0 : Math.round(freeSpace * 100) / 100;
  } catch (error) {
    console.error(`Error al obtener espacio libre en disco ${drive}:`, error);
    return 0;
  }
}
