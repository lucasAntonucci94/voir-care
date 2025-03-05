
<template>
  <main class="min-h-screen bg-gray-50 font-poppins">
    <!-- Banner -->
    <div class="relative w-full h-48 md:h-64 overflow-hidden">
      <img :src="user?.bannerUrlFile ?? bannerUrl" alt="Banner" class="w-full h-full object-cover">
      <div class="absolute inset-0 bg-black  opacity-50 flex items-end px-4 md:px-15 lg:px-32">
        <button 
          v-if="!isEditingBanner" 
          @click="toggleEditBanner" 
          class="ml-auto mr-4 mb-4 px-3 py-1 bg-white/80 text-sm text-gray-700 rounded hover:bg-white transition-colors"
        >
          Editar foto de portada
        </button>
        <input 
          v-if="isEditingBanner" 
          type="file" 
          @change="updateBanner($event.target.files[0])" 
          class="ml-auto mr-4 mb-4 px-3 py-1 bg-white/80 text-sm text-gray-700 rounded"
        >
      </div>
    </div>
    <!-- Perfil -->
    <div class="container mx-auto px-4 md:px-15 lg:px-35 -mt-12 md:-mt-16 relative">
      <div class="flex flex-col md:flex-row items-center md:items-start gap-4">
        <img 
          :src="user?.photoURLFile || 'https://firebasestorage.googleapis.com/v0/b/parcialcwantonucci.appspot.com/o/profile%2Flucas.e.antonucci%40gmail.com.jpg?alt=media&token=a8d69477-990e-4e3d-bba3-8a19a83fccd4'" 
          alt="Avatar" 
          class="w-20 h-20 md:w-32 md:h-32 rounded-full border-4 border-white object-cover"
        ><div class="text-center md:text-left text-gray-800 md:text-white">
        <h1 class="text-xl md:text-2xl font-bold">{{ user?.displayName || 'Usuario' }}</h1>
        <p class="text-sm">{{ connections.length }} conexiones</p>
        <div class="mt-1 flex -space-x-2 items-center">
          <!-- Primeras 5 imágenes -->
          <img 
            v-for="connection in connections.slice(0, 5)" 
            class="inline-block h-10 w-10 rounded-full ring-1 ring-white" 
            alt="" 
            :src="connection.photoURLFile"
          >
          <!-- Sexto círculo con overlay y elipsis si hay 6 o más -->
          <router-link 
            v-if="connections.length > 5" 
            :to="'/profile/connections'" 
            class="relative inline-block h-10 w-10 rounded-full ring-1 ring-white hover:ring-2 hover:ring-[#02bcae] transition"
          >
            <!-- Imagen de la sexta conexión -->
            <img 
              :src="connections[5].photoURLFile" 
              class="h-10 w-10 rounded-full object-cover" 
              alt="Más conexiones"
            >
            <!-- Overlay gris y elipsis -->
            <div class="absolute inset-0 bg-gray-800 opacity-70  rounded-full flex items-center justify-center">
              <svg 
                viewBox="0 0 24 24" 
                width="16" 
                height="16" 
                fill="white" 
                class="text-white"
              >
                <circle cx="4" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="20" cy="12" r="2" />
              </svg>
            </div>
          </router-link>
        </div>
      </div>
      </div>
      <!-- Botones de acción -->
      <div class="flex flex-col md:flex-row gap-2 mt-14 md:mt-2 relative md:top-2 md:right-4 md:static">
        <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Agregar historia
        </button>
        <button class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
          Editar perfil
        </button>
        <div class="relative">
          <button class="px-2 py-2 text-gray-600 hover:text-gray-800">
            <i class="fas fa-ellipsis-v"></i>
          </button>
          <!-- Menú desplegable (simplificado) -->
          <div v-if="false" class="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg">
            <ul class="py-1 text-sm text-gray-700">
              <li><a href="#" class="block px-4 py-2 hover:bg-gray-100">Opción 1</a></li>
              <li><a href="#" class="block px-4 py-2 hover:bg-gray-100">Opción 2</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <!-- Contenido del perfil -->
    <div class="container mx-auto px-4 md:px-15 lg:px-35 mt-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Publicaciones -->
        <div class="md:col-span-2 mx-auto">
          <h2 class="text-lg font-semibold text-[#2c3e50] mb-4 sr-only">Publicaciones</h2>
          <div class="space-y-6" >
            <PostCard v-for="post in profilePosts" :key="post.id" :post="post" @delete="posts = posts.filter(p => p.id !== post.id)" />
            <p v-if="!profilePosts.length" class="text-center text-gray-500">No hay publicaciones aún.</p>
          </div>
        </div>
        <!-- Conexiones -->
        <div class="hidden md:block">
          <h2 class="text-lg font-semibold text-[#2c3e50] mb-4">Conexiones</h2>
          <div class="space-y-4">
            <div v-for="connection in connections" :key="connection.idDoc" class="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm">
              <img :src="connection.photoURLFile || 'https://firebasestorage.googleapis.com/v0/b/parcialcwantonucci.appspot.com/o/profile%2Flucas.e.antonucci%40gmail.com.jpg?alt=media&token=a8d69477-990e-4e3d-bba3-8a19a83fccd4'" alt="Avatar" class="w-10 h-10 rounded-full">
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
  </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useAuth } from '../api/auth/auth';
import { useStorage } from '../composable/useStorage';
import PostCard from '../components/organisms/PostCard.vue';
import { usePostsStore } from '../stores/posts';

// Datos del usuario y lógica
const { user } = useAuth();
const { uploadFile, getFileUrl } = useStorage();

const posts = ref([]);
const connections = ref([]);
const bannerUrl = ref('https://scontent.faep7-1.fna.fbcdn.net/v/t39.30808-6/468006144_10235042225423750_1721754758729309234_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeHLiv8dN0LxWRWLAoantdebrW8BVSE3WC2tbwFVITdYLWPE5IcKzXsjstYJCRhTML4&_nc_ohc=h4dpp8obhPsQ7kNvgEFWjFO&_nc_oc=AdghQMM5J-uvHF2Rmsco8ZEkpWJW-fFeLzgudtB3nZO6NqLLr9A3i9BKaXhb9glG3PbjTLs2dtlcSMGnK5O0qEBw&_nc_zt=23&_nc_ht=scontent.faep7-1.fna&_nc_gid=AtJyPxfdbpgLXVow-4flfwi&oh=00_AYA6zA75nJh-mEs-Sbe2DAm0c8oq9FE4aYp8IINt2nvSpQ&oe=67C9CC8E'); // URL de ejemplo para el banner
const isEditingBanner = ref(false);
const postsStore = usePostsStore();

// Filtrar posteos por user.id
const profilePosts = computed(() => {
  if (!user.value || !postsStore.posts.value) return [];
  return postsStore.posts.value.filter(post => post.user.id === user.value.id);
});
// Ciclo de vida
onMounted(async () => {
  console.log('Feed.vue montado, iniciando suscripción...');
  postsStore.subscribe(); // Inicia la suscripción a los posts en tiempo real
  
    // Simulación de conexiones (puedes reemplazar con lógica real más adelante)
    // Por ahora, usamos un array estático como ejemplo
    connections.value = [
      { uid: '1', displayName: 'Ana Gómez', email: 'ana@example.com', photoURLFile: 'https://firebasestorage.googleapis.com/v0/b/parcialcwantonucci.appspot.com/o/profile%2Flucas.e.antonucci%40gmail.com.jpg?alt=media&token=a8d69477-990e-4e3d-bba3-8a19a83fccd4' },
      { uid: '2', displayName: 'Carlos Pérez', email: 'carlos@example.com', photoURLFile: 'https://firebasestorage.googleapis.com/v0/b/parcialcwantonucci.appspot.com/o/profile%2Flucas.e.antonucci%40gmail.com.jpg?alt=media&token=a8d69477-990e-4e3d-bba3-8a19a83fccd4' },
      { uid: '3', displayName: 'María López', email: 'maria@example.com', photoURLFile: 'https://firebasestorage.googleapis.com/v0/b/parcialcwantonucci.appspot.com/o/profile%2Flucas.e.antonucci%40gmail.com.jpg?alt=media&token=a8d69477-990e-4e3d-bba3-8a19a83fccd4' },
      { uid: '4', displayName: 'Jose López', email: 'jose@example.com', photoURLFile: 'https://firebasestorage.googleapis.com/v0/b/parcialcwantonucci.appspot.com/o/profile%2Flucas.e.antonucci%40gmail.com.jpg?alt=media&token=a8d69477-990e-4e3d-bba3-8a19a83fccd4' },
      { uid: '5', displayName: 'Juan López', email: 'juan@example.com', photoURLFile: 'https://firebasestorage.googleapis.com/v0/b/parcialcwantonucci.appspot.com/o/profile%2Flucas.e.antonucci%40gmail.com.jpg?alt=media&token=a8d69477-990e-4e3d-bba3-8a19a83fccd4' },
      { uid: '6', displayName: 'Nay López', email: 'nay@example.com', photoURLFile: 'https://firebasestorage.googleapis.com/v0/b/parcialcwantonucci.appspot.com/o/profile%2Flucas.e.antonucci%40gmail.com.jpg?alt=media&token=a8d69477-990e-4e3d-bba3-8a19a83fccd4' },
      { uid: '7', displayName: 'Mir López', email: 'mir@example.com', photoURLFile: 'https://firebasestorage.googleapis.com/v0/b/parcialcwantonucci.appspot.com/o/profile%2Flucas.e.antonucci%40gmail.com.jpg?alt=media&token=a8d69477-990e-4e3d-bba3-8a19a83fccd4' },
      { uid: '8', displayName: 'Ta López', email: 'ta@example.com', photoURLFile: 'https://firebasestorage.googleapis.com/v0/b/parcialcwantonucci.appspot.com/o/profile%2Flucas.e.antonucci%40gmail.com.jpg?alt=media&token=a8d69477-990e-4e3d-bba3-8a19a83fccd4' },
      { uid: '9', displayName: 'Mar López', email: 'mar@example.com', photoURLFile: 'https://firebasestorage.googleapis.com/v0/b/parcialcwantonucci.appspot.com/o/profile%2Flucas.e.antonucci%40gmail.com.jpg?alt=media&token=a8d69477-990e-4e3d-bba3-8a19a83fccd4' },
      { uid: '10', displayName: 'Tu López', email: 'tu@example.com', photoURLFile: 'https://firebasestorage.googleapis.com/v0/b/parcialcwantonucci.appspot.com/o/profile%2Flucas.e.antonucci%40gmail.com.jpg?alt=media&token=a8d69477-990e-4e3d-bba3-8a19a83fccd4' },
    ].filter(c => c.uid !== user.value.uid); // Excluimos al usuario actual
});

onUnmounted(() => {
  console.log('Feed.vue desmontado, cancelando suscripción...');
  postsStore.unsubscribe(); // Cancela la suscripción al desmontar el componente
});

function toggleEditBanner() {
  isEditingBanner.value = !isEditingBanner.value;
}

function updateBanner(file) {
  if (user.value?.uid && file) {
    const filepath = `banners/${user.value.uid}/${Date.now()}`;
    uploadFile(filepath, file).then(() => {
      getFileUrl(filepath).then(url => {
        bannerUrl.value = url;
        isEditingBanner.value = false;
      }).catch(err => console.error('Error al obtener URL del banner:', err));
    }).catch(err => console.error('Error al subir el banner:', err));
  }
}
</script>

<style scoped>
.font-poppins { font-family: 'Poppins', sans-serif; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>