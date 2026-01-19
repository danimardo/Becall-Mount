<script lang="ts">
  import { onMount } from 'svelte';
  
  let appVersion = __APP_VERSION__; 
  let statusMessage = $state('Iniciando...');
  let isDark = $state(true);

  onMount(async () => {
    // Detectar tema del sistema inicialmente
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    isDark = mediaQuery.matches;

    // Intentar obtener el tema guardado en la configuración de la app
    try {
        if (window.api) {
            const settings = await window.api.invoke('settings:get');
            if (settings.theme === 'light') isDark = false;
            else if (settings.theme === 'dark') isDark = true;
            // Si es 'system', ya tenemos el valor correcto de mediaQuery
        }
    } catch (e) {
        console.warn('No se pudo cargar la preferencia de tema, usando sistema');
    }

    if (window.api) {
        window.api.on('splash:status', (msg: string) => {
            statusMessage = msg;
        });
    }
  });

  function extendSplash() {
      if (window.api) {
          window.api.send('splash:extend');
          const original = statusMessage;
          statusMessage = 'TIEMPO EXTENDIDO (+5s)';
          setTimeout(() => {
              if (statusMessage === 'TIEMPO EXTENDIDO (+5s)') statusMessage = original;
          }, 1500);
      }
  }
</script>

<svelte:head>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<!-- Contenedor Principal que elige el tema -->
{#if isDark}
    <!-- TEMA OSCURO (Futuristic Dark) -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="splash-container dark-theme fade-in select-none cursor-pointer" onclick={extendSplash} role="button" tabindex="0">
        <div class="grid-background"></div>
        <div class="scanlines"></div>
        
        <div class="corner-decoration top-left"></div>
        <div class="corner-decoration top-right"></div>
        <div class="corner-decoration bottom-left"></div>
        <div class="corner-decoration bottom-right"></div>
        
        <div class="tech-data">
            <div class="data-row">
                <span class="data-label">SYS.ID:</span>
                <span class="data-value">CM-2026</span>
            </div>
            <div class="data-row">
                <span class="data-label">STATUS:</span>
                <span class="data-value">ONLINE</span>
            </div>
        </div>
        
        <div class="system-bar">
            <div class="system-status">
                <div class="system-status-fill"></div>
            </div>
        </div>
        
        <div class="logo-container">
            <div class="logo">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 14v3m0 0v3m0-3h3m-3 0H9" stroke="#10b981" stroke-width="1" />
                </svg>
            </div>
        </div>
        
        <h1 class="app-name glitch" data-text="CLOUD MOUNT">CLOUD MOUNT</h1>
        
        <div class="status-container">
            <div class="status-indicator"></div>
            <p class="status-message">{statusMessage}</p>
        </div>
        
        <div class="loading-bar-container">
            <span class="loading-text">System Loading</span>
            <div class="loading-bar">
                <div class="loading-bar-fill"></div>
            </div>
        </div>
        
        <div class="credits">
            <p class="credits-label">Diseñado y programado por:</p>
            <p class="credits-author">Daniel Díez Mardomingo</p>
        </div>
        
        <p class="version">v{appVersion}</p>
    </div>
{:else}
    <!-- TEMA CLARO (Futuristic Light) -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="splash-container light-theme fade-in select-none cursor-pointer" onclick={extendSplash} role="button" tabindex="0">
        <div class="grid-background"></div>
        
        <!-- Decorative Circles -->
        <div class="circle-decoration circle-1"></div>
        <div class="circle-decoration circle-2"></div>
        <div class="circle-decoration circle-3"></div>
        
        <!-- Tech Lines -->
        <div class="tech-line tech-line-1"></div>
        <div class="tech-line tech-line-2"></div>
        <div class="tech-line tech-line-3"></div>
        <div class="tech-line tech-line-4"></div>
        
        <div class="corner-decoration top-left"></div>
        <div class="corner-decoration top-right"></div>
        <div class="corner-decoration bottom-left"></div>
        <div class="corner-decoration bottom-right"></div>
        
        <div class="tech-data">
            <div class="data-row">
                <span class="data-label">SYS.ID:</span>
                <span class="data-value">CM-2026</span>
            </div>
            <div class="data-row">
                <span class="data-label">STATUS:</span>
                <span class="data-value">ONLINE</span>
            </div>
        </div>
        
        <div class="system-bar">
            <div class="system-status">
                <div class="system-status-fill"></div>
            </div>
        </div>
        
        <div class="logo-container">
            <div class="logo">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 14v3m0 0v3m0-3h3m-3 0H9" stroke="#10b981" stroke-width="1" />
                </svg>
            </div>
        </div>
        
        <h1 class="app-name">CLOUD MOUNT</h1>
        
        <div class="status-container">
            <div class="status-indicator"></div>
            <p class="status-message">{statusMessage}</p>
        </div>
        
        <div class="loading-bar-container">
            <span class="loading-text">System Loading</span>
            <div class="loading-bar">
                <div class="loading-bar-fill"></div>
            </div>
        </div>
        
        <div class="credits">
            <p class="credits-label">Diseñado y programado por:</p>
            <p class="credits-author">Daniel Díez Mardomingo</p>
        </div>
        
        <p class="version">v{appVersion}</p>
    </div>
{/if}

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Rajdhani', sans-serif;
        background-color: transparent !important;
        overflow: hidden;
    }
    
    .splash-container {
        width: 100vw;
        height: 100vh;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        border-radius: 12px;
    }

    /* --- DARK THEME STYLES --- */
    .dark-theme {
        background: linear-gradient(135deg, #0a0e14 0%, #0f1623 50%, #0a0e14 100%);
        color: #e0f0ff;
        border: 1px solid #1a2733;
        box-shadow: 0 0 30px rgba(0, 0, 0, 0.8);
        --corner-primary: #10b981;
        --corner-secondary: #3b82f6;
    }

    .dark-theme .grid-background {
        background-image: 
            linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px);
    }

    /* --- LIGHT THEME STYLES --- */
    .light-theme {
        background: linear-gradient(135deg, #ffffff 0%, #f8fafd 50%, #ffffff 100%);
        color: #1e3a5f;
        border: 1px solid #e0e7ff;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
        --corner-primary: #3b82f6;
        --corner-secondary: #10b981;
    }

    .light-theme .grid-background {
        background-image: 
            linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px);
    }
    
    .light-theme .app-name {
        color: #1e3a5f;
        text-shadow: 0 0 0 transparent;
    }

    .light-theme .data-value { color: #1e3a5f; font-weight: 600; }
    .light-theme .credits-author { color: #10b981; }

    /* --- SHARED STYLES --- */
    .grid-background {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        background-size: 20px 20px; z-index: 1;
    }

    .corner-decoration {
        position: absolute; width: 60px; height: 60px; z-index: 3;
        /* Asegurar que no hay bordes por defecto */
        border: none; 
    }
    
    .top-left { 
        top: 10px; left: 10px; 
        border-top: 3px solid var(--corner-primary); 
        border-left: 3px solid var(--corner-primary); 
    }
    .top-right { 
        top: 10px; right: 10px; 
        border-top: 3px solid var(--corner-secondary); 
        border-right: 3px solid var(--corner-secondary); 
    }
    .bottom-left { 
        bottom: 10px; left: 10px; 
        border-bottom: 3px solid var(--corner-secondary); 
        border-left: 3px solid var(--corner-secondary); 
    }
    .bottom-right { 
        bottom: 10px; right: 10px; 
        border-bottom: 3px solid var(--corner-primary); 
        border-right: 3px solid var(--corner-primary); 
    }

    .logo-container { position: relative; z-index: 5; margin-bottom: 15px; }
    .logo { width: 80px; height: 80px; position: relative; }
    .logo svg { width: 100%; height: 100%; filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.5)); animation: hologram-pulse 3s infinite; }

    .app-name {
        font-family: 'Orbitron', sans-serif; font-size: 32px; font-weight: 700;
        text-transform: uppercase; letter-spacing: 3px; position: relative; z-index: 5; margin-bottom: 15px;
    }

    .status-container { position: relative; z-index: 5; display: flex; align-items: center; margin-bottom: 30px; }
    .status-indicator { width: 8px; height: 8px; background-color: #10b981; border-radius: 50%; margin-right: 10px; animation: blink 1.5s infinite; }
    .status-message { font-family: 'Rajdhani', sans-serif; font-size: 16px; font-weight: 500; color: #10b981; text-transform: uppercase; letter-spacing: 2px; }

    .tech-data { position: absolute; top: 20px; left: 20px; z-index: 4; display: flex; flex-direction: column; gap: 5px; }
    .data-row { display: flex; align-items: center; font-size: 10px; color: #3b82f6; }
    .data-label { margin-right: 5px; opacity: 0.7; }
    .data-value { font-family: monospace; color: #10b981; }

    .system-bar { position: absolute; top: 20px; right: 20px; z-index: 4; display: flex; gap: 10px; }
    .system-status { width: 40px; height: 4px; background-color: rgba(59, 130, 246, 0.2); border-radius: 2px; overflow: hidden; }
    .system-status-fill { height: 100%; background-color: #3b82f6; width: 0%; animation: load 3s ease-out forwards; }

    .credits { position: absolute; bottom: 25px; right: 20px; z-index: 4; text-align: right; }
    .credits-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; }
    .credits-author { font-size: 16px; font-weight: 600; text-shadow: 0 0 5px rgba(16, 185, 129, 0.5); letter-spacing: 1px; }

    .version { position: absolute; bottom: 10px; right: 20px; z-index: 4; font-family: monospace; font-size: 10px; color: #3b82f6; opacity: 0.7; }

    .loading-bar-container { position: absolute; bottom: 40px; left: 20px; right: 20px; z-index: 4; }
    .loading-bar { height: 2px; background-color: rgba(59, 130, 246, 0.2); border-radius: 1px; overflow: hidden; position: relative; }
    .loading-bar-fill { height: 100%; background-color: #3b82f6; width: 0%; animation: load-bar 3s ease-out forwards; box-shadow: 0 0 5px #3b82f6; }
    .loading-text { position: absolute; top: -15px; left: 0; font-size: 10px; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px; }

    /* Light Theme Extra Decorations */
    .circle-decoration { position: absolute; border-radius: 50%; border: 1px solid rgba(59, 130, 246, 0.1); z-index: 2; }
    .circle-1 { width: 200px; height: 200px; top: 50%; left: 50%; transform: translate(-50%, -50%); animation: rotate 20s linear infinite; }
    .circle-2 { width: 300px; height: 300px; top: 50%; left: 50%; transform: translate(-50%, -50%); border-style: dashed; animation: rotate 30s linear infinite reverse; }
    .circle-3 { width: 100px; height: 100px; top: 50%; left: 50%; transform: translate(-50%, -50%); animation: rotate 15s linear infinite; }
    
    .tech-line { position: absolute; background-color: rgba(59, 130, 246, 0.1); z-index: 2; }
    .tech-line-1 { width: 1px; height: 100px; top: 50px; left: 100px; }
    .tech-line-2 { width: 1px; height: 100px; bottom: 50px; right: 100px; }
    .tech-line-3 { width: 100px; height: 1px; top: 100px; left: 50px; }
    .tech-line-4 { width: 100px; height: 1px; bottom: 100px; right: 50px; }

    /* Dark Theme Extra Effects */
    .scanlines {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1));
        background-size: 100% 4px; z-index: 2; pointer-events: none;
    }

    .glitch { position: relative; }
    .glitch::before, .glitch::after { content: attr(data-text); position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
    .glitch::before { left: 2px; text-shadow: -1px 0 #ff00c1; clip: rect(44px, 450px, 56px, 0); animation: glitch-anim 5s infinite linear alternate-reverse; }
    .glitch::after { left: -2px; text-shadow: -1px 0 #00fff9; clip: rect(44px, 450px, 56px, 0); animation: glitch-anim2 5s infinite linear alternate-reverse; }

    @keyframes load { 0% { width: 0%; } 100% { width: 85%; } }
    @keyframes load-bar { 0% { width: 0%; } 100% { width: 70%; } }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
    @keyframes hologram-pulse { 0%, 100% { opacity: 0.9; } 50% { opacity: 1; } }
    @keyframes rotate { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
    @keyframes glitch-anim { 0% { clip: rect(12px, 9999px, 32px, 0); } 100% { clip: rect(45px, 9999px, 60px, 0); } }
    @keyframes glitch-anim2 { 0% { clip: rect(65px, 9999px, 80px, 0); } 100% { clip: rect(5px, 9999px, 20px, 0); } }
    
    .fade-in { animation: fadeIn 0.5s ease-in; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
