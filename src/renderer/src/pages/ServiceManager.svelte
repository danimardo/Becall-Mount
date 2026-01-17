<script lang="ts">
  import { onMount } from 'svelte';
  import ServiceCard from '../components/Services/ServiceCard.svelte';
  import AddServiceForm from '../components/Services/AddServiceForm.svelte';
  import type { Service } from '../../../../contracts/types';

  let services = $state<Service[]>([]);
  let showAddModal = $state(false);

  async function loadServices() {
      try {
          const list = await window.api.invoke('services:list');
          services = list.map((s: any) => ({
              name: s.name,
              type: s.type,
              isMounted: false
          }));
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
          <ServiceCard {service} onDelete={loadServices} />
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
