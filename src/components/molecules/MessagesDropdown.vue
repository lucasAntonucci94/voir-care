<template>
  <div class="relative">
    <button
      @click="toggle"
      class="relative flex items-center gap-2 text-white hover:text-primary-lighter transition-colors duration-300 group"
      title="Mensajes"
    >
      <i class="fa-solid fa-comment-dots text-xl"></i>
      <p class="text-sm font-medium hidden sm:block">Mensajes</p>
      <span
        v-if="privateChatsStore?.chats?.value?.length > 0"
        class="absolute -top-1 -right-2 bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center text-xs font-bold"
      >
        {{ privateChatsStore?.chats?.value?.length > 9 ? '9+' : privateChatsStore?.chats?.value?.length }}
      </span>
      <!-- Tooltip (oculto en mobile) -->
      <span
        class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden sm:group-hover:block bg-primary-darker text-white text-xs font-medium py-1 px-2 rounded-lg shadow-md pointer-events-none transition-opacity duration-200 opacity-0 group-hover:opacity-100"
      >
        Mensajes
      </span>
    </button>
    <transition name="dropdown">
      <div
        v-if="isOpen"
        class="fixed sm:absolute top-0 sm:top-auto left-0 sm:left-auto sm:right-0 w-full sm:w-72 md:w-80 lg:w-96 h-full sm:h-auto max-h-[calc(100vh-4rem)] bg-white shadow-lg rounded-none sm:rounded-lg z-20 overflow-y-auto flex flex-col pt-12 sm:pt-0"
      >
        <!-- Botón de cierre (solo mobile) -->
        <button
          @click="toggle"
          class="sm:hidden absolute top-4 right-2 w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-primary transition-colors md:hidden"
        >
          <i class="fa-solid fa-times text-xl"></i>
        </button>
        <ul v-if="privateChatsStore?.chats?.value?.length > 0" class="divide-y divide-gray-100">
          <!-- Lista de chats -->
          <li
            v-for="notification in privateChatsStore?.chats?.value?.slice(0, 9)"
            :key="notification.id"
            class="px-4 py-3 text-gray-900 hover:bg-gray-50 transition-colors duration-200"
          >
            <button
              @click="handleChatClick(notification.user)"
              class="w-full text-left focus:outline-none"
            >
              {{ getOtherUserEmail(notification?.user) + ': ' + notification?.message?.message }}
            </button>
          </li>

          <!-- Indicador de más chats -->
          <li
            v-if="privateChatsStore?.chats?.value?.length > 9"
            class="px-4 py-3 text-gray-900 hover:bg-gray-50 transition-colors duration-200"
          >
            ... and {{ privateChatsStore?.chats?.value?.length - 9 }} more
          </li>

          <!-- Botón para marcar todos como leídos -->
          <li>
            <button
              @click="markAllAsRead"
              class="w-full text-primary font-medium py-2 px-4 bg-gray-100 hover:bg-gray-200 hover:text-primary-darker rounded-t-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <i class="fa-solid fa-check text-sm"></i>
              Marcar todos como leídos
            </button>
          </li>

          <!-- Enlace para ver todos los mensajes -->
          <li>
            <router-link
              to="/chats"
              @click="toggle"
              class="block w-full text-center text-white font-medium py-2 px-4 bg-primary hover:bg-primary-darker rounded-b-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <i class="fa-solid fa-comments text-sm"></i>
              Ver todos los mensajes
            </router-link>
          </li>
        </ul>
        <div v-else class="px-4 py-4 text-center text-gray-500 text-sm">
          Sin notificaciones
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import { usePrivateChatsStore } from '../../stores/privateChats'; // Importamos el store de chats privados
import { useAuth } from '../../api/auth/useAuth'; // Importamos el composable de autenticación
import { usePrivateChats } from '../../composable/usePrivateChats';
import { useRouter } from 'vue-router';


const { user } = useAuth(); // Usamos el composable de autenticación
const { getChatIdByReference } = usePrivateChats();
const privateChatsStore = usePrivateChatsStore();
const router = useRouter();

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['toggle']);

function toggle() {
  emit('toggle');
}

function markAllAsRead() {
  // Lógica placeholder para marcar como leídos (puedes emitir un evento si lo necesitas)
  console.log('Marcar todos como leídos');
}

const getOtherUserEmail = (userDictionary) => {
  return userDictionary ? Object.keys(userDictionary).find(u => u !== user?.value.email) : null;
};


async function handleChatClick(userDictionary) {
  const from = user.value.email;
  const to = getOtherUserEmail(userDictionary);
  const chatId = await getChatIdByReference(from, to)
  privateChatsStore.setSelectedChatId(chatId);
  emit('toggle');
  router.push('/chats'); 
}

</script>

<style scoped>
/* Animación del desplegable */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

/* Mobile: deslizar desde arriba */
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

/* Tablet y Desktop: deslizar desde el botón */
@media (min-width: 640px) {
  .dropdown-enter-from,
  .dropdown-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
}
</style>