<template>
  <div class="min-h-screen bg-gray-50 font-poppins">
    <!-- Banner -->
    <div class="relative w-full h-38 md:h-64 overflow-hidden">
      <img :src="activeUser?.bannerUrlFile ?? bannerUrl" alt="Banner" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-black/50">
      </div>
    </div>

    <!-- Perfil -->
    <div class="container mx-auto px-4 md:px-8 lg:px-16 -mt-12 md:-mt-16 relative">
      <div class="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
        <!-- Datos del usuario -->
        <div class="flex flex-col md:flex-row items-center md:items-start gap-4">
          <img :src="activeUser?.photoURLFile || defaultAvatar" alt="Avatar" class="w-20 h-20 md:w-32 md:h-32 rounded-full border-4 border-white object-cover shadow-lg" />
          <div class="text-center md:text-left text-gray-800 md:text-white">
            <h1 class="text-xl md:text-2xl font-bold">{{ activeUser?.displayName || 'Usuario' }}</h1>
            <p class="text-sm">{{ connections?.length || 0 }} conexiones</p>
            <div class="mt-2 flex -space-x-2 items-center">
              <img 
                v-for="connection in connections?.slice(0, 5)" 
                :key="connection.idDoc"
                :src="connection.photoURLFile"
                alt=""
                class="inline-block h-8 w-8 rounded-full ring-2 ring-white"
              />
              <button 
                v-if="connections?.length > 5" 
                @click="setTabConexiones" 
                class="relative inline-block h-8 w-8 rounded-full ring-2 ring-white hover:ring-primary transition"
              >
                <img 
                  :src="connections[5]?.photoURLFile" 
                  class="h-8 w-8 rounded-full object-cover"
                  alt="Más conexiones"
                />
                <div class="absolute inset-0 bg-gray-800/70 rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="white">
                    <circle cx="4" cy="12" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="20" cy="12" r="2" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
        <!-- Botones de acción -->
        <div v-if="isOwnProfile" class="flex flex-col gap-4 h-30 w-full md:w-auto">
          <!-- Editar portada (superior derecha) -->
          <div class="hidden md:flex justify-center md:justify-end gap-2">
            <button 
              v-if="!isEditingBanner" 
              @click="toggleEditBanner" 
              class="px-4 py-2 bg-white/80 text-gray-700 rounded-full hover:bg-white transition-all shadow-md"
            >
              Editar portada
            </button>
            <div v-if="isEditingBanner" class="flex items-center gap-2">
              <input 
                type="file" 
                @change="updateBanner($event.target.files[0])" 
                class="px-4 py-2 bg-white/80 text-gray-700 rounded-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary file:text-white hover:file:bg-primary-md"
              />
              <button 
                @click="toggleEditBanner" 
                class="px-3 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <!-- Agregar historia y Editar perfil (inferior derecha) -->
          <div class="flex justify-center md:justify-end mt-auto">
            <div class="flex flex-col gap-2 md:flex-row md:gap-4">
              <button 
                class="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-md transition-all shadow-md" 
                @click="addStory"
              >
                Agregar historia
              </button>
              <button 
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-all shadow-md" 
                @click="editProfile"
              >
                Editar perfil
              </button>
            </div>
          </div>
        </div>
        <div v-else class="flex flex-col gap-4 h-30 w-full md:w-auto">
          <!-- Agregar historia y Editar perfil (inferior derecha) -->
          <div class="flex justify-center md:justify-end mt-auto">
            <div class="flex flex-col gap-2 md:flex-row md:gap-4">
              <button 
                class="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-md transition-all shadow-md" 
                @click="sendMessage"
              >
                Enviar Mensaje
              </button>
              <button 
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-all shadow-md" 
                @click="showProfileInfo"
              >
                Ver Información
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

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
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-full mx-4 md:mx-0">
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
            <p>Conexiones (pendiente de implementación)</p>
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
        <!-- Conexiones -->
        <div class="hidden lg:block">
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
            <p v-if="!connections.length" class="text-center text-gray-500">No hay conexiones aún.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '../api/auth/auth';
import { useStorage } from '../composable/useStorage';
import { usePostsStore } from '../stores/posts';
import PostCard from '../components/organisms/PostCard.vue';

// Instancias
const route = useRoute();
const { user: authUser } = useAuth();
const { uploadFile, getFileUrl } = useStorage();
const postsStore = usePostsStore();

// Estados
const activeUser = ref(null);
const connections = ref([]);
const bannerUrl = ref('https://scontent.faep7-1.fna.fbcdn.net/v/t39.30808-6/468006144_10235042225423750_1721754758729309234_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeHLiv8dN0LxWRWLAoantdebrW8BVSE3WC2tbwFVITdYLWPE5IcKzXsjstYJCRhTML4&_nc_ohc=h4dpp8obhPsQ7kNvgEFWjFO&_nc_oc=AdghQMM5J-uvHF2Rmsco8ZEkpWJW-fFeLzgudtB3nZO6NqLLr9A3i9BKaXhb9glG3PbjTLs2dtlcSMGnK5O0qEBw&_nc_zt=23&_nc_ht=scontent.faep7-1.fna&_nc_gid=AtJyPxfdbpgLXVow-4flfwi&oh=00_AYA6zA75nJh-mEs-Sbe2DAm0c8oq9FE4aYp8IINt2nvSpQ&oe=67C9CC8E');
const isEditingBanner = ref(false);
const activeTab = ref('publicaciones');
const showMoreTabs = ref(false);
const defaultAvatar = 'https://firebasestorage.googleapis.com/v0/b/parcialcwantonucci.appspot.com/o/profile%2Flucas.e.antonucci%40gmail.com.jpg?alt=media&token=a8d69477-990e-4e3d-bba3-8a19a83fccd4';

// Tabs
const allTabs = ['Publicaciones', 'Información', 'Conexiones', 'Galería', 'Eventos', 'Grupos'];
const visibleTabs = computed(() => allTabs.slice(0, 4));
const hiddenTabs = computed(() => allTabs.slice(4));
const setTabConexiones = computed(() => { activeTab.value = 'conexiones'});

// Computados
const activeUserId = computed(() => route.params.id || authUser.value?.uid);
const isOwnProfile = computed(() => activeUserId.value === authUser.value?.uid);
const profilePosts = computed(() => {
  if (!activeUserId.value || !postsStore.posts.value) return [];
  return postsStore.posts.value.filter(post => post.user.id === activeUserId.value);
});

// Fetch de datos
const fetchUserData = async (userId) => {
  const mockUser = {
    uid: userId,
    displayName: userId === authUser.value?.uid ? authUser.value.displayName : `Usuario ${userId}`,
    photoURLFile: authUser.value?.photoURLFile,
    bannerUrlFile: null,
  };
  activeUser.value = mockUser;
  connections.value = [
    { idDoc: '1', displayName: 'Ana Gómez', email: 'ana@example.com', photoURLFile: defaultAvatar },
    { idDoc: '2', displayName: 'Carlos Pérez', email: 'carlos@example.com', photoURLFile: defaultAvatar },
    { idDoc: '3', displayName: 'Carlos Pérez', email: 'carlos@example.com', photoURLFile: defaultAvatar },
    { idDoc: '4', displayName: 'Carlos Pérez', email: 'carlos@example.com', photoURLFile: defaultAvatar },
    { idDoc: '5', displayName: 'Carlos Pérez', email: 'carlos@example.com', photoURLFile: defaultAvatar },
    { idDoc: '6', displayName: 'Carlos Pérez', email: 'carlos@example.com', photoURLFile: defaultAvatar },
    // ... más conexiones
  ].filter(c => c.idDoc !== userId);
};

// Métodos
function toggleEditBanner() {
  isEditingBanner.value = !isEditingBanner.value;
}

async function updateBanner(file) {
  if (!isOwnProfile.value || !file) return;
  const filepath = `banners/${activeUserId.value}/${Date.now()}`;
  try {
    await uploadFile(filepath, file);
    const url = await getFileUrl(filepath);
    activeUser.value.bannerUrlFile = url;
    isEditingBanner.value = false;
  } catch (err) {
    console.error('Error al actualizar banner:', err);
  }
}

function deletePost(postId) {
  postsStore.posts.value = postsStore.posts.value.filter(p => p.id !== postId);
}

function addStory() {
  console.log('Agregar historia');
}

function editProfile() {
  console.log('Editar perfil');
}

function sendMessage() {
  console.log('Enviar Mensaje');
}

function showProfileInfo() {
  console.log('Ver detalles de perfil');
}

// Ciclo de vida
onMounted(async () => {
  if (!activeUserId.value) return;
  await fetchUserData(activeUserId.value);
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