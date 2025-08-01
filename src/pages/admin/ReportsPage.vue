<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
    <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-6">Reportes de la Comunidad</h1>

    <!-- Selectbox para filtrar por tipo de reporte -->
    <div class="mb-6 flex items-center gap-2">
      <label for="entityTypeFilter" class="text-sm font-medium text-gray-700 dark:text-gray-200">
        Filtrar por tipo:
      </label>
      <select
        id="entityTypeFilter"
        v-model="selectedEntityType"
        class="px-4 py-2 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary transition-colors duration-200 shadow-sm"
        aria-label="Filtrar por tipo de entidad"
      >
        <option value="">Todos</option>
        <option v-for="type in entityTypes" :key="type" :value="type">{{ formatEntityType(type) }}</option>
      </select>
    </div>

    <!-- Tabla de reportes -->
    <div v-if="reportsStore.isLoading" class="text-center text-gray-600 dark:text-gray-300 py-8">
      <i class="fas fa-spinner fa-spin mr-2"></i> Cargando reportes...
    </div>
    <div v-else-if="filteredReports.length" class="overflow-x-auto rounded-lg shadow-lg">
      <table class="min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr class="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-sm leading-normal dosis-font">
            <th class="py-3 px-6 text-left">ID Reporte</th>
            <th class="py-3 px-6 text-left">Tipo</th>
            <th class="py-3 px-6 text-left">ID Entidad</th>
            <th class="py-3 px-6 text-left">Motivo</th>
            <th class="py-3 px-6 text-center">Fecha</th>
            <th class="py-3 px-6 text-left">Info Adicional</th>
            <th class="py-3 px-6 text-center">Estado</th>
            <th class="py-3 px-6 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody class="text-gray-600 dark:text-gray-300 text-sm font-light josefin-font">
          <tr 
            v-for="(report, index) in filteredReports" 
            :key="report.id" 
            class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100/80 dark:hover:bg-gray-600/80"
          >
            <td class="py-3 px-6 text-left whitespace-nowrap">
              <span class="truncate max-w-[120px] block">{{ report.reportId }}</span>
            </td>
            <td class="py-3 px-6 text-left capitalize">{{ formatEntityType(report.entityType) }}</td>
            <td class="py-3 px-6 text-left whitespace-nowrap">
              <span class="truncate max-w-[120px] block">{{ report.entityId }}</span>
            </td>
            <td class="py-3 px-6 text-left">{{ report.reason }}</td>
            <td class="py-3 px-6 text-center">{{ formatDate(report.created_at) }}</td>
            <td class="py-3 px-6 text-left">{{ getMetadataInfo(report.metadata) }}</td>
            <td class="py-3 px-6 text-center">
              <span class="py-1 px-3 rounded-full text-xs font-semibold" :class="statusColor(report.status)">
                {{ report.status === 'pending' ? 'Pendiente' : report.status === 'completed' ? 'Completado' : 'Rechazado' }}
              </span>
            </td>
            <td class="py-3 px-6 text-center">
              <div class="flex items-center justify-center gap-2">
                <button 
                  @click="openModal(report)"
                  class="px-3 py-1 rounded-md bg-primary/10 dark:bg-secondary/10 text-primary dark:text-secondary hover:bg-primary/20 dark:hover:bg-secondary/20 transition-colors duration-200 text-xs"
                  aria-label="Ver detalles del reporte"
                >
                  Ver
                </button>
                <button 
                  @click="setGenericModalConfig('delete', report)"
                  class="px-3 py-1 rounded-md bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20 dark:hover:bg-red-500/30 transition-colors duration-200 text-xs"
                  aria-label="Eliminar reporte"
                >
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-center text-gray-600 dark:text-gray-300 py-8">
      No se encontraron reportes con los filtros aplicados.
    </div>

    <!-- Modal para detalles del reporte -->
    <GenericConfirmModal
      :visible="showConfirmModal"
      :title="genericModalConfig.title"
      :message="genericModalConfig.message"
      :confirmButtonText="genericModalConfig.confirmButtonText"
      :cancelButtonText="genericModalConfig.cancelButtonText"
      @cancel="genericModalConfig.cancelMethod"
      @confirmed="genericModalConfig.confirmMethod"
    />

    <div
      v-if="showDetailModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeDetailModal"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-4">Detalles del Reporte</h2>
        <ul class="text-sm text-gray-700 dark:text-gray-300 space-y-2">
          <li><strong>ID Reporte:</strong> {{ selectedReport?.reportId }}</li>
          <li><strong>Tipo:</strong> {{ formatEntityType(selectedReport?.entityType) }}</li>
          <li><strong>ID Entidad:</strong> {{ selectedReport?.entityId }}</li>
          <li><strong>Usuario Reportador:</strong> {{ selectedReport?.userId }}</li>
          <li><strong>Motivo:</strong> {{ selectedReport?.reason }}</li>
          <li><strong>Descripción:</strong> {{ selectedReport?.description || 'Sin descripción' }}</li>
          <li><strong>Fecha:</strong> {{ formatDate(selectedReport?.created_at) }}</li>
          <li><strong>Estado:</strong> 
            <span class="py-1 px-3 rounded-full text-xs font-semibold" :class="statusColor(selectedReport?.status)">
              {{ selectedReport?.status === 'pending' ? 'Pendiente' : selectedReport?.status === 'completed' ? 'Completado' : 'Rechazado' }}
            </span>
          </li>
          <li v-if="Object.keys(selectedReport?.metadata || {}).length" class="mt-4">
            <strong>Metadatos:</strong>
            <ul class="ml-4 space-y-1">
              <li v-for="([key, value]) in Object.entries(selectedReport?.metadata || {})" :key="key">
                <strong>{{ formatKey(key) }}:</strong> {{ value }}
              </li>
            </ul>
          </li>
        </ul>
        <div class="mt-6 flex justify-end">
          <button
            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            @click="closeDetailModal"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useReportsStore } from '../../stores/reports';
import { useSnackbarStore } from '../../stores/snackbar';
import GenericConfirmModal from '../../components/molecules/GenericConfirmModal.vue'; // Importa el modal genérico

const snackbarStore = useSnackbarStore();
const reportsStore = useReportsStore();
const selectedEntityType = ref('');
const showDetailModal = ref(false); // Cambiado de showModal para evitar conflictos
const selectedReport = ref(null);

const showConfirmModal = ref(false); // Para el modal de confirmación de eliminar
const genericModalConfig = ref({}); // Configuración para el modal genérico

// Tipos de entidades disponibles
const entityTypes = [
  'post',
  'reel',
  'group',
  'groupPost',
  'event',
  'eventPost',
  'user',
];

// Filtra los reportes según el tipo seleccionado
const filteredReports = computed(() => {
  if (!selectedEntityType.value) {
    return reportsStore.getReports;
  }
  return reportsStore.getReports.filter((report) => report.entityType === selectedEntityType.value);
});

// Formatea la fecha de Firestore Timestamp a una cadena legible
function formatDate(timestamp) {
  if (!timestamp || !timestamp.toDate) return 'N/A';
  return timestamp.toDate().toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Formatea el tipo de entidad para mostrarlo en el selectbox y modal
function formatEntityType(type) {
  const typeMap = {
    post: 'Post',
    reel: 'Reel',
    group: 'Grupo',
    groupPost: 'Post de Grupo',
    event: 'Evento',
    eventPost: 'Post de Evento',
    user: 'Usuario',
  };
  return typeMap[type] || type;
}

// Formatea las claves de metadata para mostrarlas
function formatKey(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

// Extrae información relevante del metadata para la tabla
function getMetadataInfo(metadata) {
  if (!metadata) return 'N/A';
  if (metadata.reelTitle) return `Título: ${metadata.reelTitle}`;
  if (metadata.title) return `Título: ${metadata.title}`;
  return 'N/A';
}

// Colores para los estados
function statusColor(status) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200';
    case 'completed':
      return 'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-200';
    case 'rejected':
      return 'bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-200';
    default:
      return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
}

// Abrir el modal con los detalles del reporte
function openModal(report) {
  selectedReport.value = report;
  showDetailModal.value = true; // Usa el nuevo nombre de ref
  document.body.style.overflow = 'hidden'; // Evita el scroll del body
}

// Cerrar el modal de detalles
function closeDetailModal() {
  showDetailModal.value = false; // Usa el nuevo nombre de ref
  selectedReport.value = null;
  document.body.style.overflow = ''; // Restaura el scroll del body
}

// Configurar y mostrar el modal genérico para eliminar
const setGenericModalConfig = (action, report) => {
  switch (action) {
    case 'delete':
      genericModalConfig.value = {
        title: 'Eliminar Reporte',
        message: `¿Estás seguro de que deseas eliminar el reporte de "${formatEntityType(report.entityType)}" con ID "${report.entityId}"?`,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
        confirmMethod: async () => {
          try {
            await reportsStore.deleteReport(report.id);
            snackbarStore.show('Reporte eliminado exitosamente', 'success');
          } catch (error) {
            snackbarStore.show(`Error al eliminar el reporte: ${error.message}`, 'error');
          } finally {
            showConfirmModal.value = false;
            document.body.style.overflow = ''; // Restaura el scroll del body
          }
        },
        cancelMethod: () => {
          showConfirmModal.value = false;
          document.body.style.overflow = ''; // Restaura el scroll del body
        },
      };
      break;
    default:
      // Fallback si la acción no está definida
      genericModalConfig.value = {
        title: 'Acción no definida',
        message: 'No se ha definido una acción para esta operación.',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cerrar',
        confirmMethod: () => { showConfirmModal.value = false; document.body.style.overflow = ''; },
        cancelMethod: () => { showConfirmModal.value = false; document.body.style.overflow = ''; },
      };
  }
  showConfirmModal.value = true;
  document.body.style.overflow = 'hidden'; // Evita el scroll del body
};


// Suscripción a reportes en tiempo real
onMounted(async () => {
  try {
    await reportsStore.subscribeToReports();
  } catch (error) {
    snackbarStore.show(`Error al suscribirse a reportes: ${error.message}`, 'error');
  }
});

// Cancelar suscripción al desmontar
onUnmounted(() => {
  reportsStore.unsubscribeFromReports();
});
</script>

<style scoped>

/* Estilos para el modal de detalles */
.fixed {
  transition: opacity 0.3s ease-in-out;
}
</style>
