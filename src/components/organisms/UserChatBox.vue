<template>
    <div>
      <!-- Botón flotante -->
      <div
        class="fixed bottom-4 right-4 z-50 w-14 h-14 bg-primary dark:bg-secondary rounded-full flex items-center justify-center shadow-lg hover:bg-primary-dark dark:hover:bg-secondary-dark cursor-pointer"
        @click="toggleChat"
      >
        <i class="fa-solid fa-comment-dots text-white text-xl"></i>
      </div>
  
      <!-- Caja de chat -->
      <div
        v-if="isChatOpen"
        class="fixed bottom-20 right-4 sm:w-[24rem] max-h-[70vh] w-[90vw] bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 flex flex-col"
      >
        <!-- Encabezado -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-base font-semibold text-gray-800 dark:text-white">Tus mensajes</h2>
          <button @click="toggleChat" class="text-gray-500 dark:text-gray-300 hover:text-red-500">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
  
        <!-- Lista de chats -->
        <div class="flex-1 overflow-y-auto">
          <ul v-if="chats.length">
            <li
              v-for="chat in chats"
              :key="chat.idDoc"
              @click="goToChat(chat)"
              class="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700"
            >
              <div class="flex justify-between items-center">
                <p class="text-sm font-medium text-gray-800 dark:text-white">
                  {{ getOtherUserEmail(chat.users) }}
                </p>
                <span
                  v-if="chat.unreadCount?.[userEmail] > 0"
                  class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full"
                >
                  {{ chat.unreadCount[userEmail] }}
                </span>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {{ chat.message?.message || 'Sin mensajes aún' }}
              </p>
            </li>
          </ul>
          <div v-else class="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
            No tenés mensajes activos.
          </div>
        </div>
  
        <!-- Botón ver todos -->
        <router-link
          to="/chats"
          class="text-sm py-3 text-center text-white font-medium bg-primary dark:bg-secondary hover:bg-primary-dark dark:hover:bg-secondary-dark transition rounded-b-xl"
        >
          Ver todos los mensajes
        </router-link>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { usePrivateChatsStore } from '../../stores/privateChats'
  import { useAuth } from '../../api/auth/useAuth'
  import { usePrivateChats } from '../../composable/usePrivateChats'
  import { useRouter } from 'vue-router'
  
  const { user } = useAuth()
  const { getChatIdByReference } = usePrivateChats()
  const router = useRouter()
  const privateChatsStore = usePrivateChatsStore()
  
  const isChatOpen = ref(false)
  const userEmail = computed(() => user.value?.email ?? '')
  
  const chats = computed(() =>
    privateChatsStore?.chats?.value?.filter(chat => chat.message) ?? []
  )
  
  function toggleChat() {
    isChatOpen.value = !isChatOpen.value
  }
  
  function getOtherUserEmail(users) {
    return users?.find(email => email !== userEmail.value)
  }
  
  async function goToChat(chat) {
    const otherUser = getOtherUserEmail(chat.users)
    const chatId = await getChatIdByReference(userEmail.value, otherUser)
    privateChatsStore.setSelectedChatId(chatId)
    router.push('/chats')
    isChatOpen.value = false
  }
  </script>
  
  <style scoped>
  /* Scroll limpio y estético */
  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
  </style>
  