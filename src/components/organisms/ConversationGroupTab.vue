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
      <CreatePostGroupModal v-if="showModal" :group-id="group.id" @close="showModal = false" />
  
      <!-- Listado de publicaciones del grupo -->
      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-500 dark:text-gray-400">Cargando publicaciones...</p>
      </div>
  
      <div v-else-if="posts.length === 0" class="text-center py-12">
        <p class="text-gray-500 dark:text-gray-400">Aún no hay publicaciones en este grupo.</p>
      </div>
  
      <div v-else class="space-y-6 max-w-lg mx-auto">
        <transition-group name="fade" tag="div" class="space-y-6">
          <GroupPostCard
            v-for="post in posts"
            :key="post.idDoc"
            :post="post"
            />
            <!-- class="block bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4" -->
        </transition-group>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import CreatePostGroupModal from '../organisms/CreatePostGroupModal.vue'
  import GroupPostCard from '../organisms/GroupPostCard.vue'
  import { useGroupPostsStore } from '../../stores/groupPosts'

  const groupPostsStore = useGroupPostsStore()

  const props = defineProps({
    group: {
      type: Object,
      required: true
    },
    isMember: {
      type: Boolean,
      required: false
    },
  })
  debugger
  const groupId = props.group.idDoc
  const posts = ref([])
  const loading = ref(true)
  const showModal = ref(false)
  
  onMounted(() => {
    if (!groupId) return
    groupPostsStore.suscribePostsByGroupId(groupId, (data) => {
      posts.value = data
      debugger
      posts.value = posts.value.map((post) => { 
        post.group = props.group
        post.group.id = groupId
        return post
      })
      loading.value = false
    })
  })

  onUnmounted(() => {
    if (groupPostsStore.unsubscribePosts) {
      groupPostsStore.unsubscribePosts()
      groupPostsStore.unsubscribePosts = null
    }
  })
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