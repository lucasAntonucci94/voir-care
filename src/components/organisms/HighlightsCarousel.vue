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
            class="w-full h-24 object-cover rounded-lg"
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
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
    </div>

    <!-- Modal para subir reel -->
    <div
      v-if="showUploadModal"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-101 transition-opacity duration-300"
      @click.self="showUploadModal = false"
    >
      <div class="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h3 class="text-lg font-bold mb-4 text-gray-800">Subir Nuevo Reel</h3>
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
              @click="showUploadModal = false"
              class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Subir
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal para visualizar reel con flechas -->
    <div
      v-if="showViewModal"
      class="fixed inset-0 bg-black/80 flex items-start justify-center z-101 py-4 transition-opacity duration-300 overflow-y-auto"
      @wheel="handleModalWheel"
      @click.self="closeViewModal"
      tabindex="0"
      ref="viewModal"
    >
      <div
        class="relative bg-white p-6 rounded-xl w-full max-w-3xl sm:max-w-2xl xs:max-w-[90%] shadow-2xl transform transition-all duration-200 my-4"
      >
        <h3 class="text-xl font-bold mb-4 text-gray-800">{{ selectedReel.title }}</h3>
        <div class="mb-6 flex justify-center">
          <div v-if="selectedReel.mediaType === 'image'" class="media-container">
            <img
              :src="selectedReel.mediaUrl"
              :alt="selectedReel.title"
              class="max-w-full max-h-[70vh] rounded-lg object-contain"
            />
          </div>
          <div v-else-if="selectedReel.mediaType === 'video'" class="media-container">
            <video
              :src="selectedReel.mediaUrl"
              controls
              class="max-w-full max-h-[70vh] rounded-lg object-contain"
            ></video>
          </div>
        </div>
        <div class="text-sm text-gray-600 mb-6">
          <p><span class="font-semibold">Subido por:</span> {{ selectedReel.user.displayName }}</p>
          <p><span class="font-semibold">Fecha:</span> {{ formatDate(selectedReel.createdAt) }}</p>
          <p><span class="font-semibold">Visualizaciones:</span> {{ selectedReel.views }}</p>
          <p><span class="font-semibold">Me gusta:</span> {{ selectedReel.likes.length }}</p>
        </div>

        <!-- Flechas de navegación en el modal -->
        <button
          v-if="hasPreviousReel"
          @click.stop="previousReel"
          class="absolute left-2 sm:left-[-50px] top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
          aria-label="Reel anterior"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <button
          v-if="hasNextReel"
          @click.stop="nextReel"
          class="absolute right-2 sm:right-[-50px] top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
          aria-label="Siguiente reel"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>

        <button
          @click="closeViewModal"
          class="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 w-full text-gray-800 font-medium transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useReelsStore } from '../../stores/reels';
import { useAuth } from '../../api/auth/useAuth';
import { fileToBase64 } from '../../utils/fileToBase64';

// Estado del componente
const { isAuthenticated, user: authUser } = useAuth();
const reelsStore = useReelsStore();
const carousel = ref(null);
const carouselSection = ref(null);
const showUploadModal = ref(false);
const showViewModal = ref(false);
const viewModal = ref(null);
const selectedReel = ref(null);
const newReel = ref({ title: '', base64: null, mediaType: '', thumbnailBase64: null });
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
  if (!showViewModal.value) { // Solo permitir scroll del carrusel si el modal no está abierto
    event.preventDefault();
    if (carousel.value) {
      const delta = event.deltaY * 2;
      carousel.value.scrollBy({ left: delta, behavior: 'smooth' });
    }
  }
};

const handleModalWheel = (event) => {
  event.stopPropagation(); // Evitar que el evento de rueda llegue al carrusel
};

const updateArrowVisibility = () => {
  if (!carousel.value) return;
  const { scrollLeft, scrollWidth, clientWidth } = carousel.value;
  showLeftArrow.value = scrollLeft > 0;
  showRightArrow.value = scrollLeft < scrollWidth - clientWidth - 1;
};

// Generar thumbnail para videos
const generateVideoThumbnail = (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.addEventListener('loadeddata', () => {
      video.currentTime = 1; // Tomar el frame a 1 segundo
    });
    video.addEventListener('seeked', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 90;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg'));
    });
    video.addEventListener('error', (error) => reject(error));
  });
};

// Manejo de subida de archivo
const handleFileUpload = async (event) => {
  try {
    const file = event.target.files[0];
    const { base64, mediaType } = await fileToBase64(event);
    if (base64) {
      newReel.value.base64 = base64;
      newReel.value.mediaType = mediaType;
      newReel.value.thumbnailBase64 = mediaType === 'image' ? base64 : await generateVideoThumbnail(file);
    }
  } catch (error) {
    console.error('Error al procesar archivo o generar thumbnail:', error);
  }
};

// Subida del reel
const uploadReel = async () => {
  if (!newReel.value.title || !newReel.value.base64 || !newReel.value.thumbnailBase64 || !authUser.value) return;

  const user = {
    uid: authUser.value.uid,
    displayName: authUser.value.displayName || authUser.value.email,
    photoURL: authUser.value.photoURL || null,
  };

  await reelsStore.addReel({
    user,
    title: newReel.value.title,
    file: newReel.value.base64,
    mediaType: newReel.value.mediaType,
    thumbnail: newReel.value.thumbnailBase64,
  });

  newReel.value = { title: '', base64: null, mediaType: '', thumbnailBase64: null };
  showUploadModal.value = false;
  setTimeout(updateArrowVisibility, 100);
};

// Navegación y manejo del modal
const openViewModal = (reel) => {
  selectedReel.value = reel;
  showViewModal.value = true;
  document.body.style.overflow = 'hidden'; // Evitar scroll de fondo
  nextTick(() => {
    if (viewModal.value) {
      viewModal.value.focus(); // Dar foco al modal
    }
  });
};

const closeViewModal = () => {
  showViewModal.value = false;
  document.body.style.overflow = ''; // Restaurar scroll
};

const currentReelIndex = computed(() => {
  return selectedReel.value ? reelsStore.reels.findIndex((r) => r.id === selectedReel.value.id) : -1;
});

const hasPreviousReel = computed(() => currentReelIndex.value > 0);
const hasNextReel = computed(() => currentReelIndex.value < reelsStore.reels.length - 1);

const previousReel = () => {
  if (hasPreviousReel.value) {
    selectedReel.value = reelsStore.reels[currentReelIndex.value - 1];
  }
};

const nextReel = () => {
  if (hasNextReel.value) {
    selectedReel.value = reelsStore.reels[currentReelIndex.value + 1];
  }
};

// Formatear fecha
const formatDate = (isoString) => {
  return isoString
    ? new Date(isoString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Fecha no disponible';
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
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''; // Asegurar que se restaure al desmontar
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
.fixed.opacity-0 {
  opacity: 0;
}

/* Media queries para móviles */
@media (max-width: 640px) {
  .media-container {
    max-height: 50vh; /* Reducir altura máxima en móviles */
  }
}
</style>