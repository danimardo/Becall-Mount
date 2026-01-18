<script lang="ts">
  import { modalStore } from '../../stores/modal';
  import AlertDialog from './AlertDialog.svelte';
  import ConfirmDialog from './ConfirmDialog.svelte';
</script>

{#if $modalStore.isOpen}
    {#if $modalStore.type === 'alert'}
        <AlertDialog 
            title={$modalStore.options.title} 
            message={$modalStore.options.message} 
            type={$modalStore.options.variant}
            onClose={() => $modalStore.resolve(true)} 
        />
    {:else if $modalStore.type === 'confirm'}
        <ConfirmDialog 
            title={$modalStore.options.title} 
            message={$modalStore.options.message} 
            type={$modalStore.options.variant}
            confirmText={$modalStore.options.confirmText}
            onConfirm={() => $modalStore.resolve(true)} 
            onCancel={() => $modalStore.resolve(false)} 
        />
    {/if}
{/if}
