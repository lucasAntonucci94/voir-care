<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
    <!-- Banner con título -->
    <div class="relative h-64 w-full bg-gray-200 dark:bg-gray-700">
      <img v-if="blog?.image" :src="blog.image" alt="Banner" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-black/40 flex items-center justify-center px-4">
        <h1 class="text-3xl md:text-4xl font-bold text-white text-center drop-shadow-md">{{ blog?.title }}</h1>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="max-w-3xl mx-auto px-4 py-10">
      <div class="mb-6 text-sm text-gray-600 dark:text-gray-300 flex flex-wrap gap-2">
        <span v-for="category in blog?.categories" :key="category" class="bg-teal-100 dark:bg-teal-700 text-teal-900 dark:text-white px-3 py-1 rounded-full text-xs font-semibold">
          {{ category }}
        </span>
      </div>

      <div class="space-y-6 leading-relaxed">
        <p>{{ blog?.intro }}</p>

        <div v-for="section in blog?.sections" :key="section.title" class="space-y-3">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white">{{ section.title }}</h2>
          <p v-if="section.text" class="text-gray-700 dark:text-gray-300">{{ section.text }}</p>
          <img
            v-if="section.image"
            :src="section.image"
            :alt="section.title"
            class="w-full rounded-md shadow-md object-cover"
          />
        </div>

        <p class="text-sm text-gray-500 dark:text-gray-400">Publicado el {{ blog?.date }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { blogs } from '../data/blogs.js'

const route = useRoute()
const router = useRouter()
const blog = ref(null)

onMounted(() => {
  debugger
  const blogId = parseInt(route.params.idBlog)
  const found = blogs.value.find(b => b.id === blogId)
  if (!found) {
    router.push('/blog') // fallback si no se encuentra
  } else {
    blog.value = found
  }
})
</script>

<style scoped>
</style>
