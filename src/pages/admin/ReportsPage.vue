<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
    <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-6">Reportes de la Comunidad</h1>

    <!-- Selectbox para filtrar por tipo de reporte -->
    <div class="mb-6 flex items-center gap-2">
      <label for="entityTypeFilter" class="sr-only text-sm text-gray-700 dark:text-gray-200">
        Filtrar por tipo:
      </label>
      <select
        id="entityTypeFilter"
        v-model="selectedEntityType"
        class="px-4 py-2 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary transition-colors duration-200 shadow-sm"
        aria-label="Filtrar por tipo de entidad"
      >
        <option value="">Todos los tipos</option>
        <option v-for="type in entityTypes" :key="type" :value="type">{{ formatEntityType(type) }}</option>
      </select>
      <label for="entityStatusFilter" class="sr-only text-sm text-gray-700 dark:text-gray-200">
        Filtrar por Estado:
      </label>
      <select
        id="entityStatusFilter"
        v-model="selectedStatus"
        class="px-4 py-2 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary transition-colors duration-200 shadow-sm"
        aria-label="Filtrar por estado de entidad"
      >
        <option value="">Todos los estados</option>
        <option v-for="status in statusTypes" :key="status" :value="status">{{ formatEntityStatus(status) }}</option>
      </select>
    </div>

    <!-- Tabla de reportes -->
    <div v-if="reportsStore.isLoading" class="text-center text-gray-600 dark:text-gray-300 py-8">
      <i class="fas fa-spinner fa-spin mr-2"></i> Cargando reportes...
    </div>
    <div v-else-if="filteredReports.length" class="rounded-lg shadow-lg">
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
            v-for="report in filteredReports"
            :key="report.id"
            class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100/80 dark:hover:bg-gray-700/20"
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
                {{ statusText(report.status) }}
              </span>
            </td>
            <td class="py-3 px-6">
              <div class="flex items-center justify-center gap-2">
                <div class="relative group">
                  <button
                    @click="openDetailsModal(report)"
                    class="p-2 rounded-full text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                    aria-label="Ver detalles y acciones del reporte"
                    title="Ver detalles del reporte"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <!-- Tooltip -->
                  <span class="tooltip-text">Ver detalles</span>
                </div>
                
                <!-- Acciones directas (solo si el reporte está pendiente) -->
                <template v-if="report.status === 'pending'">
                  <!-- Botón para Rechazar Reporte -->
                  <div class="relative group">
                    <button
                      @click="setGenericModalConfig('rejectReport', report)"
                      class="p-2 rounded-full text-yellow-600 dark:text-yellow-400 bg-yellow-100/50 dark:bg-yellow-600/50 hover:bg-yellow-200/50 dark:hover:bg-yellow-700/50 transition-colors duration-200"
                      aria-label="Rechazar reporte"
                      title="Rechazar reporte"
                    >
                      <i class="fas fa-ban"></i>
                    </button>
                    <!-- Tooltip -->
                    <span class="tooltip-text">Rechazar reporte</span>
                  </div>

                  <!-- Botón para Eliminar Reporte -->
                  <div class="relative group">
                    <button
                      @click="setGenericModalConfig('deleteReport', report)"
                      class="p-2 rounded-full text-red-600 dark:text-red-400 bg-red-100/50 dark:bg-red-600/50 hover:bg-red-200/50 dark:hover:bg-red-700/50 transition-colors duration-200"
                      aria-label="Eliminar reporte"
                      title="Eliminar reporte"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                    <!-- Tooltip -->
                    <span class="tooltip-text">Eliminar reporte</span>
                  </div>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-center text-gray-600 dark:text-gray-300 py-8">
      No se encontraron reportes con los filtros aplicados.
    </div>

    <!-- Detalles y Acciones -->
    <div
      v-if="showDetailsModal"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-101 p-4 animate-fade-in"
      @click.self="closeDetailsModal"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-4">Detalles del Reporte</h2>
        <ul class="text-sm text-gray-700 dark:text-gray-300 space-y-2">
          <li><strong>ID Reporte:</strong> {{ selectedReport?.id }}</li>
          <li><strong>Tipo:</strong> {{ formatEntityType(selectedReport?.entityType) }}</li>
          <li><strong>ID Entidad:</strong> {{ selectedReport?.entityId }}</li>
          <li><strong>Usuario Reportador:</strong> {{ selectedReport?.userId }}</li>
          <li><strong>Motivo:</strong> {{ selectedReport?.reason }}</li>
          <li><strong>Descripción:</strong> {{ selectedReport?.description || 'Sin descripción' }}</li>
          <li><strong>Fecha:</strong> {{ formatDate(selectedReport?.created_at) }}</li>
          <li><strong>Estado:</strong>
            <span class="py-1 px-3 rounded-full text-xs font-semibold" :class="statusColor(selectedReport?.status)">
              {{ statusText(selectedReport?.status) }}
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

        <!-- Acciones del Reporte - Solo visible si el estado es 'pending' -->
        <div v-if="selectedReport?.status === 'pending'" class="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-end gap-2">
          <!-- Botón para eliminar la entidad reportada -->
          <button
            @click="setGenericModalConfig('deleteEntity', selectedReport)"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
          >
            Eliminar {{ formatEntityType(selectedReport?.entityType) }}
          </button>
        </div>

        <div class="mt-6 flex justify-end">
          <button
            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            @click="closeDetailsModal"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Genérico para Confirmaciones -->
    <GenericConfirmModal
      :visible="showGenericModal"
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
import { useReportsStore } from '../../stores/reports';
import { useSnackbarStore } from '../../stores/snackbar';
import GenericConfirmModal from '../../components/molecules/GenericConfirmModal.vue';

import { usePostsStore } from '../../stores/posts';
import { useReelsStore } from '../../stores/reels';
import { useGroupsStore } from '../../stores/groups';
import { useEventsStore } from '../../stores/events';
import { useUsersStore } from '../../stores/users';
import { useGroupPostsStore } from '../../stores/groupPosts';
import { useEventPostsStore } from '../../stores/eventPosts';


const snackbarStore = useSnackbarStore();
const reportsStore = useReportsStore();
const postsStore = usePostsStore();
const reelsStore = useReelsStore();
const groupsStore = useGroupsStore();
const eventsStore = useEventsStore();
const usersStore = useUsersStore();
const groupPostsStore = useGroupPostsStore();
const eventPostsStore = useEventPostsStore();

const selectedEntityType = ref('');
const selectedStatus = ref('');
const showDetailsModal = ref(false);
const selectedReport = ref(null);

const showGenericModal = ref(false);
const genericModalConfig = ref({});

// TODO : Todavia falta obtener las entities a auditar. (Reels, post, grupo, evento, etc).

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
const statusTypes = [
  'pending',
  'completed',
  'rejected',
];

// Filtra los reportes según el tipo seleccionado
const filteredReports = computed(() => {
  if (!reportsStore.getReports) return [];
  return reportsStore.getReports.filter((report) => {
    const matchesType = !selectedEntityType.value || report.entityType === selectedEntityType.value;
    const matchesStatus = !selectedStatus.value || report.status === selectedStatus.value;
    return matchesType && matchesStatus;
  });
  
});

// Formatea la fecha
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
// Formatea texto del estado para mostrarlo
function formatEntityStatus(type) {
  const typeMap = {
    pending: 'Pendiente',
    completed: 'Completado',
    rejected: 'Rechazado',
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

// Texto formateado para los estados
function statusText(status) {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'completed':
      return 'Completado';
    case 'rejected':
      return 'Rechazado';
    default:
      return 'Desconocido';
  }
}

// Abrir el modal con los detalles del reporte
function openDetailsModal(report) {
  selectedReport.value = report;
  showDetailsModal.value = true;
  document.body.style.overflow = 'hidden'; // Evita el scroll del body
}

// Cerrar el modal de detalles
function closeDetailsModal() {
  showDetailsModal.value = false;
  selectedReport.value = null;
  document.body.style.overflow = ''; // Restaura el scroll del body
}

// Función centralizada para tomar acción sobre el reporte
async function takeActionOnReport(report, actionType) {
  try {
    if (!report || !report.id || !report.entityType || !report.entityId) {
      throw new Error('Datos de reporte incompletos.');
    }

    if (actionType === 'deleteEntity') {
      // Lógica para eliminar la entidad según su tipo
      switch (report.entityType) {
        case 'post':
          await postsStore.deletePost(report.entityId);
          break;
        case 'groupPost':
          await groupPostsStore.deletePostGroup(report.metadata?.groupId, report.entityId);
          break;
          case 'eventPost':
          await eventPostsStore.deletePostEvent(report.metadata?.eventId, report.entityId);
          break;
        case 'reel':
          //necesito obtener el reel entero, para pasarle tambien los path de las imágenes
          // const reel = await reelsStore.getReelById(report.entityId);
          await reelsStore.deleteReel(report.entityId);
          break;
        case 'group':
          await groupsStore.deleteGroup(report.entityId);
          break;
        case 'event':
          await eventsStore.deleteEvent(report.entityId);
          break;
        case 'user':
          // await usersStore.banUser(report.entityId); // TO DO: Pensar como sansocionar a un usuario, tengo metodo de blockeo.
          break;
        default:
          throw new Error(`Tipo de entidad no soportado: ${report.entityType}`);
      }
      // Actualiza el estado del reporte a 'completed'
      await reportsStore.updateStatus(report.id, 'completed');
      snackbarStore.show('Entidad eliminada y reporte completado exitosamente', 'success');
    } else if (actionType === 'rejectReport') {
      // Lógica para rechazar el reporte
      await reportsStore.updateStatus(report.id, 'rejected');
      snackbarStore.show('Reporte rechazado exitosamente', 'success');
    } else if (actionType === 'deleteReport') {
      // Lógica para eliminar solo el reporte (opcional, para limpieza)
      await reportsStore.deleteReport(report.id);
      snackbarStore.show('Reporte eliminado exitosamente', 'success');
    }

    // Cerramos los modales al finalizar
    showGenericModal.value = false;
    closeDetailsModal();
  } catch (error) {
    snackbarStore.show(`Error al realizar la acción: ${error.message}`, 'error');
  } finally {
    document.body.style.overflow = '';
  }
}

// Configurar y mostrar el modal genérico para confirmaciones
const setGenericModalConfig = (action, report) => {
  let title, message, confirmButtonText, confirmMethod;

  switch (action) {
    case 'deleteEntity':
      title = `Eliminar ${formatEntityType(report.entityType)}`;
      message = `¿Estás seguro de que deseas **eliminar permanentemente** este ${formatEntityType(report.entityType)}? Esta acción no se puede deshacer.`;
      confirmButtonText = `Sí, Eliminar ${formatEntityType(report.entityType)}`;
      confirmMethod = () => takeActionOnReport(report, 'deleteEntity');
      break;
    case 'rejectReport':
      title = 'Rechazar Reporte';
      message = '¿Estás seguro de que deseas rechazar este reporte? No se tomará ninguna acción sobre la entidad.';
      confirmButtonText = 'Sí, Rechazar';
      confirmMethod = () => takeActionOnReport(report, 'rejectReport');
      break;
    case 'deleteReport':
      title = 'Eliminar Reporte';
      message = `¿Estás seguro de que deseas eliminar el reporte con ID "${report.reportId}"?`;
      confirmButtonText = 'Sí, Eliminar';
      confirmMethod = () => takeActionOnReport(report, 'deleteReport');
      break;
    default:
      return;
  }

  genericModalConfig.value = {
    title,
    message,
    confirmButtonText,
    cancelButtonText: 'Cancelar',
    confirmMethod,
    cancelMethod: () => {
      showGenericModal.value = false;
    },
  };

  showGenericModal.value = true;
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