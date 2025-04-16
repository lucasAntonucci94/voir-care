<template>
    <div v-if="visible" class="fixed inset-0 bg-black/60 z-101 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <!-- Encabezado del modal -->
        <div class="sticky top-0 bg-white dark:bg-gray-800 z-10 p-6 border-b flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-300">Crear grupo</h3>
          <button @click="closeModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100">
            <i class="fa-solid fa-xmark w-6 h-6"></i>
          </button>
        </div>
  
        <!-- Contenido del modal -->
        <div class="p-6">
          <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 tracking-tight sr-only">
            Crear Grupo
          </h2>
          <form @submit.prevent="handleCreateGroup" class="space-y-6">
            <!-- Título del Grupo -->
            <div>
              <label for="groupTitle" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                Título del Grupo
              </label>
              <input
                v-model="newGroup.title"
                id="groupTitle"
                type="text"
                placeholder="Ej: Cuidado Animal"
                class="w-full p-3 border hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                :disabled="isLoading"
                required
              />
            </div>
  
            <!-- Descripción del Grupo -->
            <div>
              <label for="groupDescription" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                Descripción del Grupo
              </label>
              <textarea
                v-model="newGroup.description"
                id="groupDescription"
                placeholder="Describe brevemente el objetivo o tema principal del grupo"
                class="w-full p-3 hover:bg-gray-100 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent bg-gray-50 text-gray-700 placeholder-gray-400 resize-y min-h-[100px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                :disabled="isLoading"
                required
              ></textarea>
            </div>
  
            <!-- Imagen o Video (opcional) -->
            <div class="relative">
              <label for="groupMedia" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                Imagen o Video
              </label>
              <input
                id="groupMedia"
                type="file"
                accept="image/*,video/*"
                @change="handleMediaUpload"
                :disabled="isLoading"
                class="w-full p-2.5 hover:bg-gray-100 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary dark:file:bg-secondary file:text-white hover:file:bg-primary-md dark:hover:file:bg-secondary-md transition-all duration-200 cursor-pointer bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
              />
            </div>
  
            <!-- Previsualización de Media -->
            <div v-if="newGroup.media.url" class="mt-2">
              <img
                v-if="newGroup.media.type === 'image'"
                :src="newGroup.media.url"
                alt="Preview"
                class="w-full h-48 object-cover rounded-lg shadow-sm"
              />
              <video
                v-else-if="newGroup.media.type === 'video'"
                :src="newGroup.media.url"
                controls
                class="w-full h-48 rounded-lg shadow-sm"
              ></video>
            </div>
  
            <!-- Categorías (opcional) -->
            <div v-if="categories?.length" class="flex flex-wrap gap-3">
              <label
                v-for="category in categories"
                :key="category.id"
                class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer dark:text-gray-100 dark:hover:text-gray-300"
              >
                <input
                  :id="'filter_' + category.id"
                  type="checkbox"
                  v-model="newGroup.categories"
                  :value="category"
                  :disabled="isLoading"
                  class="custom-checkbox hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-800"
                />
                <span class="font-medium">{{ category.name }}</span>
              </label>
            </div>
  
            <!-- Privacidad (público/privado) -->
            <div class="flex gap-4 items-center mt-4">
              <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-100">
                <input
                  type="radio"
                  value="public"
                  v-model="newGroup.privacy"
                  :disabled="isLoading"
                />
                Público
              </label>
              <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-100">
                <input
                  type="radio"
                  value="private"
                  v-model="newGroup.privacy"
                  :disabled="isLoading"
                />
                Privado
              </label>
            </div>
  
            <!-- Botones -->
            <div class="flex justify-end gap-3 mt-6">
              <button
                type="button"
                @click="closeModal"
                class="px-5 py-2 text-gray-500 dark:text-gray-200 dark:bg-gray-600 font-medium rounded-lg hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-500 transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                :disabled="isLoading"
                type="submit"
                class="relative px-5 py-2 bg-primary dark:bg-secondary text-white font-medium rounded-lg hover:bg-primary-md dark:hover:bg-secondary-md transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-primary-md dark:disabled:bg-secondary-md disabled:cursor-not-allowed"
              >
                <span v-if="!isLoading">Crear Grupo</span>
                <span v-else class="flex items-center gap-2">
                  <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Creando...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useMediaUpload } from '../../composable/useMediaUpload'
  import { newGuid } from '../../utils/newGuid'
  import { useGroupsStore } from '../../stores/groups'
  import { useAuth } from '../../api/auth/useAuth'
  
  const emits = defineEmits(['close', 'groupCreated'])
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    }
  })
  
  const { uploadMedia } = useMediaUpload()
  const { user } = useAuth()
  const groupsStore = useGroupsStore()
  
  // Mensaje de error para archivos
  const errorFileMessage = ref('')
  
  const isLoading = ref(false)
  const categories = ref([
    { id: 'cuidado', name: 'Cuidado Animal' },
    { id: 'rescate', name: 'Rescate' },
    { id: 'comunidad', name: 'Comunidad' },
    { id: 'educacion', name: 'Educación' },
    { id: 'otros', name: 'Otros' }
  ])
  
  const newGroup = ref({
    title: '',
    description: '',
    media: {
      url: '',
      path: null,
      type: null,
    },
    newMediaBase64: null,
    categories: [],
    privacy: 'public'
  })
  
  function closeModal() {
    resetForm()
    errorFileMessage.value = ''
    emits('close')
  }
  
  async function handleCreateGroup() {
    isLoading.value = true
    try {
      validateForm()
      const ownerId = user.value?.uid || user.value?.id || null
      let updatedPhotoUrl = null
      let updatedPhotoPath = null
      if (newGroup.value.newMediaBase64) {
        const dynamicPath = `groups/${ownerId}/${newGuid()}`
        const { url, path } = await uploadMedia({
          currentUrl: null,
          currentPath: null,
          newMediaBase64: newGroup.value.newMediaBase64,
          mediaType: newGroup.value.media.type,
          dynamicPath,
        })
        updatedPhotoUrl = url
        updatedPhotoPath = path
      }
      const groupData = {
        title: newGroup.value.title,
        description: newGroup.value.description,
        media: {
          url: updatedPhotoUrl || null,
          path: updatedPhotoPath || null,
          type: newGroup.value.media.type || null,
        },
        privacy: newGroup.value.privacy,
        categories: newGroup.value.categories,
        ownerId: ownerId,
        admins: [ownerId],
        members: [ownerId],
        rules: '',
        status: 'active',
        // Los timestamps se agregan en el backend/Firebase
      }
      await groupsStore.createGroup(groupData)
      emits('groupCreated', groupData)
      closeModal()
    } catch (error) {
      console.error('Error al crear grupo:', error)
      alert('Error al crear grupo: ' + error.message)
    } finally {
      isLoading.value = false
    }
  }
  
  function resetForm() {
    newGroup.value = {
      title: '',
      description: '',
      media: {
        url: '',
        path: null,
        type: null,
      },
      newMediaBase64: null,
      categories: [],
      privacy: 'public'
    }
  }
  
  function validateForm() {
    if (!newGroup.value.title && newGroup.value.title.trim() === '') {
      throw new Error('El título es obligatorio')
    }
    if (!newGroup.value.description) {
      throw new Error('La descripción es obligatoria')
    }
    if (!newGroup.value.media.url) {
      throw new Error('Debe cargarle una portada al grupo.')
    }
    if (newGroup.value.categories.length === 0) {
      throw new Error('Debes seleccionar al menos una categoría')
    }
    if (newGroup.value.privacy !== 'public' && newGroup.value.privacy !== 'private') {
      throw new Error('La privacidad debe ser pública o privada')
    }
  }
  
  function handleMediaUpload(event) {
    errorFileMessage.value = ''
    const file = event.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      errorFileMessage.value = "El tipo de archivo no es permitido. Selecciona una imagen o video."
      event.target.value = '' // Limpiar el input
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      newGroup.value.newMediaBase64 = reader.result
      newGroup.value.media = {
        url: URL.createObjectURL(file),
        path: null,
        type: file.type.startsWith('image') ? 'image' : 'video'
      }
    }
    reader.onerror = (error) => {
      console.error('Error al leer el archivo:', error)
    }
    reader.readAsDataURL(file)
  }
  </script>
  
  <style scoped>
  /* Oculta scrollbars en los contenedores scrollables */
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  /* Estilos para el scroll del modal */
  .overflow-y-auto {
    scrollbar-width: thin;
    scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
  }
  
  .overflow-y-auto::-webkit-scrollbar {
    width: 6px;
  }
  
  .overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 3px;
  }
  
  .overflow-y-auto::-webkit-scrollbar-track {
    background: transparent;
  }
  </style>
  