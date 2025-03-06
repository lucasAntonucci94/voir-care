<template>
    <div class="w-full p-6 flex flex-col md:flex-row bg-gray-50" style="min-height: calc(100vh - 120px);">
      <div class="w-full md:w-1/3 bg-white rounded-2xl shadow-lg p-5 mb-5 md:mb-0 md:mr-5 overflow-y-auto" style="max-height: 80vh;">
        <h2 class="text-xl font-semibold text-gray-800 mb-5 border-b border-gray-200 pb-2">Chats</h2>
        <div v-if="privateChatsStore?.loading" class="flex justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
        <div v-else-if="privateChatsStore?.chats?.value?.length === 0" class="text-center text-gray-500 italic py-4 min-h-[200px] flex items-center justify-center">
          No tienes chats con mensajes.
        </div>
        <div v-else class="space-y-3">
          <div v-for="chat in privateChatsStore?.chats?.value" :key="chat.idDoc" class="flex items-center p-3 rounded-xl transition-all duration-200 cursor-pointer" :class="{ 'bg-[#e6f7f5] border-l-4 border-primary': privateChatsStore?.selectedChatId === chat.idDoc, 'hover:bg-gray-50': privateChatsStore?.selectedChatId !== chat.idDoc }" @click="selectChat(chat.idDoc)">
            <img :src="getUserPhoto(chat) || 'https://firebasestorage.googleapis.com/v0/b/parcialcwantonucci.appspot.com/o/profile%2Flucas.e.antonucci%40gmail.com.jpg?alt=media&token=a8d69477-990e-4e3d-bba3-8a19a83fccd4'" alt="User avatar" class="w-10 h-10 rounded-full mr-3 object-cover transition-transform duration-200 hover:scale-105" />
            <div class="flex-1">
              <div class="flex justify-between items-center">
                <h3 class="text-sm font-semibold text-gray-900">{{ getUserName(chat.user) || 'Usuario desconocido' }}</h3>
                <span class="text-xs text-gray-400 truncate">{{ formatDate(chat.created_at) }}</span>
              </div>
              <p class="text-sm text-gray-600 w-30 sm:w-70 md:w-30 lg:w-40 xl:w-50 truncate">{{ chat.message?.message || 'Sin previsualización' }}</p>
            </div>
            <button @click.stop="openDeleteChatModal(chat.idDoc)" class="ml-2 p-1 bg-gray-100 rounded-full text-gray-500 hover:text-red-700 hover:bg-gray-200 transition-colors duration-200">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 2a1 1 0 00-1 1v1H3a1 1 0 000 2h1v11a2 2 0 002 2h8a2 2 0 002-2V6h1a1 1 0 100-2h-2V3a1 1 0 00-1-1H6zm1 2h6v1H7V4zm7 11V7H6v10h8z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <ChatMessagesList :selectedChatId="privateChatsStore?.selectedChatId" :deletedChatId="privateChatsStore?.deletedChatId" />
       <!-- Modal de confirmación -->
        <div v-if="showDeleteChatModal" class="fixed inset-0 z-50 flex items-center justify-center">
            <div class="fixed inset-0 bg-black opacity-90"></div>

            <div class="relative bg-white rounded-2xl p-6 shadow-lg w-full max-w-md">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Confirmar eliminación</h3>
            <p class="text-gray-600 mb-6">¿Estás seguro de que deseas eliminar este chat?</p>
            <div class="flex justify-end space-x-4">
                <button @click="closeDeleteChatModal" class="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors duration-200">Cancelar</button>
                <button @click="deleteChat(chatToDelete)" class="px-4 py-2 bg-primary text-white rounded-xl hover:bg-[#019a8e] transition-colors duration-200">Confirmar</button>
            </div>
            </div>
        </div>
    </div>
  </template>
  <script setup>
  import { ref, onMounted, onUnmounted, watch } from 'vue';
  import { usePrivateChatsStore } from '../stores/privateChats';
  import ChatMessagesList from '../components/organisms/ChatMessagesList.vue';
  import { formatTimestamp } from '../utils/formatTimestamp';
  import { useAuth } from '../api/auth/auth';

  const { user } = useAuth();
  const privateChatsStore = usePrivateChatsStore();
  const showDeleteChatModal = ref(false);
  const chatToDelete = ref(null);
  const deletedChatId = ref(null);

  // Montaje y desmontaje
  onMounted(() => {
      console.log('ChatView.vue montado, iniciando suscripción...');
      // privateChatsStore.initializeSubscription(user.value.email); // Inicia la suscripción en el store
  });
  
  onUnmounted(() => {
    // privateChatsStore.unsubscribe();
    // privateChatsStore.setSelectedChatId(null);
    // privateChatsStore.setDeletedChatId(null);
  });
  
  // Métodos
  const selectChat = (chatId) => {
    privateChatsStore.setSelectedChatId(chatId);
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
    return selectedEmail?.split('@')[0].replace('.', ' ');
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