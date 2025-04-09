<template>
    <div class="w-full p-6 flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900" style="min-height: calc(100vh - 100px);">
      <div class="w-full md:w-1/3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 mb-5 md:mb-0 md:mr-5 overflow-y-auto" style="max-height: 80vh;">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-300 mb-5 border-b border-gray-200 dark:border-gray-600 pb-2">Chats</h2>
        <div v-if="privateChatsStore?.loading" class="flex justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
        <div v-else-if="privateChatsStore?.chats?.value?.length === 0" class="text-center text-gray-500 italic py-4 min-h-[200px] flex items-center justify-center">
          No tienes chats con mensajes.
        </div>
        <div v-else class="space-y-3">
          <div v-for="chat in privateChatsStore?.chats?.value" :key="chat.idDoc" class="flex items-center p-3 rounded-xl transition-all duration-200 cursor-pointer" :class="{ 'bg-gray-100 dark:bg-gray-600 border-l-4 border-primary dark:border-secondary': privateChatsStore?.selectedChatId === chat.idDoc, 'hover:bg-gray-50 dark:hover:bg-gray-700': privateChatsStore?.selectedChatId !== chat.idDoc }" @click="selectChat(chat.idDoc)">
            <img :src="getUserPhoto(chat) || AvatarImage" alt="User avatar" class="w-10 h-10 rounded-full mr-3 object-cover transition-transform duration-200 hover:scale-105" />
            <div class="flex-1">
              <div class="flex justify-between items-center">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-200">{{ getUserName(chat.users) || 'Usuario desconocido' }}</h3>
                <span class="text-xs text-gray-400 dark:text-gray-300 truncate">{{ formatTimestamp(chat.created_at) }}</span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-300 w-30 sm:w-70 md:w-30 lg:w-40 xl:w-50 truncate">{{ chat.message?.message || 'Sin mensajes' }}</p>
            </div>
            <button @click.stop="openDeleteChatModal(chat.idDoc)" class="ml-2 p-1 text-gray-500 hover:text-red-700 transition-colors duration-200">
              <i class="fa-solid fa-trash-can w-4 h-4"></i>
            </button>
          </div>
        </div>
      </div>
      <!-- Modal de confirmación al eliminar un chat -->
      <div v-if="showDeleteChatModal" class="fixed inset-0 z-101 flex items-center justify-center">
            <div class="fixed inset-0 bg-black opacity-50"></div>
            <div class="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg w-full max-w-md">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-300 mb-4">Confirmar eliminación</h3>
              <p class="text-gray-600 dark:text-gray-400 mb-6">¿Estás seguro de que deseas eliminar este chat?</p>
              <div class="flex justify-end space-x-4">
                  <button @click="closeDeleteChatModal" class="px-4 py-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 rounded-xl transition-colors duration-200">Cancelar</button>
                  <button @click="deleteChat(chatToDelete)" class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-xl hover:bg-primary-md dark:hover:bg-secondary-md transition-colors duration-200">Eliminar</button>
              </div>
            </div>
        </div>
      <ChatMessagesList />
    </div>
  </template>
  <script setup>
  import { ref } from 'vue';
  import { usePrivateChatsStore } from '../stores/privateChats';
  import ChatMessagesList from '../components/organisms/ChatMessagesList.vue';
  import { formatTimestamp } from '../utils/formatTimestamp';
  import { useAuth } from '../api/auth/useAuth';
  import AvatarImage from '../assets/avatar1.jpg';
  
  const { user: userAuth } = useAuth();
  const privateChatsStore = usePrivateChatsStore();
  const showDeleteChatModal = ref(false);
  const chatToDelete = ref(null);
  
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

  // TO DO: Refactorizar estos métodos a un archivo de utilidades y obtener imagen de firebase
  const getUserPhoto = (chat) => {
    if (!chat) return null;
    const selectedEmail = chat.users.find(email => email !== userAuth?.value?.email);
    return selectedEmail
      ? `https://firebasestorage.googleapis.com/v0/b/parcialcwantonucci.appspot.com/o/profile%2F${selectedEmail}.jpg?alt=media&token=a8d69477-990e-4e3d-bba3-8a19a83fccd4`
      : 'https://via.placeholder.com/40';
  };
  // TO DO: Refactorizar estos métodos a un archivo de utilidades y que obtenga el displayName del usuario o email.
  const getUserName = (usersArray) => {
    const selectedEmail = usersArray.find(email => email !== userAuth?.value?.email);
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