// UserDropdown.vue
<template>
  <div class="relative">
    <button @click="toggle" class="relative flex items-center text-gray-100 hover:text-gray-300 transition duration-300">  
        <p class="hidden md:block">Mensajes</p>
        <i class="fa-solid fa-comment-dots text-xl " ></i>
        <span v-if="notifications.length > 0" class="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold p-1">
            {{ notifications.length > 9? '9+': notifications.length }}
        </span>
    </button>
    <transition name="fade">
      <div v-if="isOpen" class="absolute right-0 mt-2  w-48 md:w-100 bg-white shadow-md rounded-md z-10">
        <ul v-if="notifications.length > 0">
          <li>
            <button :class="['text-white font-bold py-2 px-4 rounded w-48 md:w-100','bg-gray-500 hover:bg-gray-700']">
              Marcar todos como leidos
            </button>
          </li>
          <li v-for="notification in notifications.slice(0, 9)":key="notification.id" class="block px-4 py-2 text-black hover:bg-gray-100">
            {{ notification.message }}
          </li>
          <li v-if="notifications.length > 9" class="block px-4 py-2 text-black hover:bg-gray-100">
          ... and {{ notifications.length - 9 }} more
          </li>
          <li>
            <router-link to="/chats" :class="['flex justify-center text-white font-bold py-2 px-4 rounded w-48 md:w-100','bg-gray-500 hover:bg-gray-700']">
              Ver todos los mensajes
            </router-link>
          </li>
          </ul>
        <div v-else class="px-4 py-2 text-center text-gray-500">Sin notificaciones</div>
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

const emit = defineEmits(['toggle']); // <-- Define the emit

function toggle() {
  emit('toggle');
}
</script>
<style scoped>
/* Estilos opcionales para la animación fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>