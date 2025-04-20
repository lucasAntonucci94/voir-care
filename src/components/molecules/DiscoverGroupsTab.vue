<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Encabezado -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white sr-only">Tus Grupos</h2>
    </div>

    <!-- Lista de grupos -->
    <div v-if="discoveredGroups.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <GroupCard
        v-for="group in discoveredGroups"
        :key="group.idDoc"
        :group="group"
      />
    </div>

    <!-- Sin grupos -->
    <div v-else class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <p class="text-gray-500 dark:text-gray-400">Ya formas parte de todos los grupos disponibles.</p>
      <button
        class="mt-4 px-4 py-2 bg-primary hover:bg-primary-md dark:bg-secondary dark:hover:bg-secondary-md text-white rounded-lg text-sm transition-colors"
        @click="navigateToCreateGroup"
      >
        Crea tu propio grupo
      </button>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useGroupsStore } from '../../stores/groups'
import { useAuth } from '../../api/auth/useAuth'
import GroupCard from '../organisms/GroupCard.vue'

const groupsStore = useGroupsStore()
const { user } = useAuth()

// Computado reactivo y seguro
const discoveredGroups = computed(() => {
  const allGroups = groupsStore.allGroups?.value || []
  const userId = user.value?.uid
  if (!userId) return []
  return allGroups.filter(group => !group.members?.includes(userId))
})

// Navegación
const navigateToCreateGroup = () => {
  console.log("Crear grupo")
}
</script>