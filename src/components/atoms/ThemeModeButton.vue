<template>
    <button :class="['w-48 md:w-100 text-white font-bold py-2 px-4 rounded', `${isDarkMode ? 'bg-green-600 hover:bg-green-700':'bg-gray-500 hover:bg-gray-700'}`]" @click="toggleTheme">
      {{ isDarkMode? 'Light Mode': 'Dark Mode' }}
    </button>
</template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  
  const isDarkMode = ref(false); // Start in light mode
  
  function toggleTheme() {
    isDarkMode.value =!isDarkMode.value;
    document.documentElement.classList.toggle('dark'); // Toggle the 'dark' class
    localStorage.setItem('theme', isDarkMode.value? 'dark': 'light'); // Save preference
  }
  
  onMounted(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      isDarkMode.value = true;
      document.documentElement.classList.add('dark');
    }
  });
  </script>
  
  <style scoped>
  
  </style>