<template>
  <div v-if="visible" class="fixed inset-0 bg-black/60 z-101 flex items-center justify-center p-4">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
      <!-- Encabezado del modal -->
      <div class="sticky top-0 bg-white dark:bg-gray-800 z-10 p-6 border-b flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-300">Editar Evento</h3>
        <button @click="handleCancel" class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100">
          <i class="fa-solid fa-xmark w-6 h-6"></i>
        </button>
      </div>

      <!-- Contenido del modal -->
      <div class="p-6">
        <h4 class="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 tracking-tight sr-only">
          Editar Evento
        </h4>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Título -->
          <div>
            <label for="eventTitle" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
              Título del Evento
            </label>
            <input
              v-model="editForm.title"
              id="eventTitle"
              type="text"
              placeholder="Ej: Exposición de Animales"
              class="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200"
              required
            />
          </div>

          <!-- Descripción -->
          <div>
            <label for="eventDescription" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
              Descripción del Evento
            </label>
            <textarea
              v-model="editForm.description"
              id="eventDescription"
              placeholder="Describe brevemente el objetivo o tema del evento"
              class="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 resize-y min-h-[100px] transition-all duration-200"
              required
            ></textarea>
          </div>

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
                errorFileMessage ? 'border-red-500' : 'border-gray-300  dark:border-gray-800'
              ]"
              :disabled="isLoading"
              required
            />
            <!-- Mensaje de error -->
            <p v-if="errorFileMessage" class="text-red-500 text-sm mt-1">{{ errorFileMessage }}</p>
          </div>

          <!-- Previsualización de Media (si existe) -->
          <div v-if="editForm.media" class="mt-2">
            <img
              v-if="editForm.mediaType === 'image'"
              :src="editForm.media"
              alt="Preview"
              class="w-full h-48 object-cover rounded-lg shadow-sm"
            />
            <video
              v-else-if="editForm.mediaType === 'video'"
              :src="editForm.media"
              controls
              class="w-full h-48 rounded-lg shadow-sm"
            ></video>
          </div>

          <!-- Fecha y Hora de Inicio -->
          <div>
            <label for="eventStartTime" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
              Fecha y Hora de Inicio
            </label>
            <input
              v-model="editForm.startTime"
              id="eventStartTime"
              type="datetime-local"
              class="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 transition-all duration-200"
              required
            />
          </div>

          <!-- Fecha y Hora de Fin (opcional) -->
          <div>
            <label for="eventEndTime" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
              Fecha y Hora de Fin
            </label>
            <input
              v-model="editForm.endTime"
              id="eventEndTime"
              type="datetime-local"
              class="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 transition-all duration-200"
            />
          </div>

          <!-- Ubicación -->
          <div>
            <label for="eventLocation" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
              Ubicación
            </label>
            <GeolocationInput
                v-model="editForm.location"
                placeholder="Ingresá una dirección"
              />
          </div>

          <!-- Capacidad -->
          <div>
            <label for="eventCapacity" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
              Capacidad
            </label>
            <input
              v-model.number="editForm.capacity"
              id="eventCapacity"
              type="number"
              placeholder="Número máximo de asistentes"
              class="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 transition-all duration-200"
            />
          </div>

          <!-- Privacidad -->
          <div class="flex gap-4 items-center mt-4">
            <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-100">
              <input
                type="radio"
                value="public"
                v-model="editForm.privacy"
                class="form-radio"
              />
              Público
            </label>
            <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-100">
              <input
                type="radio"
                value="private"
                v-model="editForm.privacy"
                class="form-radio"
              />
              Privado
            </label>
          </div>

          <!-- Categorías (opcional: se muestran si existen) -->
          <div v-if="categories?.length" class="flex flex-wrap gap-3">
            <label
              v-for="category in categories"
              :key="category.id"
              class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer dark:text-gray-100"
            >
              <input
                :id="'filter_' + category.id"
                type="checkbox"
                v-model="editForm.categories"
                :value="category"
                class="custom-checkbox"
              />
              <span class="font-medium">{{ category.name }}</span>
            </label>
          </div>

          <!-- Botones -->
          <div class="flex justify-end gap-3 mt-6">
            <button
              type="button"
              @click="handleCancel"
              class="px-5 py-2 text-gray-500 dark:text-gray-200 dark:bg-gray-600 rounded-lg hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-5 py-2 bg-primary dark:bg-secondary text-white rounded-lg hover:bg-primary-md dark:hover:bg-secondary-md transition-all duration-200 shadow-md"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import GeolocationInput from '../atoms/GeolocationInput.vue'
import { useEventsStore } from '../../stores/events'
import { useMediaUpload } from '../../composable/useMediaUpload'
import { newGuid } from '../../utils/newGuid'
import { useAuth } from '../../api/auth/useAuth'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  event: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['cancel', 'submit'])
const eventsStore = useEventsStore()
const { uploadMedia } = useMediaUpload()
const { user } = useAuth()
const editForm = ref({ ...props.event })
const errorFileMessage = ref('');

// Si la prop 'event' cambia, actualizamos el formulario
watch(
  () => props.event,
  (newVal) => {
    editForm.value = {
      ...newVal,
      startTime: formatFirebaseTimestamp(newVal.startTime),
      endTime: formatFirebaseTimestamp(newVal.endTime)
    }
  },
  { immediate: true }
)

const categories = ref([
  { id: 'adopcion', name: 'Adopción' },
  { id: 'educacion', name: 'Educación' },
  { id: 'salud', name: 'Salud y Bienestar' },
  { id: 'recreativo', name: 'Recreativo' },
  { id: 'competencia', name: 'Concursos y Muestras' },
  { id: 'voluntariado', name: 'Voluntariado' },
  { id: 'beneficencia', name: 'Solidarios' },
  { id: 'otros', name: 'Otros' }
]);

function handleCancel() {
  emit('cancel')
}

async function handleSubmit() {
  // Convertir las fechas del input a objetos Date
  const eventData = {
    ...editForm.value,
    startTime: editForm.value.startTime ? new Date(editForm.value.startTime) : null,
    endTime: editForm.value.endTime ? new Date(editForm.value.endTime) : null,
  }
  debugger
  // Si se seleccionó una nueva media, la cargamos a storage
  if (editForm.value.newMediaBase64) {
    const ownerId = user.value?.uid || user.value?.id || editForm.value.ownerId
    const dynamicPath = `events/${ownerId}/${newGuid()}`
    const { url, path } = await uploadMedia({
      currentUrl: editForm.value.media,
      currentPath: editForm.value.mediaPath,
      newMediaBase64: editForm.value.newMediaBase64,
      mediaType: editForm.value.mediaType,
      dynamicPath,
    })
    eventData.media = url || null
    eventData.mediaPath = path || null
  }
  
  try {
    debugger
    await eventsStore.editEvent(editForm.value.idDoc, eventData)
    emit('submit', eventData)
  } catch (error) {
    console.error("Error actualizando el evento:", error)
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
    errorFileMessage.value = ''
    const file = event.target.files[0];

    if (!file) return
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      errorFileMessage.value = "El tipo de archivo no es permitido. Selecciona una imagen o video.";
      event.target.value = ''; // Limpiar el input
      return;
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      editForm.value.newMediaBase64 = reader.result
      editForm.value.media = URL.createObjectURL(file)
      editForm.value.mediaType = file.type.startsWith('image') ? 'image' : 'video'
    }
    reader.onerror = (error) => {
      console.error('Error al leer el archivo:', error)
    }
    reader.readAsDataURL(file)
  }
</script>

<style scoped>
/* Puedes mantener o ajustar estos estilos si es necesario */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
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
</style>
