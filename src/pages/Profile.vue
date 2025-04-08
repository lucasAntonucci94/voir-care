<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 font-poppins relative">
    <!-- Loader -->
    <div v-if="!activeUser" class="flex-grow flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div class="text-center">
        <img src="../assets/loaders/pawOrange.gif" alt="">
        <p class="text-primary dark:text-secondary text-lg font-medium animate-pulse">Cargando perfil...</p>
      </div>
    </div>

    <!-- Contenido del perfil (solo se muestra cuando activeUser existe) -->
    <div v-if="activeUser" class="contents">
      <ProfileHeader
        :activeUser="activeUser"
        :activeTab="activeTab"
        :isOwnProfile="isOwnProfile"
        :setTabConexiones="setTabConexiones"
        :setTabInformation="setTabInformation"
        :connections="connections"
        :updateRefData="updateDataFromChild"
      />
      <!-- Tabs con flechas -->
      <div class="container mx-auto mt-10 px-4 md:px-8 lg:px-16 sticky top-0 bg-white dark:bg-gray-800 shadow-sm">
        <div class="relative">
          <!-- Botón de flecha izquierda -->
          <button
            v-if="showArrows && canScrollLeft"
            @click="scrollLeft"
            class="absolute left-0 top-1/2 -translate-y-1/2 bg-primary dark:bg-secondary text-white p-2 rounded-full shadow-md hover:bg-primary-md dark:hover:bg-secondary-md transition-colors md:hidden z-30"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- Contenedor de tabs -->
          <div
            ref="tabsContainer"
            class="flex gap-2 py-2 overflow-x-auto scrollbar-hide whitespace-nowrap md:justify-center md:overflow-x-visible"
            @scroll="updateScrollState"
          >
            <button
              v-for="tab in allTabs"
              :key="tab"
              @click="activeTab = tab.toLowerCase()"
              :class="[
                'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200',
                activeTab === tab.toLowerCase()
                  ? 'bg-primary hover:bg-primary-md dark:bg-secondary dark:hover:bg-secondary-md text-white'
                  : 'bg-gray-100  dark:bg-gray-700 text-gray-800  dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'
              ]"
            >
              {{ tab }}
            </button>
          </div>

          <!-- Botón de flecha derecha -->
          <button
            v-if="showArrows && canScrollRight"
            @click="scrollRight"
            class="absolute right-0 top-1/2 -translate-y-1/2 bg-primary text-white p-2 rounded-full shadow-md hover:bg-primary-md transition-colors md:hidden z-30"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Contenido del perfil -->
      <div class="container mx-auto px-4 md:px-8 lg:px-16 my-6">
        <div class="grid grid-cols-1 gap-6 max-w-full mx-4 md:mx-0">
          <!-- Publicaciones -->
          <div class="md:col-span-2">
            <h2 class="text-lg font-semibold text-[#2c3e50] mb-4 sr-only">Publicaciones</h2>
            <div v-if="activeTab === 'publicaciones'" class="space-y-6 mx-auto max-w-lg">
              <!-- <CreatePostModal /> -->
              <PostCard v-for="post in postsStore.profilePosts.value" :key="post.id" :post="post" @delete="deletePost(post.id)" />
              <p v-if="!postsStore.profilePosts?.value?.length" class="text-center text-gray-500">No hay publicaciones aún.</p>
            </div>
            <ProfileInfo v-else-if="activeTab === 'información'" :userInfo="activeUser" />
            <ConnectionsTab v-else-if="activeTab === 'conexiones'" :connections="connections" />
            
            <div v-else-if="activeTab === 'galería'" class="bg-white dark:bg-gray-800 dark:text-white p-4 rounded-lg shadow-sm mx-auto max-w-lg">
              <p>Galería (pendiente de implementación)</p>
            </div>
            <div v-else-if="activeTab === 'eventos'" class="bg-white dark:bg-gray-800 dark:text-white p-4 rounded-lg shadow-sm mx-auto max-w-lg">
              <p>Eventos (pendiente de implementación)</p>
            </div>
            <div v-else-if="activeTab === 'grupos'" class="bg-white dark:bg-gray-800 dark:text-white p-4 rounded-lg shadow-sm mx-auto max-w-lg">
              <p>Grupos (pendiente de implementación)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '../api/auth/useAuth';
import { usePostsStore } from '../stores/posts';
import PostCard from '../components/organisms/PostCard.vue';
import { useUsers } from '../composable/useUsers';
import { usePosts } from '../composable/usePosts';
import ProfileHeader from '../components/molecules/ProfileHeader.vue';
import ProfileInfo from '../components/molecules/ProfileInfoTab.vue';
import ConnectionsTab from '../components/organisms/ConnectionsTab.vue';
// Instancias
const route = useRoute();
const { user: authUser } = useAuth();
const postsStore = usePostsStore();
const { getUserProfileByEmail } = useUsers();
const { subscribeToIncomingProfilePosts } = usePosts();

// Estados
const activeUser = ref(null);
const activeTab = ref('publicaciones');
const tabsContainer = ref(null);
const showArrows = ref(false);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);
const connections = ref([]);

// Tabs
const allTabs = ['Publicaciones', 'Información', 'Conexiones', 'Galería', 'Eventos', 'Grupos', 'Configuración'];
const setTabConexiones = () => {
  activeTab.value = 'conexiones';
};
const setTabInformation = () => {
  activeTab.value = 'información';
};
const updateDataFromChild = updatedData => {
  activeUser.value = updatedData;
  authUser.value = updatedData;
};

// Computados
const activeUserEmail = computed(() => route.params.email || authUser.value?.email);
const isOwnProfile = computed(() => activeUserEmail.value === authUser.value?.email);

// Watcher
watch(activeUserEmail, async newEmail => {
  if (!newEmail) return;
  await fetchUserData(newEmail);
});

// Funciones para desplazamiento
const scrollLeft = () => {
  if (tabsContainer.value) {
    tabsContainer.value.scrollBy({ left: -150, behavior: 'smooth' });
  }
};

const scrollRight = () => {
  if (tabsContainer.value) {
    tabsContainer.value.scrollBy({ left: 150, behavior: 'smooth' });
  }
};

const updateScrollState = () => {
  if (tabsContainer.value) {
    const { scrollLeft, scrollWidth, clientWidth } = tabsContainer.value;
    canScrollLeft.value = scrollLeft > 0;
    canScrollRight.value = scrollLeft + clientWidth < scrollWidth - 1;
  }
};

const checkScroll = () => {
  if (tabsContainer.value) {
    const { scrollWidth, clientWidth } = tabsContainer.value;
    showArrows.value = scrollWidth > clientWidth && window.innerWidth < 768;
    updateScrollState();
  }
};

// Fetch de datos
const fetchUserData = async userEmail => {
  activeUser.value = await getUserProfileByEmail(userEmail);
  connections.value = activeUser?.value?.connections?.filter(c => c.email !== activeUser?.email) ?? []; 
};

function deletePost(postId) {
  postsStore.posts.value = postsStore.posts.value.filter(p => p.id !== postId);
}

// Ciclo de vida
onMounted(async () => {
  if (!activeUserEmail.value) return;
  await fetchUserData(activeUserEmail.value);
  postsStore.subscribeProfile(activeUser?.value?.uid || activeUser?.value?.id);
  checkScroll();
  window.addEventListener('resize', checkScroll);
});

onUnmounted(() => {
  postsStore.unsubscribeProfile();
  window.removeEventListener('resize', checkScroll);
});
</script>

<style scoped>
.font-poppins {
  font-family: 'Poppins', sans-serif;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none; /* IE y Edge */
  scrollbar-width: none; /* Firefox */
}

/* Estilos del loader */
.loader {
  width: 70px;
  height: 70px;
  border: 8px solid #e5e7eb; /* Gris claro */
  border-top: 8px solid transparent;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #4f46e5, #7c3aed, #4f46e5); /* Degradado */
  animation: spin 1.2s ease-in-out infinite;
  position: relative;
}

.loader::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 50px;
  height: 50px;
  background: #fff; /* Fondo blanco para el centro */
  border-radius: 50%;
  transform: translate(-50%, -50%);
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>