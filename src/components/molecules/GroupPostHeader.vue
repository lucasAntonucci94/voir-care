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
        <p class="text-xs text-gray-500 dark:text-white">{{ post?.createdAt != null ? formatTimestamp(post?.createdAt) : null }}</p>
      </div>
    </router-link>
    <div class="relative" ref="dropdownRef">
      <button 
        @click="post.showMenu = !post.showMenu" 
        class="text-gray-600 hover:text-primary dark:text-white dark:hover:text-gray-300 focus:outline-none transition-colors duration-200 bg-gray-100/10 hover:bg-gray-100/40 dark:bg-gray-700 hover:dark:bg-gray-600 rounded-full p-1 w-8 h-8 shadow-sm hover:shadow-md"
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
  <GroupPostEditModal :visible="showModalEdit" :post="post" @close="closeEditModal" @update-post="handlePostUpdate" />

  <!-- Modal de compartir -->
  <!-- <SharePostModal :post="post" /> -->
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useAuth } from '../../api/auth/useAuth';
import { formatTimestamp } from '../../utils/formatTimestamp';
// import { useShareStore } from '../../stores/shareStore';
import { usePostsStore } from '../../stores/posts';
import GroupPostEditModal from './GroupPostEditModal.vue';
// import SharePostModal from '../molecules/SharePostModal.vue';
import { useReports } from '../../composable/useReports';
import DefaultAvatar from '../../assets/avatar1.jpg';
import { useSnackbarStore } from '../../stores/snackbar'
import { useGroupPostsStore } from '../../stores/groupPosts';

const props = defineProps(['post']);
const emit = defineEmits(['delete', 'report']);

const { user } = useAuth();
const { saveReport } = useReports();
// const shareStore = useShareStore();
const postsStore = usePostsStore();
const groupPostsStore = useGroupPostsStore();
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
const isSaved = computed(() => {
  return groupPostsStore.savedPostIds.includes(props.post.idDoc);
});

// Toggle save/unsave post
async function toggleSavePost() {
  if (!user.value?.uid) return;
  await groupPostsStore.toggleSavePost(user.value.uid, props.post.idDoc, props.post.group.id);
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
  const response = await saveReport({
      entityType: 'groupPost',
      entityId: props.post.id,
      userId: user.value.uid,
      reason: selectedReportReason.value,
      description: reportDescription.value,
      metadata: { title: props.post.title, groupId: props.post.group.id },
    });

  if (response) {
    isLoading.value = false;
    showModalReport.value = false;
    document.body.style.overflow = '';
    // user.value.hiddenPosts.push({ id: user.value.uid, postId: props.post.id });
    snackbarStore.show('La publicación ha sido reportada exitosamente.', 'success');
  } else {
    snackbarStore.show('Error al reportar una publicación', 'success');
  }
}

// Mostrar el modal de report
function showReportModal() {
  showModalReport.value = true;
  document.body.style.overflow = 'hidden';
}

// // Mostrar el modal de compartir
// function showShareModal() {
//   shareStore.openShareModal(props.post);
// }

// Mostrar el modal de ocultar
function showHideModal() {
  showModalHide.value = true;
  document.body.style.overflow = 'hidden';
}

// Confirmar ocultar post
async function handleHidePost() {
  const { hidePostGroup } = useGroupPostsStore();
  isLoading.value = true;
  const response = await hidePostGroup(user.value.uid, props.post.id);
  if (response) {
    isLoading.value = false;
    showModalHide.value = false;
    document.body.style.overflow = '';
    user.value.hiddenGroupPosts.push({ id: user.value.uid, postId: props.post.id });
    snackbarStore.show('Se oculto la publicación.', 'success');
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
// Handle post update
function handlePostUpdate(updatedPost) {
  showModalEdit.value = false;
  document.body.style.overflow = '';
}

// Mostrar el modal de edición
function showEditModal() {
  showModalEdit.value = true;
  document.body.style.overflow = 'hidden';
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