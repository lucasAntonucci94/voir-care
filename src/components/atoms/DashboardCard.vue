<template>
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md w-full transition hover:shadow-lg flex items-center justify-between">
      <div>
        <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{{ title }}</h3>
        <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ value }}</p>
      </div>
      <i class="text-gray-400 dark:text-gray-500 text-2xl" :class="icon"></i>
    </div>
  </template>
  
  <script setup>
  defineProps({
    title: String,
    value: [String, Number],
    icon: String
  })
  </script>
  
  <style scoped>
  </style>
  