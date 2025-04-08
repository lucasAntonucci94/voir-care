<template>
    <div
      class="bg-gray-100 dark:bg-gray-700 rounded-xl shadow-md overflow-hidden w-full border border-gray-200 dark:border-gray-600 transition hover:shadow-lg cursor-pointer"
      @click="goToPostDetail"
    >
      <!-- Imagen -->
      <div v-if="post.image" class="h-40 w-full relative">
        <img
          :src="post.image"
          :alt="post.title"
          class="w-full h-full object-cover"
        />
      </div>
  
      <!-- Contenido -->
      <div class="p-4 space-y-3 text-sm text-gray-800 dark:text-gray-200">
        <h3 class="text-lg font-semibold">{{ post.title }}</h3>
        <p class="line-clamp-2 text-xs text-gray-600 dark:text-gray-300">
          {{ post.summary }}
        </p>
      </div>
  
      <!-- Categorías y acción -->
      <div class="p-4 pt-0 flex items-center justify-between flex-wrap gap-y-2">
        <div class="flex flex-wrap gap-2">
          <span
            v-for="category in post.categories"
            :key="category"
            class="text-xs px-2 py-1 rounded-full bg-teal-200 text-teal-900 dark:bg-teal-600 dark:text-white"
          >
            {{ category }}
          </span>
        </div>
        <button
          class="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-primary-md transition"
        >
          Leer más
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps } from 'vue';
  import { useRouter } from 'vue-router';
  
  const props = defineProps({
    post: {
      type: Object,
      required: true,
    },
  });
  
  const router = useRouter();
  
  const goToPostDetail = () => {
    // router.push(`/blog/${props.post.id}`);
  };
  </script>