<script lang="ts">
  let { title, message, onClose, type = 'error' } = $props<{ 
      title: string, 
      message: string, 
      onClose: () => void,
      type?: 'info' | 'warning' | 'error' | 'success'
  }>();

  let dialog: HTMLDialogElement;

  $effect(() => {
      dialog?.showModal();
  });
</script>

<dialog bind:this={dialog} class="modal" onclose={onClose}>
  <div class="modal-box bg-primary text-text-primary border border-primary">
      <h3 class="font-bold text-lg" class:text-error-500={type === 'error'} class:text-warning-500={type === 'warning'} class:text-text-brand-primary={type === 'info' || type === 'success'}>{title}</h3>
      <p class="py-4 whitespace-pre-wrap">{message}</p>
      <div class="modal-action">
          <button class="btn bg-success-500 hover:bg-success-600 text-white border-none" onclick={onClose}>Aceptar</button>
      </div>
  </div>
  <form method="dialog" class="modal-backdrop">
      <button>close</button>
  </form>
</dialog>