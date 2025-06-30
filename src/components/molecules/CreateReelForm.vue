<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Title -->
    <div>
      <label for="reel-title" class="sr-only">Título</label>
      <input
        id="reel-title"
        v-model="newReel.title"
        type="text"
        placeholder="Título del reel"
        class="w-full p-3 border hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
        :disabled="isLoading"
        required
      />
    </div>
    <!-- Media Input -->
    <div class="relative">
      <label for="reel-media" class="sr-only">Imagen o video</label>
      <input
        id="reel-media"
        type="file"
        accept="image/*,video/*"
        @change="handleFileUpload"
        :class="[
          'w-full p-2 border dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary dark:file:bg-secondary file:text-white hover:file:bg-opacity-90 transition-colors duration-200',
          errorFileMessage ? 'border-red-500' : 'border-gray-300 dark:border-gray-800',
        ]"
        :disabled="isLoading"
        required
      />
      <p v-if="errorFileMessage" class="text-red-500 text-sm mt-1">{{ errorFileMessage }}</p>
    </div>
    <!-- Media Preview -->
    <div v-if="newReel.base64" class="mt-2">
      <img
        v-if="newReel.mediaType === 'image'"
        :src="newReel.base64"
        alt="Preview"
        class="w-full h-48 object-cover rounded-lg shadow-sm"
      />
      <video
        v-else-if="newReel.mediaType === 'video'"
        :src="newReel.base64"
        controls
        class="w-full h-48 rounded-lg shadow-sm"
      ></video>
    </div>
    <!-- Buttons -->
    <div class="flex justify-end gap-3">
      <button
        type="button"
        @click="handleCancel"
        class="px-5 py-2 text-gray-500 dark:bg-gray-500 dark:text-gray-100 font-medium rounded-lg hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
      >
        Cancelar
      </button>
      <button
        type="submit"
        class="relative px-5 py-2 bg-primary dark:bg-secondary text-white font-medium rounded-lg hover:bg-primary-md dark:hover:bg-secondary-md transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-primary-md dark:disabled:bg-secondary-md disabled:cursor-not-allowed"
        :disabled="isLoading || errorFileMessage || !newReel.title || !newReel.base64"
      >
        <span v-if="!isLoading">Subir</span>
        <span v-else class="flex items-center gap-2">
          <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          Subiendo...
        </span>
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import { useAuth } from '../../api/auth/useAuth';
import { useReelsStore } from '../../stores/reels';
import { fileToBase64 } from '../../utils/fileToBase64';
import { useSnackbarStore } from '../../stores/snackbar';

const { user } = useAuth();
const reelsStore = useReelsStore();
const snackbarStore = useSnackbarStore();

const emit = defineEmits(['close']);

const newReel = ref({
  title: '',
  base64: null,
  mediaType: '',
  thumbnailBase64: null,
});

const isLoading = ref(false);
const errorFileMessage = ref('');

// Generate thumbnail for videos
const generateVideoThumbnail = (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.addEventListener('loadeddata', () => {
      video.currentTime = 1; // Capture frame at 1 second
    });
    video.addEventListener('seeked', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 90;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg'));
    });
    video.addEventListener('error', (error) => reject(error));
  });
};

// Handle media upload
async function handleFileUpload(event) {
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
      errorFileMessage.value = '';
    }
  } catch (error) {
    console.error('Error al procesar archivo o generar thumbnail:', error);
    errorFileMessage.value = 'Error al procesar el archivo.';
  }
}

// Handle form submission
async function handleSubmit() {
  isLoading.value = true;

  if (!newReel.value.title || !newReel.value.base64 || !newReel.value.thumbnailBase64 || !user.value) {
    snackbarStore.show('Por favor completa todos los campos requeridos', 'error');
    isLoading.value = false;
    return;
  }

  const userData = {
    uid: user.value.uid,
    displayName: user.value.displayName || user.value.email,
    photoURL: user.value.photoURLFile || null,
    email: user.value.email || null,
  };

  try {
    await reelsStore.addReel({
      user: userData,
      title: newReel.value.title,
      file: newReel.value.base64,
      mediaType: newReel.value.mediaType,
      thumbnail: newReel.value.thumbnailBase64,
    });
    resetForm();
    snackbarStore.show('Reel creado exitosamente', 'success');
    emit('close');
  } catch (error) {
    console.error('Error al crear el reel:', error);
    snackbarStore.show('Error al crear el reel', 'error');
  } finally {
    isLoading.value = false;
  }
}

// Handle cancel
function handleCancel() {
  resetForm();
  emit('close');
}

// Reset form
function resetForm() {
  newReel.value = {
    title: '',
    base64: null,
    mediaType: '',
    thumbnailBase64: null,
  };
  errorFileMessage.value = '';
}
</script>