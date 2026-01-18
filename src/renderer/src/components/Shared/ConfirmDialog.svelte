<script lang="ts">
  let { title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'info' } = $props<{ 
      title: string, 
      message: string, 
      onConfirm: () => void, 
      onCancel: () => void,
      confirmText?: string,
      cancelText?: string,
      type?: 'info' | 'warning' | 'error' | 'success'
  }>();

  let dialog: HTMLDialogElement;

  $effect(() => {
      dialog?.showModal();
  });

  function close(confirmed: boolean) {
      dialog.close();
      if (confirmed) onConfirm();
      else onCancel();
  }
</script>

<dialog bind:this={dialog} class="modal" onclose={() => onCancel()}>
  <div class="modal-box bg-white dark:bg-slate-800 dark:text-white">
      <h3 class="font-bold text-lg" class:text-error={type === 'error'} class:text-warning={type === 'warning'}>{title}</h3>
      <p class="py-4">{message}</p>
      <div class="modal-action">
          <button class="btn btn-outline text-brand-blue border-brand-blue hover:bg-brand-blue hover:text-white" onclick={() => close(false)}>{cancelText}</button>
          <button 
            class="btn border-none text-white" 
            class:bg-brand-green={type === 'info' || type === 'success'}
            class:hover:bg-brand-green-dark={type === 'info' || type === 'success'}
            class:btn-error={type === 'error'}
            class:btn-warning={type === 'warning'}
            onclick={() => close(true)}
          >
            {confirmText}
          </button>
      </div>
  </div>
  <form method="dialog" class="modal-backdrop">
      <button>close</button>
  </form>
</dialog>
