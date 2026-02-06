<script lang="ts">
  import { onMount } from 'svelte';

  let status = $state({ rclone: false, winfsp: false, isDomain: false, hasADModule: false });
  let loading = $state(true);
  let installing = $state({ rclone: false, winfsp: false, ad: false });
  let rsatPendingRestart = $state(false);
  let rcloneProgress = $state(0);
  let pollingInterval: NodeJS.Timeout;

  let { onDone } = $props<{ onDone: () => void }>();

  async function check() {
    try {
        const newStatus = await window.api.invoke('system:check-prereqs');
        status = newStatus; // Actualizar estado local
        
        // Requisitos obligatorios para entrar en la app: Rclone y WinFsp
        if (newStatus.rclone && newStatus.winfsp) {
            if (pollingInterval) clearInterval(pollingInterval);
            onDone();
        }
    } catch (e) { console.error(e); }
    loading = false;
  }

  async function restartApp() {
    await window.api.invoke('system:restart');
  }

  onMount(() => {
    check();
    const cleanup = window.api.on('system:install-rclone-progress', (percent) => {
        rcloneProgress = percent;
    });
    return () => {
        cleanup();
        if (pollingInterval) clearInterval(pollingInterval);
    };
  });

  async function installRclone() {
    installing.rclone = true;
    try {
        await window.api.invoke('system:install-rclone');
        // Rclone avisa cuando termina, así que solo hacemos check al final
        check();
    } catch (e) {
        console.error(e);
    }
    installing.rclone = false;
  }

  async function installWinFsp() {
    installing.winfsp = true;
    try {
        await window.api.invoke('system:install-winfsp');
        // Iniciar polling para detectar cuando el usuario termine el instalador externo
        if (!pollingInterval) {
            pollingInterval = setInterval(check, 2000);
        }
    } catch (e) {
        console.error(e);
        installing.winfsp = false;
    }
  }
</script>

<div class="card bg-base-100 shadow-xl max-w-lg mx-auto mt-10">
  <div class="card-body">
    <h2 class="card-title">Configuración de Becall-Mount</h2>
    <p>Necesitamos instalar algunas dependencias para comenzar.</p>

    {#if loading}
      <span class="loading loading-spinner loading-lg"></span>
    {:else}
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <span>Drivers Cloud</span>
          {#if status.rclone}
            <span class="badge bg-brand-green text-white border-none font-bold">Instalado</span>
          {:else}
            <div class="flex items-center gap-2">
                {#if installing.rclone}
                     <progress class="progress progress-info w-20 shadow-sm" value={rcloneProgress} max="100"></progress>
                {:else}
                    <button class="btn btn-sm bg-brand-green hover:bg-brand-green-dark text-white border-none shadow-sm px-4" onclick={installRclone}>Instalar</button>
                {/if}
            </div>
          {/if}
        </div>

        <div class="flex justify-between items-center">
          <span class="font-medium text-gray-700 dark:text-gray-300">WinFsp</span>
          {#if status.winfsp}
            <span class="badge bg-brand-green text-white border-none font-bold">Instalado</span>
          {:else}
            <div class="flex items-center gap-2">
                 {#if installing.winfsp}
                    <span class="loading loading-spinner loading-sm text-brand-blue"></span>
                 {:else}
                    <button class="btn btn-sm bg-brand-green hover:bg-brand-green-dark text-white border-none shadow-sm px-4" onclick={installWinFsp}>Instalar</button>
                 {/if}
                        </div>
                      {/if}
                    </div>
                  </div>
                {/if}
              </div>
            </div>
            