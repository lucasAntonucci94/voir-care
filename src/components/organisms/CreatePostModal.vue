<!-- CreatePostModal.vue -->
<template>
  <section class="flex justify-center mb-6">
    <input 
      type="text" 
      placeholder="¿Qué tienes en mente?" 
      @click="showModal = true" 
      class="w-full max-w-md p-3 rounded-full bg-white border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#02bcae] cursor-pointer" 
      readonly 
    />
  </section>
  <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-30">
    <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-lg">
      <h2 class="text-xl font-bold text-[#2c3e50] mb-4">Nueva Publicación</h2>
      <form @submit.prevent="createPost" class="space-y-4">
        <input 
          v-model="newPost.title" 
          type="text" 
          placeholder="Título" 
          class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02bcae]" 
          required 
        />
        <textarea 
          v-model="newPost.description" 
          placeholder="Descripción" 
          class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02bcae] resize-y" 
          rows="3" 
          required 
        ></textarea>
        <input 
          type="file" 
          accept="image/*,video/*" 
          @change="handleMediaUpload" 
          class="w-full p-2 border rounded-lg text-sm text-gray-600" 
        />
        <!-- <div v-if="newPost?.media" class="mt-2">
          <img 
            v-if="newPost?.mediaType === 'image'" 
            :src="newPost?.media != null ? URL.createObjectURL(newPost?.media) : null" 
            alt="Preview" 
            class="w-full h-32 object-cover rounded-lg" 
          />
          <video 
            v-else-if="newPost.mediaType === 'video'" 
            :src="newPost?.media != null ? URL.createObjectURL(newPost?.media) : null" 
            controls 
            class="w-full h-32 rounded-lg"
          ></video>
        </div> -->
        <div class="flex flex-wrap gap-2">
          <label v-for="category in categories" :key="category" class="flex items-center gap-1 text-sm">
            <input 
              :id="'filter_' + category.id"
              type="checkbox" 
              v-model="newPost.categories" 
              :value="category" 
              class="h-4 w-4 text-[#02bcae] focus:ring-[#02bcae]" 
            />
            {{ category.name }}
          </label>
        </div>
        <div class="flex justify-end gap-2">
          <button 
            type="button" 
            @click="showModal = false" 
            class="px-4 py-2 text-gray-600 hover:text-[#2c3e50]"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            class="px-4 py-2 bg-[#02bcae] text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            Publicar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuth } from '../../api/auth/auth';
import { usePostsStore } from '../../stores/posts'; // Asegúrate de la ruta correcta

import { useCategories } from './../../composable/useCategories';

// Stores y estado
const { categories } = useCategories();

const { user } = useAuth();
const postsStore = usePostsStore(); // Instancia del store
const showModal = ref(false);

const newPost = ref({
  user: null, // Se asignará al montar o al crear
  title: '',
  description: '',
  media: null,
  mediaType: '',
  categories: [],
});

const categoriesList = ['General', 'Eventos', 'Educación', 'Adopciones'];

function handleMediaUpload(event) {
  debugger
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      debugger
      newPost.value.media = reader.result; // Asignamos el Base64
      newPost.value.mediaType = file.type.startsWith('image') ? 'image' : 'video';
    };
    reader.onerror = (error) => {
      console.error('Error al leer el archivo:', error);
    };
    reader.readAsDataURL(file); // Leemos como Base64
  }
}

// Crear el post y enviarlo a Firebase
async function createPost() {
  console.log(user)
debugger
  if (!newPost.value.title || !newPost.value.description) {
    console.error('Título y descripción son obligatorios');
    return;
  }

  if (!user.value) {
    console.error('Usuario no autenticado');
    return;
  }

  // Preparar los datos del post
  const postData = {
    user: {
      id: user.value.uid || user.value.id, // uid si usas Firebase Auth
      displayName: user.value.displayName || 'Usuario Anónimo',
      firstName: user.value.firstName || 'Usuario Anónimo',
      lastName: user.value.lastName || 'Usuario Anónimo',
      phoneNumber: user.value.phoneNumber || 'Usuario Anónimo',
      photoURL: user.value.photoURL || null,
      photoURLFile: user.value.photoURLFile || null,
    },
    title: newPost.value.title,
    description: newPost.value.description,
    media: newPost.value.media, // Archivo crudo para subir a Storage
    mediaType: newPost.value.mediaType,
    categories: newPost.value.categories,
    timestamp: new Date(), // Esto se sobrescribirá con serverTimestamp() en savePost
    likes: 0, // Campo adicional
    comments: [], // Campo adicional (array de comentarios)
    shares: 0, // Campo adicional
  };

  try {
    await postsStore.addPost(postData);
    // Resetea el formulario
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
    //TO DO mensajito de error
  }
}
</script>