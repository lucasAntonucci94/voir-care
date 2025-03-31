<template>
  <div class="flex min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="flex-1 overflow-y-auto">
      <!-- Encabezado interno de la sección Grupos -->
      <div class="bg-white dark:bg-gray-800 shadow-sm">
        <div class="container mx-auto px-4 md:px-8 lg:px-16 py-4">
          <div class="flex items-center justify-between">
            <h1 class="text-xl font-bold text-[#2c3e50] dark:text-white">Grupos</h1>
            <button
            @click="handleModalCreate"
              class="hidden sm:inline-flex px-4 py-2 bg-primary dark:bg-secondary text-white rounded-full hover:bg-primary-md dark:hover:bg-secondary-md transition-colors"
            >
              + Crear Grupo
            </button>
          </div>
          <!-- Tabs -->
          <div class="mt-4 flex gap-2 overflow-x-auto scrollbar-hide whitespace-nowrap md:justify-start">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[ 
                'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200',
                activeTab === tab.id
                  ? 'bg-primary hover:bg-primary-md dark:bg-secondary dark:hover:bg-secondary-md text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'
              ]"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Contenido de tab -->
      <div class="container mx-auto px-4 md:px-8 lg:px-16 my-6">
        <!-- Tab: GroupsFeed -->
        <div v-if="activeTab === 'feed'">
          <h2 class="text-lg font-semibold text-[#2c3e50] dark:text-white mb-4">Tus Feed de Grupos</h2>
          <div class="space-y-6 flex flex-col items-center">
            <PostCard
              v-for="post in feedPosts"
              :key="post.idDoc"
              :post="post"
            />
            <p v-if="feedPosts.length === 0" class="text-center text-gray-500">
              No hay publicaciones en tu feed.
            </p>
          </div>
        </div>

        <!-- Tab: Descubrir -->
        <div v-else-if="activeTab === 'discover'">
          <h2 class="text-lg font-semibold text-[#2c3e50] dark:text-white mb-4">Descubrir Grupos</h2>
          <!-- Aquí tus tarjetas de grupos -->
        </div>

        <!-- Tab: Tus Grupos -->
        <div v-else-if="activeTab === 'yourGroups'">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tus Grupos</h2>
          <div v-if="groupsStore.groups.value.length > 0" class="flex flex-wrap gap-1 justify-center align-center">
            <div 
              v-for="group in groupsStore.groups.value" 
              :key="group.idDoc" 
              class="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
            >
              <h3 class="font-bold text-gray-900 dark:text-white">{{ group.title }}</h3>
              <p class="text-gray-700 dark:text-gray-300">{{ group.description }}</p>
              <img :src="group.media" :alt="group.title" class="w-50">
            </div>
          </div>
          <p v-else class="text-center text-gray-500">No perteneces a ningún grupo.</p>
        </div>
      </div>
    </div>

    <!-- Modal de Creación de un grupo -->
  <div
    v-if="showModalCreate"
    class="fixed inset-0 bg-black/60 z-101 flex items-center justify-center p-4"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
    >
      <!-- Encabezado del modal -->
      <div class="sticky top-0 bg-white dark:bg-gray-800 z-10 p-6 border-b">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-300">
            Crear grupo
          </h3>
          <button
            @click="closeModalCreate"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Contenido del modal -->
      <div class="p-6">
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 tracking-tight sr-only">
          Crear Grupo
        </h2>

        <!-- Formulario -->
        <form @submit.prevent="handleCreateGroup" class="space-y-6">
          <!-- Título del Grupo -->
          <div>
            <label
              for="groupTitle"
              class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200"
              >Título del Grupo</label
            >
            <input
              v-model="newGroup.title"
              id="groupTitle"
              type="text"
              placeholder="Ej: Cuidado Animal"
              class="w-full p-3 border hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
              :disabled="isLoading"
              required
            />
          </div>

          <!-- Descripción -->
          <div>
            <label
              for="groupDescription"
              class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200"
              >Descripción del Grupo</label
            >
            <textarea
              v-model="newGroup.description"
              id="groupDescription"
              placeholder="Describe brevemente el objetivo o tema principal del grupo"
              class="w-full p-3 hover:bg-gray-100 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent bg-gray-50 text-gray-700 placeholder-gray-400 resize-y min-h-[100px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
              :disabled="isLoading"
              required
            ></textarea>
          </div>

          <!-- Imagen (opcional) -->
          <div class="relative">
            <label
              for="groupMedia"
              class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200"
              >Imagen o Video</label
            >
            <input
              id="groupMedia"
              type="file"
              accept="image/*,video/*"
              @change="handleMediaUpload"
              :disabled="isLoading"
              class="w-full p-2.5 hover:bg-gray-100 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary dark:file:bg-secondary file:text-white hover:file:bg-primary-md dark:hover:file:bg-secondary-md transition-all duration-200 cursor-pointer bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
            />
          </div>

          <!-- Previsualización -->
          <div v-if="newGroup.media" class="mt-2">
            <img
              v-if="newGroup.mediaType === 'image'"
              :src="newGroup.media"
              alt="Preview"
              class="w-full h-48 object-cover rounded-lg shadow-sm"
            />
            <video
              v-else-if="newGroup.mediaType === 'video'"
              :src="newGroup.media"
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
              @click="closeModalCreate"
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
                <span
                  class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                ></span>
                Creando...
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import PostCard from '../components/organisms/PostCard.vue'
import { useAuth } from '../api/auth/useAuth'
import { useMediaUpload } from '../composable/useMediaUpload';
import { newGuid } from '../utils/newGuid';
import { useGroupsStore } from '../stores/groups'
import ImageToDelete from '../assets/bg/bg-cat2.jpg'

const { uploadMedia, isUploading } = useMediaUpload();
const { user } = useAuth()
const groupsStore  = useGroupsStore()

// Estado
const showModalCreate = ref(false);
const isLoading = ref(false)
const newGroup = ref({
  title: '',
  description: '',
  media: '',
  mediaType: '',
  newMediaBase64: null,
  categories: [],
  privacy: 'public' // valor por defecto
})

// Definición de las tabs
const tabs = [
  { id: 'feed', label: 'Tus Feed' },
  { id: 'discover', label: 'Descubrir' },
  { id: 'yourGroups', label: 'Tus Grupos' },
]
const activeTab = ref('feed')

// Datos mock para grupos
const groups = ref([
  {
    id: '1',
    idDoc: '1',
    title: 'Rescate Animal 1',
    description: 'Grupo para coordinar rescates y emergencias.',
    imageUrl: ImageToDelete, // la URL o base64 si subiste a storage
    privacy: 'public',
    categories: [],
    ownerId: 'user2', // id del usuario creador
    media: ImageToDelete, // URL de la imagen o video subido
    mediaPath: 'filePath', // Path de la imagen o video subido
    mediaType: 'image', // Tipo de media (imagen o video)
    members: ['user1'], // Miembros iniciales (el creador)
  },
  {
    id: '2',
    idDoc: '2',
    title: 'Rescate Animal 2',
    description: 'Grupo para coordinar rescates y emergencias.',
    imageUrl: ImageToDelete, // la URL o base64 si subiste a storage
    privacy: 'public',
    categories: [],
    ownerId: 'user2', // id del usuario creador
    media: ImageToDelete, // URL de la imagen o video subido
    mediaPath: 'filePath', // Path de la imagen o video subido
    mediaType: 'image', // Tipo de media (imagen o video)
    members: ['user2'], // Miembros iniciales (el creador)
  },
  {
    id: '3',
    idDoc: '3',
    title: 'Rescate Animal 3',
    description: 'Grupo para coordinar rescates y emergencias.',
    imageUrl: ImageToDelete, // la URL o base64 si subiste a storage
    privacy: 'public',
    categories: [],
    ownerId: 'user3', // id del usuario creador
    media: ImageToDelete, // URL de la imagen o video subido
    mediaPath: 'filePath', // Path de la imagen o video subido
    mediaType: 'image', // Tipo de media (imagen o video)
    members: ['user3'], // Miembros iniciales (el creador)
  },
  {
    id: '4',
    idDoc: '4',
    title: 'Rescate Animal 4',
    description: 'Grupo para coordinar rescates y emergencias.',
    imageUrl: ImageToDelete, // la URL o base64 si subiste a storage
    privacy: 'public',
    categories: [],
    ownerId: 'user3', // id del usuario creador
    media: ImageToDelete, // URL de la imagen o video subido
    mediaPath: 'filePath', // Path de la imagen o video subido
    mediaType: 'image', // Tipo de media (imagen o video)
    members: ['user3'], // Miembros iniciales (el creador)
  }
])

// Supongamos que el usuario ya es miembro de los grupos 1 y 2
const userMembership = ref(['1', '2'])


// Datos mock para posteos en grupos (incluimos la propiedad groupId para saber a qué grupo pertenece cada post)
const posts = ref([
  {
    idDoc: 'post1',
    id: 'post1',
    groupId: '1',
    title: 'Primer post en Cuidado Animal',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    user: 'user1',
    categories: [{ id: 'cat1', name: 'Bienestar' }],
    created_at: new Date(),
    imagePathFile: '',
    imageUrlFile: 'https://via.placeholder.com/300',
    likes: [],
    mediaType: 'image'
  },
  {
    idDoc: 'post2',
    id: 'post2',
    groupId: '2',
    title: 'Post interesante en Adopciones',
    body: 'Curabitur vitae nunc sed velit dignissim sodales ut eu sem.',
    user: 'user2',
    categories: [{ id: 'cat2', name: 'Adopción' }],
    created_at: new Date(),
    imagePathFile: '',
    imageUrlFile: 'https://via.placeholder.com/300',
    likes: [],
    mediaType: 'image'
  },
  {
    idDoc: 'post3',
    id: 'post3',
    groupId: '1',
    title: 'Otro post en Cuidado Animal',
    body: 'Praesent elementum facilisis leo vel fringilla.',
    user: 'user1',
    categories: [{ id: 'cat1', name: 'Bienestar' }],
    created_at: new Date(),
    imagePathFile: '',
    imageUrlFile: 'https://via.placeholder.com/300',
    likes: [],
    mediaType: 'image'
  }
])
// Categorías mock (opcional)
const categories = [
  { id: 'cat1', name: 'Bienestar' },
  { id: 'cat2', name: 'Adopción' },
  { id: 'cat3', name: 'Rescate' }
]

// Filtramos los posts que pertenezcan a los grupos del usuario para el feed
const feedPosts = computed(() =>
  posts.value.filter(post => userMembership.value.includes(post.groupId))
)

const handleModalCreate = () => {
  showModalCreate.value = true
  document.body.style.overflow = 'hidden';

}
const closeModalCreate = () => {
  showModalCreate.value = false
  document.body.style.overflow = '';
  resetForm()
}

// Manejo del submit
async function handleCreateGroup() {
  isLoading.value = true
  try {
    const ownerId = user.value?.uid || user.value?.id || null
    let updatedPhotoUrl = null;
    let updatedPhotoPath = null;
    if (newGroup.value.newMediaBase64) {
      const dynamicPath = `groups/${ownerId}/${newGuid()}`;
      const { url, path } = await uploadMedia({
        currentUrl: null,
        currentPath: null,
        newMediaBase64: newGroup.value.newMediaBase64,
        mediaType: newGroup.value.mediaType,
        dynamicPath,
      });
      updatedPhotoUrl = url;
      updatedPhotoPath = path;
    }
    // Crea el objeto de grupo que vas a enviar
    const groupData = {
      title: newGroup.value.title,
      description: newGroup.value.description,
      imageUrl: newGroup.value.media, // la URL o base64 si subiste a storage
      privacy: newGroup.value.privacy,
      categories: newGroup.value.categories,
      ownerId: ownerId, // id del usuario creador
      media: updatedPhotoUrl || null, // URL de la imagen o video subido
      mediaPath: updatedPhotoPath || null, // Path de la imagen o video subido
      mediaType: newGroup.value.mediaType || null, // Tipo de media (imagen o video)
      members: [ownerId], // Miembros iniciales (el creador)
    }
    await groupsStore.createGroup(groupData)
    // Cierra el modal
    closeModalCreate()
  } catch (error) {
    console.error('Error al crear grupo:', error)
  } finally {
    isLoading.value = false
  }
}

// Resetea el formulario al cerrar o crear
function resetForm() {
  newGroup.value = {
    title: '',
    description: '',
    media: '',
    mediaType: '',
    newMediaBase64: null,
    categories: [],
    privacy: 'public'
  }
}

// Manejo de subida de media (imagen/video)
function handleMediaUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      newGroup.value.newMediaBase64 = reader.result;
      newGroup.value.media = URL.createObjectURL(file);
      newGroup.value.mediaType = file.type.startsWith('image') ? 'image' : 'video';
    };
    reader.onerror = (error) => {
      console.error('Error al leer el archivo:', error);
    };
    reader.readAsDataURL(file);
  }
}


// // Iniciar suscripción al montar el componente
// onMounted(() => {
//   console.log(user.value)
//   debugger
//   // if(user.value){
//   //   groupsStore.subscribeUserGroups(user.value.uid)
//   // }
// })
// Suscribirse a los grupos del usuario cuando esté autenticado
watch(
  () => user.value,
  (newUser) => {
    if (newUser && newUser.uid) {
      debugger
      groupsStore.subscribeUserGroups(newUser.uid)
    }
  },
  { immediate: true }
)


// Cancelar suscripción al desmontar el componente
onUnmounted(() => {
  // groupsStore.unsubscribeGroups()
})
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
