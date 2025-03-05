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
        class="fixed sm:absolute top-0 sm:top-auto left-0 sm:left-auto sm:right-0 w-full sm:w-72 md:w-80 lg:w-96 h-full sm:h-auto max-h-[calc(100vh-4rem)] bg-white shadow-lg rounded-none sm:rounded-lg z-20 overflow-y-auto flex flex-col"
      >
        <!-- Botón de cierre (solo mobile) -->
        <button
          @click="toggle"
          class="sm:hidden self-end p-4 text-primary hover:text-primary-darker transition-colors duration-200"
        >
          <i class="fa-solid fa-times text-xl"></i>
        </button>
        <ul v-if="notifications.length > 0" class="divide-y divide-gray-100 flex-1">
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
        </ul>
        <div v-else class="px-4 py-4 text-center text-gray-500 text-sm flex-1">
          Sin notificaciones
        </div>
        <!-- Botones de acción -->
        <div class="p-2 sm:p-0 bg-gray-50 sm:bg-transparent">
          <button
            v-if="notifications.length > 0"
            @click="markAllAsRead"
            class="w-full text-primary font-medium py-2 px-4 hover:text-primary-darker hover:bg-gray-100 rounded-lg mt-2 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <i class="fa-solid fa-check text-sm"></i>
            Marcar todos como leídos
          </button>
          <router-link
            to="/chats"
            @click="toggle"
            class="block w-full text-center text-white font-medium py-2 px-4 bg-primary hover:bg-primary-darker rounded-lg sm:rounded-b-lg sm:rounded-t-none transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <i class="fa-solid fa-comments text-sm"></i>
            Ver todos los mensajes
          </router-link>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  notifications: {
    type: Array,
    required: true,
  },
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
  // Lógica placeholder para marcar como leídos
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