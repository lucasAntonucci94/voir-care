<!-- CreatePostModal.vue -->
<template>
  <section class="flex justify-center mb-6">
    <input 
      type="text" 
      placeholder="¿Qué tienes en mente?" 
      @click="showModal = true" 
      class="w-full max-w-xl p-4 rounded-full bg-white border border-gray-200 shadow-md focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer text-gray-700 placeholder-gray-400 transition-all duration-200 hover:shadow-lg" 
      readonly 
    />
  </section>
  <div v-if="showModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-101 transition-opacity duration-300">
    <div class="bg-white rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl transform transition-all duration-300 scale-100 relative max-h-[90vh] overflow-y-auto">
      <!-- Overlay de carga -->
      <div 
        v-if="isLoading" 
        class="absolute inset-0 bg-gray-200/50 rounded-xl flex items-center justify-center z-10 transition-opacity duration-200"
      >
        <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      <h2 class="text-2xl font-semibold text-gray-800 mb-6 tracking-tight">Crear Nueva Publicación</h2>
      <form @submit.prevent="createPost" class="space-y-6">
        <!-- Título -->
        <div>
          <input 
            v-model="newPost.title" 
            type="text" 
            placeholder="Título de tu publicación" 
            class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
            :disabled="isLoading"
            required 
          />
        </div>
        <!-- Descripción -->
        <div>
          <textarea 
            v-model="newPost.description" 
            placeholder="¿Qué quieres compartir?" 
            class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 text-gray-700 placeholder-gray-400 resize-y min-h-[100px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
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
            class="w-full p-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-teal-600 transition-all duration-200 cursor-pointer bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" 
          />
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
            class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
          >
            <input 
              :id="'filter_' + category.id" 
              type="checkbox" 
              v-model="newPost.categories" 
              :value="category" 
              :disabled="isLoading"
              class="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-opacity-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
            />
            <span class="font-medium">{{ category.name }}</span>
          </label>
        </div>
        <!-- Botones -->
        <div class="flex justify-end gap-3">
          <button 
            type="button" 
            @click="showModal = false" 
            class="px-5 py-2 text-gray-500 font-medium rounded-lg hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
          >
            Cancelar
          </button>
          <button 
            :disabled="isLoading"
            type="submit" 
            class="relative px-5 py-2 bg-primary text-white font-medium rounded-lg hover:bg-teal-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-teal-400 disabled:cursor-not-allowed"
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

const { categories } = useCategories();
const { user } = useAuth();
const postsStore = usePostsStore();
const showModal = ref(false);
const isLoading = ref(false);

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
  if (file) {
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
    description: newPost.value.description,
    media: newPost.value.media,
    mediaType: newPost.value.mediaType,
    categories: newPost.value.categories,
    timestamp: new Date(),
    likes: 0,
    comments: [],
    shares: 0,
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