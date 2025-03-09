<template>
  <div class="min-h-screen bg-gray-50 font-poppins">
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
    <div class="container mx-auto mt-10 px-4 md:px-8 lg:px-16 sticky top-0 bg-white z-20 shadow-sm">
      <div class="relative">
        <!-- Botón de flecha izquierda -->
        <button
          v-if="showArrows && canScrollLeft"
          @click="scrollLeft"
          class="absolute left-0 top-1/2 -translate-y-1/2 bg-primary text-white p-2 rounded-full shadow-md hover:bg-primary-md transition-colors md:hidden z-30"
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
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-[#2c3e50] hover:bg-gray-200'
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
    <div class="container mx-auto px-4 md:px-8 lg:px-16 mt-6">
      <div class="grid grid-cols-1 gap-6 max-w-full mx-4 md:mx-0">
        <!-- Publicaciones -->
        <div class="md:col-span-2">
          <h2 class="text-lg font-semibold text-[#2c3e50] mb-4 sr-only">Publicaciones</h2>
          <div v-if="activeTab === 'publicaciones'" class="space-y-6 mx-auto max-w-lg">
            <PostCard v-for="post in profilePosts" :key="post.id" :post="post" @delete="deletePost(post.id)" />
            <p v-if="!profilePosts?.length" class="text-center text-gray-500">No hay publicaciones aún.</p>
          </div>
          <div v-else-if="activeTab === 'información'" class="bg-white p-4 rounded-lg shadow-sm mx-auto max-w-lg">
            <ProfileInfo :userInfo="activeUser" />
          </div>
          <div v-else-if="activeTab === 'conexiones'" class="bg-white p-4 rounded-lg shadow-sm mx-auto max-w-lg">
            <!-- Conexiones -->
            <div class="block">
              <h2 class="text-lg font-semibold text-[#2c3e50] mb-4">Conexiones</h2>
              <div class="space-y-4">
                <div
                  v-for="connection in connections"
                  :key="connection.idDoc"
                  class="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition"
                >
                  <img
                    :src="connection.photoURLFile || avatarDefault"
                    alt="Avatar"
                    class="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p class="text-sm font-medium text-gray-700">{{ connection.displayName }}</p>
                    <p class="text-xs text-gray-500">{{ connection.email }}</p>
                  </div>
                </div>
                <p v-if="connections.length === 0" class="text-center text-gray-500">No hay conexiones aún.</p>
              </div>
            </div>
          </div>
          <div v-else-if="activeTab === 'galería'" class="bg-white p-4 rounded-lg shadow-sm mx-auto max-w-lg">
            <p>Galería (pendiente de implementación)</p>
          </div>
          <div v-else-if="activeTab === 'eventos'" class="bg-white p-4 rounded-lg shadow-sm mx-auto max-w-lg">
            <p>Eventos (pendiente de implementación)</p>
          </div>
          <div v-else-if="activeTab === 'grupos'" class="bg-white p-4 rounded-lg shadow-sm mx-auto max-w-lg">
            <p>Grupos (pendiente de implementación)</p>
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
import ProfileHeader from '../components/molecules/ProfileHeader.vue';
import ProfileInfo from '../components/molecules/ProfileInfoTab.vue';
import avatarDefault from '../assets/avatar1.jpg';

// Instancias
const route = useRoute();
const { user: authUser } = useAuth();
const postsStore = usePostsStore();
const { getUserProfileByEmail } = useUsers();

// Estados
const activeUser = ref(null);
const activeTab = ref('publicaciones');
const tabsContainer = ref(null); // Referencia al contenedor de tabs
const showArrows = ref(false); // Controlar visibilidad de flechas
const canScrollLeft = ref(false); // Controlar visibilidad de flecha izquierda
const canScrollRight = ref(false); // Controlar visibilidad de flecha derecha
const connections = ref([
  { idDoc: '1', displayName: 'Ana Gómez', email: 'ana@example.com', photoURLFile: avatarDefault },
  { idDoc: '2', displayName: 'Carlos Pérez', email: 'carlos@example.com', photoURLFile: avatarDefault },
  { idDoc: '3', displayName: 'Carlos Pérez', email: 'carlos@example.com', photoURLFile: avatarDefault },
  { idDoc: '4', displayName: 'Carlos Pérez', email: 'carlos@example.com', photoURLFile: avatarDefault },
  { idDoc: '5', displayName: 'Carlos Pérez', email: 'carlos@example.com', photoURLFile: avatarDefault },
  { idDoc: '6', displayName: 'Carlos Pérez', email: 'carlos@example.com', photoURLFile: avatarDefault },
].filter(c => c.email !== activeUser?.email));

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
const profilePosts = computed(() => {
  debugger
  if (!activeUserEmail.value || !postsStore.posts.value) return [];
  const adwdaw =  postsStore.posts.value.filter(post => post.user.email === activeUserEmail.value);
  debugger
  return adwdaw
});

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

// Actualizar estado de desplazamiento
const updateScrollState = () => {
  if (tabsContainer.value) {
    const { scrollLeft, scrollWidth, clientWidth } = tabsContainer.value;
    canScrollLeft.value = scrollLeft > 0;
    canScrollRight.value = scrollLeft + clientWidth < scrollWidth - 1; // -1 para tolerancia
  }
};

// Verificar si se necesitan flechas
const checkScroll = () => {
  if (tabsContainer.value) {
    const { scrollWidth, clientWidth } = tabsContainer.value;
    showArrows.value = scrollWidth > clientWidth && window.innerWidth < 768; // Mostrar flechas solo si hay overflow y es menor a md
    updateScrollState(); // Actualizar estado inicial
  }
};

// Fetch de datos
const fetchUserData = async userEmail => {
  activeUser.value = await getUserProfileByEmail(userEmail);
};

function deletePost(postId) {
  postsStore.posts.value = postsStore.posts.value.filter(p => p.id !== postId);
}

// Ciclo de vida
onMounted(async () => {
  if (!activeUserEmail.value) return;
  await fetchUserData(activeUserEmail.value);
  debugger
  postsStore.subscribe();
  checkScroll(); // Verificar al montar
  window.addEventListener('resize', checkScroll); // Verificar al redimensionar
});

onUnmounted(() => {
  postsStore.unsubscribe();
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
</style>