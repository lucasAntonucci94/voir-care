<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-white">
        Administración de Ubicaciones (marcadores del mapa).
      </h1>
    </div>

    <div
      v-if="locationsStore.isLoading"
      class="text-center text-gray-600 dark:text-gray-300"
    >
      <i class="fas fa-spinner fa-spin mr-2"></i> Cargando ubicaciones...
    </div>
    <!-- <div
      v-else-if="locationsStore.error"
      class="text-center text-red-500 dark:text-red-400"
    >
      Error: {{ locationsStore.error }}
    </div> -->
    <div v-else>
      <!-- Search and Filters -->
      <div class="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por nombre o descripción..."
          class="w-full sm:w-1/3 p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary transition-all duration-200"
          aria-label="Buscar ubicaciones"
        />
        <select
          v-model="filterStatus"
          class="p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary dark:focus:ring-secondary"
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="confirmed">Confirmado</option>
        </select>
      </div>

      <!-- Locations Table -->
      <div v-if="filteredLocations.length" class=" rounded-lg">
        <table class="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow">
          <thead>
            <tr
              class="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-sm leading-normal dosis-font"
            >
              <th class="py-3 px-6 text-left">Título</th>
              <th class="py-3 px-6 text-left">Descripción</th>
              <th class="py-3 px-6 text-left">Creador</th>
              <th class="py-3 px-6 text-left">Coordenadas</th>
              <th class="py-3 px-6 text-left">Dirección</th>
              <th class="py-3 px-6 text-center">Estado</th>
              <th class="py-3 px-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 dark:text-gray-300 text-sm font-light josefin-font">
            <tr
              v-for="location in filteredLocations"
              :key="location.id"
              class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100/80 dark:hover:bg-gray-600/80"
            >
              <td class="py-3 px-6 text-left whitespace-nowrap">
                {{ location.title }}
              </td>
              <td class="py-3 px-6 text-left">
                {{ location.description }}
              </td>
              <td class="py-3 px-6 text-left">
                {{ location.user?.displayName || 'Anónimo' }}
              </td>
              <td class="py-3 px-6 text-left">
                ({{ location.address?.coordinates.lat?.toFixed(4) }}, {{ location.address?.coordinates.lng?.toFixed(4) }})
              </td>
              <td class="py-3 px-6 text-left">
                {{ location.address?.street }}
              </td>
              <td class="py-3 px-6 text-center">
                <span
                  :class="{
                    'text-yellow-500': location.pending,
                    'text-green-500': !location.pending,
                  }"
                  class="uppercase text-xs font-bold"
                >
                  {{
                    location.pending
                      ? 'Pendiente'
                      : 'Confirmado'
                  }}
                </span>
              </td>
              <td class="flex items-center justify-between gap-2 py-3 px-6 text-center">
                <button
                  @click="openLocationDetailModal(location)"
                  class="w-full text-left px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 hover:text-primary dark:bg-gray-700 dark:hover:bg-gray-800 dark:hover:text-secondary transition-all duration-200"
                >
                  <i class="fas fa-eye mr-2 text-primary dark:text-secondary"></i> Ver
                </button>
                <div class="relative" :ref="el => { actionsDropdownRefs[location.id] = el }">
                  <button
                    @click="toggleActionsMenu(location.id)"
                    class="text-gray-600 hover:text-primary dark:text-white dark:hover:text-secondary focus:outline-none transition-colors duration-200 bg-gray-100/10 hover:bg-gray-100/40 dark:bg-gray-700 hover:dark:bg-gray-800 rounded-full p-1 w-8 h-8 shadow-sm hover:shadow-md"
                    :disabled="isActionLoading[location.id]"
                    :class="(isActionLoading[location.id]) ? 'opacity-50 cursor-not-allowed' : ''"
                    aria-label="Más acciones"
                    :aria-disabled="location.pending === false"
                  >
                    <i v-if="!isActionLoading[location.id]" class="fas fa-ellipsis-h"></i>
                    <i v-else class="fas fa-spinner fa-spin"></i>
                  </button>
                  <div
                    v-if="activeDropdown === location.id"
                    class="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 dark:border-gray-800 border border-gray-200 rounded-lg shadow-lg z-10"
                  >
                    <ul class="py-1 text-sm text-gray-700 dark:text-gray-200">
                      <li>
                        <button
                          @click="setGenericModalConfig('confirm', location)"
                          class="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-primary dark:bg-gray-700 dark:hover:bg-gray-800 dark:hover:text-secondary transition-all duration-200"
                          :disabled="!location.pending || isActionLoading[location.id]"
                          :class="(!location.pending || isActionLoading[location.id]) ? 'opacity-50 cursor-not-allowed' : ''"
                        >
                          <i
                            class="fas fa-check-circle mr-2"
                            :class="{
                              'text-green-500': location.pending
                            }"
                          ></i>
                          Confirmar
                        </button>
                      </li>
                      <li>
                        <button
                          @click="setGenericModalConfig('delete', location)"
                          class="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-primary dark:bg-gray-700 dark:hover:bg-gray-800 dark:hover:text-secondary transition-all duration-200"
                          :disabled="isActionLoading[location.id]"
                          :class="isActionLoading[location.id] ? 'opacity-50 cursor-not-allowed' : ''"
                        >
                          <i class="fas fa-trash-can mr-2 text-red-500"></i>
                          Eliminar
                        </button>
                      </li>
                      <!-- TODO: Se podría agregar un botón para editar-->
                    </ul>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center text-gray-600 dark:text-gray-300">
        No se encontraron ubicaciones con los filtros aplicados.
      </div>
    </div>

    <!-- Modal detalle de ubicación -->
    <LocationDetailModal
      v-if="showLocationDetailModal"
      :visible="showLocationDetailModal"
      :location="selectedLocation"
      @close="closeLocationDetailModal"
      @delete="deleteLocation"
      @confirm="confirmLocation"
    />

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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useSnackbarStore } from '../../stores/snackbar';
import LocationDetailModal from '../../components/organisms/LocationDetailAdminModal.vue';
import GenericConfirmModal from '../../components/molecules/GenericConfirmModal.vue';
import { useLocationsStore } from '../../stores/locations';

const locationsStore = useLocationsStore();
const snackbarStore = useSnackbarStore();

const searchQuery = ref('');
const filterStatus = ref('');
const showLocationDetailModal = ref(false);
const showConfirmModal = ref(false);
const selectedLocation = ref(null);
const activeDropdown = ref(null);
const isActionLoading = ref({});
const actionsDropdownRefs = ref({}); // Referencia a todos los menús desplegables

const genericModalConfig = ref({
  title: '',
  message: '',
  confirmButtonText: 'Confirmar',
  cancelButtonText: 'Cancelar',
  cancelMethod: () => {
    showConfirmModal.value = false;
    document.body.style.overflow = '';
  },
  confirmMethod: () => {
    showConfirmModal.value = false;
    document.body.style.overflow = '';
  }
});

// Propiedad computada para ubicaciones filtradas
const filteredLocations = computed(() => {
  let filtered = locationsStore.locations?.value ?? [];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (location) =>
        location.title?.toLowerCase().includes(query) ||
        location.description?.toLowerCase().includes(query)
    );
  }

  if (filterStatus.value) {
    const isPending = filterStatus.value === 'pending';
    filtered = filtered.filter((location) => (location.pending === isPending));
  }

  return filtered;
});

// Abrir modal de detalle
const openLocationDetailModal = (location) => {
  selectedLocation.value = { ...location };
  showLocationDetailModal.value = true;
  activeDropdown.value = null;
  document.body.style.overflow = 'hidden';
};

// Cerrar modal de detalle
const closeLocationDetailModal = () => {
  selectedLocation.value = null;
  showLocationDetailModal.value = false;
  document.body.style.overflow = '';
};

// Eliminar ubicación (eliminación suave)
const softDeleteLocation = async (id) => {
  //TODO: Implementar lógica de eliminación suave
  // isActionLoading.value[id] = true;
  // try {
  //   await locationsStore.softDelete(id);
  //   snackbarStore.show(`Ubicación eliminada exitosamente`, 'success');
  //   activeDropdown.value = null;
  // } catch (error) {
  //   snackbarStore.show(`Error al eliminar la ubicación: ${error.message}`, 'error');
  // } finally {
  //   isActionLoading.value[id] = false;
  // }
};
// Eliminar ubicación (eliminación suave)
const deleteLocation = async (id) => {
  isActionLoading.value[id] = true;
  try {
    await locationsStore.deleteLocation(id);
    snackbarStore.show(`Ubicación eliminada exitosamente`, 'success');
    activeDropdown.value = null;
  } catch (error) {
    snackbarStore.show(`Error al eliminar la ubicación: ${error.message}`, 'error');
  } finally {
    isActionLoading.value[id] = false;
    showLocationDetailModal.value = false;
    document.body.style.overflow = '';
  }
};

// Confirmar ubicación
const confirmLocation = async (location) => {
  isActionLoading.value[location.id] = true;
  try {
    await locationsStore.togglePending(location);
    snackbarStore.show(`Ubicación confirmada exitosamente`, 'success');
    activeDropdown.value = null;
  } catch (error) {
    snackbarStore.show(`Error al confirmar la ubicación: ${error.message}`, 'error');
  } finally {
    isActionLoading.value[location.id] = false;
    showLocationDetailModal.value = false;
    document.body.style.overflow = '';
  }
};

// Alternar menú desplegable
const toggleActionsMenu = (id) => {
  activeDropdown.value = activeDropdown.value === id ? null : id;
};

// Manejar clic fuera para cerrar el menú desplegable
const handleClickOutside = (event) => {
  if (activeDropdown.value !== null) {
    const dropdown = actionsDropdownRefs.value[activeDropdown.value];
    if (dropdown && !dropdown.contains(event.target)) {
      activeDropdown.value = null;
    }
  }
};

// Configurar modal genérico
const setGenericModalConfig = (action, location) => {
  switch (action) {
    case 'confirm':
      genericModalConfig.value = {
        title: 'Confirmar Ubicación',
        message: `¿Estás seguro de que deseas confirmar la ubicación: ${location.title}? Esto la hará visible.`,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        confirmMethod: () => {
          confirmLocation(location);
          showConfirmModal.value = false;
          document.body.style.overflow = '';
        },
        cancelMethod: () => {
          showConfirmModal.value = false;
          document.body.style.overflow = '';
        }
      };
      break;
    case 'softDelete':
      genericModalConfig.value = {
        title: 'Eliminar Ubicación',
        message: `¿Estás seguro de que deseas eliminar la ubicación: ${location.title}?`,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
        confirmMethod: () => {
          softDeleteLocation(location.id);
          showConfirmModal.value = false;
          document.body.style.overflow = '';
        },
        cancelMethod: () => {
          showConfirmModal.value = false;
          document.body.style.overflow = '';
        }
      };
      break;
    case 'delete':
      genericModalConfig.value = {
        title: 'Eliminar Ubicación Permanentemente',
        message: `¿Estás seguro de que deseas eliminar la ubicación: ${location.title}?`,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
        confirmMethod: () => {
          deleteLocation(location.id);
          showConfirmModal.value = false;
          document.body.style.overflow = '';
        },
        cancelMethod: () => {
          showConfirmModal.value = false;
          document.body.style.overflow = '';
        }
      };
      break;
    default:
      // Fallback
      genericModalConfig.value = {
        title: 'Acción no definida',
        message: 'No se ha definido una acción para esta operación.',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        confirmMethod: () => {},
        cancelMethod: () => {
          showConfirmModal.value = false;
          document.body.style.overflow = '';
        }
      };
  }
  showConfirmModal.value = true;
  showLocationDetailModal.value = false;
};

// Gestionar el ciclo de vida
onMounted(() => {
  locationsStore.subscribeTolocations();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  locationsStore.unsubscribeAll();
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>

</style>
