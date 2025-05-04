<template>
  <div v-if="privateChatsStore.selectedChatId" class="flex flex-col h-full p-4">
    <!-- Header del chat -->
    <div class="flex items-center p-3 bg-gray-200 dark:bg-gray-700 rounded-lg mb-5">
      <button
        v-if="!isDesktop"
        @click="goBack"
        class="mr-3 flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500 transition-all duration-300"
        aria-label="Volver al listado de chats"
      >
        <i class="fa-solid fa-arrow-left text-lg"></i>
      </button>
      <img
        :src="privateChatsStore.getUserPhoto(privateChatsStore.selectedChatId)"
        alt="User avatar"
        class="w-10 h-10 rounded-full mr-3 object-cover transition-transform duration-200 hover:scale-105"
      />
      <div class="flex-1">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-200">
            {{ getUserName(privateChatsStore.getOtherUserEmail(privateChatsStore.selectedChatId)) || 'Usuario desconocido' }}
          </h2>
        </div>
      </div>
    </div>

    <!-- Contenedor de mensajes -->
    <div
      ref="messagesContainer"
      class="flex-1 space-y-3 overflow-y-auto px-3 max-h-[calc(100%-12rem)]"
    >
      <div v-if="loadingMessages" class="flex justify-center bg-gray-50 dark:bg-gray-800 py-6">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
      <div v-else-if="messages.length === 0" class="text-center text-gray-700 bg-gray-50 dark:text-gray-300 dark:bg-gray-700 py-6 italic">
        No hay mensajes en este chat.
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="p-3 rounded-2xl max-w-[70%] break-words relative"
          :class="{
            'bg-gray-200 dark:bg-gray-600 mr-auto': msg?.user?.email !== user?.email,
            'bg-primary-lighter dark:bg-secondary-lighter ml-auto': msg?.user?.email === user?.email
          }"
        >
          <div class="relative">
            <p
              class="text-sm pr-14 font-bold"
              :class="{
                'text-gray-700 dark:text-gray-100 mr-auto': msg?.user?.email !== user?.email,
                'text-gray-700 dark:text-gray-600 ml-auto': msg?.user?.email === user?.email
              }"
            >
              {{ msg?.message }}
            </p>
            <span
              class="text-xs block mt-1"
              :class="{
                'text-gray-500 dark:text-gray-300 mr-auto': msg?.user?.email !== user?.email,
                'text-gray-500 dark:text-gray-500 ml-auto': msg?.user?.email === user?.email
              }"
            >
              {{ msg?.user.email }} - {{ formatDate(msg.created_at) }}
            </span>
            <button
              v-if="msg?.user.email === user?.email"
              @click.stop="openDeleteModal(msg.idDoc)"
              class="absolute top-2 right-2 p-1 rounded-full text-gray-500 hover:text-red-700 transition-colors duration-200 z-10"
            >
              <i class="fa-solid fa-trash-can w-4 h-4"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Input de escritura -->
    <div class="border-t border-gray-200 dark:border-gray-600 mt-4">
      <ChatMessageInput :selectedChatId="privateChatsStore?.selectedChatId" />
    </div>

    <!-- Modal de confirmacion al eliminar un mensaje -->
    <GenericConfirmModal
      :visible="showDeleteModal"
      title="Confirmar eliminación"
      message="¿Estás seguro de que deseas eliminar este mensaje?"
      confirmButtonText="Eliminar"
      cancelButtonText="Cancelar"
      @cancel="closeDeleteModal"
      @confirmed="deleteMessage(messageToDelete)"
    />
  </div>
  <div v-else class="flex-1 bg-white dark:bg-gray-800 dark:text-gray-300 rounded-xl shadow-xl p-5 text-center text-gray-700 border border-gray-200 dark:border-gray-700">
    Selecciona un chat para ver los mensajes.
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { usePrivateChats } from '../../composable/usePrivateChats';
import { usePrivateChatsStore } from '../../stores/privateChats';
import { formatTimestamp } from '../../utils/formatTimestamp';
import ChatMessageInput from '../atoms/ChatMessageInput.vue';
import GenericConfirmModal from '../molecules/GenericConfirmModal.vue';
import { useAuth } from '../../api/auth/useAuth';
import { useSnackbarStore } from '../../stores/snackbar';

// Estado reactivo
const { user } = useAuth();
const privateChatsStore = usePrivateChatsStore();
const messages = ref([]);
const loadingMessages = ref(false);
const unsubscribeMessages = ref(null);
const showDeleteModal = ref(false);
const messageToDelete = ref(null);
const messagesContainer = ref(null);
const isDesktop = ref(false);
const snackbarStore = useSnackbarStore();

// Detectar si estamos en desktop o mobile
const checkIfDesktop = () => {
  isDesktop.value = window.innerWidth >= 768;
};

onMounted(() => {
  checkIfDesktop();
  window.addEventListener('resize', checkIfDesktop);

  console.log('ChatMessagesList montado, selectedChatId:', privateChatsStore?.selectedChatId);
  if (privateChatsStore?.selectedChatId) {
    usePrivateChats().markMessagesAsRead(privateChatsStore?.selectedChatId, user.value.email);
  }
});

onUnmounted(() => {
  console.log('ChatMessagesList desmontado');
  if (unsubscribeMessages.value && typeof unsubscribeMessages.value === 'function') {
    unsubscribeMessages.value();
    unsubscribeMessages.value = null;
  }
  messages.value = [];
  window.removeEventListener('resize', checkIfDesktop);
});

// Cargar mensajes y precargar foto cuando cambia el chat seleccionado
watch(
  () => privateChatsStore?.selectedChatId,
  async (newChatId) => {
    if (unsubscribeMessages.value && typeof unsubscribeMessages.value === 'function') {
      unsubscribeMessages.value();
      unsubscribeMessages.value = null;
    }
    if (newChatId) {
      loadingMessages.value = true;
      const otherUserEmail = privateChatsStore.getOtherUserEmail(newChatId);
      if (!user?.value || !otherUserEmail) {
        loadingMessages.value = false;
        return;
      }
      // Precargar la foto del usuario
      await privateChatsStore.fetchUserPhoto(otherUserEmail);
      unsubscribeMessages.value = usePrivateChats().subscribeToIncomingPrivateMessages(
        user.value.email,
        otherUserEmail,
        (msgs) => {
          console.log('Mensajes recibidos:', msgs);
          messages.value = msgs.map((msg, index) => ({ id: index, ...msg }));
          loadingMessages.value = false;
          scrollToBottom();
        }
      );
      usePrivateChats().markMessagesAsRead(newChatId, user.value.email);
    } else {
      messages.value = [];
      loadingMessages.value = false;
    }
  },
  { immediate: true }
);

// Auto-scroll al final de los mensajes
watch(messages, () => {
  scrollToBottom();
});

// Métodos
const deleteMessage = async (messageId) => {
  console.log('Confirmando eliminación de mensaje ID:', messageId);
  privateChatsStore.deleteMessage(privateChatsStore?.selectedChatId, messageId);
  closeDeleteModal();
  snackbarStore.show('Mensaje eliminado', 'success');
};

const formatDate = (timestamp) => {
  return formatTimestamp(timestamp);
};

const getUserName = (email) => {
  return email?.split('@')[0].replace('.', ' ') || '';
};

const openDeleteModal = (messageId) => {
  console.log('Abriendo modal para mensaje ID:', messageId);
  messageToDelete.value = messageId;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  console.log('Cerrando modal');
  showDeleteModal.value = false;
  messageToDelete.value = null;
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const goBack = () => {
  emit('go-back');
};

const emit = defineEmits(['go-back']);
</script>

<style scoped>
/* Asegurar que el contenedor de mensajes sea desplazable */
.flex-1 {
  min-height: 0; /* Necesario para que flex-1 funcione correctamente en algunos navegadores */
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Ajustes para mobile */
@media (max-width: 767px) {
  .text-xl {
    font-size: 1.125rem; /* Reducir tamaño de texto en mobile */
  }

  .p-3 {
    padding: 0.75rem; /* Reducir padding en mobile */
  }

  .max-w-\[70\%\] {
    max-width: 85%; /* Aumentar el ancho máximo de los mensajes en mobile */
  }

  .max-h-\[calc\(100\%-12rem\)\] {
    max-height: calc(100% - 10rem); /* Ajustar altura en mobile */
  }
}
</style>