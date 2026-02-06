import { PowerShellWrapper } from './powershell';
import { DomainInfo } from '../../contracts/types';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class ADSyncService {
  /**
   * Obtiene la información del usuario actual del dominio.
   */
  static async getUserInfo(): Promise<DomainInfo | null> {
    try {
      const command = `
        $searcher = New-Object DirectoryServices.DirectorySearcher;
        $searcher.Filter = "(&(objectClass=user)(sAMAccountName=$env:USERNAME))";
        $result = $searcher.FindOne();
        if ($result) {
            $p = $result.Properties;
            @{
                SamAccountName = if ($p.samaccountname) { [string]$p.samaccountname[0] } else { "" };
                DisplayName = if ($p.displayname) { [string]$p.displayname[0] } else { "" };
                EmailAddress = if ($p.mail) { [string]$p.mail[0] } else { "" };
                DistinguishedName = if ($p.distinguishedname) { [string]$p.distinguishedname[0] } else { "" };
                Department = if ($p.department) { [string]$p.department[0] } else { "" };
                Title = if ($p.title) { [string]$p.title[0] } else { "" };
                MemberOf = if ($p.memberof) { @($p.memberof) } else { @() };
            }
        }
      `.trim();
      
      const rawData = await PowerShellWrapper.executeAsJson<any>(command);
      
      if (!rawData) return null;

      return {
        SamAccountName: rawData.SamAccountName || '',
        DisplayName: rawData.DisplayName || '',
        EmailAddress: rawData.EmailAddress || '',
        DistinguishedName: rawData.DistinguishedName || '',
        Department: rawData.Department || '',
        Title: rawData.Title || '',
        MemberOf: Array.isArray(rawData.MemberOf) ? rawData.MemberOf : [],
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('[ADSync] Error getting user info:', error);
      throw error;
    }
  }

  /**
   * Intenta instalar las RSAT (Active Directory Tools) mediante PowerShell pidiendo elevación.
   * @deprecated Las RSAT ya no son necesarias con la nueva implementación de DirectorySearcher.
   */
  static async installRsat(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('[ADSync] Requesting RSAT installation with elevation...');
      
      // Comando que funcionaba anteriormente
      const installCmd = 'Add-WindowsCapability -Online -Name Rsat.ActiveDirectory.DS.Tools~~~~0.0.1.0';
      // Lo ejecutamos de forma que Windows no se líe con las comillas y los pipes
      const fullCommand = `powershell.exe -Command "Start-Process powershell.exe -ArgumentList '-NoProfile -Command ${installCmd}' -Verb RunAs -Wait"`;
      
      await execAsync(fullCommand);
      
      return { 
        success: true, 
        message: 'Proceso finalizado. Reinicie para detectar cambios.' 
      };
    } catch (error) {
      console.error('[ADSync] Error installing RSAT:', error);
      return { success: false, message: 'No se pudo iniciar la instalación.' };
    }
  }
}
