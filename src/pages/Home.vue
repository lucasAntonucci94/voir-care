<script setup lang="ts">
import { ref } from 'vue'
const posts = ref([
        { id: 1, title: 'Mi primer post', content: '¡Hola mundo!' },
        // ... más publicaciones
      ])
</script>

<template>
  <div class="container mx-auto py-8">
    <div class="text-center mb-8 text-white">
      <h1 class="text-3xl font-bold">Bienvenido a Mi Red Social</h1>
      <p class="text-lg">Conecta con amigos y comparte tus momentos.</p>
    </div>

    <div class="mx-auto max-w-md overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-md md:max-w-2xl">
      <div class="md:flex">
        <div class="md:shrink-0">
          <img
            class="h-48 w-full object-cover md:h-full md:w-48"
            src="../assets/building.jpg"
            alt="Modern building architecture"
          />
        </div>
        <div class="p-8">
          <div class="text-sm font-semibold tracking-wide text-indigo-500 dark:text-indigo-300 uppercase">Company retreats</div>
          <a href="#" class="mt-1 block text-lg leading-tight font-medium text-black dark:text-white hover:underline">
            Incredible accommodation for your team
          </a>
          <p class="mt-2 text-gray-500 dark:text-gray-300">
            Looking to take your team away on a retreat to enjoy awesome food and take in some sunshine? We have a list of
            places to do just that.
          </p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700   dark:text-gray-300 ">
      <div class="bg-white shadow-md rounded-lg p-6">
        <h2 class="text-xl font-bold">Descubre gente nueva</h2>
        <p>Encuentra personas con tus mismos intereses.</p>
      </div>
      <div class="bg-white shadow-md rounded-lg p-6">
        <h2 class="text-xl font-bold">Crea grupos</h2>
        <p>Conecta con personas que comparten tus pasiones.</p>
      </div>
      <div class="bg-white shadow-md rounded-lg p-6">
        <h2 class="text-xl font-bold">Comparte tus publicaciones</h2>
        <p>Muestra al mundo lo que piensas.</p>
      </div>
    </div>

    <div class="mt-8">
      <h2 class="text-2xl font-bold  text-white">Últimas publicaciones</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div v-for="post in posts" :key="post.id" class="bg-white shadow-md rounded-lg p-6">
          <h3 class="text-xl font-bold">{{ post.title }}</h3>
          <p>{{ post.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
