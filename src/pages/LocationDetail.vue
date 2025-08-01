<template>
  <!-- Muestra un mensaje de carga mientras se obtienen los datos del marcador -->
  <div v-if="loading" class="flex items-center justify-center h-screen">
    <p class="text-lg text-gray-500 dark:text-gray-300">Cargando ubicación...</p>
  </div>

  <!-- Muestra un mensaje de error si el marcador no se encuentra -->
  <div v-else-if="!location" class="flex items-center justify-center h-screen">
    <p class="text-lg text-red-500 dark:text-red-400">Ubicación no encontrada.</p>
  </div>

  <!-- Contenido principal una vez que los datos están cargados -->
  <div v-else class="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
    <!-- Banner -->
    <div @click="openMediaModal(location.media.url, location.media.type)" class="relative w-full h-64 md:h-96 overflow-hidden cursor-pointer">
      <template v-if="location.media?.type === 'image' && location.media?.url">
        <img
          :src="location.media.url"
          alt="Banner del marcador"
          class="w-full h-full object-cover"
        />
      </template>
      <template v-else-if="location.media?.type === 'video' && location.media?.url">
        <video
          :src="location.media.url"
          autoplay
          loop
          muted
          title="Banner por defecto"
          class="w-full h-full object-cover"
        ></video>
      </template>
      <template v-else>
        <img
          :src="defaultBanner"
          alt="Banner por defecto"
          class="w-full h-full object-cover"
        />
      </template>
      <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70"></div>
      <div class="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
          {{ location.title }}
        </h1>
      </div>
    </div>
    <!-- Media Modal -->
    <MediaModalViewer
        :visible="showMediaModal"
        :media="selectedMedia"
        @close="closeMediaModal"
    />
    <!-- Contenedor principal de detalles -->
    <div class="container mx-auto px-4 md:px-8 py-6 h-full">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

        <!-- Columna izquierda: Información detallada del marcador -->
        <div class="lg:col-span-2 flex flex-col space-y-6">
          <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 class="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Información</h2>
            <ul class="space-y-4 text-gray-600 dark:text-gray-300">
              <li class="flex items-start gap-3">
                <i class="fas fa-info-circle text-primary dark:text-secondary text-xl"></i>
                <span><strong>Descripción:</strong> {{ location.description || 'Sin descripción' }}</span>
              </li>
              <li class="flex items-start gap-3">
                <i class="fas fa-tag text-primary dark:text-secondary text-xl"></i>
                <span><strong>Tipo:</strong> {{ location.type || 'No especificado' }}</span>
              </li>
              <li v-if="location.value?.timestamp" class="flex items-start gap-3">
                <i class="fas fa-calendar-alt text-primary dark:text-secondary text-xl"></i>
                <span><strong>Creado:</strong> {{ formattedTimestamp }}</span>
              </li>
              <li class="flex items-start gap-3">
                <i class="fas fa-map-marker-alt text-primary dark:text-secondary text-xl"></i>
                <span><strong>Dirección:</strong> {{ location.address?.street || 'No definida' }}</span>
              </li>
            </ul>
          </div>

          <!-- Card de Contacto -->
          <div v-if="location.contact" class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700 flex-grow">
            <h2 class="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Contacto</h2>
            <ul class="space-y-4 text-gray-600 dark:text-gray-300">
              <li v-if="location.contact.phone" class="flex items-start gap-3">
                <i class="fas fa-phone text-primary dark:text-secondary text-xl"></i>
                <span>
                  <strong class="pr-2">Teléfono:</strong>
                  <a :href="`tel:${location.contact.phone}`" class="hover:underline text-primary dark:text-secondary break-all">
                    {{ location.contact.phone }}
                  </a>
                </span>
              </li>
              <li v-if="location.contact.socialNetworkLink" class="flex items-start gap-3">
                <i class="fas fa-link text-primary dark:text-secondary text-xl"></i>
                <span>
                  <strong>Red social:</strong>
                  <a :href="location.contact.socialNetworkLink" target="_blank" rel="noopener noreferrer" class="hover:underline text-primary dark:text-secondary break-all">
                    {{ location.contact.socialNetworkLink }}
                  </a>
                </span>
              </li>
            </ul>
          </div>
          <!-- Card de Creador -->
          <div v-if="location.user" class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div class="flex justify-between items-center mb-4">
                  <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-100">Creado por</h2>
                  <button
                      v-if="user && location.user.id !== user.uid"
                      @click="sendMessageToCreator"
                      class="flex items-center gap-2 px-4 py-2 text-sm bg-primary dark:bg-secondary text-white rounded-lg shadow-sm hover:bg-primary-md dark:hover:bg-secondary-md transition-colors duration-200 cursor-pointer"
                      aria-label="Enviar mensaje al creador"
                  >
                      <i class="fas fa-envelope"></i>
                      <span class="hidden md:inline">Enviar mensaje</span>
                  </button>
              </div>
             <router-link :to="`/profile/${location.user.email}`" class="flex items-center gap-4">
                  <img
                      v-if="location.user.photoURLFile"
                      :src="location.user.photoURLFile"
                      alt="Foto de perfil del creador"
                      class="w-12 h-12 rounded-full object-cover border-2 border-primary-light"
                  />
                  <i v-else class="fas fa-user-circle text-6xl text-primary-light"></i>
                  <span class="text-lg font-medium">{{ location.user.displayName || 'Usuario anónimo' }}</span>
              </router-link>
              
          </div>
        </div>

        <!-- Columna derecha: Mapa de ubicación -->
        <div class="lg:col-span-1 space-y-6 h-full">
          <div v-if="location.address?.street" class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700 h-full flex flex-col">
            <h2 class="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Ubicación</h2>
            <div class="w-full h-full rounded-lg overflow-hidden flex-grow">
              <iframe
                class="w-full h-full"
                :src="`https://www.google.com/maps/embed/v1/place?q=${encodeURIComponent(location.address.street)}&key=AIzaSyDbCImtrddG3Zm7roBIeYMWug-rsfoCH7c`"
                allowfullscreen
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLocationsStore } from '../stores/locations';
import { usePrivateChatsStore } from '../stores/privateChats';
import { usePrivateChats } from '../composable/usePrivateChats';
import { useAuth } from '../api/auth/useAuth';
import MediaModalViewer from '../components/molecules/MediaViewerModal.vue';
import defaultBanner from '../assets/default-banner.jpg';
import { useStorage } from '../composable/useStorage';
const route = useRoute();
const router = useRouter();
const locationsStore = useLocationsStore();
const privateChatsStore = usePrivateChatsStore();
const { getChatIdByReference } = usePrivateChats();
const { user } = useAuth();

const location = ref(null);
const loading = ref(true);
const selectedMedia = ref({ src: '', type: 'image' });
const showMediaModal = ref(false);

const formattedTimestamp = computed(() => {
    debugger
    if (location.value && location.value.timestamp) {
      debugger
    // Si location.value.timestamp es un objeto Timestamp de Firebase
    const date = location.value.timestamp.toDate();
    // Formato de fecha dd/mm/yyyy hh:mm
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
  return 'No disponible';
});

// Función para cargar los datos del marcador
const loadLocationData = async (id) => {
  if (!id) {
    loading.value = false;
    return;
  }
  try {
    loading.value = true;
    location.value = await locationsStore.fetchLocationByIdDoc(id);
    
    if (location.value?.media) {
        const { getFileUrl } = useStorage();
        location.value.user.photoURLFile = await getFileUrl(`profile/${location.value.user.email}.jpg`);
    }
  } catch (error) {
    console.error('Error al cargar ubicación:', error);
    location.value = null;
  } finally {
    loading.value = false;
  }
};

// Modal functions
const openMediaModal = (url,type) => {
  if (!url) return;
  selectedMedia.value = { src: url, type: type };
  showMediaModal.value = true;
  document.body.style.overflow = 'hidden';
};

const closeMediaModal = () => {
  selectedMedia.value = { src: '', type: 'image' };
  showMediaModal.value = false;
  document.body.style.overflow = '';
};

// Función para enviar un mensaje al creador
const sendMessageToCreator = async () => {
  if (!user.value?.email || !location.value?.user?.email) {
    console.error('No se puede enviar el mensaje: falta el email del usuario o del creador.');
    return;
  }
  try {
    const chatId = await getChatIdByReference(user.value.email, location.value.user.email);
    privateChatsStore.setSelectedChatId(chatId);
    privateChatsStore.setFromEmail(user.value.email);
    privateChatsStore.setToEmail(location.value.user.email);
    router.push('/chats');
  } catch (error) {
    console.error('Error al crear/abrir el chat:', error);
  }
};


watch(
  () => route.params.idLocation,
  async (newId) => {
    if (newId) {
      location.value = null;
      await loadLocationData(newId);
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.container {
  max-width: 1300px;
}

iframe {
  border: 0;
}
</style>