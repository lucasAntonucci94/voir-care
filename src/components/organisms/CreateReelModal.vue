<template>
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
      <!-- Close button -->
      <button
        @click="closeModal"
        class="absolute top-3 right-3 text-gray-500 dark:text-gray-100 dark:hover:text-gray-300 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary rounded-full p-1 transition-colors"
        aria-label="Cerrar modal"
      >
        <i class="fa-solid fa-times text-xl" aria-hidden="true"></i>
      </button>

      <h3 :id="modalTitleId" class="text-xl font-semibold mb-5 text-gray-800 dark:text-gray-200">
        Subir Nuevo Reel
      </h3>
      <form @submit.prevent="uploadReel" novalidate>
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
            required
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
        </div>
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 bg-gray-200 text-gray-700 dark:text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary transition-colors duration-200 flex items-center"
            :disabled="isLoading || (!newReel.base64 && !newReel.title)"
            aria-busy="true"
          >
            <span v-if="!isLoading">Subir</span>
            <span v-else class="flex items-center">
              <i class="fa-solid fa-circle-notch animate-spin mr-2" aria-hidden="true"></i>
              Subiendo...
            </span>
          </button>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup>
import { ref, defineEmits, onMounted, onUnmounted } from 'vue';
import { useReelsStore } from '../../stores/reels';
import { useAuth } from '../../api/auth/useAuth';
import { fileToBase64 } from '../../utils/fileToBase64';
import { useSnackbarStore } from '../../stores/snackbar';
import { newGuid } from '../../utils/newGuid';
// Props y eventos
const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['close']);

// Estado
const reelsStore = useReelsStore();
const snackbarStore = useSnackbarStore();
const { user: authUser } = useAuth();
const newReel = ref({ title: '', base64: null, mediaType: '', thumbnailBase64: null });
const isLoading = ref(false);
const errorFileMessage = ref('');
const formSubmitted = ref(false);
const modalRef = ref(null);
const modalTitleId = ref(`modal-title-${newGuid()}`);

// Generar thumbnail para videos
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
      resolve(canvas.toDataURL('image/jpeg'));
    });

    video.addEventListener('error', (error) => {
      reject(error);
    });
  });
};

// Manejo de subida de archivo
const handleFileUpload = async (event) => {
  try {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      errorFileMessage.value = 'El tipo de archivo no es permitido. Selecciona una imagen o video.';
      event.target.value = '';
      return;
    }
    const { base64, mediaType } = await fileToBase64(event);
    if (base64) {
      newReel.value.base64 = base64;
      newReel.value.mediaType = mediaType;
      newReel.value.thumbnailBase64 = mediaType === 'image' ? base64 : await generateVideoThumbnail(file);
    }
    errorFileMessage.value = '';
  } catch (error) {
    console.error('Error al procesar archivo o generar thumbnail:', error);
    errorFileMessage.value = 'Error al procesar el archivo.';
  }
};

// Subida del reel
const uploadReel = async () => {
  formSubmitted.value = true;
  isLoading.value = true;
  if (!newReel.value.title || !newReel.value.base64 || !newReel.value.thumbnailBase64 || !authUser.value) {
    isLoading.value = false;
    return;
  }
  const user = {
    uid: authUser.value.uid,
    displayName: authUser.value.displayName || authUser.value.email,
    photoURL: authUser.value.photoURLFile || null,
    email: authUser.value.email || null,
  };

  try {
    await reelsStore.addReel({
      user,
      title: newReel.value.title,
      file: newReel.value.base64,
      mediaType: newReel.value.mediaType,
      thumbnail: newReel.value.thumbnailBase64,
    });
    snackbarStore.show('Reel creado exitosamente', 'success');
    closeModal();
  } catch (error) {
    console.error('Error al subir reel:', error);
    snackbarStore.show('Error al subir el reel', 'error');
  } finally {
    isLoading.value = false;
  }
};

// Cerrar modal
const closeModal = () => {
  errorFileMessage.value = '';
  newReel.value = { title: '', base64: null, mediaType: '', thumbnailBase64: null };
  formSubmitted.value = false;
  emit('close');
};

// Manejar tecla Escape
const handleEscape = (event) => {
  if (event.key === 'Escape' && props.visible) {
    closeModal();
  }
};

// Enfocar modal al abrir
onMounted(() => {
  if (props.visible) {
    modalRef.value?.focus();
    document.addEventListener('keydown', handleEscape);
    isLoading.value = false;
  }
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape);
});
</script>

<style scoped>
/* Transición suave para el modal */
.fixed {
  transition: opacity 0.3s ease-in-out;
}

/* Mejorar la apariencia del modal */
.rounded-xl {
  border-radius: 1rem;
}

.shadow-2xl {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Ajustar inputs y botones */
input:focus,
button:focus {
  outline: none;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Animación de entrada del modal */
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