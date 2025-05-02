<template>
    <Teleport v-if="visible" to="body">
      <div
        class="fixed inset-0 z-20 flex items-center justify-center bg-black/90"
        @click.self="emit('close')"
      >
        <div
          class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 transform transition-all duration-300"
        >
          <!-- Cerrar -->
          <button
            @click="emit('close')"
            class="absolute top-4 right-4 text-gray-500 hover:text-gray-700
                   dark:text-gray-300 dark:hover:text-gray-100 transition duration-200 z-10"
            aria-label="Cerrar modal"
          >
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
  
          <!-- Imagen -->
          <div class="relative mb-4">
            <img
              v-if="location.media.url"
              :src="location.media.url"
              alt="Imagen del lugar"
              class="w-full h-48 object-cover rounded-lg"
            />
            <div
              v-else
              class="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg
                     flex items-center justify-center italic text-gray-500 dark:text-gray-300"
            >
              Sin imagen
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
                class="w-full h-full bg-gray-300 dark:bg-gray-600 flex
                       items-center justify-center font-semibold text-gray-700 dark:text-gray-200"
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
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {{ location.address?.street }}
          </p>
          <p
            v-if="location.contact?.phone"
            class="text-sm text-gray-500 dark:text-gray-400 mb-4"
          >
            Tel: <span class="text-indigo-600 dark:text-indigo-400">{{ location.contact?.phone }}</span>
          </p>
  
          <!-- Detalles desplegables -->
          <div v-if="location.description" class="mb-4">
            <button
              @click="showDetails = !showDetails"
              class="flex items-center gap-2 text-sm font-semibold
                     text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <i :class="showDetails ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"></i>
              {{ showDetails ? 'Ocultar Detalles' : 'Ver Detalles' }}
            </button>
            <div
              v-if="showDetails"
              class="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg
                     text-sm text-gray-600 dark:text-gray-300"
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
              class="flex-1 flex items-center justify-center gap-2 px-3 py-1.5
                     bg-green-600 text-white rounded-lg font-semibold
                     hover:bg-green-700 dark:hover:bg-green-500 transition duration-200 text-sm"
            >
              <i class="fa-solid fa-message"></i>
              Contactar
            </router-link>
  
            <a
              :href="`https://www.google.com/maps/search/?api=1&query=${location.address?.coordinates?.lat},${location.address?.coordinates?.lng}`"
              target="_blank"
              class="flex items-center justify-center gap-2 px-3 py-1.5
                     bg-indigo-600 text-white rounded-lg font-semibold
                     hover:bg-indigo-700 dark:hover:bg-indigo-500 transition duration-200 text-sm"
            >
              <i class="fa-solid fa-map-location-dot"></i>
              Ver en Google Maps
            </a>
  
            <a
              v-if="location.contact?.socialNetworkLink"
              :href="location.contact?.socialNetworkLink"
              target="_blank"
              class="flex items-center justify-center gap-2 px-3 py-1.5
                     bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                     rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600
                     transition duration-200 text-sm"
            >
              <i class="fa-solid fa-link"></i>
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
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-xs p-5 transition-all">
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
                    class="flex items-center justify-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-green-500 transition duration-200 text-sm"
                >
                    <i class="fa-solid fa-message"></i>
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
  import { useAuth } from '../../api/auth/useAuth'
  import { useRouter } from 'vue-router';
  import { usePrivateChatsStore } from '../../stores/privateChats';
  import { usePrivateChats } from '../../composable/usePrivateChats';

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
    debugger
  if (userAuth.value.email && props.location.user?.email) {
    const chatId = await getChatIdByReference(userAuth.value.email, props.location?.user?.email);
    privateChatsStore.setSelectedChatId(chatId);
    privateChatsStore.setFromEmail(userAuth.value.email);
    privateChatsStore.setToEmail(props.location?.user?.email);
  }
}
</script>