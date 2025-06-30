<template>
  <div class="bg-white p-4 rounded-lg shadow-md w-full max-w-lg border border-gray-100 relative hover:shadow-lg dark:bg-gray-800 dark:border-gray-800 text-[#2c3e50] dark:text-white">
    <GroupPostHeader :post="post" @delete="deletePost" @report="reportPost" />
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
        :controls="true"
        :autoplay="true"
        :loop="true"
        class="w-full h-48 rounded-lg cursor-pointer"
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
          'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer',
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
            post?.likes?.some(l => l.userId === user?.uid) ? 'text-primary dark:text-secondary' : 'text-gray-600 dark:text-gray-400'
          ]"
        ></i>
        {{ post?.likes?.length ?? 0 }} Me gusta
      </button>
      <button
        @click="post.showComments = !post.showComments"
        :class="[
          'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer',
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
      <GroupCommentList :post="post" />
      <GroupCommentForm :idPost="post.idDoc" :idGroup="post.group.id" />
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
          <div v-if="post?.media?.type === 'image'" class="media-container">
            <img
              :src="post?.media?.url"
              alt="Post media"
              class="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
          <div v-else-if="post?.media?.type === 'video'" class="media-container">
            <video
              :src="post?.media?.url"
              alt="Post media"
              :poster="post?.imageUrlFile"
              :controls="true"
              :autoplay="true"
              :loop="true" 
              autoplay
              class="max-w-full max-h-full object-contain rounded-lg"
            ></video>
          </div>
        </div>

        <!-- Panel lateral de comentarios -->
        <div class="w-full md:w-80 bg-gray-900/80 md:bg-gray-50 dark:bg-gray-800 text-white md:text-gray-800 dark:text-gray-300 p-4 md:p-6 flex flex-col justify-between absolute bottom-0 md:static h-40 md:h-auto md:max-h-full overflow-y-auto">
          <div>
            <h3 class="text-lg md:text-xl font-semibold mb-2 text-ellipsis">{{ post?.title }}</h3>
            <p class="text-sm md:text-base mb-4 text-ellipsis">{{ post?.body }}</p>
            <button
              @click="toggleLike"
              :class="[
                'flex items-center gap-2 px-4 py-2 mb-2 rounded-lg transition-all duration-200 cursor-pointer',
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
                  post?.likes?.some(l => l.userId === user?.uid) ? 'text-primary dark:text-secondary' : 'text-gray-600 dark:text-gray-400'
                ]"
              ></i>
              {{ post?.likes?.length ?? 0 }} Me gusta
            </button>
            <button
              @click="post.showComments = !post.showComments"
              :class="[
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer',
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
            <div v-if="post?.showComments" class="mt-4 border-t pt-4">
              <GroupCommentList :post="post" />
              <GroupCommentForm :idPost="post.idDoc" :idGroup="post.group.id" />
            </div>
          </div>
          <button
            @click="closeMediaModal"
            class="absolute top-2 right-2 text-gray-300 md:text-gray-600 hover:text-white md:hover:text-gray-800  dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
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
import GroupCommentForm from '../molecules/GroupCommentForm.vue';
import GroupCommentList from '../molecules/GroupCommentList.vue';
import GroupPostHeader from '../molecules/GroupPostHeader.vue';
import { useGroupPostsStore } from '../../stores/groupPosts';
import { useGroupComments } from '../../composable/useGroupComments';
import { useSnackbarStore } from '../../stores/snackbar';

const { user } = useAuth();
const props = defineProps(['post']);
const groupPostsStore = useGroupPostsStore();
const { comments } = useGroupComments(props.post.group.id, props.post.idDoc);
const snackbarStore = useSnackbarStore();

// Estado del modal
const showMediaModal = ref(false);
// Estado para mostrar comentarios
const showComments = ref(props.post.showComments || false);

// Inicializamos propiedades faltantes
props.post.likes = props.post.likes || [];

async function toggleLike() {
  if (!user.value) {
    // console.log('Usuario no autenticado, no puede dar Like');
    return;
  }
  await groupPostsStore.toggleLikePostGroup(
    props.post.group.id,
    props.post.idDoc,
    { id: user.value.uid, email: user.value.email }
  );
}

function deletePost() {
  // console.log('Eliminar post:', props.post);
  groupPostsStore.deletePostGroup(props.post.group.id, props.post.idDoc);
  props.post.showMenu = false;
  snackbarStore.show('Post eliminado correctamente', 'success');
}

function reportPost() {
  // console.log('Reportar post:', props.post.id);
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

// Actualiza el estado de mostrar comentarios
function toggleComments() {
  showComments.value = !showComments.value;
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

/* Estilos para controlar el desbordamiento del título y el cuerpo */
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
  .media-container {
    height: calc(100vh - 10rem); /* Deja espacio para el panel inferior */
  }

  .flex-actions {
    flex-direction: column;
    align-items: center;
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