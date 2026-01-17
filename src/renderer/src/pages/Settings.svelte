<script lang="ts">
  import { onMount } from 'svelte';
  import type { AppSettings } from '../../../../contracts/types';

  let settings = $state<AppSettings>({
      theme: 'system',
      rclonePath: '',
      firstRun: false,
      passwordHash: ''
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

  function applyTheme(theme: 'light' | 'dark' | 'system') {
      const html = document.documentElement;
      if (theme === 'system') {
           const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
           html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      } else {
           html.setAttribute('data-theme', theme);
      }
  }

  function openWebUI() {
      window.api.invoke('system:open-external', 'https://rclone.org');
  }
</script>

<div class="p-4">
  <h2 class="text-2xl font-bold mb-6">Configuración</h2>
  
  <div class="form-control max-w-xs">
      <label class="label">Tema</label>
      <select class="select select-bordered" value={settings.theme} onchange={(e) => updateTheme(e.currentTarget.value as any)}>
          <option value="light">Claro</option>
          <option value="dark">Oscuro</option>
          <option value="system">Sistema</option>
      </select>
  </div>

  <div class="mt-6">
      <button class="btn btn-secondary" onclick={openWebUI}>Abrir Documentación Rclone</button>
  </div>
</div>
