<template>
    <div class="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
      <div class="text-center p-6">
        <!-- Icono de gato -->
        <i class="fas fa-cat text-8xl text-primary dark:text-secondary mb-6"></i>
        <h1 class="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Página no encontrada
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <router-link
          to="/"
          class="px-6 py-3 bg-primary dark:bg-secondary text-white rounded-md hover:bg-primary-md dark:hover:bg-secondary-md transition-colors"
        >
          Volver al inicio
        </router-link>
      </div>
    </div>
  </template>
  
  <script setup>
  </script>
  
  <style scoped>
  </style>
  