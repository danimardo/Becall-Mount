<script lang="ts">
  import { onMount } from 'svelte';

  let mountType = $state<'drive' | 'folder'>('drive');
  let driveLetter = $state('');
  let folderPath = $state('');
  let loading = $state(false);
  let availableDrives = $state<string[]>([]);

  let { serviceName, onMounted, onCancel } = $props<{ serviceName: string, onMounted: () => void, onCancel: () => void }>();

  onMount(async () => {
      try {
          availableDrives = await window.api.invoke('system:get-free-drives');
          // Do NOT pre-select as per spec requirement FR-MNT-02/Scenario 2
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

  async function submit(force = false) {
      if (mountType === 'drive' && !driveLetter) return;
      if (mountType === 'folder' && !folderPath) return;

      const target = mountType === 'drive' ? driveLetter : folderPath;

      loading = true;
      try {
          await window.api.invoke('mount:start', { serviceName, mountType, target, force });
          onMounted();
      } catch (e: any) {
          if (e.message.includes('FOLDER_NOT_EMPTY')) {
              if (confirm('La carpeta no está vacía. Los archivos locales se ocultarán temporalmente. ¿Continuar?')) {
                  await submit(true);
                  return; // Don't run finally block here, let the recursive call handle it or handled by finally below?
                  // Wait, recursive call will set loading=false in its finally.
                  // This is fine.
              }
          } else {
              alert('Fallo al montar: ' + e.message);
              console.error(e);
          }
      } finally {
          // If recursive called happened, loading might already be false? No, JS single threaded.
          // Recursive call `await submit(true)` finishes, then we come here.
          // It's okay to set loading false again.
          loading = false;
      }
  }
</script>

<div class="modal-box">
  <h3 class="font-bold text-lg mb-4">Montar {serviceName}</h3>
  
  <div role="tablist" class="tabs tabs-boxed mb-4">
      <button role="tab" class="tab" class:tab-active={mountType === 'drive'} onclick={() => mountType = 'drive'}>Unidad</button>
      <button role="tab" class="tab" class:tab-active={mountType === 'folder'} onclick={() => mountType = 'folder'}>Carpeta</button>
  </div>

  <form class="space-y-4" onsubmit={(e) => { e.preventDefault(); submit(); }}>
    {#if mountType === 'drive'}
        <div class="form-control">
            <label class="label" for="drive-select">Letra de Unidad</label>
            {#if availableDrives.length > 0}
                <select id="drive-select" class="select select-bordered" bind:value={driveLetter}>
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
            <label class="label" for="folder-path">Ruta de Carpeta Local</label>
            <div class="join w-full">
                <input id="folder-path" type="text" bind:value={folderPath} placeholder="C:\MisNubes\Carpeta" class="input input-bordered join-item flex-1" />
                <button type="button" class="btn btn-secondary join-item" onclick={selectFolder} aria-label="Seleccionar carpeta">📂</button>
            </div>
            <label class="label">
                <span class="label-text-alt text-warning">Nota: Si la carpeta tiene archivos, se ocultarán mientras esté montada.</span>
            </label>
        </div>
    {/if}

    <div class="modal-action">
        <button class="btn" type="button" onclick={onCancel}>Cancelar</button>
        <button class="btn btn-primary" type="submit" disabled={loading || (mountType === 'drive' && !driveLetter) || (mountType === 'folder' && !folderPath)}>
            {#if loading}<span class="loading loading-spinner"></span>{/if}
            Montar
        </button>
    </div>
  </form>
</div>
