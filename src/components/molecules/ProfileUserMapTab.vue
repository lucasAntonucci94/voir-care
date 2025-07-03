<template>
    <div class="container mx-auto">
      <!-- Encabezado -->
      <div class="flex justify-between items-center mb-2 md:mb-5">
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Tus Marcadores</h3>
        <button
        @click="openCreateModal"
          class="inline-flex px-4 py-2 bg-primary dark:bg-secondary text-white rounded-full hover:bg-primary-md dark:hover:bg-secondary-md transition-colors"
        >
          + Crear
          <span class="hidden sm:inline-flex ml-1">
             Marcador
          </span>
        </button>
        <CreateLocationModal 
          v-if="showCreateModal"
          :visible="showCreateModal"
          @close="closeCreateModal"
          @submit="submitCreate"
        />
      </div>
      <!-- Filtro -->
      
      <!-- Lista de grupos -->
      <div v-if="filteredLocations?.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <LocationCard
          v-for="location in filteredLocations"
          :key="location.id"
          :location="location"
          class="group-card"
        />
      </div>

      <!-- Sin grupos -->
      <div
        v-else
        class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md"
      >
        <p class="text-gray-500 dark:text-gray-400">No tienes ningún marcador creado.</p>
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
  import { useLocationsStore } from '../../stores/locations';
  import { useAuth } from '../../api/auth/useAuth';
  import { useRouter } from 'vue-router';
  import LocationCard from '../molecules/LocationCard.vue';
  import CreateLocationModal from '../organisms/CreateLocationModal.vue';
  
  const locationsStore = useLocationsStore();
  const { user } = useAuth();
  const showCreateModal = ref(false);
  const router = useRouter();

  const filteredLocations = computed(() => {
    if (!user.value) return []; // Si no hay usuario, retorna un array vacío
    let locations = locationsStore.locations?.value ?? []; //inicializo array si no hay ubicaciones
    locations = locations.filter(location => location.user?.id === user.value?.uid);
    return locations;
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
      locationsStore.subscribe();
    }
  })

  // Desuscripción al desmontar el componente
  onUnmounted(() => {
    locationsStore.unsubscribe();
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