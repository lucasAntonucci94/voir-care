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
  if (isDesktop.value) {
    showMessages.value = false;
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
    privateChatsStore.setSelectedChatId(null);
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