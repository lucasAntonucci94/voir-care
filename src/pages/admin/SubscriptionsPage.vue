<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 dosis-font">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Administración de Solicitudes de Suscripción</h1>
    </div>

    <!-- Loading State -->
    <div v-if="isLoadingRequests" class="text-center text-gray-600 dark:text-gray-300">
      <i class="fas fa-spinner fa-spin mr-2"></i> Cargando solicitudes...
    </div>
    <div v-else>
      <!-- Filters -->
      <div class="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por email o ID de usuario..."
          class="w-full sm:w-1/3 p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary transition-all duration-200"
          aria-label="Buscar solicitudes"
        />
        <select
          v-model="filterStatus"
          class="w-full sm:w-1/4 p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary transition-all duration-200"
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="approved">Aprobado</option>
          <option value="declined">Rechazado</option>
        </select>
      </div>

      <!-- Requests Table -->
      <div v-if="filteredRequests.length" class="overflow-x-auto rounded-lg shadow-lg">
        <table class="min-w-full bg-white dark:bg-gray-800 rounded-lg">
          <thead>
            <tr class="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-sm leading-normal">
              <th class="py-3 px-6 text-left">ID Solicitud</th>
              <th class="py-3 px-6 text-left">Email</th>
              <th class="py-3 px-6 text-left">Usuario ID</th>
              <th class="py-3 px-6 text-center">Plan</th>
              <th class="py-3 px-6 text-center">Estado</th>
              <th class="py-3 px-6 text-center">Fecha</th>
              <th class="py-3 px-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 dark:text-gray-300 text-sm font-light">
            <tr
              v-for="request in filteredRequests"
              :key="request.id"
              class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100/80 dark:hover:bg-gray-600/80"
            >
              <td class="py-3 px-6 text-left whitespace-nowrap">
                <span class="truncate max-w-xs block">{{ request.id }}</span>
              </td>
              <td class="py-3 px-6 text-left">{{ request.email }}</td>
              <td class="py-3 px-6 text-left">
                <span class="truncate max-w-xs block">{{ request.userId }}</span>
              </td>
              <td class="py-3 px-6 text-center capitalize">{{ request.planType }}</td>
              <td class="py-3 px-6 text-center">
                <span
                  :class="{
                    'bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200': request.status === 'pending',
                    'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-200': request.status === 'approved',
                    'bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-200': request.status === 'declined',
                  }"
                  class="py-1 px-3 rounded-full text-xs font-semibold"
                >
                  {{ request.status === 'pending' ? 'Pendiente' : request.status === 'approved' ? 'Aprobado' : 'Rechazado' }}
                </span>
              </td>
              <td class="py-3 px-6 text-center">{{ formatDate(request.createdAt) }}</td>
              <td class="py-3 px-6 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button
                    v-if="request.status === 'pending'"
                    @click="setGenericModalConfig('approve', request)"
                    class="px-3 py-1 rounded-md bg-green-500 text-white hover:bg-green-600 transition-colors duration-200 text-xs"
                    aria-label="Aprobar solicitud"
                  >
                    Aprobar
                  </button>
                  <button
                    v-if="request.status === 'pending'"
                    @click="setGenericModalConfig('decline', request)"
                    class="px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors duration-200 text-xs"
                    aria-label="Rechazar solicitud"
                  >
                    Rechazar
                  </button>
                  <!-- Opcional: Botón para eliminar completamente la solicitud (solo si es necesario un hard delete) -->
                  <!-- <button
                    @click="setGenericModalConfig('delete', request)"
                    class="px-3 py-1 rounded-md bg-gray-500 text-white hover:bg-gray-600 transition-colors duration-200 text-xs"
                    aria-label="Eliminar solicitud"
                  >
                    Eliminar
                  </button> -->
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center text-gray-600 dark:text-gray-300 py-8">
        No se encontraron solicitudes con los filtros aplicados.
      </div>
    </div>

    <!-- Modal de confirmación -->
    <GenericConfirmModal
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
import { useSubscriptionRequests } from '../../composable/useSubscriptionRequest';
import { useSnackbarStore } from '../../stores/snackbar';
import GenericConfirmModal from '../../components/molecules/GenericConfirmModal.vue';

const {
  subscribeToSubscriptionRequests,
  approveSubscriptionRequest,
  declineSubscriptionRequest,
} = useSubscriptionRequests();

const snackbarStore = useSnackbarStore();

// Estados reactivos
const allRequests = ref([]);
const isLoadingRequests = ref(true);
const searchQuery = ref('');
const filterStatus = ref('');
const showConfirmModal = ref(false);
const genericModalConfig = ref({});
let unsubscribe = null;

// Computed para solicitudes filtradas
const filteredRequests = computed(() => {
  let filtered = allRequests.value;

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (request) =>
        request.email?.toLowerCase().includes(query) ||
        request.userId?.toLowerCase().includes(query) ||
        request.id?.toLowerCase().includes(query)
    );
  }

  // Filtrar por estado
  if (filterStatus.value) {
    filtered = filtered.filter((request) => request.status === filterStatus.value);
  }

  return filtered;
});

// Formatear fecha
const formatDate = (timestamp) => {
  if (!timestamp || !timestamp.toDate) return 'N/A';
  return timestamp.toDate().toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Configurar modal de confirmación
const setGenericModalConfig = (action, request) => {
  switch (action) {
    case 'approve':
      genericModalConfig.value = {
        title: 'Aprobar Solicitud',
        message: `¿Estás seguro de que deseas aprobar la solicitud de suscripción de "${request.email}"?`,
        confirmButtonText: 'Aprobar',
        cancelButtonText: 'Cancelar',
        confirmMethod: async () => {
          try {
            await approveSubscriptionRequest(request.id, request.userId);
            snackbarStore.show('Solicitud aprobada exitosamente', 'success');
          } catch (error) {
            snackbarStore.show(`Error al aprobar solicitud: ${error.message}`, 'error');
          } finally {
            showConfirmModal.value = false;
          }
        },
        cancelMethod: () => {
          showConfirmModal.value = false;
        },
      };
      break;
    case 'decline':
      genericModalConfig.value = {
        title: 'Rechazar Solicitud',
        message: `¿Estás seguro de que deseas rechazar la solicitud de suscripción de "${request.email}"?`,
        confirmButtonText: 'Rechazar',
        cancelButtonText: 'Cancelar',
        confirmMethod: async () => {
          try {
            await declineSubscriptionRequest(request.id);
            snackbarStore.show('Solicitud rechazada exitosamente', 'success');
          } catch (error) {
            snackbarStore.show(`Error al rechazar solicitud: ${error.message}`, 'error');
          } finally {
            showConfirmModal.value = false;
          }
        },
        cancelMethod: () => {
          showConfirmModal.value = false;
        },
      };
      break;
    // hard delete
    // case 'delete':
    //   genericModalConfig.value = {
    //     title: 'Eliminar Solicitud',
    //     message: `¿Estás seguro de que deseas ELIMINAR PERMANENTEMENTE la solicitud de "${request.email}"?`,
    //     confirmButtonText: 'Eliminar',
    //     cancelButtonText: 'Cancelar',
    //     confirmMethod: async () => {
    //       try {
    //         await deleteSubscriptionRequest(request.id); // Necesita ser implementado en useSubscriptionRequests
    //         snackbarStore.show('Solicitud eliminada permanentemente', 'success');
    //       } catch (error) {
    //         snackbarStore.show(`Error al eliminar solicitud: ${error.message}`, 'error');
    //       } finally {
    //         showConfirmModal.value = false;
    //       }
    //     },
    //     cancelMethod: () => {
    //       showConfirmModal.value = false;
    //     },
    //   };
    //   break;
    default:
      // Fallback si la acción no está definida
      genericModalConfig.value = {
        title: 'Acción no definida',
        message: 'No se ha definido una acción para esta operación.',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cerrar',
        confirmMethod: () => { showConfirmModal.value = false; },
        cancelMethod: () => { showConfirmModal.value = false; },
      };
  }
  showConfirmModal.value = true;
};

onMounted(() => {
  isLoadingRequests.value = true;
  unsubscribe = subscribeToSubscriptionRequests((requests) => {
    allRequests.value = requests;
    isLoadingRequests.value = false;
  });
});

onUnmounted(() => {
  // Cancelar la suscripción al desmontar el componente
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>

<style scoped>
/* Estilos personalizados para la tabla */
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

/* Estilos para el shadow-lg en la tabla */
.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>