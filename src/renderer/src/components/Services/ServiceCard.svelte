<script lang="ts">
  import type { Service } from '../../../../contracts/types';
  import MountModal from '../Mount/MountModal.svelte';
  import { getRemoteConfig } from '../../lib/remote-schema-loader';

  let { service, onDelete, onMountChange, onEdit } = $props<{ 
      service: Service, 
      onDelete: (name: string) => void, 
      onMountChange: () => void,
      onEdit: (service: Service) => void
  }>();

  let showMountModal = $state(false);
  let unmounting = $state(false);

  // Obtener el icono del servicio desde el esquema
  const remoteConfig = getRemoteConfig(service.type);
  const serviceIcon = remoteConfig?.icon;

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
    <div class="flex items-center gap-3">
        {#if serviceIcon}
            <img src={serviceIcon} alt={service.type} class="w-8 h-8 object-contain" />
        {:else}
            <div class="w-8 h-8 flex items-center justify-center bg-base-300 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
            </div>
        {/if}
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
            <button class="btn btn-sm btn-outline btn-primary" onclick={() => onEdit(service)}>Editar</button>
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
