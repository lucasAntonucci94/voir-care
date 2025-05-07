<!-- PostHeader.vue -->
<template>
  <div class="flex items-center justify-between mb-3">
    <router-link 
      :to="`/profile/${post?.user?.email}`" 
      class="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
    >
      <img 
        :src="post?.user?.photoURLFile || DefaultAvatar" 
        alt="Avatar" 
        class="w-10 h-10 rounded-full border border-gray-200 hover:border-primary"
      />
      <div>
        <p class="text-sm font-bold text-gray-700 dark:text-white">{{ post?.user?.displayName || 'Anónimo' }}</p>
        <p class="text-xs text-gray-500 dark:text-white">{{ post?.created_at != null ? formatTimestamp(post?.created_at) : null }}</p>
      </div>
    </router-link>
    <div class="relative" ref="dropdownRef">
      <button 
        @click="post.showMenu = !post.showMenu" 
        class="text-gray-600 hover:text-primary dark:text-white dark:hover:text-gray-300 focus:outline-none transition-colors duration-200"
      >
        <i class="fas fa-ellipsis-h"></i>
      </button>
      <div 
        v-if="post.showMenu" 
        class="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 dark:border-gray-800 border border-gray-200 rounded-lg shadow-lg z-10"
      >
        <ul class="py-1 text-sm text-gray-700 dark:text-gray-200">
          <li>
            <button 
              @click="toggleSavePost" 
              class="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-primary dark:bg-gray-700 dark:hover:bg-gray-800 dark:hover:text-secondary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="postsStore.isSavingPost"
            >
              <i :class="isSaved ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark'" class="mr-2"></i>
              <span v-if="postsStore.isSavingPost">Guardando...</span>
              <span v-else>{{ isSaved ? 'Guardado' : 'Guardar' }}</span>
            </button>
          </li>
          <!-- <li>
            <button 
              @click="showShareModal" 
              class="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-primary dark:bg-gray-700 dark:hover:bg-gray-800 dark:hover:text-secondary transition-all duration-200"
            >
              <i class="fas fa-share mr-2"></i> Compartir
            </button>
          </li> -->
          <li v-if="post?.user?.id === user?.uid || user?.isAdmin">
            <button 
              @click="showEditModal" 
              class="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-primary dark:bg-gray-700 dark:hover:bg-gray-800 dark:hover:text-secondary transition-all duration-200"
            >
              <i class="fas fa-pen mr-2"></i> Editar
            </button>
          </li>
          <li v-if="post?.user?.id === user?.uid || user?.isAdmin">
            <button 
              @click="showDeleteModal" 
              class="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-primary dark:bg-gray-700 dark:hover:bg-gray-800 dark:hover:text-secondary transition-all duration-200"
            >
              <i class="fas fa-trash-can mr-2"></i> Eliminar
            </button>
          </li>
          <li v-if="post?.user?.id !== user?.uid">
            <button 
              @click="showReportModal" 
              class="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-primary dark:bg-gray-700 dark:hover:bg-gray-800 dark:hover:text-secondary transition-all duration-200"
            >
              <i class="fas fa-flag mr-2"></i> Reportar
            </button>
          </li>
          <li v-if="post?.user?.id !== user?.uid">
            <button 
              @click="showHideModal" 
              class="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-primary dark:bg-gray-700 dark:hover:bg-gray-800 dark:hover:text-secondary transition-all duration-200"
            >
              <i class="fas fa-eye-slash mr-2"></i> Ocultar
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Modal de confirmación para ocultar un post -->
  <div v-if="showModalHide" class="fixed inset-0 bg-black/60 flex items-center justify-center z-101 transition-opacity duration-300">
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl transform transition-all duration-300">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-300 mb-4">¿Desea ocultar esta publicación?</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">¿Estás seguro de que quieres ocultar esta publicación?</p>
      <div class="flex justify-end gap-3">
        <button 
          @click="closeHideModal" 
          class="px-4 py-2 text-gray-500 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:hover:text-gray-200 font-medium rounded-lg hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
        >
          Cancelar
        </button>
        <button
          :disabled="isLoading"
          type="submit"
          @click="handleHidePost" 
          class="relative px-5 py-2 bg-primary dark:bg-secondary text-white font-medium rounded-lg hover:bg-primary-md dark:hover:bg-secondary-md transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-primary-md dark:disabled:bg-secondary-md disabled:cursor-not-allowed"
        >
          <span v-if="!isLoading">Ocultar</span>
          <span v-else class="flex items-center gap-2">
            <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Ocultando...
          </span>
        </button>
      </div>
    </div>
  </div>

  <!-- Modal de confirmación para reportar un post -->
  <div v-if="showModalReport" class="fixed inset-0 bg-black/60 flex items-center justify-center z-101 transition-opacity duration-300">
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl transform transition-all duration-300">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-300 mb-4">¿Desea reportar esta publicación?</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">¿Estás seguro de que quieres reportar esta publicación?</p>
      <label class="block mb-2 text-gray-700 dark:text-gray-300">Motivo del reporte:</label>
      <select v-model="selectedReportReason" class="w-full mb-4 border border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:bg-gray-600 focus:border-primary dark:focus:border-secondary rounded-lg px-3 py-2">
        <option value="" disabled selected>Seleccione un motivo</option>
        <option value="Contenido inapropiado">Contenido inapropiado</option>
        <option value="Spam">Spam</option>
        <option value="Información errónea">Información errónea</option>
        <option value="Otro">Otro</option>
      </select>
      <label class="block mb-2 text-gray-700 dark:text-gray-300">Descripción (opcional):</label>
      <textarea v-model="reportDescription" rows="3" class="w-full mb-4 border border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:bg-gray-600 rounded-lg px-3 py-2" placeholder="Agrega una descripción adicional..."></textarea>
      <div class="flex justify-end gap-3">
        <button 
          @click="closeReportModal" 
          class="px-4 py-2 text-gray-500 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:hover:text-gray-200 font-medium rounded-lg hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
        >
          Cancelar
        </button>
        <button
          :disabled="isLoading || !selectedReportReason"
          type="submit"
          @click="handleReport" 
          class="relative px-5 py-2 bg-primary dark:bg-secondary text-white font-medium rounded-lg hover:bg-primary-md dark:hover:bg-secondary-md transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-primary-md dark:disabled:bg-secondary-md disabled:cursor-not-allowed"
        >
          <span v-if="!isLoading">Reportar</span>
          <span v-else class="flex items-center gap-2">
            <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Reportando...
          </span>
        </button>
      </div>
    </div>
  </div>

  <!-- Modal de confirmación al eliminar -->
  <div v-if="showModalDelete" class="fixed inset-0 bg-black/60 flex items-center justify-center z-101 transition-opacity duration-300">
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl transform transition-all duration-300">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-300 mb-4">¿Eliminar posteo?</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">¿Estás seguro de que quieres eliminar este posteo? Esta acción no se puede deshacer.</p>
      <div class="flex justify-end gap-3">
        <button 
          @click="showModalDelete = false" 
          class="px-4 py-2 text-gray-500 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:hover:text-gray-200 font-medium rounded-lg hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
        >
          Cancelar
        </button>
        <button 
          @click="confirmDelete" 
          class="px-4 py-2 bg-primary dark:bg-secondary dark:hover:bg-secondary-md text-white rounded-xl hover:bg-primary-md transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>

  <!-- Modal de edición de un post -->
  <div v-if="showModalEdit" class="fixed inset-0 bg-black/60 z-101 flex items-center justify-center p-4 overflow-hidden">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md h-[90vh] overflow-y-auto">
      <div class="sticky top-0 bg-white dark:bg-gray-800 z-10 p-6 border-b">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-300">Editar posteo</h3>
          <button @click="closeEditModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100">
            <i class="fa-solid fa-xmark w-6 h-6"></i>
          </button>
        </div>
      </div>
      <div class="p-6">
        <PostEditForm :post="post" :close-modal="closeEditModal" @update-post="handlePostUpdate" />
      </div>
    </div>
  </div>

  <!-- Modal de compartir -->
  <SharePostModal :post="post" />
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useAuth } from '../../api/auth/useAuth';
import { formatTimestamp } from '../../utils/formatTimestamp';
import { useShareStore } from '../../stores/shareStore';
import { usePostsStore } from '../../stores/posts';
import PostEditForm from './PostEditForm.vue';
import SharePostModal from '../molecules/SharePostModal.vue';
import { useReports } from '../../composable/useReports';
import { usePosts } from '../../composable/usePosts';
import DefaultAvatar from '../../assets/avatar1.jpg';
import { useSnackbarStore } from '../../stores/snackbar'

const props = defineProps(['post']);
const emit = defineEmits(['delete', 'report']);

const { user } = useAuth();
const { saveReport } = useReports();
const { hidePost } = usePosts();
const shareStore = useShareStore();
const postsStore = usePostsStore();
const snackbarStore = useSnackbarStore()

// Estados
const isLoading = ref(false);
const dropdownRef = ref(null);
const showModalDelete = ref(false);
const showModalHide = ref(false);
const showModalEdit = ref(false);
const showModalReport = ref(false);
const selectedReportReason = ref('');
const reportDescription = ref('');

// Manejo los click del contenedor del dropdown
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    props.post.showMenu = false;
  }
};

// Computed
const isSaved = computed(() => { return postsStore.savedPostIds.includes(props.post.idDoc);});

// Toggle save/unsave post
async function toggleSavePost() {
  if (!user.value?.uid) return;
  await postsStore.toggleSavePost(user.value.uid, props.post.idDoc);
  props.post.showMenu = false;
  snackbarStore.show(isSaved.value ? 'Post guardado' : 'Post eliminado', 'success');
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Mostrar el modal de confirmación
function showDeleteModal() {
  showModalDelete.value = true;
}

// Confirmar eliminación y emitir evento
function confirmDelete() {
  emit('delete');
  showModalDelete.value = false;
}

// Confirmar report
async function handleReport() {
  if (!selectedReportReason.value) return;

  isLoading.value = true;
  const response = await saveReport(props.post.id, user.value.uid, selectedReportReason.value, reportDescription.value);
  if (response) {
    isLoading.value = false;
    showModalReport.value = false;
    document.body.style.overflow = '';
    user.value.hiddenPosts.push({ id: user.value.uid, postId: props.post.id });
  } else {
    console.error('Error reporting post');
  }
}

// Mostrar el modal de compartir
function showShareModal() {
  shareStore.openShareModal(props.post);
}

// Ejecuta metodo de guardado de post para el usuario logueado
function savePost() {
  // ejecuta guardado en db. ejecuta savePost from store
}

// Mostrar el modal de report
function showReportModal() {
  showModalReport.value = true;
  document.body.style.overflow = 'hidden';
}

// Mostrar el modal de edición
function showEditModal() {
  showModalEdit.value = true;
  document.body.style.overflow = 'hidden';
}

// Mostrar el modal de ocultar
function showHideModal() {
  showModalHide.value = true;
  document.body.style.overflow = 'hidden';
}

// Confirmar ocultar post
async function handleHidePost() {
  isLoading.value = true;
  const response = await hidePost(user.value.uid, props.post.id);
  if (response) {
    isLoading.value = false;
    showModalHide.value = false;
    document.body.style.overflow = '';
    user.value.hiddenPosts.push({ id: user.value.uid, postId: props.post.id });
  } else {
    console.error('Error hiding post');
  }
}

// Cerrar modal reportar post
function closeReportModal() {
  showModalReport.value = false;
  document.body.style.overflow = '';
}

// Cerrar modal ocultar post
function closeHideModal() {
  showModalHide.value = false;
  document.body.style.overflow = '';
}

function handlePostUpdate(updatedPost) {
  showModalEdit.value = false;
  document.body.style.overflow = '';
}

function closeEditModal() {
  showModalEdit.value = false;
  document.body.style.overflow = '';
}
</script>

<style scoped>
/* Estilos para el scroll del modal */
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