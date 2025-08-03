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
                    @click="handleDelete(group)"
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
    
    <!-- Modal de confirmación de eliminación -->
    <GenericConfirmModal
      :visible="showDeleteModal"
      title="¿Eliminar grupo?"
      message="Esta acción no se puede deshacer. ¿Querés continuar?"
      confirmButtonText="Eliminar"
      cancelButtonText="Cancelar"
      @cancel="closeDeleteModal"
      @confirmed="confirmDelete"
    />

    <!-- Modal de edición de grupo -->
    <EditGroupModal
      v-if="selectedGroup && showEditModal"
      :visible="showEditModal"
      :group="selectedGroup"
      @close="closeEditModal"
      @groupUpdated="submitEdit"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useGroups } from '../../composable/useGroups';
import { useGroupsStore } from '../../stores/groups';
import { useSnackbarStore } from '../../stores/snackbar';
import GenericConfirmModal from '../../components/molecules/GenericConfirmModal.vue';
import EditGroupModal from '../../components/organisms/EditGroupModal.vue';

const groupsStore = useGroupsStore();
const { updateGroup } = useGroups();
const snackbarStore = useSnackbarStore();

const searchQuery = ref('');
const filterMembers = ref('');

const showDeleteModal = ref(false);
const showEditModal = ref(false);
const selectedGroup = ref(null);

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

//Edit functions
function openEditModal(group) {
  selectedGroup.value = { ...group };
  showEditModal.value = true;
  document.body.style.overflow = 'hidden';
}

function closeEditModal() {
  showEditModal.value = false;
  document.body.style.overflow = '';
  selectedGroup.value = null;
}

function submitEdit(updatedGroup) {
  closeEditModal();
}

// Delete functions
function handleDelete(group) {
  showDeleteModal.value = true;
  selectedGroup.value = group;
  document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
  showDeleteModal.value = false;
  document.body.style.overflow = '';
  selectedGroup.value = null;
}

async function confirmDelete() {
  try {
    await groupsStore.deleteGroup(selectedGroup.value.idDoc);
    snackbarStore.show(`Grupo ${selectedGroup.value.title} eliminado exitosamente`, 'success');
  } catch (error) {
    console.error('Error al eliminar grupo:', error);
    snackbarStore.show(`Error al eliminar grupo. IdDoc:${selectedGroup.value.idDoc}, Title: ${selectedGroup.value.title}.`, 'error');
  }
  closeDeleteModal();
}

// Manage subscription lifecycle
onMounted(() => {
  groupsStore.subscribeAllGroups();
});

onUnmounted(() => {
  groupsStore.unsubscribeAllGroups();
});
</script>

<style scoped>
</style>