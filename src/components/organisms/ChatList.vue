<template>
  <div class="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 overflow-y-auto h-full">
    <!-- Campo de búsqueda y botón de acciones -->
    <div class="flex items-center gap-3 mb-5">
      <div class="relative flex-1">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por nombre o email..."
          class="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary"
        />
        <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"></i>
      </div>
      <div class="relative" ref="dropdownRef">
        <button
          @click="toggleActionsMenu"
          class="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-all duration-300"
          aria-label="Más acciones"
        >
          <i class="fa-solid fa-ellipsis-vertical text-lg"></i>
        </button>
        <div
          v-if="showActionsMenu"
          class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg z-10 border border-gray-200 dark:border-gray-600"
        >
          <button
            @click="createNewChat"
            class="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <i class="fas fa-message mr-2"></i>
            <span class="hidden md:block">
              Crear chat
            </span>
          </button>
          <button
          @click="deleteAllChats"
          class="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          :disabled="privateChatsStore?.loading || privateChatsStore?.chats?.value.length === 0"
          :class="{ 'cursor-not-allowed opacity-50': privateChatsStore?.loading || privateChatsStore?.chats?.value.length === 0 }"
          >
            <i class="fas fa-trash-can mr-2"></i>
            <span class="hidden md:block">
              Eliminar chats
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Listado de chats -->
    <div v-if="privateChatsStore?.loading" class="flex justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>
    <div v-else-if="filteredChats.length === 0" class="text-center text-gray-500 italic py-4 min-h-[200px] flex items-center justify-center">
      No tienes chats con mensajes.
    </div>
    <div v-else class="space-y-3">
      <div
        v-for="chat in filteredChats"
        :key="chat.idDoc"
        class="flex items-center p-3 rounded-xl transition-all duration-200 cursor-pointer"
        :class="{
          'bg-gray-100 dark:bg-gray-600 border-l-4 border-primary dark:border-secondary': privateChatsStore?.selectedChatId === chat.idDoc,
          'hover:bg-gray-50 dark:hover:bg-gray-700': privateChatsStore?.selectedChatId !== chat.idDoc
        }"
        @click="selectChat(chat.idDoc)"
      >
        <img
          :src="getChatUserPhoto(chat.idDoc)"
          alt="User avatar"
          class="w-10 h-10 rounded-full mr-3 object-cover transition-transform duration-200 hover:scale-105"
        />
        <div class="flex-1">
          <div class="flex justify-between items-center">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-200">
              {{ getUserName(chat.idDoc) || 'Usuario desconocido' }}
            </h3>
            <span class="text-xs text-gray-400 dark:text-gray-300 truncate">{{ formatTimestamp(chat.created_at) }}</span>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-300 w-30 sm:w-70 md:w-30 lg:w-40 xl:w-50 truncate">
            {{ chat.message?.message || 'Sin mensajes' }}
          </p>
        </div>
        <button
          @click.stop="openDeleteChatModal(chat.idDoc)"
          class="ml-2 p-1 text-gray-500 hover:text-red-700 transition-colors duration-200"
        >
          <i class="fa-solid fa-trash-can w-4 h-4"></i>
        </button>
      </div>
    </div>
    <NewChatModal ref="newChatModal" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { usePrivateChatsStore } from '../../stores/privateChats';
import { useSnackbarStore } from '../../stores/snackbar';
import { formatTimestamp } from '../../utils/formatTimestamp';
import NewChatModal from '../molecules/NewChatModal.vue';

const privateChatsStore = usePrivateChatsStore();
const snackbarStore = useSnackbarStore();
const searchQuery = ref('');
const showActionsMenu = ref(false);
const newChatModal = ref(null); // Reference to the NewChatModal component
const dropdownRef = ref(null);
// Emite eventos para el componente padre
const emit = defineEmits(['selectChat', 'openDeleteChatModal']);

// Manejo los click del contenedor del dropdown
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    showActionsMenu.value = false;
  }
};

// Métodos
const selectChat = (chatId) => {
  privateChatsStore.setSelectedChatId(chatId);
  emit('selectChat', chatId);
};

const openDeleteChatModal = (chatId) => {
  emit('openDeleteChatModal', chatId);
};

const toggleActionsMenu = () => {
  showActionsMenu.value = !showActionsMenu.value;
};

const createNewChat = () => {
  newChatModal.value.openModal();
  showActionsMenu.value = false;
};

const deleteAllChats = () => {
  privateChatsStore.deleteAllChats();
  showActionsMenu.value = false;
  snackbarStore.show('Chats eliminados', 'success');
};

// Obtener la foto de perfil para un chat
const getChatUserPhoto = (chatId) => {
  return privateChatsStore.getUserPhoto(chatId);
};

// Obtener el nombre del otro usuario
const getUserName = (chatId) => {
  const email = privateChatsStore.getOtherUserEmail(chatId);
  return email?.split('@')[0].replace('.', ' ') || '';
};

// Filtrar chats según la búsqueda
const filteredChats = computed(() => {
  if (!privateChatsStore?.chats?.value) return [];
  if (!searchQuery.value) return privateChatsStore.chats.value;

  const query = searchQuery.value.toLowerCase();
  return privateChatsStore.chats.value.filter(chat => {
    const userName = getUserName(chat.idDoc)?.toLowerCase() || '';
    const userEmail = privateChatsStore.getOtherUserEmail(chat.idDoc)?.toLowerCase() || '';
    return userName.includes(query) || userEmail.includes(query);
  });
});

// Cargar fotos iniciales
onMounted(() => {
  privateChatsStore.loadChatPhotos();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>