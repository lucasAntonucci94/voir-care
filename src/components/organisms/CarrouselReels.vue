<template>
  <section class="mt-0 mb-5 relative" ref="carouselSection">
    <h2 class="text-xl font-bold text-[#2c3e50] mb-4 text-center sr-only">Destacados</h2>
    <!-- Carrousel Slider Content -->
    <SliderReels
      :reels="filteredReels"
      :is-authenticated="isAuthenticated"
      :auth-user="user"
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
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useReelsStore } from '../../stores/reels';
import { useAuth } from '../../api/auth/useAuth';
import CreateReelModal from '../organisms/CreateReelModal.vue';
import ViewReelModal from './ViewReelModal.vue';
import SliderReels from './SliderReels.vue';
import ImageFallBack from '../../assets/adopcion/postAdoptar.jpeg';

// Estado del componente
const { user, isAuthenticated } = useAuth();
const reelsStore = useReelsStore();
const carouselSection = ref(null);
const showCreateModal = ref(false);
const showViewModal = ref(false);
const selectedReel = ref(null);

// Propiedad computada para filtrar, agrupar y manipular los reels
const filteredReels = computed(() => {
  let grouped = [];
  const userMap = new Map();

  // Calcular el umbral de 24 horas atrás
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Extraemos los uids de las conexiones
  const connectionUids = user.value?.connections
    ? user.value.connections.map((connection) => connection?.uid).filter((uid) => uid)
    : [];

  // Filtramos los reels cuyo user.uid esté en connectionUids o sea del usuario logueado,
  // y excluimos los que ya han sido vistos
  const userReels = reelsStore.reels
    .filter((reel) => {
      const isFromConnectionOrSelf =
        reel.user?.uid &&
        (connectionUids.includes(reel.user.uid) || reel.user.uid === user.value?.uid);
      if (!isFromConnectionOrSelf) return false;

      const isViewedByUser =
        reel.viewDetails &&
        typeof reel.viewDetails === 'object' &&
        reel.viewDetails[user.value?.uid];
      if (isViewedByUser) return false;

      const reelDate = new Date(
        (reel.createdAt?.seconds ?? 0) * 1000 + (reel.createdAt?.nanoseconds ?? 0) / 1000000
      );
      return reelDate >= twentyFourHoursAgo;
    })
    .map((reel) => ({
      ...reel,
      default: false,
    }))
    .sort((a, b) => {
      const dateA = new Date(
        (a.createdAt?.seconds ?? 0) * 1000 + (a.createdAt?.nanoseconds ?? 0) / 1000000
      );
      const dateB = new Date(
        (b.createdAt?.seconds ?? 0) * 1000 + (b.createdAt?.nanoseconds ?? 0) / 1000000
      );
      return dateB - dateA;
    });

  // Agrupar reels de usuarios
  userReels.forEach((reel) => {
    const userId = reel.user.displayName;
    if (!userMap.has(userId)) {
      userMap.set(userId, []);
    }
    userMap.get(userId).push(reel);
  });

  // Convertir el mapa en un array de grupos
  userMap.forEach((reels) => {
    if (reels.length > 0) {
      grouped.push({ reels });
    }
  });

  // Determinar si se deben incluir reels predeterminados
  const shouldIncludeDefaultReels =
    !user.value ||
    !user.value.connections ||
    user.value.connections.length === 0 ||
    !userReels ||
    userReels.length < 10;

  if (shouldIncludeDefaultReels) {
    const defaultGroups = reelsStore.defaultReels.map((reel) => ({
      reels: [{ ...reel, videoUrl: reel.mediaUrl, default: true }], // Normalizar para ViewReelModal
    }));
    grouped = [...grouped, ...defaultGroups];
  }
  // Fallback si no hay reels
  if (grouped.length === 0) {
    grouped = [
      {
        reels: [
          {
            idDoc: 'placeholder',
            title: 'No hay reels disponibles',
            thumbnailUrl: ImageFallBack,
            mediaType: 'image',
            user: { displayName: 'Voir', photoURL: '../../assets/icons/logoGreen.png' },
            default: true,
          },
        ],
      },
    ];
  }
  return grouped;
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
  reelsStore.subscribeToDefaultReels(); // Real-time subscription
  // Alternative: reelsStore.fetchDefaultReels(); // One-time fetch
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  reelsStore.unsubscribeFromReels();
  reelsStore.unsubscribeFromDefaultReels();
  window.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});
</script>

<style scoped>
.fixed {
  transition: opacity 0.3s ease-in-out;
}
.fixed.opacity-0 {
  opacity: 0;
}
</style>