<template>
  <div v-if="visible" class="fixed inset-0 bg-black/60 z-101 flex items-center justify-center p-4">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
      <!-- Encabezado del modal -->
      <div class="sticky top-0 bg-white dark:bg-gray-800 z-10 p-6 border-b flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-300">{{ modalTitle }}</h3>
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
              <!-- Botón para eliminar media existente/previsualizada -->
              <button
                type="button"
                @click="clearMedia"
                class="mt-2 px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                :disabled="isSubmitting"
              >
                Eliminar Media
              </button>
            </div>
          </div>

          <!-- Botones de navegación -->
          <div class="flex justify-between gap-3 mt-6">
            <button
              v-if="currentStep > 1"
              type="button"
              @click="previousStep"
              :disabled="isSubmitting"
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
              :disabled="isSubmitting"
              class="px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              aria-label="Cancelar"
            >
              <i class="fa-solid fa-times"></i>
              <p class="hidden md:block">Cancelar</p>
            </button>

            <button
              v-if="currentStep < 3"
              type="button"
              @click="nextStep"
              :disabled="isSubmitting"
              class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-lg hover:bg-primary/90 dark:hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              aria-label="Avanzar al siguiente paso"
            >
              <p class="hidden md:block">Siguiente</p>
              <i class="fa-solid fa-arrow-right"></i>
            </button>

            <button
              v-if="currentStep === 3"
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-lg hover:bg-primary/90 dark:hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              aria-label="Guardar cambios o crear"
            >
              <span v-if="isSubmitting">
                <i class="fa-solid fa-circle-notch animate-spin"></i>
              </span>
              <p class="hidden md:block">
                {{ isSubmitting ? (isEditMode ? 'Guardando...' : 'Creando...') : submitButtonText }}
              </p>
              <i v-if="!isSubmitting" class="fa-solid fa-save"></i>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useMediaUpload } from '../../composable/useMediaUpload';
import { newGuid } from '../../utils/newGuid';
import { useLocationsStore } from '../../stores/locations';
import { useAuth } from '../../api/auth/useAuth';
import GeolocationInput from '../atoms/GeolocationInput.vue';
import PhoneInput from '../atoms/PhoneInput.vue';
import { useSnackbarStore } from '../../stores/snackbar';


import CatIcon from '../../assets/icons/cat_1.png';
import VetIcon from '../../assets/icons/locations/veterinary 2.png';
import TrainerIcon from '../../assets/icons/locations/trainer1.png';
import GroomingIcon from '../../assets/icons/locations/groomer2.png';
import PaseadorIcon from '../../assets/icons/locations/walking-the-dog.png';
import GuarderiaIcon from '../../assets/icons/locations/guardery4.png';
import ParqueIcon from '../../assets/icons/locations/park.png';
import PetfriendlyIcon from '../../assets/icons/locations/petfriendly3.png';
import PetShopIcon from '../../assets/icons/locations/assistant.png';
import EtologoIcon from '../../assets/icons/locations/veterinary.png';
import PetSitterIcon from '../../assets/icons/locations/guarderia3.png';
import ShelterIcon from '../../assets/icons/locations/animal-shelter.png';
import EmergencyIcon from '../../assets/icons/locations/first-aid-kit.png';
import TherapyIcon from '../../assets/icons/locations/rehab1.png';

const emits = defineEmits(['close', 'locationCreated', 'locationUpdated']);
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  locationToEdit: {
    type: Object,
    default: null,
  },
});

const { uploadMedia } = useMediaUpload(); //, deleteMedia crear metodo para eliminar media del storage
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
  { id: 'veterinaria', label: 'Veterinaria', icon: VetIcon },
  { id: 'petshop', label: 'Pet Shop', icon: PetShopIcon },
  { id: 'guarderia', label: 'Guardería', icon: GuarderiaIcon },
  { id: 'peluqueria', label: 'Peluquería y Baño', icon: GroomingIcon },
  { id: 'cuidador', label: 'Cuidadores', icon: PetSitterIcon },
  { id: 'etologo', label: 'Etólogo', icon: EtologoIcon },
  { id: 'paseador', label: 'Paseador', icon: PaseadorIcon },
  { id: 'entrenador', label: 'Entrenadores de Mascotas', icon: TrainerIcon },
  { id: 'parque', label: 'Parques y Plazas', icon: ParqueIcon },
  { id: 'petfriendly', label: 'Lugares Pet-Friendly', icon: PetfriendlyIcon },
  { id: 'refugio', label: 'Refugios y Adopción', icon: ShelterIcon },
  { id: 'emergencias', label: 'Emergencias', icon: EmergencyIcon },
  { id: 'rehabilitacion', label: 'Rehabilitación y Terapia', icon: TherapyIcon },
]);

// Función para inicializar o resetear los datos del formulario
function initializeNewLocation(data = null) {
  return {
    id: data?.id || newGuid(), // Preserva ID si edita, sino nuevo GUID
    title: data?.title || '',
    description: data?.description || '',
    address: {
      street: data?.address?.street || '',
      coordinates: {
        lat: data?.address?.coordinates?.lat || null,
        lng: data?.address?.coordinates?.lng || null,
      },
    },
    type: data?.type || '',
    contact: {
      phone: data?.contact?.phone || '',
      socialNetworkLink: data?.contact?.socialNetworkLink || null,
    },
    media: {
      url: data?.media?.url || '',
      path: data?.media?.path || '',
      imageBase64: null,
      type: data?.media?.type || '',
    },
    timestamp: data?.timestamp || '',
    pending: data?.pending ?? true,
    user: data?.user || null,
  };
}

const newLocation = ref(initializeNewLocation());

// Variable para GeolocationInput
const locationInput = ref({
  address: '',
  lat: null,
  lng: null,
});

// Propiedad computada para determinar el modo (crear o editar)
const isEditMode = computed(() => !!props.locationToEdit);

// Propiedad computada para el título del modal
const modalTitle = computed(() => {
  return isEditMode.value ? 'Editar Lugar' : 'Crear Nuevo Lugar';
});

// Propiedad computada para el texto del botón de submit
const submitButtonText = computed(() => {
  return isEditMode.value ? 'Guardar Cambios' : 'Crear';
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
// Esto es importante cuando se carga una ubicación para editar
watch(() => newLocation.value.address, (newVal) => {
  locationInput.value = {
    address: newVal.street,
    lat: newVal.coordinates.lat,
    lng: newVal.coordinates.lng,
  };
}, { deep: true });


// Watch para inicializar el formulario cuando el modal se hace visible
// o cuando locationToEdit cambia (si el modal ya está visible y se cambia la prop)
watch(() => [props.visible, props.locationToEdit], ([newVisible, newLocationToEdit]) => {
  if (newVisible) {
    resetForm(); // Siempre resetear al abrir
    if (newLocationToEdit) {
      // Si hay un locationToEdit, inicializar con esos datos
      newLocation.value = initializeNewLocation(newLocationToEdit);
      // Asegurarse de que locationInput también se prellene
      locationInput.value = {
        address: newLocationToEdit.address?.street || '',
        lat: newLocationToEdit.address?.coordinates?.lat || null,
        lng: newLocationToEdit.address?.coordinates?.lng || null,
      };
    }
  }
}, { deep: true, immediate: true }); // 'immediate: true' para que se ejecute al montar si 'visible' ya es true


function closeModal() {
  resetForm();
  emits('close');
}

function resetForm() {
  newLocation.value = initializeNewLocation();
  locationInput.value = {
    address: '',
    lat: null,
    lng: null,
  };
  currentStep.value = 1;
  errors.value = {};
  errorFileMessage.value = '';
  locationError.value = '';
}

function handleMediaUpload(event) {
  errorFileMessage.value = '';
  const file = event.target.files[0];
  if (!file) {
    // Si el usuario cancela la selección de archivo, limpia la previsualización
    newLocation.value.media = { url: '', path: '', imageBase64: null, type: '' };
    return;
  }

  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    errorFileMessage.value = 'El tipo de archivo no es permitido. Selecciona una imagen o video.';
    event.target.value = ''; // Limpia el input de archivo
    return;
  }

  const reader = new FileReader();
  reader.onloadend = () => {
    newLocation.value.media = {
      url: URL.createObjectURL(file), // URL para previsualización
      path: null, // La ruta real se asignará después de la subida a Firebase Storage
      type: file.type.startsWith('image') ? 'image' : 'video',
      imageBase64: reader.result, // Base64 para la subida
    };
  };
  reader.onerror = (error) => {
    console.error('Error al leer el archivo:', error);
    errorFileMessage.value = 'Error al leer el archivo.';
  };
  reader.readAsDataURL(file);
}

// Nueva función para limpiar el media previsualizado/existente
function clearMedia() {
  newLocation.value.media = {
    url: '',
    path: '',
    imageBase64: null,
    type: '',
  };
  // Si hay un input de tipo file, también límpialo para evitar que se re-seleccione el mismo archivo
  const fileInput = document.getElementById('media');
  if (fileInput) {
    fileInput.value = '';
  }
}


function validateStep(step) {
  errors.value = {};
  let isValid = true;

  if (step === 1) {
    if (!newLocation.value.title || newLocation.value.title.trim() === '') {
      errors.value.title = 'El título es obligatorio';
      isValid = false;
    }
    if (!newLocation.value.description || newLocation.value.description.trim() === '') {
      errors.value.description = 'La descripción es obligatoria';
      isValid = false;
    }
    if (!newLocation.value.type || newLocation.value.type.trim() === '') {
      errors.value.type = 'El tipo es obligatorio';
      isValid = false;
    }
  } else if (step === 2) {
    if (!newLocation.value.address.street || newLocation.value.address.street.trim() === '') {
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
    // Validar todos los pasos antes de enviar
    if (!validateStep(1) || !validateStep(2)) {
      currentStep.value = 1; // Volver al primer paso con errores si falla la validación
      snackbarStore.show('Por favor, completa todos los campos obligatorios.', 'error');
      return;
    }

    const ownerId = user.value?.uid || user.value?.id || null;
    if (!ownerId) {
      snackbarStore.show('Error: Usuario no autenticado.', 'error');
      return;
    }

    let finalMediaData = {
      url: newLocation.value.media.url || null,
      path: newLocation.value.media.path || null,
      type: newLocation.value.media.type || null,
    };

    // Si hay un nuevo archivo seleccionado para subir
    if (newLocation.value.media.imageBase64) {
      const dynamicPath = `locations/${ownerId}/${newGuid()}`;
      const { url, path } = await uploadMedia({
        currentUrl: isEditMode.value ? props.locationToEdit?.media?.url : null, // URL actual si es edición
        currentPath: isEditMode.value ? props.locationToEdit?.media?.path : null, // Path actual si es edición
        newMediaBase64: newLocation.value.media.imageBase64,
        mediaType: newLocation.value.media.type,
        dynamicPath,
      });
      finalMediaData = {
        url,
        path,
        type: newLocation.value.media.type,
      };
    } else if (isEditMode.value && props.locationToEdit?.media?.url && !newLocation.value.media.url) {
      if (props.locationToEdit.media?.path) {
        // await deleteMedia(props.locationToEdit.media.path); // Eliminar el media de Storage
      }
      finalMediaData = { url: null, path: null, type: null }; // Limpiar media en la base de datos
    }


    // Preparar los datos para Firestore
    const locationData = {
      id: newLocation.value.id, // Se mantiene el ID si es edición
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
        socialNetworkLink: newLocation.value.contact.socialNetworkLink || null,
      },
      media: finalMediaData,
      timestamp: isEditMode.value ? newLocation.value.timestamp : new Date(), // Preserva en edición, crea en nuevo
      pending: isEditMode.value ? newLocation.value.pending : true, // Preserva en edición, pendiente en nuevo
      user: isEditMode.value ? newLocation.value.user : { // Preserva en edición, crea en nuevo
        id: ownerId,
        displayName: user.value?.displayName,
        email: user.value?.email,
        photoURLFile: user.value?.photoURLFile,
      },
    };

    if (isEditMode.value) {
      // Actualizar ubicación existente
      await locationsStore.updateLocation(props.locationToEdit.idDoc, locationData); // Usa idDoc para actualizar
      snackbarStore.show('Lugar actualizado exitosamente', 'success');
      emits('locationUpdated', locationData); // Emitir evento de actualización
    } else {
      // Añadir nueva ubicación
      await locationsStore.addLocation(locationData);
      snackbarStore.show('Lugar creado exitosamente', 'success');
      emits('locationCreated', locationData); // Emitir evento de creación
    }

    closeModal();
  } catch (error) {
    console.error('Error al guardar location:', error);
    snackbarStore.show('Error al guardar el lugar. Por favor, intenta nuevamente.', 'error');
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
