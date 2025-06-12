<template>
  <div class="relative w-full h-[60vh] md:h-[100vh]">
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
    <LocationDetailModal
      v-if="showModal"
      :visible="showModal"
      :location="selectedLocation"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useGoogleMaps } from '../../composable/useGoogleMaps';
import LocationDetailModal from '../organisms/LocationDetailModal.vue';

import CatIcon from '../../assets/icons/cat_1.png';
import VetIcon from '../../assets/icons/locations/veterinary 2.png';
import TrainerIcon from '../../assets/icons/locations/trainer1.png';
import GroomingIcon from '../../assets/icons/locations/groomer2.png';
import PaseadorIcon from '../../assets/icons/locations/walking-the-dog.png';
import GuarderiaIcon from '../../assets/icons/locations/guardery4.png';
import ParqueIcon from '../../assets/icons/locations/park.png';
import PetfriendlyIcon from '../../assets/icons/locations/petfriendly3.png';
import PetShopIcon from '../../assets/icons/locations/assistant.png';
import EtologoIcon from '../../assets/icons/locations/veterinary.png';
import PetSitterIcon from '../../assets/icons/locations/guarderia3.png';
import ShelterIcon from '../../assets/icons/locations/animal-shelter.png';
import EmergencyIcon from '../../assets/icons/locations/first-aid-kit.png';
import TherapyIcon from '../../assets/icons/locations/rehab1.png';

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
const showModal = ref(false);
const isMapInitialized = ref(false);
const isMapLoading = ref(false);

let updateTimeout = null;
const debounceUpdate = (callback, delay) => {
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }
  updateTimeout = setTimeout(callback, delay);
};

onMounted(async () => {
  await initMap();
  emit('map-ready');
});

onBeforeUnmount(() => {
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
    debounceUpdate(() => updateMapMarkers(), 100);
  },
  { deep: true }
);

async function initMap() {
  try {
    isMapLoading.value = true;
    await loadGoogleMaps();
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
    await updateMapMarkers();
  } catch (err) {
    console.error('Error al inicializar el mapa:', err);
  } finally {
    isMapLoading.value = false;
  }
}

function deleteAllMarkers() {
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
}

function getMarkerIcon(type) {
  const iconMap = {
    veterinaria: VetIcon,
    petshop: PetShopIcon,
    guarderia: GuarderiaIcon,
    peluqueria: GroomingIcon,
    cuidador: PetSitterIcon,
    etologo: EtologoIcon,
    paseador: PaseadorIcon,
    entrenador: TrainerIcon,
    parque: ParqueIcon,
    petfriendly: PetfriendlyIcon,
    refugio: ShelterIcon,
    emergencias: EmergencyIcon,
    rehabilitacion: TherapyIcon,
    // eventos: EventIcon, // Uncomment when filter is added
    // alojamiento: AccommodationIcon, // Uncomment when filter is added
    // suministros: DeliveryIcon, // Uncomment when filter is added
  };
  return {
    url: iconMap[type] || CatIcon,
    scaledSize: new google.maps.Size(40, 40),
  };
}

async function updateMapMarkers() {
  if (!map.value || !MarkerConstructor.value) {
    // console.log('Mapa o MarkerConstructor no disponibles');
    return;
  }

  const center = map.value.getCenter();
  const zoom = map.value.getZoom();
  isMapLoading.value = true;

  try {
    const { Map } = await window.google.maps.importLibrary('maps');
    map.value = new Map(document.getElementById('map'), {
      center,
      zoom,
      mapId: '98046a6e59cbc455',
      styles: [
        { featureType: 'poi', stylers: [{ visibility: 'simplified' }] },
        { featureType: 'poi.park', stylers: [{ visibility: 'on' }] },
      ],
    });

    deleteAllMarkers();
    await nextTick();

    const locations = props.locations || [];
    for (const location of locations) {
      if (!location.address.coordinates.lat || !location.address.coordinates.lng) continue;

      const marker = new MarkerConstructor.value({
        position: { lat: location.address.coordinates.lat, lng: location.address.coordinates.lng },
        map: map.value,
        title: location.title,
        icon: getMarkerIcon(location.type),
      });

      const clickListener = marker.addListener('click', () => {
        openModal(location);
      });

      markers.value.push({ marker, clickListener });
    }
  } catch (err) {
    console.error('Error al actualizar el mapa:', err);
  } finally {
    isMapLoading.value = false;
  }
}

function openModal(location) {
  selectedLocation.value = location;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  selectedLocation.value = null;
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