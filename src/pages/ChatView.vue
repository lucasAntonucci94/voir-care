<template>
    <div class="w-full p-6 flex flex-col md:flex-row bg-gray-50" style="min-height: calc(100vh - 120px);">
      <!-- Lista de chats (lado izquierdo) -->
      <div class="w-full md:w-1/3 bg-white rounded-2xl shadow-lg p-5 mb-5 md:mb-0 md:mr-5 overflow-y-auto" style="max-height: 80vh;">
        <h2 class="text-xl font-semibold text-gray-800 mb-5 border-b border-gray-200 pb-2">Chats</h2>
        <div v-if="privateChatsStore.loading" class="flex justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#02bcae]"></div>
        </div>
        <div v-else-if="privateChatsStore.chats.value.length === 0" class="text-center text-gray-500 italic py-4 min-h-[200px] flex items-center justify-center">
          No tienes chats con mensajes.
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="chat in privateChatsStore.chats.value"
            :key="chat.idDoc"
            class="flex items-center p-3 rounded-xl transition-all duration-200 cursor-pointer"
            :class="{
              'bg-[#e6f7f5] border-l-4 border-[#02bcae]': privateChatsStore.selectedChatId === chat.idDoc,
              'hover:bg-gray-50': privateChatsStore.selectedChatId !== chat.idDoc
            }"
            @click="selectChat(chat.idDoc)"
          >
            <img
              :src="getUserPhoto(chat) || 'https://firebasestorage.googleapis.com/v0/b/parcialcwantonucci.appspot.com/o/profile%2Flucas.e.antonucci%40gmail.com.jpg?alt=media&token=a8d69477-990e-4e3d-bba3-8a19a83fccd4'"
              alt="User avatar"
              class="w-10 h-10 rounded-full mr-3 object-cover transition-transform duration-200 hover:scale-105"
            />
            <div class="flex-1">
              <div class="flex justify-between items-center">
                <h3 class="text-sm font-semibold text-gray-900">
                  {{ getUserName(chat.user) || 'Usuario desconocido' }}
                </h3>
                <span class="text-xs text-gray-400">{{ formatDate(chat.created_at) }}</span>
              </div>
              <p class="text-sm text-gray-600 truncate">
                {{ chat.message?.message || 'Sin previsualización' }}
              </p>
            </div>
            <button
              @click.stop="deleteChat(chat.idDoc)"
              class="ml-2 p-1 bg-gray-100 rounded-full text-red-500 hover:text-red-700 hover:bg-gray-200 transition-colors duration-200"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 2a1 1 0 00-1 1v1H3a1 1 0 000 2h1v11a2 2 0 002 2h8a2 2 0 002-2V6h1a1 1 0 100-2h-2V3a1 1 0 00-1-1H6zm1 2h6v1H7V4zm7 11V7H6v10h8z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
  
      <!-- Detalle del chat (lado derecho) - Componente hijo -->
      <ChatMessagesList :selectedChatId="privateChatsStore?.selectedChatId" />
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { usePrivateChatsStore } from '../stores/privateChats';
  import ChatMessagesList from '../components/organisms/ChatMessagesList.vue';
  import { formatTimestamp } from '../utils/formatTimestamp';
  import { useAuth } from '../api/auth/auth';
  const { user } = useAuth();
  // Estado reactivo
  const privateChatsStore = usePrivateChatsStore();
  
  // Montaje y desmontaje
  onMounted(() => {
      console.log('ChatView.vue montado, iniciando suscripción...');
      privateChatsStore.initializeSubscription(user.value.email); // Inicia la suscripción en el store
  });
  
  onUnmounted(() => {
    privateChatsStore.unsubscribe();
    privateChatsStore.setSelectedChatId(null);
  });
  
  // Métodos
  const selectChat = (chatId) => {
    privateChatsStore.setSelectedChatId(chatId);
  };
  
  const deleteChat = (chatId) => {
    privateChatsStore.deleteChat(chatId);
  };
  
  const formatDate = (timestamp) => {
      return formatTimestamp(timestamp);
  };
  
  const getUserPhoto = (chat) => {
    if(!chat) return null;
    const selectedEmail = Object.keys(chat.user)?.find(u => u !== 'lucas.e.antonucci@gmail.com');
    return `https://firebasestorage.googleapis.com/v0/b/parcialcwantonucci.appspot.com/o/profile%2F${selectedEmail}.jpg?alt=media&token=a8d69477-990e-4e3d-bba3-8a19a83fccd4` || 'https://via.placeholder.com/40';
  };
  
  const getUserName = (user) => {
    const selectedEmail = Object.keys(user)?.find(u => u !== 'lucas.e.antonucci@gmail.com');
    return selectedEmail.split('@')[0].replace('.', ' ');
  };
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
  </style>