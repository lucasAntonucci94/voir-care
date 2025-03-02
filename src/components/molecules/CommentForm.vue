<template>
    <form @submit.prevent="submitComment" class="flex gap-2 mt-2">
      <input v-model="comment" type="text" placeholder="Escribe un comentario..." class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02bcae]" />
      <Button><i class="fas fa-paper-plane"></i></Button>
    </form>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import Button from '../atoms/Button.vue';
  
  const emit = defineEmits(['submit']);
  
  const comment = ref('');
  
  function submitComment() {
    if (comment.value) {
      emit('submit', comment.value);
      comment.value = '';
    }
  }
  </script>