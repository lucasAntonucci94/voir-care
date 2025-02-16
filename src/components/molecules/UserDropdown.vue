<template>
  <div class="relative">
    <button @click="toggle" class="relative flex items-center">  
        <i class="fa-solid fa-user text-xl text-gray-500 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300 transition duration-300" ></i>
    </button>
    <transition name="fade">
      <div v-if="isOpen" class="absolute right-0 mt-2 w-48 md:w-100 bg-white shadow-md rounded-md z-10">
        <ul>
          <li>
            <ThemeModeButton/>
          </li>
          <!-- <router-link v-for="notification in userTabs" to="profile" class="hover:text-gray-300">
            <li class="block px-4 py-2 text-black hover:bg-gray-100">
              {{ notification.message }}
            </li>
          </router-link> -->
          <router-link v-if="auth.isAuthenticated" to="profile" class="hover:text-gray-300">
            <li class="block px-4 py-2 text-black hover:bg-gray-100">
              Perfil
            </li>
          </router-link>
          <router-link v-if="auth.isAuthenticated" to="adm" class="hover:text-gray-300">
            <li class="block px-4 py-2 text-black hover:bg-gray-100">
              Panel de Administrador
            </li>
          </router-link>
          <router-link v-if="!auth.isAuthenticated" to="login" class="hover:text-gray-300">
            <li class="block px-4 py-2 text-black hover:bg-gray-100">
              Iniciar Sesión
            </li>
          </router-link>
          <li v-if="auth.isAuthenticated" @click="doLogout" class="block px-4 py-2 text-black hover:bg-gray-100 cursor-pointer">  Cerrar Sesión
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import { defineProps, defineEmits } from 'vue';
import {logout} from "../../api/auth";
import ThemeModeButton from '../atoms/ThemeModeButton.vue'
import { useAuthState } from '../../api/auth/authState';
import { useRouter } from 'vue-router'; 

const auth = useAuthState();
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
const doLogout = async () => {
  await logout(); // Await the logout from firebase
  router.push('/login');
};
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