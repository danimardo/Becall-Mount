<script lang="ts">
  import { onMount } from 'svelte';
  import { getAvailableRemoteTypes, getVisibleFields, buildConfigWithDefaults } from '../../lib/remote-schema-loader';
  import { showAlert } from '../../stores/modal';

  let { onCreated, onCancel, editService = null } = $props<{ 
      onCreated: () => void, 
      onCancel: () => void,
      editService?: { name: string, type: string } | null
  }>();

  let name = $state(editService?.name || '');
  let type = $state(editService?.type || 'b2');
  let params = $state<Record<string, string>>({});
  let loading = $state(false);
  let validationErrors = $state<string[]>([]);
  let isEdit = !!editService;
  let activeTab = $state<'manual' | 'import'>('manual');
  let hasImportedContent = $state(false);
  let nameInputRef = $state<HTMLInputElement | null>(null);

  onMount(async () => {
      // Poner foco en el nombre al abrir
      nameInputRef?.focus();

      if (isEdit && editService) {
          try {
              const remoteData = await window.api.invoke('services:get', editService.name);
              if (remoteData) {
                  const { type: remoteType, ...rest } = remoteData;
                  type = remoteType;
                  params = { ...rest };
                  if (params['service_account_credentials']) {
                      activeTab = 'import';
                      hasImportedContent = true;
                  }
              }
          } catch (e) {
              console.error('Error al cargar servicio para editar', e);
          }
      }
  });

  const availableTypes = getAvailableRemoteTypes();

  function validateRequiredFields(): boolean {
      const visibleFields = getVisibleFields(type);
      const errors: string[] = [];

      for (const [key, fieldConfig] of Object.entries(visibleFields)) {
          if (fieldConfig.required && !params[key]) {
              const label = fieldConfig.label || key;
              errors.push(`El campo "${label}" es obligatorio`);
          }
      }

      validationErrors = errors;
      return errors.length === 0;
  }

  async function selectKeyFile() {
      try {
          const content = await window.api.invoke('system:import-key-file');
          if (content) {
              params = { 
                  ...params, 
                  'service_account_credentials': content,
                  'bucket_policy_only': 'true' 
              };
              type = 'google cloud storage';
              hasImportedContent = true;
              validationErrors = [];
              
              // Aviso de seguridad
              await showAlert(
                '⚠️ Seguridad Importante', 
                'Las credenciales se han integrado de forma segura en la configuración encriptada de Cloud Mount. POR FAVOR, BORRA EL ARCHIVO ORIGINAL de tu ordenador para evitar que pueda ser comprometido.',
                'warning'
              );
          }
      } catch (e: any) {
          await showAlert('Error', e.message);
      }
  }

  async function submit() {
      if (!name) {
          validationErrors = ['El nombre del servicio es obligatorio'];
          return;
      }

      if (!validateRequiredFields()) {
          return;
      }

      loading = true;
      try {
          const finalConfig = buildConfigWithDefaults(type, params);

          if (isEdit) {
              await window.api.invoke('services:update', { name, params: finalConfig });
          } else {
              await window.api.invoke('services:create', { name, type, params: finalConfig });
          }
          onCreated();
      } catch (e) {
          await showAlert('Error', `Fallo al ${isEdit ? 'actualizar' : 'crear'} servicio`);
          console.error(e);
      } finally {
          loading = false;
      }
  }
</script>

<div class="modal-box bg-white dark:bg-slate-800 dark:text-white max-w-2xl border border-gray-200 dark:border-gray-700 shadow-2xl">
  <h3 class="font-bold text-2xl mb-6 text-brand-blue">{isEdit ? 'Editar' : 'Añadir'} Servicio</h3>

  {#if !isEdit}
    <div role="tablist" class="grid grid-cols-2 gap-1 p-1 bg-gray-100 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-gray-600 mb-6">
        <button 
          role="tab" 
          class="py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none cursor-pointer"
          class:bg-white={activeTab === 'manual'} 
          class:text-brand-blue={activeTab === 'manual'} 
          class:shadow-sm={activeTab === 'manual'}
          class:text-gray-500={activeTab !== 'manual'}
          class:dark:bg-slate-600={activeTab === 'manual'} 
          class:dark:text-white={activeTab === 'manual'}
          class:dark:text-gray-400={activeTab !== 'manual'}
          onclick={() => activeTab = 'manual'}
        >
          Configuración Manual
        </button>
        <button 
          role="tab" 
          class="py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none cursor-pointer"
          class:bg-white={activeTab === 'import'} 
          class:text-brand-blue={activeTab === 'import'} 
          class:shadow-sm={activeTab === 'import'}
          class:text-gray-500={activeTab !== 'import'}
          class:dark:bg-slate-600={activeTab === 'import'} 
          class:dark:text-white={activeTab === 'import'}
          class:dark:text-gray-400={activeTab !== 'import'}
          onclick={() => activeTab = 'import'}
        >
          Importar JSON (Google)
        </button>
    </div>
  {/if}

  {#if validationErrors.length > 0}
    <div class="alert alert-error mb-4 shadow-sm">
      <div class="flex flex-col items-start">
        {#each validationErrors as error}
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <form class="space-y-4" onsubmit={(e) => { e.preventDefault(); submit(); }}>
    <div class="grid grid-cols-1 {activeTab === 'manual' ? 'md:grid-cols-2' : ''} gap-4">
        <div class="form-control">
            <label class="label" for="service-name">
              <span class="label-text dark:text-gray-300 font-semibold">Nombre del Servicio <span class="text-error">*</span></span>
            </label>
            <input 
              bind:this={nameInputRef}
              id="service-name" 
              placeholder="Ej: Mi Google Cloud" 
              class="input input-bordered dark:bg-slate-700 dark:border-gray-600 focus:border-brand-blue" 
              bind:value={name} 
              disabled={isEdit}
              autofocus 
            />
        </div>
        
        {#if activeTab === 'manual'}
            <div class="form-control">
                <label class="label" for="service-type">
                    <span class="label-text dark:text-gray-300 font-semibold">Tipo de Proveedor</span>
                </label>
                <select id="service-type" class="select select-bordered dark:bg-slate-700 dark:border-gray-600" bind:value={type} disabled={isEdit}>
                    {#each availableTypes as remoteType}
                        <option value={remoteType.type}>{remoteType.name}</option>
                    {/each}
                </select>
            </div>
        {/if}
    </div>

    {#if activeTab === 'import'}
        <div class="bg-blue-50 dark:bg-slate-700/50 p-6 rounded-lg border border-blue-100 dark:border-slate-600 space-y-5">
            <div class="flex items-start gap-3 text-blue-800 dark:text-blue-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="space-y-1">
                    <p class="font-bold">Importación Segura de Google Cloud</p>
                    <p class="text-sm opacity-90">Al seleccionar el JSON, sus credenciales se guardarán encriptadas dentro de la aplicación. No se almacenarán archivos adicionales en disco.</p>
                </div>
            </div>
            
            <div class="form-control">
                <label class="label font-semibold">Credenciales JSON de Google</label>
                <button type="button" class="btn btn-secondary w-full" onclick={selectKeyFile}>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {hasImportedContent ? 'Credenciales cargadas (Cambiar)' : 'Seleccionar Archivo JSON'}
                </button>
                {#if hasImportedContent}
                    <p class="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1 font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                        Credenciales importadas correctamente
                    </p>
                {/if}
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                    <label class="label"><span class="label-text font-medium">Bucket <span class="text-error">*</span></span></label>
                    <input type="text" bind:value={params['bucket']} placeholder="mi-bucket-gcs" class="input input-bordered input-sm dark:bg-slate-800" />
                </div>
                <div class="form-control">
                    <label class="label"><span class="label-text font-medium">Ruta interna (Opcional)</span></label>
                    <input type="text" bind:value={params['path']} placeholder="carpeta/subcarpeta" class="input input-bordered input-sm dark:bg-slate-800" />
                </div>
            </div>
        </div>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            {#each Object.entries(getVisibleFields(type)) as [key, fieldConfig]}
                <div class="form-control">
                    <label class="label" for={key}>
                    <span class="label-text dark:text-gray-300 font-medium">
                        {fieldConfig.label || key}
                        {#if fieldConfig.required}
                        <span class="text-error">*</span>
                        {/if}
                    </span>
                    </label>
                    {#if fieldConfig.type === 'boolean'}
                        <select
                            id={key}
                            class="select select-bordered dark:bg-slate-700 dark:border-gray-600"
                            bind:value={params[key]}
                        >
                            <option value="true">Sí</option>
                            <option value="false">No</option>
                        </select>
                    {:else}
                        <input
                            id={key}
                            type={key.toLowerCase().includes('key') || key.toLowerCase().includes('secret') ? 'password' : 'text'}
                            class="input input-bordered dark:bg-slate-700 dark:border-gray-600"
                            placeholder={fieldConfig.placeholder || ''}
                            bind:value={params[key]}
                        />
                    {/if}
                </div>
            {/each}
        </div>
    {/if}

    <div class="modal-action mt-8">
        <button class="btn btn-outline text-brand-blue border-brand-blue hover:bg-brand-blue hover:text-white" type="button" onclick={onCancel}>Cancelar</button>
        <button class="btn bg-brand-green hover:bg-brand-green-dark text-white border-none min-w-[140px]" type="submit" disabled={loading}>
            {#if loading}
                <span class="loading loading-spinner loading-xs"></span>
            {:else}
                {isEdit ? 'Guardar Cambios' : 'Crear Servicio'}
            {/if}
        </button>
    </div>
  </form>
</div>
