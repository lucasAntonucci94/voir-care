<template>
  <div v-if="visible" class="fixed inset-0 bg-black/60 z-101 flex items-center justify-center p-4">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
      <!-- Encabezado del modal -->
      <div class="sticky top-0 bg-white dark:bg-gray-800 z-10 p-6 border-b flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-300">Crear Nuevo Lugar</h3>
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
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Paso 1: Información básica -->
          <div v-if="currentStep === 1">
            <!-- Título -->
            <div>
              <label for="title" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Título</label>
              <input
                v-model="newLocation.title"
                id="title"
                type="text"
                placeholder="Ej: Leocan Veterinaria"
                class="w-full p-3 border hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                :disabled="isSubmitting"
                required
              />
              <p v-if="errors.title" class="text-sm text-red-500 mt-1">{{ errors.title }}</p>
            </div>

            <!-- Descripción -->
            <div>
              <label for="description" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Descripción</label>
              <textarea
                v-model="newLocation.description"
                id="description"
                placeholder="Describe el lugar (horarios, servicios, etc.)"
                class="w-full p-3 hover:bg-gray-100 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent bg-gray-50 text-gray-700 placeholder-gray-400 resize-y min-h-[100px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                :disabled="isSubmitting"
                required
              ></textarea>
              <p v-if="errors.description" class="text-sm text-red-500 mt-1">{{ errors.description }}</p>
            </div>

            <!-- Tipo -->
            <div>
              <label for="type" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Tipo</label>
              <select
                v-model="newLocation.type"
                id="type"
                class="w-full p-3 border hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                :disabled="isSubmitting"
                required
              >
                <option value="" disabled>Selecciona un tipo</option>
                <option v-for="type in locationTypes" :key="type.id" :value="type.id">{{ type.label }}</option>
              </select>
              <p v-if="errors.type" class="text-sm text-red-500 mt-1">{{ errors.type }}</p>
            </div>
          </div>

          <!-- Paso 2: Ubicación y contacto -->
          <div v-if="currentStep === 2">
            <!-- Dirección con GeolocationInput -->
            <div class="mb-4">
              <label for="location" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Dirección</label>
              <GeolocationInput
                v-model="locationInput"
                placeholder="Ingresá una dirección"
                class="w-full"
                :disabled="isSubmitting"
              />
              <p v-if="locationError" class="text-sm text-red-500 mt-2">{{ locationError }}</p>
            </div>

            <!-- Teléfono -->
            <div>
              <PhoneInput
                v-model="newLocation.contact.phone"
                label="Teléfono"
                id="phone"
                :error="errors.phone"
                :disabled="isSubmitting"
              />
            </div>
          </div>

          <!-- Paso 3: Multimedia y confirmación -->
          <div v-if="currentStep === 3">
            <!-- Imagen o Video -->
            <div>
              <label for="media" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Imagen o Video (opcional)</label>
              <input
                id="media"
                type="file"
                accept="image/*,video/*"
                @change="handleMediaUpload"
                :disabled="isSubmitting"
                class="w-full p-2.5 hover:bg-gray-100 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary dark:file:bg-secondary file:text-white hover:file:bg-primary-md dark:hover:file:bg-secondary-md transition-all duration-200 cursor-pointer bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
              />
              <p v-if="errorFileMessage" class="text-sm text-red-500 mt-2">{{ errorFileMessage }}</p>
            </div>

            <!-- Previsualización de Media -->
            <div v-if="newLocation.media.url" class="mt-2">
              <img
                v-if="newLocation.media.type === 'image'"
                :src="newLocation.media.url"
                alt="Preview"
                class="w-full h-48 object-cover rounded-lg shadow-sm"
              />
              <video
                v-else-if="newLocation.media.type === 'video'"
                :src="newLocation.media.url"
                controls
                class="w-full h-48 rounded-lg shadow-sm"
              ></video>
            </div>
          </div>

          <!-- Botones de navegación -->
          <div class="flex justify-between gap-3 mt-6">
            <button
              v-if="currentStep > 1"
              type="button"
              @click="previousStep"
              class="px-5 py-2 text-gray-500 dark:text-gray-200 dark:bg-gray-600 font-medium rounded-lg hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-500 transition-all duration-200"
              :disabled="isSubmitting"
            >
              Atrás
            </button>
            <button
              v-if="currentStep === 1"
              type="button"
              @click="closeModal"
              class="px-5 py-2 text-gray-500 dark:text-gray-200 dark:bg-gray-600 font-medium rounded-lg hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-500 transition-all duration-200"
              :disabled="isSubmitting"
            >
              Cancelar
            </button>
            <button
              v-if="currentStep < 3"
              type="button"
              @click="nextStep"
              class="px-5 py-2 bg-primary dark:bg-secondary text-white font-medium rounded-lg hover:bg-primary-md dark:hover:bg-secondary-md transition-all duration-200 shadow-md hover:shadow-lg"
              :disabled="isSubmitting"
            >
              Siguiente
            </button>
            <button
              v-if="currentStep === 3"
              type="submit"
              class="relative px-5 py-2 bg-primary dark:bg-secondary text-white font-medium rounded-lg hover:bg-primary-md dark:hover:bg-secondary-md transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-primary-md dark:disabled:bg-secondary-md disabled:cursor-not-allowed"
              :disabled="isSubmitting"
            >
              <span v-if="!isSubmitting">Crear Lugar</span>
              <span v-else class="flex items-center gap-2">
                <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Creando...
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
import { newGuid } from '../../utils/newGuid';
import { useLocationsStore } from '../../stores/locations';
import { useAuth } from '../../api/auth/useAuth';
import GeolocationInput from '../atoms/GeolocationInput.vue';
import PhoneInput from '../atoms/PhoneInput.vue';
import { useSnackbarStore } from '../../stores/snackbar';

const emits = defineEmits(['close', 'locationCreated']);
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});
const { uploadMedia } = useMediaUpload();
const { user } = useAuth();
const locationsStore = useLocationsStore();
const snackbarStore = useSnackbarStore();

const isSubmitting = ref(false);
const errorFileMessage = ref('');
const locationError = ref('');
const currentStep = ref(1);
const errors = ref({});

// Definición de los pasos
const steps = ref([
  { label: 'Información' },
  { label: 'Ubicación' },
  { label: 'Multimedia' },
]);

const locationTypes = ref([
  { id: 'parque', label: 'Parque' },
  { id: 'veterinaria', label: 'Veterinaria' },
  { id: 'petshop', label: 'Pet Shop' },
  { id: 'guarderia', label: 'Guardería' },
  { id: 'petfriendly', label: 'Pet Friendly' },
  { id: 'paseador', label: 'Paseador' },
  { id: 'entrenador', label: 'Entrenador' },
]);

const newLocation = ref({
  id: newGuid(),
  title: '',
  description: '',
  address: {
    street: '',
    coordinates: {
      lat: null,
      lng: null,
    },
  },
  type: '',
  contact: {
    phone: '',
    socialNetworkLink: null,
  },
  media: {
    url: '',
    path: '',
    imageBase64: null,
    type: '',
  },
  timestamp: '',
  pending: false,
});

// Variable para GeolocationInput
const locationInput = ref({
  address: '',
  lat: null,
  lng: null,
});

// Sincronizar locationInput con newLocation.address
watch(locationInput, (newVal) => {
  newLocation.value.address.street = newVal.address || '';
  newLocation.value.address.coordinates.lat = newVal.lat;
  newLocation.value.address.coordinates.lng = newVal.lng;
  // Limpiar error si hay una dirección válida
  if (newVal.address && newVal.lat !== null && newVal.lng !== null) {
    locationError.value = '';
  }
}, { deep: true });

// Sincronizar en la dirección opuesta (si newLocation.address cambia)
watch(() => newLocation.value.address, (newVal) => {
  locationInput.value = {
    address: newVal.street,
    lat: newVal.coordinates.lat,
    lng: newVal.coordinates.lng,
  };
}, { deep: true });

function closeModal() {
  resetForm();
  errorFileMessage.value = '';
  locationError.value = '';
  currentStep.value = 1;
  errors.value = {};
  emits('close');
}

function resetForm() {
  newLocation.value = {
    id: newGuid(),
    title: '',
    description: '',
    address: {
      street: '',
      coordinates: {
        lat: null,
        lng: null,
      },
    },
    type: '',
    contact: {
      phone: '',
      socialNetworkLink: null,
    },
    media: {
      url: '',
      path: '',
      imageBase64: null,
      type: '',
    },
    timestamp: '',
    pending: false,
  };
  locationInput.value = {
    address: '',
    lat: null,
    lng: null,
  };
}

function handleMediaUpload(event) {
  errorFileMessage.value = '';
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    errorFileMessage.value = 'El tipo de archivo no es permitido. Selecciona una imagen o video.';
    event.target.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onloadend = () => {
    newLocation.value.media = {
      url: URL.createObjectURL(file),
      path: null,
      type: file.type.startsWith('image') ? 'image' : 'video',
    };
    newLocation.value.media.imageBase64 = reader.result;
  };
  reader.onerror = (error) => {
    console.error('Error al leer el archivo:', error);
    errorFileMessage.value = 'Error al leer el archivo.';
  };
  reader.readAsDataURL(file);
}

function validateStep(step) {
  errors.value = {};
  let isValid = true;

  if (step === 1) {
    if (!newLocation.value.title || newLocation.value.title.trim() === '') {
      errors.value.title = 'El título es obligatorio';
      isValid = false;
    }
    if (!newLocation.value.description) {
      errors.value.description = 'La descripción es obligatoria';
      isValid = false;
    }
    if (!newLocation.value.type) {
      errors.value.type = 'El tipo es obligatorio';
      isValid = false;
    }
  } else if (step === 2) {
    if (!newLocation.value.address.street) {
      locationError.value = 'La dirección es obligatoria';
      isValid = false;
    }
    if (newLocation.value.address.coordinates.lat === null || isNaN(newLocation.value.address.coordinates.lat)) {
      locationError.value = 'La latitud es obligatoria y debe ser un número válido';
      isValid = false;
    }
    if (newLocation.value.address.coordinates.lng === null || isNaN(newLocation.value.address.coordinates.lng)) {
      locationError.value = 'La longitud es obligatoria y debe ser un número válido';
      isValid = false;
    }
    if (!newLocation.value.contact.phone || newLocation.value.contact.phone.trim() === '') {
      errors.value.phone = 'El teléfono es obligatorio';
      isValid = false;
    }
  }
  // Paso 3 no requiere validación, ya que la multimedia es opcional

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

async function handleSubmit() {
  isSubmitting.value = true;
  try {
    // Validar todos los pasos
    if (!validateStep(1) || !validateStep(2)) {
      currentStep.value = 1; // Volver al primer paso con errores
      return;
    }

    // Obtener el ID del usuario autenticado
    const ownerId = user.value?.uid || user.value?.id || null;

    // Subir el archivo multimedia si existe
    let updatedMedia = {
      url: null,
      path: null,
      type: null,
    };

    if (newLocation.value.media.imageBase64) {
      const dynamicPath = `locations/${ownerId}/${newGuid()}`;
      const { url, path } = await uploadMedia({
        currentUrl: null,
        currentPath: null,
        newMediaBase64: newLocation.value.media.imageBase64,
        mediaType: newLocation.value.media.type,
        dynamicPath,
      });
      updatedMedia = {
        url,
        path,
        type: newLocation.value.media.type,
      };
    }

    // Preparar los datos para Firestore
    const locationData = {
      id: newLocation.value.id,
      title: newLocation.value.title,
      description: newLocation.value.description,
      address: {
        street: newLocation.value.address.street,
        coordinates: {
          lat: newLocation.value.address.coordinates.lat,
          lng: newLocation.value.address.coordinates.lng,
        },
      },
      type: newLocation.value.type,
      contact: {
        phone: newLocation.value.contact.phone || null,
        socialNetworkLink: newLocation.value.contact.socialNetworkLink,
      },
      media: updatedMedia,
      timestamp: newLocation.value.timestamp,
      pending: newLocation.value.pending,
      user: {
        id: ownerId,
        displayName: user.value?.displayName,
        email: user.value?.email,
        photoURLFile: user.value?.photoURLFile,
      },
    };

    // Guardar en Firestore
    await locationsStore.addLocation(locationData);
    closeModal();
    snackbarStore.show('Lugar creado exitosamente', 'success');
  } catch (error) {
    console.error('Error al crear location:', error);
    snackbarStore.show('Error al crear el lugar. Por favor, intenta nuevamente.', 'error');
  } finally {
    isSubmitting.value = false;
  }
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