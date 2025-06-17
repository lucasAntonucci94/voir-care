<template>
  <div v-if="visible" class="fixed inset-0 bg-black/60 z-101 flex items-center justify-center p-4 overflow-hidden">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-y-auto">
      <div class="sticky top-0 bg-white dark:bg-gray-800 z-10 p-6 border-b">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-300">Editar posteo</h3>
          <button @click="emit('close')" class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100">
            <i class="fa-solid fa-xmark w-6 h-6"></i>
          </button>
        </div>
      </div>
      <div class="p-6">
        <form @submit.prevent="savePost" class="space-y-6">
          <!-- Título -->
          <div>
            <label for="post-title" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Título</label>
            <input
              id="post-title"
              v-model="editForm.title"
              type="text"
              placeholder="Título de tu publicación"
              class="
                w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg 
                bg-gray-50 text-gray-700 hover:bg-gray-100 
                dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 
                focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary dark:focus:bg-gray-600 focus:border-transparent
                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isLoading"
              required
            />
            <p v-if="formErrors.title" class="text-red-500 text-sm mt-1">{{ formErrors.title }}</p>
          </div>

          <!-- Cuerpo -->
          <div>
            <label for="post-body" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Descripción</label>
            <textarea
              id="post-body"
              v-model="editForm.body"
              placeholder="¿Qué quieres compartir?"
              class="
                w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg 
                bg-gray-50 text-gray-700 hover:bg-gray-100 
                dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 
                focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary dark:focus:bg-gray-600 focus:border-transparent
                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isLoading"
              required
            ></textarea>
            <p v-if="formErrors.body" class="text-red-500 text-sm mt-1">{{ formErrors.body }}</p>
          </div>

          <!-- Input de archivo -->
          <div class="relative">
            <label for="post-media" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Imagen o video</label>
            <input
              id="post-media"
              type="file"
              accept="image/*,video/*"
              @change="handleMediaUpload"
              :disabled="isLoading"
              class="
                w-full p-2.5 
                bg-gray-50 dark:bg-gray-700
                hover:bg-gray-100 dark:hover:bg-gray-600
                border border-gray-200 dark:border-gray-800 rounded-lg 
                text-sm text-gray-600 dark:text-gray-300 
                file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold
                file:bg-primary dark:file:bg-secondary file:text-white hover:file:bg-primary-md dark:hover:file:bg-secondary-md 
                transition-all duration-200 cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p v-if="formErrors.media" class="text-red-500 text-sm mt-1">{{ formErrors.media }}</p>
          </div>

          <!-- Previsualización -->
          <div v-if="editForm.media" class="mt-2">
            <img
              v-if="editForm.media.type === 'image'"
              :src="editForm.media.imageBase64 || editForm.media.url"
              alt="Preview"
              class="w-full h-48 object-cover rounded-lg shadow-sm"
            />
            <video
              v-else-if="editForm.media.type === 'video'"
              :src="editForm.media.imageBase64 || editForm.media.url"
              controls
              class="w-full h-48 rounded-lg shadow-sm"
            ></video>
          </div>

          <!-- Categorías -->
          <div>
            <label for="postCategories" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Categorías</label>
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
            ></multiselect>
            <p v-if="formErrors.categories" class="text-sm text-red-500 mt-1">{{ formErrors.categories }}</p>
          </div>

          <!-- Botones -->
          <div class="flex justify-end gap-3">
            <button
              type="button"
              @click="emit('close')"
              class="px-5 py-2 text-gray-500 dark:text-gray-300 dark:bg-gray-700 font-medium rounded-lg hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              :disabled="isLoading"
              type="submit"
              class="relative px-5 py-2 bg-primary dark:bg-secondary text-white font-medium rounded-lg hover:bg-primary-md dark:hover:bg-secondary-md transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-primary-md dark:disabled:bg-secondary-md disabled:cursor-not-allowed"
            >
              <span v-if="!isLoading">Guardar</span>
              <span v-else class="flex items-center gap-2">
                <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Guardando...
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits, onMounted, computed } from 'vue';
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
const formErrors = ref({});
const isLoading = ref(false);

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
  if (!validatePostForm()) {
    isLoading.value = false;
    return;
  }

  isLoading.value = true;

  try {
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

    await postsStore.updatePost(updatedPost.idDoc, updatedPost);
    emit('update-post', updatedPost);
    emit('close');
  } catch (error) {
    console.error('Error al actualizar el post:', error);
    formErrors.value.submit = 'Error al actualizar el post';
  } finally {
    isLoading.value = false;
  }
}

function validatePostForm() {
  const errors = {};

  if (!editForm.value.title || editForm.value.title.trim() === '') {
    errors.title = 'El título es obligatorio';
  }
  if (editForm.value.title.length > 50) {
    errors.title = 'El título no debe superar los 50 caracteres';
  }
  if (!editForm.value.body || editForm.value.body.trim() === '') {
    errors.body = 'La descripción es obligatoria';
  }
  if (editForm.value.body.length > 250) {
    errors.body = 'La descripción no debe superar los 250 caracteres';
  }
  if (!editForm.value.categories || editForm.value.categories.length === 0) {
    errors.categories = 'Selecciona al menos una categoría';
  }

  formErrors.value = errors;
  return Object.keys(errors).length === 0;
}
</script>

<style scoped>
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