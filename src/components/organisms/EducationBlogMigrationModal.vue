<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
    @click.self="emitClose"
  >
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-300 mb-4">
        Migrar Blogs desde JSON
      </h3>
      <div class="mb-4">
        <label for="jsonFile" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
          Selecciona un archivo JSON
        </label>
        <input
          id="jsonFile"
          type="file"
          accept=".json"
          @change="handleFileChange"
          class="w-full p-2 border dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary dark:file:bg-secondary file:text-white hover:file:bg-opacity-90 transition-colors duration-200"
        />
        <p v-if="fileError" class="text-sm text-red-500 mt-1">{{ fileError }}</p>
      </div>
      <div class="flex justify-end gap-2">
        <button
          @click="emitClose"
          class="px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          aria-label="Cancelar migración"
        >
          Cancelar
        </button>
        <button
          @click="confirmMigration"
          :disabled="!selectedFile || isMigrating"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          aria-label="Confirmar migración"
        >
          <span v-if="isMigrating">
            <i class="fa-solid fa-spinner animate-spin"></i>
          </span>
          {{ isMigrating ? 'Migrando...' : 'Migrar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useEducationBlogsStore } from '../../stores/educationBlogs';
import { useSnackbarStore } from '../../stores/snackbar';

const blogsStore = useEducationBlogsStore();
const snackbarStore = useSnackbarStore();

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['close']);

const selectedFile = ref(null);
const fileError = ref(null);
const isMigrating = ref(false);

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file && file.type === 'application/json') {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      fileError.value = 'El archivo no debe superar los 5MB.';
      selectedFile.value = null;
      event.target.value = null;
    } else {
      selectedFile.value = file;
      fileError.value = null;
    }
  } else {
    fileError.value = 'Por favor, selecciona un archivo JSON válido.';
    selectedFile.value = null;
    event.target.value = null;
  }
};

const confirmMigration = async () => {
  if (!selectedFile.value) return;
  isMigrating.value = true;
  try {
    const fileContent = await selectedFile.value.text();
    const jsonData = JSON.parse(fileContent);
    if (!Array.isArray(jsonData)) {
      throw new Error('El archivo JSON debe contener un array de blogs.');
    }
    await blogsStore.migrateBlogs(jsonData);
    snackbarStore.show('Blogs migrados exitosamente', 'success');
    emitClose();
  } catch (error) {
    fileError.value = 'Error al procesar el archivo JSON: ' + error.message;
    snackbarStore.show('Error al procesar el archivo JSON: ' + error.message, 'error');
  } finally {
    isMigrating.value = false;
  }
};

const emitClose = () => {
  selectedFile.value = null;
  fileError.value = null;
  isMigrating.value = false;
  emit('close');
};
</script>

<style scoped>
.bg-primary {
  background-color: #3b82f6;
}

.bg-primary:hover {
  background-color: #2563eb;
}

.bg-secondary {
  background-color: #60a5fa;
}

.bg-secondary:hover {
  background-color: #3b82f6;
}
</style>