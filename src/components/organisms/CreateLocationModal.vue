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
  
        <!-- Contenido del modal -->
        <div class="p-6">
          <form @submit.prevent="handleSubmit" class="space-y-6">
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
            </div>
  
            <!-- Dirección con GeolocationInput -->
            <div>
              <label for="location" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Dirección</label>
              <GeolocationInput
                v-model="locationInput"
                placeholder="Ingresá una dirección"
                class="w-full"
                :disabled="isSubmitting"
              />
              <p v-if="locationError" class="text-sm text-red-500 mt-2">{{ locationError }}</p>
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
            </div>
  
            <!-- Teléfono -->
            <div>
              <label for="phone" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Teléfono (opcional)</label>
              <input
                v-model="newLocation.contact.phone"
                id="phone"
                type="tel"
                placeholder="Ej: 011 4785-5566"
                class="w-full p-3 border hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                :disabled="isSubmitting"
              />
            </div>
  
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
  
            <!-- Botones -->
            <div class="flex justify-end gap-3 mt-6">
              <button
                type="button"
                @click="closeModal"
                class="px-5 py-2 text-gray-500 dark:text-gray-200 dark:bg-gray-600 font-medium rounded-lg hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-500 transition-all duration-200"
                :disabled="isSubmitting"
              >
                Cancelar
              </button>
              <button
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
  import GeolocationInput from '../atoms/GeolocationInput.vue'

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
  
  const isSubmitting = ref(false);
  const errorFileMessage = ref('');
  const locationError = ref('');
  
  const locationTypes = ref([
    { id: 'veterinaria', label: 'Veterinaria' },
    { id: 'petshop', label: 'Pet Shop' },
    { id: 'guarderia', label: 'Guardería' },
    { id: 'petfriendly', label: 'Pet Friendly' },
    { id: 'plaza', label: 'Plaza' },
    { id: 'parque', label: 'Parque' },
    { id: 'servicio', label: 'Servicio' },
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
    newLocation.value.media.imageBase64 = reader.result
    };
    reader.onerror = (error) => {
      console.error('Error al leer el archivo:', error);
      errorFileMessage.value = 'Error al leer el archivo.';
    };
    reader.readAsDataURL(file);
  }
  
  async function handleSubmit() {
    debugger
    isSubmitting.value = true;
    try {
      // Validar el formulario
    //   validateForm();
  
      // Obtener el ID del usuario autenticado
      const ownerId = user.value?.uid || user.value?.id || null;
  
      // Subir el archivo multimedia si existe
      let updatedMedia = {
        url: null,
        path: null,
        type: null,
      };
      debugger
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
        ownerId,
      };
  
      // Guardar en Firestore
      await locationsStore.addLocation(locationData);
  
      // Emitir evento de creación y cerrar modal
      emits('locationCreated', locationData);
      closeModal();
    } catch (error) {
      console.error('Error al crear location:', error);
      alert('Error al crear el lugar: ' + error.message);
    } finally {
      isSubmitting.value = false;
    }
  }
  
  function validateForm() {
    if (!newLocation.value.title || newLocation.value.title.trim() === '') {
      throw new Error('El título es obligatorio');
    }
    if (!newLocation.value.description) {
      throw new Error('La descripción es obligatoria');
    }
    if (!newLocation.value.address.street) {
      throw new Error('La dirección es obligatoria');
    }
    if (newLocation.value.address.coordinates.lat === null || isNaN(newLocation.value.address.coordinates.lat)) {
      throw new Error('La latitud es obligatoria y debe ser un número válido');
    }
    if (newLocation.value.address.coordinates.lng === null || isNaN(newLocation.value.address.coordinates.lng)) {
      throw new Error('La longitud es obligatoria y debe ser un número válido');
    }
    if (!newLocation.value.type) {
      throw new Error('El tipo es obligatorio');
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
  </style>