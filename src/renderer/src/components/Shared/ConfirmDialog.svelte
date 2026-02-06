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
  <div class="modal-box bg-primary text-text-primary border border-primary">
      <h3 class="font-bold text-lg" class:text-error-500={type === 'error'} class:text-warning-500={type === 'warning'} class:text-text-brand-primary={type === 'info' || type === 'success'}>{title}</h3>
      <p class="py-4">{message}</p>
      <div class="modal-action">
          <button class="btn btn-outline border-brand-500 text-brand-600 hover:bg-brand-500 hover:text-white" onclick={() => close(false)}>{cancelText}</button>
          <button 
            class="btn border-none text-white" 
            class:bg-success-500={type === 'info' || type === 'success'}
            class:hover:bg-success-600={type === 'info' || type === 'success'}
            class:bg-error-500={type === 'error'}
            class:hover:bg-error-600={type === 'error'}
            class:bg-warning-500={type === 'warning'}
            class:hover:bg-warning-600={type === 'warning'}
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