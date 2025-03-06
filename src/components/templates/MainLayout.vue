MainLayout.vue
<template>
    <div class="flex flex-col min-h-screen">
      <Header />
      <div class="flex flex-1 relative">
        <Sidebar
          :class="{ 'hidden md:block': !permitedRoutes() }"
          :show="sidebarStore.showSidebar"
           @toggle="sidebarStore.toggleSidebar"
         />
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
import { onUnmounted, watch } from 'vue';
import Header from '../../components/organisms/Header.vue';
import Footer from '../../components/organisms/Footer.vue';
import Sidebar from '../../components/organisms/Sidebar.vue';
import { useSidebarStore } from '../../stores/sidebar';
import { useRoute } from 'vue-router';
import { useAuth } from '../../api/auth/auth';
import { usePrivateChatsStore } from '../../stores/privateChats';
import { useCategories } from '../../composable/useCategories';

const $route = useRoute();
const { user, isAuthenticated } = useAuth();
const sidebarStore = useSidebarStore();
const privateChatsStore = usePrivateChatsStore();
const { loadCategories } = useCategories();

// Watch para manejar la suscripción cuando el usuario cambia
watch(
  () => user.value?.email,
  (newEmail, oldEmail) => {
    if (newEmail && newEmail !== oldEmail) {
      console.log('Usuario autenticado, iniciando suscripción a chats para:', newEmail);
      privateChatsStore.initializeSubscription(newEmail);
    } else if (!newEmail && oldEmail) {
      console.log('Usuario desautenticado, cancelando suscripción a chats...');
      privateChatsStore.initializeUnsubscribe();
    }
    debugger
    loadCategories(); 
  },
  { immediate: true }
);
// Cancelar suscripción al desmontar el componente
onUnmounted(() => {
  console.log('MainLayout.vue desmontado, cancelando suscripción a chats...');
  privateChatsStore.initializeUnsubscribe();
});

// Método para determinar rutas permitidas
const permitedRoutes = () => {
  return ($route.path === '/feed' || $route.path === '/profile') && isAuthenticated.value;
};
</script>

<style scoped>
.font-poppins { font-family: 'Poppins', sans-serif; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>