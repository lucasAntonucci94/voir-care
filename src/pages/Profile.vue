
<template>
  <main class="min-h-screen bg-gray-50 font-poppins">
    <!-- Banner -->
    <div class="relative w-full h-48 md:h-64 overflow-hidden">
      <img :src="bannerUrl" alt="Banner" class="w-full h-full object-cover">
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
          :src="user?.photoURLFile || 'https://via.placeholder.com/80'" 
          alt="Avatar" 
          class="w-20 h-20 md:w-32 md:h-32 rounded-full border-4 border-white object-cover"
        >
        <div class="text-center md:text-left  text-gray-800 md:text-white">
          <h1 class="text-xl md:text-2xl font-bold">{{ user?.displayName || 'Usuario' }}</h1>
          <p class="text-sm">{{ connections.length }} conexiones</p>
          <div class="mt-1 flex -space-x-2">
              <img class="inline-block h-10 w-10 rounded-full ring-1 ring-white" alt="" src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=2&amp;w=256&amp;h=256&amp;q=80">
              <img class="inline-block h-10 w-10 rounded-full ring-1 ring-white" alt="" src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&amp;auto=format&amp;fit=facearea&amp;facepad=2&amp;w=256&amp;h=256&amp;q=80">
              <img class="inline-block h-10 w-10 rounded-full ring-1 ring-white" alt="" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=2.25&amp;w=256&amp;h=256&amp;q=80">
              <img class="inline-block h-10 w-10 rounded-full ring-1 ring-white" alt="" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=2&amp;w=256&amp;h=256&amp;q=80">
              <img class="inline-block h-10 w-10 rounded-full ring-1 ring-white" alt="" src="https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=2&amp;w=256&amp;h=256&amp;q=80"></div><div class="mt-3 text-sm font-medium">
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
        <div class="md:col-span-2">
          <h2 class="text-lg font-semibold text-[#2c3e50] mb-4">Publicaciones</h2>
          <div class="space-y-6">
            <PostCard v-for="post in posts" :key="post.id" :post="post" @delete="posts = posts.filter(p => p.id !== post.id)" />
            <p v-if="!posts.length" class="text-center text-gray-500">No hay publicaciones aún.</p>
          </div>
        </div>

        <!-- Conexiones -->
        <div>
          <h2 class="text-lg font-semibold text-[#2c3e50] mb-4">Conexiones</h2>
          <div class="space-y-4">
            <div v-for="connection in connections" :key="connection.idDoc" class="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm">
              <img :src="connection.photoURLFile || 'https://via.placeholder.com/40'" alt="Avatar" class="w-10 h-10 rounded-full">
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
import { ref, onMounted } from 'vue';
import { useAuth } from '../api/auth/auth';
import { useStorage } from '../composable/useStorage';
import PostCard from '../components/organisms/PostCard.vue';

// Datos del usuario y lógica
const { user } = useAuth();
const { uploadFile, getFileUrl } = useStorage();

const posts = ref([]);
const connections = ref([]);
const bannerUrl = ref('https://scontent.faep7-1.fna.fbcdn.net/v/t39.30808-6/468006144_10235042225423750_1721754758729309234_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeHLiv8dN0LxWRWLAoantdebrW8BVSE3WC2tbwFVITdYLWPE5IcKzXsjstYJCRhTML4&_nc_ohc=h4dpp8obhPsQ7kNvgEFWjFO&_nc_oc=AdghQMM5J-uvHF2Rmsco8ZEkpWJW-fFeLzgudtB3nZO6NqLLr9A3i9BKaXhb9glG3PbjTLs2dtlcSMGnK5O0qEBw&_nc_zt=23&_nc_ht=scontent.faep7-1.fna&_nc_gid=AtJyPxfdbpgLXVow-4flfwi&oh=00_AYA6zA75nJh-mEs-Sbe2DAm0c8oq9FE4aYp8IINt2nvSpQ&oe=67C9CC8E'); // URL de ejemplo para el banner
const isEditingBanner = ref(false);

// Simulación de carga de publicaciones y conexiones basadas en user.value
onMounted(() => {
  debugger
  if (user.value?.uid) {
    // Cargar publicaciones propias (simulado, filtrado por uid del usuario autenticado)
    posts.value = [
      {
        id: 1,
        user: { id: user.value.uid, name: user.value.displayName, avatar: user.value.photoURLFile },
        title: 'Mi última publicación',
        description: '¡Miren este evento increíble!',
        media: 'https://via.placeholder.com/300',
        mediaType: 'image',
        categories: ['Eventos'],
        timestamp: new Date(),
        likes: [],
        comments: [],
        showComments: false,
        showMenu: false,
      },
    ];

    // Simulación de conexiones (puedes reemplazar con lógica real más adelante)
    // Por ahora, usamos un array estático como ejemplo
    connections.value = [
      { idDoc: '1', displayName: 'Ana Gómez', email: 'ana@example.com', photoURLFile: 'https://via.placeholder.com/40' },
      { idDoc: '2', displayName: 'Carlos Pérez', email: 'carlos@example.com', photoURLFile: 'https://via.placeholder.com/40' },
      { idDoc: '3', displayName: 'María López', email: 'maria@example.com', photoURLFile: 'https://via.placeholder.com/40' },
    ].filter(c => c.idDoc !== user.value.uid); // Excluimos al usuario actual
  }
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