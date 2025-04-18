<!-- CreatePostModal.vue -->
<template>
  <section>
    <button 
      class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-full hover:bg-primary-md dark:hover:bg-secondary-md transition-all shadow-md" 
      @click="showModal = true" 
    >
      <i class="fa fa-book pr-2"></i>
      Agregar historia
    </button>
  </section>
  <div v-if="showModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-101 transition-opacity duration-300">
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl transform transition-all duration-300 scale-100 relative max-h-[90vh] overflow-y-auto">
      <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 tracking-tight">Crear Nueva Publicación</h2>
      <form @submit.prevent="createPost" class="space-y-6">
        <!-- Título -->
        <div>
          <input 
            v-model="newPost.title" 
            type="text" 
            placeholder="Título de tu publicación"
            class="w-full p-3 border hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent  dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:bg-gray-600 dark:hover:text-gray-300 bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
            :disabled="isLoading"
            required 
          />
        </div>
        <!-- Descripción -->
        <div>
          <textarea 
            v-model="newPost.description" 
            placeholder="¿Qué quieres compartir?" 
            class="w-full p-3 hover:bg-gray-100 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:bg-gray-600 dark:hover:text-gray-300 bg-gray-50 text-gray-700 placeholder-gray-400 resize-y min-h-[100px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
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
            :class="[
              'w-full p-2 border dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary dark:file:bg-secondary file:text-white hover:file:bg-opacity-90 transition-colors duration-200',
              errorFileMessage ? 'border-red-500' : 'border-gray-300  dark:border-gray-800'
            ]"
            :disabled="isLoading"
            />
            <!-- Mensaje de error -->
            <p v-if="errorFileMessage" class="text-red-500 text-sm mt-1">{{ errorFileMessage }}</p>
        </div>
        <!-- Previsualización -->
        <div v-if="newPost?.media" class="mt-2">
          <img 
            v-if="newPost?.mediaType === 'image'" 
            :src="newPost.media" 
            alt="Preview" 
            class="w-full h-48 object-cover rounded-lg shadow-sm" 
          />
          <video 
            v-else-if="newPost?.mediaType === 'video'" 
            :src="newPost.media" 
            controls 
            class="w-full h-48 rounded-lg shadow-sm"
          ></video>
        </div>
        <!-- Categorías -->
        <div class="flex flex-wrap gap-3">
          <label
            v-for="category in categories"
            :key="category.id"
            class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer"
          >
            <input
              :id="'filter_' + category.id"
              type="checkbox"
              v-model="newPost.categories"
              :value="category"
              :disabled="isLoading"
              class="custom-checkbox hover:bg-gray-100 dark:hover:bg-gray-600 dark:focus:bg-gray-600"
            />
            <span class="font-medium dark:text-white dark:hover:text-gray-300">{{ category.name }}</span>
          </label>
        </div>
        <!-- Botones -->
        <div class="flex justify-end gap-3">
          <button 
            type="button" 
            @click="showModal = false;errorFileMessage = ''" 
            class="px-5 py-2 text-gray-500 dark:text-gray-100 dark:bg-gray-500 font-medium rounded-lg hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
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
              <span class="w-4 h-4 border-2 border-white dark:border-gray-800 border-t-transparent rounded-full animate-spin"></span>
              Publicando...
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useAuth } from '../../api/auth/useAuth';
import { usePostsStore } from '../../stores/posts';
import { useCategories } from '../../composable/useCategories';

const { categories } = useCategories();
const { user } = useAuth();
const postsStore = usePostsStore();
const showModal = ref(false);
const isLoading = ref(false);
const errorFileMessage = ref('');
const newPost = ref({
  user: null,
  title: '',
  description: '',
  media: null,
  mediaType: '',
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

  if (!file) return
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    errorFileMessage.value = "El tipo de archivo no es permitido. Selecciona una imagen o video.";
    event.target.value = ''; // Limpiar el input
    return;
  }
  const reader = new FileReader();
  reader.onloadend = () => {
    newPost.value.media = reader.result;
    newPost.value.mediaType = file.type.startsWith('image') ? 'image' : 'video';
  };
  reader.onerror = (error) => {
    console.error('Error al leer el archivo:', error);
  };
  reader.readAsDataURL(file);
}

async function createPost() {
  isLoading.value = true;
  if (!newPost.value.title || !newPost.value.description) {
    console.error('Título y descripción son obligatorios');
    isLoading.value = false;
    return;
  }

  if (!user.value) {
    console.error('Usuario no autenticado');
    isLoading.value = false;
    return;
  }

  const postData = {
    user: {
      id: user.value.uid || user.value.id || null,
      displayName: user.value.displayName || null,
      firstName: user.value.firstName || null,
      lastName: user.value.lastName || null,
      email: user.value.email || null,
      phoneNumber: user.value.phoneNumber || null,
      birthday: user.value.birthday || null,
      genre: user.value.genre || null,
      country: user.value.country || null,
      photoURL: user.value.photoURL || null,
      photoURLFile: user.value.photoURLFile || null,
    },
    title: newPost.value.title,
    body: newPost.value.description, // Cambiamos description a body
    imageBase64: newPost.value.media, // Base64 para subir
    mediaType: newPost.value.mediaType,
    categories: newPost.value.categories,
  };

  try {
    await postsStore.addPost(postData);
    newPost.value = {
      user: null,
      title: '',
      description: '',
      media: null,
      mediaType: '',
      categories: [],
    };
    showModal.value = false;
  } catch (error) {
    console.error('Error al crear el post:', error);
  } finally {
    isLoading.value = false;
  }
}
</script>

<style>
/* Estilo del checkbox personalizado */
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

/* Estilo cuando está deshabilitado */
.custom-checkbox:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Fondo y tilde cuando está seleccionado */
.custom-checkbox:checked {
  background-color: var(--checkbox-bg);
  border-color: var(--checkbox-bg);
}

/* Fondo y tilde cuando está seleccionado */
.custom-checkbox:checked:hover {
  background-color:  var(--checkbox-bg);
  border-color:  var(--checkbox-bg);
}

/* Crear el tilde personalizado con ::after */
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

/* Efecto de foco */
.custom-checkbox:focus {
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.5);
}
</style>