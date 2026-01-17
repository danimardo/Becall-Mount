<script lang="ts">
  let name = $state('');
  let type = $state('b2');
  let params = $state<Record<string, string>>({});
  let loading = $state(false);

  let { onCreated, onCancel } = $props<{ onCreated: () => void, onCancel: () => void }>();
  
  function updateParam(key: string, value: string) {
      params[key] = value;
  }

  async function submit() {
      if (!name) return;
      loading = true;
      try {
          // Defaults
          if (type === 'b2') params['hard_delete'] = 'true';
          if (type === 's3') params['provider'] = 'AWS';

          await window.api.invoke('services:create', { name, type, params });
          onCreated();
      } catch (e) {
          alert('Failed to create service');
          console.error(e);
      } finally {
          loading = false;
      }
  }
</script>

<div class="modal-box">
  <h3 class="font-bold text-lg">Add Service</h3>
  <form class="py-4 space-y-4" onsubmit={(e) => { e.preventDefault(); submit(); }}>
    <div class="form-control">
        <label class="label">Name</label>
        <input class="input input-bordered" bind:value={name} required />
    </div>
    <div class="form-control">
        <label class="label">Type</label>
        <select class="select select-bordered" bind:value={type}>
            <option value="b2">Backblaze B2</option>
            <option value="s3">Amazon S3</option>
        </select>
    </div>

    {#if type === 'b2'}
        <div class="form-control">
            <label class="label">Account ID</label>
            <input class="input input-bordered" oninput={(e) => updateParam('account', e.currentTarget.value)} required />
        </div>
        <div class="form-control">
            <label class="label">Application Key</label>
            <input type="password" class="input input-bordered" oninput={(e) => updateParam('key', e.currentTarget.value)} required />
        </div>
    {:else if type === 's3'}
        <div class="form-control">
            <label class="label">Access Key ID</label>
            <input class="input input-bordered" oninput={(e) => updateParam('access_key_id', e.currentTarget.value)} required />
        </div>
        <div class="form-control">
            <label class="label">Secret Access Key</label>
            <input type="password" class="input input-bordered" oninput={(e) => updateParam('secret_access_key', e.currentTarget.value)} required />
        </div>
        <div class="form-control">
            <label class="label">Region</label>
            <input class="input input-bordered" placeholder="us-east-1" oninput={(e) => updateParam('region', e.currentTarget.value)} required />
        </div>
    {/if}

    <div class="modal-action">
        <button class="btn" type="button" onclick={onCancel}>Cancel</button>
        <button class="btn btn-primary" type="submit" disabled={loading}>Create</button>
    </div>
  </form>
</div>
