<template>
  <div class="bg-white p-4 rounded-lg shadow-md w-full max-w-lg border border-gray-100 relative hover:shadow-lg dark:bg-gray-900  text-[#2c3e50] dark:text-white">
    <PostHeader :post="post" @delete="deletePost" @share="sharePost" @report="reportPost" />
    <h3 class="text-lg font-bold">{{ post?.title }}</h3>
    <p class="mt-1 text-sm">{{ post?.body }}</p>
    <div v-if="post?.imageUrlFile" class="mt-3">
      <img
        v-if="post?.mediaType === 'image'"
        :src="post?.imageUrlFile"
        alt="Post media"
        class="w-full h-48 object-cover rounded-lg cursor-pointer"
        @click="openMediaModal"
      />
      <video
        v-else-if="post?.mediaType === 'video'"
        :src="post?.imageUrlFile"
        controls
        class="w-full h-48 rounded-lg cursor-pointer"
        @click="openMediaModal"
      ></video>
    </div>
    <div class="flex gap-2 mt-2 flex-wrap">
      <span v-for="category in post?.categories" :key="category.id" class="text-xs text-primary bg-teal-100 px-2 py-1 rounded-full">
        {{ category.name }}
      </span>
    </div>
    <div class="flex justify-between mt-3 text-sm text-gray-600 dark:text-white">
      <button
        @click="toggleLike"
        :class="{ 'text-primary': post?.likes?.some(l => l.userId === user?.value?.id) }"
        class="hover:text-primary transition-colors flex items-center gap-1"
        :disabled="!user"
      >
        <i class="fas fa-heart"></i> {{ post?.likes?.length ?? 0 }} Me gusta
      </button>
      <button @click="post.showComments = !post.showComments" class="hover:text-primary transition-colors">
        {{ comments?.length ?? 0 }} Comentarios
      </button>
    </div>
    <div v-if="post?.showComments" class="mt-4 border-t pt-4">
      <CommentList :post="post" />
      <CommentForm :idPost="post.idDoc" />
    </div>

    <!-- Modal para el media -->
    <div
      v-if="showMediaModal"
      class="fixed inset-0 bg-black/90 z-101 transition-opacity duration-300 overflow-hidden"
      @click.self="closeMediaModal"
    >
      <div class="flex h-full w-full">
        <!-- Contenido multimedia -->
        <div class="flex-1 flex items-center justify-center relative">
          <div v-if="post?.mediaType === 'image'" class="media-container">
            <img
              :src="post?.imageUrlFile"
              alt="Post media"
              class="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
          <div v-else-if="post?.mediaType === 'video'" class="media-container">
            <video
              :src="post?.imageUrlFile"
              controls
              autoplay
              class="max-w-full max-h-full object-contain rounded-lg"
            ></video>
          </div>
        </div>

        <!-- Panel lateral de comentarios -->
        <div class="w-full md:w-80 bg-gray-900/80 md:bg-gray-50 text-white md:text-gray-800 p-4 md:p-6 flex flex-col justify-between absolute bottom-0 md:static h-40 md:h-auto md:max-h-full overflow-y-auto">
          <div>
            <h3 class="text-lg md:text-xl font-semibold mb-2">{{ post?.title }}</h3>
            <p class="text-sm md:text-base mb-4">{{ post?.body }}</p>
            <button
              @click="toggleLike"
              :class="{ 'text-primary': post?.likes?.some(l => l.userId === user?.value?.id) }"
              class="hover:text-primary transition-colors flex items-center gap-1 mb-4"
              :disabled="!user"
            >
              <i class="fas fa-heart"></i> {{ post?.likes?.length ?? 0 }} Me gusta
            </button>
            <hr class="border-t border-gray-300 md:border-gray-400 mb-4" />
            <CommentList :post="post" />
            <CommentForm :idPost="post.idDoc" />
          </div>
          <button
            @click="closeMediaModal"
            class="absolute top-2 right-2 text-gray-300 md:text-gray-600 hover:text-white md:hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            aria-label="Cerrar modal"
          >
            <i class="fa-solid fa-times text-xl md:text-2xl"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuth } from '../../api/auth/useAuth';
import CommentForm from '../molecules/CommentForm.vue';
import CommentList from '../molecules/CommentList.vue';
import PostHeader from '../molecules/PostHeader.vue';
import { usePostsStore } from '../../stores/posts';
import { useComments } from '../../composable/useComments';

const { user } = useAuth();
const props = defineProps(['post']);
const postsStore = usePostsStore();
const { comments } = useComments(props.post.idDoc);

// Estado del modal
const showMediaModal = ref(false);

// Inicializamos propiedades faltantes
props.post.likes = props.post.likes || [];
props.post.showMenu = props.post.showMenu || false;
props.post.showComments = props.post.showComments || false;

async function toggleLike() {
  if (!user.value) {
    console.log('Usuario no autenticado, no puede dar Like');
    return;
  }
  await postsStore.toggleLike(props.post.idDoc, {
    id: user.value.uid,
    email: user.value.email,
  });
}

function deletePost() {
  console.log('Eliminar post:', props.post);
  postsStore.deletePost(props.post.idDoc);
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

function openMediaModal() {
  showMediaModal.value = true;
  document.body.style.overflow = 'hidden'; // Fija el fondo
}

function closeMediaModal() {
  showMediaModal.value = false;
  document.body.style.overflow = ''; // Restaura el scroll del body
}
</script>

<style scoped>
/* Estilos del modal */
.fixed {
  transition: opacity 0.3s ease-in-out;
}

/* Contenedor de medios */
.media-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
}

/* Estilos responsivos */
@media (max-width: 768px) {
  .media-container {
    height: calc(100vh - 10rem); /* Deja espacio para el panel inferior */
  }

  .flex {
    flex-direction: column;
  }

  .w-80 {
    width: 100%;
    max-height: 10rem; /* Limita la altura del panel inferior en mobile */
  }
}

/* Scroll en el panel de comentarios */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(155, 155, 155, 0.5);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
</style>