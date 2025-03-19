<template>
    <div
      v-if="visible"
      class="fixed inset-0 bg-black/80 flex items-center justify-center z-101 transition-opacity duration-300 overflow-y-auto"
      @wheel="handleModalWheel"
      @click.self="closeModal"
      tabindex="0"
      ref="viewModal"
    >
      <div
        class="relative flex w-full max-w-4xl sm:max-w-3xl xs:max-w-[95%] bg-white rounded-xl shadow-2xl transform transition-all duration-200"
      >
        <!-- Contenido multimedia (centro) -->
        <div class="flex-1 flex items-center justify-center p-4 relative">
          <div v-if="reel.mediaType === 'image'" class="media-container">
            <img
              :src="reel.mediaUrl"
              :alt="reel.title"
              class="max-w-full max-h-[80vh] rounded-lg object-contain"
            />
          </div>
          <div v-else-if="reel.mediaType === 'video'" class="media-container">
            <video
              :src="reel.mediaUrl"
              controls
              class="max-w-full max-h-[80vh] rounded-lg object-contain"
            ></video>
          </div>
  
          <!-- Flechas de navegación dentro del contenedor multimedia -->
          <button
            v-if="hasPreviousReel"
            @click.stop="previousReel"
            class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 z-10"
            aria-label="Reel anterior"
          >
            <i class="fa-solid fa-chevron-left text-xl"></i>
          </button>
          <button
            v-if="hasNextReel"
            @click.stop="nextReel"
            class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 z-10"
            aria-label="Siguiente reel"
          >
            <i class="fa-solid fa-chevron-right text-xl"></i>
          </button>
        </div>
  
        <!-- Columna derecha con datos -->
        <div class="w-80 sm:w-72 xs:w-64 bg-gray-50 p-4 flex flex-col justify-between relative">
          <div>
            <h3 class="text-xl font-bold mb-4 text-gray-800">{{ reel.title }}</h3>
            <div class="text-sm text-gray-600 space-y-2">
              <p><span class="font-semibold">Subido por:</span> {{ reel.user.displayName }}</p>
              <p><span class="font-semibold">Fecha:</span> {{ formatDate(reel.createdAt) }}</p>
              <p><span class="font-semibold">Visualizaciones:</span> {{ reel.views }}</p>
              <p><span class="font-semibold">Me gusta:</span> {{ reel.likes.length }}</p>
            </div>
          </div>
  
          <!-- Botón de cierre (esquina superior derecha) -->
          <button
            @click="closeModal"
            class="absolute top-2 right-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            aria-label="Cerrar modal"
          >
            <i class="fa-solid fa-times text-2xl"></i>
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
      required: true,
    },
    reels: {
      type: Array,
      required: true,
    },
  });
  
  const emit = defineEmits(['close', 'update-reel']);
  
  // Estado
  const viewModal = ref(null);
  
  // Funciones
  const handleModalWheel = (event) => {
    event.stopPropagation(); // Evitar que el evento de rueda llegue al carrusel
  };
  
  const closeModal = () => {
    emit('close');
  };
  
  const currentReelIndex = computed(() => {
    return props.reel ? props.reels.findIndex((r) => r.id === props.reel.id) : -1;
  });
  
  const hasPreviousReel = computed(() => currentReelIndex.value > 0);
  const hasNextReel = computed(() => currentReelIndex.value < props.reels.length - 1);
  
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
        viewModal.value.focus(); // Dar foco al modal cuando se abre
      }
    });
  });
  </script>
  
  <style scoped>
  /* Contenedor de medios en el modal */
  .media-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    max-height: 70vh; /* Limitar altura máxima */
  }
  
  /* Estilo para mejorar la transición del modal */
  .fixed {
    transition: opacity 0.3s ease-in-out;
  }
  
  /* Media queries para móviles */
  @media (max-width: 640px) {
    .media-container {
      max-height: 50vh; /* Reducir altura máxima en móviles */
    }
  }
  </style>