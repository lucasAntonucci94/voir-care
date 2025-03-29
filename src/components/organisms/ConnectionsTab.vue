<template>
 <div class="block bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mx-auto max-w-lg">
    <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Conexiones</h2>
    <div class="space-y-4">
      <div
        v-for="connection in connections"
        :key="connection.idDoc"
        class="flex items-center gap-3 p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition"
      >
        <img
          :src="connection.avatar || avatarDefault"
          alt="Avatar"
          class="w-10 h-10 rounded-full"
        />
        <div>
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ connection.displayName }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-100">{{ connection.email }}</p>
        </div>
      </div>
      <p v-if="connections.length === 0" class="text-center text-gray-500">No hay conexiones aún.</p>
    </div>
  </div>
</template>

<script setup>
import avatarDefault from '../../assets/avatar1.jpg';
// Props
const props = defineProps({
    connections: { type: Array, required: true },
});


</script>