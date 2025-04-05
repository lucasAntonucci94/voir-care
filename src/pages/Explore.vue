<template>
  <section class="explore-section rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-gray-900">
    <!-- Header con acciones -->
    <div class="p-6 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4 sr-only">Explorar lugares</h2>
      <div class="flex flex-wrap gap-2">
        <button
          @click="centerOnUserLocation"
          class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          :disabled="loadingLocation"
        >
          <svg v-if="loadingLocation" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
          </svg>
          <span>{{ loadingLocation ? 'Buscando...' : 'Mi Ubicación' }}</span>
        </button>
        <button
          @click="deleteAllMarkers"
          class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
        >
          Borrar marcadores
        </button>
      </div>
    </div>

    <!-- Layout principal -->
    <div class="md:grid md:grid-cols-[280px_1fr]">
      <!-- Componente de filtros -->
      <ExploreFilters v-model="activeFilters" :filters="filters" />

      <!-- Componente del mapa -->
      <ExploreMap
        ref="exploreMapRef"
        :locations="filteredLocations"
        @map-ready="handleMapReady"
      />
    </div>

    <!-- Lista de lugares (solo en mobile) -->
    <!-- <div class="md:hidden p-6 bg-gray-50 dark:bg-gray-900">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lugares cercanos</h3>
      <ul class="space-y-4">
        <li
          v-for="location in filteredLocations"
          :key="location.id"
          class="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
        >
          <img
            :src="location.imageUrlFile || 'https://via.placeholder.com/150'"
            alt="Imagen del lugar"
            class="w-16 h-16 object-cover rounded-md"
          />
          <div class="flex-1">
            <h4 class="text-base font-semibold text-gray-800 dark:text-white">{{ location.title }}</h4>
            <p class="text-sm text-gray-600 dark:text-gray-300">{{ location.detail }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ location.address }}</p>
            <p v-if="location.phone" class="text-xs text-indigo-600 mt-1">Tel: {{ location.phone }}</p>
          </div>
        </li>
      </ul>
    </div> -->
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import ExploreFilters from '../components/molecules/ExploreFilters.vue';
import ExploreMap from '../components/molecules/ExploreMap.vue';
import { useLocationsStore } from '../stores/locations';

const locationsStore = useLocationsStore();
const exploreMapRef = ref(null) //que hace esta ref? me permite acceder al componente hijo ExploreMap y llamar a sus métodos desde aquí. Magic :D

function centerOnUserLocation() {
  loadingLocation.value = true
  exploreMapRef.value?.centerOnUserLocation()
  loadingLocation.value = false
}

function deleteAllMarkers() {
  debugger
  exploreMapRef.value?.deleteAllMarkers()
}

const filters = ref([
  { id: 'plaza', label: 'Plazas' },
  { id: 'parque', label: 'Parques' },
  { id: 'veterinaria', label: 'Veterinarias' },
  { id: 'petshop', label: 'Pet Shops' },
  { id: 'servicio', label: 'Servicios' },
]);

const activeFilters = ref([]);
const loadingLocation = ref(false);

const filteredLocations = computed(() => {
  const filtered = locationsStore?.locations?.value?.filter((location) => !location.pending) || [];
  if (activeFilters.value.length === 0) return filtered;
  return filtered.filter((location) =>
    activeFilters.value.some((filter) => filter.toLowerCase() === location.type.toLowerCase())
  );
});


const handleMapReady = () => {
  console.log('Mapa listo');
};

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
