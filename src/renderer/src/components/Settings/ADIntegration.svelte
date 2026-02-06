<script lang="ts">
  import { onMount } from 'svelte';
  import type { AppSettings, DomainInfo } from '../../../../contracts/types';

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
        const password = prompt('Introduce tu contraseña maestro para habilitar la integración total con AD (incluye Autologin):');
        if (!password) {
          isLoading = false;
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
</script>

<div class="card bg-base-200 shadow-xl p-6 flex flex-col gap-4">
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-xl font-bold">Integración con Active Directory</h2>
      {#if isDomain}
        <p class="text-sm opacity-70">Sincroniza configuración y habilita autologin de dominio.</p>
      {:else}
        <p class="text-sm text-error font-semibold italic">Funcionalidad no disponible: Equipo no unido a un dominio.</p>
      {/if}
    </div>
    {#if isDomain}
      <input 
        type="checkbox" 
        class="toggle toggle-primary" 
        checked={settings?.adIntegrationEnabled} 
        onchange={toggleAD}
        disabled={isLoading}
      />
    {/if}
  </div>

  {#if error}
    <div class="alert alert-error text-sm">
      <span>{error}</span>
    </div>
  {/if}

  {#if settings?.adIntegrationEnabled && isDomain}
    <div class="divider"></div>
    
    <div class="flex flex-col gap-2">
      <h3 class="font-semibold text-brand-blue">Estado: Conectado y Autologin Activo</h3>
      {#if settings.infoDominio}
        <div class="grid grid-cols-2 gap-2 text-sm mt-2 bg-base-300 p-3 rounded-lg">
          <span class="opacity-70">Usuario:</span>
          <span class="font-mono">{settings.infoDominio.SamAccountName}</span>
          <span class="opacity-70">Nombre:</span>
          <span>{settings.infoDominio.DisplayName}</span>
          <span class="opacity-70">Departamento:</span>
          <span>{settings.infoDominio.Department}</span>
          <span class="opacity-70">Actualizado:</span>
          <span>{new Date(settings.infoDominio.lastUpdated).toLocaleString()}</span>
        </div>
        <button class="btn btn-sm btn-ghost mt-2" onclick={syncAD} disabled={isLoading}>
          Re-sincronizar datos de red
        </button>
      {:else if !isLoading}
        <p class="text-sm text-warning italic">Sincronizando datos del dominio...</p>
      {/if}
    </div>

    <div class="divider"></div>

    <div class="flex flex-col gap-2">
      <h3 class="font-semibold">Importación Automática (.conf)</h3>
      <p class="text-xs opacity-70 mb-2">Se buscarán archivos en la ruta especificada para crear servicios automáticamente.</p>
      <div class="flex gap-2">
        <input 
          type="text" 
          class="input input-bordered input-sm flex-1" 
          placeholder="Ruta externa de configuraciones..." 
          readonly
          value={settings.adConfPath || ''} 
        />
        <button class="btn btn-sm btn-secondary" onclick={selectConfPath}>Cambiar</button>
      </div>
      <button class="btn btn-sm btn-primary w-full mt-2" onclick={importConfigs} disabled={isLoading}>
        Escanear e Importar ahora
      </button>
    </div>
  {/if}

  {#if isLoading}
    <div class="flex justify-center">
      <span class="loading loading-dots loading-md"></span>
    </div>
  {/if}
</div>
