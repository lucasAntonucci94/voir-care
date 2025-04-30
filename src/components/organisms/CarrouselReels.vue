<template>
  <section class="mt-0 mb-5 relative" ref="carouselSection">
    <h2 class="text-xl font-bold text-[#2c3e50] mb-4 text-center sr-only">Destacados</h2>
    <!-- Carrousel Slider Content -->
    <SliderReels
      :reels="reelsStore.reels"
      :is-authenticated="isAuthenticated"
      :is-view-modal-open="showViewModal"
      @show-upload="openCreateModal"
      @open-reel="openViewModal"
    />

    <!-- Modal para subir reel -->
    <CreateReelModal
      :visible="showCreateModal"
      @close="closeCreateModal"
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
import SliderReels from './SliderReels.vue';

// Estado del componente
const { isAuthenticated } = useAuth();
const reelsStore = useReelsStore();
const carouselSection = ref(null);
const showCreateModal = ref(false);
const showViewModal = ref(false);
const selectedReel = ref(null);

// Manejo del modal de creación
const openCreateModal = () => {
  showCreateModal.value = true;
  document.body.style.overflow = 'hidden';
};
const closeCreateModal = () => {
  showCreateModal.value = false;
  document.body.style.overflow = '';
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
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  reelsStore.unsubscribeFromReels();
  window.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});
</script>

<style scoped>
/* Estilo para mejorar la transición del modal */
.fixed {
  transition: opacity 0.3s ease-in-out;
}
.fixed.opacity-0 {
  opacity: 0;
}
</style>