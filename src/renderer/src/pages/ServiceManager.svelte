<script lang="ts">
  import { onMount } from 'svelte';
  import ServiceCard from '../components/Services/ServiceCard.svelte';
  import AddServiceForm from '../components/Services/AddServiceForm.svelte';
  import FAB from '../components/Shared/FAB.svelte';
  import type { Service, MountState } from '../../../../contracts/types';
      import Settings from './Settings.svelte';
      import developerPhoto from '../assets/images/developer.jpg';
      import { showConfirm, showAlert } from '../stores/modal';
    
      let services = $state<Service[]>([]);    let showAddModal = $state(false);
    let showSettings = $state(false);
    let showAbout = $state(false);
    let serviceToEdit = $state<Service | null>(null);
    let appVersion = __APP_VERSION__;
  
    async function loadServices() {
        try {
            const list = await window.api.invoke('services:list');
            const mounts: MountState[] = await window.api.invoke('mount:list-active');
            
            services = list.map((s: any) => {
                const mount = mounts.find(m => m.serviceName === s.name && m.status === 'mounted');
                return {
                    name: s.name,
                    type: s.type,
                    isMounted: !!mount,
                    mountPoint: mount ? mount.mountPoint : undefined
                };
            });
        } catch (e) {
            console.error(e);
        }
    }
  
        async function handleUnmountAll() {
            console.log('Button clicked: Unmount All');
            if(await showConfirm('Desmontar Todo', '¿Desmontar todos los servicios? Esto detendrá todas las conexiones activas.', 'warning')) {
                console.log('User confirmed unmount all');
                try {                  const result = await window.api.invoke('mount:stop-all');
                  if (result.success) {
                      // alert(`Se han desmontado ${result.unmountedCount} servicios.`);
                  } else {
                      await showAlert('Error Parcial', `Algunos servicios no se pudieron desmontar:\n${result.errors.join('\n')}`, 'warning');
                  }
                  await loadServices();
              } catch (e: any) {
                  await showAlert('Error', 'Error al desmontar todos: ' + e.message);
              }
          }
      }  
    onMount(loadServices);
  </script>
  
  <div class="p-4 min-h-screen relative pb-24">
    {#if showSettings}
       <button class="btn btn-ghost mb-4" onclick={() => showSettings = false}>← Volver</button>
       <Settings onRefresh={loadServices} />
    {:else}
              <!-- Header -->
              <div class="flex justify-end items-center mb-6 relative z-50">
                  <button 
                    class="btn btn-circle btn-ghost text-error" 
                    onclick={() => { console.log('Direct HTML click'); handleUnmountAll(); }} 
                    title="Desmontar todos"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                  </button>
              </div>  
        <!-- Service List -->
        <div class="flex flex-col gap-4">
            {#each services as service (service.name)}
                <ServiceCard 
                  {service} 
                  onDelete={loadServices} 
                  onMountChange={loadServices} 
                  onEdit={(s) => { serviceToEdit = s; showAddModal = true; }}
                />
            {/each}
            {#if services.length === 0}
                <div class="text-center py-10 opacity-50">
                    No hay servicios configurados.
                </div>
            {/if}
        </div>
  
        <!-- Footer Actions -->
        <div class="fixed bottom-6 right-24 flex gap-2 z-40">
            <button class="btn btn-circle bg-brand-blue hover:bg-brand-blue-dark text-white border-none shadow-lg" onclick={() => showSettings = true} title="Configuración">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>
            <button class="btn btn-circle bg-brand-blue hover:bg-brand-blue-dark text-white border-none shadow-lg" onclick={() => showAbout = true} title="Acerca de">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>
        </div>
  
        <!-- FAB -->
        <FAB onclick={() => { serviceToEdit = null; showAddModal = true; }} />
    {/if}
  
    {#if showAddModal}
        <dialog class="modal modal-open">
            <AddServiceForm 
              editService={serviceToEdit}
              onCreated={() => { showAddModal = false; serviceToEdit = null; loadServices(); }} 
              onCancel={() => { showAddModal = false; serviceToEdit = null; }} 
            />
        </dialog>
    {/if}
  
    {#if showAbout}
        <dialog class="modal modal-open">
            <div class="modal-box text-center relative bg-white dark:bg-slate-800">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onclick={() => showAbout = false}>✕</button>
                <h3 class="font-bold text-lg mb-4 text-brand-blue dark:text-white">Acerca de Cloud Mount</h3>
                <div class="flex flex-col items-center gap-4">
                                      <div class="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-brand-blue">
                                          <img src={developerPhoto} alt="Daniel Díez Mardomingo" class="w-full h-full object-cover" />
                                      </div>
                                      <div>
                                          <p class="text-lg font-semibold text-gray-500 dark:text-gray-400">Diseñado e implementado por</p>
                                          <p class="text-xl font-bold text-brand-blue dark:text-brand-blue-light">Daniel Díez Mardomingo</p>
                                          <p class="text-lg font-semibold text-gray-500 dark:text-gray-400 mt-1">danimardo@yahoo.es</p>
                                      </div>
                                      <p class="text-sm text-gray-400 mt-2">Versión: {appVersion}</p>
                                  </div>            </div>
            <form method="dialog" class="modal-backdrop">
                <button onclick={() => showAbout = false}>close</button>
            </form>
        </dialog>
    {/if}
  </div>
