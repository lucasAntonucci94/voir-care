<template>
  <div v-if="visible" class="fixed inset-0 bg-black/60 z-101 flex items-center justify-center p-4 overflow-hidden">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
      <div class="sticky top-0 bg-white dark:bg-gray-800 z-10 p-6 border-b rounded-t-xl">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-300">Editar posteo</h3>
          <button @click="handleCloseModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100" aria-label="Cerrar modal">
            <i class="fa-solid fa-xmark w-6 h-6"></i>
          </button>
        </div>
      </div>
      <div class="p-6">
        <!-- Progress Bar -->
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

        <form @submit.prevent="editPost" class="space-y-6">
          <!-- Step 1: Title and Body -->
          <div v-if="currentStep === 1">
            <!-- Título -->
            <div class="mb-4">
              <label for="edit-post-title" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Título</label>
              <input
                v-model="editForm.title"
                id="edit-post-title"
                type="text"
                placeholder="Título de tu publicación"
                class="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary dark:focus:bg-gray-600 focus:border-transparent bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                :class="formErrors.title ? 'border-red-500' : ''"
                :disabled="isLoading"
                :maxlength="50"
                :minlength="1"
                :aria-invalid="formErrors.title ? 'true' : 'false'"
                :aria-describedby="formErrors.title ? 'title-error' : null"
                aria-label="Título de la publicación, máximo 50 caracteres"
                required
              />
              <p v-if="formErrors.title" id="title-error" class="text-red-500 text-sm mt-1">{{ formErrors.title }}</p>
            </div>

            <!-- Cuerpo -->
            <div class="mb-4">
              <label for="edit-post-body" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Descripción</label>
              <textarea
                v-model="editForm.body"
                id="edit-post-body"
                placeholder="¿Qué quieres compartir?"
                class="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary dark:focus:bg-gray-600 focus:border-transparent bg-gray-50 text-gray-700 placeholder-gray-400 resize-y min-h-[100px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                :class="formErrors.body ? 'border-red-500' : ''"
                :disabled="isLoading"
                :maxlength="250"
                :minlength="1"
                :aria-invalid="formErrors.body ? 'true' : 'false'"
                :aria-describedby="formErrors.body ? 'body-error' : null"
                aria-label="Cuerpo de la publicación, máximo 250 caracteres"
                required
              ></textarea>
              <p v-if="formErrors.body" id="body-error" class="text-red-500 text-sm mt-1">{{ formErrors.body }}</p>
            </div>
          </div>

          <!-- Step 2: Categories -->
          <div v-if="currentStep === 2">
            <label for="edit-post-categories" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Categorías</label>
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
              :show-labels="false"
              :close-on-select="true"
              :allow-empty="false"
              :max-height="200"
              :show-no-results="false"
              :searchable="true"
              :loading="isLoading"
            ></multiselect>
            <p v-if="formErrors.categories" id="categories-error" class="text-red-500 text-sm mt-1">{{ formErrors.categories }}</p>
          </div>

          <!-- Step 3: Multimedia -->
          <div v-if="currentStep === 3">
            <div class="relative">
              <label for="edit-post-media" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Imagen o video</label>
              <input
                type="file"
                id="edit-post-media"
                accept="image/*,video/*"
                @change="handleMediaUpload"
                :disabled="isLoading"
                class="w-full p-2.5 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border rounded-lg text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary dark:file:bg-secondary file:text-white hover:file:bg-primary-md dark:hover:file:bg-secondary-md transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                :class="errorFileMessage ? 'border-red-500 border' : 'border-gray-200 dark:border-gray-800'"
                aria-label="Subir imagen o video"
                :aria-invalid="!!errorFileMessage"
                :aria-describedby="errorFileMessage ? 'media-error' : null"
              />
              <p v-if="errorFileMessage" id="media-error" class="text-red-500 text-sm mt-1">{{ errorFileMessage }}</p>
            </div>

            <!-- Previsualización -->
            <div v-if="editForm.media.url || editForm.media.imageBase64" class="mt-2">
              <img
                v-if="editForm.media.type === 'image'"
                :src="editForm.media.imageBase64 || editForm.media.url"
                alt="Preview"
                class="w-full h-48 object-cover rounded-lg shadow-sm"
                aria-label="Vista previa de la imagen"
              />
              <video
                v-else-if="editForm.media.type === 'video'"
                :src="editForm.media.imageBase64 || editForm.media.url"
                controls
                class="w-full h-48 rounded-lg shadow-sm"
                aria-label="Vista previa del video"
              ></video>
            </div>
          </div>

          <!-- Navigation Buttons -->
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
              @click="handleCloseModal"
              :disabled="isLoading"
              class="px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              aria-label="Cancelar edición de publicación"
            >
              <i class="fa-solid fa-times"></i>
              <p class="hidden md:block">Cancelar</p>
            </button>
            <div class="flex-grow"></div> <!-- Empuja los botones a los extremos -->
            <button
              v-if="currentStep < steps.length"
              type="button"
              @click="nextStep"
              :disabled="isLoading"
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
              aria-label="Guardar publicación"
            >
              <i v-if="isLoading" class="fa-solid fa-circle-notch animate-spin"></i>
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
import { ref, computed, defineEmits, onMounted, watch } from 'vue';
import { useEventPostsStore } from '../../stores/eventPosts';
import { useCategories } from '../../composable/useCategories';
import { useMediaUpload } from '../../composable/useMediaUpload';
import { useThemeStore } from '../../stores/theme';
import { defineAsyncComponent } from 'vue';
import 'vue-multiselect/dist/vue-multiselect.css';
import { useSnackbarStore } from '../../stores/snackbar';

// Import vue-multiselect
const Multiselect = defineAsyncComponent(() => import('vue-multiselect'));

// Theme store for dark mode
const themeStore = useThemeStore();
const isDark = computed(() => themeStore.isDarkMode);

const props = defineProps({
  post: { type: Object, required: true },
  visible: { type: Boolean, required: true },
});

const emit = defineEmits(['update-post', 'close']);

const eventPostsStore = useEventPostsStore();
const { categories } = useCategories();
const { uploadMedia } = useMediaUpload();
const snackbarStore = useSnackbarStore();

const editForm = ref({
  id: null,
  title: '',
  body: '',
  categories: [],
  media: {
    url: '',
    path: '',
    type: '',
    imageBase64: null,
  },
});
const isLoading = ref(false);
const errorFileMessage = ref('');
const formErrors = ref({});

// Stepper state
const currentStep = ref(1);
const steps = ref([
  { label: 'Datos iniciales' },
  { label: 'Categorías' },
  { label: 'Multimedia' },
]);

// Initialize form when post prop changes or component is mounted
watch(() => props.post, (newPost) => {
  if (newPost) {
    editForm.value = {
      id: newPost.id || null,
      title: newPost.title || '',
      body: newPost.body || '',
      categories: newPost.categories ? [...newPost.categories] : [],
      media: {
        url: newPost.media?.url || '',
        path: newPost.media?.path || '',
        type: newPost.media?.type || '',
        imageBase64: null,
      },
    };
    formErrors.value = {};
    errorFileMessage.value = '';
    currentStep.value = 1;
  }
}, { immediate: true });

// Control body scroll when modal visibility changes
watch(() => props.visible, (newValue) => {
  if (newValue) {
    document.body.classList.add('overflow-hidden');
  } else {
    document.body.classList.remove('overflow-hidden');
  }
}, { immediate: true });

function handleMediaUpload(event) {
  errorFileMessage.value = '';
  const file = event.target.files[0];
  if (!file) {
    editForm.value.media.imageBase64 = null;
    return;
  }

  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    errorFileMessage.value = 'Selecciona una imagen o video válido.';
    event.target.value = '';
    editForm.value.media.imageBase64 = null;
    return;
  }

  const reader = new FileReader();
  reader.onloadend = () => {
    editForm.value.media.imageBase64 = reader.result;
    editForm.value.media.type = file.type.startsWith('image') ? 'image' : 'video';
  };
  reader.onerror = (error) => {
    console.error('Error al leer el archivo:', error);
    errorFileMessage.value = 'Error al cargar el archivo.';
    editForm.value.media.imageBase64 = null;
  };
  reader.readAsDataURL(file);
}

function validateStep(step) {
  let isValid = true;
  const errors = {};

  if (step === 1) {
    if (!editForm.value.title || editForm.value.title.trim() === '') {
      errors.title = 'El título es obligatorio';
      isValid = false;
    } else if (editForm.value.title.length > 50) {
      errors.title = 'El título no debe superar los 50 caracteres';
      isValid = false;
    }
    if (!editForm.value.body || editForm.value.body.trim() === '') {
      errors.body = 'La descripción es obligatoria';
      isValid = false;
    } else if (editForm.value.body.length > 250) {
      errors.body = 'La descripción no debe superar los 250 caracteres';
      isValid = false;
    }
  } else if (step === 2) {
    if (!editForm.value.categories || editForm.value.categories.length === 0) {
      errors.categories = 'Selecciona al menos una categoría';
      isValid = false;
    } else if (editForm.value.categories.length > 3) {
      errors.categories = 'Puedes seleccionar un máximo de 3 categorías';
      isValid = false;
    }
  }
  // Step 3 (Multimedia) optional
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
  formErrors.value = {};
  errorFileMessage.value = '';
}

async function editPost() {
  let allStepsValid = true;
  for (let i = 1; i <= steps.value.length; i++) {
    if (!validateStep(i)) {
      currentStep.value = i;
      snackbarStore.show('Por favor, completa todos los campos requeridos.', 'error');
      allStepsValid = false;
      break;
    }
  }

  if (!allStepsValid) {
    return;
  }

  isLoading.value = true;
  try {
    let mediaUrl = editForm.value.media.url;
    let mediaPath = editForm.value.media.path;
    let mediaType = editForm.value.media.type;

    if (editForm.value.media.imageBase64) {
      const dynamicPath = `events/${props.post.event.id}/posts/${props.post.user.email}/${editForm.value.id}`;
      const uploadResult = await uploadMedia({
        currentUrl: editForm.value.media.url,
        currentPath: editForm.value.media.path,
        newMediaBase64: editForm.value.media.imageBase64,
        mediaType: editForm.value.media.type,
        dynamicPath,
      });
      mediaUrl = uploadResult.url;
      mediaPath = uploadResult.path;
      mediaType = editForm.value.media.type;
    } else if (!editForm.value.media.url && !editForm.value.media.imageBase64) {
      mediaUrl = null;
      mediaPath = null;
      mediaType = null;
    }

    const updatedPost = {
      ...props.post,
      title: editForm.value.title,
      body: editForm.value.body,
      categories: editForm.value.categories,
      media: {
        url: mediaUrl,
        path: mediaPath,
        type: mediaType,
      },
    };

    await eventPostsStore.updatePostEvent(updatedPost.event.id, updatedPost.idDoc, updatedPost);

    snackbarStore.show('Publicación actualizada exitosamente.', 'success');
    emit('update-post', updatedPost);
    handleCloseModal();
  } catch (error) {
    console.error('Error al actualizar el post:', error);
    snackbarStore.show(`Error al actualizar la publicación: ${error.message}`, 'error');
  } finally {
    isLoading.value = false;
  }
}

function handleCloseModal() {
  document.body.classList.remove('overflow-hidden');
  editForm.value = {
    id: props.post?.id || null,
    title: props.post?.title || '',
    body: props.post?.body || '',
    categories: props.post?.categories ? [...props.post.categories] : [],
    media: {
      url: props.post?.media?.url || '',
      path: props.post?.media?.path || '',
      type: props.post?.media?.type || '',
      imageBase64: null,
    },
  };
  errorFileMessage.value = '';
  formErrors.value = {};
  currentStep.value = 1;
  emit('close');
}
</script>

<style scoped>
/* Animation for stepper */
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
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.2);
  }
}
</style>