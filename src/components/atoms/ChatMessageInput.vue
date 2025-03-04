<template>
    <div v-if="selectedChatId" class="p-3 bg-white border-t border-gray-100">
      <form @submit.prevent="sendMessage" class="flex items-center space-x-3">
        <input
          v-model="messageText"
          type="text"
          placeholder="Escribe un mensaje..."
          class="flex-1 p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#02bcae] transition-all duration-200"
          :disabled="loading"
        />
        <button
          type="submit"
          :disabled="messageText.trim().length === 0 || loading"
          class="px-4 py-2 bg-[#02bcae] text-white rounded-xl hover:bg-[#019a8e] transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <span v-if="!loading">Enviar</span>
          <div v-else class="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
        </button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, defineProps, watch } from 'vue';
  import { usePrivateChats } from '../../composable/usePrivateChats';
  import { usePrivateChatsStore } from '../../stores/privateChats';
  
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
  
  // Métodos
  const sendMessage = async () => {
    if (messageText.value.trim().length === 0) return;
  
    loading.value = true;
    try {
      const selectedChat = privateChatsStore.chats.value.find(chat => chat.idDoc === props.selectedChatId);
      const otherUser = Object.keys(selectedChat.user).find(u => u !== 'lucas.e.antonucci@gmail.com');
      await savePrivateMessage('lucas.e.antonucci@gmail.com', otherUser, messageText.value);
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