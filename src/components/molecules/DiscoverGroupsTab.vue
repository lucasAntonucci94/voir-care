<template>
    <div class="container mx-auto px-4 py-6">
      <!-- Encabezado -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white sr-only">Tus Grupos</h2>
      </div>
  
      <!-- Lista de grupos -->
      <div v-if="groupsStore.allGroups?.value?.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="group in groupsStore.allGroups?.value"
          :key="group.idDoc"
          class="group-card bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
        >
          <!-- Imagen -->
          <div class="relative h-40">
            <img
              v-if="group.media?.url"
              :src="group.media.url"
              :alt="group.title"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <div
              v-else
              class="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400"
            >
              Sin imagen
            </div>
            <!-- Indicador de privacidad -->
            <span
              class="absolute top-2 right-2 px-2 py-1 text-xs font-semibold text-white rounded-full"
              :class="group.privacy === 'public' ? 'bg-green-500' : 'bg-red-500'"
            >
              {{ group.privacy === 'public' ? 'Público' : 'Privado' }}
            </span>
          </div>
  
          <!-- Contenido -->
          <div class="p-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white truncate">{{ group.title }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{{ group.description || 'Sin descripción' }}</p>
            <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{{ group.members.length }} miembro{{ group.members.length !== 1 ? 's' : '' }}</span>
              <span class="mx-2">•</span>
              <span>{{ roleLabel(group) }}</span>
            </div>
          </div>
  
          <!-- Acciones -->
          <div class="p-4 pt-0 flex justify-between items-center">
            <button
              class="text-primary dark:text-secondary hover:underline text-sm"
              @click="viewGroup(group.idDoc)"
            >
              Ver grupo
            </button>
            <button
              v-if="isAdmin(group)"
              class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white text-sm"
              @click="editGroup(group.idDoc)"
            >
              Editar
            </button>
          </div>
        </div>
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
      </div>
    </div>
  </template>
  
  <script setup>
  import { useGroupsStore } from '../../stores/groups';
  import { useRouter } from 'vue-router';
  import { useAuth } from '../../api/auth/useAuth';

  const groupsStore = useGroupsStore();
  const { user } = useAuth();

  // Determinar el rol del usuario en el grupo
  const roleLabel = (group) => {
    const userId = user.value.uid; // Obtener el ID del usuario
    if (group.ownerId === userId) return 'Propietario';
    if (group.admins.includes(userId)) return 'Administrador';
    return 'Miembro';
  };
  
  // Verificar si el usuario es admin o propietario
  const isAdmin = (group) => {
    debugger
    return group.ownerId === user.value.uid || group.admins.includes(user.value.uid);
  };
  
  // Navegación
  const viewGroup = (groupId) => {
    // router.push(`/groups/${groupId}`);
    console.log("Ver grupo")
  };
  
  const editGroup = (groupId) => {
    // router.push(`/groups/${groupId}/edit`);
    console.log("Editar grupo")
  };
  
  const navigateToCreateGroup = () => {
    console.log("Crear grupo")
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