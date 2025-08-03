import { defineStore } from 'pinia';

export const useSidebarStore = defineStore('sidebar', {
  state: () => ({
    showSidebar: false,
    showAdminSidebar: false,
  }),
  actions: {
    toggleSidebar() {
      this.showSidebar = !this?.showSidebar;
    },
    openSidebar() {
      this.showSidebar = true;
    },
    closeSidebar() {
      this.showSidebar = false;
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