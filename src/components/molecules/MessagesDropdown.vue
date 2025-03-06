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
        v-if="notifications.length > 0"
        class="absolute -top-1 -right-2 bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center text-xs font-bold"
      >
        {{ notifications.length > 9 ? '9+' : notifications.length }}
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
        class="fixed sm:absolute top-0 sm:top-auto left-0 sm:left-auto sm:right-0 w-full sm:w-72 md:w-80 lg:w-96 h-full sm:h-auto max-h-[calc(100vh-4rem)] bg-white shadow-lg rounded-none sm:rounded-lg z-20 overflow-y-auto"
      >
        <ul v-if="notifications.length > 0" class="divide-y divide-gray-100">
          <li>
            <button
              @click="markAllAsRead"
              class="w-full text-white font-medium py-2 px-4 bg-primary hover:bg-primary-darker rounded-t-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <i class="fa-solid fa-check text-sm"></i>
              Marcar todos como leídos
            </button>
          </li>
          <li
            v-for="notification in notifications.slice(0, 9)"
            :key="notification.id"
            class="px-4 py-3 text-gray-900 hover:bg-gray-50 transition-colors duration-200"
          >
            {{ notification.message }}
          </li>
          <li
            v-if="notifications.length > 9"
            class="px-4 py-3 text-gray-900 hover:bg-gray-50 transition-colors duration-200"
          >
            ... and {{ notifications.length - 9 }} more
          </li>
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
const privateChatsStore = usePrivateChatsStore();
// debugger

const notifications = ref([
  { id: 1, message: 'Como estas amigo ?' },
  { id: 2, message: 'Seguis teniendo a ese gatito ?' },
  { id: 3, message: 'Seguis teniendo a ese gatito ?' },
  { id: 4, message: 'Seguis teniendo a ese gatito ?' },
  { id: 5, message: 'Seguis teniendo a ese gatito ?' },
  { id: 6, message: 'Seguis teniendo a ese gatito ?' },
  { id: 7, message: 'Seguis teniendo a ese gatito ?' },
  { id: 8, message: 'Seguis teniendo a ese gatito ?' },
  { id: 9, message: 'Seguis teniendo a ese gatito ?' },
  { id: 10, message: 'Seguis teniendo a ese gatito ?' },
  { id: 11, message: 'Seguis teniendo a ese gatito ?' },
  { id: 12, message: 'Seguis teniendo a ese gatito ?' },
  { id: 13, message: 'Seguis teniendo a ese gatito ?' },
  { id: 14, message: 'Seguis teniendo a ese gatito ?' },
  { id: 15, message: 'Seguis teniendo a ese gatito ?' },
  { id: 16, message: 'Seguis teniendo a ese gatito ?' },
  { id: 17, message: 'Seguis teniendo a ese gatito ?' },
]);


const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['toggle']);

function toggle() {
  const chats = privateChatsStore.chats;
  console.log(chats)
  debugger
  emit('toggle');
}

function markAllAsRead() {
  // Lógica placeholder para marcar como leídos (puedes emitir un evento si lo necesitas)
  console.log('Marcar todos como leídos');
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