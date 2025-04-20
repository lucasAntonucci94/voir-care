<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/95 z-[101] transition-opacity duration-300 overflow-hidden"
    @click.self="closeModal"
    tabindex="0"
    ref="viewModal"
  >
    <div class="flex h-full w-full">
      <!-- Área multimedia: fondo oscuro con gradiente -->
      <div class="flex-1 flex items-center justify-center relative bg-gradient-to-b from-gray-900 to-black">
        <div v-if="reel?.mediaType === 'image'" class="media-container">
          <img
            :src="reel.mediaUrl"
            :alt="reel.title"
            class="max-w-full max-h-full object-contain rounded-2xl shadow-xl border border-gray-800/50"
          />
        </div>
        <div v-else-if="reel?.mediaType === 'video'" class="media-container">
          <video
            :src="reel.mediaUrl"
            controls
            autoplay
            class="max-w-full max-h-full object-contain rounded-2xl shadow-xl border border-gray-800/50"
          ></video>
        </div>
        <!-- Navegación: flechas con diseño más elegante -->
        <button
          v-if="hasPreviousReel"
          @click.stop="previousReel"
          class="absolute left-6 top-1/2 transform -translate-y-1/2 bg-gray-900/80 text-white p-4 rounded-full hover:bg-indigo-600/80 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-300 z-20 shadow-md"
          aria-label="Reel anterior"
        >
          <i class="fa-solid fa-chevron-left text-xl"></i>
        </button>
        <button
          v-if="hasNextReel"
          @click.stop="nextReel"
          class="absolute right-6 top-1/2 transform -translate-y-1/2 bg-gray-900/80 text-white p-4 rounded-full hover:bg-indigo-600/80 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-300 z-20 shadow-md"
          aria-label="Siguiente reel"
        >
          <i class="fa-solid fa-chevron-right text-xl"></i>
        </button>
      </div>

      <!-- Panel de metadatos: lateral con avatar y botón de like -->
      <div
        class="w-full md:w-96 bg-gray-100 dark:bg-gray-800 text-white p-6 flex flex-col justify-between relative rounded-t-2xl md:rounded-l-2xl shadow-2xl overflow-y-auto"
      >
        <div class="space-y-6">
          <!-- Sección del usuario con avatar -->
          <router-link 
            :to="`/profile/${reel?.user?.email}`" 
            class="flex items-center gap-3 rounded"
          >
            <img
              :src="reel?.user?.photoURL || 'https://via.placeholder.com/40'"
              alt="User avatar"
              class="w-12 h-12 rounded-full object-cover border-2 border-primary dark:border-secondary shadow-md"
              />
              <div>
                <p class="text-lg font-semibold text-primary dark:text-secondary">{{ reel?.user?.displayName }}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400">{{ formatTimestamp(reel?.createdAt) }}</p>
              </div>
          </router-link>

          <!-- Título del reel -->
          <h3 class="text-2xl font-bold text-gray-600 dark:text-white tracking-tight">{{ reel?.title }}</h3>

          <!-- Estadísticas -->
          <div class="text-sm space-y-4">
            <p class="flex items-center space-x-2">
              <span class="font-semibold text-gray-600 dark:text-gray-300">Visualizaciones:</span>
              <span class="text-gray-600 dark:text-gray-100 flex items-center">
                {{ reel?.views }}
                <i class="fa-solid fa-eye text-primary dark:text-secondary ml-2"></i>
              </span>
            </p>
            <div class="flex items-center space-x-2">
              <span class="font-semibold text-gray-600 dark:text-gray-300">Me gusta:</span>
              <span class="text-gray-600 dark:text-gray-100">{{ reel?.likes?.length }}</span>
              <button
                @click="toggleLike"
                class="ml-2 p-2 bg-red-300/20 dark:bg-red-600/20 text-red-400 rounded-full hover:bg-red-400/40 dark:hover:bg-red-600/40 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                aria-label="Toggle like"
              >
                <i class="fa-solid fa-heart text-lg"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Botón de cierre -->
        <button
          @click="closeModal"
          class="absolute top-4 right-4 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full p-2 transition-colors duration-300 bg-gray-800/50 hover:bg-gray-700/70"
          aria-label="Cerrar modal"
        >
          <i class="fa-solid fa-times text-2xl"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, defineEmits } from 'vue';
import { formatTimestamp } from '../../utils/formatTimestamp.js';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  reel: {
    type: Object,
    default: null,
  },
  reels: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['close', 'update-reel']);
const viewModal = ref(null);

const currentReelIndex = computed(() => {
  return props.reel ? props.reels.findIndex((r) => r.id === props.reel.id) : -1;
});

const hasPreviousReel = computed(() => currentReelIndex.value > 0);
const hasNextReel = computed(() => currentReelIndex.value < props.reels.length - 1);

const closeModal = () => {
  emit('close');
};

const previousReel = () => {
  if (hasPreviousReel.value) {
    emit('update-reel', props.reels[currentReelIndex.value - 1]);
  }
};

const nextReel = () => {
  if (hasNextReel.value) {
    emit('update-reel', props.reels[currentReelIndex.value + 1]);
  }
};

// Función placeholder para el botón de "Like" (deberías integrarla con tu lógica real)
const toggleLike = () => {
  console.log('Toggle like for reel:', props.reel.id);
  // Aquí iría la lógica para agregar/quitar like, por ejemplo, usando useReels
};

onMounted(() => {
  nextTick(() => {
    if (viewModal.value && props.visible) {
      viewModal.value.focus();
    }
  });
});
</script>

<style scoped>
/* Transición del modal */
.fixed {
  transition: opacity 0.3s ease-in-out;
}

/* Contenedor de medios */
.media-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4));
}

/* Estilos responsivos para mobile */
@media (max-width: 768px) {
  .media-container {
    height: calc(100vh - 14rem); /* Más espacio para el panel inferior */
  }
  .flex {
    flex-direction: column;
  }
  .w-96 {
    width: 100%;
    max-height: 14rem;
  }
}

/* Scroll personalizado en el panel de metadatos */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
</style>