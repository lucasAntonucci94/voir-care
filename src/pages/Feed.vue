<template>
  <div class="flex flex-1 overflow-hidden">
    <main class="flex-grow py-10 min-h-screen font-poppins overflow-y-auto">
      <div class="container mx-auto px-4">
        <CarrouselReels />
        <CreatePostModal />
        <section class="space-y-6 flex flex-col items-center">
          <template v-if="postsStore.isLoading">
            <img src="../assets/loaders/pawOrange.gif" alt="">
            <p class="text-center text-primary dark:text-secondary animate-pulse">Cargando publicaciones...</p>
          </template>
          <template v-else>
            <PostCard
              v-for="post in visiblePosts"
              :key="post.idDoc"
              :post="post"
            />
            <p v-if="postsStore.posts.value.length === 0" class="text-center text-gray-500">No hay publicaciones aún.</p>
          </template>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, computed } from 'vue';
import CreatePostModal from '../components/organisms/CreatePostModal.vue';
import PostCard from '../components/organisms/PostCard.vue';
import CarrouselReels from '../components/organisms/CarrouselReels.vue';
import { usePostsStore } from '../stores/posts';
import { useAuth } from '../api/auth/useAuth';

const { user } = useAuth();
const postsStore = usePostsStore();

const visiblePosts = computed(() => {
  console.log(user.value.hiddenPosts)
  return postsStore.posts.value?.filter(post => 
    !user.value?.hiddenPosts?.some(hidden => hidden.postId === post.id)
  );
});
onMounted(() => {
  console.log('Feed.vue montado, iniciando suscripción global...');
  postsStore.subscribeGlobal(); // Suscripción global
});

onUnmounted(() => {
  console.log('Feed.vue desmontado, cancelando suscripción global...');
  postsStore.unsubscribeGlobal(); // Cancela solo la suscripción global
});
</script>

<style scoped>
.font-poppins { font-family: 'Poppins', sans-serif; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>