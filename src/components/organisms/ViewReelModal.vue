<template>
    <div
      v-if="visible"
      class="fixed inset-0 bg-black/90 z-101 transition-opacity duration-300 overflow-hidden"
      @click.self="closeModal"
      tabindex="0"
      ref="viewModal"
    >
      <div class="flex h-full w-full">
        <!-- Contenido multimedia (centro, full height) -->
        <div class="flex-1 flex items-center justify-center relative">
          <div v-if="reel?.mediaType === 'image'" class="media-container">
            <img
              :src="reel.mediaUrl"
              :alt="reel.title"
              class="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
          <div v-else-if="reel?.mediaType === 'video'" class="media-container">
            <video
              :src="reel.mediaUrl"
              controls
              autoplay
              class="max-w-full max-h-full object-contain rounded-lg"
            ></video>
          </div>
  
          <!-- Flechas de navegación -->
          <button
            v-if="hasPreviousReel"
            @click.stop="previousReel"
            class="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-60 text-white p-2 md:p-3 rounded-full hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 z-20"
            aria-label="Reel anterior"
          >
            <i class="fa-solid fa-chevron-left text-lg md:text-xl"></i>
          </button>
          <button
            v-if="hasNextReel"
            @click.stop="nextReel"
            class="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-60 text-white p-2 md:p-3 rounded-full hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 z-20"
            aria-label="Siguiente reel"
          >
            <i class="fa-solid fa-chevron-right text-lg md:text-xl"></i>
          </button>
        </div>
  
        <!-- Panel de metadatos (lateral en desktop, inferior en mobile) -->
        <div
          class="w-full md:w-80 bg-gray-900/80 md:bg-gray-50 text-white md:text-gray-800 p-4 md:p-6 flex flex-col justify-between absolute bottom-0 md:static h-40 md:h-auto md:max-h-full overflow-y-auto"
        >
          <div>
            <h3 class="text-lg md:text-xl font-semibold mb-2 md:mb-4">{{ reel?.title }}</h3>
            <div class="text-sm space-y-1 md:space-y-2">
              <p><span class="font-medium">Subido por:</span> {{ reel?.user?.displayName }}</p>
              <p><span class="font-medium">Fecha:</span> {{ formatDate(reel?.createdAt) }}</p>
              <p><span class="font-medium">Visualizaciones:</span> {{ reel?.views }}</p>
              <p><span class="font-medium">Me gusta:</span> {{ reel?.likes?.length }}</p>
            </div>
          </div>
  
          <!-- Botón de cierre -->
          <button
            @click="closeModal"
            class="absolute top-2 right-2 text-gray-300 md:text-gray-600 hover:text-white md:hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            aria-label="Cerrar modal"
          >
            <i class="fa-solid fa-times text-xl md:text-2xl"></i>
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, nextTick, defineProps, defineEmits } from 'vue';
  
  // Props y eventos
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
  
  // Estado
  const viewModal = ref(null);
  
  // Computados
  const currentReelIndex = computed(() => {
    return props.reel ? props.reels.findIndex((r) => r.id === props.reel.id) : -1;
  });
  
  const hasPreviousReel = computed(() => currentReelIndex.value > 0);
  const hasNextReel = computed(() => currentReelIndex.value < props.reels.length - 1);
  
  // Funciones
  const handleModalWheel = (event) => {
    event.stopPropagation();
  };
  
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
  
  const formatDate = (isoString) => {
    return isoString
      ? new Date(isoString).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'Fecha no disponible';
  };
  
  // Ciclo de vida
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
  }
  
  /* Estilos responsivos */
  @media (max-width: 768px) {
    .media-container {
      height: calc(100vh - 10rem); /* Deja espacio para el panel inferior */
    }
  
    .flex {
      flex-direction: column;
    }
  
    .w-80 {
      width: 100%;
      max-height: 10rem; /* Limita la altura del panel inferior en mobile */
    }
  }
  
  /* Scroll en el panel de metadatos */
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
  </style>