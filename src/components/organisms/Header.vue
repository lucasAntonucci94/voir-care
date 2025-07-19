<template>
  <header class="dosis-font text-white bg-primary dark:bg-secondary p-4 relative shadow-md transition-all duration-300" ref="headerRef">
    <div class="container mx-auto flex flex-wrap justify-between items-center md:py-4 px-2 md:px-8 lg:px-16">
      <div class="flex items-center mb-2 md:mb-0">
        <!-- Botón hamburguesa solo visible en móvil y en la ruta /feed -->
        <button v-if="isAuthenticated" class="md:hidden mr-6 text-lg hover:text-primary transition-colors duration-200" @click="sidebarStore.toggleSidebar">
          <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
        </button>
        <span class="sr-only" role="heading" aria-level="1">Voir</span>
        <router-link :to="isAuthenticated ? '/feed' : '/'" class="flex items-center">
          <img src="../../assets/icons/logoBlancoPNG.png" alt="Logo Voir" class="h-10" />
        </router-link>
      </div>
      <nav class="flex flex-nowrap" aria-label="Navegación principal">
        <div class="flex items-center space-x-2 md:space-x-6">
          <router-link v-if="!isAuthenticated" to="/login" class="flex items-center group">
            <i class="fa fa-user mr-2 text-white dark:text-white group-hover:text-primary-lighter dark:group-hover:text-secondary-lighter transition-colors duration-300" aria-hidden="true"></i>
            <span class="dosis-font hidden sm:block font-bold  text-white dark:text-white group-hover:text-primary-lighter dark:group-hover:text-secondary-lighter transition-colors duration-300">Iniciar Sesión</span>
          </router-link>
          <router-link v-if="!isAuthenticated" to="/register" class="flex items-center group">
            <i class="fa fa-clipboard-list mr-2  text-white dark:text-white group-hover:text-primary-lighter dark:group-hover:text-secondary-lighter transition-colors duration-300" aria-hidden="true"></i>
            <span class="dosis-font hidden sm:block font-bold  text-white dark:text-white group-hover:text-primary-lighter dark:group-hover:text-secondary-lighter transition-colors duration-300">Register</span>
          </router-link>
          <NotificationDropdown
            v-if="isAuthenticated"
            :is-open="navbarStore.isNotificationsMenuOpen"
            @toggle="navbarStore.toggleMenu('notifications')"
            class="flex-shrink-0"
          />
          <UserDropdown
            v-if="isAuthenticated"
            :is-open="navbarStore.isUserMenuOpen"
            @toggle="navbarStore.toggleMenu('user')"
            class="flex-shrink-0 ml-4"
          />
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuth } from '../../api/auth/useAuth';
import { useSidebarStore } from '../../stores/sidebar';
import UserDropdown from '../molecules/UserDropdown.vue';
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