<script lang="ts">
  import { onMount } from 'svelte';

  let password = $state('');
  let error = $state('');
  let loading = $state(false);
  let inputRef = $state<HTMLInputElement | null>(null);

  let { onAuthenticated, isSetup } = $props<{ onAuthenticated: () => void, isSetup: boolean }>();

  onMount(() => {
      // Forzar el foco al campo de contraseña al montar el componente
      inputRef?.focus();
  });

  async function submit() {
    if (!password) return;
    loading = true;
    error = '';
    
    try {
        const success = await window.api.invoke('auth:verify-password', password);
        if (success) {
            onAuthenticated();
        } else {
            error = 'Contraseña incorrecta';
        }
    } catch (e) {
        error = 'Error verificando contraseña';
        console.error(e);
    } finally {
        loading = false;
    }
  }
</script>

<div class="card bg-white dark:bg-slate-800 shadow-xl max-w-sm mx-auto mt-20 border border-gray-100 dark:border-gray-700">
  <div class="card-body">
    <h2 class="card-title text-brand-blue dark:text-white">{isSetup ? 'Establecer Contraseña Maestra' : 'Desbloquear Cloud Mount'}</h2>
    <form class="space-y-4" onsubmit={(e) => { e.preventDefault(); submit(); }}>
      <input 
        bind:this={inputRef}
        type="password" 
        placeholder="Contraseña Maestra" 
        class="input input-bordered w-full border-brand-blue focus:ring-brand-blue" 
        bind:value={password}
        autofocus
      />
      {#if error}
        <p class="text-error text-sm font-semibold">{error}</p>
      {/if}
      <button class="btn bg-brand-green hover:bg-brand-green-dark text-white border-none w-full" type="submit" disabled={loading}>
        {#if loading}<span class="loading loading-spinner loading-sm"></span>{/if}
        {loading ? 'Verificando...' : (isSetup ? 'Establecer' : 'Desbloquear')}
      </button>
    </form>
  </div>
</div>