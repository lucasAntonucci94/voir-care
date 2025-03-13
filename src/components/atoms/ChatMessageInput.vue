<template>
    <div v-if="selectedChatId" class="p-4 bg-gray-100 border-t border-gray-200">
      <form @submit.prevent="sendMessage" class="flex items-center space-x-4">
        <input
          v-model="messageText"
          type="text"
          placeholder="Escribe un mensaje..."
          class="flex-1 p-3 rounded-2xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary hover:border-primary transition-all duration-200"
          :disabled="loading"
        />
        <button
          type="submit"
          :disabled="messageText.trim().length === 0 || loading"
          class="px-5 py-2.5 bg-primary text-white rounded-2xl shadow-md hover:bg-[#019a8e] hover:shadow-lg transition-colors duration-200 transition-shadow duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <span v-if="!loading">Enviar</span>
          <div v-else class="animate-spin h-5 w-5 border-4 border-t-4 border-b-4 border-white rounded-full"></div>
        </button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue';
  import { usePrivateChats } from '../../composable/usePrivateChats';
  import { usePrivateChatsStore } from '../../stores/privateChats';
  import { useAuth } from '../../api/auth/useAuth';
  
  // Props
  const props = defineProps({
    selectedChatId: {
      type: String,
      default: null,
    },
  });
  
  // Estado reactivo
  const messageText = ref('');
  const loading = ref(false);
  const privateChatsStore = usePrivateChatsStore();
  const { savePrivateMessage } = usePrivateChats();
  const { user } = useAuth();
  
  // Métodos
  const sendMessage = async () => {
    if (messageText.value.trim().length === 0) return;
    debugger
    loading.value = true;
    try {
      const selectedChat = privateChatsStore.chats.value.find(chat => chat.idDoc === props.selectedChatId);
      const otherUser = Object.keys(selectedChat.user).find(u => u !== user?.value.email);
      await savePrivateMessage(user?.value.email, otherUser, messageText.value);
      messageText.value = ''; // Limpiar el input después de enviar
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      loading.value = false;
    }
  };
  
  // Limpiar el input si el chat seleccionado cambia o se pierde
  watch(() => props.selectedChatId, () => {
    messageText.value = '';
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