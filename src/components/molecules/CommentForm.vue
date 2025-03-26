<!-- CreateComment.vue -->
<template>
  <form @submit.prevent="submitComment" class="flex gap-2 mt-2">
    <input 
      v-model="comment" 
      type="text" 
      placeholder="Escribe un comentario..." 
      class="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200" 
    />
    <Button 
      type="submit" 
      class="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-teal-600 transition-all duration-200"
    >
      <i class="fas fa-paper-plane"></i>
      <!-- <span class="pl-2">Enviar</span> -->
    </Button>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import { useAuth } from '../../api/auth/useAuth';
import { useComments } from '../../composable/useComments';
import Button from '../atoms/Button.vue';

const props =defineProps({
  idPost: {
    type: String,
    required: true
  }
});

const { user } = useAuth();
const { saveComment } = useComments(props?.idPost); // Usamos el composable con el idPost
const comment = ref('');

// Función para enviar el comentario
async function submitComment() {
  if (!comment.value.trim()) return; // Evita enviar comentarios vacíos
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
      message: comment.value
    });
    comment.value = ''; // Resetea el input tras enviar
  } catch (error) {
    console.error('Error al enviar el comentario:', error);
  }
}
</script>