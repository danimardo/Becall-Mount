<script lang="ts">
  import { modalStore } from '../../stores/modal';
  import AlertDialog from './AlertDialog.svelte';
  import ConfirmDialog from './ConfirmDialog.svelte';
  import PromptDialog from './PromptDialog.svelte';
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
    {:else if $modalStore.type === 'prompt'}
        <PromptDialog 
            title={$modalStore.options.title} 
            message={$modalStore.options.message} 
            inputType={$modalStore.options.inputType}
            placeholder={$modalStore.options.placeholder}
            onConfirm={(val) => $modalStore.resolve(val)} 
            onCancel={() => $modalStore.resolve(null)} 
        />
    {/if}
{/if}
