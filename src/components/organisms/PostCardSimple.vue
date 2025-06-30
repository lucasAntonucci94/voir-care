<template>
  <article
    class="bg-white dark:bg-gray-800 text-gray-600 dark:text-white p-6 rounded-lg shadow-md w-full max-w-lg border border-gray-100 dark:border-gray-800"
  >
    <PostHeader :post="post" @delete="deletePost" @report="reportPost" :disableAction="true" />
    <h3 class="text-xl font-bold text-ellipsis">{{ post?.title || 'Sin título' }}</h3>
    <p class="mt-2 text-base text-ellipsis">{{ post?.body || 'Sin contenido' }}</p>
    <div v-if="post?.media?.url" class="mt-4">
      <img
        v-if="post?.media?.type === 'image'"
        :src="post?.media?.url"
        :alt="`Media del posteo ${post?.title || 'sin título'}`"
        class="w-full h-64 object-cover rounded-lg cursor-pointer"
        @click="openMediaModal"
        loading="lazy"
      />
      <video
        v-else-if="post?.media?.type === 'video'"
        :src="post?.media?.url"
        :poster="post?.media?.url"
        :controls="false"
        :autoplay="true"
        :loop="true"
        muted
        class="w-full h-64 rounded-lg cursor-pointer"
        :aria-label="`Video del posteo ${post?.title || 'sin título'}`"
        @click="openMediaModal"
      ></video>
    </div>
    <div class="flex flex-wrap gap-2 mt-3">
      <span
        v-for="category in post?.categories"
        :key="category.id"
        class="text-xs text-primary bg-primary/10 dark:text-secondary-md dark:bg-secondary/10 px-2 py-1 rounded-full"
      >
        {{ category.name }}
      </span>
    </div>
    <div class="flex justify-between mt-4 text-sm text-gray-600 dark:text-white gap-4">
      <span class="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-50">
        <i class="fas fa-heart text-gray-600 dark:text-gray-400"></i>
        {{ post?.likes?.length ?? 0 }} Me gusta
      </span>
      <button
        @click="post.showComments = !post.showComments"
        class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200"
        :class="[
          post?.showComments
            ? 'text-primary dark:text-secondary bg-primary/10 dark:bg-secondary/10'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-secondary'
        ]"
        :aria-label="post?.showComments ? 'Ocultar comentarios' : 'Mostrar comentarios'"
      >
        <i
          :class="[
            post?.showComments ? 'fas fa-comment-slash' : 'fas fa-comment',
            post?.showComments ? 'text-primary dark:text-secondary' : 'text-gray-600 dark:text-gray-400'
          ]"
        ></i>
        {{ comments?.length ?? 0 }} Comentarios
      </button>
    </div>
    <div v-if="post?.showComments" class="mt-4 border-t pt-4">
      <CommentList :post="post" />
    </div>

    <!-- Modal para ver media -->
    <ViewPostModal
      :showMediaModal="showMediaModal"
      :post="post"
      @update:showMediaModal="updateShowMediaModal"
    />
  </article>
</template>

<script setup>
import { ref } from 'vue';
import CommentList from '../molecules/CommentList.vue';
import PostHeader from '../molecules/PostHeader.vue';
import ViewPostModal from './ViewPostModal.vue';
import { usePostsStore } from '../../stores/posts';
import { useComments } from '../../composable/useComments';

const props = defineProps({
  post: {
    type: Object,
    default: null,
    required: true,
  },
});
const postsStore = usePostsStore();
const { comments } = useComments(props.post.idDoc);

// Estado del modal
const showMediaModal = ref(false);

function deletePost() {
  postsStore.deletePost(props.post.idDoc);
  props.post.showMenu = false;
}

function reportPost() {
  props.post.showMenu = false;
}

function openMediaModal() {
  showMediaModal.value = true;
  document.body.style.overflow = 'hidden'; // Fija el fondo
}

function updateShowMediaModal(value) {
  showMediaModal.value = value;
  document.body.style.overflow = ''; // Restablece el scroll
}
</script>

<style scoped>
/* Estilos para texto con elipsis */
.text-ellipsis {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3; /* Limita a 3 líneas */
  overflow: hidden;
  text-overflow: ellipsis;
}

h3.text-ellipsis,
p.text-ellipsis {
  max-width: 100%;
}

/* Estilos responsivos */
@media (max-width: 390px) {
  article {
    padding: 1rem;
  }
}
</style>