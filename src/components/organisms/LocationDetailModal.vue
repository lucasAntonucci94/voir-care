<template>
    <Teleport v-if="visible" to="body">
      <div
        class="fixed inset-0 z-20 flex items-center justify-center bg-black/90"
        @click.self="emit('close')"
      >
        <div
          class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-md mx-4 p-6 transform transition-all duration-300 scale-95"
          :class="{ 'scale-100': visible }"
        >
          <!-- Cerrar -->
          <button
            @click="emit('close')"
            class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 transition duration-200 z-10"
            aria-label="Cerrar modal"
          >
            <i class="fa-solid fa-xmark text-xl"></i>
          </button>

          <!-- Imagen con chip -->
          <div class="relative mb-4">
            <img
              v-if="location.media.url"
              :src="location.media.url"
              alt="Imagen del lugar"
              class="w-full h-48 object-cover rounded-lg"
            />
            <div
              v-else
              class="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-300"
            >
              <i class="fa-solid fa-camera text-3xl"></i>
            </div>
            <!-- Chip de tipo -->
            <div
              class="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-white shadow-sm transition-all duration-200"
              :class="chipStyle"
            >
              <img :src="locationType?.icon" :alt="`${locationType?.label} icon`" class="w-4 h-4 object-contain" />
              <span>{{ locationType?.label || 'Desconocido' }}</span>
            </div>
          </div>

          <!-- Título -->
          <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {{ location.title }}
          </h3>

          <!-- Usuario -->
          <div class="flex items-center gap-2 mb-3">
            <div class="w-8 h-8 rounded-full overflow-hidden">
              <img
                v-if="location.user?.photoURLFile"
                :src="location.user.photoURLFile"
                alt="Avatar usuario"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center font-semibold text-gray-700 dark:text-gray-200"
              >
                {{ location.user?.email?.charAt(0).toUpperCase() || 'U' }}
              </div>
            </div>
            <button
              @click="openProfile"
              class="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {{ location.user?.displayName || location.user?.email || 'Usuario desconocido' }}
            </button>
          </div>

          <!-- Dirección y teléfono -->
          <p class="text-base text-gray-500 dark:text-gray-400 mb-2">
            {{ location.address?.street }}
          </p>
          <p
            v-if="location.contact?.phone"
            class="text-base text-gray-500 dark:text-gray-400 mb-4"
          >
            Tel: <span class="text-indigo-600 dark:text-indigo-400">{{ location.contact?.phone }}</span>
          </p>

          <!-- Detalles desplegables -->
          <div v-if="location.description" class="mb-4">
            <button
              @click="showDetails = !showDetails"
              class="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <i :class="showDetails ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"></i>
              {{ showDetails ? 'Ocultar Detalles' : 'Ver Detalles' }}
            </button>
            <div
              v-if="showDetails"
              class="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-base text-gray-600 dark:text-gray-300 transition-all duration-200"
            >
              {{ location.description }}
            </div>
          </div>

          <!-- Acciones -->
          <div class="flex flex-col gap-3">
            <router-link
              v-if="location.user.email !== userAuth.email"
              to="/chats"
              @click="sendMessage"
              class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-green-500 transition duration-200 text-sm"
            >
              <i class="fa-solid fa-message text-base"></i>
              Contactar
            </router-link>

            <a
              :href="`https://www.google.com/maps/search/?api=1&query=${location.address?.coordinates?.lat},${location.address?.coordinates?.lng}`"
              target="_blank"
              class="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-500 transition duration-200 text-sm"
            >
              <i class="fa-solid fa-map-location-dot text-base"></i>
              Ver en Google Maps
            </a>

            <a
              v-if="location.contact?.socialNetworkLink"
              :href="location.contact?.socialNetworkLink"
              target="_blank"
              class="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200 text-sm"
            >
              <i class="fa-solid fa-link text-base"></i>
              Visitar Redes Sociales
            </a>
          </div>
        </div>

        <!-- Submodal de perfil -->
        <Teleport to="body">
          <div
            v-if="showUserProfile"
            class="absolute inset-0 flex items-center justify-center bg-black/50 z-30"
            @click.self="showUserProfile = false"
          >
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-xs p-5 transition-all duration-200 scale-95"
                 :class="{ 'scale-100': showUserProfile }">
              <button
                @click="showUserProfile = false"
                class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 transition duration-200"
              >
                <i class="fa-solid fa-xmark text-lg"></i>
              </button>
              <div class="flex flex-col items-center">
                <div
                  class="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center font-semibold text-gray-700 dark:text-gray-200 text-2xl mb-3"
                >
                  {{ initials }}
                </div>
                <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {{ location.user?.email || 'Usuario desconocido' }}
                </h4>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Creador de esta ubicación
                </p>
                <router-link
                  v-if="location.user.email !== userAuth.email"
                  to="/chats"
                  @click="sendMessage"
                  class="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-green-500 transition duration-200 text-sm"
                >
                  <i class="fa-solid fa-message text-base"></i>
                  Enviar Mensaje
                </router-link>
              </div>
            </div>
          </div>
        </Teleport>
      </div>
    </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useAuth } from '../../api/auth/useAuth';
import { useRouter } from 'vue-router';
import { usePrivateChatsStore } from '../../stores/privateChats';
import { usePrivateChats } from '../../composable/usePrivateChats';
import CatIcon from '../../assets/icons/cat_1998592.png';
import VetIcon1 from '../../assets/icons/locations/vet1.png';
import TrainerIcon1 from '../../assets/icons/locations/entrenador1.png';
import PaseadorIcon1 from '../../assets/icons/locations/paseador1.png';
import Guarderiacon1 from '../../assets/icons/locations/guarderia1.png';
import ParcoIcon1 from '../../assets/icons/locations/parque1.png';
import PetfriendlyIcon1 from '../../assets/icons/locations/petfriendly1.png';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  location: {
    type: Object,
    required: true,
  },
});

const { getChatIdByReference } = usePrivateChats();
const emit = defineEmits(['close']);
const { user: userAuth } = useAuth();
const showDetails = ref(false);
const showUserProfile = ref(false);
const router = useRouter();
const privateChatsStore = usePrivateChatsStore();

// Lista de tipos de ubicación con íconos
const locationTypes = ref([
  { id: 'veterinaria', label: 'Veterinaria', icon: VetIcon1, color: 'bg-indigo-600' },
  { id: 'petshop', label: 'Pet Shop', icon: CatIcon, color: 'bg-purple-600' },
  { id: 'guarderia', label: 'Guardería', icon: Guarderiacon1, color: 'bg-green-600' },
  { id: 'petfriendly', label: 'Pet Friendly', icon: PetfriendlyIcon1, color: 'bg-blue-600' },
  { id: 'paseador', label: 'Paseador', icon: PaseadorIcon1, color: 'bg-yellow-600' },
  { id: 'entrenador', label: 'Entrenador', icon: TrainerIcon1, color: 'bg-red-600' },
  { id: 'parque', label: 'Parque', icon: ParcoIcon1, color: 'bg-teal-600' },
]);

// Encontrar el tipo de ubicación correspondiente
const locationType = computed(() => {
  return locationTypes.value.find(type => type.id === props.location.type) || {};
});

// Estilo dinámico para el chip basado en el tipo
const chipStyle = computed(() => {
  return locationType.value.color || 'bg-gray-600';
});

// Resetear estados cuando el modal se cierra
watch(() => props.visible, (newVisible) => {
  if (!newVisible) {
    showDetails.value = false;
    showUserProfile.value = false;
  }
});

const initials = computed(() =>
  (props.location.user?.email?.charAt(0) || 'U').toUpperCase()
);

function openProfile() {
  showUserProfile.value = true;
}

async function sendMessage() {
  if (userAuth.value.email && props.location.user?.email) {
    const chatId = await getChatIdByReference(userAuth.value.email, props.location?.user?.email);
    privateChatsStore.setSelectedChatId(chatId);
    privateChatsStore.setFromEmail(userAuth.value.email);
    privateChatsStore.setToEmail(props.location?.user?.email);
  }
}
</script>