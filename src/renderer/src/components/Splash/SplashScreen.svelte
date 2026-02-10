<script lang="ts">
  import { onMount } from 'svelte';

  let appVersion = __APP_VERSION__;
  let statusMessage = $state('Cargando tu sistema de archivos en la nube...');
  let logoUrl = $state('/Nuevo_logo_BeCall_2024.png');

  onMount(async () => {
    // Resolver ruta del logo para producción
    if (window.api) {
        try {
            const prodLogo = await window.api.invoke('system:get-resource-path', 'Nuevo_logo_BeCall_2024.png');
            if (prodLogo) logoUrl = prodLogo;
        } catch (e) {
            console.warn('Could not resolve production logo path, falling back to public root');
        }

        window.api.on('splash:status', (msg: string) => {
            statusMessage = msg;
        });
    }
  });
</script>

<svelte:head>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="splash-container">
    <!-- Logo en esquina superior izquierda -->
    <div class="logo-corner">
        <img src={logoUrl} alt="Becall Logo" class="logo-img">
    </div>

    <!-- Nubes animadas de fondo -->
    <div class="clouds-container">
        <div class="cloud cloud-1"></div>
        <div class="cloud cloud-2"></div>
        <div class="cloud cloud-3"></div>
    </div>

    <!-- Nombre de la aplicación -->
    <div class="app-name-container">
        <div class="app-name">
            <span class="be">Be</span><span class="call">call</span><span class="mount">Mount</span>
        </div>
    </div>

    <!-- Animación Carpeta a Nube -->
    <div class="animation-container">
        <i class="material-icons cloud-icon">cloud</i>
        <div class="data-particles">
            <div class="particle"></div>
            <div class="particle"></div>
            <div class="particle"></div>
        </div>
        <i class="material-icons folder-icon">folder</i>
    </div>

    <!-- Indicador de carga -->
    <div class="loading-container">
        <div class="loading-bar">
            <div class="loading-progress"></div>
        </div>
        <div class="loading-text">{statusMessage}</div>
    </div>

    <!-- Información de pie -->
    <div class="version-info">Versión {appVersion}</div>
    <div class="company-info">A Vensure Employer Solutions Company</div>
</div>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Poppins', sans-serif;
        background-color: transparent !important;
        overflow: hidden;
    }

    .splash-container {
        width: 100vw;
        height: 100vh;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
        overflow: hidden;
        padding-top: 140px;
    }

    /* Animación de nubes */
    .clouds-container {
        position: absolute;
        width: 100%;
        height: 100%;
        overflow: hidden;
        z-index: 1;
    }

    .cloud {
        position: absolute;
        background: rgba(20, 124, 141, 0.1);
        border-radius: 50%;
        opacity: 0.6;
        animation: moveClouds linear infinite;
    }

    .cloud::before, .cloud::after {
        content: '';
        position: absolute;
        background: inherit;
        border-radius: 50%;
    }

    .cloud-1 {
        width: 150px;
        height: 60px;
        top: 15%;
        left: -150px;
        animation-duration: 25s;
    }

    .cloud-1::before {
        width: 80px;
        height: 80px;
        top: -40px;
        left: 20px;
    }

    .cloud-1::after {
        width: 100px;
        height: 100px;
        top: -50px;
        left: 60px;
    }

    .cloud-2 {
        width: 120px;
        height: 50px;
        top: 25%;
        left: -120px;
        animation-duration: 30s;
        animation-delay: 5s;
        background: rgba(247, 167, 49, 0.1);
    }

    .cloud-3 {
        width: 180px;
        height: 70px;
        top: 60%;
        left: -180px;
        animation-duration: 35s;
        animation-delay: 10s;
        background: rgba(20, 124, 141, 0.08);
    }

    @keyframes moveClouds {
        0% { transform: translateX(0); }
        100% { transform: translateX(calc(100vw + 300px)); }
    }

    /* Logo en esquina superior izquierda */
    .logo-corner {
        position: absolute;
        top: 50px;
        left: 60px;
        z-index: 10;
    }

    .logo-img {
        width: 220px;
        height: auto;
    }

    /* Nombre de la aplicación */
    .app-name-container {
        position: relative;
        z-index: 10;
        text-align: center;
        margin-top: 40px;
        margin-bottom: 50px;
    }

    .app-name {
        font-family: 'Poppins', sans-serif;
        font-size: 84px;
        font-weight: 600;
        color: #333;
        letter-spacing: 4px;
        line-height: 1.2;
    }

    .app-name .be { color: #147C8D; }
    .app-name .call { color: #F7A731; }
    .app-name .mount {
        font-weight: 300;
        color: #666;
        font-size: 72px;
    }

    /* Contenedor de animación */
    .animation-container {
        position: relative;
        z-index: 10;
        width: 400px;
        height: 280px;
        display: flex;
        justify-content: center;
        align-items: flex-end;
        margin-bottom: 60px;
    }

    .cloud-icon {
        position: absolute;
        top: 20px;
        color: #147C8D;
        font-size: 140px;
        z-index: 5;
        filter: drop-shadow(0 6px 10px rgba(20, 124, 141, 0.3));
    }

    .folder-icon {
        position: absolute;
        bottom: 20px;
        color: #F7A731;
        font-size: 110px;
        z-index: 5;
    }

    .data-particles {
        position: absolute;
        bottom: 120px;
        width: 100px;
        height: 140px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .particle {
        position: absolute;
        width: 20px;
        height: 24px;
        background: linear-gradient(135deg, #147C8D 0%, #F7A731 100%);
        border-radius: 3px;
        opacity: 0;
        animation: moveParticle 2s infinite;
    }

    .particle:nth-child(1) { left: 20px; animation-delay: 0s; }
    .particle:nth-child(2) { left: 45px; animation-delay: 0.5s; }
    .particle:nth-child(3) { left: 70px; animation-delay: 1s; }

    @keyframes moveParticle {
        0% { opacity: 0; transform: translateY(0) scale(0.8); }
        20% { opacity: 1; }
        80% { opacity: 1; }
        100% { opacity: 0; transform: translateY(-140px) scale(0.5); }
    }

    /* Indicador de carga */
    .loading-container {
        position: relative;
        z-index: 10;
        text-align: center;
    }

    .loading-bar {
        width: 400px;
        height: 8px;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        overflow: hidden;
        margin-top: 20px;
    }

    .loading-progress {
        height: 100%;
        background: linear-gradient(90deg, #147C8D 0%, #F7A731 100%);
        width: 0%;
        animation: loading 3s ease-in-out forwards;
    }

    .loading-text {
        color: #666;
        font-size: 20px;
        margin-top: 15px;
        letter-spacing: 0.5px;
    }

    @keyframes loading {
        0% { width: 0%; }
        100% { width: 100%; }
    }

    .version-info {
        position: absolute;
        bottom: 40px;
        right: 60px;
        color: #999;
        font-size: 16px;
        z-index: 10;
    }

    .company-info {
        position: absolute;
        bottom: 40px;
        left: 60px;
        color: #999;
        font-size: 16px;
        z-index: 10;
    }
</style>