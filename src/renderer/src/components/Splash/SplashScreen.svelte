<script lang="ts">
  import { onMount } from 'svelte';
  
  let appVersion = __APP_VERSION__; 
  let statusMessage = $state('Iniciando...');

  onMount(() => {
    // Escuchar mensajes de estado desde el proceso principal
    if (window.api) {
        window.api.on('splash:status', (msg: string) => {
            statusMessage = msg;
        });
    }
  });
</script>

<div class="splash-container fade-in select-none cursor-default">
  <div class="icon mb-4">
    <!-- Logo -->
    <div class="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg border border-gray-100">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
    </div>
  </div>
  <h1 class="app-name text-4xl font-bold text-brand-blue mb-2 tracking-tight">Cloud Mount</h1>
  <p class="text-brand-gray text-sm font-medium animate-pulse">{statusMessage}</p>
  
  <div class="credits flex flex-col items-end w-full px-8 absolute bottom-12 right-0">
    <p class="text-sm text-gray-400 font-light">Diseñado y programado por:</p>
    <p class="author text-xl font-bold text-brand-green">Daniel Díez Mardomingo</p>
  </div>
  
  <p class="version absolute bottom-4 right-8 text-xs text-gray-300 font-mono">v{appVersion}</p>
</div>

<style>
  :global(body) {
    margin: 0;
    overflow: hidden;
    background: transparent;
  }

  .splash-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: white;
    border-radius: 12px;
    border: 1px solid #f3f4f6;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }

  .fade-in {
    animation: fadeIn 0.5s ease-in;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>
