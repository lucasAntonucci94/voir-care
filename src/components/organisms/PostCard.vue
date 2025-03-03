<template>
  <div class="bg-white p-4 rounded-lg shadow-md w-full max-w-lg border border-gray-100 relative">
    <PostHeader :post="post" @edit="editPost" @delete="deletePost" @share="sharePost" @report="reportPost" />
    <h3 class="text-lg font-bold text-[#2c3e50]">{{ post?.title }}</h3>
    <p class="text-gray-700 mt-1 text-sm">{{ post?.body }}</p> <!-- Cambiamos description a body -->
    <div v-if="post?.imageUrlFile" class="mt-3"> <!-- Cambiamos media a imageUrlFile -->
      <img :src="post?.imageUrlFile" alt="Post media" class="w-full h-48 object-cover rounded-lg" /> <!-- Siempre asumimos imagen -->
    </div>
    <div class="flex gap-2 mt-2 flex-wrap">
      <span v-for="category in post?.categories" :key="category.id" class="text-xs text-[#02bcae] bg-teal-100 px-2 py-1 rounded-full">
        {{ category.name }} <!-- Cambiamos a category.name porque categories es un array de objetos -->
      </span>
    </div>
    <div class="flex justify-between mt-3 text-sm text-gray-600">
      <button
        @click="toggleLike"
        :class="{ 'text-[#02bcae]': post?.likes?.some(l => l.userId === user?.id) }"
        class="hover:text-[#02bcae] transition-colors flex items-center gap-1"
      >
        <i class="fas fa-heart"></i> {{ post?.likes?.length }} Me gusta
      </button>
      <button @click="post.showComments = !post.showComments" class="hover:text-[#02bcae] transition-colors">
        {{ post?.comments?.length }} Comentarios
      </button>
    </div>
    <div v-if="post?.showComments" class="mt-4 border-t pt-4">
      <div v-for="comment in post?.comments" :key="comment.id" class="text-sm text-gray-700 mb-2">
        <p><strong>{{ comment.user }}</strong> - {{ comment.text }}</p>
        <p class="text-xs text-gray-500">{{ formatTimestamp(comment.timestamp) }}</p> <!-- Ajustamos formato de timestamp -->
      </div>
      <CommentForm @submit="addComment" />
    </div>
  </div>
</template>

<script setup>
import { useAuth } from '../../api/auth/auth';
import CommentForm from '../molecules/CommentForm.vue';
import PostHeader from '../molecules/PostHeader.vue';

const props = defineProps(['post']);
const emit = defineEmits(['delete']);

const { user } = useAuth();

// Inicializamos propiedades faltantes si no vienen de la base de datos
props.post.likes = props.post.likes || [];
props.post.comments = props.post.comments || [];
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

function addComment(text) {
  props.post.comments.push({
    id: props.post.comments.length + 1,
    user: user.value?.displayName || 'Anónimo',
    text,
    timestamp: new Date(),
  });
}

function editPost() {
  console.log('Editar post:', props.post.id);
  props.post.showMenu = false;
}

function deletePost() {
  console.log('Eliminar post:', props.post);
  emit('delete', props.post.idDoc); // Emitimos idDoc en lugar de id para coincidir con Feed.vue
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