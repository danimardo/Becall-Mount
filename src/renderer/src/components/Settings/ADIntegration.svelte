<script lang="ts">
  import { onMount } from 'svelte';
  import type { AppSettings, DomainInfo } from '../../../../contracts/types';
  import { showPrompt, showAlert } from '../../stores/modal';

  let settings = $state<AppSettings | null>(null);
  let isDomain = $state(false);
  let isLoading = $state(false);
  let error = $state('');

  onMount(async () => {
    await loadSettings();
    await checkDomain();
  });

  async function loadSettings() {
    settings = await window.api.invoke('settings:get');
  }

  async function checkDomain() {
    const prereqs = await window.api.invoke('system:check-prereqs');
    isDomain = prereqs.isDomain;
  }

  async function toggleAD() {
    if (!settings || !isDomain) return;
    isLoading = true;
    error = '';
    
    try {
      const newEnabled = !settings.adIntegrationEnabled;
      
      if (newEnabled) {
        // Al activar AD, el autologin es obligatorio. Pedimos la clave una vez.
        const password = await showPrompt(
          'Habilitar Integración AD', 
          'Introduce tu contraseña maestro para habilitar la integración total con AD (incluye Autologin):',
          'password',
          'Contraseña Maestra'
        );
        
        if (!password) {
          isLoading = false;
          // Restaurar el checkbox si se canceló
          await loadSettings();
          return;
        }
        
        await window.api.invoke('auth:enableAutologin', { masterPassword: password });
        await window.api.invoke('settings:set', { adIntegrationEnabled: true });
        await syncAD();
      } else {
        // Al desactivar AD, también quitamos el autologin
        await window.api.invoke('settings:set', { 
          adIntegrationEnabled: false,
          autologinEnabled: false 
        });
        await loadSettings();
      }
    } catch (e) {
      error = 'Error al cambiar la integración AD: ' + (e as Error).message;
    } finally {
      isLoading = false;
    }
  }

  async function syncAD() {
    isLoading = true;
    error = '';
    try {
      const info = await window.api.invoke('ad:syncInfo');
      await window.api.invoke('settings:set', { infoDominio: info });
      await loadSettings();
    } catch (e) {
      error = 'Error al sincronizar con AD: ' + (e as Error).message;
    } finally {
      isLoading = false;
    }
  }

  async function selectConfPath() {
    const path = await window.api.invoke('system:select-folder');
    if (path) {
      await window.api.invoke('settings:set', { adConfPath: path });
      await loadSettings();
    }
  }

  async function importConfigs() {
    if (!settings) return;
    isLoading = true;
    error = '';
    
    try {
      let passwords: Record<string, string> = {};
      let result = await window.api.invoke('ad:importConfigs', { 
        customPath: settings.adConfPath, 
        passwords 
      });

      // Si hay archivos que necesitan contraseña, preguntamos por cada uno
      while (result.needPassword && result.needPassword.length > 0) {
        const file = result.needPassword[0];
        const pass = await showPrompt(
          'Archivo Cifrado Detectado', 
          `El archivo "${file.name}" está cifrado. Introduce su contraseña:`,
          'password',
          'Contraseña del archivo .conf'
        );

        if (pass === null) break; // Usuario canceló

        passwords[file.path] = pass;
        
        // Reintentar con la nueva contraseña añadida al mapa
        result = await window.api.invoke('ad:importConfigs', { 
          customPath: settings.adConfPath, 
          passwords 
        });
      }

      if (result.imported > 0 || result.failed.length === 0) {
        await showAlert(
          'Importación finalizada', 
          `Se han importado ${result.imported} configuraciones.${result.failed.length > 0 ? `\nFallaron: ${result.failed.join(', ')}` : ''}`,
          result.failed.length > 0 ? 'warning' : 'success'
        );
      }
    } catch (e) {
      error = 'Error al importar: ' + (e as Error).message;
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="card bg-secondary text-text-primary border border-primary shadow-xl p-6 flex flex-col gap-4">
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-xl font-bold text-text-brand-primary">Integración con Active Directory</h2>
      {#if isDomain}
        <p class="text-sm opacity-70 text-text-secondary">Sincroniza configuración y habilita autologin de dominio.</p>
      {:else}
        <p class="text-sm text-error-500 font-semibold italic">Funcionalidad no disponible: Equipo no unido a un dominio.</p>
      {/if}
    </div>
    {#if isDomain}
      <input 
        type="checkbox" 
        class="toggle border-border-brand checked:bg-brand-500 checked:border-border-brand" 
        checked={settings?.adIntegrationEnabled} 
        onchange={toggleAD}
        disabled={isLoading}
      />
    {/if}
  </div>

  {#if error}
    <div class="alert bg-error-500/10 border-error-500/30 text-error-600 text-sm">
      <span>{error}</span>
    </div>
  {/if}

  {#if settings?.adIntegrationEnabled && isDomain}
    <div class="divider border-primary/50"></div>
    
    <div class="flex flex-col gap-2">
      <h3 class="font-semibold text-text-brand-primary">Estado: Conectado y Autologin Activo</h3>
      {#if settings.infoDominio}
        <div class="grid grid-cols-2 gap-2 text-sm mt-2 bg-primary dark:bg-slate-700/50 p-3 rounded-lg border border-primary">
          <span class="opacity-70 text-text-secondary">Usuario:</span>
          <span class="font-mono font-medium">{settings.infoDominio.SamAccountName}</span>
          <span class="opacity-70 text-text-secondary">Nombre:</span>
          <span class="font-medium">{settings.infoDominio.DisplayName}</span>
          <span class="opacity-70 text-text-secondary">Departamento:</span>
          <span class="font-medium">{settings.infoDominio.Department || 'N/D'}</span>
          <span class="opacity-70 text-text-secondary">Actualizado:</span>
          <span class="text-xs">{new Date(settings.infoDominio.lastUpdated).toLocaleString()}</span>
        </div>
        <button class="btn btn-sm btn-ghost text-brand-600 mt-2" onclick={syncAD} disabled={isLoading}>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Re-sincronizar datos de red
        </button>
      {:else if !isLoading}
        <p class="text-sm text-warning-600 italic">Sincronizando datos del dominio...</p>
      {/if}
    </div>

    <div class="divider border-primary/50"></div>

    <div class="flex flex-col gap-2">
      <h3 class="font-semibold text-text-primary">Importación Automática de Red</h3>
      <p class="text-xs text-text-secondary mb-4">Se escanearán los recursos corporativos para configurar automáticamente tus unidades de red.</p>
      
      <button class="btn btn-sm bg-orange-500 hover:bg-orange-600 text-white border-none w-full shadow-md" onclick={importConfigs} disabled={isLoading}>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Escanear e Importar Configuraciones
      </button>
    </div>
  {/if}

  {#if isLoading}
    <div class="flex justify-center">
      <span class="loading loading-dots loading-md text-brand-600"></span>
    </div>
  {/if}
</div>