<template>
  <div class="flex flex-col min-h-screen">
    <Header />
    <div class="flex flex-1 relative">
      <!-- Sidebar visible solo en /feed y /profile en desktop, pero siempre accesible en mobile -->
      <Sidebar
        :class="{
          'hidden md:block': !permitedRoutes()
        }"
        :show="sidebarStore.showSidebar"
        @toggle="sidebarStore.toggleSidebar"
      />
      <!-- Contenido principal -->
      <main class="flex-grow bg-gray-50 font-poppins overflow-y-auto flex-1">
        <div class="container mx-auto px-4">
          <router-view />
        </div>
      </main>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import Header from '../../components/organisms/Header.vue';
import Footer from '../../components/organisms/Footer.vue';
import Sidebar from '../../components/organisms/Sidebar.vue';
import { useSidebarStore } from '../../stores/sidebar';
import { useRoute } from 'vue-router';
import { useAuth } from '../../api/auth/auth';

const $route = useRoute();
const { isAuthenticated } = useAuth();
const sidebarStore = useSidebarStore();

// Métodos
const permitedRoutes = () => {
  console.log(($route.path === '/feed' || $route.path === '/profile') && isAuthenticated)
  return ($route.path === '/feed' || $route.path === '/profile') && isAuthenticated;
};
</script>

<style scoped>
.font-poppins { font-family: 'Poppins', sans-serif; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>