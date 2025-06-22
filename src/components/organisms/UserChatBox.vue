<template>
  <div class="chat-box-container">
    <!-- Botón flotante -->
    <div
      class="fixed bottom-4 right-4 z-50 w-14 h-14 bg-primary dark:bg-secondary rounded-full flex items-center justify-center shadow-lg hover:bg-primary-dark dark:hover:bg-secondary-dark cursor-pointer group"
      role="button"
      tabindex="0"
      @click="toggleChat"
      @keydown.enter.space.esc="toggleChat"
      aria-label="Abrir mensajes"
    >
      <i class="fa-solid fa-comment-dots text-white text-xl"></i>
      <!-- Badge de mensajes pendientes -->
      <span
        v-if="totalUnread > 0"
        aria-live="polite"
        aria-atomic="true"
        class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 bg-red-500 text-white text-xs font-bold leading-none px-1.5 py-0.5 rounded-full"
      >
        {{ totalUnread }}
      </span>
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
        tabindex="-1"
        @keydown="onChatBoxKeydown"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50 dark:bg-gray-700">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-white">Mensajes</h2>
          <div class="flex items-center gap-2">
            <button @click="toggleSearch" aria-label="Buscar mensajes">
              <i class="fas fa-search text-gray-500 dark:text-white"></i>
            </button>
            <button @click="toggleChat" aria-label="Cerrar ventana de chat">
              <i class="fas fa-times text-gray-500 dark:text-white"></i>
            </button>
          </div>
        </div>

        <!-- Search input -->
        <transition name="fade">
          <div v-if="showSearch" class="px-4 pt-2 pb-1 bg-white dark:bg-gray-900 border-b dark:border-gray-700">
            <div class="relative">
              <label for="chat-search" class="sr-only">Buscar conversaciones</label>
              <input
                v-model="search"
                id="chat-search"
                type="text"
                placeholder="Buscar por email o nombre"
                class="w-full px-4 pr-10 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
                aria-label="Buscar conversaciones"
              />
              <button @click="toggleSearch"class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </transition>

        <!-- Lista de chats -->
        <div class="flex-1 overflow-y-auto bg-white dark:bg-gray-800">
          <ul v-if="chats.length" role="listbox" :aria-activedescendant="'chat-' + focusedIndex">
            <li
              v-for="(chat, index) in filteredChats"
              :key="chat.idDoc"
              :id="'chat-' + index"
              role="option"
              aria-selected="false"
              tabindex="0"
              @click="goToChat(chat)"
              @keydown="onChatKeydown(index, $event)"
              class="flex items-start px-4 py-3 gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer border-b border-gray-100 dark:border-gray-700"
            >
              <div class="relative">
                <img
                  :src="avatars.get(getOtherUserEmail(chat.users)) || AvatarFallback"
                  alt="avatar"
                  class="w-10 h-10 rounded-full object-cover border border-gray-300"
                />
                <!-- Círculo de estado -->
                <div
                  class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"
                  :class="chat.isOnline ? 'bg-green-500' : 'bg-gray-500'"
                  :title="chat.isOnline ? 'En línea' : 'Desconectado'"
                ></div>
              </div>
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
          <div
            v-else
            class="text-center py-6 text-gray-500 dark:text-gray-400 text-sm"
            role="status"
            tabindex="0"
          >
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
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { usePrivateChatsStore } from '../../stores/privateChats';
import { useAuth } from '../../api/auth/useAuth';
import { usePrivateChats } from '../../composable/usePrivateChats';
import { useStorage } from '../../composable/useStorage';
import { useRouter } from 'vue-router';
import AvatarFallback from '../../assets/avatar1.jpg';
import { useUserStatusStore } from '../../stores/userStatus';

const { user } = useAuth();
const { getChatIdByReference } = usePrivateChats();
const { getFileUrl } = useStorage();
const privateChatsStore = usePrivateChatsStore();
const router = useRouter();
const userStatusStore = useUserStatusStore(); // Instanciar el store

const isChatOpen = ref(false);
const userEmail = computed(() => user.value?.email ?? '');
const chats = computed(() => privateChatsStore?.chats?.value?.filter(chat => chat.message) ?? []);
const totalUnread = computed(() =>
  chats.value.reduce((sum, chat) => sum + (chat.unreadCount?.[userEmail.value] ?? 0), 0)
);
const search = ref('');
const showSearch = ref(false);
const activeMenuId = ref(null);
const dropdownPositions = ref({});
const avatars = ref(new Map());

function toggleSearch() {
  showSearch.value = !showSearch.value;
  if (!showSearch.value) search.value = '';
}

const filteredChats = computed(() =>
  chats.value.map(chat => {
    const otherEmail = getOtherUserEmail(chat.users);
    return {
      ...chat,
      isOnline: userStatusStore.getUserStatus(otherEmail), // Usar el store
    };
  }).filter(chat => {
    const other = getOtherUserEmail(chat.users);
    return other.toLowerCase().includes(search.value.toLowerCase());
  })
);

function toggleChat() {
  isChatOpen.value = !isChatOpen.value;

  if (isChatOpen.value) {
    setTimeout(() => {
      const firstItem = document.querySelector('[role="option"]');
      if (firstItem) {
        firstItem.focus();
      } else {
        const container = document.querySelector('.chat-box-container');
        container?.focus();
      }
    }, 50);
  }
}

function getOtherUserEmail(users) {
  return users?.find(email => email !== userEmail.value) || '';
}

async function loadAvatarForChat(chat) {
  const email = getOtherUserEmail(chat.users);
  if (!email || avatars.value.has(email)) return;
  try {
    const filepath = `profile/${email}.jpg`;
    const imageUrl = await getFileUrl(filepath);
    avatars.value.set(email, imageUrl || AvatarFallback);
  } catch (error) {
    console.error(`Error fetching avatar for ${email}:`, error);
    avatars.value.set(email, AvatarFallback);
  }
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

function onChatKeydown(index, event) {
  const items = document.querySelectorAll('[role="option"]');
  const current = items[index];

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    const next = items[index + 1];
    next?.focus();
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    const prev = items[index - 1];
    prev?.focus();
  } else if (event.key === 'Enter') {
    event.preventDefault();
    const chat = filteredChats.value[index];
    goToChat(chat);
  } else if (event.key === 'Escape') {
    isChatOpen.value = false;
  }
}

function onChatBoxKeydown(event) {
  if (event.key === 'Escape') {
    isChatOpen.value = false;
  }
}

onMounted(async () => {
  document.addEventListener('click', closeChatActionsOnOutsideClick);
  if (chats.value.length) {
    await userStatusStore.initializeChatStatuses(chats.value); // Inicializar estados
    for (const chat of chats.value) {
      await loadAvatarForChat(chat);
    }
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeChatActionsOnOutsideClick);
  userStatusStore.clearSubscriptions(); // Limpiar suscripciones
});

watch(chats, async (newChats) => {
  if (newChats.length) {
    await userStatusStore.initializeChatStatuses(newChats); // Actualizar estados
    for (const chat of newChats) {
      await loadAvatarForChat(chat);
    }
  }
}, { immediate: true });

async function goToChat(chat) {
  const otherUser = getOtherUserEmail(chat.users);
  const chatId = await getChatIdByReference(userEmail.value, otherUser);
  privateChatsStore.setSelectedChatId(chatId);
  await privateChatsStore.markChatAsReaded(userEmail.value, chatId);
  router.push('/chats');
  isChatOpen.value = false;
}

function toggleChatActions(chatId, event) {
  const rect = event.currentTarget.getBoundingClientRect();
  dropdownPositions.value[chatId] = {
    top: rect.bottom + window.scrollY,
    left: rect.right - 160 + window.scrollX,
  };
  activeMenuId.value = activeMenuId.value === chatId ? null : chatId;
}

function closeChatActions() {
  activeMenuId.value = null;
}

function deleteChat(chatId) {
  closeChatActions();
  privateChatsStore.deleteChat(chatId);
}

function markAsUnread(chatId) {
  closeChatActions();
}

function closeChatActionsOnOutsideClick(e) {
  if (!e.target.closest('.chat-dropdown')) {
    closeChatActions();
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