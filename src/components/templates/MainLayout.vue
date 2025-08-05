<template>
  <div class="flex flex-col min-h-screen">
    <Header :isAdminRoute="permitedAdminRoutes" :permitedRoutes="permitedRoutes" />
    <div class="flex flex-1 relative">
      <!-- Sidebar principal (para usuarios normales) -->
      <Sidebar
        v-if="permitedRoutes"
        :show="sidebarStore.showSidebar"
        @toggle="sidebarStore.toggleSidebar"
      />
      <!-- Sidebar de administración (para rutas /admin) -->
      <SidebarAdmin
        v-if="permitedAdminRoutes"
        :show="sidebarStore.showAdminSidebar"
        @toggle="sidebarStore.toggleAdminSidebar"
      />
      <main class="flex-grow bg-gray-50 dark:bg-gray-900 overflow-y-auto flex-1">
        <router-view />
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
import { ref, onUnmounted, watch, computed, onMounted } from 'vue'; // Importar onMounted
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
import SidebarAdmin from '../../components/organisms/SidebarAdmin.vue';

const $route = useRoute();
const { user, isAuthenticated } = useAuth();
const sidebarStore = useSidebarStore();
const privateChatsStore = usePrivateChatsStore();
const { loadCategories } = useCategories();
const isMobile = ref(false); // Estado reactivo para la detección móvil

// Función para actualizar el estado de isMobile
const checkMobile = () => {
  isMobile.value = window.matchMedia('(max-width: 767px)').matches;
};

// Watch para manejar la suscripción cuando el usuario cambia
watch(
  () => user.value?.email,
  (newEmail, oldEmail) => {
    if (newEmail && newEmail !== oldEmail) {
      // console.log('Usuario autenticado, iniciando suscripción a chats para:', newEmail);
      privateChatsStore.initializeSubscription(newEmail);
    } else if (!newEmail && oldEmail) {
      // console.log('Usuario desautenticado, cancelando suscripción a chats...');
      privateChatsStore.initializeUnsubscribe();
    }
    if(isAuthenticated.value) loadCategories(); 
  },
  { immediate: true }
);

// Cancelar suscripción al desmontar el componente
onUnmounted(() => {
  privateChatsStore.initializeUnsubscribe();
  // Limpiar el event listener de resize al desmontar
  window.removeEventListener('resize', checkMobile);
});

// Inicializar y escuchar cambios de tamaño de ventana al montar el componente
onMounted(() => {
  checkMobile(); // Establece el estado inicial de isMobile
  window.addEventListener('resize', checkMobile); // Escucha cambios de tamaño
});


const permitedRoutes = computed(() => {
  const defaultBlockedPaths = ['/', '/login', '/register']; // Rutas donde nunca se muestra el sidebar
  const desktopSpecificBlockedPaths = ['/explorar', '/chats']; // Rutas bloqueadas solo en desktop/tablet
  const isAdminPath = $route.path.startsWith('/admin'); // Rutas de administración

  // Condición para rutas bloqueadas por defecto (siempre bloqueadas)
  const isDefaultBlocked = defaultBlockedPaths.includes($route.path);

  // Condición para rutas bloqueadas solo en desktop/tablet
  // Si NO es móvil
  const isDesktopSpecificBlocked = !isMobile.value && desktopSpecificBlockedPaths.includes($route.path);

  // El sidebar principal se muestra si:
  // 1. El usuario está autenticado.
  // 2. NO es una ruta bloqueada por defecto.
  // 3. NO es una ruta de administración.
  // 4. NO es una ruta bloqueada específicamente para desktop/tablet.
  return isAuthenticated.value && !isDefaultBlocked && !isAdminPath && !isDesktopSpecificBlocked;
});

const permitedAdminRoutes = computed(() => {
  const isAdminPath = $route.path.startsWith('/admin'); // Verifica si la ruta empieza con /admin
  return isAdminPath && isAuthenticated.value;
});

const shouldShowChatBox = computed(() => {
  return isAuthenticated.value && $route.path !== '/faqs' && $route.path !== '/chats' && !$route.path.includes('/admin');
});
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>