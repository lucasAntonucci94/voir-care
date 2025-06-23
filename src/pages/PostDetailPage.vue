<template>
  <main class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center py-8 px-4">
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
        <h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-100">Detalles del Posteo</h1>
      </header>

      <!-- Contenido del posteo -->
      <article v-if="post && !isLoading" class="w-full">
        <PostCard :post="post" />
      </article>

      <!-- Estado de carga -->
      <div v-if="isLoading" class="text-center text-gray-600 dark:text-gray-400">
        <i class="fa-solid fa-spinner fa-spin text-2xl mr-2"></i>
        Cargando posteo...
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
import { usePostsStore } from '../stores/posts';
import PostCard from '../components/organisms/PostCardSimple.vue';

const route = useRoute();
const router = useRouter();
const postsStore = usePostsStore();

const post = ref(null);
const isLoading = ref(true);
const error = ref(null);

const postId = computed(() => route.params.id);

onMounted(async () => {
  try {
    isLoading.value = true;
    error.value = null;

    // Cargar el posteo por idDoc
    const fetchedPost = await postsStore.getByIdDoc(postId.value);
    if (fetchedPost) {
      post.value = {
        ...fetchedPost,
        showComments: false, // Estado inicial para comentarios
        showMenu: false, // Estado inicial para menú
      };
    } else {
      error.value = 'Posteo no encontrado';
    }
  } catch (err) {
    error.value = 'Error al cargar el posteo: ' + err.message;
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
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
}

/* Ajustes responsivos */
@media (max-width: 640px) {
  main {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>