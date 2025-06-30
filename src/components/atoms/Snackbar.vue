<template>
    <transition name="slide-fade">
      <div
        v-if="visible"
        :class="[
          'fixed bottom-6 left-6 z-159 px-4 py-3 rounded-lg shadow-lg text-white text-sm flex items-center gap-3',
          variants[type] || variants.info
        ]"
        role="alert"
      >
        <i :class="icons[type] || icons.info"></i>
        <span>{{ message }}</span>
        <button @click="close" class="ml-auto hover:opacity-80 transition text-white">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </transition>
  </template>
  
  <script setup>
  import { storeToRefs } from 'pinia'
  import { useSnackbarStore } from '../../stores/snackbar'
  
  const store = useSnackbarStore()
  const { visible, message, type } = storeToRefs(store)
  const { close } = store
  
  const variants = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
    secondary: 'bg-gray-700'
  }
  
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    info: 'fas fa-info-circle',
    secondary: 'fas fa-bell'
  }
  </script>
  
  <style scoped>
  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition: all 0.3s ease;
  }
  .slide-fade-enter-from,
  .slide-fade-leave-to {
    opacity: 0;
    transform: translateY(20px);
  }
  </style>
  