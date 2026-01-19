<script lang="ts">
  import { onMount } from 'svelte';
  import { showAlert } from '../../stores/modal';
  import { getRemoteConfig } from '../../lib/remote-schema-loader';

  let mountType = $state<'drive' | 'folder'>('drive');
  let driveLetter = $state('');
  let folderPath = $state('');
  let loading = $state(false);
  let availableDrives = $state<string[]>([]);

  let { serviceName, serviceType, onMounted, onCancel } = $props<{ 
      serviceName: string, 
      serviceType: string,
      onMounted: () => void, 
      onCancel: () => void 
  }>();

  onMount(async () => {
      try {
          availableDrives = await window.api.invoke('system:get-free-drives');
      } catch (e) {
          console.error('Error fetching drives', e);
      }
  });

  async function selectFolder() {
      try {
          const path = await window.api.invoke('system:select-folder');
          if (path) folderPath = path;
      } catch (e) {
          console.error(e);
      }
  }

  async function submit() {
      if (mountType === 'drive' && !driveLetter) return;
      if (mountType === 'folder' && !folderPath) return;

      const target = mountType === 'drive' ? driveLetter : folderPath;
      loading = true;
      
      try {
          console.log(`Attempting mount: ${serviceName} (${serviceType}) -> ${target}`);
          const schema = getRemoteConfig(serviceType);
          const extraArgs = schema?.mountArgs || [];
          const iconPath = schema?.icon || '';
          
          await window.api.invoke('mount:start', { 
              serviceName, 
              mountType, 
              target, 
              extraArgs,
              iconPath
          });
          console.log('Mount success');
          onMounted();
      } catch (e: any) {
          console.error('Mount failed:', e);
          loading = false; // Desactivar spinner antes de la alerta
          await showAlert('Error', 'Fallo al montar: ' + e.message);
      } finally {
          loading = false;
      }
  }
</script>

<div class="modal-box bg-white dark:bg-slate-800 dark:text-white border border-gray-200 dark:border-gray-700 shadow-2xl">
  <h3 class="font-bold text-lg mb-4">Montar {serviceName}</h3>
  
  <div role="tablist" class="grid grid-cols-2 gap-1 p-1 bg-gray-100 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-gray-600 mb-6">
      <button 
        role="tab" 
        class="py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none cursor-pointer"
        class:bg-white={mountType === 'drive'} 
        class:text-brand-blue={mountType === 'drive'} 
        class:shadow-sm={mountType === 'drive'}
        class:text-gray-500={mountType !== 'drive'}
        class:dark:bg-slate-600={mountType === 'drive'} 
        class:dark:text-white={mountType === 'drive'}
        class:dark:text-gray-400={mountType !== 'drive'}
        onclick={() => mountType = 'drive'}
      >
        Unidad
      </button>
      <button 
        role="tab" 
        class="py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none cursor-pointer"
        class:bg-white={mountType === 'folder'} 
        class:text-brand-blue={mountType === 'folder'} 
        class:shadow-sm={mountType === 'folder'}
        class:text-gray-500={mountType !== 'folder'}
        class:dark:bg-slate-600={mountType === 'folder'} 
        class:dark:text-white={mountType === 'folder'}
        class:dark:text-gray-400={mountType !== 'folder'}
        onclick={() => mountType = 'folder'}
      >
        Carpeta
      </button>
  </div>

  <form class="space-y-4" onsubmit={(e) => { e.preventDefault(); submit(); }}>
    {#if mountType === 'drive'}
        <div class="form-control">
            <label class="label font-semibold" for="drive-select">Letra de Unidad</label>
            {#if availableDrives.length > 0}
                <select id="drive-select" class="select select-bordered dark:bg-slate-700 dark:border-gray-600" bind:value={driveLetter}>
                    <option value="" disabled selected>Seleccionar letra...</option>
                    {#each availableDrives as letter}
                        <option value={letter}>{letter}:</option>
                    {/each}
                </select>
            {:else}
                <div class="alert alert-warning">No hay letras de unidad disponibles.</div>
            {/if}
        </div>
    {:else}
        <div class="form-control">
            <label class="label font-semibold" for="folder-path">Ruta de Carpeta Local</label>
            <div class="flex gap-2 w-full">
                <input 
                    id="folder-path" 
                    type="text" 
                    bind:value={folderPath} 
                    placeholder="C:\MisNubes\Carpeta" 
                    class="input input-bordered flex-1 min-w-0 dark:bg-slate-700 dark:border-gray-600 focus:border-brand-blue" 
                />
                <button 
                    type="button" 
                    class="btn btn-square btn-outline border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700" 
                    onclick={selectFolder} 
                    aria-label="Seleccionar carpeta"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                </button>
            </div>
            <label class="label">
                <span class="label-text-alt text-warning font-medium">La carpeta de destino no ha de existir</span>
            </label>
        </div>
    {/if}

    <div class="modal-action gap-2">
        <button class="btn btn-outline text-brand-blue border-brand-blue hover:bg-brand-blue hover:text-white" type="button" onclick={onCancel}>Cancelar</button>
        <button class="btn bg-brand-green hover:bg-brand-green-dark text-white border-none min-w-[100px]" type="submit" disabled={loading || (mountType === 'drive' && !driveLetter) || (mountType === 'folder' && !folderPath)}>
            {#if loading}
                <span class="loading loading-spinner loading-xs"></span>
            {:else}
                Montar
            {/if}
        </button>
    </div>
  </form>
</div>