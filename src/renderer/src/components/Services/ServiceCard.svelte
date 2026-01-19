<script lang="ts">
  import type { Service } from '../../../../contracts/types';
  import MountModal from '../Mount/MountModal.svelte';
  import { getRemoteConfig } from '../../lib/remote-schema-loader';
  import { showConfirm, showAlert } from '../../stores/modal';

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
      if(await showConfirm('Eliminar Servicio', `¿Estás seguro de que quieres eliminar el servicio "${service.name}"?`, 'error', 'Eliminar')) {
          await window.api.invoke('services:delete', service.name);
          onDelete(service.name);
      }
  }

  async function handleUnmount() {
      if (!service.mountPoint) return;
      unmounting = true;
      try {
          await window.api.invoke('mount:stop', service.mountPoint);
          onMountChange();
      } catch (e: any) {
          await showAlert('Error', 'Fallo al desmontar: ' + e.message);
          console.error(e);
      } finally {
          unmounting = false;
      }
  }
</script>

<div class="card bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
  <div class="card-body p-4 flex-row items-center justify-between">
    <div class="flex items-center gap-3">
        {#if serviceIcon}
            <img src={serviceIcon} alt={service.type} class="w-8 h-8 object-contain" />
        {:else}
            <div class="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded text-brand-blue">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
            </div>
        {/if}
        <div class="flex flex-col">
            <h3 class="font-bold text-lg text-gray-900 dark:text-white leading-tight mb-1">{service.name}</h3>
            <div class="flex items-center gap-2">
                <span class="badge bg-brand-pistachio text-white border-none badge-sm uppercase text-[10px] font-bold tracking-wider">{service.type}</span>
                {#if service.isMounted}
                    <span class="badge bg-brand-green text-white border-none badge-sm gap-1 font-semibold">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                        </svg>
                        {service.mountPoint}
                    </span>
                {/if}
            </div>
        </div>
    </div>
    <div class="flex gap-2">
        {#if service.isMounted}
            <button class="btn btn-sm btn-warning" onclick={handleUnmount} disabled={unmounting}>
                {unmounting ? '...' : 'Desmontar'}
            </button>
        {:else}
            <button class="btn btn-sm bg-brand-green hover:bg-brand-green-dark text-white border-none" onclick={() => showMountModal = true}>Montar</button>
            <button class="btn btn-sm btn-outline text-brand-blue border-brand-blue hover:bg-brand-blue hover:text-white" onclick={() => onEdit(service)}>Editar</button>
        {/if}
        <button class="btn btn-sm btn-ghost text-error" onclick={handleDelete}>Eliminar</button>
    </div>
  </div>
</div>

{#if showMountModal}
    <dialog class="modal modal-open">
        <MountModal 
            serviceName={service.name} 
            serviceType={service.type}
            onMounted={() => { showMountModal = false; onMountChange(); }}
            onCancel={() => showMountModal = false}
        />
    </dialog>
{/if}