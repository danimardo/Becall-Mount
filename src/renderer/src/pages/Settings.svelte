<script lang="ts">
  import { onMount } from 'svelte';
  import type { AppSettings, Service } from '../../../../contracts/types';

  let settings = $state<AppSettings>({
      theme: 'system',
      rclonePath: '',
      firstRun: false,
      passwordHash: ''
  });

  // Export State
  let showExportModal = $state(false);
  let services = $state<Service[]>([]);
  let selectedServices = $state<Set<string>>(new Set());
  let exportPassword = $state('');
  let exportStep = $state(1); // 1: Selection, 2: Password

  // Import State
  let showImportModal = $state(false);
  let importFilePath = $state('');
  let importPassword = $state('');
  let importConflicts = $state<any[]>([]);
  let showConflictModal = $state(false);

  onMount(async () => {
      settings = await window.api.invoke('settings:get');
      applyTheme(settings.theme);
  });

  async function updateTheme(theme: 'light' | 'dark' | 'system') {
      settings.theme = theme;
      await window.api.invoke('settings:set', { theme });
      applyTheme(theme);
  }

  function applyTheme(theme: 'light' | 'dark' | 'system') {
      const html = document.documentElement;
      if (theme === 'system') {
           const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
           html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      } else {
           html.setAttribute('data-theme', theme);
      }
  }

  // --- Export Logic ---
  async function startExport() {
      const list = await window.api.invoke('services:list');
      services = list;
      selectedServices = new Set(list.map(s => s.name));
      exportPassword = '';
      exportStep = 1;
      showExportModal = true;
  }

  function toggleService(name: string) {
      if (selectedServices.has(name)) {
          selectedServices.delete(name);
      } else {
          selectedServices.add(name);
      }
      // Trigger reactivity if needed (Svelte 5 Runes handle Set/Map specifically? 
      // Often better to reassign: selectedServices = new Set(selectedServices))
      selectedServices = new Set(selectedServices); 
  }

  async function doExport() {
      if (!exportPassword) {
          alert('Debes establecer una contraseña');
          return;
      }
      
      const result = await window.api.invoke('config:export', {
          serviceNames: Array.from(selectedServices),
          password: exportPassword
      });

      if (result.success) {
          alert('Configuración exportada correctamente');
          showExportModal = false;
      } else if (result.error) {
          alert('Error al exportar: ' + result.error);
      }
  }

  // --- Import Logic ---
  async function startImport() {
      const path = await window.api.invoke('system:select-file', [{ name: 'Configuración', extensions: ['conf'] }]);
      if (path) {
          importFilePath = path;
          importPassword = '';
          showImportModal = true;
      }
  }

  async function doImport() {
      if (!importPassword) {
          alert('Introduce la contraseña');
          return;
      }

      const result = await window.api.invoke('config:import', {
          filePath: importFilePath,
          password: importPassword
      });

      if (result.success) {
          showImportModal = false;
          if (result.conflicts && result.conflicts.length > 0) {
              importConflicts = result.conflicts;
              showConflictModal = true;
          } else {
              alert(`Importados ${result.servicesImported} servicios correctamente.`);
          }
      } else {
          alert('Error: ' + result.error);
      }
  }

  async function resolveConflict(conflict: any, action: 'overwrite' | 'rename' | 'skip') {
      try {
          if (action === 'overwrite') {
              // Re-create service (overwrite)
              await window.api.invoke('services:create', { 
                  name: conflict.name, 
                  type: conflict.type, 
                  params: conflict.params 
              });
          } else if (action === 'rename') {
              // Create with new name
              const newName = conflict.name + ' (Importado)';
              await window.api.invoke('services:create', { 
                  name: newName, 
                  type: conflict.type, 
                  params: conflict.params 
              });
          }
          // Skip does nothing
          
          // Remove from list
          importConflicts = importConflicts.filter(c => c.name !== conflict.name);
          
          if (importConflicts.length === 0) {
              showConflictModal = false;
              alert('Todos los conflictos resueltos.');
          }
      } catch (e) {
          console.error(e);
          alert('Error al resolver conflicto');
      }
  }
</script>

<div class="p-4">
  <h2 class="text-2xl font-bold mb-6 text-brand-blue dark:text-white">Configuración</h2>
  
  <div class="space-y-6">
      <div class="form-control max-w-xs">
          <label class="label font-bold">Tema</label>
          <select class="select select-bordered" value={settings.theme} onchange={(e) => updateTheme(e.currentTarget.value as any)}>
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
              <option value="system">Sistema</option>
          </select>
      </div>

      <div class="divider"></div>

      <div>
          <h3 class="font-bold text-lg mb-2">Gestión de Configuración</h3>
          <div class="flex gap-4">
              <button class="btn bg-brand-green text-white hover:bg-brand-green-dark border-none" onclick={startExport}>Exportar Configuración</button>
              <button class="btn btn-outline text-brand-blue border-brand-blue hover:bg-brand-blue hover:text-white" onclick={startImport}>Importar Configuración</button>
          </div>
      </div>
  </div>

  <!-- Export Modal -->
  {#if showExportModal}
      <dialog class="modal modal-open">
          <div class="modal-box">
              <h3 class="font-bold text-lg mb-4">Exportar Configuración</h3>
              {#if exportStep === 1}
                  <p class="mb-2">Selecciona los servicios a exportar:</p>
                  <div class="max-h-60 overflow-y-auto mb-4 border rounded p-2">
                      {#each services as service}
                          <label class="label cursor-pointer justify-start gap-2">
                              <input type="checkbox" class="checkbox checkbox-primary" checked={selectedServices.has(service.name)} onchange={() => toggleService(service.name)} />
                              <span class="label-text">{service.name} ({service.type})</span>
                          </label>
                      {/each}
                  </div>
                  <div class="modal-action">
                      <button class="btn btn-outline text-brand-blue border-brand-blue hover:bg-brand-blue hover:text-white" onclick={() => showExportModal = false}>Cancelar</button>
                      <button class="btn bg-brand-green hover:bg-brand-green-dark text-white border-none" onclick={() => exportStep = 2} disabled={selectedServices.size === 0}>Continuar</button>
                  </div>
              {:else}
                  <p class="mb-2">Establece una contraseña para encriptar el archivo:</p>
                  <input type="password" class="input input-bordered w-full mb-4" bind:value={exportPassword} placeholder="Contraseña" />
                  <div class="modal-action">
                      <button class="btn btn-outline text-brand-blue border-brand-blue hover:bg-brand-blue hover:text-white" onclick={() => exportStep = 1}>Atrás</button>
                      <button class="btn bg-brand-green hover:bg-brand-green-dark text-white border-none" onclick={doExport} disabled={!exportPassword}>Exportar</button>
                  </div>
              {/if}
          </div>
      </dialog>
  {/if}

  <!-- Import Modal -->
  {#if showImportModal}
      <dialog class="modal modal-open">
          <div class="modal-box">
              <h3 class="font-bold text-lg mb-4">Importar Configuración</h3>
              <p class="mb-2">Introduce la contraseña del archivo:</p>
              <input type="password" class="input input-bordered w-full mb-4" bind:value={importPassword} placeholder="Contraseña" />
              <div class="modal-action">
                  <button class="btn btn-outline text-brand-blue border-brand-blue hover:bg-brand-blue hover:text-white" onclick={() => showImportModal = false}>Cancelar</button>
                  <button class="btn bg-brand-green hover:bg-brand-green-dark text-white border-none" onclick={doImport} disabled={!importPassword}>Importar</button>
              </div>
          </div>
      </dialog>
  {/if}

  <!-- Conflict Modal -->
  {#if showConflictModal}
      <dialog class="modal modal-open">
          <div class="modal-box">
              <h3 class="font-bold text-lg mb-4 text-warning">Conflictos Detectados</h3>
              <p class="mb-4">El servicio <strong>{importConflicts[0]?.name}</strong> ya existe.</p>
              <div class="flex flex-col gap-2">
                  <button class="btn btn-warning" onclick={() => resolveConflict(importConflicts[0], 'overwrite')}>Sobrescribir existente</button>
                  <button class="btn btn-info" onclick={() => resolveConflict(importConflicts[0], 'rename')}>Renombrar a "{importConflicts[0]?.name} (Importado)"</button>
                  <button class="btn btn-ghost" onclick={() => resolveConflict(importConflicts[0], 'skip')}>Omitir este servicio</button>
              </div>
              <div class="mt-4 text-sm text-center text-gray-500">
                  Quedan {importConflicts.length} conflictos por resolver.
              </div>
          </div>
      </dialog>
  {/if}
</div>