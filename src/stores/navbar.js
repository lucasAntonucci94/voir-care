import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNavbarStore = defineStore('navbar', () => {
  // Estados reactivos para los menús
  const isNotificationsMenuOpen = ref(false);
  const isMessageMenuOpen = ref(false);
  const isUserMenuOpen = ref(false);
  const isMobileMenuOpen = ref(false);

  // Función para alternar un menú específico
  function toggleMenu(menu) {
    switch (menu) {
      case 'notifications':
        isNotificationsMenuOpen.value = !isNotificationsMenuOpen.value;
        // Cerrar otros menús si quieres comportamiento exclusivo
        isMessageMenuOpen.value = false;
        isUserMenuOpen.value = false;
        isMobileMenuOpen.value = false;
        break;
      case 'messages':
        isMessageMenuOpen.value = !isMessageMenuOpen.value;
        isNotificationsMenuOpen.value = false;
        isUserMenuOpen.value = false;
        isMobileMenuOpen.value = false;
        break;
      case 'user':
        isUserMenuOpen.value = !isUserMenuOpen.value;
        isNotificationsMenuOpen.value = false;
        isMessageMenuOpen.value = false;
        isMobileMenuOpen.value = false;
        break;
      case 'mobile':
        isMobileMenuOpen.value = !isMobileMenuOpen.value;
        isNotificationsMenuOpen.value = false;
        isMessageMenuOpen.value = false;
        isUserMenuOpen.value = false;
        break;
      default:
        break;
    }
  }

  // Función para cerrar todos los menús
  function closeAllMenus() {
    isNotificationsMenuOpen.value = false;
    isMessageMenuOpen.value = false;
    isUserMenuOpen.value = false;
    isMobileMenuOpen.value = false;
  }

  return {
    isNotificationsMenuOpen,
    isMessageMenuOpen,
    isUserMenuOpen,
    isMobileMenuOpen,
    toggleMenu,
    closeAllMenus,
  };
});