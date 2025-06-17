<template>
  <div v-if="visible" class="fixed inset-0 bg-black/60 z-101 flex items-center justify-center p-4">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh]">
      <!-- Encabezado del modal -->
      <div class="sticky top-0 bg-white dark:bg-gray-800 z-10 p-6 border-b rounded-t-xl flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-300">Crear evento</h3>
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
        <form @submit.prevent="handleCreateEvent" class="space-y-6">
          <!-- Paso 1: Información básica -->
          <div v-if="currentStep === 1">
            <!-- Título -->
            <div class="mb-4">
              <label for="eventTitle" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                Título del Evento
              </label>
              <input
                v-model="newEvent.title"
                id="eventTitle"
                type="text"
                placeholder="Ej: Exposición de Animales"
                class="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                :disabled="isLoading"
                required
              />
              <p v-if="formErrors.title" class="text-sm text-red-500 mt-1">{{ formErrors.title }}</p>
            </div>

            <!-- Descripción -->
            <div class="mb-4">
              <label for="eventDescription" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                Descripción del Evento
              </label>
              <textarea
                v-model="newEvent.description"
                id="eventDescription"
                placeholder="Describe brevemente el objetivo o tema del evento"
                class="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 resize-y min-h-[100px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                :disabled="isLoading"
                required
              ></textarea>
              <p v-if="formErrors.description" class="text-sm text-red-500 mt-1">{{ formErrors.description }}</p>
            </div>
          </div>

          <!-- Paso 2: Multimedia -->
          <div v-if="currentStep === 2">
            <!-- Imagen o Video -->
            <div class="relative">
              <label for="eventMedia" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                Imagen o Video
              </label>
              <input
                id="eventMedia"
                type="file"
                accept="image/*,video/*"
                @change="handleMediaUpload"
                :class="[
                  'w-full p-2 border dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary dark:file:bg-secondary file:text-white hover:file:bg-opacity-90 transition-colors duration-200',
                  formErrors.media ? 'border-red-500' : 'border-gray-300 dark:border-gray-800'
                ]"
                :disabled="isLoading"
              />
              <!-- Mensaje de error -->
              <p v-if="formErrors.media" class="text-red-500 text-sm mt-1">{{ formErrors.media }}</p>
            </div>

            <!-- Previsualización de Media -->
            <div v-if="newEvent.media" class="mt-2">
              <img
                v-if="newEvent.mediaType === 'image'"
                :src="newEvent.media"
                alt="Preview"
                class="w-full h-48 object-cover rounded-lg shadow-sm"
              />
              <video
                v-else-if="newEvent.mediaType === 'video'"
                :src="newEvent.media"
                controls
                class="w-full h-48 rounded-lg shadow-sm"
              ></video>
            </div>
          </div>

          <!-- Paso 3: Detalles del evento -->
          <div v-if="currentStep === 3">
            <!-- Fecha y Hora de Inicio -->
            <SelectDate
              v-model="newEvent.startTime"
              label="Fecha y Hora de Inicio"
              :disabled="isLoading"
              time-enabled
              required
            />
            <p v-if="formErrors.startTime" class="text-sm text-red-500 mt-1">{{ formErrors.startTime }}</p>
            <!-- Fecha y Hora de Fin -->
            <SelectDate
              v-model="newEvent.endTime"
              label="Fecha y Hora de Fin"
              :disabled="isLoading"
              time-enabled
            />
            <p v-if="formErrors.endTime" class="text-sm text-red-500 mt-1">{{ formErrors.endTime }}</p>
            <!-- Ubicación -->
            <div>
              <label for="eventLocation" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                Ubicación
              </label>
              <GeolocationInput
                v-model="newEvent.location"
                placeholder="Ingresá una dirección"
                :disabled="isLoading"
              />
              <p v-if="formErrors.address" class="text-sm text-red-500 mt-1">{{ formErrors.address }}</p>
            </div>

            <!-- Capacidad -->
            <div>
              <label for="eventCapacity" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                Capacidad
              </label>
              <input
                v-model.number="newEvent.capacity"
                id="eventCapacity"
                type="number"
                min="1"
                placeholder="Número máximo de asistentes"
                class="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                :disabled="isLoading"
              />
              <p v-if="formErrors.capacity" class="text-sm text-red-500 mt-1">{{ formErrors.capacity }}</p>
            </div>
          </div>

          <!-- Paso 4: Configuración adicional -->
          <div v-if="currentStep === 4">
            <!-- Categorías -->
            <div>
              <label for="postCategories" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                Categorías
              </label>
              <multiselect
                v-model="newEvent.categories"
                :options="categories"
                :multiple="true"
                :class="{ 'dark': isDark }"
                placeholder="Seleccionar categorías"
                label="name"
                track-by="id"
                aria-label="Seleccionar categorías"
                :disabled="isLoading"
              ></multiselect>
              <p v-if="formErrors.categories" class="text-sm text-red-500 mt-1">{{ formErrors.categories }}</p>
            </div>
            
            <!-- Modalidad (Presencial/Virtual) -->
            <div class="mt-4">
              <label for="eventModality" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                Modalidad
              </label>
              <select
                v-model="newEvent.modality"
                id="eventModality"
                class="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                :disabled="isLoading"
                required
              >
                <option :value="0">Presencial</option>
                <option :value="1">Virtual</option>
              </select>
              <p v-if="formErrors.modality" class="text-sm text-red-500 mt-1">{{ formErrors.modality }}</p>
            </div>

            <!-- Privacidad -->
            <div class="flex flex-col gap-4 mt-4">
              <fieldset>
                <legend class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Privacidad
                </legend>
                <div class="flex gap-2 ml-1">
                  <div class="flex items-center gap-2">
                    <input
                      type="radio"
                      id="public"
                      name="privacy"
                      value="public"
                      v-model="newEvent.privacy"
                      :disabled="isLoading"
                      class="form-radio text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      for="public"
                      class="text-sm text-gray-700 dark:text-gray-100"
                    >
                      Público
                    </label>
                  </div>
                  <div class="flex items-center gap-2">
                    <input
                      type="radio"
                      id="private"
                      name="privacy"
                      value="private"
                      v-model="newEvent.privacy"
                      :disabled="isLoading"
                      class="form-radio text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      for="private"
                      class="text-sm text-gray-700 dark:text-gray-100"
                    >
                      Privado
                    </label>
                  </div>
                </div>
              </fieldset>
              <p
                v-if="formErrors.privacy"
                id="privacy-error"
                class="text-sm text-red-500 mt-1"
                role="alert"
                aria-live="polite"
              >
                {{ formErrors.privacy }}
              </p>
            </div>

          </div>
          
          

          <!-- Botones de navegación -->
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
              aria-label="Cancelar edición del perfil"
            >
              <i class="fa-solid fa-times"></i>
              <p class="hidden md:block">Cancelar</p>
            </button>
            <button
              v-if="currentStep < steps.length"
              type="button"
              @click="nextStep"
              class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-lg hover:bg-primary/90 dark:hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              aria-label="Avanzar al siguiente paso"
            >
              <p class="hidden md:block">Siguiente</p>
              <i class="fa-solid fa-arrow-right"></i>
            </button>
            <button
              v-if="currentStep === steps.length"
              type="submit"
              :disabled="isLoading"
              class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-lg hover:bg-primary/90 dark:hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              aria-label="Guardar perfil"
            >
              <span v-if="isLoading">
                <i class="fa-solid fa-circle-notch animate-spin"></i>
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
import { ref, computed } from 'vue';
import { useMediaUpload } from '../../composable/useMediaUpload';
import { newGuid } from '../../utils/newGuid';
import { useEventsStore } from '../../stores/events';
import { useAuth } from '../../api/auth/useAuth';
import GeolocationInput from '../atoms/GeolocationInput.vue';
import SelectDate from '../atoms/SelectDate.vue';
import { useSnackbarStore } from '../../stores/snackbar';
import { useThemeStore } from '../../stores/theme';
import { defineAsyncComponent } from 'vue';
import 'vue-multiselect/dist/vue-multiselect.css';

// Import vue-multiselect
const Multiselect = defineAsyncComponent(() => import('vue-multiselect'));

// Theme store for dark mode
const themeStore = useThemeStore();
const isDark = computed(() => themeStore.isDarkMode);
// Define emits and props
const emits = defineEmits(['close', 'eventCreated']);
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});
const { uploadMedia } = useMediaUpload();
const { user } = useAuth();
const eventsStore = useEventsStore();
const snackbarStore = useSnackbarStore();

const isLoading = ref(false);
const currentStep = ref(1);
const formErrors = ref({});
const steps = ref([
  { label: 'Información' },
  { label: 'Multimedia' },
  { label: 'Detalles' },
  { label: 'Configuración' },
]);

const categories = ref([
  { id: 'adopcion', name: 'Adopción' },
  { id: 'educacion', name: 'Educación' },
  { id: 'salud', name: 'Salud y Bienestar' },
  { id: 'recreativo', name: 'Recreativo' },
  { id: 'competencia', name: 'Concursos y Muestras' },
  { id: 'voluntariado', name: 'Voluntariado' },
  { id: 'beneficencia', name: 'Solidarios' },
  { id: 'otros', name: 'Otros' },
]);

const newEvent = ref({
  title: '',
  description: '',
  media: '',
  mediaType: '',
  newMediaBase64: null,
  categories: [],
  privacy: 'public',
  startTime: '',
  endTime: '',
  location: {
    address: '',
    lat: null,
    lng: null,
  },
  capacity: null,
  modality: 0, // Default to Presencial (0)
});

function closeModal() {
  resetForm();
  currentStep.value = 1;
  formErrors.value = {};
  emits('close');
}

function resetForm() {
  newEvent.value = {
    title: '',
    description: '',
    media: '',
    mediaType: '',
    newMediaBase64: null,
    categories: [],
    privacy: 'public',
    startTime: '',
    endTime: '',
    location: { address: '', lat: null, lng: null },
    capacity: null,
    modality: 0, // Reset to Presencial
  };
}

function validateStep(step) {
  let isValid = true;
  const errors = {};
  
  if (step === 1) {
    if (!newEvent.value.title) {
      errors.title = 'El título es obligatorio';
      isValid = false;
    }
    if (!newEvent.value.description) {
      errors.description = 'La descripción es obligatoria';
      isValid = false;
    }
  } else if (step === 2) {
    if (!newEvent.value.media) {
      errors.media = 'Debe cargarle una portada al evento.';
      isValid = false;
    }
  } else if (step === 3) {
    if (!newEvent.value.startTime) {
      errors.startTime = 'La fecha y hora de inicio son obligatorias';
      isValid = false;
    }
    if (newEvent.value.endTime && new Date(newEvent.value.startTime) >= new Date(newEvent.value.endTime)) {
      errors.endTime = 'La fecha y hora de fin deben ser posteriores a la fecha y hora de inicio';
      isValid = false;
    }
    if (newEvent.value.capacity && newEvent.value.capacity < 0) {
      errors.capacity = 'La capacidad debe ser un número positivo';
      isValid = false;
    }
    if (!newEvent.value.location.address) {
      errors.address = 'La ubicación es obligatoria';
      isValid = false;
    }
  } else if (step === 4) {
    if (newEvent.value.categories.length === 0) {
      errors.categories = 'Debes seleccionar al menos una categoría';
      isValid = false;
    }
    if (newEvent.value.categories.length > 3) {
      errors.categories = 'Debes seleccionar como máximo 3 categorías';
      isValid = false;
    }
    if (newEvent.value.privacy !== 'public' && newEvent.value.privacy !== 'private') {
      errors.privacy = 'La privacidad debe ser pública o privada';
      isValid = false;
    }
    if (![0, 1].includes(newEvent.value.modality)) {
      errors.modality = 'La modalidad debe ser Presencial o Virtual';
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

async function handleCreateEvent() {
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
    if (newEvent.value.newMediaBase64) {
      const dynamicPath = `events/${ownerId}/${newGuid()}`;
      const { url, path } = await uploadMedia({
        currentUrl: null,
        currentPath: null,
        newMediaBase64: newEvent.value.newMediaBase64,
        mediaType: newEvent.value.mediaType,
        dynamicPath,
      });
      updatedPhotoUrl = url;
      updatedPhotoPath = path;
    }
    const eventData = {
      title: newEvent.value.title,
      description: newEvent.value.description,
      media: updatedPhotoUrl || null,
      mediaPath: updatedPhotoPath || null,
      mediaType: newEvent.value.mediaType || null,
      categories: newEvent.value.categories,
      privacy: newEvent.value.privacy,
      modality: newEvent.value.modality, // Add modality to eventData
      ownerId: ownerId,
      startTime: newEvent.value.startTime ? new Date(newEvent.value.startTime) : null,
      endTime: newEvent.value.endTime ? new Date(newEvent.value.endTime) : null,
      location: newEvent.value.location,
      capacity: newEvent.value.capacity,
      modality: newEvent.value.modality,
      attendees: {
        going: [ownerId],
        interested: [],
        notInterested: [],
      },
    };
    await eventsStore.createEvent(eventData);
    emits('eventCreated', eventData);
    closeModal();
    snackbarStore.show('Evento creado exitosamente', 'success');
  } catch (error) {
    snackbarStore.show('Error al crear evento:'+error, 'error');
    console.error('Error al crear evento:', error);
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
    newEvent.value.newMediaBase64 = reader.result;
    newEvent.value.media = URL.createObjectURL(file);
    newEvent.value.mediaType = file.type.startsWith('image') ? 'image' : 'video';
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