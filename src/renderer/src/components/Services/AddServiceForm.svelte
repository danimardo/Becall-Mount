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

  // Cargar datos si es edición
  onMount(async () => {
      if (isEdit && editService) {
          try {
              const remoteData = await window.api.invoke('services:get', editService.name);
              if (remoteData) {
                  // Separar el tipo del resto de parámetros
                  const { type: remoteType, ...rest } = remoteData;
                  type = remoteType;
                  params = { ...rest };
              }
          } catch (e) {
              console.error('Error al cargar servicio para editar', e);
          }
      }
  });

  // Cargar los tipos de remotos disponibles desde el esquema
  const availableTypes = getAvailableRemoteTypes();

  function updateParam(key: string, value: string) {
      params = { ...params, [key]: value };
      // Limpiar errores de validación cuando el usuario modifica un campo
      if (validationErrors.length > 0) {
          validationErrors = [];
      }
  }

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

  async function submit() {
      if (!name) {
          validationErrors = ['El nombre del servicio es obligatorio'];
          return;
      }

      // Validar campos obligatorios
      if (!validateRequiredFields()) {
          return;
      }

      loading = true;
      try {
          // Construir configuración completa con valores por defecto del esquema
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

<div class="modal-box bg-white dark:bg-slate-800 dark:text-white">
  <h3 class="font-bold text-lg">{isEdit ? 'Editar' : 'Añadir'} Servicio</h3>

  <!-- Mostrar errores de validación -->
  {#if validationErrors.length > 0}
    <div class="alert alert-error">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>
        {#each validationErrors as error}
          <div>{error}</div>
        {/each}
      </span>
    </div>
  {/if}

  <form class="py-4 space-y-4" onsubmit={(e) => { e.preventDefault(); submit(); }}>
    <div class="form-control">
        <label class="label" for="service-name">
          <span class="label-text dark:text-gray-300">Nombre <span class="text-error">*</span></span>
        </label>
        <input id="service-name" class="input input-bordered dark:bg-slate-700 dark:border-gray-600" bind:value={name} disabled={isEdit} />
    </div>
    <div class="form-control">
        <label class="label" for="service-type">
            <span class="label-text dark:text-gray-300">Tipo</span>
        </label>
        <select id="service-type" class="select select-bordered dark:bg-slate-700 dark:border-gray-600" bind:value={type} disabled={isEdit}>
            {#each availableTypes as remoteType}
                <option value={remoteType.type}>{remoteType.name}</option>
            {/each}
        </select>
    </div>

    <!-- Campos dinámicos basados en el tipo seleccionado -->
    {#each Object.entries(getVisibleFields(type)) as [key, fieldConfig]}
        <div class="form-control">
            <label class="label" for={key}>
              <span class="label-text dark:text-gray-300">
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

    <div class="modal-action">
        <button class="btn btn-outline text-brand-blue border-brand-blue hover:bg-brand-blue hover:text-white" type="button" onclick={onCancel}>Cancelar</button>
        <button class="btn bg-brand-green hover:bg-brand-green-dark text-white border-none" type="submit" disabled={loading}>
            {isEdit ? 'Guardar Cambios' : 'Crear'}
        </button>
    </div>
  </form>
</div>