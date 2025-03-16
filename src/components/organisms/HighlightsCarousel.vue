<!-- HighlightsCarousel.vue -->
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
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>

      <!-- Contenido del carrusel -->
      <div
        ref="carousel"
        class="flex overflow-x-auto space-x-4 scrollbar-hide snap-x snap-mandatory px-4 transition-all duration-300 ease-in-out"
        @wheel="handleWheel"
        @scroll="updateArrowVisibility"
      >
        <!-- Card para agregar nuevo reel (solo usuarios autenticados) -->
        <div
          v-if="isAuthenticated"
          class="min-w-[160px] bg-gray-50 p-3 rounded-lg shadow-md snap-center border border-gray-200 hover:shadow-lg hover:bg-gray-100 transition-all duration-200 cursor-pointer"
          @click="showModal = true"
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
          v-for="highlight in highlights"
          :key="highlight.id"
          class="min-w-[160px] bg-white p-3 rounded-lg shadow-md snap-center border border-gray-100 hover:shadow-lg transition-all duration-200 cursor-pointer"
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
        v-if="showRightArrow"
        @click="scrollRight"
        class="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full z-10 hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
        aria-label="Desplazar carrusel a la derecha"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
    </div>

    <!-- Modal para agregar reel -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-101 transition-opacity duration-300"
      @click.self="showModal = false"
    >
      <div class="bg-white p-6 rounded-lg w-full max-w-md">
        <h3 class="text-lg font-bold mb-4">Subir Nuevo Reel</h3>
        <form @submit.prevent="uploadReel">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              v-model="newReel.title"
              type="text"
              class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Archivo (imagen/video)</label>
            <input
              type="file"
              accept="image/*,video/*"
              @change="handleFileUpload"
              class="w-full p-2 border rounded-lg"
              required
            />
          </div>
          <div class="flex justify-end space-x-2">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90"
            >
              Subir
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// Estado del componente
const highlights = ref([
  { id: 1, title: 'Reel: Adopción', thumbnail: 'https://firebasestorage.googleapis.com/v0/b/parcialcwantonucci.appspot.com/o/profile%2Flucas.e.antonucci%40gmail.com.jpg?alt=media&token=a8d69477-990e-4e3d-bba3-8a19a83fccd4' },
  // ... resto de los items
]);
const carousel = ref(null);
const carouselSection = ref(null);
const showModal = ref(false);
const newReel = ref({ title: '', file: null });
const isAuthenticated = ref(true); // Integrar con tu sistema de autenticación
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
  event.preventDefault();
  if (carousel.value) {
    const delta = event.deltaY * 2;
    carousel.value.scrollBy({ left: delta, behavior: 'smooth' });
  }
};

// Actualizar visibilidad de flechas
const updateArrowVisibility = () => {
  if (!carousel.value) return;
  const { scrollLeft, scrollWidth, clientWidth } = carousel.value;
  showLeftArrow.value = scrollLeft > 0;
  showRightArrow.value = scrollLeft < scrollWidth - clientWidth - 1; // -1 para margen de error
};

// Manejo de subida de archivo
const handleFileUpload = (event) => {
  newReel.value.file = event.target.files[0];
};

const uploadReel = async () => {
  if (!newReel.value.title || !newReel.value.file) return;
  const thumbnail = URL.createObjectURL(newReel.value.file);
  highlights.value.push({
    id: highlights.value.length + 1,
    title: newReel.value.title,
    thumbnail,
  });
  newReel.value = { title: '', file: null };
  showModal.value = false;
  setTimeout(updateArrowVisibility, 100); // Actualizar flechas tras añadir reel
};

// Ciclo de vida
onMounted(() => {
  if (carouselSection.value) {
    carouselSection.value.addEventListener('wheel', handleWheel, { passive: false });
  }
  updateArrowVisibility(); // Estado inicial
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
.bg-primary {
  background-color: #2c3e50;
}
</style>