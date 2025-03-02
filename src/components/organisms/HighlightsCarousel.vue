<template>
    <section class="mt-10">
      <h2 class="text-xl font-bold text-[#2c3e50] mb-4 text-center">Destacados</h2>
      <div class="flex overflow-x-auto space-x-4 scrollbar-hide snap-x snap-mandatory px-4">
        <div v-for="highlight in highlights" :key="highlight.id" class="min-w-[160px] bg-white p-3 rounded-lg shadow-md snap-center border border-gray-100">
          <img :src="highlight.thumbnail" alt="Thumbnail" class="w-full h-24 object-cover rounded-lg" />
          <p class="mt-2 text-sm text-gray-700 font-bold text-center">{{ highlight.title }}</p>
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  defineProps(['highlights']);
  </script>
  
  <style scoped>
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  </style>