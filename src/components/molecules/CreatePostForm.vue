<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Title -->
    <div>
      <label for="post-title" class="sr-only">Título</label>
      <input
        id="post-title"
        v-model="newPost.title"
        type="text"
        placeholder="Título de tu publicación"
        class="w-full p-3 border hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
        :disabled="isLoading"
        required
      />
      <p v-if="formErrors.title" class="text-red-500 text-sm mt-1">{{ formErrors.title }}</p>
    </div>
    <!-- Description -->
    <div>
      <label for="post-description" class="sr-only">Descripción</label>
      <textarea
        id="post-description"
        v-model="newPost.description"
        placeholder="¿Qué quieres compartir?"
        class="w-full p-3 hover:bg-gray-100 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent bg-gray-50 text-gray-700 placeholder-gray-400 resize-y min-h-[100px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
        :disabled="isLoading"
        required
      ></textarea>
      <p v-if="formErrors.description" class="text-red-500 text-sm mt-1">
        {{ formErrors.description }}
      </p>
    </div>
    <!-- Media Input -->
    <div class="relative">
      <label for="post-media" class="sr-only">Imagen o video</label>
      <input
        id="post-media"
        type="file"
        accept="image/*,video/*"
        @change="handleMediaUpload"
        :class="[
          'w-full p-2 border dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary dark:file:bg-secondary file:text-white hover:file:bg-opacity-90 transition-colors duration-200',
          errorFileMessage ? 'border-red-500' : 'border-gray-300 dark:border-gray-800',
        ]"
        :disabled="isLoading"
      />
      <p v-if="errorFileMessage" class="text-red-500 text-sm mt-1">{{ errorFileMessage }}</p>
    </div>
    <!-- Media Preview -->
    <div v-if="newPost.media?.imageBase64 || newPost.media?.url" class="mt-2">
      <img
        v-if="newPost.media.type === 'image'"
        :src="newPost.media?.imageBase64 || newPost.media?.url"
        alt="Preview"
        class="w-full h-48 object-cover rounded-lg shadow-sm"
      />
      <video
        v-else-if="newPost.media.type === 'video'"
        :src="newPost.media?.imageBase64 || newPost.media?.url"
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
        :disabled="isLoading"
        type="submit"
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
</template>

<script setup>
import { ref, computed } from 'vue';
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

const emit = defineEmits(['close']);

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

const isLoading = ref(false);
const errorFileMessage = ref('');
const formErrors = ref({});

// Handle media upload
function handleMediaUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    errorFileMessage.value = 'El tipo de archivo no es permitido. Selecciona una imagen o video.';
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onloadend = () => {
    newPost.value.media.imageBase64 = reader.result;
    newPost.value.media.type = file.type.startsWith('image') ? 'image' : 'video';
    errorFileMessage.value = '';
  };
  reader.onerror = (error) => {
    console.error('Error al leer el archivo:', error);
    errorFileMessage.value = 'Error al procesar el archivo.';
  };
  reader.readAsDataURL(file);
}

// Validate form
function validateForm() {
  const errors = {};

  if (!newPost.value.title || newPost.value.title.trim() === '') {
    errors.title = 'El título es obligatorio';
  }

  if (!newPost.value.description || newPost.value.description.trim() === '') {
    errors.description = 'La descripción es obligatoria';
  }

  if (!newPost.value.categories || newPost.value.categories.length === 0) {
    errors.categories = 'Selecciona al menos una categoría';
  }

  formErrors.value = errors;
  return Object.keys(errors).length === 0;
}

// Handle form submission
async function handleSubmit() {
  if (!validateForm()) {
    isLoading.value = false;
    return;
  }
  isLoading.value = true;

  if (!user.value) {
    console.error('Usuario no autenticado');
    snackbarStore.show('Usuario no autenticado', 'error');
    isLoading.value = false;
    return;
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

  try {
    await postsStore.addPost(postData);
    resetForm();
    snackbarStore.show('Publicación creada exitosamente', 'success');
    emit('close');
  } catch (error) {
    console.error('Error al crear el post:', error);
    snackbarStore.show('Error al crear la publicación', 'error');
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
  formErrors.value = {};
  errorFileMessage.value = '';
}
</script>

<style scoped>
.custom-checkbox {
  appearance: none;
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


/* Estilos para vue-multiselect */
::v-deep(.multiselect) {
  min-height: 38px;
  width: 100%;
  border: 1px solid;
  border-color: var(--color-primary-md);
  border-radius: 0.375rem;
  background-color: #ffffff;
  color: #111827;
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
}

::v-deep(.multiselect.dark) {
  border-color: var(--color-secondary-md);
  background-color: #1F2937 !important;
  color: #f9fafb;
}

::v-deep(.multiselect .multiselect__tags) {
  border: 1px solid !important;
  border-color: var(--color-primary) !important;
}

::v-deep(.multiselect.dark .multiselect__tags) {
  border: 1px solid !important;
  border-color: var(--color-secondary) !important;
  background-color: #1F2937 !important;
  color: #f9fafb;
  padding: 4px 8px;
}

::v-deep(.multiselect.dark .multiselect__tags input) {
  background-color: #1F2937 !important;
  color: #f9fafb;
}

::v-deep(.multiselect.dark .multiselect__input) {
  color: #f9fafb !important;
}

::v-deep(.multiselect.dark .multiselect__content-wrapper) {
  background-color: #1F2937 !important;
  color: #f9fafb;
}

::v-deep(.multiselect .multiselect__option) {
  background-color: #ffffff;
  color: #111827;
}

::v-deep(.multiselect.dark .multiselect__option) {
  background-color: #1F2937 !important;
  color: #f9fafb;
}

::v-deep(.multiselect .multiselect__option--highlight) {
  background-color: var(--color-primary);
  color: #ffffff;
}

::v-deep(.multiselect.dark .multiselect__option--highlight) {
  background-color: var(--color-secondary);
}

::v-deep(.multiselect__select) {
  background: transparent;
}

::v-deep(.multiselect--disabled) {
  background-color: #e5e7eb;
}

::v-deep(.multiselect.dark .multiselect--disabled) {
  background-color: #1F2937;
}
</style>