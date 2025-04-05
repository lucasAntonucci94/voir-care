<template>
  <section class="explore-section rounded-2xl shadow-2xl overflow-hidden">
    <!-- Header con título y acciones -->
    <div class="flex justify-between items-center px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Explorar lugares</h2>
      <div class="flex gap-2">
        <button
          @click="centerOnUserLocation"
          class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-700 transition"
          :disabled="loadingLocation"
        >
          <svg v-if="loadingLocation" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
          </svg>
          <span>{{ loadingLocation ? 'Buscando...' : 'Mi Ubicación' }}</span>
        </button>
        <button
          @click="deleteAllMarkers"
          class="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-semibold hover:bg-red-600 transition"
        >
          Borrar marcadores
        </button>
      </div>
    </div>

    <!-- Layout principal: filtros + mapa -->
    <div class="md:grid md:grid-cols-[280px_1fr]">
      <!-- Filtros -->
      <aside class="p-6 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Filtrar por tipo</h3>
        <div class="flex flex-col gap-3">
          <label
            v-for="filter in filters"
            :key="filter.id"
            class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer"
          >
            <input
              type="checkbox"
              :value="filter.id"
              v-model="activeFilters"
              class="accent-indigo-600"
            />
            <img :src="getFilterIcon(filter.id)" class="h-5 w-5" />
            <span>{{ filter.label }}</span>
          </label>
        </div>
      </aside>

      <!-- Mapa -->
      <div class="relative h-[70vh]">
        <div v-if="locationsStore.isLoading" class="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
          <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
          </svg>
        </div>
        <div id="map" class="w-full h-full"></div>
      </div>
    </div>

    <!-- Lista de lugares solo en mobile -->
    <div class="md:hidden p-6 bg-gray-100 dark:bg-gray-900">
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
    </div>
  </section>
</template>


<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import CatIcon from '../assets/icons/cat_1998592.png';
import DogIcon from '../assets/icons/dog_1998627.png';
import { useLocationsStore } from '../stores/locations';
import { useGoogleMaps } from '../composable/useGoogleMaps';

const locationsStore = useLocationsStore();
const { loadGoogleMaps } = useGoogleMaps();

const filters = ref([
  { id: 'plaza', label: 'Plazas' },
  { id: 'parque', label: 'Parques' },
  { id: 'veterinaria', label: 'Veterinarias' },
  { id: 'petshop', label: 'Pet Shops' },
  { id: 'servicio', label: 'Servicios' },
]);

const activeFilters = ref([]);
const isFiltersOpen = ref(false);
const loadingLocation = ref(false);

const filteredLocations = computed(() => {
  const filtered = locationsStore?.locations?.value?.filter((location) => !location.pending) || [];
  if (activeFilters.value.length === 0) return filtered;
  return filtered.filter((location) =>
    activeFilters.value.some((filter) => filter.toLowerCase() === location.type.toLowerCase())
  );
});

const map = ref(null);
const markers = ref([]);

const toggleFilters = () => {
  isFiltersOpen.value = !isFiltersOpen.value;
};

const centerOnUserLocation = async () => {
  if (!navigator.geolocation) {
    alert('La geolocalización no está soportada en tu navegador.');
    return;
  }

  loadingLocation.value = true;
  try {
    const { Marker } = await google.maps.importLibrary('marker'); // Usar Marker en lugar de AdvancedMarkerElement
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLatLng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        map.value.setCenter(userLatLng);
        map.value.setZoom(15);
        const marker = new Marker({
          position: userLatLng,
          map: map.value,
          title: 'Tu ubicación',
          icon: {
            url: 'https://img.icons8.com/?size=100&id=13800&format=png',
            scaledSize: new google.maps.Size(40, 40),
          },
        });
        markers.value.push(marker);
        console.log('Marcador de usuario añadido con Marker');
        loadingLocation.value = false;
      },
      (error) => {
        console.error('Error al obtener la ubicación:', error);
        alert('No se pudo obtener tu ubicación. Por favor, habilita los permisos.');
        loadingLocation.value = false;
      }
    );
  } catch (error) {
    console.error('Error cargando Marker:', error);
    loadingLocation.value = false;
  }
};

const getSocialLabel = (link) => {
  if (link.includes('instagram')) return 'Instagram';
  if (link.includes('facebook')) return 'Facebook';
  if (link.includes('twitter')) return 'Twitter';
  return 'Red Social';
};

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

const deleteAllMarkers = () => {
  // Verificamos que haya marcadores para eliminar
  if (markers.value.length > 0) {
    console.log('Eliminando todos los marcadores. Total antes:', markers.value.length);
    
    // Iteramos sobre cada marcador y lo desasociamos del mapa
    markers.value.forEach((marker, index) => {
      console.log(`Eliminando marcador ${index}: ${marker.getTitle()}`);
      marker.setMap(null); // Elimina el marcador del mapa
      console.log(`Mapa del marcador ${index} después de setMap(null):`, marker.getMap());
    });

    // Reiniciamos el array de marcadores
    markers.value = [];
    console.log('Marcadores después de eliminar:', markers.value.length);
  } else {
    console.log('No hay marcadores para eliminar');
  }
};
const reloadMapInstance = async () => {
  const { Map } = await google.maps.importLibrary('maps');
    map.value = new Map(document.getElementById('map'), {
      center: { lat: -34.59, lng: -58.5 }, // Ajustado para tus ubicaciones
      zoom: 11,
      mapId: '98046a6e59cbc455',
      styles: [
        { featureType: 'poi', stylers: [{ visibility: 'simplified' }] },
        { featureType: 'poi.park', stylers: [{ visibility: 'on' }] },
      ],
    });
};

const initMap = async () => {
  try {
    await loadGoogleMaps({ libraries: ['marker'] });
    const { Map } = await google.maps.importLibrary('maps');
    map.value = new Map(document.getElementById('map'), {
      center: { lat: -34.59, lng: -58.5 }, // Ajustado para tus ubicaciones
      zoom: 11,
      mapId: '98046a6e59cbc455',
      styles: [
        { featureType: 'poi', stylers: [{ visibility: 'simplified' }] },
        { featureType: 'poi.park', stylers: [{ visibility: 'on' }] },
      ],
    });
    console.log('Mapa inicializado:', map.value);
    // await updateMapMarkers();
  } catch (error) {
    console.error('Error al inicializar el mapa:', error);
  }
};

const updateMapMarkers = async () => {
  try {
    const { Marker } = await google.maps.importLibrary('marker');
    console.log('Actualizando marcadores para:', filteredLocations.value);

    // Eliminar todos los marcadores usando el método personalizado
    deleteAllMarkers();
    // Forzar un refresco del mapa sin reiniciarlo (Ni cabida le da a esto)
    google.maps.event.trigger(map.value, 'resize'); // Dispara un evento de redimensionamiento
    map.value.setCenter(map.value.getCenter()); // Re-centra para forzar redraw
    map.value.setZoom(map.value.getZoom()); // Reestablece el zoom actual
    
    await reloadMapInstance(); //Tengo que reiniciar la instancia porque los markers no se estan eliminando correctamente. FIX THIS
    
    // Agregar nuevos marcadores
    filteredLocations.value.forEach((location) => {
      if (location.lat && location.lng) {
        const marker = new Marker({
          position: { lat: location.lat, lng: location.lng },
          map: map.value,
          title: location.title,
          icon: getMarkerIcon(location.type),
        });

        // Configurar InfoWindow
        const infoWindowContent = `
          <div class="p-4 max-w-sm bg-white rounded-lg shadow-lg border border-gray-100">
            <!-- Título con fondo sutil y estilo moderno -->
            <h3 class="text-lg font-bold text-gray-900 bg-gradient-to-r from-indigo-50 to-gray-50 p-2 rounded-t-md -mt-4 -mx-4 mb-3">${location.title}</h3>
            
            <!-- Detalle con ícono -->
            <div class="flex items-start gap-2 mb-2">
              <svg class="h-5 w-5 text-indigo-600 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-gray-600">${location.detail}</p>
            </div>
            
            <!-- Dirección con ícono -->
            <div class="flex items-start gap-2 mb-2">
              <svg class="h-5 w-5 text-indigo-600 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p class="text-xs text-gray-500">${location.address}</p>
            </div>
            
            <!-- Teléfono (si existe) -->
            ${
              location.phone
                ? `
                  <div class="flex items-center gap-2 mb-2">
                    <svg class="h-5 w-5 text-indigo-600 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <p class="text-xs text-indigo-600 font-medium">Tel: ${location.phone}</p>
                  </div>
                `
                : ''
            }
            
            <!-- Redes sociales (si existen) -->
            ${
              location.socialNetworkLink?.length
                ? `
                  <div class="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-200">
                    ${location.socialNetworkLink
                      .map(
                        (link) => `
                          <a href="${link}" target="_blank" class="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-medium transition-colors duration-200">
                            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.473-1.473M12 12l9-9m-1 1a9 9 0 11-12.728 0" />
                            </svg>
                            ${getSocialLabel(link)}
                          </a>
                        `
                      )
                      .join('')}
                  </div>
                `
                : ''
            }
            
            <!-- Imagen -->
            <img src="${location.imageUrlFile || 'https://via.placeholder.com/150'}" alt="${location.title}" class="w-full max-w-[200px] h-auto object-cover mt-4 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200">
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
        console.log('Marcador añadido:', marker.getTitle());
      } else {
        console.warn('Ubicación sin coordenadas:', location);
      }
    });

    console.log('Total de marcadores añadidos:', markers.value.length);
  } catch (error) {
    console.error('Error al actualizar marcadores:', error);
  }
};

onMounted(async () => {
  console.log('Montando componente...');
  locationsStore.subscribe();
  await initMap();
});

onUnmounted(() => {
  console.log('Desmontando componente...');
  locationsStore.unsubscribe();
});

watch(
  () => [locationsStore?.locations?.value, activeFilters?.value],
  async () => {
    if (map.value) {
      console.log('Cambio detectado en locations o filtros:', {
        locations: locationsStore?.locations?.value?.length,
        filters: activeFilters.value,
      });
      await updateMapMarkers();
    }
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