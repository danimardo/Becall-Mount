<script lang="ts">
  import { onMount } from 'svelte';

  let status = $state({ rclone: false, winfsp: false });
  let loading = $state(true);
  let installing = $state({ rclone: false, winfsp: false });
  let rcloneProgress = $state(0);

  let { onDone } = $props<{ onDone: () => void }>();

  async function check() {
    loading = true;
    try {
        status = await window.api.invoke('system:check-prereqs');
    } catch (e) {
        console.error(e);
    }
    loading = false;
    
    if (status.rclone && status.winfsp) {
      onDone();
    }
  }

  onMount(() => {
    check();
    
    const cleanup = window.api.on('system:install-rclone-progress', (percent) => {
        rcloneProgress = percent;
    });
    return cleanup;
  });

  async function installRclone() {
    installing.rclone = true;
    try {
        await window.api.invoke('system:install-rclone');
    } catch (e) {
        console.error(e);
    }
    installing.rclone = false;
    check();
  }

  async function installWinFsp() {
    installing.winfsp = true;
    try {
        await window.api.invoke('system:install-winfsp');
    } catch (e) {
        console.error(e);
    }
    installing.winfsp = false;
    check();
  }
</script>

<div class="card bg-base-100 shadow-xl max-w-lg mx-auto mt-10">
  <div class="card-body">
    <h2 class="card-title">Setup Cloud Mount</h2>
    <p>We need to install some dependencies to get started.</p>

    {#if loading}
      <span class="loading loading-spinner loading-lg"></span>
    {:else}
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <span>Rclone (v1.65.0)</span>
          {#if status.rclone}
            <span class="badge badge-success">Installed</span>
          {:else}
            <div class="flex items-center gap-2">
                {#if installing.rclone}
                     <progress class="progress progress-primary w-20" value={rcloneProgress} max="100"></progress>
                {:else}
                    <button class="btn btn-sm btn-primary" onclick={installRclone}>Install</button>
                {/if}
            </div>
          {/if}
        </div>

        <div class="flex justify-between items-center">
          <span>WinFsp</span>
          {#if status.winfsp}
            <span class="badge badge-success">Installed</span>
          {:else}
            <div class="flex items-center gap-2">
                 {#if installing.winfsp}
                    <span class="loading loading-spinner loading-sm"></span>
                 {:else}
                    <button class="btn btn-sm btn-primary" onclick={installWinFsp}>Install</button>
                 {/if}
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>
