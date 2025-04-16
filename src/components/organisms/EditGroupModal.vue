<template>
    <div v-if="visible" class="fixed inset-0 bg-black/60 z-101 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="sticky top-0 bg-white dark:bg-gray-800 z-10 p-6 border-b flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-300">Editar grupo</h3>
          <button @click="closeModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100">
            <i class="fa-solid fa-xmark w-6 h-6"></i>
          </button>
        </div>
  
        <!-- Formulario -->
        <div class="p-6">
          <form @submit.prevent="handleUpdateGroup" class="space-y-6">
            <!-- Título -->
            <div>
              <label for="groupTitle" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                Título del Grupo
              </label>
              <input
                v-model="editableGroup.title"
                id="groupTitle"
                type="text"
                class="w-full p-3 border hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                :disabled="isLoading"
                required
              />
            </div>
  
            <!-- Descripción -->
            <div>
              <label for="groupDescription" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                Descripción del Grupo
              </label>
              <textarea
                v-model="editableGroup.description"
                id="groupDescription"
                class="w-full p-3 hover:bg-gray-100 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 min-h-[100px]"
                :disabled="isLoading"
                required
              ></textarea>
            </div>
  
            <!-- Media -->
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
                class="w-full p-2.5 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-200"
              />
            </div>
  
            <div v-if="editableGroup.media.url" class="mt-2">
              <img v-if="editableGroup.media.type === 'image'" :src="editableGroup.media.url" class="w-full h-48 object-cover rounded-lg" />
              <video v-else-if="editableGroup.media.type === 'video'" :src="editableGroup.media.url" controls class="w-full h-48 rounded-lg"></video>
            </div>
  
            <!-- Categorías -->
            <div v-if="categories?.length" class="flex flex-wrap gap-3">
              <label v-for="category in categories" :key="category.id" class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-100">
                <input
                  type="checkbox"
                  v-model="editableGroup.categories"
                  :value="category"
                  :disabled="isLoading"
                />
                {{ category.name }}
              </label>
            </div>
  
            <!-- Privacidad -->
            <div class="flex gap-4 items-center mt-4">
              <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-100">
                <input type="radio" value="public" v-model="editableGroup.privacy" :disabled="isLoading" />
                Público
              </label>
              <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-100">
                <input type="radio" value="private" v-model="editableGroup.privacy" :disabled="isLoading" />
                Privado
              </label>
            </div>
  
            <!-- Botones -->
            <div class="flex justify-end gap-3 mt-6">
              <button type="button" @click="closeModal" class="px-5 py-2 text-gray-500 dark:text-gray-200 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500">
                Cancelar
              </button>
              <button type="submit" :disabled="isLoading" class="px-5 py-2 bg-primary dark:bg-secondary text-white rounded-lg hover:bg-primary-md dark:hover:bg-secondary-md">
                <span v-if="!isLoading">Guardar Cambios</span>
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
  import { ref, watch } from 'vue'
  import { useMediaUpload } from '../../composable/useMediaUpload'
  import { useGroupsStore } from '../../stores/groups'
  
  const props = defineProps({
    visible: Boolean,
    group: Object,
  })
  const emits = defineEmits(['close', 'groupUpdated'])
  
  const { uploadMedia } = useMediaUpload()
  const groupsStore = useGroupsStore()
  
  const isLoading = ref(false)
  const errorFileMessage = ref('')
  
  const editableGroup = ref({
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
  
  const categories = ref([
    { id: 'cuidado', name: 'Cuidado Animal' },
    { id: 'rescate', name: 'Rescate' },
    { id: 'comunidad', name: 'Comunidad' },
    { id: 'educacion', name: 'Educación' },
    { id: 'otros', name: 'Otros' }
  ])
  
  watch(() => props.group, (group) => {
    if (group) {
      editableGroup.value = {
        title: group.title,
        description: group.description,
        media: { ...group.media },
        newMediaBase64: null,
        categories: group.categories,
        privacy: group.privacy
      }
    }
  }, { immediate: true })
  
  function closeModal() {
    emits('close')
  }
  
  async function handleUpdateGroup() {
    isLoading.value = true
    try {
        debugger
      validateForm()
      let updatedUrl = editableGroup.value.media.url
      let updatedPath = editableGroup.value.media.path
      if (editableGroup.value.newMediaBase64) {
        const { url, path } = await uploadMedia({
          currentUrl: editableGroup.value.media.url,
          currentPath: editableGroup.value.media.path,
          newMediaBase64: editableGroup.value.newMediaBase64,
          mediaType: editableGroup.value.media.type,
          dynamicPath: `groups/${props.group.ownerId}/${props.group.id}`
        })
        updatedUrl = url
        updatedPath = path
      }
  
      const updatedGroupData = {
        ...props.group,
        title: editableGroup.value.title,
        description: editableGroup.value.description,
        media: {
          url: updatedUrl,
          path: updatedPath,
          type: editableGroup.value.media.type
        },
        categories: editableGroup.value.categories,
        privacy: editableGroup.value.privacy,
      }
  
      await groupsStore.editGroup(props.group.idDoc, updatedGroupData)
      emits('groupUpdated', updatedGroupData)
      closeModal()
    } catch (err) {
      console.error('Error al actualizar grupo:', err)
      alert('Error al actualizar grupo: ' + err.message)
    } finally {
      isLoading.value = false
    }
  }
  
  function validateForm() {
    if (!editableGroup.value.title || editableGroup.value.title.trim() === '') throw new Error('El título es obligatorio')
    if (!editableGroup.value.description) throw new Error('La descripción es obligatoria')
    if (!editableGroup.value.media.url) throw new Error('Debe tener una portada válida')
    if (editableGroup.value.categories.length === 0) throw new Error('Selecciona al menos una categoría')
  }
  
  function handleMediaUpload(event) {
    const file = event.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      errorFileMessage.value = "Tipo de archivo no permitido."
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      editableGroup.value.newMediaBase64 = reader.result
      editableGroup.value.media = {
        url: URL.createObjectURL(file),
        path: null,
        type: file.type.startsWith('image') ? 'image' : 'video'
      }
    }
    reader.readAsDataURL(file)
  }
  </script>
  