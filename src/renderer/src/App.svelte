<script lang="ts">
  import { onMount } from 'svelte';
  import './index.css';
  import SetupWizard from './components/Onboarding/SetupWizard.svelte';
  import PasswordPrompt from './components/Auth/PasswordPrompt.svelte';
  import ServiceManager from './pages/ServiceManager.svelte';

  let view = $state<'loading' | 'setup' | 'auth' | 'app' | 'error'>('loading');
  let isSetup = $state(false);
  let errorMessage = $state('');

  onMount(async () => {
    if (!window.api) {
        view = 'error';
        errorMessage = 'La API de comunicación (preload) no se ha cargado correctamente.';
        return;
    }

    try {
        const authStatus = await window.api.invoke('auth:check-status');
        
        if (authStatus.isAuthenticated) {
            view = 'app';
            return;
        }

        if (!authStatus.hasPassword) {
            const prereqs = await window.api.invoke('system:check-prereqs');
            if (!prereqs.rclone || !prereqs.winfsp) {
                view = 'setup';
            } else {
                isSetup = true;
                view = 'auth';
            }
        } else {
            view = 'auth';
        }
    } catch (e) {
        console.error("Failed to initialize app", e);
        view = 'error';
        errorMessage = 'Error al inicializar la aplicación: ' + (e as Error).message;
    }
  });

  function onSetupDone() {
      isSetup = true;
      view = 'auth';
  }

  function onAuthenticated() {
      view = 'app';
  }
</script>

<div class="min-h-screen bg-base-200 p-4">
  {#if view === 'loading'}
     <div class="flex flex-col justify-center items-center h-full mt-20 gap-4">
         <span class="loading loading-spinner loading-lg"></span>
         <p>Cargando Cloud Mount...</p>
     </div>
  {:else if view === 'error'}
     <div class="alert alert-error max-w-lg mx-auto mt-20">
         <span>{errorMessage}</span>
     </div>
  {:else if view === 'setup'}
     <SetupWizard onDone={onSetupDone} />
  {:else if view === 'auth'}
     <PasswordPrompt {isSetup} onAuthenticated={onAuthenticated} />
  {:else if view === 'app'}
     <div class="container mx-auto">
        <ServiceManager />
     </div>
  {/if}
</div>
