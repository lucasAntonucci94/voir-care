<template>
    <div
      v-if="visible"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-101 transition-opacity duration-300"
      @click.self="closeModal"
    >
      <div class="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-2xl relative transform transition-all duration-200">
        <!-- Botón de cierre en la esquina superior derecha -->
        <button
          @click="closeModal"
          class="absolute top-3 right-3 text-gray-500 dark:text-gray-100 dark:hover:text-gray-300 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary rounded-full p-1 transition-colors"
          aria-label="Cerrar modal"
        >
          <i class="fa-solid fa-times text-xl"></i>
        </button>
  
        <h3 class="text-xl font-semibold mb-5 text-gray-800 dark:text-gray-200">Subir Nuevo Reel</h3>
        <form @submit.prevent="uploadReel">
          <div class="mb-5">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Título</label>
            <input
              v-model="newReel.title"
              type="text"
              class="w-full dark:text-white p-2.5 border border-gray-300 dark:border-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:focus:ring-secondary dark:focus:border-secondary transition-colors duration-200"
              placeholder="Escribe un título..."
              :disabled="isLoading"
              required
            />
          </div>
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Archivo (imagen/video)</label>
            <input
              type="file"
              accept="image/*,video/*"
              @change="handleFileUpload"
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
              class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-lg hover:bg-opacity-90 focus:outline-none transition-colors duration-200 flex items-center"
              :disabled="isLoading"
            >
              <span v-if="!isLoading">Subir</span>
              <span v-else class="flex items-center">
                <i class="fa-solid fa-spinner animate-spin h-5 w-5 mr-2 text-white"></i>
                Subiendo...
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, defineProps, defineEmits } from 'vue';
  import { useReelsStore } from '../../stores/reels';
  import { useAuth } from '../../api/auth/useAuth';
  import { fileToBase64 } from '../../utils/fileToBase64';
  
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
  const { user: authUser } = useAuth();
  const newReel = ref({ title: '', base64: null, mediaType: '', thumbnailBase64: null });
  const isLoading = ref(false);
  const errorFileMessage = ref('')

  // Generar thumbnail para videos
  const generateVideoThumbnail = (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      video.addEventListener('loadeddata', () => {
        video.currentTime = 1; // Toma el frame en el segundo 1
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
  
  // Manejo de subida de archivo
  const handleFileUpload = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        errorFileMessage.value = "El tipo de archivo no es permitido. Selecciona una imagen o video.";
        event.target.value = ''; // Limpiar el input
        return;
      }
      const { base64, mediaType } = await fileToBase64(event);
      if (base64) {
        newReel.value.base64 = base64;
        newReel.value.mediaType = mediaType;
        newReel.value.thumbnailBase64 = mediaType === 'image' ? base64 : await generateVideoThumbnail(file);
      }
      errorFileMessage.value = "";
    } catch (error) {
      console.error('Error al procesar archivo o generar thumbnail:', error);
    }
  };
  
  // Subida del reel
  const uploadReel = async () => {
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
  
    await reelsStore.addReel({
      user,
      title: newReel.value.title,
      file: newReel.value.base64,
      mediaType: newReel.value.mediaType,
      thumbnail: newReel.value.thumbnailBase64,
    });
  
    newReel.value = { title: '', base64: null, mediaType: '', thumbnailBase64: null };
    emit('close');
    isLoading.value = false;
  };
  
  // Cerrar modal
  const closeModal = () => {
    errorFileMessage.value = "";
    newReel.value = { title: '', base64: null, mediaType: '', thumbnailBase64: null };
    emit('close');
  };
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
  input:focus {
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