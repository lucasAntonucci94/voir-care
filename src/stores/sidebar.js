// stores/sidebar.js
import { defineStore } from 'pinia';

export const useSidebarStore = defineStore('sidebar', {
  state: () => ({
    showSidebar: false,
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
  },
});