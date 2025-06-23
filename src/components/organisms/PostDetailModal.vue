<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="$emit('close')"
  >
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg">
      <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-4">Detalles del Posteo</h2>
      <ul class="text-sm text-gray-700 dark:text-gray-300 space-y-2">
        <li><strong>ID Doc:</strong> {{ post.idDoc }}</li>
        <li><strong>ID:</strong> {{ post.id }}</li>
        <li><strong>Título:</strong> {{ post.title || 'Sin título' }}</li>
        <li><strong>Contenido:</strong> {{ post.body || 'Sin contenido' }}</li>
        <li><strong>Autor:</strong> {{ post.userId || 'N/A' }}</li>
        <li><strong>Categorías:</strong> {{ post.categories?.join(', ') || 'N/A' }}</li>
        <li><strong>Fecha de Creación:</strong> {{ formatDate(post.created_at) }}</li>
        <li><strong>Likes:</strong> {{ post.likes?.length || 0 }}</li>
        <li><strong>Media:</strong>
          <span v-if="post.media">
            <a :href="post.media.url" target="_blank" class="text-primary dark:text-secondary hover:underline">
              Ver media
            </a>
          </span>
          <span v-else>No disponible</span>
        </li>
      </ul>
      <div class="mt-6 flex justify-end">
        <button
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
          @click="$emit('close')"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  post: {
    type: Object,
    required: true,
  },
});

const formatDate = (timestamp) => {
  if (!timestamp || !timestamp.toDate) return 'N/A';
  return timestamp.toDate().toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>

<style scoped>
/* Estilos para consistencia */
</style>