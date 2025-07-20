<template>
  <!-- Botón "Volver" para Desktop: Visible solo en desktop, posicionado en la esquina superior izquierda -->
  <button
    v-if="isDesktop"
    @click="goBack"
    class="absolute top-4 left-5 z-20 flex items-center px-4 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300"
    aria-label="Volver a la página anterior"
  >
    <i class="fa-solid fa-arrow-left text-lg mr-2"></i>
    <span class="font-semibold">Volver</span>
  </button>
  <!-- Contenedor principal -->
  <div class="w-full flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900 h-[calc(100vh-1rem)] md:h-[calc(92vh-6rem)] relative md:mt-12">
    <!-- Columna izquierda: Listado de chats -->
    <transition name="fade">
      <div
        v-if="!showMessages || isDesktop"
        class="w-full md:w-1/3 m-5"
      >
        <ChatList
          @select-chat="handleSelectChat"
          @open-delete-chat-modal="openDeleteChatModal"
        />
      </div>
    </transition>

    <!-- Modal de confirmación al eliminar un chat -->
    <GenericConfirmModal
      :visible="showDeleteChatModal"
      title="Confirmar eliminación"
      message="¿Estás seguro de que deseas eliminar este chat?"
      confirmButtonText="Eliminar"
      cancelButtonText="Cancelar"
      @cancel="closeDeleteChatModal"
      @confirmed="deleteChat(chatToDelete)"
    />
    
    <!-- Columna derecha: Lista de mensajes -->
    <transition name="fade">
      <div
        v-if="showMessages || isDesktop"
        class="w-full md:w-2/3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg m-5 flex flex-col max-h-full"
      >
        <!-- El botón "Volver" específico para móvil se ha eliminado de aquí,
             ya que el botón principal ahora maneja la navegación en desktop.
             En móvil, la lógica de `handleGoBack` se activa al ocultar `ChatMessagesList`. -->
          
        <ChatMessagesList @go-back="handleGoBack" />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { usePrivateChatsStore } from '../stores/privateChats';
import ChatMessagesList from '../components/organisms/ChatMessagesList.vue';
import ChatList from '../components/organisms/ChatList.vue';
import { useSnackbarStore } from '../stores/snackbar';
import GenericConfirmModal from '../components/molecules/GenericConfirmModal.vue';

const privateChatsStore = usePrivateChatsStore();
const snackbarStore = useSnackbarStore();
const showDeleteChatModal = ref(false);
const chatToDelete = ref(null);
const showMessages = ref(false);
const isDesktop = ref(false);

// Detectar si estamos en desktop o mobile
const checkIfDesktop = () => {
  isDesktop.value = window.innerWidth >= 768;
  // En desktop, siempre mostramos ambas columnas, así que no necesitamos showMessages
  // En mobile, si pasamos de desktop a mobile, ocultamos los mensajes para ver la lista de chats
  if (isDesktop.value) {
    showMessages.value = false; // Asegura que al redimensionar a desktop, se muestre la lista de chats por defecto
  }
};

onMounted(() => {
  checkIfDesktop();
  window.addEventListener('resize', checkIfDesktop);
});

// Limpiar eventos al desmontar
onUnmounted(() => {
  window.removeEventListener('resize', checkIfDesktop);
});

// Métodos
const handleSelectChat = (chatId) => {
  privateChatsStore.setSelectedChatId(chatId);
  if (!isDesktop.value) {
    showMessages.value = true;
  }
};

const handleGoBack = () => {
  if (!isDesktop.value) {
    showMessages.value = false;
    privateChatsStore.setSelectedChatId(null); // Deselecciona el chat actual
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
  snackbarStore.show('Chat eliminado', 'success');
};

// Función para volver a la página anterior en el historial del navegador
const goBack = () => {
  window.history.back();
};
</script>

<style scoped>
.container {
  background-color: #f9f9f9;
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
    margin: 0 !important;
    border-radius: 0 !important;
  }
}
</style>
