<template>
  <div class="relative flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
    <div class="text-center p-6 sm:p-8 lg:p-12 max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl relative z-10">
      <i class="fas fa-cat text-8xl text-primary dark:text-secondary mb-6 animate-bounce-slow" aria-hidden="true"></i>
      <h1 class="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        Página no encontrada
      </h1>
      <p class="text-lg text-gray-600 dark:text-gray-300 mb-8">
        Lo sentimos, la página que buscas no existe o ha sido movida. ¡Prueba regresar al inicio o explorar otras secciones!
      </p>

      <div class="flex flex-col sm:flex-row justify-center gap-4 mb-8">
        <router-link
          to="/"
          class="px-6 py-3 bg-primary dark:bg-secondary text-white rounded-md hover:bg-primary/80 dark:hover:bg-secondary/80 transition-colors duration-200 font-semibold"
          aria-label="Volver a la página de inicio"
        >
          Volver al inicio
        </router-link>
      </div>

      <div class="text-sm text-gray-600 dark:text-gray-400">
        <p class="mb-2">O explora estas páginas:</p>
        <ul class="flex flex-wrap justify-center gap-4">
          <li>
            <router-link
              to="/termsandconditions"
              target="_blank"
              rel="noopener noreferrer"
              class="underline text-primary dark:text-secondary hover:text-primary/80 dark:hover:text-secondary/80 transition-colors duration-200"
              aria-label="Ver Términos y Condiciones"
            >
              Términos y Condiciones
            </router-link>
          </li>
          <li>
            <router-link
              to="/privacypolicy"
              target="_blank"
              rel="noopener noreferrer"
              class="underline text-primary dark:text-secondary hover:text-primary/80 dark:hover:text-secondary/80 transition-colors duration-200"
              aria-label="Ver Política de Privacidad"
            >
              Política de Privacidad
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
/* Animación del icono de gato */
@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce-slow {
  animation: bounce-slow 2s ease-in-out infinite;
}

/* Estilos de scrollbar */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(155, 155, 155, 0.5);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

/* Fade animation for content */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>