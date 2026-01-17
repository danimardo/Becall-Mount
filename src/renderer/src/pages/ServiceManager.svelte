<script lang="ts">
  import { onMount } from 'svelte';
  import ServiceCard from '../components/Services/ServiceCard.svelte';
  import AddServiceForm from '../components/Services/AddServiceForm.svelte';
  import type { Service, MountState } from '../../../../contracts/types';

  let services = $state<Service[]>([]);
  let showAddModal = $state(false);

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
  <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Services</h2>
      <div class="gap-2 flex">
          <button class="btn btn-ghost" onclick={openTerminal}>Open Terminal</button>
          <button class="btn btn-primary" onclick={() => showAddModal = true}>Add Service</button>
      </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each services as service}
          <ServiceCard {service} onDelete={loadServices} onMountChange={loadServices} />
      {/each}
  </div>

  {#if showAddModal}
      <dialog class="modal modal-open">
          <AddServiceForm 
            onCreated={() => { showAddModal = false; loadServices(); }} 
            onCancel={() => showAddModal = false} 
          />
      </dialog>
  {/if}
</div>