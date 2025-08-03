<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-101 transition-opacity duration-300">
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl transform transition-all duration-300 scale-100 relative max-h-[90vh]">
      <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 tracking-tight">
        Nueva publicación en el evento
      </h2>

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

      <!-- Form -->
      <form @submit.prevent="createPost" class="space-y-6">
        <!-- Step 1: Title and Description -->
        <div v-if="currentStep === 1">
          <!-- Title -->
          <div class="mb-4">
            <label for="event-post-title" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Título</label>
            <input
              id="event-post-title"
              name="title"
              v-model="newPost.title"
              type="text"
              placeholder="Título de tu publicación"
              class="w-full p-3 border hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
              :disabled="isLoading"
              :maxlength="50"
              :minlength="1"
              :aria-invalid="formErrors.title ? 'true' : 'false'"
              :aria-describedby="formErrors.title ? 'title-error' : null"
              :aria-label="`Título de la publicación, máximo 50 caracteres`"
              required
            />
            <p v-if="formErrors.title" id="title-error" class="text-red-500 text-sm mt-1">{{ formErrors.title }}</p>
          </div>
          <!-- Description -->
          <div class="mb-4">
            <label for="event-post-description" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Descripción</label>
            <textarea
              id="event-post-description"
              name="description"
              v-model="newPost.description"
              placeholder="¿Qué quieres compartir sobre este evento?"
              class="w-full p-3 border hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent bg-gray-50 text-gray-700 placeholder-gray-400 resize-y min-h-[100px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
              :disabled="isLoading"
              :maxlength="250"
              :minlength="1"
              :aria-invalid="formErrors.description ? 'true' : 'false'"
              :aria-describedby="formErrors.description ? 'description-error' : null"
              :aria-label="`Descripción de la publicación, máximo 250 caracteres`"
              required
            ></textarea>
            <p v-if="formErrors.description" id="description-error" class="text-red-500 text-sm mt-1">{{ formErrors.description }}</p>
          </div>
        </div>

        <!-- Step 2: Categories -->
        <div v-if="currentStep === 2">
          <label for="postCategories" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Categorías</label>
          <multiselect
            v-model="newPost.categories"
            :options="categories"
            :multiple="true"
            :class="{ 'dark': isDark }"
            placeholder="Seleccionar categorías"
            label="name"
            track-by="id"
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
          ></multiselect>
          <p v-if="formErrors.categories" id="categories-error" class="text-sm text-red-500 mt-1">{{ formErrors.categories }}</p>
        </div>

        <!-- Step 3: Multimedia -->
        <div v-if="currentStep === 3">
          <div class="relative">
            <label for="event-post-media" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Imagen o video</label>
            <input
              id="event-post-media"
              name="media"
              type="file"
              accept="image/*,video/*"
              @change="handleMediaUpload"
              :class="[
                'w-full p-2 border dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary dark:file:bg-secondary file:text-white hover:file:bg-opacity-90 transition-colors duration-200',
                errorFileMessage ? 'border-red-500' : 'border-gray-300 dark:border-gray-800'
              ]"
              aria-label="Subir imagen o video"
              :aria-invalid="!!errorFileMessage"
              :aria-describedby="errorFileMessage ? 'media-error' : null"
              :disabled="isLoading"
            />
            <p v-if="errorFileMessage" id="media-error" class="text-red-500 text-sm mt-1">{{ errorFileMessage }}</p>
          </div>
          <!-- Preview -->
          <div v-if="newPost.media.imageBase64" class="mt-2">
            <img
              v-if="newPost.media.type === 'image'"
              :src="newPost.media.imageBase64"
              alt="Vista previa de la imagen"
              class="w-full h-48 object-cover rounded-lg shadow-sm"
              :aria-label="`Vista previa de la imagen`"
              @contextmenu.prevent
              @dragover.prevent
              @drop.prevent
              @dragenter.prevent
              @dragleave.prevent
              @dragstart.prevent
              @dragend.prevent
            />
            <video
              v-else-if="newPost.media.type === 'video'"
              :src="newPost.media.imageBase64"
              autoplay
              loop
              muted
              class="w-full h-48 rounded-lg shadow-sm"
              :aria-label="`Vista previa del video`"
              @contextmenu.prevent
              @dragover.prevent
              @drop.prevent
              @dragenter.prevent
              @dragleave.prevent
              @dragstart.prevent
              @dragend.prevent
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
            aria-label="Cancelar creación de publicación"
          >
            <i class="fa-solid fa-times"></i>
            <p class="hidden md:block">Cancelar</p>
          </button>
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
            aria-label="Crear publicación"
          >
            <i v-if="isLoading" class="fa-solid fa-circle-notch animate-spin"></i>
            <p class="hidden md:block">
              {{ isLoading ? 'Publicando...' : 'Publicar' }}
            </p>
            <i v-if="!isLoading" class="fa-solid fa-save"></i>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useAuth } from '../../api/auth/useAuth';
import { useCategories } from '../../composable/useCategories';
import { useEventPostsStore } from '../../stores/eventPosts';
import { useSnackbarStore } from '../../stores/snackbar';
import { useThemeStore } from '../../stores/theme';
import { defineAsyncComponent } from 'vue';
import 'vue-multiselect/dist/vue-multiselect.css';

// Import vue-multiselect
const Multiselect = defineAsyncComponent(() => import('vue-multiselect'));

// Theme store for dark mode
const themeStore = useThemeStore();
const isDark = computed(() => themeStore.isDarkMode);

const props = defineProps({ eventId: String });
const emit = defineEmits(['close']);

const { categories } = useCategories();
const { user } = useAuth();
const eventPostsStore = useEventPostsStore();
const snackbarStore = useSnackbarStore();

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

const newPost = ref({
  title: '',
  description: '',
  media: {
    imageBase64: '',
    url: '',
    type: '',
    path: '',
  },
  categories: [],
});

// Control body scroll
watch(() => currentStep.value, () => {
  document.body.classList.add('overflow-hidden');
}, { immediate: true });
watch(() => props.eventId, (val) => {
  if (!val) {
    document.body.classList.remove('overflow-hidden');
    emit('close');
  }
});

function handleMediaUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    errorFileMessage.value = 'Selecciona una imagen o video válido.';
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onloadend = () => {
    newPost.value.media.imageBase64 = reader.result;
    newPost.value.media.type = file.type.startsWith('image') ? 'image' : 'video';
  };
  reader.onerror = (error) => {
    console.error('Error al leer el archivo:', error);
    errorFileMessage.value = 'Error al cargar el archivo.';
  };
  reader.readAsDataURL(file);
}

function validateStep(step) {
  let isValid = true;
  const errors = {};

  if (step === 1) {
    if (!newPost.value.title || newPost.value.title.trim() === '') {
      errors.title = 'El título es obligatorio';
      isValid = false;
    }
    if (newPost.value.title.length > 50) {
      errors.title = 'El título no debe superar los 50 caracteres';
      isValid = false;
    }
    if (!newPost.value.description || newPost.value.description.trim() === '') {
      errors.description = 'La descripción es obligatoria';
      isValid = false;
    }
    if (newPost.value.description.length > 250) {
      errors.description = 'La descripción no debe superar los 250 caracteres';
      isValid = false;
    }
  } else if (step === 2) {
    if (!newPost.value.categories || newPost.value.categories.length === 0) {
      errors.categories = 'Selecciona al menos una categoría';
      isValid = false;
    }
  }
  // Step 3 (Multimedia) is optional

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

async function createPost() {
  if (!validateStep(1) || !validateStep(2)) {
    currentStep.value = !validateStep(1) ? 1 : 2;
    return;
  }

  isLoading.value = true;
  const postData = {
    user: {
      id: user.value.uid || user.value.id,
      displayName: user.value.displayName || 'No ha definido un displayName',
      firstName: user.value.firstName || 'No ha definido un nombre',
      lastName: user.value.lastName || 'No ha definido un apellido',
      email: user.value.email || 'No ha definido un correo',
      phoneNumber: user.value.phoneNumber || 'No ha definido un número de teléfono',
      birthday: user.value.birthday || 'No ha definido una fecha de nacimiento',
      genre: user.value.genre || 'No ha definido un género',
      country: user.value.country || 'No ha definido un país',
      photoURL: user.value.photoURL || null,
      photoURLFile: user.value.photoURLFile || null,
    },
    title: newPost.value.title,
    body: newPost.value.description,
    media: newPost.value.media,
    categories: newPost.value.categories,
  };

  try {
    await eventPostsStore.createPostEvent(props.eventId, postData);
    snackbarStore.show('Publicación creada exitosamente.', 'success');
    handleCloseModal();
    emit('close');
  } catch (err) {
    console.error('Error creando post del evento:', err);
    snackbarStore.show(`Error al crear la publicación. Error: ${err}`, 'error');
  } finally {
    isLoading.value = false;
  }
}

function handleCloseModal() {
  document.body.classList.remove('overflow-hidden');
  newPost.value = {
    title: '',
    description: '',
    media: {
      imageBase64: '',
      url: '',
      type: '',
      path: '',
    },
    categories: [],
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