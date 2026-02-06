<script lang="ts">
  import { onMount } from 'svelte';
  import './index.css';
  import SetupWizard from './components/Onboarding/SetupWizard.svelte';
  import PasswordPrompt from './components/Auth/PasswordPrompt.svelte';
  import ServiceManager from './pages/ServiceManager.svelte';
  import GlobalModal from './components/Shared/GlobalModal.svelte';

  let view = $state<'loading' | 'setup' | 'auth' | 'app' | 'error'>('loading');
  let isSetup = $state(false);
  let errorMessage = $state('');

  onMount(async () => {
    // Inicializar tema
    try {
        const settings = await window.api.invoke('settings:get');
        const theme = settings.theme || 'system';
        const html = document.documentElement;
        let isDark = theme === 'dark';
        if (theme === 'system') {
            isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        html.setAttribute('data-theme', isDark ? 'dark' : 'light');
        if (isDark) html.classList.add('dark');
        else html.classList.remove('dark');
    } catch (e) {
        console.error("Failed to load theme settings", e);
    }

    if (!window.api) {
        view = 'error';
        errorMessage = 'La API de comunicación (preload) no se ha cargado correctamente.';
        return;
    }

    try {
        const prereqs = await window.api.invoke('system:check-prereqs');
        if (!prereqs.rclone || !prereqs.winfsp) {
            view = 'setup';
            return;
        }

        const authStatus = await window.api.invoke('auth:check-status');
        
        if (authStatus.isAuthenticated) {
            await window.api.invoke('mount:auto-mount-all');
            view = 'app';
            return;
        }

        isSetup = !authStatus.hasPassword;
        view = 'auth';
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

  async function onAuthenticated() {
      await window.api.invoke('mount:auto-mount-all');
      view = 'app';
  }
</script>

<!-- Background Image Layer -->
<div 
    class="fixed inset-0 z-0 bg-cover bg-center opacity-80 pointer-events-none transition-all duration-1000 ease-in-out scale-105"
    style="background-image: var(--bg-image); filter: blur(5px);"
></div>

<div class="relative z-10 min-h-screen bg-transparent text-primary transition-colors duration-300" class:p-4={view !== 'app'}>
  {#if view === 'loading'}
     <div class="flex flex-col justify-center items-center h-full mt-20 gap-4">
         <span class="loading loading-spinner loading-lg text-brand-500"></span>
         <p>Cargando Becall-Mount...</p>
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
     <ServiceManager />
  {/if}
  <GlobalModal />
</div>

<style>
    :global(:root) {
        --bg-image: url('/light-background.jpg');
    }
    :global(html.dark) {
        --bg-image: url('/dark-background.jpg');
    }
</style>
