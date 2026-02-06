<script lang="ts">
  import { onMount } from 'svelte';

  let { title, message, onConfirm, onCancel, confirmText = 'Aceptar', cancelText = 'Cancelar', inputType = 'text', placeholder = '' } = $props<{ 
      title: string, 
      message: string, 
      onConfirm: (value: string) => void, 
      onCancel: () => void,
      confirmText?: string,
      cancelText?: string,
      inputType?: string,
      placeholder?: string
  }>();

  let dialog = $state<HTMLDialogElement | null>(null);
  let value = $state('');
  let inputRef = $state<HTMLInputElement | null>(null);

  $effect(() => {
      dialog?.showModal();
      setTimeout(() => inputRef?.focus(), 50);
  });

  function handleConfirm() {
      dialog?.close();
      onConfirm(value);
  }

  function handleCancel() {
      dialog?.close();
      onCancel();
  }

  function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Enter') {
          handleConfirm();
      } else if (e.key === 'Escape') {
          handleCancel();
      }
  }
</script>

<dialog bind:this={dialog} class="modal" onclose={handleCancel}>
  <div class="modal-box bg-primary text-text-primary border border-primary">
      <h3 class="font-bold text-lg text-text-brand-primary">{title}</h3>
      <p class="py-4 text-sm opacity-90 text-text-secondary">{message}</p>
      
      <div class="form-control w-full">
          <input 
            bind:this={inputRef}
            type={inputType} 
            placeholder={placeholder} 
            class="input input-bordered w-full bg-primary border-border-brand focus:ring-brand-500 text-text-primary" 
            bind:value={value}
            onkeydown={handleKeyDown}
          />
      </div>

      <div class="modal-action">
          <button class="btn btn-outline border-brand-500 text-brand-600 hover:bg-brand-500 hover:text-white" onclick={handleCancel}>{cancelText}</button>
          <button 
            class="btn bg-success-500 hover:bg-success-600 border-none text-white shadow-md" 
            onclick={handleConfirm}
            disabled={!value}
          >
            {confirmText}
          </button>
      </div>
  </div>
  <form method="dialog" class="modal-backdrop">
      <button>close</button>
  </form>
</dialog>