<template>
    <section class="flex justify-center mb-6">
      <input type="text" placeholder="¿Qué tienes en mente?" @click="showModal = true" class="w-full max-w-md p-3 rounded-full bg-white border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#02bcae] cursor-pointer" readonly />
    </section>
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-30">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-lg">
        <h2 class="text-xl font-bold text-[#2c3e50] mb-4">Nueva Publicación</h2>
        <form @submit.prevent="createPost" class="space-y-4">
          <input v-model="newPost.title" type="text" placeholder="Título" class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02bcae]" />
          <textarea v-model="newPost.description" placeholder="Descripción" class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02bcae] resize-y" rows="3"></textarea>
          <input type="file" accept="image/*,video/*" @change="handleMediaUpload" class="w-full p-2 border rounded-lg text-sm text-gray-600" />
          <div v-if="newPost.media" class="mt-2">
            <img v-if="newPost.mediaType === 'image'" :src="URL.createObjectURL(newPost.media)" alt="Preview" class="w-full h-32 object-cover rounded-lg" />
            <video v-else-if="newPost.mediaType === 'video'" :src="URL.createObjectURL(newPost.media)" controls class="w-full h-32 rounded-lg"></video>
          </div>
          <div class="flex flex-wrap gap-2">
            <label v-for="category in categoriesList" :key="category" class="flex items-center gap-1 text-sm">
              <input type="checkbox" v-model="newPost.categories" :value="category" class="h-4 w-4 text-[#02bcae] focus:ring-[#02bcae]" />
              {{ category }}
            </label>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" @click="showModal = false" class="px-4 py-2 text-gray-600 hover:text-[#2c3e50]">Cancelar</button>
            <button type="submit" class="px-4 py-2 bg-[#02bcae] text-white rounded-lg hover:bg-teal-600 transition-colors">Publicar</button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useAuth } from '../../api/auth/auth';
  
// Definir emits explícitamente
const emit = defineEmits(['post-created']);  
  const { user } = useAuth();
  const showModal = ref(false);
  const newPost = ref({
    title: '',
    description: '',
    media: null,
    mediaType: '',
    categories: [],
  });
  const categoriesList = ['General', 'Eventos', 'Educación', 'Adopciones'];
  
  function handleMediaUpload(event) {
    const target = event.target;
    if (target.files) {
      const file = target.files[0];
      newPost.value.media = file;
      newPost.value.mediaType = file.type.startsWith('image') ? 'image' : 'video';
    }
  }
  
  function createPost() {
    debugger
    if (!newPost.value.title || !newPost.value.description) return;
    emit('post-created', {
      user: { id: user.value.id, name: user.value.displayName, avatar: user.value.photoURL },
      title: newPost.value.title,
      description: newPost.value.description,
      media: newPost.value.media ? URL.createObjectURL(newPost.value.media) : null,
      mediaType: newPost.value.mediaType,
      categories: newPost.value.categories,
      timestamp: new Date(),
    });
    newPost.value = { title: '', description: '', media: null, mediaType: '', categories: [] };
    showModal.value = false;
  }
  </script>