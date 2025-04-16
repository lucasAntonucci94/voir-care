<template>
    <div class="container mx-auto px-4 py-6">
      <!-- Encabezado -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white sr-only">Tus Grupos</h2>
      </div>
  
      <!-- Lista de grupos -->
      <div v-if="groupsStore.userGroups?.value?.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <GroupCard
          v-for="group in groupsStore.userGroups?.value"
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
  import { useGroupsStore } from '../../stores/groups';
  import { useRouter } from 'vue-router';
  import { computed } from 'vue';
  import { useAuth } from '../../api/auth/useAuth';
  import GroupCard from '../organisms/GroupCard.vue';

  const groupsStore = useGroupsStore();
  const router = useRouter();
  const { user } = useAuth();

  const emit = defineEmits(['open-create-modal','open-discover-tab']);

  // Determinar el rol del usuario en el grupo
  const roleLabel = (group) => {
    const userId = user.value.uid;
    if (group.ownerId === userId) return 'Propietario';
    if (group.admins.includes(userId)) return 'Administrador';
    return 'Miembro';
  };
  
  // Verificar si el usuario es admin o propietario
  const isAdmin = (group) => {
    return group.ownerId === user.value.uid || group.admins.includes(user.value.uid);
  };
  
  const navigateToCreateGroup = () => {
    emit('open-create-modal')
  };
  
  const navigateToDiscoverGroup = () => {
    emit('open-discover-tab')
  };
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