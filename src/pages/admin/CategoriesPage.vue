<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
    <!-- Header with Back Button and Create Button -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Administración de Categorías</h1>
      <button
        @click="openCreateModal"
        class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center gap-2"
        aria-label="Crear nueva categoría"
      >
        <i class="fas fa-plus"></i> Nueva Categoría
      </button>
    </div>

    <!-- Loading and Error States -->
    <div v-if="isLoading" class="text-center text-gray-600 dark:text-gray-300">
      <i class="fas fa-spinner fa-spin mr-2"></i> Cargando categorías...
    </div>
    <div v-else-if="error" class="text-center text-red-500 dark:text-red-400">
      Error: {{ error }}
    </div>
    <div v-else>
      <!-- Search -->
      <div class="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por nombre de categoría..."
          class="w-full sm:w-1/3 p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Buscar categorías"
        />
      </div>

      <!-- Categories Table -->
      <div v-if="filteredCategories.length" class="overflow-x-auto rounded-lg">
        <table class="min-w-lg bg-white dark:bg-gray-800 rounded-lg shadow">
          <thead>
            <tr class="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-sm leading-normal dosis-font">
              <th class="py-3 px-6 text-left">Nombre</th>
              <th class="py-3 px-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 dark:text-gray-300 text-sm font-light josefin-font">
            <tr
              v-for="category in filteredCategories"
              :key="category.id"
              class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <td class="py-3 px-6 text-left whitespace-nowrap">
                <span>{{ category.name || 'Sin nombre' }}</span>
              </td>
              <td class="py-3 px-6">
                <div class="flex items-center justify-center gap-2">
                  <div class="relative group">
                    <button
                      @click="openEditModal(category)"
                      class="p-2 rounded-full text-blue-500 dark:text-blue-200 bg-blue-100 dark:bg-blue-700/50 hover:bg-blue-200 dark:hover:bg-blue-600 transition-colors duration-200"
                      aria-label="Ver detalles y acciones del reporte"
                      title="Ver detalles del reporte"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <!-- Tooltip -->
                    <span class="tooltip-text">Ver detalles</span>
                  </div>
                  <div class="relative group">
                    <button
                      @click="setGenericModalConfig('delete', category)"
                      class="p-2 rounded-full text-red-500 dark:text-red-200 bg-red-100 dark:bg-red-700/50 hover:bg-red-200 dark:hover:bg-red-600 transition-colors duration-200"
                      aria-label="Eliminar evento"
                      title="Eliminar evento"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                    <!-- Tooltip -->
                    <span class="tooltip-text">Eliminar evento</span>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center text-gray-600 dark:text-gray-300">
        No se encontraron categorías con los filtros aplicados.
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal"
      class="fixed inset-0 z-101 flex items-center justify-center bg-black/60"
      @click.self="showModal = false"
    >
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-4">
          {{ isEditing ? 'Editar Categoría' : 'Nueva Categoría' }}
        </h2>
        <form @submit.prevent="saveCategory">
          <div class="mb-4">
            <label class="block text-gray-700 dark:text-gray-300 mb-1" for="name">Nombre</label>
            <input
              id="name"
              v-model="editCategory.name"
              type="text"
              class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              aria-required="true"
              required
            />
          </div>
          <div class="flex justify-end gap-2">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
              aria-label="Cancelar"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-md"
              aria-label="Guardar categoría"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Modal de confirmación genérico -->
    <GenericConfirmModal
      v-if="showConfirmModal"
      :visible="showConfirmModal"
      :title="genericModalConfig.title"
      :message="genericModalConfig.message"
      :confirmButtonText="genericModalConfig.confirmButtonText"
      :cancelButtonText="genericModalConfig.cancelButtonText"
      @cancel="genericModalConfig.cancelMethod"
      @confirmed="genericModalConfig.confirmMethod"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useCategories } from '../../composable/useCategories';
import { useSnackbarStore } from '../../stores/snackbar';
import GenericConfirmModal from "../../components/molecules/GenericConfirmModal.vue";

const { categories, loadCategories, saveCategorie, updateCategorie, deleteCategorie } = useCategories();
const snackbarStore = useSnackbarStore();

const searchQuery = ref('');
const isLoading = ref(false);
const error = ref(null);
const showModal = ref(false);
const isEditing = ref(false);
const editCategory = ref({ name: '', id: null, idDoc: null });
const showConfirmModal = ref(false);

const genericModalConfig = ref({
  title: "",
  message: "",
  confirmButtonText: "Confirmar",
  cancelButtonText: "Cancelar",
  cancelMethod: () => {
    showConfirmModal.value = false;
    document.body.style.overflow = "";
  },
  confirmMethod: () => {
    showConfirmModal.value = false;
    document.body.style.overflow = "";
  },
});


// Load categories on mount
onMounted(async () => {
  isLoading.value = true;
  try {
    await loadCategories();
  } catch (err) {
    error.value = 'Error al cargar categorías. Intenta de nuevo.';
  } finally {
    isLoading.value = false;
  }
});

// Computed property for filtered categories
const filteredCategories = computed(() => {
  let filtered = categories.value;
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((category) =>
      category.name?.toLowerCase().includes(query)
    );
  }
  return filtered;
});

// Open create modal
const openCreateModal = () => {
  isEditing.value = false;
  editCategory.value = { name: '', id: null, idDoc: null };
  showModal.value = true;
};

// Open edit modal
const openEditModal = (category) => {
  isEditing.value = true;
  editCategory.value = { ...category };
  showModal.value = true;
};

// Save category (create or update)
const saveCategory = async () => {
  try {
    if (isEditing.value) {
      await updateCategorie(editCategory.value.idDoc, editCategory.value.name);
      snackbarStore.show('Categoría actualizada exitosamente', 'success');
    } else {
      await saveCategorie(editCategory.value.name);
      snackbarStore.show('Categoría creada exitosamente', 'success');
    }
    await loadCategories();
    showModal.value = false;
  } catch (err) {
    snackbarStore.show('Error al guardar la categoría', 'error');
  }
};

// Delete category
const deleteCategory = async (docId) => {
  try {
    await deleteCategorie(docId);
    snackbarStore.show('Categoría eliminada exitosamente', 'success');
  } catch (err) {
    snackbarStore.show('Error al eliminar la categoría', 'error');
  }
  await loadCategories();
};


// Configurar modal genérico
const setGenericModalConfig = (action, category) => {
  switch (action) {
    case "delete":
      genericModalConfig.value = {
        title: "Eliminar Categoría Permanentemente",
        message: `¿Estás seguro de que deseas eliminar la categoría: ${category.name}?`,
        confirmButtonText: "Eliminar",
        cancelButtonText: "Cancelar",
        confirmMethod: () => {
          deleteCategory(category.idDoc);
          showConfirmModal.value = false;
          document.body.style.overflow = "";
        },
        cancelMethod: () => {
          showConfirmModal.value = false;
          document.body.style.overflow = "";
        },
      };
      break;
    default:
      // Fallback
      genericModalConfig.value = {
        title: "Acción no definida",
        message: "No se ha definido una acción para esta operación.",
        confirmButtonText: "Aceptar",
        cancelButtonText: "Cancelar",
        confirmMethod: () => {},
        cancelMethod: () => {
          showConfirmModal.value = false;
          document.body.style.overflow = "";
        },
      };
  }
  showConfirmModal.value = true;
};

</script>

<style scoped>
</style>