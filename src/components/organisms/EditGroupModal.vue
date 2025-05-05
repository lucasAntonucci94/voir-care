<template>
  <div v-if="visible" class="fixed inset-0 bg-black/60 z-101 flex items-center justify-center p-4">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-white dark:bg-gray-800 z-10 p-6 border-b flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-300">Editar grupo</h3>
        <button @click="closeModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100">
          <i class="fa-solid fa-xmark w-6 h-6"></i>
        </button>
      </div>

      <!-- Contenido -->
      <div class="p-6">
        <!-- Barra de progreso -->
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

        <!-- Formulario -->
        <form @submit.prevent="handleUpdateGroup" class="space-y-6">
          <!-- Paso 1: Información básica -->
          <div v-if="currentStep === 1">
            <!-- Título -->
            <div>
              <label for="groupTitle" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                Título del Grupo
              </label>
              <input
                v-model="editableGroup.title"
                id="groupTitle"
                type="text"
                class="w-full p-3 border hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                :disabled="isLoading"
                required
              />
            </div>

            <!-- Descripción -->
            <div>
              <label for="groupDescription" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                Descripción del Grupo
              </label>
              <textarea
                v-model="editableGroup.description"
                id="groupDescription"
                class="w-full p-3 hover:bg-gray-100 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 min-h-[100px]"
                :disabled="isLoading"
                required
              ></textarea>
            </div>
          </div>

          <!-- Paso 2: Multimedia -->
          <div v-if="currentStep === 2">
            <!-- Media -->
            <div class="relative">
              <label for="groupMedia" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                Imagen o Video
              </label>
              <input
                id="groupMedia"
                type="file"
                accept="image/*,video/*"
                @change="handleMediaUpload"
                :disabled="isLoading"
                class="w-full p-2.5 hover:bg-gray-100 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary dark:file:bg-secondary file:text-white hover:file:bg-primary-md dark:hover:file:bg-secondary-md transition-all duration-200 cursor-pointer bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              />
            </div>

            <!-- Previsualización -->
            <div v-if="editableGroup.media.url" class="mt-2">
              <img
                v-if="editableGroup.media.type === 'image'"
                :src="editableGroup.media.url"
                class="w-full h-48 object-cover rounded-lg shadow-sm"
              />
              <video
                v-else-if="editableGroup.media.type === 'video'"
                :src="editableGroup.media.url"
                controls
                class="w-full h-48 rounded-lg shadow-sm"
              ></video>
            </div>
          </div>

          <!-- Paso 3: Configuración -->
          <div v-if="currentStep === 3">
            <!-- Categorías -->
            <div v-if="categories?.length" class="flex flex-wrap gap-3">
              <label
                v-for="category in categories"
                :key="category.id"
                class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer dark:text-gray-100 dark:hover:text-gray-300"
              >
                <input
                  type="checkbox"
                  v-model="editableGroup.categories"
                  :value="category"
                  :disabled="isLoading"
                  class="custom-checkbox hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-800"
                />
                <span class="font-medium">{{ category.name }}</span>
              </label>
            </div>

            <!-- Privacidad -->
            <div class="flex gap-4 items-center mt-4">
              <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-100">
                <input type="radio" value="public" v-model="editableGroup.privacy" :disabled="isLoading" />
                Público
              </label>
              <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-100">
                <input type="radio" value="private" v-model="editableGroup.privacy" :disabled="isLoading" />
                Privado
              </label>
            </div>
          </div>

          <!-- Botones de navegación -->
          <div class="flex justify-between gap-3 mt-6">
            <button
              v-if="currentStep > 1"
              type="button"
              @click="previousStep"
              class="px-5 py-2 text-gray-500 dark:text-gray-200 dark:bg-gray-600 font-medium rounded-lg hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-500 transition-all duration-200"
              :disabled="isLoading"
            >
              Atrás
            </button>
            <button
              v-if="currentStep === 1"
              type="button"
              @click="closeModal"
              class="px-5 py-2 text-gray-500 dark:text-gray-200 dark:bg-gray-600 font-medium rounded-lg hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-500 transition-all duration-200"
              :disabled="isLoading"
            >
              Cancelar
            </button>
            <div class="flex-1"></div>
            <button
              v-if="currentStep < steps.length"
              type="button"
              @click="nextStep"
              class="px-5 py-2 bg-primary dark:bg-secondary text-white font-medium rounded-lg hover:bg-primary-md dark:hover:bg-secondary-md transition-all duration-200 shadow-md hover:shadow-lg"
              :disabled="isLoading"
            >
              Siguiente
            </button>
            <button
              v-if="currentStep === steps.length"
              type="submit"
              class="relative px-5 py-2 bg-primary dark:bg-secondary text-white font-medium rounded-lg hover:bg-primary-md dark:hover:bg-secondary-md transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-primary-md dark:disabled:bg-secondary-md disabled:cursor-not-allowed"
              :disabled="isLoading"
            >
              <span v-if="!isLoading">Guardar Cambios</span>
              <span v-else class="flex items-center gap-2">
                <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Guardando...
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useMediaUpload } from '../../composable/useMediaUpload';
import { useGroupsStore } from '../../stores/groups';

const props = defineProps({
  visible: Boolean,
  group: Object,
});
const emits = defineEmits(['close', 'groupUpdated']);

const { uploadMedia } = useMediaUpload();
const groupsStore = useGroupsStore();

const isLoading = ref(false);
const errorFileMessage = ref('');
const currentStep = ref(1);
const steps = ref([
  { label: 'Información' },
  { label: 'Multimedia' },
  { label: 'Configuración' },
]);

const categories = ref([
  { id: 'cuidado', name: 'Cuidado Animal' },
  { id: 'rescate', name: 'Rescate' },
  { id: 'comunidad', name: 'Comunidad' },
  { id: 'educacion', name: 'Educación' },
  { id: 'otros', name: 'Otros' },
]);

const editableGroup = ref({
  title: '',
  description: '',
  media: {
    url: '',
    path: null,
    type: null,
  },
  newMediaBase64: null,
  categories: [],
  privacy: 'public',
});

watch(
  () => props.group,
  (group) => {
    if (group) {
      editableGroup.value = {
        title: group.title,
        description: group.description,
        media: { ...group.media },
        newMediaBase64: null,
        categories: group.categories,
        privacy: group.privacy,
      };
    }
  },
  { immediate: true }
);

function closeModal() {
  currentStep.value = 1;
  emits('close');
}

function validateStep(step) {
  let isValid = true;

  if (step === 1) {
    if (!editableGroup.value.title || editableGroup.value.title.trim() === '') {
      alert('El título es obligatorio');
      isValid = false;
    }
    if (!editableGroup.value.description) {
      alert('La descripción es obligatoria');
      isValid = false;
    }
  } else if (step === 2) {
    // Media is optional, no validation required
  } else if (step === 3) {
    if (editableGroup.value.categories.length === 0) {
      alert('Selecciona al menos una categoría');
      isValid = false;
    }
  }

  return isValid;
}

function nextStep() {
  if (validateStep(currentStep.value)) {
    currentStep.value += 1;
  }
}

function previousStep() {
  currentStep.value -= 1;
}

async function handleUpdateGroup() {
  isLoading.value = true;
  try {
    // Validate all steps
    for (let i = 1; i <= steps.value.length; i++) {
      if (!validateStep(i)) {
        currentStep.value = i;
        return;
      }
    }

    let updatedUrl = editableGroup.value.media.url;
    let updatedPath = editableGroup.value.media.path;
    if (editableGroup.value.newMediaBase64) {
      const { url, path } = await uploadMedia({
        currentUrl: editableGroup.value.media.url,
        currentPath: editableGroup.value.media.path,
        newMediaBase64: editableGroup.value.newMediaBase64,
        mediaType: editableGroup.value.media.type,
        dynamicPath: `groups/${props.group.ownerId}/${props.group.id}`,
      });
      updatedUrl = url;
      updatedPath = path;
    }

    const updatedGroupData = {
      ...props.group,
      title: editableGroup.value.title,
      description: editableGroup.value.description,
      media: {
        url: updatedUrl,
        path: updatedPath,
        type: editableGroup.value.media.type,
      },
      categories: editableGroup.value.categories,
      privacy: editableGroup.value.privacy,
    };

    await groupsStore.editGroup(props.group.idDoc, updatedGroupData);
    emits('groupUpdated', updatedGroupData);
    closeModal();
  } catch (err) {
    console.error('Error al actualizar grupo:', err);
    alert('Error al actualizar grupo: ' + err.message);
  } finally {
    isLoading.value = false;
  }
}

function handleMediaUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    errorFileMessage.value = "Tipo de archivo no permitido.";
    event.target.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onloadend = () => {
    editableGroup.value.newMediaBase64 = reader.result;
    editableGroup.value.media = {
      url: URL.createObjectURL(file),
      path: null,
      type: file.type.startsWith('image') ? 'image' : 'video',
    };
  };
  reader.readAsDataURL(file);
}
</script>

<style scoped>
/* Oculta scrollbars en los contenedores scrollables */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Estilos para el scroll del modal */
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

/* Animación para los pasos del stepper */
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
</style>