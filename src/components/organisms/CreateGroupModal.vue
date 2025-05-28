<template>
  <div v-if="visible" class="fixed inset-0 bg-black/60 z-101 flex items-center justify-center p-4">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
      <!-- Encabezado del modal -->
      <div class="sticky top-0 bg-white dark:bg-gray-800 z-10 p-6 border-b flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-300">Crear grupo</h3>
        <button @click="closeModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100">
          <i class="fa-solid fa-xmark w-6 h-6"></i>
        </button>
      </div>

      <!-- Barra de progreso -->
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

        <!-- Contenido del formulario -->
        <form @submit.prevent="handleCreateGroup" class="space-y-6">
          <!-- Paso 1: Información básica -->
          <div v-if="currentStep === 1">
            <!-- Título del Grupo -->
            <div>
              <label for="groupTitle" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                Título del Grupo
              </label>
              <input
                v-model="newGroup.title"
                id="groupTitle"
                type="text"
                placeholder="Ej: Cuidado Animal"
                class="w-full p-3 border hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                :disabled="isLoading"
                required
              />
              <p v-if="formErrors.title" class="text-sm text-red-500 mt-1">{{ formErrors.title }}</p>
            </div>

            <!-- Descripción del Grupo -->
            <div>
              <label for="groupDescription" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                Descripción del Grupo
              </label>
              <textarea
                v-model="newGroup.description"
                id="groupDescription"
                placeholder="Describe brevemente el objetivo o tema principal del grupo"
                class="w-full p-3 hover:bg-gray-100 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent bg-gray-50 text-gray-700 placeholder-gray-400 resize-y min-h-[100px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                :disabled="isLoading"
                required
              ></textarea>
              <p v-if="formErrors.description" class="text-sm text-red-500 mt-1">{{ formErrors.description }}</p>
            </div>
          </div>

          <!-- Paso 2: Multimedia -->
          <div v-if="currentStep === 2">
            <!-- Imagen o Video (opcional) -->
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
                :class="[
                  'w-full p-2 border dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary dark:file:bg-secondary file:text-white hover:file:bg-opacity-90 transition-colors duration-200',
                  formErrors.media ? 'border-red-500' : 'border-gray-300 dark:border-gray-800'
                ]"
              />
              <p v-if="formErrors.media" class="text-red-500 text-sm mt-1">{{ formErrors.media }}</p>
            </div>

            <!-- Previsualización de Media -->
            <div v-if="newGroup.media.url" class="mt-2">
              <img
                v-if="newGroup.media.type === 'image'"
                :src="newGroup.media.url"
                alt="Preview"
                class="w-full h-48 object-cover rounded-lg shadow-sm"
              />
              <video
                v-else-if="newGroup.media.type === 'video'"
                :src="newGroup.media.url"
                controls
                class="w-full h-48 rounded-lg shadow-sm"
              ></video>
            </div>
          </div>

          <!-- Paso 3: Configuración -->
          <div v-if="currentStep === 3">
            <!-- Categorías (opcional) -->
            <div v-if="categories?.length" class="flex flex-wrap gap-3">
              <label
                v-for="category in categories"
                :key="category.id"
                class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer dark:text-gray-100 dark:hover:text-gray-300"
              >
                <input
                  :id="'filter_' + category.id"
                  type="checkbox"
                  v-model="newGroup.categories"
                  :value="category"
                  :disabled="isLoading"
                  class="custom-checkbox hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-800"
                />
                <span class="font-medium">{{ category.name }}</span>
              </label>
              <p v-if="formErrors.categories" class="text-sm text-red-500 mt-1">{{ formErrors.categories }}</p>
            </div>

            <!-- Privacidad (público/privado) -->
            <div class="flex gap-4 items-center mt-4">
              <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-100">
                <input
                  type="radio"
                  value="public"
                  v-model="newGroup.privacy"
                  :disabled="isLoading"
                />
                Público
              </label>
              <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-100">
                <input
                  type="radio"
                  value="private"
                  v-model="newGroup.privacy"
                  :disabled="isLoading"
                />
                Privado
              </label>
              <p v-if="formErrors.privacy" class="text-sm text-red-500 mt-1">{{ formErrors.privacy }}</p>
            </div>
          </div>

          <!-- Botones de navegación -->
          <div class="flex justify-between gap-3 mt-6">
            <button
              v-if="currentStep > 1"
              type="button"
              @click="previousStep"
              :disabled="isLoading"
              class="px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
              class="px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              aria-label="Cancelar edición del perfil"
            >
              <i class="fa-solid fa-times"></i>
              <p class="hidden md:block">Cancelar</p>
            </button>
            
            <button
              v-if="currentStep < steps.length"
              type="button"
              @click="nextStep"
              :disabled="isLoading"
              class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-full hover:bg-primary/90 dark:hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              aria-label="Avanzar al siguiente paso"
            >
              <p class="hidden md:block">Siguiente</p>
              <i class="fa-solid fa-arrow-right"></i>
            </button>
            <button
              v-if="currentStep === steps.length"
              type="submit"
              :disabled="isLoading"
              class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-full hover:bg-primary/90 dark:hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              aria-label="Guardar perfil"
            >
              <span v-if="isLoading">
                <i class="fa-solid fa-spinner animate-spin"></i>
              </span>
              <p class="hidden md:block">
                {{ isLoading ? 'Creando...' : 'Crear' }}
              </p>
              <i v-if="!isLoading" class="fa-solid fa-save"></i>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useMediaUpload } from '../../composable/useMediaUpload';
import { newGuid } from '../../utils/newGuid';
import { useGroupsStore } from '../../stores/groups';
import { useAuth } from '../../api/auth/useAuth';
import { useSnackbarStore } from '../../stores/snackbar';

const emits = defineEmits(['close', 'groupCreated']);
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const { uploadMedia } = useMediaUpload();
const { user } = useAuth();
const groupsStore = useGroupsStore();
const snackbarStore = useSnackbarStore();
const formErrors = ref({});

const isLoading = ref(false);
const currentStep = ref(1);
const steps = ref([
  { label: 'Información' },
  { label: 'Multimedia' },
  { label: 'Configuración' },
]);

const categories = ref([
  { id: 'adopcion', name: 'Adopción' },
  { id: 'cuidado', name: 'Cuidado Animal' },
  { id: 'rescate', name: 'Rescate' },
  { id: 'comunidad', name: 'Comunidad' },
  { id: 'educacion', name: 'Educación' },
  { id: 'otros', name: 'Otros' },
]);

const newGroup = ref({
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

function closeModal() {
  resetForm();
  currentStep.value = 1;
  formErrors.value = {};
  isLoading.value = false;
  emits('close');
}

function resetForm() {
  newGroup.value = {
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
  };
}

function validateStep(step) {
  let isValid = true;
  const errors = {};

  if (step === 1) {
    if (!newGroup.value.title || newGroup.value.title.trim() === '') {
      errors.title = 'El título es obligatorio';
      isValid = false;
    }
    if (!newGroup.value.description) {
      errors.description = 'La descripción es obligatoria';
      isValid = false;
    }
  } else if (step === 2) {
    if (!newGroup.value.media.url) {
      errors.media = 'Debe cargarle una portada al grupo';
      isValid = false;
    }
  } else if (step === 3) {
    if (newGroup.value.categories.length === 0) {
      errors.categories = 'Debes seleccionar al menos una categoría';
      isValid = false;
    }
    if (newGroup.value.privacy !== 'public' && newGroup.value.privacy !== 'private') {
      errors.privacy = 'La privacidad debe ser pública o privada';
      isValid = false;
    }
  }
  
  formErrors.value = errors;
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

async function handleCreateGroup() {
  isLoading.value = true;
  try {
    // Validar todos los pasos
    for (let i = 1; i <= steps.value.length; i++) {
      if (!validateStep(i)) {
        currentStep.value = i;
        return;
      }
    }

    const ownerId = user.value?.uid || user.value?.id || null;
    let updatedPhotoUrl = null;
    let updatedPhotoPath = null;
    if (newGroup.value.newMediaBase64) {
      const dynamicPath = `groups/${ownerId}/${newGuid()}`;
      const { url, path } = await uploadMedia({
        currentUrl: null,
        currentPath: null,
        newMediaBase64: newGroup.value.newMediaBase64,
        mediaType: newGroup.value.media.type,
        dynamicPath,
      });
      updatedPhotoUrl = url;
      updatedPhotoPath = path;
    }
    const groupData = {
      title: newGroup.value.title,
      description: newGroup.value.description,
      media: {
        url: updatedPhotoUrl || null,
        path: updatedPhotoPath || null,
        type: newGroup.value.media.type || null,
      },
      privacy: newGroup.value.privacy,
      categories: newGroup.value.categories,
      ownerId: ownerId,
      admins: [ownerId],
      members: [ownerId],
      rules: '',
      status: 'active',
      // Los timestamps se agregan en el backend/Firebase
    };
    await groupsStore.createGroup(groupData);
    emits('groupCreated', groupData);
    closeModal();
    snackbarStore.show('Grupo creado exitosamente', 'success');
  } catch (error) {
    console.error('Error al crear grupo:', error);
    snackbarStore.show('Error al crear grupo: ' + error.message, 'error');
  } finally {
    isLoading.value = false;
  }
}

function handleMediaUpload(event) {
  formErrors.value.media = '';
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    formErrors.value.media = "El tipo de archivo no es permitido. Selecciona una imagen o video.";
    event.target.value = ''; // Limpiar el input
    return;
  }
  const reader = new FileReader();
  reader.onloadend = () => {
    newGroup.value.newMediaBase64 = reader.result;
    newGroup.value.media = {
      url: URL.createObjectURL(file),
      path: null,
      type: file.type.startsWith('image') ? 'image' : 'video',
    };
  };
  reader.onerror = (error) => {
    console.error('Error al leer el archivo:', error);
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