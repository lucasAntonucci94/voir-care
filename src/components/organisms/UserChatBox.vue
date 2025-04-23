<template>
    <div>
      <!-- Botón flotante -->
      <div
        class="fixed bottom-4 right-4 z-50 w-14 h-14 bg-primary dark:bg-secondary rounded-full flex items-center justify-center shadow-lg hover:bg-primary-dark dark:hover:bg-secondary-dark cursor-pointer group"
        @click="toggleChat"
        aria-label="Abrir mensajes"
      >
        <i class="fa-solid fa-comment-dots text-white text-xl"></i>
        <span
         class="absolute bottom-full mb-2 text-xs bg-black text-white px-2 py-1 rounded-md hidden group-hover:block"
        >
          Mensajes
        </span>
      </div>
  
      <!-- Caja de mini messenger -->
      <transition name="fade-slide">
          <div
            v-if="isChatOpen"
            class="fixed bottom-20 right-4 sm:w-[24rem] w-[90vw] max-h-[80vh] bg-white dark:bg-gray-900 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            <!-- Header -->
            <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50 dark:bg-gray-700">
              <h2 class="text-lg font-semibold text-gray-800 dark:text-white">Mensajes</h2>
              <div class="flex items-center gap-2">
                <button @click="toggleSearch">
                  <i class="fas fa-search text-gray-500 dark:text-white"></i>
                </button>
                <button @click="toggleChat">
                  <i class="fas fa-times text-gray-500 dark:text-white"></i>
                </button>
              </div>
            </div>

            <!-- Search input -->
            <transition name="fade">
              <div v-if="showSearch" class="px-4 pt-2 pb-1 bg-white dark:bg-gray-900 border-b dark:border-gray-700">
                <div class="relative">
                  <input
                    v-model="search"
                    type="text"
                    placeholder="Buscar por email o nombre"
                    class="w-full px-4 pr-10 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
                    aria-label="Buscar conversaciones"
                  />
                  <button @click="toggleSearch" class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </transition>

  
          <!-- Lista de chats -->
          <div class="flex-1 overflow-y-auto bg-white dark:bg-gray-800">
            <ul v-if="chats.length">
              <li
                v-for="chat in filteredChats"
                :key="chat.idDoc"
                @click="goToChat(chat)"
                class="flex items-start px-4 py-3 gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer border-b border-gray-100 dark:border-gray-700"
              >
                <img
                  :src="avatars.get(getOtherUserEmail(chat.users)) || AvatarFallback"
                  alt="avatar"
                  class="w-10 h-10 rounded-full object-cover border border-gray-300"
                />
                <div class="flex-1">
                  <div class="flex justify-between items-center">
                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {{ getLastMessagePreview(chat) }}
                    </p>
                    <span
                      v-if="chat.unreadCount?.[userEmail] > 0"
                      class="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full"
                    >
                      {{ chat.unreadCount[userEmail] }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {{ chat.message?.message || 'Sin mensajes aún' }}
                  </p>
                </div>
                <!-- Botón de acciones -->
                <div class="relative z-40">
                  <button
                    @click.stop="toggleChatActions(chat.idDoc, $event)"
                    class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                  </button>

                  <Teleport to="body">
                    <transition name="fade">
                      <ul
                        v-if="activeMenuId === chat.idDoc"
                        class="chat-dropdown fixed w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-[1000] text-sm"
                        :style="dropdownPositions[chat.idDoc] ? {
                          top: `${dropdownPositions[chat.idDoc].top}px`,
                          left: `${dropdownPositions[chat.idDoc].left}px`
                        } : {}"
                      >
                        <li
                          @click.stop="markAsUnread(chat.idDoc)"
                          class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-700 dark:text-gray-300 cursor-pointer"
                        >
                          Marcar como no leído
                        </li>
                        <li
                          @click.stop="deleteChat(chat.idDoc)"
                          class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-red-500"
                        >
                          Eliminar conversación
                        </li>
                      </ul>
                    </transition>
                  </Teleport>
                </div>
              </li>
            </ul>
            <div v-else class="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
              No tenés mensajes activos.
            </div>
          </div>
  
          <!-- Botón ver todo -->
          <router-link
            to="/chats"
            class="text-sm py-3 text-center text-white font-medium bg-primary dark:bg-secondary hover:bg-primary-dark dark:hover:bg-secondary-dark transition rounded-b-xl"
          >
            Ver todos los mensajes
          </router-link>
        </div>
      </transition>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
  import { usePrivateChatsStore } from '../../stores/privateChats'
  import { useAuth } from '../../api/auth/useAuth'
  import { usePrivateChats } from '../../composable/usePrivateChats'
  import { useStorage } from '../../composable/useStorage'
  import { useRouter } from 'vue-router'
  import AvatarFallback from '../../assets/avatar1.jpg'
  
  const { user } = useAuth()
  const { getChatIdByReference } = usePrivateChats()
  const { getFileUrl } = useStorage()
  const privateChatsStore = usePrivateChatsStore()
  const router = useRouter()
  
  const isChatOpen = ref(false)
  const userEmail = computed(() => user.value?.email ?? '')
  
  const chats = computed(() =>
    privateChatsStore?.chats?.value?.filter(chat => chat.message) ?? []
  )
  
  const search = ref('')
  const showSearch = ref(false)

  const activeMenuId = ref(null)
  const dropdownPositions = ref({})


  function toggleSearch() {
    showSearch.value = !showSearch.value
    if (!showSearch.value) search.value = ''
  }

  const filteredChats = computed(() =>
    chats.value.filter(chat => {
      const other = getOtherUserEmail(chat.users)
      return other.toLowerCase().includes(search.value.toLowerCase())
    })
  )

  // Map reactivo para cachear avatares por email
  const avatars = ref(new Map())
  
  function toggleChat() {
    isChatOpen.value = !isChatOpen.value
  }
  
  function getOtherUserEmail(users) {
    return users?.find(email => email !== userEmail.value)
  }
  
  // Cargar y guardar el avatar de un chat
  async function loadAvatarForChat(chat) {
    const email = getOtherUserEmail(chat.users)
    if (!email || avatars.value.has(email)) return
  
    const filepath = `profile/${email}.jpg`
    const imageUrl = await getFileUrl(filepath)
    avatars.value.set(email, imageUrl || AvatarFallback)
  }

  function getLastMessagePreview(chat) {
    const message = chat.message?.message || '';
    const sender = chat.message?.user?.email;
    const isOwn = sender === userEmail.value;
    const otherUserEmail = getOtherUserEmail(chat.users);

    if (chat.message?.mediaType === 'image') {
      return isOwn ? 'Tú: 📷 Foto' : `${otherUserEmail.split('@')[0]}: 📷 Foto`;
    }
    if (!message && chat.unreadCount?.[userEmail.value] > 0) {
      return 'Mensajes nuevos';
    }
    if (!message) {
      return 'Sin mensajes aún';
    }

    const prefix = isOwn ? 'Tú ' : `${otherUserEmail.split('@')[0]} `;
    return `${prefix}`;
  }
  
  // Cargar avatares al recibir/changear chats
  watch(chats, async (newChats) => {
    for (const chat of newChats) {
      await loadAvatarForChat(chat)
    }
  }, { immediate: true })
  
  async function goToChat(chat) {
    const otherUser = getOtherUserEmail(chat.users)
    const chatId = await getChatIdByReference(userEmail.value, otherUser)
    privateChatsStore.setSelectedChatId(chatId)
    await privateChatsStore.markChatAsReaded(userEmail.value, chatId)
    router.push('/chats')
    isChatOpen.value = false
  }

  function toggleChatActions(chatId, event) {
  const rect = event.currentTarget.getBoundingClientRect()
  dropdownPositions.value[chatId] = {
    top: rect.bottom + window.scrollY,
    left: rect.right - 160 + window.scrollX // ancho del dropdown
  }
  activeMenuId.value = activeMenuId.value === chatId ? null : chatId
}

function closeChatActions() {
  activeMenuId.value = null
}

function deleteChat(chatId) {
  console.log('Eliminar chat:', chatId)
  closeChatActions()
  privateChatsStore.deleteChat(chatId)
}

function markAsUnread(chatId) {
  console.log('Marcar como no leído:', chatId)
  closeChatActions()
}

onMounted(() => {
  document.addEventListener('click', closeChatActionsOnOutsideClick)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', closeChatActionsOnOutsideClick)
})

function closeChatActionsOnOutsideClick(e) {
  if (!e.target.closest('.chat-dropdown')) {
    closeChatActions()
  }
}

</script>
    
<style scoped>
  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: all 0.3s ease;
  }
  .fade-slide-enter-from,
  .fade-slide-leave-to {
    opacity: 0;
    transform: translateY(10px);
  }
  
  /* Scroll minimal */
  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>