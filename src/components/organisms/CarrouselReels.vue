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
import LogoVoir from '../../assets/icons/logoVoir.png';
import DefaultPostImage from '../../assets/1.png';

// Estado del componente
const { user, isAuthenticated } = useAuth();
const reelsStore = useReelsStore();
const carouselSection = ref(null);
const showCreateModal = ref(false);
const showViewModal = ref(false);
const selectedReel = ref(null);

// Generar reels predeterminados de la marca "Voir"
const defaultReels = computed(() => {
  const reels = [];
  const brandName = "Voir";
  const logoUrl = LogoVoir;
  const baseTimestamp = new Date("2024-01-05T22:18:00-03:00").getTime();

  for (let i = 1; i <= 20; i++) {
    reels.push({
      id: `default-reel-${i}`,
      title: `Anuncio ${i} de ${brandName}`,
      timestamp: new Date(baseTimestamp - i * 3600000),
      thumbnailUrl: DefaultPostImage,
      user: {
        displayName: brandName,
        photoURL: logoUrl,
      },
      viewDetails: {},
    });
  }
  return reels;
});

// Propiedad computada para filtrar, agrupar y manipular los reels
const filteredReels = computed(() => {
  let grouped = [];
  const userMap = new Map();

  // Si no hay usuario autenticado o no hay conexiones, devolvemos solo los reels predeterminados
  if (!user.value || !user.value.connections || user.value.connections.length === 0) {
    const defaultGroups = defaultReels.value.map((reel) => ({ reels: [reel] }));
    return [...defaultGroups];
  }

  // Extraemos los uids de las conexiones
  const connectionUids = user.value.connections
    .map(connection => connection?.uid)
    .filter(uid => uid);

  // Filtramos los reels cuyo user.uid esté en connectionUids o sea del usuario logueado,
  // y excluimos los que ya han sido vistos
  const userReels = reelsStore.reels
    .filter(reel => {
      // Filtro por conexiones o reels propios
      const isFromConnectionOrSelf = reel.user?.uid && (connectionUids.includes(reel.user.uid) || reel.user.uid === user.value.uid);
      if (!isFromConnectionOrSelf) return false;

      // Filtro por reels no vistos
      const isViewedByUser = reel.viewDetails && typeof reel.viewDetails === 'object' && reel.viewDetails[user.value?.uid];
      return !isViewedByUser;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Agrupar reels de usuarios
  userReels.forEach((reel) => {
    const userId = reel.user.displayName; // Usamos displayName como identificador
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

  // Añadir los reels predeterminados de "Voir" al final
  const defaultGroups = defaultReels.value.map((reel) => ({ reels: [reel] }));
  grouped = [...grouped, ...defaultGroups];

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