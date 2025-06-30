<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-opacity duration-300"
    :class="{ 'opacity-0': !visible, 'opacity-100': visible }"
    @click.self="closeModal"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="modalTitleId"
    @keydown.esc="closeModal"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto scrollbar-thin transform transition-all duration-300"
      :class="{ 'scale-90 opacity-0': !visible, 'scale-100 opacity-100': visible }"
    >
      <!-- Modal Header -->
      <div class="sticky top-0 bg-white dark:bg-gray-800 z-10 p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 :id="modalTitleId" class="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Detalles del Posteo
        </h2>
        <button
          class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 transition-colors duration-200"
          @click="closeModal"
          aria-label="Cerrar modal"
        >
          <i class="fa-solid fa-xmark w-5 h-5"></i>
        </button>
      </div>

      <!-- Modal Content -->
      <div class="p-6 space-y-6">
        <!-- Detalles -->
        <dl class="grid grid-cols-1 gap-y-4 text-base text-gray-700 dark:text-gray-300">
          <div class="flex justify-between items-start">
            <dt class="font-medium">ID Doc:</dt>
            <dd class="text-right">{{ post.idDoc || 'N/A' }}</dd>
          </div>
          <div class="flex justify-between items-start">
            <dt class="font-medium">ID:</dt>
            <dd class="text-right">{{ post.id || 'N/A' }}</dd>
          </div>
          <div class="flex justify-between items-start">
            <dt class="font-medium">Título:</dt>
            <dd class="text-right">{{ post.title || 'Sin título' }}</dd>
          </div>
          <div class="flex justify-between items-start">
            <dt class="font-medium">Contenido:</dt>
            <dd class="text-right max-w-[60%]">{{ post.body || 'Sin contenido' }}</dd>
          </div>
          <div class="flex justify-between items-start">
            <dt class="font-medium">Autor:</dt>
            <dd class="text-right">{{ post.user.displayName || 'N/A' }}</dd>
          </div>
          <div class="flex justify-between items-start">
            <dt class="font-medium">Categorías:</dt>
            <dd class="text-right">{{ post.categories?.length ? post.categories.map(cat => cat.name).join(', ') : 'N/A' }}</dd>
          </div>
          <div class="flex justify-between items-start">
            <dt class="font-medium">Fecha de Creación:</dt>
            <dd class="text-right">{{ formatDate(post.created_at) }}</dd>
          </div>
          <div class="flex justify-between items-start">
            <dt class="font-medium">Likes:</dt>
            <dd class="text-right">{{ post.likes?.length || 0 }}</dd>
          </div>
        </dl>

        <!-- Media Section -->
        <div v-if="post.media" class="space-y-2">
          <h3 class="text-lg font-medium text-gray-800 dark:text-gray-100">Media</h3>
          <div class="relative bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden shadow-sm">
            <img
              v-if="isImage"
              :src="post.media.url"
              :alt="`Media del posteo ${post.title || 'sin título'}`"
              class="w-full h-64 object-cover"
              loading="lazy"
            />
            <video
              v-else-if="isVideo"
              :src="post.media.url"
              controls
              class="w-full h-64"
              :aria-label="`Video del posteo ${post.title || 'sin título'}`"
            ></video>
            <div
              v-else
              class="p-4 text-center text-gray-500 dark:text-gray-400"
            >
              Tipo de media no soportado
            </div>
          </div>
        </div>
        <div v-else class="text-gray-500 dark:text-gray-400 text-center">
          No hay media disponible
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
        <button
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary transition-all duration-200 flex items-center gap-2"
          @click="closeModal"
          aria-label="Cerrar modal"
        >
          <i class="fa-solid fa-times"></i>
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  post: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['close']);

const modalTitleId = computed(() => `modal-title-${Math.random().toString(36).substring(7)}`);

const isImage = computed(() => {
  if (!props.post.media?.url) return false;
  return props.post.media.type === 'image' || props.post.media.url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
});

const isVideo = computed(() => {
  if (!props.post.media?.url) return false;
  return props.post.media.type === 'video' || props.post.media.url.match(/\.(mp4|webm|ogg)$/i);
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

const closeModal = () => {
  emit('close');
};
</script>

<style scoped>
/* Custom scrollbar */
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(155, 155, 155, 0.5);
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

/* Primary and secondary colors */
.bg-primary {
  background-color: var(--color-primary, #02bcae);
}

.bg-primary:hover {
  background-color: var(--color-primary-md, #019a8e);
}

.bg-secondary {
  background-color: var(--color-secondary, #F28C38);
}

.bg-secondary:hover {
  background-color: var(--color-secondary-md, #D8690E);
}

.text-primary {
  color: var(--color-primary, #02bcae);
}

.text-primary:hover {
  color: var(--color-primary-md, #019a8e);
}

.text-secondary {
  color: var(--color-secondary, #F28C38);
}

.text-secondary:hover {
  color: var(--color-secondary-md, #D8690E);
}

/* Focus ring */
.focus\:ring-primary:focus {
  --tw-ring-color: var(--color-primary, #02bcae);
}

.dark .focus\:ring-secondary:focus {
  --tw-ring-color: var(--color-secondary, #F28C38);
}

/* Media container */
.media-container {
  max-height: 384px; /* 96 * 4 for consistency */
  overflow: hidden;
  border: 1px solid #9ca3af; /* gray-400 */
  border-radius: 0.375rem;
}

.dark .media-container {
  border-color: #1f2937; /* gray-800 */
}
</style>