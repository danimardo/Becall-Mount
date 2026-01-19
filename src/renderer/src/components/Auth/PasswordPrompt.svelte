<script lang="ts">
  import { onMount } from 'svelte';

  let password = $state('');
  let confirmPassword = $state('');
  let error = $state('');
  let loading = $state(false);
  let inputRef = $state<HTMLInputElement | null>(null);

  let { onAuthenticated, isSetup } = $props<{ onAuthenticated: () => void, isSetup: boolean }>();

  // Requisitos: 8+ caracteres, Mayus, Minus, Numero, Especial (@$!%*?&)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  onMount(() => {
      // Forzar el foco al primer campo al montar el componente
      setTimeout(() => inputRef?.focus(), 100);
  });

  async function submit() {
    error = '';
    
    if (!password) {
        error = 'La contraseña es obligatoria';
        return;
    }

    if (isSetup) {
        if (!passwordRegex.test(password)) {
            error = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)';
            return;
        }
        if (password !== confirmPassword) {
            error = 'Las contraseñas no coinciden';
            return;
        }
    }

    loading = true;
    try {
        const success = await window.api.invoke('auth:verify-password', password);
        if (success) {
            onAuthenticated();
        } else {
            error = 'Contraseña incorrecta';
        }
    } catch (e) {
        error = 'Error al procesar la contraseña';
        console.error(e);
    } finally {
        loading = false;
    }
  }
</script>

<div class="card bg-white dark:bg-slate-800 shadow-xl max-w-sm mx-auto mt-20 border border-gray-100 dark:border-gray-700">
  <div class="card-body">
    <h2 class="card-title text-brand-blue dark:text-white mb-2">
        {isSetup ? 'Crear Contraseña Maestra' : 'Desbloquear Cloud Mount'}
    </h2>
    
    {#if isSetup}
        <p class="text-xs text-gray-500 mb-4">
            Esta contraseña encriptará tus credenciales de la nube. Por seguridad, debe ser robusta.
        </p>
    {/if}

    <form class="space-y-4" onsubmit={(e) => { e.preventDefault(); submit(); }}>
      <div class="form-control">
          <input 
            bind:this={inputRef}
            type="password" 
            placeholder={isSetup ? "Nueva Contraseña" : "Contraseña Maestra"} 
            class="input input-bordered w-full border-brand-blue focus:ring-brand-blue" 
            bind:value={password}
            autofocus
          />
      </div>

      {#if isSetup}
          <div class="form-control">
              <input 
                type="password" 
                placeholder="Confirmar Contraseña" 
                class="input input-bordered w-full border-brand-blue focus:ring-brand-blue" 
                bind:value={confirmPassword}
              />
          </div>
      {/if}

      {#if error}
        <div class="alert alert-error py-2 px-3 text-xs rounded shadow-sm">
            <span class="font-medium">{error}</span>
        </div>
      {/if}

      <button class="btn bg-brand-green hover:bg-brand-green-dark text-white border-none w-full shadow-md" type="submit" disabled={loading}>
        {#if loading}<span class="loading loading-spinner loading-sm"></span>{/if}
        {loading ? 'Procesando...' : (isSetup ? 'Establecer y Continuar' : 'Desbloquear')}
      </button>
    </form>
  </div>
</div>
