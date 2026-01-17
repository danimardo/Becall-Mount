<script lang="ts">
  import { onMount } from 'svelte';
  import ServiceCard from '../components/Services/ServiceCard.svelte';
  import AddServiceForm from '../components/Services/AddServiceForm.svelte';
  import type { Service, MountState } from '../../../../contracts/types';
  import Settings from './Settings.svelte';

  let services = $state<Service[]>([]);
  let showAddModal = $state(false);
  let showSettings = $state(false);

  async function loadServices() {
      try {
          const list = await window.api.invoke('services:list');
          const mounts: MountState[] = await window.api.invoke('mount:list-active');
          
          services = list.map((s: any) => {
              const mount = mounts.find(m => m.serviceName === s.name && m.status === 'mounted');
              return {
                  name: s.name,
                  type: s.type,
                  isMounted: !!mount,
                  mountPoint: mount ? mount.driveLetter + ':' : undefined
              };
          });
      } catch (e) {
          console.error(e);
      }
  }

  onMount(loadServices);

  function openTerminal() {
      window.api.invoke('services:open-terminal');
  }
</script>

<div class="p-4">
  {#if showSettings}
     <button class="btn btn-ghost mb-4" onclick={() => showSettings = false}>← Volver</button>
     <Settings />
  {:else}
      <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">Servicios</h2>
          <div class="gap-2 flex">
              <button class="btn btn-ghost" onclick={openTerminal}>Abrir Terminal</button>
              <button class="btn btn-ghost" onclick={() => showSettings = true}>Configuración</button>
              <button class="btn btn-primary" onclick={() => showAddModal = true}>Añadir Servicio</button>
          </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each services as service}
              <ServiceCard {service} onDelete={loadServices} onMountChange={loadServices} />
          {/each}
          {#if services.length === 0}
              <div class="col-span-full text-center py-10 opacity-50">
                  No hay servicios configurados.
              </div>
          {/if}
      </div>
  {/if}

  {#if showAddModal}
      <dialog class="modal modal-open">
          <AddServiceForm 
            onCreated={() => { showAddModal = false; loadServices(); }} 
            onCancel={() => showAddModal = false} 
          />
      </dialog>
  {/if}
</div>
