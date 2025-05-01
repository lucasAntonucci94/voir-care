MainLayout.vue
<template>
    <div class="flex flex-col min-h-screen">
      <Header />
      <div class="flex flex-1 relative">
        <Sidebar
          v-if="permitedRoutes"
          :show="sidebarStore.showSidebar"
           @toggle="sidebarStore.toggleSidebar"
         />
        <main class="flex-grow bg-gray-50 dark:bg-gray-900 font-poppins overflow-y-auto flex-1">
          <div class=" mx-auto">
                  <router-view />
          </div>
        </main>
        <!-- Snackbar global -->
        <SnackBar />
        
        <!-- Chat de mensajes privados -->
        <UserChatBox v-if="shouldShowChatBox" />
      </div>
    <Footer />
  </div>
</template>

<script setup>
import { onUnmounted, watch, computed } from 'vue';
import Header from '../../components/organisms/Header.vue';
import Footer from '../../components/organisms/Footer.vue';
import Sidebar from '../../components/organisms/Sidebar.vue';
import { useSidebarStore } from '../../stores/sidebar';
import { useRoute } from 'vue-router';
import { useAuth } from '../../api/auth/useAuth';
import { usePrivateChatsStore } from '../../stores/privateChats';
import { useCategories } from '../../composable/useCategories';
import UserChatBox from '../../components/organisms/UserChatBox.vue';
import SnackBar from '../../components/atoms/SnackBar.vue'

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
    if(isAuthenticated.value) loadCategories(); 
  },
  { immediate: true }
);
// Cancelar suscripción al desmontar el componente
onUnmounted(() => {
  console.log('MainLayout.vue desmontado, cancelando suscripción a chats...');
  privateChatsStore.initializeUnsubscribe();
});

const permitedRoutes = computed(() => {
  const blockedExactPaths = ['/', '/login', '/register', '/explorar', '/chats']
  // const blockedExactPaths = ['/', '/login', '/register', '/explorar', '/chats', '/faqs']
  const isBlockedPath = blockedExactPaths.includes($route.path) //rutas donde no quiero que muestre el side.
  const isAdminPath = $route.path.startsWith('/admin') //si la ruta empieza con /admin oculto sidebar general.
  return !isBlockedPath && !isAdminPath && isAuthenticated.value
})

const shouldShowChatBox = computed(() => {
  return isAuthenticated.value && $route.path !== '/faqs'  && $route.path !== '/chats' 
})
</script>

<style scoped>
.font-poppins { font-family: 'Poppins', sans-serif; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>