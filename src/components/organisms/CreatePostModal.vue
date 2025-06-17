<template>
  <section class="flex justify-center mb-6">
    <input 
      type="text" 
      placeholder="¿Qué tienes en mente?" 
      @click="showModal = true" 
      class="w-full hover:bg-gray-50 max-w-lg p-4 rounded-full bg-white dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-gray-300 dark:border-gray-800 border border-gray-200 dark:border-gray-800 shadow-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary cursor-pointer text-gray-700 placeholder-gray-400 transition-all duration-200 hover:shadow-lg" 
      readonly 
    />
  </section>
  <div v-if="showModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-101 transition-opacity duration-300">
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl transform transition-all duration-300 scale-100 relative max-h-[90vh]">
      <!-- Encabezado del modal -->
      <div class="sticky top-0 bg-white dark:bg-gray-800 z-10 border-b flex items-center rounded-t-xl justify-between mb-6">
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-100 tracking-tight">Nueva Publicación</h2>
        <button @click="handleCloseModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100">
          <i class="fa-solid fa-xmark w-6 h-6"></i>
        </button>
      </div>

      <!-- Barra de progreso -->
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

      <!-- Formulario -->
      <form @submit.prevent="createPost" class="space-y-6">
        <!-- Paso 1: Datos iniciales -->
        <div v-if="currentStep === 1">
          <!-- Título -->
          <div>
            <label for="post-title" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Título</label>
            <input 
              id="post-title"
              name="title"
              v-model="newPost.title" 
              type="text" 
              placeholder="Título de tu publicación" 
              class="w-full p-3 border hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300" 
              :disabled="isLoading"
              required 
            />
            <p v-if="formErrors.title" class="text-red-500 text-sm mt-1">{{ formErrors.title }}</p>
          </div>
          <!-- Descripción -->
          <div>
            <label for="post-description" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Descripción</label>
            <textarea 
              id="post-description"
              name="description"
              v-model="newPost.description" 
              placeholder="¿Qué quieres compartir?" 
              class="w-full p-3 hover:bg-gray-100 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent bg-gray-50 text-gray-700 placeholder-gray-400 resize-y min-h-[100px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300" 
              :disabled="isLoading"
              required 
            ></textarea>
            <p v-if="formErrors.description" class="text-red-500 text-sm mt-1">{{ formErrors.description }}</p>
          </div>
        </div>

        <!-- Paso 2: Categorías -->
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
            aria-label="Seleccionar categorías"
            :disabled="isLoading"
          ></multiselect>
          <p v-if="formErrors.categories" class="text-sm text-red-500 mt-1">{{ formErrors.categories }}</p>
        </div>

        <!-- Paso 3: Multimedia -->
        <div v-if="currentStep === 3">
          <div class="relative">
            <label for="post-media" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Imagen o video</label>
            <input 
              id="post-media"
              name="media"
              type="file" 
              accept="image/*,video/*" 
              @change="handleMediaUpload" 
              :class="[
                'w-full p-2 border dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary dark:file:bg-secondary file:text-white hover:file:bg-opacity-90 transition-colors duration-200',
                errorFileMessage ? 'border-red-500' : 'border-gray-300 dark:border-gray-800'
              ]"
              :disabled="isLoading"
            />
            <p v-if="errorFileMessage" class="text-red-500 text-sm mt-1">{{ errorFileMessage }}</p>
          </div>
          <!-- Previsualización -->
          <div v-if="newPost?.media.imageBase64" class="mt-2">
            <img 
              v-if="newPost?.media.type === 'image'" 
              :src="newPost.media.imageBase64 ?? newPost.media.url ?? ''" 
              alt="Preview" 
              class="w-full h-48 object-cover rounded-lg shadow-sm" 
            />
            <video 
              v-else-if="newPost?.media.type === 'video'" 
              :src="newPost.media.imageBase64 ?? newPost.media.url ?? ''" 
              controls 
              class="w-full h-48 rounded-lg shadow-sm"
            ></video>
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
import { usePostsStore } from '../../stores/posts';
import { useCategories } from '../../composable/useCategories';
import { useSnackbarStore } from '../../stores/snackbar';
import { useThemeStore } from '../../stores/theme';
import { defineAsyncComponent } from 'vue';
import 'vue-multiselect/dist/vue-multiselect.css';

// Import vue-multiselect
const Multiselect = defineAsyncComponent(() => import('vue-multiselect'));

// Theme store for dark mode
const themeStore = useThemeStore();
const isDark = computed(() => themeStore.isDarkMode);

const { categories } = useCategories();
const { user } = useAuth();
const postsStore = usePostsStore();
const snackbarStore = useSnackbarStore();
const showModal = ref(false);
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
  user: null,
  title: '',
  description: '',
  media: {
    imageBase64: null,
    url: '',
    type: '',
    path: '',
  },
  categories: [],
});

// Bloquear/desbloquear scroll del fondo
watch(showModal, (newValue) => {
  if (newValue) {
    document.body.classList.add('overflow-hidden');
  } else {
    document.body.classList.remove('overflow-hidden');
  }
});

function handleMediaUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    errorFileMessage.value = "El tipo de archivo no es permitido. Selecciona una imagen o video.";
    event.target.value = ''; // Limpiar el input
    return;
  }
  const reader = new FileReader();
  reader.onloadend = () => {
    newPost.value.media.imageBase64 = reader.result;
    newPost.value.media.type = file.type.startsWith('image') ? 'image' : 'video';
  };
  reader.onerror = (error) => {
    console.error('Error al leer el archivo:', error);
    errorFileMessage.value = 'Error al leer el archivo';
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
  // Step 3 (Multimedia) is optional, so no validation required

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
  isLoading.value = true;
  try {
    // Validate all steps
    for (let i = 1; i <= steps.value.length; i++) {
      if (!validateStep(i)) {
        currentStep.value = i;
        isLoading.value = false;
        return;
      }
    }

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

    await postsStore.addPost(postData);
    snackbarStore.show("Publicación creada exitosamente.", "success");
    handleCloseModal();
  } catch (error) {
    snackbarStore.show(`Error al crear la publicación. Error: ${error}`, "error");
  } finally {
    isLoading.value = false;
  }
}

function handleCloseModal() {
  showModal.value = false;
  currentStep.value = 1;
  newPost.value = {
    user: null,
    title: '',
    description: '',
    media: {
      imageBase64: null,
      url: '',
      type: '',
      path: '',
    },
    categories: [],
  };
  errorFileMessage.value = '';
  formErrors.value = {};
}
</script>

<style scoped>
/* Estilos para el scroll del modal */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #02bcae transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #02bcae;
  border-radius: 3px;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: var(--color-secondary-md); /* #D8690E for dark mode */
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.dark .overflow-y-auto::-webkit-scrollbar-track {
  background: #1F2937;
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