<template>
  <div v-if="privateChatsStore.selectedChatId" class="flex flex-col h-full">
    <!-- Header del chat -->
    <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 dark:bg-gray-700 mb-5 bg-gray-200 p-3 rounded-lg flex items-center">
      <span class="mr-2">💬</span>
      Chat con {{ getUserName(getOtherUserEmail()) || 'Usuario desconocido' }}
    </h2>

    <!-- Contenedor de mensajes -->
    <div ref="messagesContainer" class="flex-1 space-y-3 overflow-y-auto px-3">
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
    <div class="border-t border-gray-200 dark:border-gray-600">
      <ChatMessageInput :selectedChatId="privateChatsStore?.selectedChatId" />
    </div>

    <!-- Modal de confirmación integrado -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-101 flex items-center justify-center">
      <div class="fixed inset-0 bg-black opacity-50"></div>
      <div class="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg w-full max-w-md">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-300 mb-4">Confirmar eliminación</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">¿Estás seguro de que deseas eliminar este mensaje?</p>
        <div class="flex justify-end space-x-4">
          <button
            @click="closeDeleteModal"
            class="px-4 py-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 rounded-xl transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            @click="deleteMessage(messageToDelete)"
            class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-xl hover:bg-primary-md dark:hover:bg-secondary-md transition-colors duration-200"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
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
import { useAuth } from '../../api/auth/useAuth';

// Estado reactivo
const { user } = useAuth();
const privateChatsStore = usePrivateChatsStore();
const messages = ref([]);
const loadingMessages = ref(false);
const unsubscribeMessages = ref(null);
const showDeleteModal = ref(false);
const messageToDelete = ref(null);
const messagesContainer = ref(null);

// Montaje y desmontaje
onMounted(() => {
  console.log('ChatMessagesList montado, selectedChatId:', privateChatsStore?.selectedChatId);
  if (privateChatsStore?.selectedChatId) {
    usePrivateChats().markMessagesAsRead(privateChatsStore?.selectedChatId, user.value.email);
  }
  watch(
    () => privateChatsStore?.selectedChatId,
    (newChatId) => {
      if (unsubscribeMessages.value && typeof unsubscribeMessages.value === 'function') {
        unsubscribeMessages.value();
        unsubscribeMessages.value = null;
      }
      if (newChatId) {
        loadingMessages.value = true;
        const otherUser = getOtherUserEmail();
        if (!user?.value || !otherUser) return;
        unsubscribeMessages.value = usePrivateChats().subscribeToIncomingPrivateMessages(
          user.value.email,
          otherUser,
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
      }
    },
    { immediate: true }
  );

  // Auto-scroll al final de los mensajes
  watch(messages, () => {
    scrollToBottom();
  });
});

onUnmounted(() => {
  console.log('ChatMessagesList desmontado');
  if (unsubscribeMessages.value && typeof unsubscribeMessages.value === 'function') {
    unsubscribeMessages.value();
    unsubscribeMessages.value = null;
  }
  messages.value = [];
});

const deleteMessage = async (messageId) => {
  console.log('Confirmando eliminación de mensaje ID:', messageId);
  privateChatsStore.deleteMessage(privateChatsStore?.selectedChatId, messageId);
  closeDeleteModal();
};

// Métodos
const formatDate = (timestamp) => {
  return formatTimestamp(timestamp);
};

const getUserName = (email) => {
  return email?.split('@')[0].replace('.', ' ');
};

const getOtherUserEmail = () => {
  const chatId = privateChatsStore?.selectedChatId;
  const selectedChat = privateChatsStore.chats?.value?.find(chat => chat.idDoc === chatId);

  return selectedChat
    ? selectedChat.users.find(email => email !== user?.value.email)
    : privateChatsStore?.to || null;
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
</style>