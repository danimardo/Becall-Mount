<script lang="ts">
  import type { Service } from '../../../../contracts/types';
  
  let { service, onDelete } = $props<{ service: Service, onDelete: (name: string) => void }>();

  async function handleDelete() {
      if(confirm(`Delete service ${service.name}?`)) {
          await window.api.invoke('services:delete', service.name);
          onDelete(service.name);
      }
  }
</script>

<div class="card bg-base-100 shadow-sm border border-base-200">
  <div class="card-body p-4 flex-row items-center justify-between">
    <div>
        <h3 class="font-bold text-lg">{service.name}</h3>
        <span class="badge badge-ghost badge-sm">{service.type}</span>
    </div>
    <div class="flex gap-2">
        <button class="btn btn-sm btn-ghost text-error" onclick={handleDelete}>Delete</button>
    </div>
  </div>
</div>
