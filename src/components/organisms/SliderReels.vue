<template>
  <div class="relative overflow-hidden">
    <!-- Botón de navegación izquierda -->
    <button
      v-if="showLeftArrow"
      @click="scrollLeft"
      class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-300/60 dark:bg-gray-800/60 text-gray-600 dark:text-white w-10 h-10 flex items-center justify-center rounded-full z-10 hover:bg-gray-300/80 dark:hover:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary transition-all duration-200"
      aria-label="Desplazar carrusel a la izquierda"
    >
      <i class="fa-solid fa-chevron-left text-lg"></i>
    </button>

    <!-- Contenido del carrusel -->
    <div
      ref="carousel"
      class="flex overflow-x-auto space-x-4 scrollbar-hide snap-x snap-mandatory px-4 transition-all duration-300 ease-in-out py-3"
      @wheel="handleWheel"
      @scroll="updateArrowVisibility"
    >
      <!-- Card para agregar nuevo reel -->
      <div
        v-if="isAuthenticated"
        class="min-w-[160px] bg-gray-50 dark:bg-gray-600 p-4 rounded-lg shadow-md snap-center border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer"
        @click="emit('show-upload')"
      >
        <div class="w-full h-24 flex flex-col items-center justify-center gap-2">
          <div class="flex items-center justify-center w-12 h-12 bg-gray-200 dark:bg-gray-500 rounded-full">
            <i class="fa-solid fa-plus text-xl text-gray-500 dark:text-gray-100"></i>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-100 font-medium text-center">Agregar Reel</p>
        </div>
      </div>

      <!-- Cards de reels existentes -->
      <div
        v-for="reel in reels"
        :key="reel.id"
        class="min-w-[180px] bg-white dark:bg-gray-700 rounded-lg shadow-md snap-center border border-gray-200 dark:border-gray-600 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group relative"
        @click="emit('open-reel', reel)"
      >
        <!-- Imagen del reel -->
        <div class="relative">
          <img
            :src="reel.thumbnailUrl"
            :alt="reel.title"
            class="w-full h-28 object-cover rounded-t-lg"
            loading="lazy"
          />
          <!-- Overlay para efecto moderno -->
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-t-lg transition-opacity duration-300"></div>
        </div>

        <!-- Título del reel -->
        <p class="mt-2 px-3 text-sm text-gray-700 dark:text-gray-300 font-semibold text-center line-clamp-2">
          {{ reel.title }}
        </p>

        <!-- Información del usuario (fija en la parte inferior) -->
        <div class="absolute bottom-0 left-0 right-0 flex items-center space-x-2 px-3 py-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-600 rounded-b-lg">
          <img
            :src="reel.user.photoURL"
            :alt="reel.user.displayName"
            class="w-6 h-6 rounded-full object-cover border border-gray-300 dark:border-gray-500"
            loading="lazy"
          />
          <p class="text-xs text-gray-800 dark:text-gray-200 font-medium truncate">
            {{ reel.user.displayName }}
          </p>
        </div>
      </div>
    </div>

    <!-- Botón de navegación derecha -->
    <button
      v-if="showRightArrow"
      @click="scrollRight"
      class="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-300/60 dark:bg-gray-800/60 text-gray-600 dark:text-white w-10 h-10 flex items-center justify-center rounded-full z-10 hover:bg-gray-300/80 dark:hover:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary transition-all duration-200"
      aria-label="Desplazar carrusel a la derecha"
    >
      <i class="fa-solid fa-chevron-right text-xl"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, defineEmits, nextTick } from 'vue';

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

onUnmounted(() => {});
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