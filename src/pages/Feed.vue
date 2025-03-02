<!-- Feed.vue -->
<template>
  <div class="flex flex-1 overflow-hidden">
    <!-- Sidebar -->
    <Sidebar :show="showSidebar" @toggle="emit('toggle-sidebar')" />

    <!-- Contenido principal del Feed -->
    <main class="flex-grow py-10 bg-gray-50 min-h-screen font-poppins overflow-y-auto">
      <div class="container mx-auto px-4">
        <CreatePostModal @post-created="addPost" />
        <section class="space-y-6 flex flex-col items-center">
          <PostCard v-for="post in posts" :key="post.id" :post="post" @delete="deletePost" />
          <p v-if="!posts.length" class="text-center text-gray-500">No hay publicaciones aún.</p>
        </section>
        <HighlightsCarousel :highlights="highlights" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import CreatePostModal from '../components/organisms/CreatePostModal.vue';
import PostCard from '../components/organisms/PostCard.vue';
import HighlightsCarousel from '../components/organisms/HighlightsCarousel.vue';
import Sidebar from '../components/organisms/Sidebar.vue';

// Props y Emits
defineProps(['showSidebar']);
const emit = defineEmits(['toggle-sidebar']);

// Datos de posts y highlights
const posts = ref([
  {
    id: 1,
    user: { id: '1', name: 'Juan Pérez', avatar: 'https://via.placeholder.com/40' },
    title: 'Evento de Adopción',
    description: 'Este sábado en el parque.',
    media: 'https://via.placeholder.com/300',
    mediaType: 'image',
    categories: ['Eventos'],
    timestamp: new Date(),
    likes: [{ userId: '2' }],
    comments: [{ id: 1, user: 'Ana Gómez', text: '¡Qué buena iniciativa!', timestamp: new Date() }],
    showComments: false,
    showMenu: false,
  },
]);
const highlights = ref([
  { id: 1, title: 'Reel: Adopción', thumbnail: 'https://via.placeholder.com/150' },
  { id: 2, title: 'Reel: Adopción', thumbnail: 'https://via.placeholder.com/150' },
  { id: 3, title: 'Reel: Adopción', thumbnail: 'https://via.placeholder.com/150' },
  { id: 4, title: 'Reel: Adopción', thumbnail: 'https://via.placeholder.com/150' },
  { id: 5, title: 'Reel: Adopción', thumbnail: 'https://via.placeholder.com/150' },
  { id: 6, title: 'Reel: Adopción', thumbnail: 'https://via.placeholder.com/150' },
  { id: 7, title: 'Reel: Adopción', thumbnail: 'https://via.placeholder.com/150' },
  { id: 8, title: 'Reel: Adopción', thumbnail: 'https://via.placeholder.com/150' },
  { id: 9, title: 'Reel: Adopción', thumbnail: 'https://via.placeholder.com/150' },
  { id: 10, title: 'Reel: Adopción', thumbnail: 'https://via.placeholder.com/150' },
  { id: 11, title: 'Reel: Adopción', thumbnail: 'https://via.placeholder.com/150' },
]);

// Funciones para manejar posts
function addPost(newPostData) {
  posts.value.unshift({
    ...newPostData,
    id: posts.value.length + 1,
    likes: [],
    comments: [],
    showComments: false,
    showMenu: false,
  });
}

function deletePost(postId) {
  posts.value = posts.value.filter(p => p.id !== postId);
}
</script>

<style scoped>
.font-poppins { font-family: 'Poppins', sans-serif; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>