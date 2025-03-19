<template>
  <section class="mt-0 mb-10 relative" ref="carouselSection">
    <h2 class="text-xl font-bold text-[#2c3e50] mb-4 text-center sr-only">Destacados</h2>
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
        @wheel="handleCarouselWheel"
        @scroll="updateArrowVisibility"
      >
        <!-- Card para agregar nuevo reel -->
        <div
          v-if="isAuthenticated"
          class="min-w-[160px] bg-gray-50 p-3 rounded-lg shadow-md snap-center border border-gray-200 hover:shadow-lg hover:bg-gray-100 transition-all duration-200 cursor-pointer"
          @click="showUploadModal = true"
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
          v-for="reel in reelsStore.reels"
          :key="reel.id"
          class="min-w-[160px] bg-white p-3 rounded-lg shadow-md snap-center border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer"
          @click="openViewModal(reel)"
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

    <!-- Modal para subir reel -->
    <CreateReelModal
      :visible="showUploadModal"
      @close="showUploadModal = false"
    />

    <!-- Modal para visualizar reel -->
    <ViewReelModal
      :visible="showViewModal"
      :reel="selectedReel"
      :reels="reelsStore.reels"
      @close="closeViewModal"
      @update-reel="updateSelectedReel"
    />
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useReelsStore } from '../../stores/reels';
import { useAuth } from '../../api/auth/useAuth';
import CreateReelModal from '../organisms/CreateReelModal.vue';
import ViewReelModal from './ViewReelModal.vue';

// Estado del componente
const { isAuthenticated } = useAuth();
const reelsStore = useReelsStore();
const carousel = ref(null);
const carouselSection = ref(null);
const showUploadModal = ref(false);
const showViewModal = ref(false);
const selectedReel = ref(null);
const showLeftArrow = ref(false);
const showRightArrow = ref(true);

// Funciones de navegación del carrusel
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

const handleCarouselWheel = (event) => {
  if (!showViewModal.value) {
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

// Manejo del modal de visualización
const openViewModal = (reel) => {
  selectedReel.value = reel;
  showViewModal.value = true;
  document.body.style.overflow = 'hidden';
};

const closeViewModal = () => {
  showViewModal.value = false;
  document.body.style.overflow = '';
};

const updateSelectedReel = (newReel) => {
  selectedReel.value = newReel;
};

// Listener para la tecla "Escape"
const handleKeydown = (event) => {
  if (event.key === 'Escape' && showViewModal.value) {
    closeViewModal();
  }
};

// Ciclo de vida
onMounted(() => {
  reelsStore.subscribeToReels();
  if (carouselSection.value) {
    carouselSection.value.addEventListener('wheel', handleCarouselWheel, { passive: false });
  }
  window.addEventListener('keydown', handleKeydown);
  updateArrowVisibility();
});

onUnmounted(() => {
  reelsStore.unsubscribeFromReels();
  if (carouselSection.value) {
    carouselSection.value.removeEventListener('wheel', handleCarouselWheel);
  }
  window.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
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

/* Estilo para mejorar la transición del modal */
.fixed {
  transition: opacity 0.3s ease-in-out;
}
.fixed.opacity-0 {
  opacity: 0;
}
</style>