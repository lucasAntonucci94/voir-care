<template>
  <!-- Header -->
  <div class="p-1 md:p-6 bg-primary-md dark:bg-secondary-md border-b border-gray-200 dark:border-gray-700">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button
          @click="goBack"
          class="flex items-center justify-center w-6 h-6 md:w-10 md:h-10 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all duration-300"
          aria-label="Volver a la página anterior"
        >
          <i class="fa-solid fa-arrow-left text-sm md:text-lg"></i>
        </button>
        <h1 class="text-2xl font-bold text-white">Chats</h1>
      </div>
    </div>
  </div>

  <!-- Contenedor principal -->
  <div class="w-full flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900 h-[calc(100vh-3rem)] md:h-[calc(100vh-6rem)]">
    <!-- Columna izquierda: Listado de chats -->
    <transition name="fade">
      <div
        v-if="!showMessages || isDesktop"
        class="w-full md:w-1/3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 m-5 overflow-y-auto max-h-full"
      >
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
          <div class="relative">
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
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Crear nuevo chat
              </button>
              <button
                @click="deleteAllChats"
                class="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Eliminar todos los chats
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
              :src="getUserPhoto(chat) || AvatarImage"
              alt="User avatar"
              class="w-10 h-10 rounded-full mr-3 object-cover transition-transform duration-200 hover:scale-105"
            />
            <div class="flex-1">
              <div class="flex justify-between items-center">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-200">{{ getUserName(chat.users) || 'Usuario desconocido' }}</h3>
                <span class="text-xs text-gray-400 dark:text-gray-300 truncate">{{ formatTimestamp(chat.created_at) }}</span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-300 w-30 sm:w-70 md:w-30 lg:w-40 xl:w-50 truncate">{{ chat.message?.message || 'Sin mensajes' }}</p>
            </div>
            <button
              @click.stop="openDeleteChatModal(chat.idDoc)"
              class="ml-2 p-1 text-gray-500 hover:text-red-700 transition-colors duration-200"
            >
              <i class="fa-solid fa-trash-can w-4 h-4"></i>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal de confirmación al eliminar un chat -->
    <div v-if="showDeleteChatModal" class="fixed inset-0 z-101 flex items-center justify-center">
      <div class="fixed inset-0 bg-black opacity-50"></div>
      <div class="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg w-full max-w-md">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-300 mb-4">Confirmar eliminación</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">¿Estás seguro de que deseas eliminar este chat?</p>
        <div class="flex justify-end space-x-4">
          <button
            @click="closeDeleteChatModal"
            class="px-4 py-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 rounded-xl transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            @click="deleteChat(chatToDelete)"
            class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-xl hover:bg-primary-md dark:hover:bg-secondary-md transition-colors duration-200"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Columna derecha: Lista de mensajes -->
    <transition name="fade">
      <div
        v-if="showMessages || isDesktop"
        class="w-full md:w-2/3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg m-5 flex flex-col max-h-full"
      >
        <ChatMessagesList @go-back="handleGoBack" />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { usePrivateChatsStore } from '../stores/privateChats';
import ChatMessagesList from '../components/organisms/ChatMessagesList.vue';
import { formatTimestamp } from '../utils/formatTimestamp';
import { useAuth } from '../api/auth/useAuth';
import AvatarImage from '../assets/avatar1.jpg';

const { user: userAuth } = useAuth();
const privateChatsStore = usePrivateChatsStore();
const showDeleteChatModal = ref(false);
const chatToDelete = ref(null);
const searchQuery = ref('');
const showActionsMenu = ref(false);
const showMessages = ref(false); // Controla qué vista mostrar en mobile
const isDesktop = ref(false); // Determina si estamos en desktop

// Detectar si estamos en desktop o mobile
const checkIfDesktop = () => {
  isDesktop.value = window.innerWidth >= 768; // 768px es el breakpoint para md en Tailwind
  if (isDesktop.value) {
    showMessages.value = false; // En desktop, siempre mostramos ambas columnas
  }
};

onMounted(() => {
  checkIfDesktop();
  window.addEventListener('resize', checkIfDesktop);
});

// Métodos
const selectChat = (chatId) => {
  privateChatsStore.setSelectedChatId(chatId);
  if (!isDesktop.value) {
    showMessages.value = true; // En mobile, mostramos los mensajes al seleccionar un chat
  }
};

const handleGoBack = () => {
  if (!isDesktop.value) {
    showMessages.value = false; // En mobile, regresamos al listado de chats
    privateChatsStore.setSelectedChatId(null); // Deseleccionamos el chat
  }
};

const openDeleteChatModal = (chatId) => {
  chatToDelete.value = chatId;
  showDeleteChatModal.value = true;
};

const closeDeleteChatModal = () => {
  showDeleteChatModal.value = false;
  chatToDelete.value = null;
};

const deleteChat = (chatId) => {
  privateChatsStore.deleteChat(chatId);
  closeDeleteChatModal();
};

const toggleActionsMenu = () => {
  showActionsMenu.value = !showActionsMenu.value;
};

const createNewChat = () => {
  console.log('Crear nuevo chat');
  showActionsMenu.value = false;
};

const deleteAllChats = () => {
  console.log('Eliminar todos los chats');
  privateChatsStore.deleteAllChats();
  showActionsMenu.value = false;
};

const getUserPhoto = (chat) => {
  if (!chat) return null;
  const selectedEmail = chat.users.find(email => email !== userAuth?.value?.email);
  return selectedEmail
    ? `https://firebasestorage.googleapis.com/v0/b/parcialcwantonucci.appspot.com/o/profile%2F${selectedEmail}.jpg?alt=media&token=a8d69477-990e-4e3d-bba3-8a19a83fccd4`
    : AvatarImage;
};

const getUserName = (usersArray) => {
  const selectedEmail = usersArray.find(email => email !== userAuth?.value?.email);
  return selectedEmail?.split('@')[0].replace('.', ' ');
};

const filteredChats = computed(() => {
  if (!privateChatsStore?.chats?.value) return [];
  if (!searchQuery.value) return privateChatsStore.chats.value;

  const query = searchQuery.value.toLowerCase();
  return privateChatsStore.chats.value.filter(chat => {
    const userName = getUserName(chat.users)?.toLowerCase() || '';
    const userEmail = chat.users.find(email => email !== userAuth?.value?.email)?.toLowerCase() || '';
    return userName.includes(query) || userEmail.includes(query);
  });
});

function goBack() {
  window.history.back();
}
</script>

<style scoped>
.container {
  background-color: #f9f9f9;
}

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

/* Transición de fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Ajustes para mobile */
@media (max-width: 767px) {
  .w-full {
    margin: 0 !important; /* Eliminar márgenes en mobile */
    border-radius: 0 !important; /* Eliminar bordes redondeados en mobile */
  }
}
</style>