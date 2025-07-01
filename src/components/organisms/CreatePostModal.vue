<template>
  <section class="flex justify-center mb-6">
    <input 
      type="text" 
      placeholder="¿Qué tienes en mente?" 
      @click="openModal" 
      class="w-full hover:bg-gray-50 max-w-lg p-4 rounded-full bg-white dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-gray-300 dark:border-gray-800 border border-gray-200 dark:border-gray-800 shadow-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary cursor-pointer text-gray-700 placeholder-gray-400 transition-all duration-200 hover:shadow-lg" 
      readonly 
    />
  </section>
  <div v-if="showModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-101 transition-opacity duration-300">
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl transform transition-all duration-300 scale-100 relative max-h-[90vh]">
      <!-- Encabezado del modal -->
      <div class="sticky top-0 bg-white dark:bg-gray-800 z-10 pb-2 border-b border-gray-200 flex items-center rounded-t-xl justify-between mb-6">
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
          Nueva Publicación
          <i class="fa-solid fa-video ml-2 text-primary dark:text-secondary" aria-hidden="true"></i>
          <i class="fa-solid fa-image ml-2 text-primary dark:text-secondary" aria-hidden="true"></i>
        </h2>
        <button @click="closeModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100">
          <i class="fa-solid fa-xmark w-6 h-6"></i>
        </button>
      </div>
      <PostForm @close="closeModal" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import PostForm from '../molecules/CreatePostForm.vue';

const showModal = ref(false);

function openModal() {
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  document.body.classList.remove('overflow-hidden');
}
</script>