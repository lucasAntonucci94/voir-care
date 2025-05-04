<!-- Header.vue -->
<template>
  <header class="text-white bg-primary dark:bg-secondary p-4 relative shadow-md transition-all duration-300" ref="headerRef">
    <div class="container mx-auto flex flex-wrap justify-between items-center md:py-4 px-4 md:px-8 lg:px-16">
      <div class="flex items-center mb-2 md:mb-0">
        <!-- Botón hamburguesa solo visible en móvil y en la ruta /feed -->
        <button v-if="isAuthenticated" class="md:hidden mr-4 text-lg hover:text-primary transition-colors duration-200" @click="sidebarStore.toggleSidebar">
          <i class="fa-solid fa-arrow-right"></i>
        </button>
        <router-link v-if="isAuthenticated" to="/feed" class="flex items-center">
          <!-- <img src="../../assets/icons/logoGreen.png" alt="Logo de mi red social" class="h-10 mr-4"> -->
          <!-- Logo para tema claro -->
          <img src="../../assets/icons/logoGreen.png" alt="Logo claro" class="h-10 mr-4 dark:hidden" />

          <!-- Logo para tema oscuro -->
          <img src="../../assets/icons/logoOrange.png" alt="Logo oscuro" class="h-10 mr-4 hidden dark:inline" />

          <h1 class="text-xl md:text-2xl font-semibold tracking-tight hover:text-primary-lighter dark:hover:text-secondary-lighter transition-colors duration-200">Voir</h1>
        </router-link>
        <router-link v-else to="/" class="flex items-center">
          <img src="../../assets/icons/logoGreen.png" alt="Logo claro" class="h-10 mr-4 dark:hidden" />

          <!-- Logo para tema oscuro -->
          <img src="../../assets/icons/logoOrange.png" alt="Logo oscuro" class="h-10 mr-4 hidden dark:inline" />
          <h1 class="text-xl md:text-2xl font-semibold tracking-tight hover:text-primary-lighter dark:hover:text-secondary-lighter transition-colors duration-200">Voir</h1>
        </router-link>
      </div>
      <nav class="flex flex-nowrap">
        <div class="flex items-center space-x-4">
          <router-link v-if="!isAuthenticated" to="/login" class="flex items-center">
            <h1 class="relative flex items-center gap-2 text-white hover:text-primary-lighter dark:hover:text-secondary-lighter transition-colors duration-300 group">Iniciar Sesión</h1>
          </router-link>
          <NotificationDropdown
            v-if="isAuthenticated"
            :is-open="navbarStore.isNotificationsMenuOpen"
            @toggle="navbarStore.toggleMenu('notifications')"
            class="flex-shrink-0"
          />
          <!-- <MessagesDropdown
            v-if="isAuthenticated"
            :is-open="navbarStore.isMessageMenuOpen"
            @toggle="navbarStore.toggleMenu('messages')"
            class="flex-shrink-0"
          /> -->
          <UserDropdown
            v-if="isAuthenticated"
            :is-open="navbarStore.isUserMenuOpen"
            @toggle="navbarStore.toggleMenu('user')"
            class="flex-shrink-0"
          />
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '../../api/auth/useAuth';
import { useSidebarStore } from '../../stores/sidebar';
import UserDropdown from '../molecules/UserDropdown.vue';
import MessagesDropdown from '../molecules/MessagesDropdown.vue';
import NotificationDropdown from '../molecules/NotificationDropdown.vue';
import { useNavbarStore } from '../../stores/navbar';

const { isAuthenticated } = useAuth();
const navbarStore = useNavbarStore();
const sidebarStore = useSidebarStore();
const headerRef = ref(null);

function handleClickOutside(event) {
  if (headerRef.value && !headerRef.value.contains(event.target)) {
    navbarStore.closeAllMenus();
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* Transiciones para animaciones */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>