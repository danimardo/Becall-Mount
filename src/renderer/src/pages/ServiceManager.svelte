<script lang="ts">
  import { onMount } from 'svelte';
  import ServiceCard from '../components/Services/ServiceCard.svelte';
  import AddServiceForm from '../components/Services/AddServiceForm.svelte';
  import type { Service, MountState } from '../../../../contracts/types';
  import Settings from './Settings.svelte';

  let services = $state<Service[]>([]);
  let showAddModal = $state(false);
  let showSettings = $state(false);
  let serviceToEdit = $state<Service | null>(null);

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
      <div class="flex justify-end items-center mb-6">
          <div class="gap-2 flex">
              <button class="btn btn-ghost" onclick={openTerminal}>Abrir Terminal</button>
              <button class="btn btn-ghost" onclick={() => showSettings = true}>Configuración</button>
              <button class="btn btn-primary" onclick={() => showAddModal = true}>Añadir Servicio</button>
          </div>
      </div>

      <div class="flex flex-col gap-4">
          {#each services as service}
              <ServiceCard 
                {service} 
                onDelete={loadServices} 
                onMountChange={loadServices} 
                onEdit={(s) => { serviceToEdit = s; showAddModal = true; }}
              />
          {/each}
          {#if services.length === 0}
              <div class="text-center py-10 opacity-50">
                  No hay servicios configurados.
              </div>
          {/if}
      </div>
  {/if}

  {#if showAddModal}
      <dialog class="modal modal-open">
          <AddServiceForm 
            editService={serviceToEdit}
            onCreated={() => { showAddModal = false; serviceToEdit = null; loadServices(); }} 
            onCancel={() => { showAddModal = false; serviceToEdit = null; }} 
          />
      </dialog>
  {/if}
</div>
