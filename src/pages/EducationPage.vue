<template>
    <div class="container mx-auto px-4 py-8">
      <!-- Header con filtros -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Blog de Cuidado Animal
        </h2>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="filter in filters"
            :key="filter"
            @click="selectedFilter = filter"
            :class="[
              'px-3 py-1 rounded-full text-sm font-semibold transition',
              selectedFilter === filter
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
            ]"
          >
            {{ filter }}
          </button>
        </div>
      </div>
  
      <!-- Grid de posteos -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <BlogPostCard
          v-for="post in filteredPosts"
          :key="post.id"
          :post="post"
        />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import BlogPostCard from '../components/organisms/BlogCard.vue';
  import ImageEjemplo from '../assets/3.png';
  // Datos simulados (luego conectarás con Firebase)
  const posts = ref([
    {
      id: 1,
      title: 'Cómo preparar tu hogar para un nuevo perro',
      summary: 'Consejos prácticos para recibir a tu nueva mascota.',
      image: ImageEjemplo,
      type: 'Consejos',
      categories: ['Preparación', 'Perros'],
    },
    {
      id: 2,
      title: 'Historias de adopción: Luna encontró un hogar',
      summary: 'Conoce la emotiva historia de Luna y su nueva familia.',
      image: ImageEjemplo,
      type: 'Adopción',
      categories: ['Historias', 'Gatos'],
    },
    {
      id: 3,
      title: 'Guía básica de salud para gatos',
      summary: 'Lo que necesitas saber para mantener a tu gato sano.',
      image: ImageEjemplo,
      type: 'Salud',
      categories: ['Cuidado', 'Gatos'],
    },
  ]);
  
  // Filtros
  const filters = ['Todos', 'Consejos', 'Adopción', 'Salud'];
  const selectedFilter = ref('Todos');
  
  // Computado para filtrar posteos
  const filteredPosts = computed(() => {
    if (selectedFilter.value === 'Todos') return posts.value;
    return posts.value.filter(post => post.type === selectedFilter.value);
  });
  </script>