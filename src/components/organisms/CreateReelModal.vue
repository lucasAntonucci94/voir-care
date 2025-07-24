<template>
  <teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-[101] transition-opacity duration-300"
      @click.self="closeModal"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="modalTitleId"
      ref="modalRef"
      tabindex="-1"
    >
      <section
        class="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-2xl relative transform transition-all duration-200"
      >
        <button
          @click="closeModal"
          class="absolute top-3 right-3 text-gray-500 dark:text-gray-100 dark:hover:text-gray-300 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary rounded-full p-1 transition-colors"
          aria-label="Cerrar modal"
        >
          <i class="fa-solid fa-times text-xl" aria-hidden="true"></i>
        </button>

        <h3 :id="modalTitleId" class="text-xl font-semibold mb-5 text-gray-800 dark:text-gray-200">
          {{ modalTitle }}
          <i class="fa-solid fa-video ml-2 text-primary dark:text-secondary" aria-hidden="true"></i>
          <i class="fa-solid fa-image ml-2 text-primary dark:text-secondary" aria-hidden="true"></i>
        </h3>
        <form @submit.prevent="handleSubmit" novalidate>
          <div class="mb-5">
            <label
              for="reel-title"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Título
            </label>
            <input
              id="reel-title"
              v-model="newReel.title"
              type="text"
              class="w-full dark:text-white p-2.5 border border-gray-300 dark:border-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:focus:ring-secondary dark:focus:border-secondary transition-colors duration-200"
              placeholder="Escribe un título..."
              :disabled="isLoading"
              minlength="3"
              maxlength="254"
              required
              aria-describedby="title-error"
            />
            <p
              v-if="!newReel.title && formSubmitted"
              id="title-error"
              class="text-red-500 text-sm mt-1"
              role="alert"
            >
              El título es requerido
            </p>
          </div>
          <div class="mb-6">
            <label
              for="reel-file"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Archivo (imagen/video)
            </label>
            <input
              id="reel-file"
              type="file"
              accept="image/*,video/*"
              @change="handleFileUpload"
              :class="[
                'w-full p-2 border dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary dark:file:bg-secondary file:text-white hover:file:bg-opacity-90 transition-colors duration-200',
                errorFileMessage ? 'border-red-500' : 'border-gray-300 dark:border-gray-800',
              ]"
              :disabled="isLoading"
              :required="!isEditMode && !newReel.mediaUrl || isEditMode && !newReel.mediaUrl && !newReel.base64"
              aria-describedby="file-error"
            />
            <p
              v-if="errorFileMessage"
              id="file-error"
              class="text-red-500 text-sm mt-1"
              role="alert"
            >
              {{ errorFileMessage }}
            </p>

            <div v-if="newReel.mediaUrl || newReel.base64" class="mt-2">
              <img
                v-if="newReel.mediaType === 'image'"
                :src="newReel.base64 || newReel.mediaUrl"
                alt="Preview"
                class="w-full h-48 object-cover rounded-lg shadow-sm"
              />
              <video
                v-else-if="newReel.mediaType === 'video'"
                :src="newReel.base64 || newReel.mediaUrl"
                controls
                class="w-full h-48 rounded-lg shadow-sm"
              ></video>
              <button
                type="button"
                @click="clearMedia"
                class="mt-2 px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                :disabled="isLoading"
              >
                Eliminar Media
              </button>
            </div>
          </div>
          <div class="flex justify-between space-x-3">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 bg-gray-200 text-gray-700 dark:text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-200"
            >
              <i class="fa-solid fa-close ml-2" aria-hidden="true"></i>
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary transition-colors duration-200 flex items-center"
              :disabled="isLoading || (!newReel.title) || (!newReel.base64 && !newReel.mediaUrl)"
              aria-busy="true"
            >
              <span v-if="!isLoading">
                {{ submitButtonText }}
                <i class="fa-solid fa-save ml-2" aria-hidden="true"></i>
              </span>
              <span v-else class="flex items-center">
                <i class="fa-solid fa-circle-notch animate-spin mr-2" aria-hidden="true"></i>
                {{ isEditMode ? 'Guardando...' : 'Subiendo...' }}
              </span>
            </button>
          </div>
        </form>
      </section>
    </div>
  </teleport>
</template>

<script setup>
import { ref, defineEmits, onMounted, onUnmounted, watch, computed } from 'vue';
import { useReelsStore } from '../../stores/reels';
import { useAuth } from '../../api/auth/useAuth';
import { fileToBase64 } from '../../utils/fileToBase64';
import { useSnackbarStore } from '../../stores/snackbar';
import { newGuid } from '../../utils/newGuid';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  reelToEdit: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close', 'reelCreated', 'reelUpdated']);

const reelsStore = useReelsStore();
const snackbarStore = useSnackbarStore();
const { user: authUser } = useAuth();

function initializeNewReel(data = null) {
  return {
    id: data?.id || newGuid(), // Firestore ID or new GUID
    idDoc: data?.idDoc || null, // Document ID for Firestore
    title: data?.title || '',
    mediaUrl: data?.mediaUrl || '', // Existing media URL
    thumbnailUrl: data?.thumbnailUrl || '', // Existing thumbnail URL
    mediaType: data?.mediaType || '',
    mediaPath: data?.mediaPath || '', // Existing media path in Storage
    thumbnailPath: data?.thumbnailPath || '', // Existing thumbnail path in Storage
    base64: null, // For new file upload (component's responsibility)
    thumbnailBase64: null, // For new thumbnail (component's responsibility)
    createdAt: data?.createdAt || null,
    user: data?.user || null,
    likes: data?.likes || [],
    views: data?.views || 0,
    viewDetails: data?.viewDetails || {},
    isPublic: data?.isPublic ?? true,
    status: data?.status || 'active',
  };
}

const newReel = ref(initializeNewReel());
const isLoading = ref(false);
const errorFileMessage = ref('');
const formSubmitted = ref(false);
const modalRef = ref(null);
const modalTitleId = ref(`modal-title-${newGuid()}`);

const isEditMode = computed(() => !!props.reelToEdit);
const modalTitle = computed(() => {
  return isEditMode.value ? 'Editar Historia' : 'Crea tu Historia';
});
const submitButtonText = computed(() => {
  return isEditMode.value ? 'Guardar Cambios' : 'Subir';
});

watch(() => [props.visible, props.reelToEdit], ([newVisible, newReelToEdit]) => {
  if (newVisible) {
    if (newReelToEdit) {
      newReel.value = initializeNewReel(newReelToEdit);
    }
  }
}, { deep: true, immediate: true });

const generateVideoThumbnail = (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.playsInline = true;

    video.addEventListener('loadeddata', () => {
      video.currentTime = 1;
    });

    video.addEventListener('seeked', () => {
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      const thumbSize = 160;

      const canvas = document.createElement('canvas');
      canvas.width = thumbSize;
      canvas.height = thumbSize;
      const ctx = canvas.getContext('2d');

      const side = Math.min(videoWidth, videoHeight);
      const sx = (videoWidth - side) / 2;
      const sy = (videoHeight - side) / 2;

      ctx.drawImage(video, sx, sy, side, side, 0, 0, thumbSize, thumbSize);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
      URL.revokeObjectURL(video.src);
    });

    video.addEventListener('error', (error) => {
      reject(error);
    });
  });
};

const handleFileUpload = async (event) => {
  try {
    errorFileMessage.value = '';
    const file = event.target.files[0];
    if (!file) {
      // If user cancels file selection, revert to previous state or clear
      // If in edit mode and there was an original media, restore its preview
      if (isEditMode.value && props.reelToEdit?.mediaUrl) {
        newReel.value.base64 = null; // No new file selected
        newReel.value.thumbnailBase64 = null; // No new thumbnail generated
        // Revert mediaUrl and mediaType to original if user cancelled selection
        newReel.value.mediaUrl = props.reelToEdit.mediaUrl;
        newReel.value.mediaType = props.reelToEdit.mediaType;
        newReel.value.thumbnailUrl = props.reelToEdit.thumbnailUrl;
      } else {
        clearMedia(); // Clear if it was a new creation or no original media
      }
      return;
    }

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      errorFileMessage.value = 'El tipo de archivo no es permitido. Selecciona una imagen o video.';
      event.target.value = '';
      clearMedia();
      return;
    }

    const { base64, mediaType } = await fileToBase64(event);
    if (base64) {
      newReel.value.base64 = base64;
      newReel.value.mediaType = mediaType;
      newReel.value.mediaUrl = URL.createObjectURL(file); // For local preview
      newReel.value.thumbnailBase64 = mediaType === 'image' ? base64 : await generateVideoThumbnail(file);
    }
    errorFileMessage.value = '';
  } catch (error) {
    console.error('Error al procesar archivo o generar thumbnail:', error);
    errorFileMessage.value = 'Error al procesar el archivo.';
    clearMedia();
  }
};

const clearMedia = () => {
  newReel.value.base64 = null;
  newReel.value.thumbnailBase64 = null;
  newReel.value.mediaUrl = null; // Clear preview URL
  newReel.value.mediaType = null;
  newReel.value.thumbnailUrl = null; // Clear thumbnail preview URL

  // If in edit mode and clearing existing media, store original paths to delete later in composable
  if (isEditMode.value && props.reelToEdit) {
    newReel.value.mediaPath = props.reelToEdit.mediaPath || null;
    newReel.value.thumbnailPath = props.reelToEdit.thumbnailPath || null;
  } else {
    newReel.value.mediaPath = null;
    newReel.value.thumbnailPath = null;
  }

  const fileInput = document.getElementById('reel-file');
  if (fileInput) {
    fileInput.value = '';
  }
};


const handleSubmit = async () => {
  formSubmitted.value = true;
  isLoading.value = true;

  if (!newReel.value.title || newReel.value.title.trim() === '') {
    snackbarStore.show('El título es requerido.', 'error');
    isLoading.value = false;
    return;
  }

  // If in create mode, OR in edit mode but no existing media AND no new file selected
  if (!isEditMode.value && !newReel.value.base64) {
    snackbarStore.show('Debes seleccionar una imagen o video para tu historia.', 'error');
    isLoading.value = false;
    return;
  }
  // If in edit mode and mediaUrl is cleared, and no new base64 provided
  if (isEditMode.value && !newReel.value.mediaUrl && !newReel.value.base64) {
    snackbarStore.show('Debes seleccionar una imagen o video para tu historia.', 'error');
    isLoading.value = false;
    return;
  }


  const user = {
    uid: authUser.value?.uid,
    displayName: authUser.value?.displayName || authUser.value?.email,
    photoURL: authUser.value?.photoURLFile || null,
    email: authUser.value?.email || null,
  };

  if (!user.uid) {
    snackbarStore.show('Error: Usuario no autenticado.', 'error');
    isLoading.value = false;
    return;
  }

  // Prepara los datos para enviar al store/composable
  const reelDataToSend = {
    ...newReel.value, // Envía todos los campos reactivos
    user: isEditMode.value ? newReel.value.user : user, // Mantener usuario en edición, usar authUser en creación
    // Los campos base64 y thumbnailBase64 solo estarán presentes si se seleccionó un nuevo archivo
    // Si es edición, también incluimos las rutas originales para que el composable gestione el Storage
    originalMediaPath: isEditMode.value ? props.reelToEdit?.mediaPath : null,
    originalThumbnailPath: isEditMode.value ? props.reelToEdit?.thumbnailPath : null,
    createdAt: isEditMode.value ? newReel.value.createdAt : new Date(), // Set creation date only for new reels
    // Ensure `id` is present if it's a new reel, or preserved if editing
    id: isEditMode.value ? newReel.value.id : newGuid(),
  };

  try {
    if (isEditMode.value) {
      // Llama a la acción de actualización del store
      await reelsStore.updateReel(newReel.value.idDoc, reelDataToSend);
      snackbarStore.show('Historia actualizada exitosamente', 'success');
      emit('reelUpdated', reelDataToSend); // Emitir evento de actualización
    } else {
      // Llama a la acción de creación del store
      await reelsStore.addReel(reelDataToSend);
      snackbarStore.show('Historia creada exitosamente', 'success');
      emit('reelCreated', reelDataToSend); // Emitir evento de creación
    }

    closeModal();
  } catch (error) {
    console.error('Error al guardar reel:', error);
    snackbarStore.show('Error al guardar la historia. Por favor, intenta nuevamente.', 'error');
  } finally {
    isLoading.value = false;
  }
};

const closeModal = () => {
  resetForm();
  emit('close');
};

const resetForm = () => {
  newReel.value = initializeNewReel();
  errorFileMessage.value = '';
  formSubmitted.value = false;
  const fileInput = document.getElementById('reel-file');
  if (fileInput) {
    fileInput.value = '';
  }
};

const handleEscape = (event) => {
  if (event.key === 'Escape' && props.visible) {
    closeModal();
  }
};

onMounted(() => {
  // Solo agregar el listener si el modal está visible al montar
  if (props.visible) {
    modalRef.value?.focus();
    document.addEventListener('keydown', handleEscape);
  }
});

// Watch para añadir/quitar el listener de Escape cuando `visible` cambia
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    modalRef.value?.focus();
    document.addEventListener('keydown', handleEscape);
  } else {
    document.removeEventListener('keydown', handleEscape);
  }
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape);
});
</script>

<style scoped>
/* Las estilos no se modifican */
.fixed {
  transition: opacity 0.3s ease-in-out;
}

.rounded-xl {
  border-radius: 1rem;
}

.shadow-2xl {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

input:focus,
button:focus {
  outline: none;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.transform {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>