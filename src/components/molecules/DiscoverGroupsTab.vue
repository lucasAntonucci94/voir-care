<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Encabezado -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white sr-only">Tus Grupos</h2>
    </div>
    <!-- Filtros -->
    <GroupFilters
      v-if="groupsStore.allGroups?.value?.length > 0"
      v-model="searchQuery"
      v-model:selectedCategory="selectedCategory"
      :categories="categories"
      :showSearch="true"
      :showSelect="true"
    />
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGroupsStore } from '../../stores/groups'
import { useAuth } from '../../api/auth/useAuth'
import GroupCard from '../organisms/GroupCard.vue'
import GroupFilters from '../molecules/GroupFilters.vue' 

const groupsStore = useGroupsStore()
const { user } = useAuth()

const searchQuery = ref('')
const selectedCategory = ref('')
const categories = [
  { id: 'educacion', name: 'Educación' },
  { id: 'ayuda', name: 'Ayuda y Asistencia' },
  { id: 'interes', name: 'Intereses' },
  { id: 'cuidado', name: 'Cuidado Animal' },
  { id: 'voluntariado', name: 'Voluntariado' },
  { id: 'otros', name: 'Otros' },
]

// Computado reactivo y seguro
const discoveredGroups = computed(() => {
  const userId = user.value?.uid
  return (groupsStore.allGroups?.value || [])
    .filter(group => !group.members?.includes(userId)) // no está en el grupo
    .filter(group => group.title?.toLowerCase().includes(searchQuery.value.toLowerCase())) // por nombre
    .filter(group => !selectedCategory.value || group.categories?.some(c => c.id === selectedCategory.value)) // por categoría
})

// Navegación
const navigateToCreateGroup = () => {
  console.log("Crear grupo")
}

  // Suscripción a eventos del usuario
  onMounted(() => {
    if (user.value) {
      groupsStore.subscribeAllGroups()
    }
  })

  // Desuscripción al desmontar el componente
  onUnmounted(() => {
    groupsStore.unsubscribeAllGroups()
  })
</script>