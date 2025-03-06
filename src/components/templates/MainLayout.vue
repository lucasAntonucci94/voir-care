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
        <div class="container mx-auto">
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
import { onMounted, onUnmounted } from 'vue';
import { usePrivateChatsStore } from '../../stores/privateChats'; // Añadimos el store de chats privados

const $route = useRoute();
const { user, isAuthenticated } = useAuth();
const sidebarStore = useSidebarStore();
const privateChatsStore = usePrivateChatsStore();

onMounted(async () => {
  console.log('MainLayout.vue montado, iniciando suscripciones a chats...');
  if (user.value?.email) {
    privateChatsStore.initializeSubscription(user.value.email);
  }
});

onUnmounted(() => {
  console.log('MainLayout.vue desmontado, cancelando suscripciones a chats...');
  privateChatsStore.unsubscribe();
});

// Métodos
const permitedRoutes = () => {
  return ($route.path === '/feed' || $route.path === '/profile') && isAuthenticated;
};
</script>

<style scoped>
.font-poppins { font-family: 'Poppins', sans-serif; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>