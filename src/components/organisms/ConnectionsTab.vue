<template>
 <!-- Conexiones -->
 <div class="block">
    <h2 class="text-lg font-semibold text-[#2c3e50] mb-4">Conexiones</h2>
    <div class="space-y-4">
      <div
        v-for="connection in connections"
        :key="connection.idDoc"
        class="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition"
      >
        <img
          :src="connection.avatar || avatarDefault"
          alt="Avatar"
          class="w-10 h-10 rounded-full"
        />
        <div>
          <p class="text-sm font-medium text-gray-700">{{ connection.displayName }}</p>
          <p class="text-xs text-gray-500">{{ connection.email }}</p>
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