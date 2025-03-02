<template>
    <button :type="type || 'button'" :disabled="disabled" class="px-4 py-2 bg-[#02bcae] text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50">
      <slot />
    </button>
  </template>
  
  <script setup>
  defineProps(['type', 'disabled']);
  </script>