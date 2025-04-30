<template>
  <div class="relative w-full h-[60vh] md:h-[70vh]">
    <!-- Skeleton Loader mientras el mapa se reinicia -->
    <div
      v-if="isMapLoading"
      class="absolute inset-0 w-full h-full rounded-b-2xl bg-gray-200 dark:bg-gray-800 animate-pulse z-10"
    >
      <div class="w-full h-full shimmer"></div>
    </div>

    <!-- Indicador de carga (prop loading) -->
    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 z-10"
    >
      <i class="fa-solid fa-spinner animate-spin h-8 w-8 text-indigo-600"></i>
    </div>

    <!-- Mapa -->
    <div id="map" class="w-full h-full rounded-b-2xl"></div>

    <!-- Modal de Detalle -->
    <div
      v-if="selectedLocation"
      class="fixed inset-0 z-20 flex items-center justify-center bg-black/90"
      @click.self="selectedLocation = null"
    >
      <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 transform transition-all duration-300">
        <!-- Botón de cierre -->
        <button
          @click="selectedLocation = null"
          class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 transition-all duration-200 z-10"
          aria-label="Cerrar modal"
        >
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>

        <!-- Imagen -->
        <div class="relative">
          <img
            v-if="selectedLocation.imageUrlFile"
            :src="selectedLocation.imageUrlFile"
            alt="Imagen del lugar"
            class="w-full h-48 object-cover rounded-lg mb-4"
          />
          <div
            v-else
            class="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center"
          >
            <span class="text-gray-500 dark:text-gray-300 italic">Sin imagen</span>
          </div>
        </div>

        <!-- Información -->
        <div class="mt-2">
          <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{{ selectedLocation.title }}</h3>

          <!-- Información del usuario -->
          <div class="flex items-center gap-2 mb-3">
            <div class="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 font-semibold">
              {{ selectedLocation.emailUser ? selectedLocation.emailUser.charAt(0).toUpperCase() : 'U' }}
            </div>
            <button
              @click="showUserProfile = true"
              class="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {{ selectedLocation.emailUser || 'Usuario desconocido' }}
            </button>
          </div>

          <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">{{ selectedLocation.address }}</p>
          <p v-if="selectedLocation.phone" class="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Tel: <span class="text-indigo-600 dark:text-indigo-400">{{ selectedLocation.phone }}</span>
          </p>

          <!-- Detalles expandibles -->
          <div v-if="selectedLocation.detail" class="mb-4">
            <button
              @click="showDetails = !showDetails"
              class="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <i :class="showDetails ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"></i>
              {{ showDetails ? 'Ocultar Detalles' : 'Ver Detalles' }}
            </button>
            <div
              v-if="showDetails"
              class="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300"
            >
              {{ selectedLocation.detail }}
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div class="flex flex-col gap-3">
          <!-- Botones superiores (Chat) -->
          <div class="flex gap-2">
            <!-- Botón de Chat -->
            <a
              v-if="selectedLocation.emailUser"
              :href="`mailto:${selectedLocation.emailUser}`"
              class="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-green-500 transition-all duration-200 text-sm"
            >
              <i class="fa-solid fa-message"></i>
              Contactar
            </a>
          </div>

          <!-- Botón de Google Maps -->
          <a
            :href="`https://www.google.com/maps/search/?api=1&query=${selectedLocation.lat},${selectedLocation.lng}`"
            target="_blank"
            class="flex items-center justify-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-all duration-200 text-sm"
          >
            <i class="fa-solid fa-map-location-dot"></i>
            Ver en Google Maps
          </a>

          <!-- Botón de Redes Sociales -->
          <a
            v-if="selectedLocation.socialNetworkLink"
            :href="selectedLocation.socialNetworkLink"
            target="_blank"
            class="flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 text-sm"
          >
            <i class="fa-solid fa-link"></i>
            Visitar Redes Sociales
          </a>
        </div>
      </div>

      <!-- Submodal para el perfil del usuario -->
      <div
        v-if="showUserProfile"
        class="absolute inset-0 flex items-center justify-center bg-black/50 z-30"
        @click.self="showUserProfile = false"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-xs p-5 transform transition-all duration-300">
          <!-- Botón de cierre -->
          <button
            @click="showUserProfile = false"
            class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 transition-all duration-200"
          >
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>

          <!-- Contenido del perfil -->
          <div class="flex flex-col items-center">
            <div class="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 font-semibold text-2xl mb-3">
              {{ selectedLocation.emailUser ? selectedLocation.emailUser.charAt(0).toUpperCase() : 'U' }}
            </div>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {{ selectedLocation.emailUser || 'Usuario desconocido' }}
            </h4>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Creador de esta ubicación
            </p>
            <a
              :href="`mailto:${selectedLocation.emailUser}`"
              class="flex items-center justify-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-green-500 transition-all duration-200 text-sm"
            >
              <i class="fa-solid fa-message"></i>
              Enviar Mensaje
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useGoogleMaps } from '../../composable/useGoogleMaps';
import CatIcon from '../../assets/icons/cat_1998592.png';
import DogIcon from '../../assets/icons/dog_1998627.png';

const props = defineProps({
  locations: Array,
  loading: Boolean,
});

const emit = defineEmits(['map-ready']);
const { loadGoogleMaps } = useGoogleMaps();

const map = ref(null);
const markers = ref([]);
const MarkerConstructor = ref(null);
const selectedLocation = ref(null);
const isMapInitialized = ref(false);
const isMapLoading = ref(false);
const showDetails = ref(false); // Controla si los detalles están visibles
const showUserProfile = ref(false); // Controla si el submodal del perfil está visible

let updateTimeout = null;
const debounceUpdate = (callback, delay) => {
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }
  updateTimeout = setTimeout(callback, delay);
};

onMounted(async () => {
  console.log('ExploreMap montado');
  await initMap();
  emit('map-ready');
});

onBeforeUnmount(() => {
  console.log('ExploreMap desmontado');
  deleteAllMarkers();
  if (map.value) {
    google.maps.event.clearInstanceListeners(map.value);
    map.value = null;
  }
});

watch(
  () => props.locations,
  (newLocations) => {
    if (!isMapInitialized.value) return;
    console.log('Locations changed:', newLocations);
    debounceUpdate(() => updateMapMarkers(), 100);
  },
  { deep: true }
);

async function initMap() {
  try {
    isMapLoading.value = true;
    await loadGoogleMaps({ libraries: ['marker'] });
    const { Marker } = await window.google.maps.importLibrary('marker');
    MarkerConstructor.value = Marker;
    const { Map } = await window.google.maps.importLibrary('maps');
    map.value = new Map(document.getElementById('map'), {
      center: { lat: -34.59, lng: -58.5 },
      zoom: 11,
      mapId: '98046a6e59cbc455',
      styles: [
        { featureType: 'poi', stylers: [{ visibility: 'simplified' }] },
        { featureType: 'poi.park', stylers: [{ visibility: 'on' }] },
      ],
    });
    isMapInitialized.value = true;
    console.log('Mapa inicializado correctamente');
    await updateMapMarkers();
  } catch (err) {
    console.error('Error al inicializar el mapa:', err);
  } finally {
    isMapLoading.value = false;
  }
}

function deleteAllMarkers() {
  console.log('Eliminando marcadores... Total antes:', markers.value.length);
  markers.value.forEach(({ marker, clickListener }) => {
    if (marker) {
      if (clickListener) {
        google.maps.event.removeListener(clickListener);
      }
      google.maps.event.clearInstanceListeners(marker);
      try {
        marker.setMap(null);
      } catch (err) {
        console.warn('Error al eliminar marcador:', err);
      }
    }
  });
  markers.value = [];
  console.log('Marcadores eliminados. Total después:', markers.value.length);
}

function centerOnUserLocation() {
  if (!navigator.geolocation || !map.value) return;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLatLng = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      map.value.setCenter(userLatLng);
      map.value.setZoom(15);

      addCustomMarker(userLatLng, 'Tu ubicación', 'https://img.icons8.com/?size=100&id=13800&format=png');
    },
    (error) => {
      console.error('Error al obtener la ubicación del usuario:', error);
    }
  );
}

function addCustomMarker(position, title, iconUrl) {
  if (!map.value || !MarkerConstructor.value) return;
  const marker = new MarkerConstructor.value({
    position,
    map: map.value,
    title,
    icon: {
      url: iconUrl,
      scaledSize: new google.maps.Size(40, 40),
    },
  });
  markers.value.push({ marker, clickListener: null });
  console.log(`Marcador añadido: ${title}`);
}

function getMarkerIcon(type) {
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
}

async function updateMapMarkers() {
  if (!map.value || !MarkerConstructor.value) {
    console.log('Mapa o MarkerConstructor no disponibles');
    return;
  }

  console.log('Actualizando marcadores... Locations:', props.locations);

  const center = map.value.getCenter();
  const zoom = map.value.getZoom();

  isMapLoading.value = true;

  try {
    console.log('Reiniciando mapa...');
    const { Map } = await window.google.maps.importLibrary('maps');
    map.value = new Map(document.getElementById('map'), {
      center: center,
      zoom: zoom,
      mapId: '98046a6e59cbc455',
      styles: [
        { featureType: 'poi', stylers: [{ visibility: 'simplified' }] },
        { featureType: 'poi.park', stylers: [{ visibility: 'on' }] },
      ],
    });

    deleteAllMarkers();
    await nextTick();

    const locations = props.locations || [];
    console.log('Creando marcadores para:', locations);
    for (const location of locations) {
      if (!location.lat || !location.lng) continue;

      const marker = new MarkerConstructor.value({
        position: { lat: location.lat, lng: location.lng },
        map: map.value,
        title: location.title,
        icon: getMarkerIcon(location.type),
      });

      const clickListener = marker.addListener('click', () => {
        selectedLocation.value = location;
        console.log('Marcador clickeado:', location.title);
      });

      markers.value.push({ marker, clickListener });
    }

    console.log('Marcadores actualizados. Total:', markers.value.length);
  } catch (err) {
    console.error('Error al actualizar el mapa:', err);
  } finally {
    isMapLoading.value = false;
  }
}

defineExpose({
  centerOnUserLocation,
  deleteAllMarkers,
});
</script>

<style scoped>
#map {
  width: 100%;
  height: 100%;
}

/* Efecto shimmer para el skeleton loader */
.shimmer {
  position: relative;
  overflow: hidden;
  background: transparent;
}

.shimmer::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  animation: shimmer 1.5s infinite;
}

.dark .shimmer::after {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Ajustes responsivos para la modal */
@media (max-width: 767px) {
  .max-w-md {
    max-width: 90%;
  }
  .p-6 {
    padding: 1rem;
  }
  .h-48 {
    height: 10rem;
  }
  .text-xl {
    font-size: 1.125rem;
  }
  .text-sm {
    font-size: 0.875rem;
  }
}
</style>