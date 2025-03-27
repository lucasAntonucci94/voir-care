<!-- PostHeader.vue -->
<template>
  <div class="flex items-center justify-between mb-3">
    <router-link 
      :to="`/profile/${post?.user?.email}`" 
      class="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
    >
      <img 
        :src="post?.user?.photoURLFile || 'https://firebasestorage.googleapis.com/v0/b/parcialcwantonucci.appspot.com/o/profile%2Flucas.e.antonucci%40gmail.com.jpg?alt=media&token=a8d69477-990e-4e3d-bba3-8a19a83fccd4'" 
        alt="Avatar" 
        class="w-10 h-10 rounded-full border border-gray-200"
      />
      <div>
        <p class="text-sm font-bold text-[#2c3e50] dark:text-white">{{ post?.user?.displayName || 'Anónimo' }}</p>
        <p class="text-xs text-gray-500 dark:text-white">{{ formatTimestamp(post?.created_at) }}</p>
      </div>
    </router-link>
    <div class="relative">
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
        <ul class="py-1 text-sm text-gray-700  dark:text-gray-200">
          <li v-if="post?.user?.id === user?.uid || user?.isAdmin">
            <button 
              @click="showEditModal" 
              class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <i class="fas fa-pen mr-2"></i> Editar
            </button>
          </li>
          <li v-if="post?.user?.id === user?.uid || user?.isAdmin">
            <button 
              @click="showDeleteModal" 
              class="w-full text-left px-4 py-2
               text-primary hover:bg-primary-transparent hover:text-primary-darker 
               dark:text-secondary dark:bg-gray-700 dark:hover:bg-gray-800 dark:hover:text-secondary-lighter
                transition-all duration-200"
            >
              <i class="fas fa-trash mr-2"></i> Eliminar
            </button>
          </li>
          <li>
            <button 
              @click="emit('share')" 
              class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <i class="fas fa-share mr-2"></i> Compartir
            </button>
          </li>
          <li v-if="post?.user?.id !== user?.uid">
            <button 
              @click="handleReport" 
              class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <i class="fas fa-flag mr-2"></i> Reportar
            </button>
          </li>
          <li v-if="post?.user?.id !== user?.uid">
            <button 
              @click="handleHidePost" 
              class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <i class="fas fa-flag mr-2"></i> Ocultar
            </button>
          </li>
        </ul>
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
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <div class="p-6">
        <PostEditForm :post="post" :close-modal="closeEditModal" @update-post="handlePostUpdate" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuth } from '../../api/auth/useAuth';
import { formatTimestamp } from '../../utils/formatTimestamp';
import PostEditForm from './PostEditForm.vue';
import { useReports } from '../../composable/useReports';

const props = defineProps(['post']);
const emit = defineEmits(['delete', 'share', 'report']);

const { user } = useAuth();
const { saveReport } = useReports();

// Estado para el modal
const showModalDelete = ref(false);
const showModalEdit = ref(false);

onMounted(() => {
  console.log('PostHeader mounted');
  console.log(props.post);
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

// Confirmar eliminación y emitir evento
function handleReport() {
  saveReport(props.post.id, user.value.uid, 'Reportado desde un post');
}

// Confirmar eliminación y emitir evento
function handleHidePost() {
  // hidePost(props.post.id, user.value.uid, 'Se oculto el post');
}

// Mostrar el modal de edición
function showEditModal() {
  showModalEdit.value = true;
  document.body.style.overflow = 'hidden'; // Fija el fondo
}

function handlePostUpdate(updatedPost) {
  showModalEdit.value = false;
  document.body.style.overflow = ''; // Restaura el scroll del body
}

function closeEditModal() {
  showModalEdit.value = false;
  document.body.style.overflow = ''; // Restaura el scroll del body
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