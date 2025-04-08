<template>
    <div class="relative w-full h-[60vh] md:h-[70vh]">
      <div
        v-if="loading"
        class="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 z-10"
      >
        <i class="fa-solid fa-spinner animate-spin h-8 w-8 text-indigo-600"></i>
      </div>
      <div v-else id="map" class="w-full h-full rounded-b-2xl"></div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed } from 'vue'
  import { useGoogleMaps } from '../../composable/useGoogleMaps'
  import CatIcon from '../../assets/icons/cat_1998592.png'
  import DogIcon from '../../assets/icons/dog_1998627.png'
  
  const props = defineProps({
    locations: Array,
    loading: Boolean
  })
  const emit = defineEmits(['map-ready'])
  const { loadGoogleMaps } = useGoogleMaps()
  
  const map = ref(null)
  const markers = ref(new Map())
  const isMapReady = ref(false)
  let AdvancedMarkerElement = null
  
//   onMounted(async () => {
//   await initMap()
//   isMapReady.value = true
//   emit('map-ready')
// })
onMounted(async () => {
  await initMap();
  emit('map-ready');

  watch(locationIds, async (newVal, oldVal) => {
    console.log('WatchInit', newVal, oldVal);
    if (!map.value || !AdvancedMarkerElement || !props.locations?.length) return;
    console.log('UpdateMapMarkers', newVal, oldVal);
    await updateMapMarkers();
    console.log('Watchends');
  }, { immediate: true });
});
  
  onBeforeUnmount(() => {
    deleteAllMarkers()
  })
  
  // Creamos un computed que genere una cadena estable con los IDs de las ubicaciones
  const locationIds = computed(() =>
    props.locations ? props.locations.map(loc => loc.id).join(',') : ''
  )
  
  // Usamos watch sobre la cadena de IDs para actualizar los markers solo cuando cambian
//   watch(
//   [locationIds, isMapReady],
//   async ([newIds, ready]) => {
//     console.log('Watch:', newIds, ready)
//     if (!ready || !props.locations?.length) return
//     await updateMapMarkers()
//     console.log('Watch ends')
//   },
//   { immediate: true }
// )
  async function initMap() {
    console.log('InitMap')
    try {
      // Cargar la librería 'marker'
      await loadGoogleMaps({ libraries: ['marker'] })
      const { Map } = await window.google.maps.importLibrary('maps')
      const markerLib = await window.google.maps.importLibrary('marker')
      AdvancedMarkerElement = markerLib.AdvancedMarkerElement
  
      map.value = new Map(document.getElementById('map'), {
        center: { lat: -34.59, lng: -58.5 },
        zoom: 11,
        mapId: '98046a6e59cbc455'
        // Los estilos se definen en la consola de Google Cloud si usás mapId.
      })
    } catch (err) {
      console.error('Error al inicializar el mapa:', err)
    }
  }
  
  // Función para eliminar los marcadores existentes
  function deleteAllMarkers() {
    console.log('Eliminando markers:', markers.value.size)
    for (const marker of markers.value.values()) {
      if (marker && typeof marker.remove === 'function') {
        marker.remove()
      } else if (marker && typeof marker.setMap === 'function') {
        marker.setMap(null)
      }
    }
    markers.value.clear()
  }
  
  function getMarkerIcon(type) {
    const iconMap = {
      plaza: CatIcon,
      parque: CatIcon,
      veterinaria: DogIcon,
      petshop: DogIcon,
      servicio: CatIcon
    }
    return iconMap[type] || CatIcon
  }
  
  async function updateMapMarkers() {
    console.log('updateMapMarkers init')

    if (!map.value || !AdvancedMarkerElement) return
  
    deleteAllMarkers()
    await nextTick()
  
    for (const location of props.locations) {
      if (!location.lat || !location.lng) continue
  
      // Crear un elemento <img> para usar como icono
      const iconEl = document.createElement('img')
      iconEl.src = getMarkerIcon(location.type)
      iconEl.style.width = '40px'
      iconEl.style.height = '40px'
      iconEl.style.display = 'block';

      const marker = new AdvancedMarkerElement({
        map: map.value,
        position: { lat: location.lat, lng: location.lng },
        title: location.title,
        content: iconEl,
      })
  
      // Listener para mostrar InfoWindow al hacer clic
      marker.addEventListener('gmp-click', () => {
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-4 max-w-sm bg-white rounded-lg shadow-lg border border-gray-100">
              <h3 class="text-lg font-bold text-gray-900 mb-2">${location.title}</h3>
              <p class="text-sm text-gray-600 mb-1">${location.detail}</p>
              <p class="text-xs text-gray-500">${location.address}</p>
            </div>`
        })
        infoWindow.open(map.value, marker)
      })
  
      markers.value.set(location.id, marker)
    }
    console.log('Finish UpdateMapMarkers')
  }
  
  function centerOnUserLocation() {
    if (!navigator.geolocation || !map.value || !AdvancedMarkerElement) return
  
    navigator.geolocation.getCurrentPosition((pos) => {
      const userLatLng = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      }
      map.value.setCenter(userLatLng)
      map.value.setZoom(15)
  
      const iconEl = document.createElement('img')
      iconEl.src = 'https://img.icons8.com/?size=100&id=13800&format=png'
      iconEl.style.width = '40px'
      iconEl.style.height = '40px'
      iconEl.style.display = 'block';
      
      const userMarker = new AdvancedMarkerElement({
        map: map.value,
        position: userLatLng,
        title: 'Tu ubicación',
        content: iconEl,
      })
  
      markers.value.set('user-location', userMarker)
    })
  }
  
  defineExpose({
    centerOnUserLocation,
    deleteAllMarkers
  })
  </script>
  
  <style scoped>
  #map {
    width: 100%;
    height: 100%;
  }
  </style>
  