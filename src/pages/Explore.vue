<template>
  <section class="explore-section shadow-2xl overflow-hidden bg-white dark:bg-gray-900">
   <!-- Header -->
    <div class="p-6 md:p-6 bg-primary-md dark:bg-secondary-md border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <!-- Sección izquierda: Botón de retroceso y título -->
        <div class="flex items-center gap-3 md:gap-4">
          <button
            @click="goBack"
            class="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all duration-300"
            aria-label="Volver a la página anterior"
          >
            <i class="fa-solid fa-arrow-left text-base md:text-lg"></i>
          </button>
          <h2 class="text-xl md:text-2xl font-bold text-white">Explora nuestro mapa interactivo</h2>
        </div>
        <!-- Botón de "Mi Ubicación" -->
        <button
          @click="centerOnUserLocation"
          class="flex items-center gap-1 md:gap-2 px-3 md:px-5 py-1.5 md:py-2 bg-white text-primary dark:text-secondary rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300"
          :disabled="loadingLocation"
        >
          <i :class="loadingLocation ? 'fa-solid fa-spinner animate-spin' : 'fa-solid fa-location-crosshairs'" class="h-4 w-4 md:h-5 md:w-5"></i>
          <span class="text-sm md:text-base">{{ loadingLocation ? 'Buscando...' : 'Mi Ubicación' }}</span>
        </button>
      </div>
    </div>

    <!-- Layout principal -->
    <div class="md:grid md:grid-cols-[280px_1fr]">
      <!-- Contenedor para filtros y botón -->
      <div class="relative">
        <!-- Botón para abrir la modal -->
        <button
          @click="openCreateModal"
          class="px-4 py-2 mt-3 ml-4 bg-primary text-white rounded-lg shadow-lg hover:bg-primary-dark transition-all duration-300"
        >
          <i class="fa-solid fa-plus mr-2"></i> Agregar Lugar
        </button>
        <ExploreFilters v-model="activeFilters" />
      </div>

      <!-- Componente del mapa -->
      <ExploreMap
        ref="exploreMapRef"
        :locations="filteredLocations"
        @map-ready="handleMapReady"
      />
    </div>
    <!-- Modal para crear una location -->
    <CreateLocationModal :visible="isCreateModalOpen" @close="closeCreateModal"
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import ExploreFilters from '../components/molecules/ExploreFilters.vue';
import ExploreMap from '../components/molecules/ExploreMapOld.vue';
// import ExploreMap from '../components/molecules/ExploreMap.vue';
import { useLocationsStore } from '../stores/locations';
import CreateLocationModal from '../components/organisms/CreateLocationModal.vue';

const locationsStore = useLocationsStore();
const exploreMapRef = ref(null) //que hace esta ref? me permite acceder al componente hijo ExploreMap y llamar a sus métodos desde aquí. Magic :D
const loadingLocation = ref(false);
const isCreateModalOpen = ref(false);
const activeFilters = ref([]);

function centerOnUserLocation() {
  loadingLocation.value = true
  exploreMapRef.value?.centerOnUserLocation()
  loadingLocation.value = false
}

// const filteredLocations = computed(() => {
//   const filtered = locationsStore?.locations?.value?.filter((location) => !location.pending) || [];
//   if (activeFilters.value.length === 0) return filtered;
//   return filtered.filter((location) =>
//     activeFilters.value.some((filter) => filter.toLowerCase() === location.type.toLowerCase())
//   );
// });

const filteredLocations = computed(() => {
  const filtered = locationsStore?.locations?.value?.filter((location) => !location.pending) || [];
  if (activeFilters.value.length === 0) return filtered; // Devolver lista vacía cuando no hay filtros
  return filtered.filter((location) =>
    activeFilters.value.some((filter) => filter.toLowerCase() === location.type.toLowerCase())
  );
});

function goBack() {
  // Lógica personalizada, por ejemplo:
  window.history.back(); // O usa un evento para notificar al componente padre
}

const handleMapReady = () => {
  console.log('Mapa listo');
};

// Logica de modal y formulario
function openCreateModal() {
  isCreateModalOpen.value = true;
}

function closeCreateModal() {
  isCreateModalOpen.value = false;
}

onMounted(() => {
  locationsStore.subscribe();
});

onUnmounted(() => {
  locationsStore.unsubscribe();
});


</script> 

<style scoped>
.explore-section {
  display: flex;
  flex-direction: column;
  isolation: isolate;
}
</style>
