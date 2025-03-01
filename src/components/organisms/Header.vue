<template>
  <header class="bg-voir text-white p-4 relative">
    <div class="container mx-auto flex flex-wrap justify-between items-center">
      <div class="flex items-center mb-2 md:mb-0">
        <img src="../../assets/icons/logoVoir.png" alt="Logo de mi red social" class="h-10 mr-4">
        <h1 class="text-xl font-bold">Voir</h1>
      </div>

      <!-- justify-center md:justify-end items-center w-full md:w-auto -->
      <nav class="flex flex-nowrap"> 
        <div class="hidden md:flex space-x-4 mb-2 md:mb-0 mr-4">
          <router-link v-if="!isAuthenticated" to="/landingpage" class="text-gray-100 hover:text-gray-300">
            <i class="fa-solid fa-house mr-1"></i>Inicio
          </router-link>
          <router-link v-if="isAuthenticated" to="/" class="text-gray-100 hover:text-gray-300">
            <i class="fa-solid fa-house mr-1"></i>Inicio
          </router-link>
          <!-- <router-link v-if="isAuthenticated" to="/sociales" class="text-gray-100 hover:text-gray-300">Sociales</router-link> -->
          <router-link v-if="isAuthenticated" to="/explorar" class="text-gray-100 hover:text-gray-300">Explorar</router-link>
          <router-link to="/faqs" class="text-gray-100 hover:text-gray-300">FAQs</router-link>
          <router-link v-if="!isAuthenticated" to="login" class="text-gray-100 hover:text-gray-300">
              Iniciar Sesión
          </router-link>
        </div>

        <div class="flex items-center space-x-4">
          <NotificationDropdown v-if="isAuthenticated" :notifications="userNotifications" :is-open="isNotificationsMenuOpen" @toggle="toggleNotificationsMenu" />
          <MessagesDropdown v-if="isAuthenticated" :notifications="messagesNotifications" :is-open="isMessageMenuOpen" @toggle="toggleMessagesMenu" />
          <UserDropdown  v-if="isAuthenticated" :is-open="isUserMenuOpen" @toggle="toggleUserMenu" />

          <button @click="toggleMobileMenu" class="md:hidden">
            <i class="fa-solid fa-bars"></i>
          </button>
        </div>
      </nav>
    </div>

    <transition name="fade">
      <div v-if="isMobileMenuOpen" class="bg-gray-800 text-white p-4 absolute top-full left-0 w-full z-10">
        <div class="flex flex-col space-y-2">
          <router-link to="/" class="text-gray-100 hover:text-gray-300" @click="isMobileMenuOpen = false">Inicio</router-link>
          <router-link to="/explorar" v-if="isAuthenticated" class="text-gray-100 hover:text-gray-300" @click="isMobileMenuOpen = false">Explorar</router-link>
          <!-- <router-link to="/sociales" v-if="isAuthenticated" class="text-gray-100 hover:text-gray-300" @click="isMobileMenuOpen = false">Sociales</router-link> -->
          <router-link to="/profile" v-if="isAuthenticated" class="text-gray-100 hover:text-gray-300" @click="isMobileMenuOpen = false">Perfil</router-link>
          <router-link to="/faqs" class="text-gray-100 hover:text-gray-300" @click="isMobileMenuOpen = false">FAQs</router-link>
          <router-link v-if="!isAuthenticated" to="login" class="text-gray-100 hover:text-gray-300">
              Iniciar Sesión
          </router-link>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import UserDropdown from '../molecules/UserDropdown.vue'; // Componente para el dropdown de usuario
import NotificationDropdown from '../molecules/NotificationDropdown.vue'; // Componente para el dropdown de notificaciones
import MessagesDropdown from '../molecules/MessagesDropdown.vue'; // Componente para el dropdown de mensajes

import { useAuth } from '../../api/auth/auth';

const { user, isAuthenticated, loading, error, login, logout, register, updateProfile } = useAuth();

const isNotificationsMenuOpen = ref(false);
const isMessageMenuOpen = ref(false);
const isUserMenuOpen = ref(false);
const isMobileMenuOpen = ref(false);
const isAdmin = ref(true); // Valor dinámico según el rol del usuario

const userNotifications = ref([
  { id: 1, message: 'Comentaron tu publicacion @nombrePublicacion blah blah' },
  { id: 2, message: 'Alguien te ha seguido' },
]);

const messagesNotifications = ref([
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
  { id: 18, message: 'Seguis teniendo a ese gatito ?' },
  { id: 19, message: 'Seguis teniendo a ese gatito ?' },
]);

function toggleNotificationsMenu() {
  isNotificationsMenuOpen.value =!isNotificationsMenuOpen.value;
  isMessageMenuOpen.value = false;
  isUserMenuOpen.value = false;
  isMobileMenuOpen.value = false;
}

function toggleMessagesMenu() {
  isMessageMenuOpen.value =!isMessageMenuOpen.value;
  isNotificationsMenuOpen.value = false;
  isUserMenuOpen.value = false;
  isMobileMenuOpen.value = false;
}

function toggleUserMenu() {
  isUserMenuOpen.value =!isUserMenuOpen.value;
  isNotificationsMenuOpen.value = false;
  isMessageMenuOpen.value = false;
  isMobileMenuOpen.value = false;
}


function toggleMobileMenu() {
  isUserMenuOpen.value = false;
  isNotificationsMenuOpen.value = false;
  isMessageMenuOpen.value = false;
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
}

</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>  