<template>
  <div v-if="visible" role="dialog" aria-modal="true" aria-labelledby="modal-title" class="fixed inset-0 bg-black/60 z-101 flex items-center justify-center p-4">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh]">
      <!-- Encabezado del modal -->
      <div class="sticky top-0 bg-white rounded-t-xl dark:bg-gray-800 z-10 p-6 border-b flex items-center justify-between">
        <h3 id="modal-title" class="text-lg font-semibold text-gray-800 dark:text-gray-300">Editar Evento</h3>
        <button @click="closeModal" aria-label="Cerrar modal" class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100">
          <i class="fa-solid fa-xmark w-6 h-6"></i>
        </button>
      </div>

      <!-- Contenido del modal -->
      <div class="p-6">
        <!-- Barra de progreso -->
        <div class="flex justify-center mb-6">
          <div class="flex items-center space-x-2" role="group" aria-label="Pasos de edición">
            <div v-for="(step, index) in steps" :key="index" class="relative flex items-center">
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all duration-300"
                :class="{
                  'bg-primary dark:bg-secondary text-white animate-pulse-step': currentStep === index + 1,
                  'bg-primary text-white': currentStep > index + 1,
                  'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300': currentStep < index + 1,
                }"
                :aria-current="currentStep === index + 1 ? 'step' : undefined"
                :aria-label="`Paso ${index + 1}: ${step.label}`"
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
            <div class="mb-4">
              <label for="eventTitle" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                Título del Evento
              </label>
              <input
                v-model="editForm.title"
                id="eventTitle"
                ref="titleInputRef"
                type="text"
                placeholder="Ej: Exposición de Animales"
                class="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                :class="formErrors.title ? 'border-red-500' : ''"
                aria-describedby="title-error"
                :aria-invalid="formErrors.title ? 'true' : 'false'"
                aria-required="true"
                minlength="1"
                maxlength="50"
                :disabled="isLoading"
                required
              />
              <p v-if="formErrors.title" id="title-error" role="alert" class="text-sm text-red-500 mt-1">{{ formErrors.title }}</p>
            </div>

            <!-- Descripción -->
            <div class="mb-4">
              <label for="eventDescription" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                Descripción del Evento
              </label>
              <textarea
                v-model="editForm.description"
                id="eventDescription"
                placeholder="Describe brevemente el objetivo o tema del evento"
                class="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 resize-y min-h-[100px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                :class="formErrors.description ? 'border-red-500' : ''"
                aria-describedby="description-error"
                :aria-invalid="formErrors.description ? 'true' : 'false'"
                aria-required="true"
                :minlength="10"
                :maxlength="500"
                :disabled="isLoading"
                required
              ></textarea>
              <p v-if="formErrors.description" id="description-error" role="alert" aria-live="polite" class="text-sm text-red-500 mt-1">{{ formErrors.description }}</p>
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
                aria-describedby="media-error"
                :aria-invalid="formErrors.media ? 'true' : 'false'"
                aria-required="false"
                required
              />
              <!-- Mensaje de error -->
              <p v-if="formErrors.media" id="media-error" role="alert" aria-live="polite" class="text-red-500 text-sm mt-1">{{ formErrors.media }}</p>
            </div>

            <!-- Previsualización de Media -->
            <div v-if="editForm.media" class="mt-2">
              <img
                v-if="editForm.mediaType === 'image'"
                :src="editForm.media"
                alt="Preview"
                class="w-full h-48 object-cover rounded-lg shadow-sm"
                :aria-label="`Previsualización de ${editForm.mediaType}`"
                :class="formErrors.media ? 'border-red-500' : ''"
                aria-describedby="groupMediaError"
                :aria-invalid="formErrors.media ? 'true' : 'false'"
                aria-required="false"
                aria-label="Previsualización de imagen"
                @contextmenu.prevent
                @dragover.prevent
                @drop.prevent
                @dragenter.prevent
                @dragleave.prevent
                @dragstart.prevent
                @dragend.prevent
                @drag="event => event.preventDefault()"
                @dragenter="event => event.preventDefault()"
                @dragleave="event => event.preventDefault()"
                @dragover="event => event.preventDefault()"
                @dragend="event => event.preventDefault()"
                @dragstart="event => event.preventDefault()"
              />
              <video
                v-else-if="editForm.mediaType === 'video'"
                :src="editForm.media"
                class="w-full h-48 rounded-lg shadow-sm"
                autoplay
                loop
                muted
                :aria-label="`Previsualización de ${editForm.mediaType}`"
                :poster="editForm.media"
                @error="formErrors.media = 'Error al cargar el video. Asegúrate de que sea un formato compatible.'"
                aria-describedby="groupMediaError"
                :aria-invalid="formErrors.media ? 'true' : 'false'"
                aria-required="false"
                :class="formErrors.media ? 'border-red-500' : ''"
                style="object-fit: cover;"
                aria-label="Previsualización de video"
                @contextmenu.prevent
                @dragover.prevent
                @drop.prevent
                @dragenter.prevent
                @dragleave.prevent
                @dragstart.prevent
                @dragend.prevent
                @drag="event => event.preventDefault()"
                @dragenter="event => event.preventDefault()"
                @dragleave="event => event.preventDefault()"
                @dragover="event => event.preventDefault()"
                @dragend="event => event.preventDefault()"
                @dragstart="event => event.preventDefault()"
              ></video>
            </div>
          </div>

          <!-- Paso 3: Fechas y Horas -->
          <div v-if="currentStep === 3">
            <!-- Fecha y Hora de Inicio -->
            <SelectDate
              v-model="editForm.startTime"
              label="Fecha y Hora de Inicio"
              :disabled="isLoading"
              time-enabled
              required
              :error="formErrors.startTime"
            />
            <!-- Fecha y Hora de Fin -->
            <SelectDate
              v-model="editForm.endTime"
              label="Fecha y Hora de Fin"
              :disabled="isLoading"
              time-enabled
              :error="formErrors.endTime"
            />
          </div>

          <!-- Paso 4: Modalidad, Ubicación/Link y Capacidad -->
          <div v-if="currentStep === 4">
            <!-- Modalidad (Presencial/Virtual) -->
            <div class="mb-4">
              <label for="eventModality" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                Modalidad
              </label>
              <select
                v-model="editForm.modality"
                id="eventModality"
                class="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                :disabled="isLoading"
                aria-describedby="modality-error"
                :aria-invalid="formErrors.modality ? 'true' : 'false'"
                aria-required="true"
                aria-label="Seleccionar modalidad del evento"
                required
              >
                <option :value="0">Presencial</option>
                <option :value="1">Virtual</option>
              </select>
              <p v-if="formErrors.modality" id="modality-error" role="alert" aria-live="polite" class="text-sm text-red-500 mt-1">{{ formErrors.modality }}</p>
            </div>

            <!-- Ubicación (si es Presencial) -->
            <div v-if="editForm.modality === 0" class="mb-4">
              <label for="eventLocation" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                Ubicación
              </label>
              <GeolocationInput
                v-model="editForm.location"
                placeholder="Ingresá una dirección"
                :disabled="isLoading"
                :error="formErrors.address"
              />
              <p v-if="formErrors.address" id="address-error" role="alert" aria-live="polite" class="text-sm text-red-500 mt-1">{{ formErrors.address }}</p>
            </div>

            <!-- Link del Meet (si es Virtual) -->
            <div v-if="editForm.modality === 1" class="mb-4">
              <label for="eventMeetLink" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                Link del Meet
              </label>
              <input
                v-model="editForm.meetLink"
                id="eventMeetLink"
                type="url"
                placeholder="Ej: https://meet.google.com/abc-xyz"
                class="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                :class="formErrors.meetLink ? 'border-red-500' : ''"
                aria-describedby="meetlink-error"
                :aria-invalid="formErrors.meetLink ? 'true' : 'false'"
                aria-required="true"
                :disabled="isLoading"
                required
              />
              <p v-if="formErrors.meetLink" id="meetlink-error" role="alert" class="text-sm text-red-500 mt-1">{{ formErrors.meetLink }}</p>
            </div>

            <!-- Capacidad -->
            <div>
              <label for="eventCapacity" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                Capacidad
              </label>
              <input
                v-model.number="editForm.capacity"
                id="eventCapacity"
                type="number"
                min="1"
                placeholder="Número máximo de asistentes"
                class="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                :class="formErrors.capacity ? 'border-red-500' : ''"
                :disabled="isLoading"
                aria-describedby="capacity-error"
                :aria-invalid="formErrors.capacity ? 'true' : 'false'"
                aria-required="false"
                required
                minlength="1"
                maxlength="5"
                pattern="^[1-9][0-9]{0,4}$"
                @input="editForm.capacity = editForm.capacity ? Math.max(1, editForm.capacity) : null"
              />
              <p v-if="formErrors.capacity" id="capacity-error" role="alert" aria-live="polite" class="text-sm text-red-500 mt-1">{{ formErrors.capacity }}</p>
            </div>
          </div>

          <!-- Paso 5: Configuración adicional (Categorías y Privacidad) -->
          <div v-if="currentStep === 5">
            <!-- Categorías -->
            <div>
              <label for="eventCategories" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                Categorías
              </label>
              <multiselect
                v-model="editForm.categories"
                :options="categories"
                :multiple="true"
                :class="{ 'dark': isDark }"
                placeholder="Seleccionar categorías"
                label="name"
                track-by="id"
                aria-label="Seleccionar categorías"
                :disabled="isLoading"
                :aria-invalid="formErrors.categories ? 'true' : 'false'"
                :aria-describedby="formErrors.categories ? 'categories-error' : null"
                :aria-required="true"
                :aria-label="`Selecciona al menos una categoría`"
                :show-labels="false"
                :close-on-select="true"
                :allow-empty="false"
                :max-height="200"
                :show-no-results="false"
                :searchable="true"
                :loading="isLoading"
                role="listbox"  
                aria-multiselectable="true"
                aria-describedby="categories-error"
              ></multiselect>
              <p v-if="formErrors.categories" id="categories-error" role="alert" aria-live="polite" class="text-sm text-red-500 mt-1">{{ formErrors.categories }}</p>
            </div>
            
            <!-- Privacidad -->
            <div class="flex flex-col gap-4 mt-4">
              <fieldset>
                <legend class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Privacidad del Evento
                </legend>
                <div class="flex gap-2 ml-1">
                  <div class="flex items-center gap-2">
                    <input
                      v-model="editForm.privacy"
                      type="radio"
                      id="public"
                      name="privacy"
                      value="public"
                      :disabled="isLoading"
                      class="form-radio text-blue-600 focus:ring-blue-500"
                      aria-describedby="privacy-error"
                      :aria-invalid="formErrors.privacy ? 'true' : 'false'"
                      aria-required="true"
                      aria-label="Seleccionar privacidad pública del evento" 
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
                      v-model="editForm.privacy"
                      type="radio"
                      id="private"
                      name="privacy"
                      value="private"
                      :disabled="isLoading"
                      class="form-radio text-primary focus:ring-primary-md"
                      aria-describedby="privacy-error"
                      :aria-invalid="formErrors.privacy ? 'true' : 'false'"
                      aria-required="true"
                      aria-label="Seleccionar privacidad privada del evento" 
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
                v-if="formErrors.privacy" id="privacy-error" role="alert" aria-live="polite"class=" text-sm text-red-500 mt-1" >
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
              aria-label="Cancelar edición del evento"
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
              aria-label="Guardar evento"
            >
              <span v-if="isLoading">
                <i class="fa-solid fa-circle-notch animate-spin"></i>
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
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue';
import GeolocationInput from '../atoms/GeolocationInput.vue';
import { useEventsStore } from '../../stores/events';
import { useMediaUpload } from '../../composable/useMediaUpload';
import { newGuid } from '../../utils/newGuid';
import { useAuth } from '../../api/auth/useAuth';
import SelectDate from '../atoms/SelectDate.vue';
import { useSnackbarStore } from '../../stores/snackbar'
import { useThemeStore } from '../../stores/theme';
import { defineAsyncComponent } from 'vue';
import 'vue-multiselect/dist/vue-multiselect.css';

// Import vue-multiselect
const Multiselect = defineAsyncComponent(() => import('vue-multiselect'));

// Theme store for dark mode
const themeStore = useThemeStore();
const isDark = computed(() => themeStore.isDarkMode);
const titleInputRef = ref(null);

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  event: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['cancel', 'submit']);

const snackbarStore = useSnackbarStore()
const eventsStore = useEventsStore();
const { uploadMedia } = useMediaUpload();
const { user } = useAuth();

const formErrors = ref({});
const isLoading = ref(false);
const currentStep = ref(1);
const steps = ref([
  { label: 'Información' },
  { label: 'Multimedia' },
  { label: 'Fechas' },
  { label: 'Ubicación/Link' }, // Nuevo label para el paso 4
  { label: 'Configuración' }, // Nuevo label para el paso 5
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

const newMediaBase64 = ref(null)
const editForm = ref({
  title: '',
  description: '',
  media: '',
  mediaType: '',
  categories: [],
  privacy: 'public',
  startTime: '',
  endTime: '',
  location: {
    address: '',
    lat: null,
    lng: null,
  },
  meetLink: '', // Agregado para el link del meet
  capacity: null,
  idDoc: '',
  ownerId: '',
  mediaPath: null,
  attendees: {
    going: [],
    interested: [],
    notInterested: [],
  },
  modality: 0, // Default to Presencial (0) or from props.event.modality
});

watch(() => props.visible, (newVal) => {
  if (newVal) {
    nextTick(() => {
      titleInputRef.value?.focus();
    });
  }
});

watch(
  () => props.event,
  (newVal) => {
    editForm.value = {
      ...newVal,
      startTime: formatFirebaseTimestamp(newVal.startTime),
      endTime: formatFirebaseTimestamp(newVal.endTime),
      modality: newVal.modality !== undefined ? newVal.modality : 0, // Set modality from event or default to 0
      meetLink: newVal.meetLink || '', // Inicializa meetLink
      location: newVal.location || { address: '', lat: null, lng: null }, // Asegura que location no sea null
    };
    newMediaBase64.value = null;
  },
  { immediate: true }
);

function closeModal() {
  currentStep.value = 1;
  formErrors.value = {};
  emit('cancel');
}

function validateStep(step) {
  let isValid = true;
  const errors = {};
  // Regex para validar URLs
  // Acepta los siguientes formatos:
  // - http://dominio.com
  // - https://dominio.com
  // - www.dominio.com
  // - dominio.com (con al menos un punto)
  const urlRegex = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/\S*)?$/;
  if (step === 1) {
    if (!editForm.value.title) {
      errors.title = 'El título es obligatorio';
      isValid = false;
    } else if (editForm.value.title.length < 1 || editForm.value.title.length > 50) {
      errors.title = 'El título debe tener entre 1 y 50 caracteres.';
      isValid = false;
    }
    if (!editForm.value.description) {
      errors.description = 'La descripción es obligatoria';
      isValid = false;
    } else if (editForm.value.description.length < 10 || editForm.value.description.length > 500) {
      errors.description = 'La descripción debe tener entre 10 y 500 caracteres.';
      isValid = false;
    }
  } else if (step === 2) {
    if (!editForm.value.media) {
      errors.media = 'Debe cargarle una portada al evento.';
      isValid = false;
    }
  } else if (step === 3) { // Solo fechas
    if (!editForm.value.startTime) {
      errors.startTime = 'La fecha y hora de inicio son obligatorias';
      isValid = false;
    } else if (editForm.value.startTime && new Date(editForm.value.startTime) <= new Date()) {
      errors.startTime = 'La fecha y hora de inicio debe ser una fecha futura.';
      isValid = false;
    }
    // End time es opcional, pero si existe, debe ser posterior a start time
    if (editForm.value.endTime && new Date(editForm.value.startTime) >= new Date(editForm.value.endTime)) {
      errors.endTime = 'La fecha y hora de fin deben ser posteriores a la fecha y hora de inicio';
      isValid = false;
    }
  } else if (step === 4) { // Modalidad, Ubicación/Link y Capacidad
    if (![0, 1].includes(editForm.value.modality)) {
      errors.modality = 'La modalidad debe ser Presencial o Virtual';
      isValid = false;
    }

    if (editForm.value.modality === 0) { // Presencial
      if (!editForm.value.location.address) {
        errors.address = 'La ubicación es obligatoria para eventos presenciales';
        isValid = false;
      }
    } else if (editForm.value.modality === 1) { // Virtual
       if (!editForm.value.meetLink) {
        errors.meetLink = 'El link del meet es obligatorio para eventos virtuales';
        isValid = false;
      } else if (!urlRegex.test(editForm.value.meetLink)) {
        errors.meetLink = 'El link del meet no es una URL válida.';
        isValid = false;
      }
    }

    if (!editForm.value.capacity || editForm.value.capacity <= 0) {
      errors.capacity = 'La capacidad debe ser un número positivo';
      isValid = false;
    } else if (editForm.value.capacity > 99999) { // Límite de 5 dígitos como en el pattern
      errors.capacity = 'La capacidad máxima es 99999';
      isValid = false;
    }
  } else if (step === 5) { // Categorías y Privacidad
    if (editForm.value.categories.length === 0) {
      errors.categories = 'Debes seleccionar al menos una categoría';
      isValid = false;
    } else if (editForm.value.categories.length > 3) {
      errors.categories = 'Debes seleccionar como máximo 3 categorías';
      isValid = false;
    }
    if (editForm.value.privacy !== 'public' && editForm.value.privacy !== 'private') {
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

async function handleSubmit() {
  isLoading.value = true;
  try {
    // Validar todos los pasos
    for (let i = 1; i <= steps.value.length; i++) {
      if (!validateStep(i)) {
        currentStep.value = i; // Regresar al paso con error
        snackbarStore.show('Por favor, completa todos los campos requeridos.', 'error');
        return;
      }
    }

    const eventData = {
      ...editForm.value,
      startTime: editForm.value.startTime ? new Date(editForm.value.startTime) : null,
      endTime: editForm.value.endTime ? new Date(editForm.value.endTime) : null,
      // Condicionalmente incluye location o meetLink
      location: editForm.value.modality === 0 ? editForm.value.location : null,
      meetLink: editForm.value.modality === 1 ? editForm.value.meetLink : null,
    };

    if (newMediaBase64.value) {
      const ownerId = user.value?.uid || user.value?.id || editForm.value.ownerId;
      const dynamicPath = `events/${ownerId}/${newGuid()}`;
      const { url, path } = await uploadMedia({
        currentUrl: editForm.value.media,
        currentPath: editForm.value.mediaPath,
        newMediaBase64: newMediaBase64.value,
        mediaType: editForm.value.mediaType,
        dynamicPath,
      });
      eventData.media = url || null;
      eventData.mediaPath = path || null;
    }
    await eventsStore.editEvent(editForm.value.idDoc, eventData);
    emit('submit', eventData);
    closeModal();
    snackbarStore.show('Evento actualizado exitosamente.', 'success');
  } catch (error) {
    console.error('Error actualizando el evento:', error);
    snackbarStore.show('Error al actualizar evento: ' + error.message, 'error');
  } finally {
    isLoading.value = false;
  }
}

function formatFirebaseTimestamp(timestamp) {
  if (!timestamp || !timestamp.seconds) return '';
  const date = new Date(timestamp.seconds * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function handleMediaUpload(event) {
  formErrors.value.media = '';
  const file = event.target.files[0];

  if (!file) return;
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    formErrors.value.media = "El tipo de archivo no es permitido. Selecciona una imagen o video.";
    event.target.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onloadend = () => {
    newMediaBase64.value = reader.result;
    editForm.value.media = URL.createObjectURL(file);
    editForm.value.mediaType = file.type.startsWith('image') ? 'image' : 'video';
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