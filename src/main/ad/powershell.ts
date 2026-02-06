import { spawn } from 'child_process';

/**
 * Utilidad para ejecutar comandos de PowerShell y capturar su salida.
 */
export class PowerShellWrapper {
  /**
   * Ejecuta un script de PowerShell y devuelve la salida como string.
   */
  static async execute(script: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const ps = spawn('powershell.exe', [
        '-NoProfile',
        '-NonInteractive',
        '-ExecutionPolicy', 'Bypass',
        '-Command', script
      ]);

      let stdout = '';
      let stderr = '';

      ps.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      ps.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      ps.on('close', (code) => {
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          reject(new Error(`PowerShell exited with code ${code}. Stderr: ${stderr}`));
        }
      });
    });
  }

  /**
   * Ejecuta un comando y parsea el resultado como JSON.
   */
  static async executeAsJson<T>(command: string): Promise<T> {
    const script = `${command} | ConvertTo-Json -Compress`;
    const result = await this.execute(script);
    if (!result) return null as unknown as T;
    return JSON.parse(result) as T;
  }
}
