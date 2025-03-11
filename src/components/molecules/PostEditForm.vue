<template>
    <form @submit.prevent="savePost" class="space-y-6">
      <!-- Título -->
      <div>
        <input
          v-model="editForm.title"
          type="text"
          placeholder="Título de tu publicación"
          class="w-full p-3 border hover:bg-gray-100 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isLoading"
          required
        />
      </div>
  
      <!-- Cuerpo -->
      <div>
        <textarea
          v-model="editForm.body"
          placeholder="¿Qué quieres compartir?"
          class="w-full p-3 hover:bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 text-gray-700 placeholder-gray-400 resize-y min-h-[100px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
          class="w-full p-2.5 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-teal-600 transition-all duration-200 cursor-pointer bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
  
      <!-- Previsualización -->
      <div v-if="editForm.media" class="mt-2">
        <img
          v-if="editForm.mediaType === 'image'"
          :src="editForm.media"
          alt="Preview"
          class="w-full h-48 object-cover rounded-lg shadow-sm"
        />
        <video
          v-else-if="editForm.mediaType === 'video'"
          :src="editForm.media"
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
            v-model="editForm.categories"
            :value="category"
            :disabled="isLoading"
            class="custom-checkbox hover:bg-gray-100"
          />
          <span class="font-medium">{{ category.name }}</span>
        </label>
      </div>
  
      <!-- Botones -->
      <div class="flex justify-end gap-3">
        <button
          type="button"
          @click="closeModal"
          class="px-5 py-2 text-gray-500 font-medium rounded-lg hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
        >
          Cancelar
        </button>
        <button
          :disabled="isLoading"
          type="submit"
          class="relative px-5 py-2 bg-primary text-white font-medium rounded-lg hover:bg-teal-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-teal-400 disabled:cursor-not-allowed"
        >
          <span v-if="!isLoading">Guardar</span>
          <span v-else class="flex items-center gap-2">
            <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Guardando...
          </span>
        </button>
      </div>
    </form>
  </template>
  
  <script setup>
  import { ref, defineProps, defineEmits, onMounted } from 'vue';
  import { usePostsStore } from '../../stores/posts'; // Ajusta la ruta según tu proyecto
  import { useCategories } from '../../composable/useCategories'; // Ajusta la ruta según tu proyecto
  import { useStorage } from '../../composable/useStorage'; // Para manejar Firebase Storage
  
  // Props
  const props = defineProps({
    post: { type: Object, required: true },
    closeModal: { type: Function, required: true },
  });
  
  // Emits
  const emit = defineEmits(['update-post']);
  
  // Instancias
  const postsStore = usePostsStore();
  const { categories } = useCategories();
  const { uploadFile, getFileUrl } = useStorage();
  
  // Estados
  const editForm = ref({
    id: null,
    title: '',
    body: '',
    media: null,
    mediaType: '',
    categories: [],
    newMediaFile: null, // Para almacenar el archivo nuevo temporalmente
  });
  const isLoading = ref(false);
  
  // Inicializar el formulario con los datos del posteo
  onMounted(() => {
    editForm.value = {
      id: props.post?.id || null,
      title: props.post?.title || '',
      body: props.post?.body || '', // Corregido de description a body
      media: props.post?.media || null, // Esto es una URL de Firebase Storage
      mediaType: props.post?.mediaType || '',
      categories: props.post?.categories ? [...props.post.categories] : [],
      newMediaFile: null,
    };
  });
  
  // Manejar la carga de medios
  function handleMediaUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        editForm.value.media = reader.result; // Vista previa en base64
        editForm.value.newMediaFile = file; // Guardar el archivo para subirlo luego
        editForm.value.mediaType = file.type.startsWith('image') ? 'image' : 'video';
      };
      reader.onerror = (error) => {
        console.error('Error al leer el archivo:', error);
      };
      reader.readAsDataURL(file);
    }
  }
  
  // Guardar los cambios del posteo
  async function savePost() {
    isLoading.value = true;
    debugger
    if (!editForm.value.title || !editForm.value.body) {
      console.error('Título y cuerpo son obligatorios');
      isLoading.value = false;
      return;
    }
  
    let updatedMediaUrl = props.post.imageUrlFile; // Mantener la URL original por defecto
  
    // Si se subió un nuevo archivo, procesarlo y subirlo a Firebase Storage
    if (editForm.value.newMediaFile) {
      const fileExtension = editForm.value.newMediaFile.name.split('.').pop();
      const filepath = `posts/${editForm.value.id}_${Date.now()}.${fileExtension}`;
      await uploadFile(filepath, editForm.value.newMediaFile);
      updatedMediaUrl = await getFileUrl(filepath); // Obtener la nueva URL
    }
  
    const updatedPost = {
      ...props.post,
      title: editForm.value.title,
      body: editForm.value.body,
      media: updatedMediaUrl, // Usar la URL actualizada o la original
      mediaType: editForm.value.mediaType,
      categories: editForm.value.categories,
    };
  
    try {
      await postsStore.updatePost(updatedPost.idDoc, updatedPost); // Actualizar en el store
      emit('update-post', updatedPost); // Notificar al componente padre
      props.closeModal(); // Cerrar el modal
    } catch (error) {
      console.error('Error al actualizar el post:', error);
    } finally {
      isLoading.value = false;
    }
  }
  </script>
  
  <style scoped>
  /* Estilo del checkbox personalizado (copiado de CreatePostModal.vue) */
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