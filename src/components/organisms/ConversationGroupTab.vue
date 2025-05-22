<template>
  <div>
    <!-- Input que abre el modal para crear post -->
    <section class="flex justify-center mb-6">
      <input 
        v-if="isMember"
        type="text" 
        placeholder="Escribe algo para este grupo..." 
        @click="showModal = true" 
        class="w-full hover:bg-gray-50 max-w-xl p-4 rounded-full bg-white dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-gray-300 dark:border-gray-800 border border-gray-200 dark:border-gray-800 shadow-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary cursor-pointer text-gray-700 placeholder-gray-400 transition-all duration-200 hover:shadow-lg" 
        readonly 
      />
    </section>

    <!-- Modal para crear publicación -->
    <CreatePostGroupModal v-if="showModal" :group-id="group.idDoc" @close="showModal = false" />

    <!-- Listado de publicaciones del grupo -->
    <div v-if="isLoading" class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">Cargando publicaciones...</p>
    </div>

    <div v-else-if="posts?.length === 0" class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">Aún no hay publicaciones en este grupo.</p>
    </div>

    <div v-else class="space-y-6 max-w-lg mx-auto">
      <transition-group name="fade" tag="div" class="space-y-6">
        <GroupPostCard
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
import CreatePostGroupModal from '../organisms/CreatePostGroupModal.vue';
import GroupPostCard from '../organisms/GroupPostCard.vue';
import { useGroupPostsStore } from '../../stores/groupPosts';

const groupPostsStore = useGroupPostsStore();
const posts = computed(() => groupPostsStore.groupDetailPosts.value || [])

const props = defineProps({
  group: {
    type: Object,
    required: true,
  },
  isMember: {
    type: Boolean,
    required: false,
  },
});

const showModal = ref(false);
const isLoading = ref(false);

onMounted(() => {
  if (!props.group) return;
  groupPostsStore.suscribePostsByGroupId(props.group);
  isLoading.value = false;
});

onUnmounted(() => {
  groupPostsStore.unsuscribePostsByGroupId();
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