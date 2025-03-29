<template>
  <button
    @click="toggleTheme"
    class="w-full flex items-center justify-between gap-2 py-2 px-4 rounded-lg transition-colors duration-200 text-white bg-primary hover:bg-primary-darker dark:bg-secondary dark:hover:bg-secondary-darker"
  >
    <span class="flex items-center gap-2">
      <i :class="['fa-solid', isDarkMode ? 'fa-sun' : 'fa-moon', 'text-sm']"></i>
      {{ !isDarkMode ? 'Light Mode' : 'Dark Mode' }}
    </span>
    <i
      :class="[
        'fa-solid text-sm text-white',
        isDarkMode ? 'fa-toggle-on' : 'fa-toggle-off'
      ]"
    ></i>
  </button>
</template>

<script setup>
import { ref } from 'vue';
const isDarkMode = ref(document.documentElement.classList.contains('dark'));

function toggleTheme() {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
}
</script>