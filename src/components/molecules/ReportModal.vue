<!-- ModalReport.vue -->
<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/60 flex items-center justify-center z-102 transition-opacity duration-300"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl transform transition-all duration-300"
    >
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-300 mb-4">
        ¿Desea reportar esta {{ entityTypeLabel }}?
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
        ¿Estás seguro de que quieres reportar esta {{ entityTypeLabel }}?
      </p>
      <label class="block mb-2 text-gray-700 dark:text-gray-300">Motivo del reporte:</label>
      <select
        v-model="selectedReportReason"
        class="w-full mb-4 border border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:bg-gray-600 focus:border-primary dark:focus:border-secondary rounded-lg px-3 py-2"
      >
        <option value="" disabled selected>Seleccione un motivo</option>
        <option value="Contenido inapropiado">Contenido inapropiado</option>
        <option value="Spam">Spam</option>
        <option value="Información errónea">Información errónea</option>
        <option value="Otro">Otro</option>
      </select>
      <label class="block mb-2 text-gray-700 dark:text-gray-300">Descripción (opcional):</label>
      <textarea
        v-model="reportDescription"
        rows="3"
        class="w-full mb-4 border border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:bg-gray-600 rounded-lg px-3 py-2"
        placeholder="Agrega una descripción adicional..."
      ></textarea>
      <div class="flex justify-end gap-3">
        <button
          @click="handleCancel"
          class="px-4 py-2 text-gray-500 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:hover:text-gray-200 font-medium rounded-lg hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
        >
          Cancelar
        </button>
        <button
          :disabled="loading || !selectedReportReason"
          type="submit"
          @click="handleReport"
          class="relative px-5 py-2 bg-primary dark:bg-secondary text-white font-medium rounded-lg hover:bg-primary-md dark:hover:bg-secondary-md transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-primary-md dark:disabled:bg-secondary-md disabled:cursor-not-allowed"
        >
          <span v-if="!loading">Reportar</span>
          <span v-else class="flex items-center gap-2">
            <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Reportando...
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useReports } from '../../composable/useReports';
import { useSnackbarStore } from '../../stores/snackbar';
import { useAuth } from '../../api/auth/useAuth';

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  entityType: {
    type: String,
    required: true,
  },
  entityId: {
    type: String,
    required: true,
  },
  metadata: {
    type: Object,
    default: () => ({}),
  },
});

// Emits
const emit = defineEmits(['close', 'reported']);
// Instances
const { user } = useAuth();
// Reactive state
const selectedReportReason = ref('');
const reportDescription = ref('');
const loading = ref(false);
const snackbarStore = useSnackbarStore();
const { saveReport } = useReports();
// Computed
const entityTypeLabel = computed(() => {
  switch (props.entityType) {
    case 'reel':
      return 'reel';
    case 'group':
      return 'grupo';
    case 'post':
      return 'publicación';
    case 'event':
      return 'evento';
    case 'user':
      return 'usuario';
    default:
      return 'entidad';
  }
});

// Methods
const handleCancel = () => {
  selectedReportReason.value = '';
  reportDescription.value = '';
  emit('close');
};

const handleReport = async () => {
  if (!props.entityId || !user.value.uid || !selectedReportReason.value) {
    snackbarStore.show('Faltan datos para reportar', 'error');
    return;
  }

  loading.value = true;
  try {
    await saveReport({
      entityType: props.entityType,
      entityId: props.entityId,
      userId: user.value.uid,
      reason: selectedReportReason.value,
      description: reportDescription.value,
      metadata: props.metadata,
    });
    snackbarStore.show(`${entityTypeLabel.value} reportado exitosamente`, 'success');
    emit('reported');
    handleCancel();
  } catch (err) {
    console.error(`Error reporting ${props.entityType}:`, err);
    snackbarStore.show(`Error al reportar el ${entityTypeLabel.value}`, 'error');
  } finally {
    loading.value = false;
  }
};
</script>