<!-- Feed.vue -->
<template>
  <div class="flex flex-1 overflow-hidden">
    <!-- Sidebar -->
    <Sidebar :show="sidebarStore.showSidebar" @toggle="sidebarStore.toggleSidebar" />
    <!-- Contenido principal del Feed -->
    <main class="flex-grow py-10 bg-gray-50 min-h-screen font-poppins overflow-y-auto">
      <div class="container mx-auto px-4">
        <!-- Reels o Highlights -->
        <HighlightsCarousel />
        <CreatePostModal />
        <section class="space-y-6 flex flex-col items-center">
          <template v-if="postsStore.isLoading">
            <p class="text-center text-gray-500">Cargando publicaciones...</p>
          </template>
          <template v-else>
            <PostCard
              v-for="post in postsStore.posts.value"
              :key="post.idDoc"
              :post="post"
            />
            <p v-if="postsStore?.posts?.value?.length === 0" class="text-center text-gray-500">No hay publicaciones aún.</p>
          </template>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import CreatePostModal from '../components/organisms/CreatePostModal.vue';
import PostCard from '../components/organisms/PostCard.vue';
import HighlightsCarousel from '../components/organisms/HighlightsCarousel.vue';
import Sidebar from '../components/organisms/Sidebar.vue';
import { useSidebarStore } from '../stores/sidebar';
import { usePostsStore } from '../stores/posts';
import { useAuth } from '../api/auth/auth';
// Stores y estado
const { user } = useAuth();

const postsStore = usePostsStore();
const sidebarStore = useSidebarStore();

// Ciclo de vida
onMounted(async () => {
  console.log('Feed.vue montado, iniciando suscripción...');
  postsStore.subscribe(); // Inicia la suscripción a los posts en tiempo real
});

onUnmounted(() => {
  console.log('Feed.vue desmontado, cancelando suscripción...');
  postsStore.unsubscribe(); // Cancela la suscripción al desmontar el componente
});
</script>

<style scoped>
.font-poppins { font-family: 'Poppins', sans-serif; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>