<template>
  <div class="comments-list space-y-3">
    <div v-if="comments.length === 0" class="text-gray-500 text-sm italic p-2">
      No hay comentarios aún.
    </div>
    <div 
      v-for="comment in comments" 
      :key="comment.idDoc" 
      class="flex items-start justify-between gap-3 p-3 bg-white text-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 dark:text-gray-100 dark:bg-gray-700 dark:border-gray-800 rounded-lg shadow-sm transition-all duration-200 border border-gray-100"
    >
      <div class="flex-1">
        <p>
          <strong class="font-semibold">{{ comment.user.displayName || 'Anónimo' }}</strong> 
          <span class="ml-1 text-gray-700 dark:text-gray-400">{{ comment.message }}</span>
        </p>
        <p class="text-xs text-gray-500 hover:text-gray-90 mt-1">{{ formatTimestamp(comment.created_at) }}</p>
      </div>
      <button 
        @click="showDeleteModal(comment.idDoc)" 
        class=" text-primary dark:text-secondary hover:text-primary-md  dark:hover:text-secondary-md transition-colors duration-200 focus:outline-none"
        title="Eliminar comentario"
      >
        <i class="fa-solid fa-trash-can w-4 h-4"></i>
      </button>
    </div>

    <!-- Modal de confirmación -->
    <div v-if="showModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-101 transition-opacity duration-300">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl transform transition-all duration-300">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-300 mb-4">¿Eliminar comentario?</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer.</p>
        <div class="flex justify-end gap-3">
          <button 
            @click="showModal = false" 
            class="px-4 py-2 text-gray-500 dark:text-gray-300 font-medium rounded-lg dark:bg-gray-700 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
          >
            Cancelar
          </button>
          <button 
            @click="confirmDelete" 
            class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-xl hover:bg-primary-md dark:hover:bg-secondary-md transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { formatTimestamp } from '../../utils/formatTimestamp';
import { useGroupComments } from '../../composable/useGroupComments';

// Definimos las props
const props = defineProps({
  post: {
    type: Object,
    required: true
  }
});

// Usamos el composable con el idDoc del post y grupo
const { comments, deleteComment } = useGroupComments(props.post.group.id, props.post.idDoc);

// Estado para el modal
const showModal = ref(false);
const commentToDelete = ref(null);

// Mostrar el modal y guardar el ID del comentario a eliminar
function showDeleteModal(commentId) {
  commentToDelete.value = commentId;
  showModal.value = true;
}

// Confirmar eliminación
async function confirmDelete() {
  if (commentToDelete.value) {
    try {
      await deleteComment(commentToDelete.value);
      showModal.value = false;
      commentToDelete.value = null;
    } catch (error) {
      console.error('Error al eliminar el comentario:', error);
    }
  }
}
</script>

<style scoped>
.comments-list {
  max-height: 300px; /* Limita la altura para scroll */
  overflow-y: auto; /* Scroll vertical */
}

/* Estilo personalizado para el scrollbar */
.comments-list::-webkit-scrollbar {
  width: 6px;
}
.comments-list::-webkit-scrollbar-thumb {
  background-color: #02bcae; /* Color teal consistente */
  border-radius: 3px;
}
.comments-list::-webkit-scrollbar-track {
  background: #f1f5f9; /* Fondo gris claro */
}
</style>