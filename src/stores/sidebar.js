import { defineStore } from 'pinia';

export const useSidebarStore = defineStore('sidebar', {
  state: () => ({
    showSidebar: false,
    showAdminSidebar: false,
  }),
  actions: {
    toggleSidebar() {
      this.showSidebar = !this?.showSidebar;
      // Aplica/remueve el overflow solo si la pantalla es menor a 768px (version donde el sidebar es desplegable)
      if (window.innerWidth < 768) {
        if (this.showSidebar) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      }
    },
    openSidebar() {
      this.showSidebar = true;
      document.body.style.overflow = 'hidden';
    },
    closeSidebar() {
      this.showSidebar = false;
      document.body.style.overflow = '';
    },
    toggleAdminSidebar() {
      this.showAdminSidebar = !this?.showAdminSidebar;
    },
    openAdminSidebar() {
      this.showAdminSidebar = true;
    },
    closeAdminSidebar() {
      this.showAdminSidebar = false;
    },
  },
});