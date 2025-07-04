<template>
  <div v-if="selectedChatId" class="p-4 bg-gray-100 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-500">
    <form @submit.prevent="sendMessage" class="flex items-center space-x-4">
      <input
        v-model="messageText"
        id="message-input"
        type="text"
        placeholder="Escribe un mensaje..."
        class="flex-1 p-3 rounded-2xl text-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary hover:border-primary dark:hover:border-secondary transition-all duration-200"
        :disabled="loading"
        minlength="1"
        maxlength="500"
        :aria-label="'Mensaje de ' + (user?.value?.displayName || 'Usuario Anónimo')"
        :aria-required="true"
        :aria-invalid="cleanedMessage.length === 0"
        :aria-describedby="cleanedMessage.length === 0 ? 'message-error' : null"
        @keydown.enter.prevent="sendMessage"
        @input="messageText = sanitizeMessage(messageText)"
        @keyup="messageText = sanitizeMessage(messageText)"
        @paste="messageText = sanitizeMessage(messageText)"
      />
      <button
        type="submit"
        :disabled="loading || cleanedMessage.length === 0"
        class="px-5 py-2.5 bg-primary dark:bg-secondary text-white rounded-2xl shadow-md hover:bg-primary-md hover:bg-priamry-md dark:hover:bg-secondary-md hover:shadow-lg transition-colors duration-200 transition-shadow duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
        :aria-label="'Enviar mensaje a ' + (user?.value?.displayName || 'Usuario Anónimo')"
        :aria-disabled="loading || cleanedMessage.length === 0"
        :aria-pressed="loading"
        :aria-busy="loading"
        :aria-live="loading ? 'polite' : 'off'"
        :aria-describedby="loading ? 'sending-message' : null"
      >
        <span class="sm:inline" v-if="!loading">
          <i class="fas fa-paper-plane"></i>
          <p class="hidden ml-2 sm:inline text-center">Enviar</p> 
        </span>
        <i v-else class="fa-solid fa-spinner animate-spin"></i>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
import { usePrivateChats } from '../../composable/usePrivateChats';
import { usePrivateChatsStore } from '../../stores/privateChats';
import { useAuth } from '../../api/auth/useAuth';

const props = defineProps({
  selectedChatId: {
    type: String,
    default: null,
  },
});

const messageText = ref('');
const loading = ref(false);
const privateChatsStore = usePrivateChatsStore();
const { savePrivateMessage, setUserPresence } = usePrivateChats();
const { user } = useAuth();

const cleanedMessage = computed(() => sanitizeMessage(messageText.value));

const sendMessage = async () => {
  const cleanedMessage = sanitizeMessage(messageText.value);
  if (cleanedMessage.length === 0) return;
  loading.value = true;
  try {
    const selectedChat = privateChatsStore.chats?.value?.find(chat => chat.idDoc === props.selectedChatId);
    const otherUser = selectedChat.users.find(email => email !== user?.value.email);
    await savePrivateMessage(user?.value.email, otherUser, messageText.value);
    messageText.value = ''; // Limpiar el input después de enviar
  } catch (err) {
    console.error('Error sending message:', err);
  } finally {
    loading.value = false;
  }
};

function sanitizeMessage(message) {
  return message
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/[-\u001F\u007F-\u009F]/g, '') // caracteres no imprimibles
}

// Actualizar presencia cuando el usuario abre o cambia de chat
watch(
  () => props.selectedChatId,
  async (newChatId, oldChatId) => {
    if (newChatId && user?.value?.email) {
      // Marcar al usuario como presente en el nuevo chat
      await setUserPresence(newChatId, user.value.email, true);
    }
    if (oldChatId && user?.value?.email) {
      // Marcar al usuario como no presente en el chat anterior
      await setUserPresence(oldChatId, user.value.email, false);
    }
    messageText.value = ''; // Limpiar el input
  },
  { immediate: true }
);

// Marcar al usuario como no presente cuando el componente se desmonta
onUnmounted(async () => {
  if (props.selectedChatId && user?.value?.email) {
    await setUserPresence(props.selectedChatId, user.value.email, false);
  }
});
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>