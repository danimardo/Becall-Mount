<script lang="ts">
  import { onMount } from 'svelte';

  let driveLetter = $state('');
  let loading = $state(false);
  let availableDrives = $state<string[]>([]);

  let { serviceName, onMounted, onCancel } = $props<{ serviceName: string, onMounted: () => void, onCancel: () => void }>();

  onMount(async () => {
      try {
          availableDrives = await window.api.invoke('system:get-free-drives');
          if (availableDrives.length > 0) {
              driveLetter = availableDrives[0]; // Pre-select highest available (usually Z)
          }
      } catch (e) {
          console.error('Error fetching drives', e);
      }
  });

  async function submit() {
      if (!driveLetter) return;
      loading = true;
      try {
          await window.api.invoke('mount:start', { serviceName, driveLetter });
          onMounted();
      } catch (e) {
          alert('Fallo al montar: ' + (e as Error).message);
          console.error(e);
      } finally {
          loading = false;
      }
  }
</script>

<div class="modal-box">
  <h3 class="font-bold text-lg">Montar {serviceName}</h3>
  <form class="py-4 space-y-4" onsubmit={(e) => { e.preventDefault(); submit(); }}>
    <div class="form-control">
        <label class="label">Letra de Unidad</label>
        {#if availableDrives.length > 0}
            <select class="select select-bordered" bind:value={driveLetter}>
                {#each availableDrives as letter}
                    <option value={letter}>{letter}:</option>
                {/each}
            </select>
        {:else}
            <div class="alert alert-warning">No hay letras de unidad disponibles.</div>
        {/if}
    </div>

    <div class="modal-action">
        <button class="btn" type="button" onclick={onCancel}>Cancelar</button>
        <button class="btn btn-primary" type="submit" disabled={loading || !driveLetter}>
            {#if loading}<span class="loading loading-spinner"></span>{/if}
            Montar
        </button>
    </div>
  </form>
</div>