<template>
  <section class="explore-section bg-white rounded-2xl shadow-2xl overflow-hidden">
    <!-- Filtros y Botón de Geolocalización -->
    <div class="filters-container p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-gray-900">Explorar Lugares</h2>
        <button
          @click="centerOnUserLocation"
          class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all duration-200 shadow-md"
          :disabled="loadingLocation"
        >
          <svg v-if="loadingLocation" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"></path>
          </svg>
          <span>{{ loadingLocation ? 'Buscando...' : 'Mi Ubicación' }}</span>
        </button>
      </div>
      <div class="filter-options">
        <button
          @click="toggleFilters"
          class="w-full flex justify-between items-center p-3 bg-white rounded-lg shadow-sm hover:bg-gray-100 transition-all duration-200"
        >
          <span class="text-sm font-semibold text-gray-700">Filtros</span>
          <svg
            :class="{ 'rotate-180': isFiltersOpen }"
            class="h-5 w-5 text-gray-500 transition-transform duration-200"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div
          v-show="isFiltersOpen"
          class="mt-2 bg-white rounded-lg shadow-md p-4 flex flex-col gap-3"
        >
          <label
            v-for="filter in filters"
            :key="filter.id"
            class="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-all duration-200 cursor-pointer"
          >
            <input
              type="checkbox"
              :value="filter.id"
              v-model="activeFilters"
              class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <img :src="getFilterIcon(filter.id)" class="h-6 w-6" alt="Icono de filtro" />
            <span class="text-sm text-gray-700 flex-1">{{ filter.label }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Mapa -->
    <div class="map-container relative h-[60vh] md:h-[70vh] w-full">
      <div v-if="locationsStore.isLoading" class="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75">
        <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"></path>
        </svg>
      </div>
      <div id="map" class="w-full h-full"></div>
    </div>

    <!-- Lista de lugares (visible solo en mobile) -->
    <div class="locations-list p-6 bg-gray-50 md:hidden">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Lugares Cercanos</h3>
      <ul class="space-y-4">
        <li
          v-for="location in filteredLocations"
          :key="location.id"
          class="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
        >
          <img
            :src="location.imageUrlFile || 'https://via.placeholder.com/150'"
            :alt="location.title"
            class="w-16 h-16 object-cover rounded-md shadow-sm"
          />
          <div class="flex-1">
            <h4 class="text-base font-semibold text-gray-900">{{ location.title }}</h4>
            <p class="text-sm text-gray-600">{{ location.detail }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ location.address }}</p>
            <p v-if="location.phone" class="text-xs text-indigo-600 mt-1">Tel: {{ location.phone }}</p>
            <div v-if="location.socialNetworkLink?.length" class="flex gap-2 mt-2">
              <a
                v-for="(link, index) in location.socialNetworkLink"
                :key="index"
                :href="link"
                target="_blank"
                class="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
              >
                {{ getSocialLabel(link) }}
              </a>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import CatIcon from '../assets/icons/cat_1998592.png';
import DogIcon from '../assets/icons/dog_1998627.png';
import { useLocationsStore } from '../stores/locations';
import { useGoogleMaps } from '../composable/useGoogleMaps';

// Instancia del store y composable de Google Maps
const locationsStore = useLocationsStore();
const { loadGoogleMaps } = useGoogleMaps();

// Filtros disponibles
const filters = ref([
  { id: 'plaza', label: 'Plazas' },
  { id: 'parque', label: 'Parques' },
  { id: 'veterinaria', label: 'Veterinarias' },
  { id: 'petshop', label: 'Pet Shops' },
  { id: 'servicio', label: 'Servicios' },
]);

// Filtros activos y estado del desplegable
const activeFilters = ref([]);
const isFiltersOpen = ref(false);
// Estado de carga de ubicación
const loadingLocation = ref(false);

// Lugares filtrados según los filtros activos y excluyendo 'pending'
const filteredLocations = computed(() => {
  const filtered = locationsStore?.locations?.value?.filter((location) => !location.pending);
  debugger
  if (activeFilters?.value?.length === 0) return filtered;
  debugger
  const aux = filtered.filter((location) => activeFilters.value.includes(location.type));
  return aux;
});

// Referencia al mapa y marcadores
const map = ref(null);
const markers = ref([]);

// Función para togglear el desplegable de filtros
const toggleFilters = () => {
  isFiltersOpen.value = !isFiltersOpen.value;
};

// Función para centrar el mapa en la ubicación del usuario
const centerOnUserLocation = () => {
  if (!navigator.geolocation) {
    alert('La geolocalización no está soportada en tu navegador.');
    return;
  }

  loadingLocation.value = true;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLatLng = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      map.value.setCenter(userLatLng);
      map.value.setZoom(15);
      new google.maps.Marker({
        position: userLatLng,
        map: map.value,
        title: 'Tu ubicación',
        icon: {
          url: 'https://img.icons8.com/?size=100&id=13800&format=png',
          scaledSize: new google.maps.Size(40, 40),
        },
      });
      loadingLocation.value = false;
    },
    (error) => {
      console.error('Error al obtener la ubicación:', error);
      alert('No se pudo obtener tu ubicación. Por favor, habilita los permisos.');
      loadingLocation.value = false;
    }
  );
};

// Función para extraer etiquetas de redes sociales
const getSocialLabel = (link) => {
  if (link.includes('instagram')) return 'Instagram';
  if (link.includes('facebook')) return 'Facebook';
  if (link.includes('twitter')) return 'Twitter';
  return 'Red Social';
};

// Función para obtener el ícono según el tipo de lugar
const getMarkerIcon = (type) => {
  const iconMap = {
    plaza: CatIcon,
    parque: CatIcon,
    veterinaria: DogIcon,
    petshop: DogIcon,
    servicio: CatIcon,
  };
  return {
    url: iconMap[type] || CatIcon,
    scaledSize: new google.maps.Size(40, 40),
  };
};

// Función para obtener el ícono de filtro
const getFilterIcon = (type) => {
  const iconMap = {
    plaza: CatIcon,
    parque: CatIcon,
    veterinaria: DogIcon,
    petshop: DogIcon,
    servicio: CatIcon,
  };
  return iconMap[type] || CatIcon;
};

// Función para inicializar el mapa
const initMap = () => {
  map.value = new google.maps.Map(document.getElementById('map'), {
    center: { lat: -34.6037, lng: -58.3816 },
    zoom: 12,
    styles: [
      { featureType: 'poi', stylers: [{ visibility: 'simplified' }] },
      { featureType: 'poi.park', stylers: [{ visibility: 'on' }] },
    ],
  });
  updateMapMarkers();
};

// Función para actualizar los marcadores en el mapa
const updateMapMarkers = () => {
  markers.value.forEach((marker) => marker.setMap(null));
  markers.value = [];

  filteredLocations.value.forEach((location) => {
    if (location.lat && location.lng) {
      const marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: map.value,
        title: location.title,
        icon: getMarkerIcon(location.type),
      });

      const infoWindowContent = `
        <div class="p-4 max-w-sm">
          <h3 class="text-lg font-bold text-gray-900">${location.title}</h3>
          <p class="text-sm text-gray-600 mt-1">${location.detail}</p>
          <p class="text-xs text-gray-500 mt-1">${location.address}</p>
          ${location.phone ? `<p class="text-xs text-indigo-600 mt-1">Tel: ${location.phone}</p>` : ''}
          ${
            location.socialNetworkLink?.length
              ? `<div class="flex gap-2 mt-2">${location.socialNetworkLink
                  .map(
                    (link) =>
                      `<a href="${link}" target="_blank" class="text-indigo-600 hover:text-indigo-800 text-xs font-medium">${getSocialLabel(
                        link
                      )}</a>`
                  )
                  .join('')}</div>`
              : ''
          }
          <img src="${location.imageUrlFile || 'https://via.placeholder.com/150'}" alt="${
            location.title
          }" class="w-28 h-28 object-cover mt-3 rounded-lg shadow-sm">
        </div>
      `;

      const infoWindow = new google.maps.InfoWindow({
        content: infoWindowContent,
      });

      marker.addListener('click', () => {
        infoWindow.open({
          anchor: marker,
          map: map.value,
          shouldFocus: false,
        });
      });

      markers.value.push(marker);
    }
  });
};

// Lifecycle hooks
onMounted(async () => {
  locationsStore.subscribe();
  await loadGoogleMaps(); // Cargar Google Maps antes de inicializar
  initMap();
});

onUnmounted(() => {
  locationsStore.unsubscribe();
});

// Actualiza marcadores cuando cambien las locations o los filtros
watch(
  () => [locationsStore?.locations?.value, activeFilters?.value],
  () => {
    if (map.value) updateMapMarkers();
  },
  { deep: true }
);
</script>

<style scoped>
.explore-section {
  display: flex;
  flex-direction: column;
  isolation: isolate;
}

.filters-container {
  width: 100%;
}

.filter-options {
  max-width: 300px;
}

@media (min-width: 768px) {
  .explore-section {
    display: grid;
    grid-template-columns: 1fr 3fr;
    grid-template-rows: auto 1fr;
    gap: 1.5rem;
  }
  .filters-container {
    grid-column: 1 / 2;
    grid-row: 1 / 3;
    position: sticky;
    top: 1.5rem;
    height: fit-content;
    max-width: 300px;
  }
  .map-container {
    grid-column: 2 / 3;
    grid-row: 1 / 3;
  }
  .locations-list {
    display: none;
  }
}
</style>