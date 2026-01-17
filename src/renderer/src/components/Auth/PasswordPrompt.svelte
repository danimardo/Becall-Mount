<script lang="ts">
  let password = $state('');
  let error = $state('');
  let loading = $state(false);

  let { onAuthenticated, isSetup } = $props<{ onAuthenticated: () => void, isSetup: boolean }>();

  async function submit() {
    if (!password) return;
    loading = true;
    error = '';
    
    try {
        const success = await window.api.invoke('auth:verify-password', password);
        if (success) {
            onAuthenticated();
        } else {
            error = 'Invalid password';
        }
    } catch (e) {
        error = 'Error verifying password';
        console.error(e);
    } finally {
        loading = false;
    }
  }
</script>

<div class="card bg-base-100 shadow-xl max-w-sm mx-auto mt-20">
  <div class="card-body">
    <h2 class="card-title">{isSetup ? 'Set Master Password' : 'Unlock Cloud Mount'}</h2>
    <form class="space-y-4" onsubmit={(e) => { e.preventDefault(); submit(); }}>
      <input 
        type="password" 
        placeholder="Master Password" 
        class="input input-bordered w-full" 
        bind:value={password} 
        autofocus
      />
      {#if error}
        <p class="text-error text-sm">{error}</p>
      {/if}
      <button class="btn btn-primary w-full" type="submit" disabled={loading}>
        {loading ? 'Verifying...' : (isSetup ? 'Set Password' : 'Unlock')}
      </button>
    </form>
  </div>
</div>
