<script lang="ts">
  let { onclick } = $props<{ onclick: () => void }>();
</script>

<button
  class="fixed bottom-20 right-6 w-16 h-16 rounded-full !bg-gradient-to-t !from-brand-green !to-brand-green/70 backdrop-blur-md border border-white/40 text-white text-4xl shadow-glass-lg flex items-center justify-center z-50 transition-all duration-300 hover:scale-110 active:scale-90 cursor-pointer"
  {onclick}
  aria-label="Añadir servicio"
>
  <span class="mb-1">+</span>
</button>
