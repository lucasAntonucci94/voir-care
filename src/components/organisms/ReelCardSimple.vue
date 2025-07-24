<template>
  <article
    class="bg-white dark:bg-gray-800 text-gray-600 dark:text-white p-4 rounded-lg shadow-md w-full max-w-sm mx-auto flex flex-col font-inter"
  >
    <!-- Contenido Multimedia del Reel (Video o Imagen) - Principal y Centrado -->
    <div v-if="reel?.mediaUrl" class="relative w-full overflow-hidden rounded-lg mb-4 flex-grow flex items-center justify-center bg-black">
      <video
        v-if="reel?.mediaType && reel.mediaType.startsWith('video')"
        :src="reel.mediaUrl"
        :poster="reel.thumbnailUrl || ImageFallback"
        controls
        class="w-full h-auto max-h-[70vh] object-contain rounded-lg"
        :aria-label="`Video del reel ${reel?.title || 'sin título'}`"
      ></video>
      <img
        v-else-if="reel?.mediaType && reel.mediaType.startsWith('image')"
        :src="reel.mediaUrl"
        :alt="`Media del reel ${reel?.title || 'sin título'}`"
        class="w-full h-auto max-h-[70vh] object-contain rounded-lg"
        loading="lazy"
      />
      <div v-else class="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">
        <i class="fas fa-exclamation-triangle mr-2"></i> Contenido multimedia no disponible
      </div>
    </div>

    <!-- Información del Usuario y Título - Debajo del Media -->
    <router-link :to="`/profile/${reel?.user?.email}`" class="flex items-center mb-3">
      <img
        :src="reel?.user?.photoURL || AvatarFallback"
        :alt="`Avatar de ${reel?.user?.displayName || 'Usuario Anónimo'}`"
        class="w-10 h-10 rounded-full object-cover mr-3 border-2 border-primary"
      />
      <div>
        <p class="font-semibold text-gray-800 dark:text-gray-100">{{ reel?.user?.displayName || 'Usuario Anónimo' }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          {{ formatTimestamp(reel?.createdAt) }}
        </p>
      </div>
    </router-link>

    <!-- Título del Reel -->
    <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{{ reel?.title || 'Sin título' }}</h3>
    
    <!-- Descripción del Reel (opcional) -->
    <p v-if="reel?.description" class="text-base text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{{ reel?.description }}</p>

    <!-- Acciones (Likes y Vistas) -->
    <div class="flex justify-between items-center mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
      <!-- Likes (deshabilitado por ahora) -->
      <span class="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-sm cursor-not-allowed opacity-50">
        <i class="fas fa-heart text-gray-600 dark:text-gray-400"></i>
        {{ reel?.likes?.length ?? 0 }} Me gusta
      </span>
      <!-- Vistas -->
      <span class="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-sm cursor-default">
        <i class="fas fa-eye text-gray-600 dark:text-gray-400"></i>
        {{ reel?.views ?? 0 }} Vistas
      </span>
    </div>
  </article>
</template>

<script setup>
import { formatTimestamp } from '../../utils/formatTimestamp'; 
import AvatarFallback from '../../assets/avatar1.jpg';
import ImageFallback from '../../assets/fallbackimage.png';

const props = defineProps({
  reel: {
    type: Object,
    default: null,
    required: true,
  },
});
</script>

<style scoped>
/* Estilos para texto con elipsis */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3; /* Limita a 3 líneas */
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>