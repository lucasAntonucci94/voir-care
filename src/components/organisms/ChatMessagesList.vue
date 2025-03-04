<template>
    <div v-if="selectedChatId" class="w-full md:w-2/3 bg-gray-100 rounded-xl shadow-xl p-5 flex flex-col h-full border border-gray-200" style="max-height: 80vh;">
      <h2 class="text-xl font-semibold text-gray-900 mb-5 bg-gray-200 p-3 rounded-lg flex items-center">
        <span class="mr-2">💬</span> <!-- Ícono decorativo opcional -->
        Chat con {{ getUserName(getOtherUserEmail()) || 'Usuario desconocido' }}
      </h2>
      <div v-if="loadingMessages" class="flex justify-center bg-gray-50 py-6">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#02bcae]"></div>
      </div>
      <div v-else-if="messages.length === 0" class="text-center text-gray-700 bg-gray-50 py-6 italic">
        No hay mensajes en este chat.
      </div>
      <div v-else class="flex-1 space-y-3 overflow-y-auto pr-2" style="max-height: calc(80vh - 120px);">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="p-3 rounded-2xl max-w-[70%] break-words"
          :class="{
            'bg-gray-200 ml-auto': msg?.user !== user?.email,
            'bg-[#d9f0ed] mr-auto': msg?.user === user?.email
          }"
        >
          <div class="relative">
            <p class="text-sm text-gray-950">{{ msg?.message }}</p>
            <span class="text-xs text-gray-600 block mt-1">{{ msg?.user }} - {{ formatDate(msg.created_at) }}</span>
            <div
              v-if="msg?.user === user?.email"
              class="absolute -bottom-2 -right-2 w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-[#d9f0ed] border-r-[10px] border-r-transparent"
            ></div>
            <div
              v-else
              class="absolute -bottom-2 -left-2 w-0 h-0 border-r-[10px] border-r-transparent border-t-[10px] border-t-gray-200 border-l-[10px] border-l-transparent"
            ></div>
          </div>
        </div>
      </div>
      <ChatMessageInput :selectedChatId="selectedChatId" class="mt-auto p-3 bg-gray-100 border-t border-gray-200" />
    </div>
    <div v-else class="w-full md:w-2/3 bg-white rounded-xl shadow-xl p-5 overflow-y-auto text-center text-gray-700 border border-gray-200" style="max-height: 80vh;">
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
  import { useAuth } from '../../api/auth/auth';
  
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
  const { user } = useAuth();
  
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
            user.value.email,
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