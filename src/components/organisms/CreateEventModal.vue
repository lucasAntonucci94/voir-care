<template>
  <div v-if="visible" class="fixed inset-0 bg-black/60 z-101 flex items-center justify-center p-4">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
      <!-- Encabezado del modal -->
      <div class="sticky top-0 bg-white dark:bg-gray-800 z-10 p-6 border-b flex items-center justify-between">
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
            <div>
              <label for="eventTitle" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
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
            </div>

            <!-- Descripción -->
            <div>
              <label for="eventDescription" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
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
                  errorFileMessage ? 'border-red-500' : 'border-gray-300 dark:border-gray-800'
                ]"
                :disabled="isLoading"
                required
              />
              <!-- Mensaje de error -->
              <p v-if="errorFileMessage" class="text-red-500 text-sm mt-1">{{ errorFileMessage }}</p>
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
            <!-- Fecha y Hora de Fin (opcional) -->
            <SelectDate
              v-model="newEvent.endTime"
              label="Fecha y Hora de Fin"
              :disabled="isLoading"
              time-enabled
            />
            <!-- Ubicación -->
            <div>
              <label for="eventLocation" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                Ubicación
              </label>
              <GeolocationInput
                v-model="newEvent.location"
                placeholder="Ingresá una dirección"
              />
            </div>

            <!-- Capacidad -->
            <div>
              <label for="eventCapacity" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                Capacidad
              </label>
              <input
                v-model.number="newEvent.capacity"
                id="eventCapacity"
                type="number"
                placeholder="Número máximo de asistentes"
                class="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 transition-all duration-200"
                :disabled="isLoading"
              />
            </div>
          </div>

          <!-- Paso 4: Configuración adicional -->
          <div v-if="currentStep === 4">
            <!-- Categorías -->
            <div v-if="categories?.length" class="flex flex-wrap gap-3">
              <label
                v-for="category in categories"
                :key="category.id"
                class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer dark:text-gray-100"
              >
                <input
                  :id="'filter_' + category.id"
                  type="checkbox"
                  v-model="newEvent.categories"
                  :value="category"
                  :disabled="isLoading"
                  class="custom-checkbox"
                />
                <span class="font-medium">{{ category.name }}</span>
              </label>
            </div>

            <!-- Privacidad -->
            <div class="flex gap-4 items-center mt-4">
              <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-100">
                <input
                  type="radio"
                  value="public"
                  v-model="newEvent.privacy"
                  :disabled="isLoading"
                />
                Público
              </label>
              <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-100">
                <input
                  type="radio"
                  value="private"
                  v-model="newEvent.privacy"
                  :disabled="isLoading"
                />
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
              <span v-if="!isLoading">Crear Evento</span>
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
import { ref } from 'vue';
import { useMediaUpload } from '../../composable/useMediaUpload';
import { newGuid } from '../../utils/newGuid';
import { useEventsStore } from '../../stores/events';
import { useAuth } from '../../api/auth/useAuth';
import GeolocationInput from '../atoms/GeolocationInput.vue';
import SelectDate from '../atoms/SelectDate.vue';

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
const errorFileMessage = ref('');

const isLoading = ref(false);
const currentStep = ref(1);
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
});

function closeModal() {
  resetForm();
  errorFileMessage.value = '';
  currentStep.value = 1;
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
  };
}

function validateStep(step) {
  let isValid = true;

  if (step === 1) {
    if (!newEvent.value.title) {
      alert('El título es obligatorio');
      isValid = false;
    }
    if (!newEvent.value.description) {
      alert('La descripción es obligatoria');
      isValid = false;
    }
  } else if (step === 2) {
    if (!newEvent.value.media) {
      alert('Debe cargarle una portada al evento.');
      isValid = false;
    }
  } else if (step === 3) {
    if (!newEvent.value.startTime) {
      alert('La fecha y hora de inicio son obligatorias');
      isValid = false;
    }
    if (newEvent.value.endTime && new Date(newEvent.value.startTime) >= new Date(newEvent.value.endTime)) {
      alert('La fecha y hora de fin deben ser posteriores a la fecha y hora de inicio');
      isValid = false;
    }
    if (newEvent.value.capacity && newEvent.value.capacity < 0) {
      alert('La capacidad debe ser un número positivo');
      isValid = false;
    }
    if (!newEvent.value.location.address) {
      alert('La ubicación es obligatoria');
      isValid = false;
    }
  } else if (step === 4) {
    if (newEvent.value.categories.length === 0) {
      alert('Debes seleccionar al menos una categoría');
      isValid = false;
    }
    if (newEvent.value.privacy !== 'public' && newEvent.value.privacy !== 'private') {
      alert('La privacidad debe ser pública o privada');
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
      ownerId: ownerId,
      startTime: newEvent.value.startTime ? new Date(newEvent.value.startTime) : null,
      endTime: newEvent.value.endTime ? new Date(newEvent.value.endTime) : null,
      location: newEvent.value.location,
      capacity: newEvent.value.capacity,
      attendees: {
        going: [ownerId],
        interested: [],
        notInterested: [],
      },
    };
    await eventsStore.createEvent(eventData);
    emits('eventCreated', eventData);
    closeModal();
  } catch (error) {
    console.error('Error al crear evento:', error);
    alert('Error al crear evento: ' + error);
  } finally {
    isLoading.value = false;
  }
}

function handleMediaUpload(event) {
  errorFileMessage.value = '';
  const file = event.target.files[0];

  if (!file) return;
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    errorFileMessage.value = "El tipo de archivo no es permitido. Selecciona una imagen o video.";
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