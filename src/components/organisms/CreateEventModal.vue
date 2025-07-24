<template>
  <div v-if="visible" class="fixed inset-0 bg-black/60 z-101 flex items-center justify-center p-4">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[95vh]">
      <!-- Encabezado del modal -->
      <div class="sticky top-0 bg-white dark:bg-gray-800 z-10 p-6 border-b rounded-t-xl flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-300">Crear evento</h3>
        <button @click="closeModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100" aria-label="Cerrar modal">
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
                v-model="newEvent.description"
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
            <div v-if="newEvent.media" class="mt-2">
              <img
                v-if="newEvent.mediaType === 'image'"
                :src="newEvent.media"
                alt="Preview"
                class="w-full h-48 object-cover rounded-lg shadow-sm"
                :aria-label="`Previsualización de ${newEvent.mediaType}`"
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
                v-else-if="newEvent.mediaType === 'video'"
                :src="newEvent.media"
                class="w-full h-48 rounded-lg shadow-sm"
                autoplay
                loop
                muted
                :aria-label="`Previsualización de ${newEvent.mediaType}`"
                :poster="newEvent.media"
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
              v-model="newEvent.startTime"
              label="Fecha y Hora de Inicio"
              :disabled="isLoading"
              time-enabled
              :error="formErrors.startTime"
              required
            />
            <!-- Fecha y Hora de Fin -->
            <SelectDate
              v-model="newEvent.endTime"
              label="Fecha y Hora de Fin"
              :disabled="isLoading"
              :error="formErrors.endTime"
              time-enabled
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
                v-model="newEvent.modality"
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
            <div v-if="newEvent.modality === 0" class="mb-4">
              <label for="eventLocation" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                Ubicación
              </label>
              <GeolocationInput
                v-model="newEvent.location"
                placeholder="Ingresá una dirección"
                :disabled="isLoading"
                :error="formErrors.address"
              />
              <p v-if="formErrors.address" id="address-error" role="alert" aria-live="polite" class="text-sm text-red-500 mt-1">{{ formErrors.address }}</p>
            </div>

            <!-- Link del Meet (si es Virtual) -->
            <div v-if="newEvent.modality === 1" class="mb-4">
              <label for="eventMeetLink" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                Link del Meet
              </label>
              <input
                v-model="newEvent.meetLink"
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
                v-model.number="newEvent.capacity"
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
                @input="newEvent.capacity = newEvent.capacity ? Math.max(1, newEvent.capacity) : null"
              />
              <p v-if="formErrors.capacity" id="capacity-error" role="alert" aria-live="polite" class="text-sm text-red-500 mt-1">{{ formErrors.capacity }}</p>
            </div>
          </div>

          <!-- Paso 5: Configuración adicional (Categorías, Privacidad y Venta Online) -->
          <div v-if="currentStep === 5">
            <!-- Categorías -->
            <div>
              <label for="eventCategories" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
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
                  Privacidad
                </legend>
                <div class="flex gap-2 ml-1">
                  <div class="flex items-center gap-2">
                    <input
                      v-model="newEvent.privacy"
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
                    <label for="public" class="text-sm text-gray-700 dark:text-gray-100">
                      Público
                    </label>
                  </div>
                  <div class="flex items-center gap-2">
                    <input
                      v-model="newEvent.privacy"
                      type="radio"
                      id="private"
                      name="privacy"
                      value="private"
                      :disabled="isLoading"
                      class="form-radio text-blue-600 focus:ring-blue-500"
                      aria-describedby="privacy-error"
                      :aria-invalid="formErrors.privacy ? 'true' : 'false'"
                      aria-required="true"
                      aria-label="Seleccionar privacidad privada del evento"
                    />
                    <label for="private" class="text-sm text-gray-700 dark:text-gray-100">
                      Privado
                    </label>
                  </div>
                </div>
              </fieldset>
              <p v-if="formErrors.privacy" id="privacy-error" role="alert" aria-live="polite" class="text-sm text-red-500 mt-1">
                {{ formErrors.privacy }}
              </p>
            </div>

            <!-- Venta Online -->
            <div v-if="user.isSuscribed" class="flex flex-col gap-4 mt-4">
              <div class="flex items-center gap-2">
                <input
                  v-model="newEvent.hasOnlineSale"
                  type="checkbox"
                  id="hasOnlineSale"
                  :disabled="isLoading"
                  class="form-checkbox text-blue-600 focus:ring-blue-500 h-5 w-5"
                  aria-label="Habilitar venta online"
                />
                <label for="hasOnlineSale" class="text-sm font-medium text-gray-700 dark:text-gray-200">
                  ¿Tiene Venta Online?
                </label>
              </div>

              <!-- Campos condicionales para Venta Online -->
              <transition name="fade">
                <div v-if="newEvent.hasOnlineSale" class="space-y-4">
                  <!-- Link de Venta -->
                  <div>
                    <label for="sellTicketLink" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                      Link de Venta
                    </label>
                    <input
                      v-model="newEvent.sellTicketLink"
                      id="sellTicketLink"
                      type="url"
                      placeholder="Ej: https://example.com/tickets"
                      class="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                      :class="formErrors.sellTicketLink ? 'border-red-500' : ''"
                      aria-describedby="sellTicketLink-error"
                      :aria-invalid="formErrors.sellTicketLink ? 'true' : 'false'"
                      aria-required="true"
                      :disabled="isLoading"
                      required
                    />
                    <p v-if="formErrors.sellTicketLink" id="sellTicketLink-error" role="alert" aria-live="polite" class="text-sm text-red-500 mt-1">
                      {{ formErrors.sellTicketLink }}
                    </p>
                  </div>

                  <!-- Descripción de Venta -->
                  <div>
                    <label for="sellTicketText" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                      Descripción de Venta
                    </label>
                    <textarea
                      v-model="newEvent.sellTicketText"
                      id="sellTicketText"
                      placeholder="Breve descripción para el botón de compra (opcional)"
                      class="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 resize-y min-h-[80px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                      :class="formErrors.sellTicketText ? 'border-red-500' : ''"
                      aria-describedby="sellTicketText-error"
                      :aria-invalid="formErrors.sellTicketText ? 'true' : 'false'"
                      :maxlength="200"
                      :disabled="isLoading"
                    ></textarea>
                    <p v-if="formErrors.sellTicketText" id="sellTicketText-error" role="alert" aria-live="polite" class="text-sm text-red-500 mt-1">
                      {{ formErrors.sellTicketText }}
                    </p>
                  </div>
                </div>
              </transition>
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
              aria-label="Cancelar creación del evento"
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
              aria-label="Crear evento"
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
  { label: 'Fechas' },
  { label: 'Ubicación/Link' },
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
  location: { address: '', lat: null, lng: null },
  meetLink: '',
  capacity: null,
  modality: 0,
  hasOnlineSale: false, // New property for checkbox
  sellTicketLink: '', // New property for ticket sale link
  sellTicketText: '', // New property for ticket sale description
});

function closeModal() {
  resetForm();
  currentStep.value = 1;
  formErrors.value = {};
  emits('close');
}

// Función para normalizar URLs
function normalizeUrl(url) {
  if (!url) return '';
  // Eliminar espacios en blanco y convertir a minúsculas
  let normalized = url.trim().toLowerCase();
  // Remover barra final si existe
  normalized = normalized.replace(/\/+$/, '');
  // Añadir https:// si no tiene protocolo
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }
  return normalized;
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
    meetLink: '',
    capacity: null,
    modality: 0,
    hasOnlineSale: false,
    sellTicketLink: '',
    sellTicketText: '',
  };
}

function validateStep(step) {
  let isValid = true;
  const errors = {};
  // Regex para validar URLs
  const urlRegex = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/\S*)?$/;

  if (step === 1) {
    if (!newEvent.value.title) {
      errors.title = 'El título es obligatorio';
      isValid = false;
    } else if (newEvent.value.title.length < 1 || newEvent.value.title.length > 50) {
      errors.title = 'El título debe tener entre 1 y 50 caracteres.';
      isValid = false;
    }
    if (!newEvent.value.description) {
      errors.description = 'La descripción es obligatoria';
      isValid = false;
    } else if (newEvent.value.description.length < 10 || newEvent.value.description.length > 500) {
      errors.description = 'La descripción debe tener entre 10 y 500 caracteres.';
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
    } else if (new Date(newEvent.value.startTime) <= new Date()) {
      errors.startTime = 'La fecha y hora de inicio debe ser una fecha futura.';
      isValid = false;
    }
    if (newEvent.value.endTime && new Date(newEvent.value.startTime) >= new Date(newEvent.value.endTime)) {
      errors.endTime = 'La fecha y hora de fin deben ser posteriores a la fecha y hora de inicio';
      isValid = false;
    }
  } else if (step === 4) {
    if (![0, 1].includes(newEvent.value.modality)) {
      errors.modality = 'La modalidad debe ser Presencial o Virtual';
      isValid = false;
    }
    if (newEvent.value.modality === 0) {
      if (!newEvent.value.location.address) {
        errors.address = 'La ubicación es obligatoria para eventos presenciales';
        isValid = false;
      }
    } else if (newEvent.value.modality === 1) {
      if (!newEvent.value.meetLink) {
        errors.meetLink = 'El link del meet es obligatorio para eventos virtuales';
        isValid = false;
      } else if (!urlRegex.test(newEvent.value.meetLink)) {
        errors.meetLink = 'El link del meet no es una URL válida.';
        isValid = false;
      }
    }
    if (!newEvent.value.capacity || newEvent.value.capacity <= 0) {
      errors.capacity = 'La capacidad debe ser un número positivo';
      isValid = false;
    } else if (newEvent.value.capacity > 99999) {
      errors.capacity = 'La capacidad máxima es 99999';
      isValid = false;
    }
  } else if (step === 5) {
    if (newEvent.value.categories.length === 0) {
      errors.categories = 'Debes seleccionar al menos una categoría';
      isValid = false;
    } else if (newEvent.value.categories.length > 3) {
      errors.categories = 'Debes seleccionar como máximo 3 categorías';
      isValid = false;
    }
    if (newEvent.value.privacy !== 'public' && newEvent.value.privacy !== 'private') {
      errors.privacy = 'La privacidad debe ser pública o privada';
      isValid = false;
    }
    if (newEvent.value.hasOnlineSale) {
      if (!newEvent.value.sellTicketLink) {
        errors.sellTicketLink = 'El link de venta es obligatorio si se habilita la venta online';
        isValid = false;
      } else if (!urlRegex.test(newEvent.value.sellTicketLink)) {
        errors.sellTicketLink = 'El link de venta no es una URL válida.';
        isValid = false;
      }
      if (newEvent.value.sellTicketText && newEvent.value.sellTicketText.length > 200) {
        errors.sellTicketText = 'La descripción de venta no puede exceder los 200 caracteres.';
        isValid = false;
      }
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
        snackbarStore.show('Por favor, completa todos los campos requeridos.', 'error');
        return;
      }
    }

    const ownerId = user.value?.uid || user.value?.id || null;
    let updatedMediaUrl = null;
    let updatedMediaPath = null;
    if (newEvent.value.newMediaBase64) {
      const dynamicPath = `events/${ownerId}/${newGuid()}`;
      const { url, path } = await uploadMedia({
        currentUrl: null,
        currentPath: null,
        newMediaBase64: newEvent.value.newMediaBase64,
        mediaType: newEvent.value.mediaType,
        dynamicPath,
      });
      updatedMediaUrl = url;
      updatedMediaPath = path;
    }

    const eventData = {
      title: newEvent.value.title,
      description: newEvent.value.description,
      media: updatedMediaUrl || null,
      mediaPath: updatedMediaPath || null,
      mediaType: newEvent.value.mediaType || null,
      categories: newEvent.value.categories,
      privacy: newEvent.value.privacy,
      modality: newEvent.value.modality,
      ownerId: ownerId,
      startTime: newEvent.value.startTime ? new Date(newEvent.value.startTime) : null,
      endTime: newEvent.value.endTime ? new Date(newEvent.value.endTime) : null,
      capacity: newEvent.value.capacity,
      attendees: {
        going: [ownerId],
        interested: [],
        notInterested: [],
      },
      location: newEvent.value.modality === 0 ? newEvent.value.location : null,
      meetLink: newEvent.value.modality === 1 ? normalizeUrl(newEvent.value.meetLink) : null,
      hasOnlineSale: newEvent.value.hasOnlineSale,
      sellTicketLink: newEvent.value.hasOnlineSale ? normalizeUrl(newEvent.value.sellTicketLink) : null,
      sellTicketText: newEvent.value.hasOnlineSale ? newEvent.value.sellTicketText : null,
    };

    await eventsStore.createEvent(eventData);
    emits('eventCreated', eventData);
    closeModal();
    snackbarStore.show('Evento creado exitosamente', 'success');
  } catch (error) {
    snackbarStore.show('Error al crear evento: ' + error.message, 'error');
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
    event.target.value = '';
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

/* Transición de fade para los campos condicionales */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>