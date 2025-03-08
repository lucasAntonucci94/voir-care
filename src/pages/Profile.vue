<template>
  <div class="min-h-screen bg-gray-50 font-poppins">
     <ProfileHeader :activeUser="activeUser" :activeTab="activeTab" :isOwnProfile="isOwnProfile" :setTabConexiones="setTabConexiones" :setTabInformation="setTabInformation" :connections="connections" :updateDataFromChild="updateDataFromChild" />
    <!-- Tabs -->
    <div class="container mx-auto mt-10 px-4 md:px-8 lg:px-16 sticky top-0 bg-gray-50 z-10 shadow-sm">
      <div class="flex items-center gap-2 py-2 overflow-x-auto scrollbar-hide">
        <button 
          v-for="tab in visibleTabs" 
          :key="tab" 
          @click="activeTab = tab.toLowerCase()"
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium transition-all',
            activeTab === tab.toLowerCase() ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
        >
          {{ tab }}
        </button>
        <div v-if="hiddenTabs.length" class="relative">
          <button 
            @click="showMoreTabs = !showMoreTabs" 
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-all"
          >
            Más
          </button>
          <div 
            v-if="showMoreTabs" 
            class="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-2 transition-all duration-300 ease-in-out transform origin-top-right scale-95"
            :class="{ 'scale-100': showMoreTabs }"
          >
            <button 
              v-for="tab in hiddenTabs" 
              :key="tab" 
              @click="activeTab = tab.toLowerCase(); showMoreTabs = false"
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {{ tab }}
            </button>
          </div>
        </div>
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
          <div v-else-if="activeTab === 'información'" class="bg-white p-4 rounded-lg shadow-sm  mx-auto max-w-lg">
            <p>Información del usuario (pendiente de implementación)</p>
          </div>
          <div v-else-if="activeTab === 'conexiones'" class="bg-white p-4 rounded-lg shadow-sm mx-auto max-w-lg">
            <!-- Conexiones -->
            <div class="block">
              <h2 class="text-lg font-semibold text-[#2c3e50] mb-4">Conexiones</h2>
              <div class="space-y-4">
                <div v-for="connection in connections" :key="connection.idDoc" class="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition">
                  <img 
                    :src="connection.photoURLFile || defaultAvatar" 
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

// Instancias
const route = useRoute();
const { user: authUser } = useAuth();
const postsStore = usePostsStore();
const { getUserProfileByEmail } = useUsers();

// Estados
const activeUser = ref(null);
const activeTab = ref('publicaciones');
const showMoreTabs = ref(false);
const defaultAvatar = 'https://firebasestorage.googleapis.com/v0/b/parcialcwantonucci.appspot.com/o/profile%2Flucas.e.antonucci%40gmail.com.jpg?alt=media&token=a8d69477-990e-4e3d-bba3-8a19a83fccd4';
const connections = ref( [
    { idDoc: '1', displayName: 'Ana Gómez', email: 'ana@example.com', photoURLFile: defaultAvatar },
    { idDoc: '2', displayName: 'Carlos Pérez', email: 'carlos@example.com', photoURLFile: defaultAvatar },
    { idDoc: '3', displayName: 'Carlos Pérez', email: 'carlos@example.com', photoURLFile: defaultAvatar },
    { idDoc: '4', displayName: 'Carlos Pérez', email: 'carlos@example.com', photoURLFile: defaultAvatar },
    { idDoc: '5', displayName: 'Carlos Pérez', email: 'carlos@example.com', photoURLFile: defaultAvatar },
    { idDoc: '6', displayName: 'Carlos Pérez', email: 'carlos@example.com', photoURLFile: defaultAvatar },
    // ... más conexiones
  ]
  .filter(c => c.email !== activeUser?.email)
);
// Tabs
const allTabs = ['Publicaciones', 'Información', 'Conexiones', 'Galería', 'Eventos', 'Grupos'];
const visibleTabs = computed(() => allTabs.slice(0, 4));
const hiddenTabs = computed(() => allTabs.slice(4));
const setTabConexiones = () => { activeTab.value = 'conexiones'};
const setTabInformation = () => { activeTab.value = 'información'};
const updateDataFromChild = (updatedData) => { debugger; activeUser.value = updatedData; authUser.value = updatedData;};

// Computados
const activeUserEmail = computed(() => route.params.email || authUser.value?.email);
const isOwnProfile = computed(() => activeUserEmail.value === authUser.value?.email);
const profilePosts = computed(() => {
  if (!activeUserEmail.value || !postsStore.posts.value) return [];
  return postsStore.posts.value.filter(post => post.user.email === activeUserEmail.value);
});

//Watcher
watch(activeUserEmail, async (newEmail) => {
  if (!newEmail) return;
  await fetchUserData(newEmail);
});

// Fetch de datos
const fetchUserData = async (userEmail) => {
  activeUser.value = await getUserProfileByEmail(userEmail);
};

function deletePost(postId) {
  postsStore.posts.value = postsStore.posts.value.filter(p => p.id !== postId);
}

// Ciclo de vida
onMounted(async () => {
  if (!activeUserEmail.value) return;
  await fetchUserData(activeUserEmail.value);
  postsStore.subscribe();
});

onUnmounted(() => {
  postsStore.unsubscribe();
});
</script>

<style scoped>
.font-poppins { font-family: 'Poppins', sans-serif; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
