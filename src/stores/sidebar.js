import { defineStore } from 'pinia';

export const useSidebarStore = defineStore('sidebar', {
  state: () => ({
    showSidebar: false,
    showAdminSidebar: false,
  }),
  actions: {
    toggleSidebar() {
      this.showSidebar = !this?.showSidebar;
      if(this.showSidebar){
        //bloquear scroll del body
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
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