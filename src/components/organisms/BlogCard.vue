<template>
  <div
    class="bg-gray-100 dark:bg-gray-700 rounded-xl shadow-md overflow-hidden w-full border border-gray-200 dark:border-gray-600 transition hover:shadow-lg hover:-translate-y-1 cursor-pointer"
    @click="goToBlogDetail"
    role="article"
    :aria-label="`Ver detalles del blog ${blog.title}`"
  >
    <!-- Imagen con badge -->
    <div v-if="blog?.image" class="h-40 w-full relative">
      <img
        :src="blog.image"
        :alt="blog.title"
        class="w-full h-full object-cover"
        loading="lazy"
      />
      <!-- Badge en la esquina superior derecha -->
      <span
        v-if="blog.type === 1"
        class="absolute top-2 right-2 text-xs px-2 py-1 rounded-full bg-primary dark:bg-secondary text-white font-medium shadow-sm z-10"
      >
        Premium
      </span>
    </div>
    <!-- Badge sin imagen -->
    <div v-else class="relative">
      <span
        v-if="blog.type === 0"
        class="absolute top-2 right-2 text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 shadow-sm z-10"
      >
        Free
      </span>
      <span
        v-else-if="blog.type === 1"
        class="absolute top-2 right-2 text-xs px-2 py-1 rounded-full bg-yellow-400 dark:bg-yellow-500 text-gray-900 dark:text-gray-900 font-medium shadow-sm z-10"
      >
        Premium
      </span>
    </div>

    <!-- Contenido -->
    <div class="p-4 space-y-3 text-sm text-gray-800 dark:text-gray-200">
      <h3 class="text-lg font-semibold">{{ blog.title }}</h3>
      <p class="line-clamp-2 text-xs text-gray-600 dark:text-gray-300">
        {{ blog.summary }}
      </p>
    </div>

    <!-- Categorías -->
    <div class="p-4 pt-0 flex items-center justify-between flex-wrap gap-y-2">
      <div class="flex flex-wrap gap-2">
        <span
          v-for="category in blog.categories"
          :key="category"
          class="text-xs px-2 py-1 rounded-full bg-teal-200 text-teal-900 dark:bg-teal-600 dark:text-white"
        >
          {{ category.name }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const props = defineProps({
  blog: {
    type: Object,
    required: true,
  },
});

const router = useRouter();

const goToBlogDetail = () => {
  router.push(`/blog/${props.blog?.id}`);
};
</script>

<style scoped>
/* Estilos para consistencia */
main {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
}

/* Ajustes responsivos */
@media (max-width: 640px) {
  div[role="article"] {
    padding: 1rem;
  }

  /* Reducir tamaño del badge en pantallas pequeñas */
  .absolute.top-2.right-2 {
    font-size: 0.65rem;
    padding: 0.25rem 0.5rem;
  }
}
</style>