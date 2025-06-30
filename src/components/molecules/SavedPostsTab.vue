<template>
    <div>
      <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 sr-only">Publicaciones Guardadas</h2>
      <div v-if="postsStore.isLoading" class="flex justify-center items-center py-6">
        <img src="../../assets/loaders/pawOrange.gif" alt="Loading...">
        <p class="text-primary dark:text-secondary ml-2 animate-pulse">Cargando publicaciones guardadas...</p>
      </div>
      <div v-else-if="filteredSavedPosts.length > 0" class="space-y-6 mx-auto max-w-lg">
        <PostCard
          v-for="post in filteredSavedPosts"
          :key="post.idDoc"
          :post="post"
        />
      </div>
      <div v-else class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <p class="text-gray-500 dark:text-gray-400">No tienes publicaciones guardadas aún.</p>
        <button
          class="mt-4 px-4 py-2 bg-primary hover:bg-primary-md dark:bg-secondary dark:hover:bg-secondary-md text-white rounded-lg text-sm transition-colors"
          @click="navigateToFeed"
        >
          Explorar publicaciones
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { watch, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { usePostsStore } from '../../stores/posts'
  import PostCard from '../organisms/PostCard.vue'
  
  const router = useRouter()
  const postsStore = usePostsStore()
  
  const filteredSavedPosts = computed(() => postsStore.savedPosts || [])
  
  watch(
    () => postsStore.savedPostIds,
    async (newSavedPostIds) => {
      if (newSavedPostIds.length > 0) {
        await postsStore.fetchSavedPosts()
      } else {
        postsStore.savedPosts = []
      }
    },
    { immediate: true }
  )

  function navigateToFeed() {
    router.push('/feed')
  }
  </script>
  
  <style scoped>

  </style>