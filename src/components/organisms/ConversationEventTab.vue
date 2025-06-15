<template>
  <div>
    <section class="flex justify-center mb-6">
      <input 
        v-if="isGoing"
        type="text" 
        placeholder="Escribe algo para este evento..." 
        @click="showModal = true" 
        class="w-full hover:bg-gray-50 max-w-lg p-4 rounded-full bg-white dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-gray-300 dark:border-gray-800 border border-gray-200 dark:border-gray-800 shadow-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary cursor-pointer text-gray-700 placeholder-gray-400 transition-all duration-200 hover:shadow-lg" 
        readonly 
      />
    </section>

    <!-- Modal for creating a post -->
    <CreatePostEventModal v-if="showModal" :event-id="event.idDoc" @close="showModal = false" />

    <!-- List of event posts -->
    <div v-if="isLoading" class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">Cargando publicaciones...</p>
    </div>

    <div v-else-if="posts.length === 0" class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">Aún no hay publicaciones en este evento.</p>
    </div>

    <div v-else class="space-y-6 max-w-lg mx-auto">
      <transition-group name="fade" tag="div" class="space-y-6">
        <EventPostCard
          v-for="post in posts"
          :key="post.idDoc"
          :post="post"
        />
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import CreatePostEventModal from './CreatePostEventModal.vue';
import EventPostCard from './EventPostCard.vue';
import { useEventPostsStore } from '../../stores/eventPosts';
import { useAuth } from '../../api/auth/useAuth';

const { user } = useAuth();
const eventPostsStore = useEventPostsStore();
const showModal = ref(false);
const isLoading = ref(true);

const props = defineProps({
  event: {
    type: Object,
    required: true,
  },
  isGoing: {
    type: Boolean,
    required: true,
  },
});

// Computed property to sort and filter posts
const posts = computed(() => {
  let postsArray = Array.isArray(eventPostsStore.eventDetailPosts.value)
    ? [...eventPostsStore.eventDetailPosts.value]
    : [];
  if (user.value?.hiddenEventPosts?.length > 0) {
    postsArray = postsArray.filter(
      (post) => !user.value.hiddenEventPosts.some((hidden) => hidden.postId === post.idDoc || hidden.postId === post.id)
    );
  }
  return postsArray.sort((a, b) => {
    const aTime = a.createdAt?.seconds || 0;
    const bTime = b.createdAt?.seconds || 0;
    return bTime - aTime;
  });
});

onMounted(async () => {
  if (!props.event) {
    isLoading.value = false;
    return;
  }

  try {
    await eventPostsStore.subscribePostsByEventId(props.event, () => {
      isLoading.value = false;
    });
  } catch (error) {
    console.error('Error subscribing to event posts:', error);
    isLoading.value = false;
  }
});

onUnmounted(() => {
  eventPostsStore.unsubscribePostsByEventId();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>