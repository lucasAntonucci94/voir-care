<template>
  <div v-if="visible" class="fixed inset-0 bg-black/60 z-101 flex items-center justify-center p-4 overflow-hidden">
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl transform transition-all duration-300 scale-100 relative max-h-[90vh]">
      <!-- Encabezado del modal -->
      <div class="sticky top-0 bg-white dark:bg-gray-800 z-10 border-b flex items-center rounded-t-xl justify-between mb-6">
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-100 tracking-tight">Editar  Publicación</h2>
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
      <form @submit.prevent="savePost" class="space-y-6">
        <!-- Paso 1: Datos iniciales -->
        <div v-if="currentStep === 1">
          <!-- Título -->
          <div>
            <label for="post-title" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Título</label>
            <input 
              id="post-title"
              name="title"
              v-model="editForm.title" 
              type="text" 
              placeholder="Título de tu publicación" 
              class="mb-2 w-full p-3 border hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300" 
              :disabled="isLoading"
              :maxlength="50"
              :minlength="1"
              :aria-invalid="formErrors.title ? 'true' : 'false'"
              :aria-describedby="formErrors.title ? 'title-error' : null"
              :aria-label="`Título de la publicación, máximo 50 caracteres`"
              required 
            />
            <p v-if="formErrors.title" class="text-red-500 text-sm mb-2 mt-1">{{ formErrors.title }}</p>
          </div>
          <!-- Descripción -->
          <div>
            <label for="post-body" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Descripción</label>
            <textarea 
              id="post-body"
              name="body"
              v-model="editForm.body" 
              placeholder="¿Qué quieres compartir?" 
              class="mb-2 w-full p-3 hover:bg-gray-100 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent bg-gray-50 text-gray-700 placeholder-gray-400 resize-y min-h-[100px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300" 
              :disabled="isLoading"
              :maxlength="250"
              :minlength="1"
              :aria-invalid="formErrors.body ? 'true' : 'false'"
              :aria-describedby="formErrors.body ? 'body-error' : null"
              :aria-label="`Descripción de la publicación, máximo 250 caracteres`"
              required 
            ></textarea>
            <p v-if="formErrors.body" class="mb-2 text-red-500 text-sm mt-1">{{ formErrors.body }}</p>
          </div>
        </div>

        <!-- Paso 2: Categorías -->
        <div v-if="currentStep === 2">
          <label for="postCategories" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Categorías</label>
          <multiselect
            v-model="editForm.categories"
            :options="categories"
            :multiple="true"
            :class="{ 'dark': isDark }, 'mb-2'"
            placeholder="Seleccionar categorías"
            label="name"
            track-by="id"
            aria-label="Seleccionar categorías"
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
          <p v-if="formErrors.categories" class="mb-2 text-sm text-red-500 mt-1">{{ formErrors.categories }}</p>
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
                'mb-2 w-full p-2 border dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary dark:file:bg-secondary file:text-white hover:file:bg-opacity-90 transition-colors duration-200',
                errorFileMessage ? 'border-red-500' : 'border-gray-300 dark:border-gray-800'
              ]"
              aria-label="Subir imagen o video"
              aria-describedby="media-error"
              :aria-invalid="!!errorFileMessage"
              :aria-required="true"
              :aria-describedby="errorFileMessage ? 'media-error' : null"
              :placeholder="`Selecciona una imagen o video`"
              class="cursor-pointer"
              :disabled="isLoading"
            />
            <p v-if="errorFileMessage" class="mb-2 text-red-500 text-sm mt-1">{{ errorFileMessage }}</p>
          </div>
          <!-- Previsualización -->
          <div v-if="editForm?.media.imageBase64 || editForm.media.url" class="mt-2">
            <img 
              v-if="editForm?.media.type === 'image'" 
              :src="editForm.media.imageBase64 ?? editForm.media.url ?? ''" 
              alt="Preview" 
              class="mb-2 w-full h-48 object-cover rounded-lg shadow-sm" 
              :aria-label="`Vista previa de la imagen`"
              :aria-describedby="editForm.media.imageBase64 ? 'media-preview' : null"
              :aria-invalid="!editForm.media.imageBase64"
              :aria-required="true"
              @contextmenu.prevent
              @dragover.prevent
              @drop.prevent
              @dragenter.prevent
              @dragleave.prevent
              @dragstart.prevent
              @dragend.prevent
              @drag="event => event.preventDefault()"
              @dragenter="event => event.preventDefault()"
              @dragleave="event => event.preventDefault()"
              @dragover="event => event.preventDefault()"
              @dragend="event => event.preventDefault()"
              @dragstart="event => event.preventDefault()"
            />
            <video 
              v-else-if="editForm?.media.type === 'video'" 
              :src="editForm.media.imageBase64 ?? editForm.media.url ?? ''" 
              autoplay 
              loop
              muted
              alt="Preview" 
              class="mb-2 w-full h-48 object-cover rounded-lg shadow-sm" 
              :aria-label="`Vista previa de la imagen`"
              :aria-describedby="editForm.media.imageBase64 ? 'media-preview' : null"
              :aria-invalid="!editForm.media.imageBase64"
              :aria-required="true"
              @contextmenu.prevent
              @dragover.prevent
              @drop.prevent
              @dragenter.prevent
              @dragleave.prevent
              @dragstart.prevent
              @dragend.prevent
              @drag="event => event.preventDefault()"
              @dragenter="event => event.preventDefault()"
              @dragleave="event => event.preventDefault()"
              @dragover="event => event.preventDefault()"
              @dragend="event => event.preventDefault()"
              @dragstart="event => event.preventDefault()"
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
              {{ isLoading ? 'Guardando...' : 'Guardar' }}
            </p>
            <i v-if="!isLoading" class="fa-solid fa-save"></i>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits, onMounted, computed, watch } from 'vue';
import { usePostsStore } from '../../stores/posts';
import { useCategories } from '../../composable/useCategories';
import { useMediaUpload } from '../../composable/useMediaUpload';
import { useThemeStore } from '../../stores/theme';
import { defineAsyncComponent } from 'vue';
import 'vue-multiselect/dist/vue-multiselect.css';

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

const postsStore = usePostsStore();
const { categories } = useCategories();
const { uploadMedia, isUploading } = useMediaUpload();

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


// Bloquear/desbloquear scroll del fondo
watch(props.visible, (newValue) => {
  if (newValue) {
    document.body.classList.add('overflow-hidden');
  } else {
    document.body.classList.remove('overflow-hidden');
  }
});

onMounted(() => {
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
});

function handleMediaUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    formErrors.value.media = 'El archivo debe ser una imagen o video';
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onloadend = () => {
    editForm.value.media.imageBase64 = reader.result;
    editForm.value.media.type = file.type.startsWith('image') ? 'image' : 'video';
  };
  reader.onerror = (error) => {
    console.error('Error al leer el archivo:', error);
    formErrors.value.media = 'Error al leer el archivo';
  };
  reader.readAsDataURL(file);
}

async function savePost() {
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
    // Subir el archivo multimedia si hay uno nuevo
    const dynamicPath = `post/${props.post.user.email}/${editForm.value.id}`;
    const { url, path } = await uploadMedia({
      currentUrl: editForm.value.media.url,
      currentPath: editForm.value.media.path,
      newMediaBase64: editForm.value.media.imageBase64,
      mediaType: editForm.value.media.type,
      dynamicPath,
    });

    const updatedPost = {
      ...props.post,
      title: editForm.value.title,
      body: editForm.value.body,
      categories: editForm.value.categories,
      media: {
        url,
        path,
        type: editForm.value.media.type,
        imageBase64: null,
      },
    };
    const postId = props.post.idDoc || props.post.id;
    await postsStore.updatePost(postId, updatedPost);
    emit('update-post', updatedPost);
    emit('close');
  } catch (error) {
    console.error('Error al actualizar el post:', error);
    formErrors.value.submit = 'Error al actualizar el post';
  } finally {
    isLoading.value = false;
  }
}

function validateStep(step) {
  let isValid = true;
  const errors = {};

  if (step === 1) {
    if (!editForm.value.title || editForm.value.title.trim() === '') {
      errors.title = 'El título es obligatorio';
      isValid = false;
    }
    if (editForm.value.title.length > 50) {
      errors.title = 'El título no debe superar los 50 caracteres';
      isValid = false;
    }
    if (!editForm.value.body || editForm.value.body.trim() === '') {
      errors.body = 'La descripción es obligatoria';
      isValid = false;
    }
    if (editForm.value.body.length > 250) {
      errors.body = 'La descripción no debe superar los 250 caracteres';
      isValid = false;
    }
  } else if (step === 2) {
    if (!editForm.value.categories || editForm.value.categories.length === 0) {
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

function handleCloseModal() {
  currentStep.value = 1; // Reset step to 1 when closing
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
    }
  };
  formErrors.value = {};
  emit('close');

}
</script>

<style scoped>
@keyframes pulseStep {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.animate-pulse-step {
  animation: pulseStep 1s infinite;
}
</style>