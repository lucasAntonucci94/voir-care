<template>
    <div class="relative w-full h-[60vh] md:h-[70vh]">
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 z-10">
        <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
        </svg>
      </div>
      <div id="map" class="w-full h-full rounded-b-2xl"></div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
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
const markers = ref([])
const MarkerConstructor = ref(null)
onMounted(async () => {
  await initMap()
  emit('map-ready')
})

onBeforeUnmount(() => {
  deleteAllMarkers()
})

watch(
  () => props.locations,
  async () => {
    await updateMapMarkers()
  },
  { deep: true }
)

async function initMap() {
  try {
    await loadGoogleMaps({ libraries: ['marker'] })
    const { Marker } = await window.google.maps.importLibrary('marker')
    MarkerConstructor.value = Marker
    const { Map } = await window.google.maps.importLibrary('maps')
    map.value = new Map(document.getElementById('map'), {
      center: { lat: -34.59, lng: -58.5 },
      zoom: 11,
      mapId: '98046a6e59cbc455',
      styles: [
        { featureType: 'poi', stylers: [{ visibility: 'simplified' }] },
        { featureType: 'poi.park', stylers: [{ visibility: 'on' }] }
      ]
    })
  } catch (err) {
    console.error('Error al inicializar el mapa:', err)
  }
}

function deleteAllMarkers() {
  console.log('Eliminando marcadores:', markers.value.length)
  for (let i = markers.value.length - 1; i >= 0; i--) {
    const marker = markers.value[i]
    if (marker && typeof marker.setMap === 'function') {
      marker.setMap(null)
    }
    markers.value.splice(i, 1) // eliminarlo del array
  }
}

function centerOnUserLocation() {
  if (!navigator.geolocation || !map.value) return
  navigator.geolocation.getCurrentPosition((position) => {
    const userLatLng = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    }
    map.value.setCenter(userLatLng)
    map.value.setZoom(15)

    addCustomMarker(userLatLng, 'Tu ubicación', 'https://img.icons8.com/?size=100&id=13800&format=png')
  })
}

function addCustomMarker(position, title, iconUrl) {
  const marker = new MarkerConstructor.value({
    position,
    map: map.value,
    title,
    icon: {
      url: iconUrl,
      scaledSize: new google.maps.Size(40, 40)
    }
  })
  markers.value.push(marker)
}

function getMarkerIcon(type) {
  const iconMap = {
    plaza: CatIcon,
    parque: CatIcon,
    veterinaria: DogIcon,
    petshop: DogIcon,
    servicio: CatIcon
  }
  return {
    url: iconMap[type] || CatIcon,
    scaledSize: new google.maps.Size(40, 40)
  }
}

async function updateMapMarkers() {
  if (!window.google || !MarkerConstructor.value) return

  console.log('Reiniciando mapa y markers...')

  // Reiniciar instancia del mapa - porque no tengo idea de por qué no se borran los markers viejos ya probe de todo me HARTE.
  const { Map } = await window.google.maps.importLibrary('maps')
  map.value = new Map(document.getElementById('map'), {
    center: { lat: -34.59, lng: -58.5 },
    zoom: 11,
    mapId: '98046a6e59cbc455',
    styles: [
      { featureType: 'poi', stylers: [{ visibility: 'simplified' }] },
      { featureType: 'poi.park', stylers: [{ visibility: 'on' }] }
    ]
  })

  // Limpiar marcadores anteriores
  deleteAllMarkers()
  await nextTick()

  for (const location of props.locations) {
    if (!location.lat || !location.lng) continue

    const marker = new MarkerConstructor.value({
      position: { lat: location.lat, lng: location.lng },
      map: map.value,
      title: location.title,
      icon: getMarkerIcon(location.type)
    })

    const infoWindowContent = `
      <div class="p-4 max-w-sm bg-white rounded-lg shadow-lg border border-gray-100">
        <h3 class="text-lg font-bold text-gray-900 mb-2">${location.title}</h3>
        <p class="text-sm text-gray-600 mb-1">${location.detail}</p>
        <p class="text-xs text-gray-500">${location.address}</p>
      </div>`

    const infoWindow = new google.maps.InfoWindow({ content: infoWindowContent })
    marker.addListener('click', () => {
      infoWindow.open({ anchor: marker, map: map.value })
    })

    markers.value.push(marker)
  }
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
