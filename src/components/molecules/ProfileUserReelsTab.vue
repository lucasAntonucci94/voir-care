<template>
    <div class="container mx-auto">
      <!-- Encabezado -->
      <div class="flex justify-between items-center mb-2 md:mb-5">
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white sr-only">Tus Reels</h3>
        <!-- <button
        @click="openCreateModal"
          class="inline-flex px-4 py-2 bg-primary dark:bg-secondary text-white rounded-full hover:bg-primary-md dark:hover:bg-secondary-md transition-colors"
        >
          + Crear
          <span class="hidden sm:inline-flex ml-1">
             Reel
          </span>
        </button> -->
        <!-- <CreateLocationModal 
          v-if="showCreateModal"
          :visible="showCreateModal"
          @close="closeCreateModal"
          @submit="submitCreate"
        /> -->
      </div>
      <!-- Filtro -->
      
      <!-- Lista de grupos -->
      <div v-if="filteredReels?.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReelDetailedCard
          v-for="reel in filteredReels"
          :key="reel.id"
          :reel="reel"
          class="group-card"
        />
      </div>
      <!-- Sin grupos -->
      <div
        v-else
        class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md"
      >
        <p class="text-gray-500 dark:text-gray-400">No tienes ningún reel creado.</p>
        <button
          class="mt-4 px-4 py-2 ml-3 bg-primary hover:bg-primary-md dark:bg-secondary dark:hover:bg-secondary-md text-white rounded-lg text-sm transition-colors"
          @click="navigateToDiscoverGroup"
          >
          Descubre un grupo
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { useReelsStore } from '../../stores/reels';
  import { useAuth } from '../../api/auth/useAuth';
  import { useRouter } from 'vue-router';
  import ReelDetailedCard from '../molecules/ReelDetailedCard.vue';
  // import CreateReelModal from '../organisms/CreateReelModal.vue';
  
  const reelsStore = useReelsStore();
  const { user } = useAuth();
  const showCreateModal = ref(false);
  const router = useRouter();

  const props = defineProps({
    userId: {
      type: String,
      required: false
    }
  });
  
  const activeId = ref(props.userId || user.value?.uid);
  const filteredReels = computed(() => {
    if (!user.value) return []; // Si no hay usuario, retorna un array vacío
    let reels = reelsStore.userReels ?? []; //inicializo array si no hay ubicaciones
    debugger
    
    // reels = reels.filter(reel => reel.user?.id === activeId.value); // Filtra los reels por el ID del usuario activo
    return reels;
  });
  
  const navigateToDiscoverGroup = () => router.push({ name: 'groups' });

  function openCreateModal() {
    showCreateModal.value = true;
    document.body.style.overflow = 'hidden';
  }

  function closeCreateModal() {
    showCreateModal.value = false;
    document.body.style.overflow = '';
  }

  function submitCreate(data) {
    closeCreateModal();
  }
  // Suscripción a eventos del usuario
  onMounted(() => {
    if (user.value) {
      reelsStore.subscribeToUserReels(activeId.value);
    }
  })

  // Desuscripción al desmontar el componente
  onUnmounted(() => {
    reelsStore.subscribeToUserReels();
  })
  </script>

  <style scoped>
  .group-card {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  /* Ajuste para pantallas pequeñas */
  @media (max-width: 640px) {
    .group-card img {
      height: 120px;
    }
    .group-card h3 {
      font-size: 1rem;
    }
    .group-card p {
      font-size: 0.875rem;
    }
  }
  </style>