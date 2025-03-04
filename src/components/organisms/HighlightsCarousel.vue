<!-- HighlightsCarousel.vue -->
<template>
  <section class="mt-0 mb-10 relative" ref="carouselSection">
    <h2 class="text-xl font-bold text-[#2c3e50] mb-4 text-center sr-only">Destacados</h2>
    <div class="relative overflow-hidden">
      <!-- Botón de navegación izquierda -->
      <button
        @click="scrollLeft"
        class="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full z-10 hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-[#02bcae] transition-all duration-200"
        aria-label="Desplazar carrusel a la izquierda"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      <!-- Contenido del carrusel -->
      <div
        ref="carousel"
        class="flex overflow-x-auto space-x-4 scrollbar-hide snap-x snap-mandatory px-4 transition-all duration-300 ease-in-out"
        @wheel="handleWheel"
      >
        <div
          v-for="highlight in highlights"
          :key="highlight.id"
          class="min-w-[160px] bg-white p-3 rounded-lg shadow-md snap-center border border-gray-100 hover:shadow-lg transition-shadow duration-200"
        >
          <img
            :src="highlight.thumbnail"
            :alt="highlight.title"
            class="w-full h-24 object-cover rounded-lg"
            loading="lazy"
          />
          <p class="mt-2 text-sm text-gray-700 font-bold text-center">{{ highlight.title }}</p>
        </div>
      </div>
      <!-- Botón de navegación derecha -->
      <button
        @click="scrollRight"
        class="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full z-10 hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-[#02bcae] transition-all duration-200"
        aria-label="Desplazar carrusel a la derecha"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

defineProps(['highlights']);

const carousel = ref(null);
const carouselSection = ref(null);

const scrollLeft = () => {
  if (carousel.value) {
    carousel.value.scrollBy({ left: -320, behavior: 'smooth' }); // Desplaza 320px a la izquierda
  }
};

const scrollRight = () => {
  if (carousel.value) {
    carousel.value.scrollBy({ left: 320, behavior: 'smooth' }); // Desplaza 320px a la derecha
  }
};

const handleWheel = (event) => {
  event.preventDefault();
  if (carousel.value) {
    const delta = event.deltaY * 2; // Multiplicamos para un desplazamiento más natural
    carousel.value.scrollBy({ left: delta, behavior: 'smooth' });
  }
};

// Añadir y remover el evento de rueda del ratón
onMounted(() => {
  if (carouselSection.value) {
    carouselSection.value.addEventListener('wheel', handleWheel, { passive: false });
  }
});

onUnmounted(() => {
  if (carouselSection.value) {
    carouselSection.value.removeEventListener('wheel', handleWheel);
  }
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