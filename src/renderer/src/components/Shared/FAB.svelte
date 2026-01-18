<script lang="ts">
  let { onclick } = $props<{ onclick: () => void }>();
</script>

<button
  class="fixed bottom-20 right-6 w-14 h-14 rounded-full bg-brand-green hover:bg-brand-green-dark text-white text-3xl shadow-lg flex items-center justify-center z-50 transition-transform hover:scale-105 active:scale-95 cursor-pointer border-none"
  {onclick}
  aria-label="Añadir servicio"
>
  +
</button>
