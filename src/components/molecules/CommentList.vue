<!-- CommentList.vue -->
<template>
    <div class="comments-list space-y-4">
      <div v-if="comments.length === 0" class="text-gray-500 text-sm italic">
        No hay comentarios aún.
      </div>
      <div 
        v-for="comment in comments" 
        :key="comment.idDoc" 
        class="text-sm text-gray-700 mb-2 border-b border-gray-100 pb-2 last:border-0"
      >
        <p>
          <strong class="font-semibold text-gray-800">{{ comment.user.displayName || 'Anónimo' }}</strong> 
          <span class="ml-1">{{ comment.message }}</span>
        </p>
        <p class="text-xs text-gray-500 mt-1">{{ formatTimestamp(comment.timestamp) }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps } from 'vue';
  import { formatTimestamp } from '../../utils/formatTimestamp';
  import { useComments } from '../../composable/useComments';
  // Definimos las props que recibirá el componente
  const props = defineProps({
    post: {
        type: Object,
        required: true
    }
   });
  const { comments, deleteComment } = useComments(props.post.idDoc);
  console.log(comments)
  </script>
  
  <style scoped>
  .comments-list {
    max-height: 300px; /* Limita la altura para scroll si hay muchos comentarios */
    overflow-y: auto; /* Scroll vertical si excede la altura */
  }
  </style>