<template>
  <section class="mt-0 mb-5 relative" ref="carouselSection">
    <h2 class="text-xl font-bold text-[#2c3e50] mb-4 text-center sr-only">Destacados</h2>
    <!-- Carrousel Slider Content -->
    <SliderReels
      :reels="filteredReels"
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
      :reels="filteredReels"
      @close="closeViewModal"
      @update-reel="updateSelectedReel"
    />
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'; // Importamos computed
import { useReelsStore } from '../../stores/reels';
import { useAuth } from '../../api/auth/useAuth';
import CreateReelModal from '../organisms/CreateReelModal.vue';
import ViewReelModal from './ViewReelModal.vue';
import SliderReels from './SliderReels.vue';

// Estado del componente
const { user, isAuthenticated } = useAuth();
const reelsStore = useReelsStore();
const carouselSection = ref(null);
const showCreateModal = ref(false);
const showViewModal = ref(false);
const selectedReel = ref(null);

// Propiedad computada para filtrar y manipular los reels
const filteredReels = computed(() => {
  // Obtenemos el usuario desde useAuth
  const { user } = useAuth();

  // Si no hay usuario autenticado o no hay conexiones, devolvemos un array vacío
  if (!user.value || !user.value.connections || user.value.connections.length === 0) {
    return [];
  }

  // Extraemos los uids de las conexiones
  const connectionUids = user.value.connections
    .map(connection => connection?.uid)
    .filter(uid => uid);

  // Filtramos los reels cuyo user.uid esté en connectionUids y ordenamos por createdAt
  return reelsStore.reels
    .filter(reel => reel.user?.uid &&(connectionUids.includes(reel.user.uid) || reel.user.uid === user.value.uid))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
});

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