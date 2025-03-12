<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ msg: string }>()

const count = ref(0)
</script>

<template>
  <p class="text-white"> EXPLORAR</p>


</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
