<template>
  <div class="container mx-auto px-4 py-6">
    <div
      v-if="posts === null"
      class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-500 dark:text-gray-400"
    >
      Cargando posteos de tus grupos...
    </div>

    <div
      v-else-if="posts.length === 0"
      class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-500 dark:text-gray-400"
    >
      Aún no hay publicaciones en tus grupos.
    </div>

    <div v-else class="max-w-2xl mx-auto space-y-6">
      <PostCard
        v-for="post in posts"
        :key="post.idDoc + '-' + post.groupId"
        :post="post"
      />
    </div>
  </div>
</template>
  
  <script setup>
  import { computed } from 'vue'
  import { useGroupsStore } from '../../stores/groups'
  import PostCard from '../organisms/PostCard.vue'
  
  const groupsStore = useGroupsStore()
  const posts = computed(() => groupsStore.userGroupFeed.value || [])
  </script>
  