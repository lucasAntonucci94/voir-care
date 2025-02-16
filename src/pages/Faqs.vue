<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ msg: string }>()

</script>

<template>
  <p class="text-white">FAQS</p>
  <button class="inline-flex items-center justify-center h-10 px-4 text-center leading-loose text-sm text-gray-700 hover:text-green-700 font-semibold border border-gray-200 hover:border-green-600 shadow-sm hover:shadow-none rounded-lg transition duration-200" @click="handleClick">
    BOTON
  </button>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
