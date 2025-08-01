<template>
  <section class="explore-section shadow-2xl overflow-hidden bg-white dark:bg-gray-900">
   <!-- Header -->
    <div class="p-6 md:p-6 bg-primary-md dark:bg-secondary-md border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <!-- Sección izquierda: Botón de retroceso y título -->
        <div class="flex items-center gap-3 md:gap-4">
          <button
            v-if="isDesktop"
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
          class="hidden md:block flex items-center gap-1 md:gap-2 px-3 md:px-5 py-1.5 md:py-2 bg-white text-primary dark:text-secondary rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300"
          :disabled="loadingLocation"
        >
          <i :class="loadingLocation ? 'fa-solid fa-spinner animate-spin' : 'fa-solid fa-location-crosshairs'" class="h-4 w-4 md:h-5 md:w-5"></i>
          <span class="text-sm md:text-base">{{ loadingLocation ? 'Buscando...' : 'Mi Ubicación' }}</span>
        </button>
      </div>
    </div>

    <!-- Layout principal -->
    <div class="md:grid md:grid-cols-[280px_1fr]">
      <!-- Componente de acciones (boton de creacion y filtros) -->
      <ExploreFilters v-model="activeFilters" :flag-centered="flagCentered" @center-location="centerOnUserLocation" />
      <!-- Componente del mapa -->
      <ExploreMap
        ref="exploreMapRef"
        :locations="filteredLocations"
        @map-ready="handleMapReady"
      />
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import ExploreFilters from '../components/molecules/ExploreFilters.vue';
import ExploreMap from '../components/molecules/ExploreMapOld.vue';
// import ExploreMap from '../components/molecules/ExploreMap.vue';
import { useLocationsStore } from '../stores/locations';

const locationsStore = useLocationsStore();
const exploreMapRef = ref(null) //que hace esta ref? me permite acceder al componente hijo ExploreMap y llamar a sus métodos desde aquí. Magic :D
const loadingLocation = ref(false);
const flagCentered = ref(false);
const activeFilters = ref([]);
const isDesktop = ref(false);

// Detectar si estamos en desktop o mobile
const checkIfDesktop = () => {
  isDesktop.value = window.innerWidth >= 768;
};


function centerOnUserLocation() {
  exploreMapRef.value?.centerOnUserLocation()
  flagCentered.value = true;
}

const filteredLocations = computed(() => {
  const filtered = locationsStore?.locations?.value?.filter((location) => !location.pending) || [];
  debugger
  if (activeFilters.value.length === 0) return filtered; // Devolver lista vacía cuando no hay filtros
  var locationsss = filtered.filter((location) =>
    activeFilters.value.some((filter) => filter.toLowerCase() === location.type.toLowerCase())
  );
  debugger
  return locationsss
});

function goBack() {
  window.history.back();
}

const handleMapReady = () => {
  // console.log('Mapa listo');
};

onMounted(() => {
  locationsStore.subscribeTolocations();
  checkIfDesktop();
  window.addEventListener('resize', checkIfDesktop);
});

onUnmounted(() => {
  locationsStore.unsubscribeAllFn();
  window.removeEventListener('resize', checkIfDesktop);
});
</script> 

<style scoped>
.explore-section {
  display: flex;
  flex-direction: column;
  isolation: isolate;
}
</style>
