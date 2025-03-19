<template>
    <div class="relative overflow-hidden">
      <!-- Botón de navegación izquierda -->
      <button
        v-if="showLeftArrow"
        @click="scrollLeft"
        class="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full z-10 hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
        aria-label="Desplazar carrusel a la izquierda"
      >
        <i class="fa-solid fa-chevron-left text-xl"></i>
      </button>
  
      <!-- Contenido del carrusel -->
      <div
        ref="carousel"
        class="flex overflow-x-auto space-x-4 scrollbar-hide snap-x snap-mandatory px-4 transition-all duration-300 ease-in-out"
        @wheel="handleWheel"
        @scroll="updateArrowVisibility"
      >
        <!-- Card para agregar nuevo reel -->
        <div
          v-if="isAuthenticated"
          class="min-w-[160px] bg-gray-50 p-3 rounded-lg shadow-md snap-center border border-gray-200 hover:shadow-lg hover:bg-gray-100 transition-all duration-200 cursor-pointer"
          @click="emit('show-upload')"
        >
          <div class="w-full h-24 flex flex-col items-center justify-center">
            <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            <p class="mt-2 text-sm text-gray-600 font-medium text-center">Agregar Reel</p>
          </div>
        </div>
  
        <!-- Cards de reels existentes -->
        <div
          v-for="reel in reels"
          :key="reel.id"
          class="min-w-[160px] bg-white p-3 rounded-lg shadow-md snap-center border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer"
          @click="emit('open-reel', reel)"
        >
          <img
            :src="reel.thumbnailUrl"
            :alt="reel.title"
            class="w-full h-24 rounded-lg object-cover"
            loading="lazy"
          />
          <p class="mt-2 text-sm text-gray-700 font-bold text-center">{{ reel.title }}</p>
        </div>
      </div>
  
      <!-- Botón de navegación derecha -->
      <button
        v-if="showRightArrow"
        @click="scrollRight"
        class="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full z-10 hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
        aria-label="Desplazar carrusel a la derecha"
      >
        <i class="fa-solid fa-chevron-right text-xl"></i>
      </button>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted, watch, defineProps, defineEmits, nextTick } from 'vue';
  
  // Props y eventos
  const props = defineProps({
    reels: {
      type: Array,
      required: true,
    },
    isAuthenticated: {
      type: Boolean,
      required: true,
    },
    isViewModalOpen: {
      type: Boolean,
      default: false,
    },
  });
  
  const emit = defineEmits(['show-upload', 'open-reel']);
  
  // Estado
  const carousel = ref(null);
  const showLeftArrow = ref(false);
  const showRightArrow = ref(true);
  
  // Funciones de navegación
  const scrollLeft = () => {
    if (carousel.value) {
      carousel.value.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (carousel.value) {
      carousel.value.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };
  
  const handleWheel = (event) => {
    if (!props.isViewModalOpen) {
      event.preventDefault();
      if (carousel.value) {
        const delta = event.deltaY * 2;
        carousel.value.scrollBy({ left: delta, behavior: 'smooth' });
      }
    }
  };
  
  const updateArrowVisibility = () => {
    if (!carousel.value) return;
    const { scrollLeft, scrollWidth, clientWidth } = carousel.value;
    showLeftArrow.value = scrollLeft > 0;
    showRightArrow.value = scrollLeft < scrollWidth - clientWidth - 1;
  };
  
  // Observar cambios en los reels para actualizar las flechas
  watch(
    () => props.reels,
    () => {
      nextTick(() => {
        updateArrowVisibility();
      });
    },
    { deep: true }
  );
  
  // Ciclo de vida
  onMounted(() => {
    nextTick(() => {
      updateArrowVisibility();
    });
  });
  
  onUnmounted(() => {
    // No necesitamos remover eventos aquí porque se manejan directamente en el template
  });
  </script>
  
  <style scoped>
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  </style>