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
      <CreatePostGroupModal v-if="showModal" :group-id="groupId" @close="showModal = false" />
  
      <!-- Listado de publicaciones del grupo -->
      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-500 dark:text-gray-400">Cargando publicaciones...</p>
      </div>
  
      <div v-else-if="posts.length === 0" class="text-center py-12">
        <p class="text-gray-500 dark:text-gray-400">Aún no hay publicaciones en este grupo.</p>
      </div>
  
      <div v-else class="space-y-6 max-w-lg mx-auto">
        <transition-group name="fade" tag="div" class="space-y-6">
          <PostCard
            v-for="post in posts"
            :key="post.idDoc"
            :post="post"
            class="block bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4"
          />
        </transition-group>
      </div>
  
      <!-- Mensaje de error si no se pueden cargar las publicaciones -->
      <div v-if="!loading && posts.length === 0" class="text-center py-12">
        <p class="text-gray-500 dark:text-gray-400">No se pudieron cargar las publicaciones.</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import CreatePostGroupModal from '../organisms/CreatePostGroupModal.vue'
  import PostCard from '../organisms/PostCard.vue'
  import { useGroupsStore } from '../../stores/groups'
import { is } from 'date-fns/locale'

  const groupsStore = useGroupsStore()

  const props = defineProps({
    groupId: {
      type: String,
      required: true
    },
    isMember: {
      type: Boolean,
      required: false
    },
  })
  const groupId = props.groupId
  const posts = ref([])
  const loading = ref(true)
  const showModal = ref(false)
  
  onMounted(() => {
    if (!groupId) return
    groupsStore.suscribePostsByGroupId(groupId, (data) => {
      posts.value = data
      loading.value = false
    })
  })

  onUnmounted(() => {
    if (groupsStore.unsubscribePosts) {
      groupsStore.unsubscribePosts()
      groupsStore.unsubscribePosts = null
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