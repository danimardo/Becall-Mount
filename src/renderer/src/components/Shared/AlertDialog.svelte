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
  <div class="modal-box bg-white dark:bg-slate-800 dark:text-white">
      <h3 class="font-bold text-lg" class:text-error={type === 'error'} class:text-warning={type === 'warning'} class:text-brand-blue={type === 'info'}>{title}</h3>
      <p class="py-4 whitespace-pre-wrap">{message}</p>
      <div class="modal-action">
          <button class="btn bg-brand-green hover:bg-brand-green-dark text-white border-none" onclick={onClose}>Aceptar</button>
      </div>
  </div>
  <form method="dialog" class="modal-backdrop">
      <button>close</button>
  </form>
</dialog>
