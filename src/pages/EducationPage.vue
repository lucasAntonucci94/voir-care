<template>
    <div class="container mx-auto px-4 py-8">
      <!-- Header con filtros -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Blog de Cuidado Animal
        </h2>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="filter in allCategories"
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
import { ref, computed } from 'vue'
import BlogPostCard from '../components/organisms/BlogCard.vue'
import { blogs } from '../data/blogs.js'

const selectedFilter = ref('Todos')

// Categorías únicas extraídas dinámicamente
const allCategories = computed(() => {
  const set = new Set()
  blogs.value.forEach(blog => blog.categories.forEach(cat => set.add(cat)))
  return ['Todos', ...Array.from(set)]
})

// Filtrado por categoría
const filteredPosts = computed(() => {
  if (selectedFilter.value === 'Todos') return blogs.value
  return blogs.value.filter(blog =>
    blog.categories.includes(selectedFilter.value)
  )
})
</script>
