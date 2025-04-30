<template>
    <div class="container mx-auto px-4 py-6">
      <!-- Encabezado -->
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white sr-only">Tus Grupos</h2>
      </div>
      <!-- Filtro -->
      <GroupFilters
        v-if="groupsStore.userGroups?.value.length > 0"
        v-model="searchQuery"
        v-model:selectedCategory="selectedCategory"
        :categories="categories"
        :showSearch="true"
        :showSelect="true"
      />
      <!-- Lista de grupos -->
      <div v-if="filteredGroups.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <GroupCard
          v-for="group in filteredGroups"
          :key="group.idDoc"
          :group="group"
        />
      </div>

      <!-- Sin grupos -->
      <div
        v-else
        class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md"
      >
        <p class="text-gray-500 dark:text-gray-400">No perteneces a ningún grupo aún.</p>
        <button
          class="mt-4 px-4 py-2 bg-primary hover:bg-primary-md dark:bg-secondary dark:hover:bg-secondary-md text-white rounded-lg text-sm transition-colors"
          @click="navigateToCreateGroup"
        >
          Crea tu primer grupo
        </button>
        <button
          class="mt-4 px-4 py-2 ml-3 bg-primary hover:bg-primary-md dark:bg-secondary dark:hover:bg-secondary-md text-white rounded-lg text-sm transition-colors"
          @click="navigateToDiscoverGroup"
          >
          Descubre un grupo
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { useGroupsStore } from '../../stores/groups';
  import GroupCard from '../organisms/GroupCard.vue';
  import GroupFilters from '../molecules/GroupFilters.vue';
  
  const groupsStore = useGroupsStore();
  
  const searchQuery = ref('');
  const selectedCategory = ref('');
  const categories = [
    { id: 'educacion', name: 'Educación' },
    { id: 'ayuda', name: 'Ayuda y Asistencia' },
    { id: 'interes', name: 'Intereses' },
    { id: 'cuidado', name: 'Cuidado Animal' },
    { id: 'voluntariado', name: 'Voluntariado' },
    { id: 'otros', name: 'Otros' },
  ];
  
  const filteredGroups = computed(() => {
    return groupsStore.userGroups?.value
      ?.filter(group =>
        group.title?.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
      ?.filter(group =>
        !selectedCategory.value ||
        group.categories?.some(c => c.id === selectedCategory.value)
      ) ?? [];
  });
  
  const emit = defineEmits(['open-create-modal','open-discover-tab']);
  
  const navigateToCreateGroup = () => emit('open-create-modal');
  const navigateToDiscoverGroup = () => emit('open-discover-tab');
  </script>

  <style scoped>
  .group-card {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  /* Ajuste para pantallas pequeñas */
  @media (max-width: 640px) {
    .group-card img {
      height: 120px;
    }
    .group-card h3 {
      font-size: 1rem;
    }
    .group-card p {
      font-size: 0.875rem;
    }
  }
  </style>