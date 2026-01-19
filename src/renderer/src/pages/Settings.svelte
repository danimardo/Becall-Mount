<script lang="ts">
  import { onMount } from 'svelte';
  import type { AppSettings, Service } from '../../../../contracts/types';
  import { showAlert } from '../stores/modal';

  let { onRefresh } = $props<{ onRefresh?: () => void }>();

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
  let conflictNewName = $state('');
  
  let importPasswordRef = $state<HTMLInputElement | null>(null);
  let exportPasswordRef = $state<HTMLInputElement | null>(null);

  $effect(() => {
      if (importConflicts.length > 0) {
          conflictNewName = importConflicts[0].name + ' (Importado)';
      }
  });

  // Forzar foco en modal de importación
  $effect(() => {
      if (showImportModal) {
          setTimeout(() => importPasswordRef?.focus(), 50);
      }
  });

  // Forzar foco en modal de exportación (paso 2)
  $effect(() => {
      if (showExportModal && exportStep === 2) {
          setTimeout(() => exportPasswordRef?.focus(), 50);
      }
  });

  onMount(async () => {
      settings = await window.api.invoke('settings:get');
      applyTheme(settings.theme);
  });

  async function updateTheme(theme: 'light' | 'dark' | 'system') {
      settings.theme = theme;
      await window.api.invoke('settings:set', { theme });
      applyTheme(theme);
  }

  async function updateAutoLaunch(enabled: boolean) {
      settings.autoLaunch = enabled;
      await window.api.invoke('settings:set', { autoLaunch: enabled });
  }

  function applyTheme(theme: 'light' | 'dark' | 'system') {
      const html = document.documentElement;
      let isDark = theme === 'dark';
      
      if (theme === 'system') {
           isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      html.setAttribute('data-theme', isDark ? 'dark' : 'light');
      
      if (isDark) {
          html.classList.add('dark');
      } else {
          html.classList.remove('dark');
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
          await showAlert('Error', 'Debes establecer una contraseña', 'warning');
          return;
      }
      
      const result = await window.api.invoke('config:export', {
          serviceNames: Array.from(selectedServices),
          password: exportPassword
      });

      if (result.success) {
          await showAlert('Éxito', 'Configuración exportada correctamente', 'success');
          showExportModal = false;
      } else if (result.error) {
          await showAlert('Error', 'Error al exportar: ' + result.error);
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
          await showAlert('Error', 'Introduce la contraseña', 'warning');
          return;
      }

      const result = await window.api.invoke('config:import', {
          filePath: importFilePath,
          password: importPassword
      });

      if (result.success) {
          showImportModal = false;
          if (onRefresh) onRefresh();
          if (result.conflicts && result.conflicts.length > 0) {
              importConflicts = result.conflicts;
              showConflictModal = true;
          } else {
              await showAlert('Éxito', `Importados ${result.servicesImported} servicios correctamente.`, 'success');
          }
      } else {
          await showAlert('Error', 'Error: ' + result.error);
      }
  }

  async function resolveConflict(conflict: any, action: 'overwrite' | 'rename' | 'skip') {
      try {
          // Remove 'type' from params as it is passed as a separate argument
          const { type: _t, ...cleanParams } = conflict.params;

          if (action === 'overwrite') {
              // Delete existing first to allow overwrite
              await window.api.invoke('services:delete', conflict.name);
              
              await window.api.invoke('services:create', { 
                  name: conflict.name, 
                  type: conflict.type, 
                  params: cleanParams 
              });
          } else if (action === 'rename') {
              // Create with user-provided new name
              await window.api.invoke('services:create', { 
                  name: conflictNewName, 
                  type: conflict.type, 
                  params: cleanParams 
              });
          }
          // Skip does nothing
          
          // Remove from list
          importConflicts = importConflicts.filter(c => c.name !== conflict.name);
          if (onRefresh) onRefresh();
          
          if (importConflicts.length === 0) {
              showConflictModal = false;
              await showAlert('Éxito', 'Todos los conflictos resueltos.', 'success');
          }
      } catch (e: any) {
          console.error('Error resolving conflict:', e);
          await showAlert('Error', 'Error al resolver conflicto: ' + (e.message || 'Error desconocido'));
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

      <div class="form-control max-w-sm">
          <label class="label cursor-pointer justify-start gap-4">
              <span class="label-text font-bold">Arrancar al iniciar sesión</span>
              <input type="checkbox" class="toggle border-brand-blue checked:bg-brand-blue checked:border-brand-blue" checked={settings.autoLaunch} onchange={(e) => updateAutoLaunch(e.currentTarget.checked)} />
          </label>
          <p class="text-xs text-gray-500 dark:text-gray-400">Si se activa, la aplicación se iniciará automáticamente cuando inicies sesión en Windows.</p>
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
          <div class="modal-box bg-white dark:bg-slate-800 dark:text-white">
              <h3 class="font-bold text-lg mb-4">Exportar Configuración</h3>
              {#if exportStep === 1}
                  <p class="mb-2 dark:text-gray-300">Selecciona los servicios a exportar:</p>
                  <div class="max-h-60 overflow-y-auto mb-4 border dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-slate-700/50 flex flex-col gap-1">
                      {#each services as service}
                          <label class="label cursor-pointer flex justify-start items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-md transition-colors">
                              <input type="checkbox" class="checkbox border-brand-green checked:bg-brand-green checked:border-brand-green" checked={selectedServices.has(service.name)} onchange={() => toggleService(service.name)} />
                              <div class="flex flex-col">
                                  <span class="label-text dark:text-gray-200 font-bold">{service.name}</span>
                                  <span class="text-xs text-gray-500 dark:text-gray-400 capitalize">{service.type}</span>
                              </div>
                          </label>
                      {/each}
                  </div>
                  <div class="modal-action">
                      <button class="btn btn-outline text-brand-blue border-brand-blue hover:bg-brand-blue hover:text-white" onclick={() => showExportModal = false}>Cancelar</button>
                      <button class="btn bg-brand-green hover:bg-brand-green-dark text-white border-none" onclick={() => exportStep = 2} disabled={selectedServices.size === 0}>Continuar</button>
                  </div>
              {:else}
                  <p class="mb-2 dark:text-gray-300">Establece una contraseña para encriptar el archivo:</p>
                  <input bind:this={exportPasswordRef} type="password" class="input input-bordered w-full mb-4 dark:bg-slate-700 dark:border-gray-600" bind:value={exportPassword} placeholder="Contraseña" />
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
          <div class="modal-box bg-white dark:bg-slate-800 dark:text-white">
              <h3 class="font-bold text-lg mb-4">Importar Configuración</h3>
              <p class="mb-2 dark:text-gray-300">Introduce la contraseña del archivo:</p>
              <input bind:this={importPasswordRef} type="password" class="input input-bordered w-full mb-4 dark:bg-slate-700 dark:border-gray-600" bind:value={importPassword} placeholder="Contraseña" />
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
          <div class="modal-box bg-white dark:bg-slate-800 dark:text-white border border-warning/50 shadow-2xl">
              <h3 class="font-bold text-xl mb-4 text-warning flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  Conflicto de Nombre
              </h3>
              <p class="mb-4 dark:text-gray-300">El servicio <strong>{importConflicts[0]?.name}</strong> ya existe en tu configuración.</p>
              
              <div class="form-control mb-6 bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
                  <label class="label font-semibold">Nuevo nombre para importar:</label>
                  <input type="text" class="input input-bordered w-full dark:bg-slate-800" bind:value={conflictNewName} placeholder="Escribe el nuevo nombre..." />
                  <label class="label">
                      <span class="label-text-alt text-gray-500">Úsalo para la opción "Renombrar"</span>
                  </label>
              </div>

              <div class="grid grid-cols-1 gap-2">
                  <button class="btn btn-warning shadow-sm" onclick={() => resolveConflict(importConflicts[0], 'overwrite')}>
                      Sobrescribir el existente
                  </button>
                  <button class="btn btn-info text-white shadow-sm" onclick={() => resolveConflict(importConflicts[0], 'rename')} disabled={!conflictNewName || conflictNewName === importConflicts[0]?.name}>
                      Renombrar e importar
                  </button>
                  <button class="btn btn-ghost dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700" onclick={() => resolveConflict(importConflicts[0], 'skip')}>
                      Omitir este servicio
                  </button>
              </div>
              
              {#if importConflicts.length > 1}
                  <div class="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 text-sm text-center text-gray-500">
                      Quedan {importConflicts.length} conflictos por resolver.
                  </div>
              {/if}
          </div>
      </dialog>
  {/if}
</div>