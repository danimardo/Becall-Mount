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
  <div class="modal-box bg-white dark:bg-slate-800 dark:text-white">
      <h3 class="font-bold text-lg text-brand-blue dark:text-white">{title}</h3>
      <p class="py-4 text-sm opacity-90">{message}</p>
      
      <div class="form-control w-full">
          <input 
            bind:this={inputRef}
            type={inputType} 
            placeholder={placeholder} 
            class="input input-bordered w-full border-brand-blue focus:ring-brand-blue dark:bg-slate-700" 
            bind:value={value}
            onkeydown={handleKeyDown}
          />
      </div>

      <div class="modal-action">
          <button class="btn btn-outline text-brand-blue border-brand-blue hover:bg-brand-blue hover:text-white" onclick={handleCancel}>{cancelText}</button>
          <button 
            class="btn bg-brand-green hover:bg-brand-green-dark border-none text-white shadow-md" 
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
