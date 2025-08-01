<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
    <!-- Header with Back Button -->
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Administración de Grupos</h1>
    </div>

    <!-- Loading and Error States -->
    <div v-if="groupsStore.isLoading" class="text-center text-gray-600 dark:text-gray-300">
      <i class="fas fa-spinner fa-spin mr-2"></i> Cargando grupos...
    </div>
    <div v-else-if="groupsStore.error" class="text-center text-red-500 dark:text-red-400">
      Error: {{ groupsStore.error }}
    </div>
    <div v-else>
      <!-- Search and Filters -->
      <div class="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por título o descripción..."
          class="w-full sm:w-1/3 p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Buscar grupos"
        />
        <select
          v-model="filterMembers"
          class="p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          aria-label="Filtrar por cantidad de miembros"
        >
          <option value="">Filtrar por miembros</option>
          <option value="0-10">0-10 miembros</option>
          <option value="11-50">11-50 miembros</option>
          <option value="51+">51+ miembros</option>
        </select>
      </div>

      <!-- Groups Table -->
      <div v-if="filteredGroups.length" class="overflow-x-auto rounded-lg">
        <table class="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow">
          <thead>
            <tr class="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-sm leading-normal dosis-font">
              <th class="py-3 px-6 text-left">Id</th>
              <th class="py-3 px-6 text-left">Título</th>
              <th class="py-3 px-6 text-left">Descripción</th>
              <th class="py-3 px-6 text-center">Miembros</th>
              <th class="py-3 px-6 text-left">Creado</th>
              <th class="py-3 px-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 dark:text-gray-300 text-sm font-light josefin-font">
            <tr
              v-for="group in filteredGroups"
              :key="group.idDoc"
              class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <td class="py-3 px-6 text-left">{{ group.idDoc || 'N/A' }}</td>
              
              <td class="py-3 px-6 text-left whitespace-nowrap">
                <div class="flex items-center">
                  <img
                    v-if="group.media?.url"
                    :src="group.media.url"
                    alt="Group Media"
                    class="w-8 h-8 rounded-full mr-2"
                  />
                  <span>{{ group.title || 'Sin título' }}</span>
                </div>
              </td>
              <td class="py-3 px-6 text-left">{{ group.description || 'N/A' }}</td>
              <td class="py-3 px-6 text-center">{{ group.members?.length || 0 }}</td>
              <td class="py-3 px-6 text-left">
                {{ formatDate(group.createdAt) }}
              </td>
              <td class="py-3 px-6 text-center">
                <div class="flex item-center justify-center gap-2">
                  <button
                    @click="openEditModal(group)"
                    class="text-blue-500 hover:text-blue-700"
                    title="Editar"
                    aria-label="Editar grupo"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    @click="deleteGroup(group.idDoc)"
                    class="text-red-500 hover:text-red-700"
                    title="Eliminar"
                    aria-label="Eliminar grupo"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center text-gray-600 dark:text-gray-300">
        No se encontraron grupos con los filtros aplicados.
      </div>
    </div>

    <!-- Edit Modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-4">Editar Grupo</h2>
        <form @submit.prevent="saveGroup">
          <div class="mb-4">
            <label class="block text-gray-700 dark:text-gray-300 mb-1" for="title">Título</label>
            <input
              id="title"
              v-model="editGroup.title"
              type="text"
              class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              aria-required="true"
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 dark:text-gray-300 mb-1" for="description">Descripción</label>
            <textarea
              id="description"
              v-model="editGroup.description"
              class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            ></textarea>
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 dark:text-gray-300 mb-1">Miembros</label>
            <input
              :value="editGroup.members?.length || 0"
              type="text"
              class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              disabled
            />
          </div>
          <div class="flex justify-end gap-2">
            <button
              type="button"
              @click="showEditModal = false"
              class="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
              aria-label="Cancelar"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-primary text-white rounded-md"
              aria-label="Guardar cambios"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useGroups } from '../../composable/useGroups';
import { useGroupsStore } from '../../stores/groups';
import { useSnackbarStore } from '../../stores/snackbar';

const groupsStore = useGroupsStore();
const { updateGroup } = useGroups();
const snackbarStore = useSnackbarStore();

const searchQuery = ref('');
const filterMembers = ref('');
const showEditModal = ref(false);
const editGroup = ref(null);

// Computed property for filtered groups
const filteredGroups = computed(() => {
  let filtered = groupsStore.allGroups.value || [];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (group) =>
        group.title?.toLowerCase().includes(query) ||
        group.description?.toLowerCase().includes(query)
    );
  }

  if (filterMembers.value) {
    filtered = filtered.filter((group) => {
      const memberCount = group.members?.length || 0;
      if (filterMembers.value === '0-10') return memberCount <= 10;
      if (filterMembers.value === '11-50') return memberCount > 10 && memberCount <= 50;
      if (filterMembers.value === '51+') return memberCount > 50;
      return true;
    });
  }

  return filtered;
});

// Format date for display
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Open edit modal
const openEditModal = (group) => {
  editGroup.value = { ...group };
  showEditModal.value = true;
};

// Save group changes
const saveGroup = async () => {
  try {
    await updateGroup(editGroup.value.idDoc, {
      title: editGroup.value.title,
      description: editGroup.value.description,
    });
    snackbarStore.show('Grupo actualizado exitosamente', 'success');
    showEditModal.value = false;
  } catch (error) {
    console.error('Error updating group:', error);
    snackbarStore.show('Error al guardar los cambios', 'error');
  }
};

// Delete group
const deleteGroup = async (idDoc) => {
  if (!confirm('¿Estás seguro de que deseas eliminar este grupo?')) return;
  try {
    await groupsStore.deleteGroup(idDoc);
    snackbarStore.show('Grupo eliminado exitosamente', 'success');
  } catch (error) {
    snackbarStore.show(`Error al eliminar el grupo: ${groupsStore.error || 'Intenta de nuevo.'}`, 'error');
  }
};

// Manage subscription lifecycle
onMounted(() => {
  groupsStore.subscribeAllGroups();
});

onUnmounted(() => {
  groupsStore.unsubscribeAllGroups();
});
</script>

<style scoped>
/* Custom styles for table and buttons */
table {
  border-collapse: separate;
  border-spacing: 0;
}

th,
td {
  border-right: 1px solid #e5e7eb;
}

th:last-child,
td:last-child {
  border-right: none;
}

button i {
  font-size: 1.25rem;
}

/* Primary color for buttons */
.bg-primary {
  background-color: #3b82f6;
}

.bg-primary:hover {
  background-color: #2563eb;
}

.bg-primary-dark {
  background-color: #2563eb;
}

/* Dark mode adjustments */
.dark .bg-primary {
  background-color: #60a5fa;
}

.dark .bg-primary:hover {
  background-color: #3b82f6;
}

.dark .bg-primary-dark {
  background-color: #3b82f6;
}
</style>