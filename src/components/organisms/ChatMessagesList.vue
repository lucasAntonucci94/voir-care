<template>
    <div v-if="selectedChatId" class="w-full md:w-2/3 bg-white rounded-xl shadow-lg p-4 flex flex-col h-full" style="max-height: 80vh;">
      <h2 class="text-xl font-semibold text-gray-800 mb-4 bg-gray-50 p-2 rounded-md">
        Chat con {{ getUserName(getOtherUserEmail()) || 'Usuario desconocido' }}
      </h2>
      <div v-if="loadingMessages" class="flex justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#02bcae]"></div>
      </div>
      <div v-else-if="messages.length === 0" class="text-center text-gray-600 italic">
        No hay mensajes en este chat.
      </div>
      <div v-else class="flex-1 space-y-3 overflow-y-auto pr-2" style="max-height: calc(80vh - 120px);">
        <div v-for="msg in messages" :key="msg.id" class="p-3 bg-gray-50 rounded-xl border border-gray-200">
          <p class="text-sm text-gray-900">{{ msg.message }}</p>
          <span class="text-xs text-gray-500">{{ msg.user }} - {{ formatDate(msg.created_at) }}</span>
        </div>
      </div>
      <ChatMessageInput :selectedChatId="selectedChatId" class="mt-auto p-3 bg-white border-t border-gray-100" />
    </div>
    <div v-else class="w-full md:w-2/3 bg-white rounded-xl shadow-lg p-4 overflow-y-auto text-center text-gray-600" style="max-height: 80vh;">
      Selecciona un chat para ver los mensajes.
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted, watch } from 'vue';
  import { usePrivateChats } from '../../composable/usePrivateChats';
  import { usePrivateChatsStore } from '../../stores/privateChats';
  import { defineProps } from 'vue';
  import { formatTimestamp } from '../../utils/formatTimestamp';
  import ChatMessageInput from '../atoms/ChatMessageInput.vue';
  
  // Props
  const props = defineProps({
    selectedChatId: {
      type: String,
      default: null,
    },
  });
  
  // Estado reactivo
  const privateChatsStore = usePrivateChatsStore();
  const messages = ref([]);
  const loadingMessages = ref(false);
  const unsubscribeMessages = ref(null);
  
  // Montaje y desmontaje
  onMounted(() => {
    watch(
      () => props.selectedChatId,
      (newChatId) => {
        if (unsubscribeMessages.value && typeof unsubscribeMessages.value === 'function') {
          unsubscribeMessages.value();
          unsubscribeMessages.value = null;
        }
  
        if (newChatId) {
          loadingMessages.value = true;
          const otherUser = getOtherUserEmail();
          unsubscribeMessages.value = usePrivateChats().subscribeToIncomingPrivateMessages(
            'lucas.e.antonucci@gmail.com',
            otherUser,
            (msgs) => {
              console.log('Mensajes recibidos:', msgs);
              messages.value = msgs.map((msg, index) => ({ id: index, ...msg }));
              loadingMessages.value = false;
            }
          );
        } else {
          messages.value = [];
        }
      },
      { immediate: true }
    );
  });
  
  onUnmounted(() => {
    if (unsubscribeMessages.value && typeof unsubscribeMessages.value === 'function') {
      unsubscribeMessages.value();
      unsubscribeMessages.value = null;
    }
    messages.value = [];
  });
  
  // Métodos
  const formatDate = (timestamp) => {
    return formatTimestamp(timestamp);
  };
  
  const getUserPhoto = (email) => {
    return `https://firebasestorage.googleapis.com/v0/b/parcialcwantonucci.appspot.com/o/profile%2F${email}.jpg?alt=media&token=a8d69477-990e-4e3d-bba3-8a19a83fccd4` || 'https://via.placeholder.com/40';
  };
  
  const getUserName = (email) => {
    return email.split('@')[0].replace('.', ' ');
  };
  
  const getOtherUserEmail = () => {
    const selectedChat = privateChatsStore.chats.value.find(chat => chat.idDoc === props.selectedChatId);
    return selectedChat ? Object.keys(selectedChat.user).find(u => u !== 'lucas.e.antonucci@gmail.com') : null;
  };
  </script>
  
  <style scoped>
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  </style>