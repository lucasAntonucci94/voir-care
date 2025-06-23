<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Administración de Reels Predeterminados</h1>
      <button
        @click="openCreateModal"
        class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center gap-2"
        aria-label="Crear nuevo reel"
      >
        <i class="fas fa-plus"></i> Nuevo Reel
      </button>
    </div>

    <!-- Loading and Error States -->
    <div v-if="isLoadingReels" class="text-center text-gray-600 dark:text-gray-300">
      <i class="fas fa-spinner fa-spin mr-2"></i> Cargando reels...
    </div>
    <div v-else-if="reelsStore.error" class="text-center text-red-500 dark:text-red-400">
      Error: {{ reelsStore.error }}
    </div>
    <div v-else>
      <!-- Search and Filters -->
      <div class="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por título..."
          class="w-full sm:w-1/3 p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Buscar reels"
        />
        <select
          v-model="filterMediaType"
          class="p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          aria-label="Filtrar por tipo de media"
        >
          <option value="">Filtrar por tipo de media</option>
          <option value="video">Video</option>
          <option value="image">Imagen</option>
        </select>
      </div>

      <!-- Reels Table -->
      <div v-if="filteredReels.length" class="overflow-x-auto rounded-lg">
        <table class="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow">
          <thead>
            <tr class="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-sm leading-normal">
              <th class="py-3 px-6 text-left">Título</th>
              <th class="py-3 px-6 text-left">Tipo</th>
              <th class="py-3 px-6 text-center">Activo</th>
              <th class="py-3 px-6 text-center">Prioridad</th>
              <th class="py-3 px-6 text-left">Creado</th>
              <th class="py-3 px-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 dark:text-gray-300 text-sm font-light">
            <tr
              v-for="reel in filteredReels"
              :key="reel.idDoc"
              class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <td class="py-3 px-6 text-left whitespace-nowrap">
                <div class="flex items-center">
                  <img
                    v-if="reel.thumbnailUrl"
                    :src="reel.thumbnailUrl"
                    alt="Reel Thumbnail"
                    class="w-8 h-8 rounded-full mr-2 object-cover"
                  />
                  <span>{{ reel.title || 'Sin título' }}</span>
                </div>
              </td>
              <td class="py-3 px-6 text-left">{{ reel.mediaType || 'N/A' }}</td>
              <td class="py-3 px-6 text-center">
                <span :class="reel.isActive ? 'text-green-500' : 'text-red-500'">
                  {{ reel.isActive ? 'Sí' : 'No' }}
                </span>
              </td>
              <td class="py-3 px-6 text-center">{{ reel.priority || 0 }}</td>
              <td class="py-3 px-6 text-left">
                {{ formatDate(reel.createdAt) }}
              </td>
              <td class="py-3 px-6 text-center">
                <div class="flex item-center justify-center gap-2">
                  <button
                    @click="openEditModal(reel)"
                    class="text-blue-500 hover:text-blue-700"
                    title="Editar"
                    aria-label="Editar reel"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    @click="deleteReel(reel.idDoc)"
                    class="text-red-500 hover:text-red-700"
                    title="Eliminar"
                    aria-label="Eliminar reel"
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
        No se encontraron reels con los filtros aplicados.
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/60 z-101 flex items-center justify-center p-4"
    >
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="sticky top-0 bg-white dark:bg-gray-800 z-10 p-6 border-b flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-300">
            {{ isEditing ? 'Editar Reel' : 'Crear Reel' }}
          </h3>
          <button
            @click="closeModal"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
            aria-label="Cerrar modal"
          >
            <i class="fa-solid fa-xmark w-6 h-6"></i>
          </button>
        </div>

        <!-- Progress Bar -->
        <div class="p-6">
          <div class="flex justify-center mb-6">
            <div class="flex items-center space-x-2">
              <div v-for="(step, index) in steps" :key="index" class="relative flex items-center">
                <div
                  class="flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all duration-300"
                  :class="{
                    'bg-primary dark:bg-secondary text-white animate-pulse-step': currentStep === index + 1,
                    'bg-primary text-white': currentStep > index + 1,
                    'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300': currentStep < index + 1,
                  }"
                  :aria-current="currentStep === index + 1 ? 'step' : undefined"
                  :aria-label="`Paso ${index + 1}`"
                >
                  <span v-if="currentStep <= index + 1">{{ index + 1 }}</span>
                  <i v-else class="fa-solid fa-check"></i>
                </div>
                <div
                  v-if="index < steps.length - 1"
                  class="w-6 h-1 bg-gray-200 dark:bg-gray-600"
                >
                  <div
                    class="h-full transition-all duration-300"
                    :class="currentStep > index + 1 ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-600'"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Form Content -->
          <form @submit.prevent="handleSaveReel" class="space-y-6">
            <!-- Step 1: Basic Info -->
            <div v-if="currentStep === 1">
              <div>
                <label for="reelTitle" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Título
                </label>
                <input
                  v-model="newReel.title"
                  id="reelTitle"
                  type="text"
                  placeholder="Ej: Promoción Voir"
                  class="w-full p-3 border hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                  :disabled="isLoading"
                  required
                />
                <p v-if="formErrors.title" class="text-sm text-red-500 mt-1">{{ formErrors.title }}</p>
              </div>
              <div class="mt-4">
                <label class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  <input
                    v-model="newReel.isActive"
                    type="checkbox"
                    class="custom-checkbox"
                    :disabled="isLoading"
                  />
                  Activo
                </label>
              </div>
            </div>

            <!-- Step 2: Media -->
            <div v-if="currentStep === 2">
              <!-- Media Upload -->
              <div class="relative">
                <label for="reelMedia" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Media (Video o Imagen)
                </label>
                <input
                  id="reelMedia"
                  type="file"
                  accept="image/*,video/*"
                  @change="handleMediaUpload"
                  :disabled="isLoading"
                  :class="[
                    'w-full p-2 border dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary dark:file:bg-secondary file:text-white hover:file:bg-opacity-90 transition-colors duration-200',
                    formErrors.media ? 'border-red-500' : 'border-gray-300 dark:border-gray-800'
                  ]"
                />
                <p v-if="formErrors.media" class="text-red-500 text-sm mt-1">{{ formErrors.media }}</p>
              </div>
              <!-- Media Preview -->
              <div v-if="newReel.media.previewUrl || newReel.media.url" class="mt-2">
                <img
                  v-if="newReel.media.type === 'image'"
                  :src="newReel.media.previewUrl || newReel.media.url"
                  alt="Media Preview"
                  class="w-full h-48 object-cover rounded-lg shadow-sm"
                />
                <video
                  v-else-if="newReel.media.type === 'video'"
                  :src="newReel.media.previewUrl || newReel.media.url"
                  controls
                  class="w-full h-48 rounded-lg shadow-sm"
                ></video>
              </div>
              <!-- Thumbnail Upload -->
              <div class="relative mt-4">
                <label for="reelThumbnail" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Thumbnail (Imagen)
                </label>
                <input
                  id="reelThumbnail"
                  type="file"
                  accept="image/*"
                  @change="handleThumbnailUpload"
                  :disabled="isLoading"
                  :class="[
                    'w-full p-2 border dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary dark:file:bg-secondary file:text-white hover:file:bg-opacity-90 transition-colors duration-200',
                    formErrors.thumbnail ? 'border-red-500' : 'border-gray-300 dark:border-gray-800'
                  ]"
                />
                <p v-if="formErrors.thumbnail" class="text-red-500 text-sm mt-1">{{ formErrors.thumbnail }}</p>
              </div>
              <!-- Thumbnail Preview -->
              <div v-if="newReel.thumbnail.previewUrl || newReel.thumbnail.url" class="mt-2">
                <img
                  :src="newReel.thumbnail.previewUrl || newReel.thumbnail.url"
                  alt="Thumbnail Preview"
                  class="w-full h-48 object-cover rounded-lg shadow-sm"
                />
              </div>
            </div>

            <!-- Step 3: Configuration -->
            <div v-if="currentStep === 3">
              <div>
                <label for="reelPriority" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Prioridad
                </label>
                <input
                  v-model.number="newReel.priority"
                  id="reelPriority"
                  type="number"
                  min="0"
                  placeholder="Ej: 10"
                  class="w-full p-3 border hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                  :disabled="isLoading"
                  required
                />
                <p v-if="formErrors.priority" class="text-sm text-red-500 mt-1">{{ formErrors.priority }}</p>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="flex justify-between gap-3 mt-6">
              <button
                v-if="currentStep > 1"
                type="button"
                @click="previousStep"
                :disabled="isLoading"
                class="px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                aria-label="Volver al paso anterior"
              >
                <i class="fa-solid fa-arrow-left"></i>
                <p class="hidden md:block">Atrás</p>
              </button>
              <button
                v-if="currentStep === 1"
                type="button"
                @click="closeModal"
                :disabled="isLoading"
                class="px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                aria-label="Cancelar"
              >
                <i class="fa-solid fa-times"></i>
                <p class="hidden md:block">Cancelar</p>
              </button>
              <button
                v-if="currentStep < steps.length"
                type="button"
                @click="nextStep"
                :disabled="isLoading"
                class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-lg hover:bg-primary/90 dark:hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                aria-label="Siguiente paso"
              >
                <p class="hidden md:block">Siguiente</p>
                <i class="fa-solid fa-arrow-right"></i>
              </button>
              <button
                v-if="currentStep === steps.length"
                type="submit"
                :disabled="isLoading"
                class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-lg hover:bg-primary/90 dark:hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                aria-label="Guardar reel"
              >
                <span v-if="isLoading">
                  <i class="fa-solid fa-spinner animate-spin"></i>
                </span>
                <p class="hidden md:block">
                  {{ isLoading ? 'Guardando...' : 'Guardar' }}
                </p>
                <i v-if="!isLoading" class="fa-solid fa-save"></i>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useDefaultReels } from '../../composable/useDefaultReels';
import { useReelsStore } from '../../stores/reels';
import { useSnackbarStore } from '../../stores/snackbar';

const reelsStore = useReelsStore();
const { saveDefaultReel, updateDefaultReel, deleteDefaultReel } = useDefaultReels();
const snackbarStore = useSnackbarStore();

const searchQuery = ref('');
const filterMediaType = ref('');
const showModal = ref(false);
const isEditing = ref(false);
const isLoading = ref(false);
const isLoadingReels = ref(false);
const currentStep = ref(1);
const formErrors = ref({});

const steps = ref([
  { label: 'Información' },
  { label: 'Multimedia' },
  { label: 'Configuración' },
]);

const newReel = ref({
  idDoc: null,
  title: '',
  media: { url: '', base64: null, type: null, path: null, previewUrl: null },
  thumbnail: { url: '', base64: null, path: null, previewUrl: null },
  mediaType: '',
  isActive: true,
  priority: 0,
});

// Computed property for filtered reels
const filteredReels = computed(() => {
  isLoadingReels.value = true;
  let filtered = reelsStore.defaultReels || [];
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((reel) =>
    reel.title?.toLowerCase().includes(query)
  );
}

if (filterMediaType.value) {
  filtered = filtered.filter((reel) => reel.mediaType === filterMediaType.value);
}

  isLoadingReels.value = false;
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

// Modal handling
const openCreateModal = () => {
  resetForm();
  isEditing.value = false;
  showModal.value = true;
};

const openEditModal = (reel) => {
  newReel.value = {
    idDoc: reel.idDoc,
    title: reel.title || '',
    media: { 
      url: reel.mediaUrl || '',
      base64: null,
      type: reel.mediaType || null,
      path: reel.mediaPath || '',
      previewUrl: null
    },
    thumbnail: { 
      url: reel.thumbnailUrl || '',
      base64: null,
      path: reel.thumbnailPath || '',
      previewUrl: null
    },
    mediaType: reel.mediaType || '',
    isActive: reel.isActive ?? true,
    priority: reel.priority || 0,
  };
  isEditing.value = true;
  currentStep.value = 1;
  showModal.value = true;
};

const closeModal = () => {
  resetForm();
  showModal.value = false;
  currentStep.value = 1;
  formErrors.value = {};
};

const resetForm = () => {
  newReel.value = {
    idDoc: null,
    title: '',
    media: { url: '', base64: null, type: null, path: null, previewUrl: null },
    thumbnail: { url: '', base64: null, path: null, previewUrl: null },
    mediaType: '',
    isActive: true,
    priority: 0,
  };
};

// Form validation
const validateStep = (step) => {
  let isValid = true;
  const errors = {};

  if (step === 1) {
    if (!newReel.value.title || newReel.value.title.trim() === '') {
      errors.title = 'El título es obligatorio';
      isValid = false;
    }
  } else if (step === 2) {
    if (!isEditing.value && !newReel.value.media.base64 && !newReel.value.media.url) {
      errors.media = 'Debe cargar un video o imagen';
      isValid = false;
    }
    if (!isEditing.value && !newReel.value.thumbnail.base64 && !newReel.value.thumbnail.url) {
      errors.thumbnail = 'Debe cargar una imagen para el thumbnail';
      isValid = false;
    }
  } else if (step === 3) {
    if (newReel.value.priority < 0) {
      errors.priority = 'La prioridad debe ser un número positivo';
      isValid = false;
    }
  }

  formErrors.value = errors;
  return isValid;
};

const nextStep = () => {
  if (validateStep(currentStep.value)) {
    currentStep.value += 1;
  }
};

const previousStep = () => {
  currentStep.value -= 1;
};

// Handle media upload
const handleMediaUpload = (event) => {
  formErrors.value.media = '';
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    formErrors.value.media = 'El tipo de archivo no es permitido. Selecciona una imagen o video.';
    event.target.value = null;
    return;
  }
  const reader = new FileReader();
  reader.onloadend = () => {
    newReel.value.media = {
      ...newReel.value.media,
      base64: reader.result,
      type: file.type.startsWith('image') ? 'image' : 'video',
      previewUrl: URL.createObjectURL(file),
    };
    newReel.value.mediaType = newReel.value.media.type;
  };
  reader.onerror = (error) => {
    console.error('Error al leer el archivo:', error);
    formErrors.value.media = 'Error al leer el archivo';
    event.target.value = null;
  };
  reader.readAsDataURL(file);
};

// Handle thumbnail upload
const handleThumbnailUpload = (event) => {
  formErrors.value.thumbnail = '';
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    formErrors.value.thumbnail = 'El tipo de archivo no es permitido. Selecciona una imagen.';
    event.target.value = null;
    return;
  }
  const reader = new FileReader();
  reader.onloadend = () => {
    newReel.value.thumbnail = {
      ...newReel.value.thumbnail,
      base64: reader.result,
      previewUrl: URL.createObjectURL(file),
    };
  };
  reader.onerror = (error) => {
    console.error('Error al leer el archivo:', error);
    formErrors.value.thumbnail = 'Error al leer el archivo';
    event.target.value = null;
  };
  reader.readAsDataURL(file);
};

// Save reel
const handleSaveReel = async () => {
  isLoading.value = true;
  try {
    for (let i = 1; i <= steps.value.length; i++) {
      if (!validateStep(i)) {
        currentStep.value = i;
        return;
      }
    }

    const reelData = {
      title: newReel.value.title,
      mediaBase64: newReel.value.media.base64,
      mediaType: newReel.value.mediaType,
      thumbnailBase64: newReel.value.thumbnail.base64,
      isActive: newReel.value.isActive,
      priority: newReel.value.priority,
      mediaUrl: newReel.value.media.url,
      mediaPath: newReel.value.media.path,
      thumbnailUrl: newReel.value.thumbnail.url,
      thumbnailPath: newReel.value.thumbnail.path,
    };

    if (isEditing.value) {
      await updateDefaultReel(newReel.value.idDoc, reelData);
      snackbarStore.show('Reel actualizado exitosamente', 'success');
    } else {
      await saveDefaultReel(reelData);
      snackbarStore.show('Reel creado exitosamente', 'success');
    }
    closeModal();
  } catch (error) {
    console.error('Error al guardar reel:', error);
    snackbarStore.show('Error al guardar reel: ' + error.message, 'error');
  } finally {
    isLoading.value = false;
  }
};

// Delete reel
const deleteReel = async (idDoc) => {
  if (!confirm('¿Estás seguro de que deseas eliminar este reel?')) return;
  try {
    await deleteDefaultReel(idDoc);
    snackbarStore.show('Reel eliminado exitosamente', 'success');
  } catch (error) {
    console.error('Error al eliminar reel:', error);
    snackbarStore.show('Error al eliminar reel: ' + error.message, 'error');
  }
};

// Lifecycle hooks
onMounted(() => {
  reelsStore.subscribeToDefaultReels();
});

onUnmounted(() => {
  reelsStore.unsubscribeFromDefaultReels();
});
</script>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(155, 155, 155, 0.5);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.animate-pulse-step {
  animation: pulseStep 0.5s ease-in-out;
}

@keyframes pulseStep {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.2);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 0 8px rgba(0, 0, 0, 0.1);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
  }
}

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