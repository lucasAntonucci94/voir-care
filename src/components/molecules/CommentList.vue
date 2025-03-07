<!-- CommentList.vue -->
<template>
  <div class="comments-list space-y-3">
    <div v-if="comments.length === 0" class="text-gray-500 text-sm italic p-2">
      No hay comentarios aún.
    </div>
    <div 
      v-for="comment in comments" 
      :key="comment.idDoc" 
      class="flex items-start justify-between gap-3 p-3 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-200 border border-gray-100"
    >
      <div class="flex-1">
        <p>
          <strong class="font-semibold text-gray-800">{{ comment.user.displayName || 'Anónimo' }}</strong> 
          <span class="ml-1 text-gray-700">{{ comment.message }}</span>
        </p>
        <p class="text-xs text-gray-500 mt-1">{{ formatTimestamp(comment.timestamp) }}</p>
      </div>
      <button 
        @click="showDeleteModal(comment.idDoc)" 
        class=" text-primary hover:text-primary-darker transition-colors duration-200 focus:outline-none"
        title="Eliminar comentario"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0V3a1 1 0 011-1h2a1 1 0 011 1v1m-6 4h12"></path>
        </svg>
      </button>
    </div>

    <!-- Modal de confirmación -->
    <div v-if="showModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-101 transition-opacity duration-300">
      <div class="bg-white rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl transform transition-all duration-300">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">¿Eliminar comentario?</h3>
        <p class="text-sm text-gray-600 mb-6">¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer.</p>
        <div class="flex justify-end gap-3">
          <button 
            @click="showModal = false" 
            class="px-4 py-2 text-gray-500 font-medium rounded-lg hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
          >
            Cancelar
          </button>
          <button 
            @click="confirmDelete" 
            class="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-md transition-all duration-200 shadow-md hover:shadow-lg"
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
import { defineProps } from 'vue';
import { formatTimestamp } from '../../utils/formatTimestamp'; // Ruta correcta
import { useComments } from '../../composable/useComments'; // Ruta correcta

// Definimos las props
const props = defineProps({
  post: {
    type: Object,
    required: true
  }
});

// Usamos el composable con el idDoc del post
const { comments, deleteComment } = useComments(props.post.idDoc);

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