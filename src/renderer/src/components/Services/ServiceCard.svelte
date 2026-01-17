<script lang="ts">
  import type { Service } from '../../../../contracts/types';
  import MountModal from '../Mount/MountModal.svelte';
  
  let { service, onDelete, onMountChange } = $props<{ service: Service, onDelete: (name: string) => void, onMountChange: () => void }>();
  
  let showMountModal = $state(false);
  let unmounting = $state(false);

  async function handleDelete() {
      if(confirm(`¿Eliminar servicio ${service.name}?`)) {
          await window.api.invoke('services:delete', service.name);
          onDelete(service.name);
      }
  }

  async function handleUnmount() {
      if (!service.mountPoint) return;
      unmounting = true;
      try {
          const letter = service.mountPoint.replace(':', '');
          await window.api.invoke('mount:stop', letter);
          onMountChange();
      } catch (e) {
          alert('Fallo al desmontar');
          console.error(e);
      } finally {
          unmounting = false;
      }
  }
</script>

<div class="card bg-base-100 shadow-sm border border-base-200">
  <div class="card-body p-4 flex-row items-center justify-between">
    <div class="flex items-center gap-2">
        <div>
            <h3 class="font-bold text-lg">{service.name}</h3>
            <span class="badge badge-ghost badge-sm">{service.type}</span>
        </div>
        {#if service.isMounted}
            <span class="badge badge-success gap-1">
                Montado: {service.mountPoint}
            </span>
        {/if}
    </div>
    <div class="flex gap-2">
        {#if service.isMounted}
            <button class="btn btn-sm btn-warning" onclick={handleUnmount} disabled={unmounting}>
                {unmounting ? '...' : 'Desmontar'}
            </button>
        {:else}
            <button class="btn btn-sm btn-success" onclick={() => showMountModal = true}>Montar</button>
        {/if}
        <button class="btn btn-sm btn-ghost text-error" onclick={handleDelete}>Eliminar</button>
    </div>
  </div>
</div>

{#if showMountModal}
    <dialog class="modal modal-open">
        <MountModal 
            serviceName={service.name} 
            onMounted={() => { showMountModal = false; onMountChange(); }}
            onCancel={() => showMountModal = false}
        />
    </dialog>
{/if}
