<template>
  <div>
    <!-- Filtros -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Blog de Cuidado Animal
        </h2>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar blogs..."
          class="px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-gray-200"
        />
      </div>
      <div class="flex flex-wrap gap-2">
        <button
            v-for="category in categories"
            :key="category"
            :class="[
            'px-3 py-1 rounded-full text-sm font-semibold transition',
            selectedFilter === category
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
            ]"
            @click="selectedFilter = category"
        >
            {{ category }}
        </button>
      </div>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-600 dark:text-gray-300">Cargando blogs...</p>
    </div>

    <!-- Estado de error -->
    <div v-else-if="error" class="text-center py-8 text-red-600">
      {{ error }}
    </div>

    <!-- Lista de blogs -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <BlogPostCard
        v-for="post in filteredBlogs"
        :key="post.id"
        :post="post"
      />
    </div>
  </div>
</template>

<script setup>
import { useBlogs } from '../../composable/useBlogs'
import BlogPostCard from './BlogCard.vue'

const { categories, selectedFilter, searchQuery, filteredBlogs, loading, error, loadData } = useBlogs()

loadData()
</script>