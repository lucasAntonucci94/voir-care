<template>
  <form @submit.prevent="submitComment" class="flex gap-2 mt-2">
    <input 
      v-model="comment" 
      type="text" 
      placeholder="Escribe un comentario..." 
      class="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:bg-gray-600 text-gray-700 dark:text-gray-300 placeholder-gray-400 transition-all duration-200" 
    />
   <Button 
      type="submit" 
      :disabled="!cleanedComment || !cleanedComment.length"
      class="flex items-center justify-center px-4 py-2 bg-primary dark:bg-secondary text-white rounded-lg hover:bg-primary-md dark:hover:bg-secondary-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <i class="fas fa-paper-plane"></i>
    </Button>
  </form>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuth } from '../../api/auth/useAuth';
import { useEventComments } from '../../composable/useEventComments';
import Button from '../atoms/Button.vue';

const props = defineProps({
  idPost: {
    type: String,
    required: true
  },
  idEvent: {
    type: String,
    required: true
  }
});

const { user } = useAuth();
const { saveComment } = useEventComments(props?.idEvent, props?.idPost);
const comment = ref('');
const cleanedComment = computed(() => sanitizeComment(comment.value));

// Función para enviar el comentario
async function submitComment() {
  if (!cleanedComment.value) return;
  if (!user.value) {
    console.error('Usuario no autenticado');
    return;
  }
  try {
    await saveComment({
      user: {
        id: user.value.uid || user.value.id,
        displayName: user.value.displayName || 'Usuario Anónimo'
      },
      message: comment.value,
    });
    comment.value = ''; // Resetea el input tras enviar
  } catch (error) {
    console.error('Error al enviar el comentario:', error);
  }
}
function sanitizeComment(text) {
  return text
    .replace(/</g, '&lt;')    // evita inyecciones HTML
    .replace(/>/g, '&gt;')
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // elimina caracteres invisibles
    .trim();
}
</script>