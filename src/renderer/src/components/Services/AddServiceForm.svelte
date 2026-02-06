<script lang="ts">
  import { onMount } from 'svelte';
  import { getAvailableRemoteTypes, getVisibleFields, buildConfigWithDefaults, loadRemotesSchema } from '../../lib/remote-schema-loader';
  import { showAlert } from '../../stores/modal';

  let { onCreated, onCancel, editService = null } = $props<{ 
      onCreated: () => void, 
      onCancel: () => void,
      editService?: { name: string, type: string } | null
  }>();

  let name = $state(editService?.name || '');
  let type = $state(editService?.type || 'b2');
  let params = $state<Record<string, string>>({});
  let mountOptions = $state<Record<string, string>>({});
  let loading = $state(false);
  let testingConnection = $state(false);
  let testResult = $state<{success: boolean, message: string} | null>(null);
  let validationErrors = $state<string[]>([]);
  let isEdit = !!editService;
  let activeTab = $state<'manual' | 'import'>('manual');
  let hasImportedContent = $state(false);
  let nameInputRef = $state<HTMLInputElement | null>(null);
  let showHelpModal = $state(false);

  const globalFlags = loadRemotesSchema().globalMountFlags || {};
  
  // Detectar si hay opciones avanzadas configuradas (distintas del default)
  let hasAdvancedOptions = $derived(Object.entries(mountOptions).some(([key, value]) => {
      if (!value) return false;
      const config = globalFlags[key];
      // Si no hay configuración en el esquema (raro), asumimos que si hay valor es custom
      if (!config) return true;
      
      // Si hay un valor por defecto definido, comparamos
      if (config.default !== undefined) {
          return value !== config.default;
      }
      
      // Si no hay default, cualquier valor distinto de vacío u 'off' cuenta
      return value !== 'off';
  }));

  onMount(async () => {
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
              // Cargar opciones avanzadas
              mountOptions = await window.api.invoke('mount-options:get', editService.name);
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

  async function handleTestConnection() {
      if (!validateRequiredFields()) return;
      
      testingConnection = true;
      testResult = null;
      try {
          const finalConfig = buildConfigWithDefaults(type, params);
          await window.api.invoke('services:test-connection', { type, params: finalConfig });
          testResult = { success: true, message: '¡Conexión establecida con éxito!' };
      } catch (e: any) {
          testResult = { success: false, message: e.message };
      } finally {
          testingConnection = false;
      }
  }

  async function selectKeyFile() {
      try {
          const content = await window.api.invoke('system:import-key-file');
          if (content) {
              params = { ...params, 'service_account_credentials': content, 'bucket_policy_only': 'true' };
              type = 'google cloud storage';
              hasImportedContent = true;
              validationErrors = [];
              await showAlert('⚠️ Seguridad Importante', 'Las credenciales se han integrado de forma segura. POR FAVOR, BORRA EL ARCHIVO ORIGINAL.', 'warning');
          }
      } catch (e: any) {
          await showAlert('Error', e.message);
      }
  }

  async function submit() {
      if (!name) { validationErrors = ['El nombre del servicio es obligatorio']; return; }
      if (!validateRequiredFields()) return;

      loading = true;
      try {
          const finalConfig = buildConfigWithDefaults(type, params);
          if (isEdit) {
              await window.api.invoke('services:update', { name, params: finalConfig });
          } else {
              await window.api.invoke('services:create', { name, type, params: finalConfig });
          }
          // Guardar opciones avanzadas (Desempaquetar Proxy de Svelte)
          const plainOptions = JSON.parse(JSON.stringify(mountOptions));
          console.log('[Frontend] Saving mount options for', name, ':', plainOptions);
          await window.api.invoke('mount-options:set', { serviceName: name, options: plainOptions });
          
          onCreated();
      } catch (e: any) {
          console.error('[Frontend] Submit error:', e);
          await showAlert('Error', `Fallo al ${isEdit ? 'actualizar' : 'crear'} servicio: ${e.message || e}`);
      } finally {
          loading = false;
      }
  }
</script>

<div class="modal-box w-11/12 max-w-2xl bg-primary text-text-primary border border-primary p-0 overflow-hidden rounded-2xl shadow-2xl transition-all duration-300">
  <div class="p-8">
    <h3 class="font-bold text-2xl mb-6 text-text-brand-primary">{isEdit ? 'Editar' : 'Añadir'} Servicio</h3>

    {#if !isEdit}
      <div role="tablist" class="grid grid-cols-2 gap-1 p-1 bg-secondary rounded-lg border border-primary mb-6">
          <button role="tab" class="py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none cursor-pointer" class:bg-primary={activeTab === 'manual'} class:text-text-brand-primary={activeTab === 'manual'} class:shadow-sm={activeTab === 'manual'} class:text-text-secondary={activeTab !== 'manual'} onclick={() => { activeTab = 'manual'; testResult = null; }}>Configuración Manual</button>
          <button role="tab" class="py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none cursor-pointer" class:bg-primary={activeTab === 'import'} class:text-text-brand-primary={activeTab === 'import'} class:shadow-sm={activeTab === 'import'} class:text-text-secondary={activeTab !== 'import'} onclick={() => { activeTab = 'import'; testResult = null; }}>Importar JSON (Google)</button>
      </div>
    {/if}

    {#if validationErrors.length > 0}
      <div class="alert bg-error-500/10 border-error-500/30 text-error-600 mb-4 shadow-sm py-2">
        <div class="flex flex-col items-start text-xs font-semibold">
          {#each validationErrors as error}
            <div class="flex items-center gap-2"><span>• {error}</span></div>
          {/each}
        </div>
      </div>
    {/if}

    <form class="space-y-4" onsubmit={(e) => { e.preventDefault(); submit(); }}>
      <div class="grid grid-cols-1 {activeTab === 'manual' ? 'md:grid-cols-2' : ''} gap-4">
          <div class="form-control">
              <label class="label" for="service-name"><span class="label-text text-text-secondary font-semibold">Nombre del Servicio <span class="text-error-500">*</span></span></label>
              <input bind:this={nameInputRef} id="service-name" placeholder="Ej: Mi Google Cloud" class="input input-bordered bg-primary border-primary text-text-primary focus:border-border-brand" bind:value={name} disabled={isEdit} />
          </div>
          {#if activeTab === 'manual'}
              <div class="form-control">
                  <label class="label" for="service-type"><span class="label-text text-text-secondary font-semibold">Tipo de Proveedor</span></label>
                  <select id="service-type" class="select select-bordered bg-primary border-primary text-text-primary focus:border-border-brand" bind:value={type} disabled={isEdit}>
                      {#each availableTypes as remoteType}<option value={remoteType.type}>{remoteType.name}</option>{/each}
                  </select>
              </div>
          {/if}
      </div>

      {#if activeTab === 'import'}
          <div class="bg-secondary p-6 rounded-lg border border-primary space-y-5">
              <div class="form-control">
                  <label class="label font-semibold text-text-primary">Credenciales JSON de Google</label>
                  <button type="button" class="btn bg-brand-600 hover:bg-brand-700 text-white border-none" onclick={selectKeyFile}>
                      {hasImportedContent ? 'Credenciales cargadas (Cambiar)' : 'Seleccionar Archivo JSON'}
                  </button>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="form-control"><label class="label"><span class="label-text font-medium text-text-secondary">Bucket <span class="text-error-500">*</span></span></label><input type="text" bind:value={params['bucket']} placeholder="mi-bucket-gcs" class="input input-bordered input-sm bg-primary border-primary text-text-primary" /></div>
                  <div class="form-control"><label class="label"><span class="label-text font-medium text-text-secondary">Ruta interna (Opcional)</span></label><input type="text" bind:value={params['path']} placeholder="carpeta/subcarpeta" class="input input-bordered input-sm bg-primary border-primary text-text-primary" /></div>
              </div>
          </div>
      {:else}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              {#each Object.entries(getVisibleFields(type)) as [key, fieldConfig]}
                  <div class="form-control">
                      <label class="label" for={key}><span class="label-text text-text-secondary font-medium">{fieldConfig.label || key} {#if fieldConfig.required}<span class="text-error-500">*</span>{/if}</span></label>
                      {#if fieldConfig.type === 'boolean'}
                          <select id={key} class="select select-bordered bg-primary border-primary text-text-primary" bind:value={params[key]}><option value="true">Sí</option><option value="false">No</option></select>
                      {:else}
                          <input id={key} type={key.toLowerCase().includes('key') || key.toLowerCase().includes('secret') || key.toLowerCase().includes('pass') ? 'password' : 'text'} class="input input-bordered bg-primary border-primary text-text-primary focus:border-border-brand" placeholder={fieldConfig.placeholder || ''} bind:value={params[key]} />
                      {/if}
                  </div>
              {/each}
          </div>
      {/if}

      <!-- Opciones Avanzadas de Montaje -->
      <div 
          class="collapse collapse-arrow border rounded-lg mt-4 transition-all duration-300 bg-secondary border-primary"
          style:background-color={hasAdvancedOptions ? 'rgba(0, 160, 198, 0.1)' : ''}
          style:border-color={hasAdvancedOptions ? 'var(--brand-500)' : ''}
          style:border-width={hasAdvancedOptions ? '2px' : ''}
      >
          <input type="checkbox" /> 
          <div class="collapse-title text-sm font-semibold flex justify-between items-center pr-12 {hasAdvancedOptions ? 'text-text-brand-primary' : 'text-text-secondary'}">
              <span>Opciones Avanzadas de Montaje {hasAdvancedOptions ? '(Personalizadas)' : ''}</span>
              <button 
                  type="button" 
                  class="btn btn-circle btn-xs btn-ghost text-brand-500 hover:bg-brand-500/20 z-10 mr-4" 
                  onclick={(e) => { 
                      e.preventDefault(); 
                      showHelpModal = true; 
                  }} 
                  title="Ver ayuda de parámetros"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                  </svg>
              </button>
          </div>
          <div class="collapse-content"> 
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {#each Object.entries(globalFlags) as [flag, config]}
                      <div class="form-control">
                          <label class="label py-1">
                              <span class="label-text text-xs text-text-secondary font-medium">{config.label}</span>
                          </label>
                          {#if config.type === 'select'}
                              <select class="select select-bordered select-sm w-full bg-primary border-primary text-text-primary" bind:value={mountOptions[flag]}>
                                  {#each config.options as opt}
                                      <option value={opt} selected={opt === config.default}>{opt}</option>
                                  {/each}
                              </select>
                          {:else}
                              <input type="text" class="input input-bordered input-sm w-full bg-primary border-primary text-text-primary" placeholder={config.placeholder} bind:value={mountOptions[flag]} />
                          {/if}
                      </div>
                  {/each}
              </div>
          </div>
      </div>

      {#if showHelpModal}
          <dialog class="modal modal-open">
              <div class="modal-box w-11/12 max-w-3xl bg-primary text-text-primary border border-primary shadow-2xl">
                  <div class="flex justify-between items-center mb-4">
                      <h3 class="font-bold text-lg text-text-brand-primary flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                          </svg>
                          Guía de Parámetros Avanzados
                      </h3>
                      <button class="btn btn-sm btn-circle btn-ghost text-text-primary" onclick={() => showHelpModal = false}>✕</button>
                  </div>
                  
                  <div class="overflow-x-auto max-h-[60vh] border rounded-lg border-primary">
                      <table class="table table-zebra table-pin-rows">
                          <thead>
                              <tr class="bg-secondary text-text-primary">
                                  <th class="w-1/4">Parámetro</th>
                                  <th class="w-1/2">Descripción</th>
                                  <th class="w-1/4">Valor por Defecto</th>
                              </tr>
                          </thead>
                          <tbody>
                              {#each Object.entries(globalFlags) as [flag, config]}
                                  <tr class="hover:bg-secondary/50">
                                      <td class="font-mono text-xs text-brand-600 font-bold">{flag}</td>
                                      <td class="text-sm text-text-secondary">
                                          <p class="font-semibold mb-1 text-text-primary">{config.label}</p>
                                          {config.description}
                                      </td>
                                      <td>
                                          <span class="badge badge-sm bg-secondary text-text-secondary border-primary font-mono">{config.default || 'Vacío'}</span>
                                      </td>
                                  </tr>
                              {/each}
                          </tbody>
                      </table>
                  </div>
                  
                  <div class="modal-action">
                      <button class="btn bg-brand-500 hover:bg-brand-600 text-white border-none shadow-md px-8" onclick={() => showHelpModal = false}>Entendido</button>
                  </div>
              </div>
              <form method="dialog" class="modal-backdrop">
                  <button onclick={() => showHelpModal = false}>cerrar</button>
              </form>
          </dialog>
      {/if}

      {#if testResult}
          <div class="alert {testResult.success ? 'bg-success-500/10 border-success-500/30 text-success-600' : 'bg-error-500/10 border-error-500/30 text-error-600'} py-2 px-4 text-sm mt-4 shadow-sm animate-in fade-in">
              <div class="flex items-center gap-2 font-medium">
                  {#if testResult.success}
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                  {:else}
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
                  {/if}
                  <span class="break-all">{testResult.message}</span>
              </div>
          </div>
      {/if}

      <div class="mt-10 flex flex-wrap justify-between items-center bg-secondary -mx-8 -mb-8 p-6 border-t border-primary gap-4">
          <button type="button" class="btn btn-outline border-primary text-text-secondary hover:bg-primary/50" onclick={handleTestConnection} disabled={testingConnection || loading}>
              {#if testingConnection}<span class="loading loading-spinner loading-xs"></span>{/if}
              {testingConnection ? 'Probando...' : 'Probar Conexión'}
          </button>
          
          <div class="flex gap-2">
              <button class="btn btn-outline border-brand-500 text-brand-600 hover:bg-brand-500 hover:text-white" type="button" onclick={onCancel}>Cancelar</button>
              <button class="btn bg-brand-600 hover:bg-brand-700 text-white border-none min-w-[140px]" type="submit" disabled={loading || testingConnection}>
                  {#if loading}<span class="loading loading-spinner loading-xs"></span>{/if}
                  {isEdit ? 'Guardar Cambios' : 'Crear Servicio'}
              </button>
          </div>
      </div>
    </form>
  </div>
</div>