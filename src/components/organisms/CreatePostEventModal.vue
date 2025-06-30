<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-101 transition-opacity duration-300">
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl transform transition-all duration-300 scale-100 relative max-h-[90vh] overflow-y-auto">
      <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 tracking-tight">Nueva publicación en el evento</h2>
      <form @submit.prevent="createPost" class="space-y-6">
        <!-- Título -->
        <div>
          <label for="event-post-title" class="sr-only">Título</label>
          <input 
            id="event-post-title"
            v-model="newPost.title" 
            type="text" 
            placeholder="Título de tu publicación" 
            required 
            class="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300 hover:bg-gray-100" 
            :disabled="isLoading"
          />
          <p v-if="formErrors.title" class="text-red-500 text-sm mt-1">{{ formErrors.title }}</p>
        </div>
        <!-- Descripción -->
        <div>
          <label for="event-post-description" class="sr-only">Descripción</label>
          <textarea 
            id="event-post-description"
            v-model="newPost.description" 
            placeholder="¿Qué quieres compartir sobre este evento?" 
            required 
            class="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent bg-gray-50 text-gray-700 placeholder-gray-400 resize-y min-h-[100px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300 hover:bg-gray-100" 
            :disabled="isLoading"
          ></textarea>
          <p v-if="formErrors.description" class="text-red-500 text-sm mt-1">{{ formErrors.description }}</p>
        </div>
        <!-- Input de archivo -->
        <div class="relative">
          <label for="event-post-media" class="sr-only">Imagen o video</label>
          <input 
            id="event-post-media"
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
        <div v-if="newPost.media.imageBase64" class="mt-2">
          <img 
            v-if="newPost.media.type === 'image'" 
            :src="newPost.media.imageBase64" 
            alt="Preview" 
            class="w-full h-48 object-cover rounded-lg shadow-sm" 
          />
          <video 
            v-else-if="newPost.media.type === 'video'" 
            :src="newPost.media.imageBase64" 
            controls 
            class="w-full h-48 rounded-lg shadow-sm"
          ></video>
        </div>
        <!-- Categorías -->
        <div>
          <label for="postCategories" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200 sr-only">
            Categorías
          </label>
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
        <p v-if="formErrors.categories" id="categories-error" class="text-red-500 text-sm mt-2">
          {{ formErrors.categories }}
        </p>
        <!-- Botones -->
        <div class="flex justify-end gap-3">
          <button 
            type="button" 
            @click="handleCloseModal" 
            class="px-5 py-2 text-gray-500 dark:bg-gray-500 dark:text-gray-100 font-medium rounded-lg hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            :disabled="isLoading"
            class="relative px-5 py-2 bg-primary dark:bg-secondary text-white font-medium rounded-lg hover:bg-primary-md dark:hover:bg-secondary-md transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-primary-md dark:disabled:bg-secondary-md disabled:cursor-not-allowed"
          >
            <span v-if="!isLoading">Publicar</span>
            <span v-else class="flex items-center gap-2">
              <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Publicando...
            </span>
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

const showModal = ref(true);
const isLoading = ref(false);
const errorFileMessage = ref('');
const formErrors = ref({});

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
watch(showModal, (newValue) => {
  if (newValue) {
    document.body.classList.add('overflow-hidden');
  } else {
    document.body.classList.remove('overflow-hidden');
  }
});

// Close modal if eventId changes to null
watch(() => props.eventId, (val) => {
  if (!val) {
    showModal.value = false;
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

function validateForm() {
  const errors = {};
  if (!newPost.value.title || newPost.value.title.trim() === '') {
    errors.title = 'El título es obligatorio';
  }
  if (!newPost.value.description || newPost.value.description.trim() === '') {
    errors.description = 'La descripción es obligatoria';
  }
  if (!newPost.value.categories.length) {
    errors.categories = 'Selecciona al menos una categoría';
  }
  formErrors.value = errors;
  return Object.keys(errors).length === 0;
}

async function createPost() {
  if (!validateForm()) return;
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
    emit('close');
  } catch (err) {
    console.error('Error creando post del evento:', err);
    snackbarStore.show(`Error al crear la publicación. Error: ${err}`, 'error');
  } finally {
    isLoading.value = false;
  }
}

function handleCloseModal() {
  showModal.value = false;
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
  emit('close');
}
</script>

<style scoped>
.custom-checkbox {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  width: 16px;
  height: 16px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  position: relative;
  cursor: pointer;
  outline: none;
}

.custom-checkbox:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.custom-checkbox:checked {
  background-color: #02bcae;
  border-color: #02bcae;
}

.custom-checkbox:checked:hover {
  background-color: #019a8e;
  border-color: #019a8e;
}

.custom-checkbox:checked::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.custom-checkbox:focus {
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.5);
}
</style>