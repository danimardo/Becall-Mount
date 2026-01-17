<script lang="ts">
  import { onMount } from 'svelte';
  import './index.css';
  import SetupWizard from './components/Onboarding/SetupWizard.svelte';
  import PasswordPrompt from './components/Auth/PasswordPrompt.svelte';

  let view = $state<'loading' | 'setup' | 'auth' | 'app'>('loading');
  let isSetup = $state(false);

  onMount(async () => {
    try {
        const authStatus = await window.api.invoke('auth:check-status');
        // { hasPassword: boolean, isAuthenticated: boolean }
        
        if (authStatus.isAuthenticated) {
            view = 'app';
            return;
        }

        if (!authStatus.hasPassword) {
            // First run
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
     <div class="flex justify-center items-center h-full mt-20">
         <span class="loading loading-spinner loading-lg"></span>
     </div>
  {:else if view === 'setup'}
     <SetupWizard onDone={onSetupDone} />
  {:else if view === 'auth'}
     <PasswordPrompt {isSetup} onAuthenticated={onAuthenticated} />
  {:else if view === 'app'}
     <div class="container mx-auto">
        <h1 class="text-3xl font-bold mb-6">Cloud Mount</h1>
        <p>Welcome! (Service Manager coming next)</p>
     </div>
  {/if}
</div>