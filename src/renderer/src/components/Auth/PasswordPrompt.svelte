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

<div class="card bg-primary text-text-primary shadow-xl max-w-sm mx-auto mt-20 border border-primary">
  <div class="card-body">
    <h2 class="card-title text-text-brand-primary mb-2">
        {isSetup ? 'Crear Contraseña Maestra' : 'Desbloquear Becall-Mount'}
    </h2>
    
    {#if isSetup}
        <p class="text-xs text-text-secondary mb-4">
            Esta contraseña encriptará tus credenciales de la nube. Por seguridad, debe ser robusta.
        </p>
    {/if}

    <form class="space-y-4" onsubmit={(e) => { e.preventDefault(); submit(); }}>
      <div class="form-control">
          <input 
            bind:this={inputRef}
            type="password" 
            placeholder={isSetup ? "Nueva Contraseña" : "Contraseña Maestra"} 
            class="input input-bordered w-full bg-primary border-border-brand focus:ring-brand-500 text-text-primary" 
            bind:value={password}
          />
      </div>

      {#if isSetup}
          <div class="form-control">
              <input 
                type="password" 
                placeholder="Confirmar Contraseña" 
                class="input input-bordered w-full bg-primary border-border-brand focus:ring-brand-500 text-text-primary" 
                bind:value={confirmPassword}
              />
          </div>
      {/if}

      {#if error}
        <div class="alert bg-error-500/10 border-error-500/30 text-error-600 py-2 px-3 text-xs rounded shadow-sm">
            <span class="font-medium">{error}</span>
        </div>
      {/if}

      <button class="btn bg-brand-600 hover:bg-brand-700 text-white border-none w-full shadow-md" type="submit" disabled={loading}>
        {#if loading}<span class="loading loading-spinner loading-sm"></span>{/if}
        {loading ? 'Procesando...' : (isSetup ? 'Establecer y Continuar' : 'Desbloquear')}
      </button>
    </form>
  </div>
</div>