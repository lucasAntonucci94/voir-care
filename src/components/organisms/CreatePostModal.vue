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
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl transform transition-all duration-300 scale-100 relative max-h-[90vh] overflow-y-auto">
      <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 tracking-tight">Crear Nueva Publicación</h2>
      <form @submit.prevent="createPost" class="space-y-6">
        <!-- Título -->
        <div>
          <label for="post-title" class="sr-only">Título</label>
          <input 
            id="post-title"
            name="title"
            v-model="newPost.title" 
            type="text" 
            placeholder="Título de tu publicación" 
            class="w-full p-3 border  hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300" 
            :disabled="isLoading"
            required 
          />
          <p v-if="formErrors.title" class="text-red-500 text-sm mt-1">{{ formErrors.title }}</p>
        </div>
        <!-- Descripción -->
        <div>
          <label for="post-description" class="sr-only">Título</label>
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
        <!-- Input de archivo -->
        <div class="relative">
          <label for="post-media" class="sr-only">Imagen o video</label>
          <input 
            id="post-media"
            name="media"
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
        <!-- Categorías -->
        <fieldset class="flex flex-wrap gap-3" :aria-describedby="formErrors.categories ? 'categories-error' : null">
          <legend class="sr-only">Categorías</legend>
          <label
            v-for="category in categories"
            :key="category.id"
            class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer dark:text-gray-100 dark:hover:text-gray-300"
          >
            <input
              :id="'filter_' + category.id"
              name="'categories"
              type="checkbox"
              v-model="newPost.categories"
              :value="category"
              :disabled="isLoading"
              class="custom-checkbox hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-800"
              :aria-invalid="!!formErrors.categories"
            />
            <span class="font-medium">{{ category.name }}</span>
          </label>
        </fieldset>
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
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useAuth } from '../../api/auth/useAuth';
import { usePostsStore } from '../../stores/posts';
import { useCategories } from '../../composable/useCategories';
import { useSnackbarStore } from '../../stores/snackbar'

const { categories } = useCategories();
const { user } = useAuth();
const postsStore = usePostsStore();
const snackbarStore = useSnackbarStore()
const showModal = ref(false);
const isLoading = ref(false);
const errorFileMessage = ref('');
const formErrors = ref({});

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

  if (!file) return
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        errorFileMessage.value = "El tipo de archivo no es permitido. Selecciona una imagen o video.";
        event.target.value = ''; // Limpiar el input
        return;
      }
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      newPost.value.media.imageBase64 = reader.result;
      newPost.value.media.type = file.type.startsWith('image') ? 'image' : 'video';
    };
    reader.onerror = (error) => {
      console.error('Error al leer el archivo:', error);
    };
    reader.readAsDataURL(file);
  }
}

async function createPost() {
  if (!validatePostForm()) {
    isLoading.value = false;
    return;
  }
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
    newPost.value = {
      user: null,
      title: '',
      description: '',
      media:  {
        imageBase64: null,
        url: '',
        type: '',
        path: '',
      },
      categories: [],
    };
    showModal.value = false;
    snackbarStore.show("Publicación creada exitosamente.","success")
  } catch (error) {
    snackbarStore.show(`Error al crear la publicación.Error: ${error}`,"error")
  } finally {
    isLoading.value = false;
  }
}

function validatePostForm() {
  const errors = {};

  // Título requerido
  if (!newPost.value.title || newPost.value.title.trim() === '') {
    errors.title = 'El título es obligatorio';
  }
  
  // Título requerido
  if (newPost.value.title.length > 50) {
    errors.title = 'El título no debe superar los 50 caracteres';
  }

  // Descripción requerida
  if (!newPost.value.description || newPost.value.description.trim() === '') {
    errors.description = 'La descripción es obligatoria';
  }

  // Título requerido
  if (newPost.value.description.length > 250) {
    errors.description = 'El título no debe superar los 250 caracteres';
  }
  // Media opcional
  // if (!newPost.value.media) {
  //   errors.media = 'Debes subir una imagen o video';
  // }

  // Al menos una categoría
  if (!newPost.value.categories || newPost.value.categories.length === 0) {
    errors.categories = 'Selecciona al menos una categoría';
  }

  formErrors.value = errors;
  return Object.keys(errors).length === 0;
}

function handleCloseModal() {
  showModal.value = false;
  newPost.value = {
    user: null,
    title: '',
    description: '',
    media:  {
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

<style>
/* Estilo del checkbox personalizado */
.custom-checkbox {
  appearance: none; /* Elimina el estilo nativo del navegador */
  -webkit-appearance: none;
  -moz-appearance: none;
  width: 16px; /* Tamaño del checkbox */
  height: 16px;
  border: 2px solid #d1d5db; /* Borde gris (border-gray-300) */
  border-radius: 4px; /* Esquinas redondeadas */
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
  background-color: #02bcae; /* Usa tu color bg-primary */
  border-color: #02bcae; /* Borde del mismo color */
}

/* Fondo y tilde cuando está seleccionado */
.custom-checkbox:checked:hover {
  background-color: #019a8e; /* Usa tu color bg-primary */
  border-color: #019a8e; /* Borde del mismo color */
}

/* Crear el tilde personalizado con ::after */
.custom-checkbox:checked::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid white; /* Tilde blanco */
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* Efecto de foco */
.custom-checkbox:focus {
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.5); /* focus:ring-primary con opacity-50 */
}
</style>