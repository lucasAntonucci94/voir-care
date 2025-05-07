<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Sticky Header with Sorting -->
    <div class="sticky top-0 z-10 bg-white dark:bg-gray-800 py-4 mb-6 rounded-lg shadow-sm">
      <div class="flex justify-between items-center max-w-2xl mx-auto">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Feed de Grupos</h2>
        <select
          v-model="sortOption"
          class="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @change="sortPosts"
        >
          <option value="newest">Más recientes</option>
          <option value="mostLiked">Más gustados</option>
          <option value="mostCommented">Más comentados</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="posts === null"
      class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-500 dark:text-gray-400"
    >
      Cargando posteos de tus grupos...
    </div>

    <!-- Empty State -->
    <div
      v-else-if="sortedPosts.length === 0"
      class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-500 dark:text-gray-400"
    >
      Aún no hay publicaciones en tus grupos.
    </div>

    <!-- Posts List with Group Context -->
    <div v-else class="max-w-2xl mx-auto space-y-6">
      <TransitionGroup name="post-list">
        <div
          v-for="post in sortedPosts"
          :key="post.idDoc + '-' + post.groupId"
          class="relative"
        >
          <!-- Group Context -->
          <div class="flex items-center mb-2" @click="goToDetail(post.group.id)">
            <img
              :src="post.group.media.url || AvatarDefault"
              alt="Group Avatar"
              class="w-6 h-6 rounded-full mr-2"
            />
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ post.group.title || 'Nombre del Grupo' }}</span>
          </div>
          <PostCard :post="post" />
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useGroupsStore } from '../../stores/groups'
import PostCard from '../organisms/PostCard.vue'
import AvatarDefault from '../../assets/avatar1.jpg'
import { useAuth } from '../../api/auth/useAuth'
import { useRouter } from 'vue-router'
const groupsStore = useGroupsStore()
const posts = computed(() => groupsStore.userGroupFeed.value || [])
const sortOption = ref('newest')
const { user } = useAuth()
const router = useRouter()
// Computed property to sort posts
const sortedPosts = computed(() => {
  const postsArray = [...posts.value]

  if (sortOption.value === 'newest') {
    return postsArray.sort((a, b) => b.createdAt - a.createdAt)
  } else if (sortOption.value === 'mostLiked') {
    return postsArray.sort((a, b) => (b.likes || 0) - (a.likes || 0))
  } else if (sortOption.value === 'mostCommented') {
    return postsArray.sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0))
  }

  return postsArray
})

// Function to handle sorting
function sortPosts() {
}
function goToDetail(idGroup) {
    router.push({ name: 'groupDetail', params: { idGroup: idGroup } })
}
  

// Suscripción a eventos del usuario
onMounted(() => {
  if (user.value) {
    groupsStore.subscribeUserGroupFeed(user.value.uid)
  }
})

// Desuscripción al desmontar el componente
onUnmounted(() => {
  groupsStore.unsubscribeUserGroupFeed()
})
</script>

<style scoped>
/* Animation for posts */
.post-list-enter-active,
.post-list-leave-active {
  transition: all 0.3s ease;
}
.post-list-enter-from,
.post-list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>