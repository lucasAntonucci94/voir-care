<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">Reportes de la Comunidad</h1>

    <!-- Selectbox para filtrar por tipo de reporte -->
    <div class="mb-6">
      <label for="entityTypeFilter" class="text-sm font-medium text-gray-700 dark:text-gray-200 mr-2">
        Filtrar por tipo:
      </label>
      <select
        id="entityTypeFilter"
        v-model="selectedEntityType"
        class="px-4 py-2 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">Todos</option>
        <option v-for="type in entityTypes" :key="type" :value="type">{{ formatEntityType(type) }}</option>
      </select>
    </div>

    <!-- Tabla de reportes -->
    <div class="overflow-x-auto rounded-lg shadow-sm">
      <table class="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <thead>
          <tr class="bg-gray-100 dark:bg-gray-700 text-left text-gray-600 dark:text-gray-200 text-sm">
            <th class="px-4 py-3 border-b dark:border-gray-600">#</th>
            <th class="px-4 py-3 border-b dark:border-gray-600">ID Reporte</th>
            <th class="px-4 py-3 border-b dark:border-gray-600">Tipo</th>
            <th class="px-4 py-3 border-b dark:border-gray-600">ID Entidad</th>
            <th class="px-4 py-3 border-b dark:border-gray-600">Motivo</th>
            <th class="px-4 py-3 border-b dark:border-gray-600">Fecha</th>
            <th class="px-4 py-3 border-b dark:border-gray-600">Info Adicional</th>
            <th class="px-4 py-3 border-b dark:border-gray-600">Estado</th>
            <th class="px-4 py-3 border-b dark:border-gray-600">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(report, index) in filteredReports" :key="report.id" class="text-sm text-gray-700 dark:text-gray-300">
            <td class="px-4 py-3 border-b dark:border-gray-700">{{ index + 1 }}</td>
            <td class="px-4 py-3 border-b dark:border-gray-700">{{ report.reportId }}</td>
            <td class="px-4 py-3 border-b dark:border-gray-600 capitalize">{{ report.entityType }}</td>
            <td class="px-4 py-3 border-b dark:border-gray-700">{{ report.entityId }}</td>
            <td class="px-4 py-3 border-b dark:border-gray-700">{{ report.reason }}</td>
            <td class="px-4 py-3 border-b dark:border-gray-700">{{ formatDate(report.created_at) }}</td>
            <td class="px-4 py-3 border-b dark:border-gray-700">{{ getMetadataInfo(report.metadata) }}</td>
            <td class="px-4 py-3 border-b dark:border-gray-700">
              <span class="inline-block px-2 py-1 rounded text-xs font-semibold" :class="statusColor(report.status)">
                {{ report.status }}
              </span>
            </td>
            <td class="px-4 py-3 border-b dark:border-gray-700">
              <button class="text-blue-600 dark:text-blue-400 hover:underline mr-2" @click="openModal(report)">
                Ver
              </button>
              <button class="text-red-600 dark:text-red-400 hover:underline" @click="deleteReport(report.id)">
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para detalles del reporte -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeModal"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-4">Detalles del Reporte</h2>
        <ul class="text-sm text-gray-700 dark:text-gray-300 space-y-2">
          <li><strong>ID Reporte:</strong> {{ selectedReport.reportId }}</li>
          <li><strong>Tipo:</strong> {{ formatEntityType(selectedReport.entityType) }}</li>
          <li><strong>ID Entidad:</strong> {{ selectedReport.entityId }}</li>
          <li><strong>Usuario Reportador:</strong> {{ selectedReport.userId }}</li>
          <li><strong>Motivo:</strong> {{ selectedReport.reason }}</li>
          <li><strong>Descripción:</strong> {{ selectedReport.description || 'Sin descripción' }}</li>
          <li><strong>Fecha:</strong> {{ formatDate(selectedReport.created_at) }}</li>
          <li><strong>Estado:</strong> {{ selectedReport.status }}</li>
          <li v-if="Object.keys(selectedReport.metadata || {}).length" class="mt-4">
            <strong>Metadatos:</strong>
            <ul class="ml-4 space-y-1">
              <li v-for="[key, value] in Object.entries(selectedReport.metadata)" :key="key">
                <strong>{{ formatKey(key) }}:</strong> {{ value }}
              </li>
            </ul>
          </li>
        </ul>
        <div class="mt-6 flex justify-end">
          <button
            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            @click="closeModal"
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

const snackbarStore = useSnackbarStore();
const reportsStore = useReportsStore();
const selectedEntityType = ref('');
const showModal = ref(false);
const selectedReport = ref(null);

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
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200';
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
}

// Abrir el modal con los detalles del reporte
function openModal(report) {
  selectedReport.value = report;
  showModal.value = true;
}

// Cerrar el modal
function closeModal() {
  showModal.value = false;
  selectedReport.value = null;
}

// Eliminar un reporte
async function deleteReport(docId) {
  try {
    await reportsStore.deleteReport(docId);
    snackbarStore.show('Reporte eliminado exitosamente', 'success');
  } catch (error) {
    snackbarStore.show(`Error al eliminar el reporte: ${error.message}`, 'error');
  }
}

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

</style>