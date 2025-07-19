<template>
  <main class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center py-8 px-4 font-inter">
    <div class="w-full max-w-2xl">
      <!-- Header con botón de volver -->
      <header class="mb-6 flex items-center gap-4">
        <button
          class="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary transition-all duration-200"
          @click="goBack"
          aria-label="Volver a la página anterior"
        >
          <i class="fa-solid fa-arrow-left"></i>
          Volver
        </button>
        <h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-100">Detalles del Reel</h1>
      </header>

      <!-- Contenido del reel -->
      <article v-if="reel && !isLoading" class="w-full">
        <ReelCardSimple :reel="reel" />
      </article>

      <!-- Estado de carga -->
      <div v-if="isLoading" class="text-center text-gray-600 dark:text-gray-400">
        <i class="fa-solid fa-spinner fa-spin text-2xl mr-2"></i>
        Cargando reel...
      </div>

      <!-- Error -->
      <div
        v-if="error"
        class="text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg"
      >
        <i class="fa-solid fa-exclamation-circle mr-2"></i>
        {{ error }}
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useReelsStore } from '../stores/reels';
import ReelCardSimple from '../components/organisms/ReelCardSimple.vue';

const route = useRoute();
const router = useRouter();
const reelsStore = useReelsStore();

const reel = ref(null);
const isLoading = ref(true);
const error = ref(null);

const reelId = computed(() => route.params.id);
debugger
onMounted(async () => {
  try {
    isLoading.value = true;
    error.value = null;

    // Cargar el reel por idDoc usando el store de reels
    const fetchedReel = await reelsStore.getByIdDoc(reelId.value);
    if (fetchedReel) {
      reel.value = {
        ...fetchedReel,
        // Puedes añadir propiedades de estado adicionales si las necesitas en el futuro
        // showComments: false, 
        // showMenu: false,
      };
    } else {
      error.value = 'Reel no encontrado';
    }
  } catch (err) {
    console.error("Error al cargar el reel:", err);
    error.value = 'Error al cargar el reel: ' + err.message;
  } finally {
    isLoading.value = false;
  }
});

function goBack() {
  router.back();
}
</script>

<style scoped>
/* Estilos específicos para la página */
main {
  font-family: 'Inter', sans-serif; /* Asegura la fuente Inter */
}

/* Ajustes responsivos */
@media (max-width: 640px) {
  main {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>