<template>
  <div class="bg-white p-4 rounded-lg shadow-md w-full max-w-lg border border-gray-100 relative">
    <PostHeader :post="post" @edit="editPost" @delete="deletePost" @share="sharePost" @report="reportPost" />
    <h3 class="text-lg font-bold text-[#2c3e50]">{{ post?.title }}</h3>
    <p class="text-gray-700 mt-1 text-sm">{{ post?.body }}</p>
    <div v-if="post?.imageUrlFile" class="mt-3">
      <img :src="post?.imageUrlFile" alt="Post media" class="w-full h-48 object-cover rounded-lg" />
    </div>
    <div class="flex gap-2 mt-2 flex-wrap">
      <span v-for="category in post?.categories" :key="category.id" class="text-xs text-[#02bcae] bg-teal-100 px-2 py-1 rounded-full">
        {{ category.name }}
      </span>
    </div>
    <div class="flex justify-between mt-3 text-sm text-gray-600">
      <button
        @click="toggleLike"
        :class="{ 'text-[#02bcae]': post?.likes?.some(l => l.userId === user?.id) }"
        class="hover:text-[#02bcae] transition-colors flex items-center gap-1"
      >
        <i class="fas fa-heart"></i> {{ post?.likes?.length ?? 0 }} Me gusta
      </button>
      <button @click="post.showComments = !post.showComments" class="hover:text-[#02bcae] transition-colors">
        {{ comments?.length ?? 0 }} Comentarios
      </button>
    </div>
    <div v-if="post?.showComments" class="mt-4 border-t pt-4">
      <CommentList :post="post" />
      <CommentForm :idPost="post.idDoc" />
    </div>
  </div>
</template>

<script setup>
import { useAuth } from '../../api/auth/auth';
import CommentForm from '../molecules/CommentForm.vue';
import CommentList from '../molecules/CommentList.vue';
import PostHeader from '../molecules/PostHeader.vue';
import { usePostsStore } from '../../stores/posts';
import { useComments } from '../../composable/useComments';

const { user } = useAuth();
const props = defineProps(['post']);
const postsStore = usePostsStore();
const { comments } = useComments(props.post.idDoc);

// Inicializamos propiedades faltantes si no vienen de la base de datos
props.post.likes = props.post.likes || [];
props.post.comments = [];
// props.post.comments = comments.value || [];
props.post.showComments = props.post.showComments || false;
props.post.showMenu = props.post.showMenu || false;

function toggleLike() {
  const userLiked = props.post.likes.some(like => like.userId === user.value?.id);
  if (userLiked) {
    props.post.likes = props.post.likes.filter(like => like.userId !== user.value?.id);
  } else {
    props.post.likes.push({ userId: user.value?.id });
  }
}

function editPost() {
  console.log('Editar post:', props.post.id);
  props.post.showMenu = false;
}

function deletePost() {
  console.log('Eliminar post:', props.post);
  postsStore.deletePost(props.post.idDoc)
  props.post.showMenu = false;
}

function sharePost() {
  console.log('Compartir post:', props.post.id);
  props.post.showMenu = false;
}

function reportPost() {
  console.log('Reportar post:', props.post.id);
  props.post.showMenu = false;
}

// Función para formatear el timestamp de Firebase
function formatTimestamp(timestamp) {
  if (timestamp && timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleTimeString(); // Convertimos segundos a fecha
  }
  return timestamp?.toLocaleTimeString() || 'Sin fecha';
}
</script>