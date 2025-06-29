<!-- PostCard.vue -->
<template>
  <div
    class="bg-white dark:bg-gray-800 text-gray-600 dark:text-white p-4 rounded-lg shadow-md hover:shadow-lg w-full max-w-lg border border-gray-100 dark:border-gray-800"
  >
    <PostHeader :post="post" @delete="deletePost" @report="reportPost" />
    <h3 class="text-lg font-bold text-ellipsis">{{ post?.title }}</h3>
    <p class="mt-1 text-sm text-ellipsis">{{ post?.body }}</p>
    <div v-if="post?.media?.url" class="mt-3">
      <img
        v-if="post?.media?.type === 'image'"
        :src="post?.media?.url"
        alt="Post media"
        class="w-full h-48 object-cover rounded-lg cursor-pointer"
        @click="openMediaModal"
      />
      <video
        v-else-if="post?.media?.type === 'video'"
        :src="post?.media?.url"
        :poster="post?.media?.url"
        :controls="false"
        :autoplay="true"
        :loop="true"
        muted
        class="w-full h-48 rounded-lg object-cover cursor-pointer" 
        @click="openMediaModal"
      ></video>
    </div>
    <div class="flex text-center gap-2 mt-2">
      <span
        v-for="category in post?.categories"
        :key="category.id"
        class="text-xs text-primary bg-primary/10 dark:text-secondary-md dark:bg-secondary/10 px-2 py-1 rounded-full"
      >
        {{ category.name }}
      </span>
    </div>
    <div class="flex flex-actions justify-between mt-3 text-sm text-gray-600 dark:text-white gap-4">
      <button
        @click="toggleLike"
        :class="[
          'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200',
          post?.likes?.some(l => l.userId === user?.uid)
            ? 'text-primary dark:text-secondary bg-primary/10 dark:bg-secondary/10'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-secondary',
          !user ? 'opacity-50 cursor-not-allowed' : ''
        ]"
        :disabled="!user"
      >
        <i
          :class="[
            'fas fa-heart',
            post?.likes?.some(l => l.userId === user?.uid) ? 'hidden text-primary dark:text-secondary' : 'text-gray-600 dark:text-gray-400'
          ]"
        ></i>
        {{ post?.likes?.length ?? 0 }} Me gusta
      </button>
      <button
        @click="post.showComments = !post.showComments"
        :class="[
          'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200',
          post?.showComments
            ? 'text-primary dark:text-secondary bg-primary/10 dark:bg-secondary/10'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-secondary'
        ]"
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
      <CommentForm :idPost="post.idDoc" />
    </div>

    <!-- Modal para ver detalle del post. Solo para post con imagen o video -->
    <ViewPostModal
      :showMediaModal="showMediaModal"
      :post="post"
      @update:showMediaModal="updateShowMediaModal"
      @toggle-like="toggleLike"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuth } from '../../api/auth/useAuth';
import CommentForm from '../molecules/CommentForm.vue';
import CommentList from '../molecules/CommentList.vue';
import PostHeader from '../molecules/PostHeader.vue';
import ViewPostModal from './ViewPostModal.vue';
import { usePostsStore } from '../../stores/posts';
import { useComments } from '../../composable/useComments';

const { user } = useAuth();
const props = defineProps(['post']);
const postsStore = usePostsStore();
const { comments } = useComments(props.post.idDoc);

// Estado del modal
const showMediaModal = ref(false);

async function toggleLike() {
  if (!user.value) {
    return;
  }
  await postsStore.toggleLike(props.post.idDoc, {
    id: user.value.uid,
    email: user.value.email,
  });
}

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
}
</script>

<style scoped>
/* Estilos restantes */
.text-ellipsis {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

h3.text-ellipsis,
p.text-ellipsis {
  max-width: 100%;
}

/* Estilos responsivos */
@media (max-width: 390px) {
  .flex-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>