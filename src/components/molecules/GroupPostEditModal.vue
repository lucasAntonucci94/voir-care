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
      <form @submit.prevent="editPost" class="space-y-6">
        <!-- Título -->
        <div>
          <input
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
        </div>

        <!-- Cuerpo -->
        <div>
          <textarea
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
        </div>

        <!-- Input de archivo -->
        <div class="relative">
          <input
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
          <label for="postCategories" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200 sr-only">
            Categorías
          </label>
          <multiselect
            v-model="editForm.categories"
            :options="categories ?? []"
            :multiple="true"
            :class="{ 'dark': isDark }"
            placeholder="Seleccionar categorías"
            label="name"
            track-by="id"
            aria-label="Seleccionar categorías"
            :disabled="isLoading"
          ></multiselect>
          <!-- <p v-if="formErrors.categories" class="text-sm text-red-500 mt-1">{{ formErrors?.categories }}</p> -->
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
import { ref, computed, defineEmits, onMounted } from 'vue';
import { useGroupPostsStore } from '../../stores/groupPosts';
import { useCategories } from '../../composable/useCategories';
import { useMediaUpload } from '../../composable/useMediaUpload';
import { boolean } from 'yup';
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
  visible: { type: boolean, required: true },
});

const emit = defineEmits(['update-post', 'close']);

const groupPostsStore = useGroupPostsStore();
const { categories } = useCategories();
const { uploadMedia, isUploading } = useMediaUpload();

const editForm = ref({
  id: null,
  title: '',
  body: '',
  categories: [],
  media: {
    url: props.post?.media?.url || '',
    path: props.post?.media?.path || '',
    type: props.post?.media?.type || '',
    imageBase64: null,
  },
});
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

  const reader = new FileReader();
  reader.onloadend = () => {
    editForm.value.media.imageBase64 = reader.result;
    editForm.value.media.type = file.type.startsWith('image') ? 'image' : 'video';
  };
  reader.onerror = (error) => console.error('Error al leer el archivo:', error);
  reader.readAsDataURL(file);
}

async function editPost() {
  isLoading.value = true;
  if (!editForm.value.title || !editForm.value.body) {
    console.error('Título y cuerpo son obligatorios');
    isLoading.value = false;
    return;
  }

  try {
    
    // subo archivo multimedia si hay uno nuevo, no valido aca porque el metodo en caso de no exisitr base64 retornara los valores enviados.
    const dynamicPath = `groups/${props.post.group.id}/posts/${props.post.user.email}/${editForm.value.id}`;;
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
    
    await groupPostsStore.updatePostGroup(updatedPost.group.id, updatedPost.idDoc, updatedPost);

    emit('update-post', updatedPost);
    emit('close');
  } catch (error) {
    console.error('Error al actualizar el post:', error);
  } finally {
    isLoading.value = false;
  }
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
  background-color: var(--checkbox-bg);
  border-color: var(--checkbox-bg);
}

.custom-checkbox:checked:hover {
  background-color: var(--checkbox-bg);
  border-color: var(--checkbox-bg);
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