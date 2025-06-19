<template>
    <button
      :type="type || 'button'" 
      :disabled="disabled" 
      class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-md transition-colors disabled:opacity-50"
      :class="{
        'cursor-not-allowed': disabled,
        'bg-gray-300 dark:bg-gray-600': disabled
      }">
      <slot />
    </button>
  </template>
  
  <script setup>
  defineProps(['type', 'disabled']);
  </script>