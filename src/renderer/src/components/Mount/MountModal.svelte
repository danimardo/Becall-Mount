<script lang="ts">
  let driveLetter = $state('Z');
  let loading = $state(false);

  const drives = 'ZYXWVUTSRQPONMLKJIHGFEDCBA'.split('');

  let { serviceName, onMounted, onCancel } = $props<{ serviceName: string, onMounted: () => void, onCancel: () => void }>();

  async function submit() {
      loading = true;
      try {
          await window.api.invoke('mount:start', { serviceName, driveLetter });
          onMounted();
      } catch (e) {
          alert('Mount failed: ' + (e as Error).message);
          console.error(e);
      } finally {
          loading = false;
      }
  }
</script>

<div class="modal-box">
  <h3 class="font-bold text-lg">Mount {serviceName}</h3>
  <form class="py-4 space-y-4" onsubmit={(e) => { e.preventDefault(); submit(); }}>
    <div class="form-control">
        <label class="label">Drive Letter</label>
        <select class="select select-bordered" bind:value={driveLetter}>
            {#each drives as letter}
                <option value={letter}>{letter}:</option>
            {/each}
        </select>
    </div>

    <div class="modal-action">
        <button class="btn" type="button" onclick={onCancel}>Cancel</button>
        <button class="btn btn-primary" type="submit" disabled={loading}>
            {#if loading}<span class="loading loading-spinner"></span>{/if}
            Mount
        </button>
    </div>
  </form>
</div>
