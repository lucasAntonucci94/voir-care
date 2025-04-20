<template>
  <div class="relative w-full h-38 md:h-64 overflow-hidden">
    <img :src="activeUser?.bannerUrlFile ?? bannerUrl" alt="Banner" class="w-full h-full object-cover" />
    <div class="absolute inset-0 bg-black/50"></div>
  </div>
  <div class="container mx-auto px-4 md:px-8 lg:px-16 -mt-12 md:-mt-16 relative">
    <div class="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
      <ProfileInfoCard :activeUser="activeUser" :connections="connections" :setTabConexiones="setTabConexiones" />
      <div v-if="isOwnProfile" class="flex flex-col gap-4 h-30 w-full md:w-auto">
        <div class="hidden md:flex justify-center md:justify-end gap-2">
          <button @click="openBannerModal" class="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700/80 dark:text-gray-300 dark:hover:bg-gray-500 dark:hover:text-gray-100 rounded-full transition-all shadow-md">
            <i class="fa fa-camera pr-2"></i> Editar portada
          </button>
        </div>
        <div class="flex justify-center md:justify-end mt-auto">
          <div class="flex flex-col gap-2 md:flex-row md:gap-4">
            <CreateStoryModal />
            <button class="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-500 dark:hover:text-gray-100 rounded-full transition-all shadow-md" @click="editProfile">
              <i class="fa fa-edit pr-2"></i> Editar perfil
            </button>
          </div>
        </div>
      </div>
      <div v-else class="flex flex-col gap-4 h-30 w-full md:w-auto">
        <div class="flex justify-center md:justify-end gap-2">
          <button 
            v-if="!isFollowing" 
            @click="handlerAddConnection" 
            class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-full hover:bg-primary-md dark:hover:bg-secondary-md hover:text-gray-10 transition-all shadow-md"
            :disabled="isAddingConnection"
          >
            <i class="fa fa-user-plus pr-2"></i>
            {{ isAddingConnection ? 'Siguiendo...' : 'Seguir' }}
          </button>
          <button 
            v-else 
            @click="handlerRemoveConnection" 
            class="px-4 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-all shadow-md"
            :disabled="isRemovingConnection"
          >
            <i class="fa fa-user-minus pr-2"></i>
            {{ isRemovingConnection ? 'Dejando...' : 'Dejar de seguir' }}
          </button>
        </div>
        <div class="flex justify-center md:justify-end mt-auto">
          <div class="flex flex-col gap-2 md:flex-row md:gap-4">
            <router-link class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-full hover:bg-primary-md dark:hover:bg-secondary-md hover:text-gray-10 transition-all shadow-md" to="/chats" @click="sendMessage">
              <i class="fa fa-message pr-2"></i> Enviar Mensaje
            </router-link>
            <button class="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-all shadow-md" @click="setTabInformation">
              <i class="fa fa-info pr-2"></i> Ver Información
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal para editar el banner -->
  <div v-if="showBannerModal" class="fixed inset-0 bg-black/50 z-101 flex items-center justify-center p-4 overflow-hidden">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-y-auto">
      <div class="sticky top-0 z-10 p-4 border-b">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-300">Editar Portada</h2>
          <button @click="closeBannerModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-300  dark:hover:text-gray-100">
            <i class="fa-solid fa-xmark w-6 h-6"></i>
          </button>
        </div>
      </div>
      <div class="p-4">
        <!-- Previsualización -->
        <div v-if="previewUrl" class="mb-4">
          <img :src="previewUrl" alt="Previsualización del banner" class="w-full h-32 object-cover rounded-md" />
        </div>
        <div v-else-if="activeUser?.bannerUrlFile" class="mb-4">
          <img :src="activeUser.bannerUrlFile" alt="Banner actual" class="w-full h-32 object-cover rounded-md" />
        </div>
        <div v-else class="mb-4 text-gray-500 dark:text-gray-300 text-center">
          No hay banner actual. Sube uno nuevo.
        </div>

        <!-- Input para seleccionar archivo -->
        <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Archivo (imagen/video)</label>
            <input
              type="file"
              accept="image/*,video/*"
              @change="handleFileChange($event)"
              :class="[
                'w-full p-2 border dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary dark:file:bg-secondary file:text-white hover:file:bg-opacity-90 transition-colors duration-200',
                errorBannerFileMessage ? 'border-red-500' : 'border-gray-300  dark:border-gray-800'
              ]"
              :disabled="isLoading"
              required
            />
            <!-- Mensaje de error -->
            <p v-if="errorBannerFileMessage" class="text-red-500 text-sm mt-1">{{ errorBannerFileMessage }}</p>
          </div>
        <!-- Botones -->
        <div class="flex justify-end gap-2 mt-4">
          <button @click="closeBannerModal" :disabled="uploading" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-all">
            Cancelar
          </button>
          <button
              @click="saveBanner"
              class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-full hover:bg-primary-md dark:hover:bg-secondary-md transition-all"
              :disabled="(!selectedFile && uploading) || errorBannerFileMessage !== ''"
              :class="{'opacity-50 cursor-not-allowed': (!selectedFile && uploading) || errorBannerFileMessage !== ''}"
            >
              <span v-if="!uploading">Guardar</span>
              <span v-else class="flex items-center">
                <i class="fa-solid fa-spinner animate-spin h-5 w-5 mr-2 text-white"></i>
                Guardando...
              </span>
            </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de edición de perfil -->
  <div v-if="showEditModal" class="fixed inset-0 bg-black/50 z-101 flex items-center justify-center p-4 overflow-hidden">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md h-[90vh] overflow-y-auto">
      <div class="sticky top-0 z-10 p-4 border-b bg-white dark:bg-gray-800">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-300">Editar Perfil</h2>
          <button @click="closeEditModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100">
            <i class="fa-solid fa-xmark w-6 h-6"></i>
          </button>
        </div>
      </div>
      <div class="p-4">
        <ProfileForm :activeUser="activeUser" :closeEditModal="closeEditModal" :updateRefData="updateRefData" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStorage } from '../../composable/useStorage';
import { useUsers } from '../../composable/useUsers';
import ProfileForm from '../molecules/ProfileForm.vue';
import ProfileInfoCard from './ProfileInfoCard.vue';
import { usePrivateChatsStore } from '../../stores/privateChats';
import { usePrivateChats } from '../../composable/usePrivateChats';
import { useAuth } from '../../api/auth/useAuth';
import CreateStoryModal from '../organisms/CreateStoryModal.vue';
import BannerDefault from '../../assets/darkwallpaper.jpg'

// Props
const props = defineProps({
  activeUser: { type: Object, required: true },
  activeTab: { type: String, required: true },
  isOwnProfile: { type: Boolean, required: true },
  setTabConexiones: { type: Function, required: true },
  setTabInformation: { type: Function, required: true },
  connections: { type: Array, required: true },
  updateRefData: { type: Function, required: true },
});

// Instancias
const { uploadFile, getFileUrl } = useStorage();
const { user: authUser } = useAuth();
const { getChatIdByReference } = usePrivateChats();
const { updateUserBanner } = useUsers();
const privateChatsStore = usePrivateChatsStore();
const { getUser, addConnection, removeConnection } = useUsers();

// Estados
const isAddingConnection = ref(false);
const isRemovingConnection = ref(false);
const showEditModal = ref(false);
const showBannerModal = ref(false);
const selectedFile = ref(null);
const previewUrl = ref(null);
const uploading = ref(false);
const bannerUrl = ref(BannerDefault);
const errorBannerFileMessage = ref('');

// Computados
const isFollowing = computed(() => {
  return authUser.value?.connections?.some(conn => conn.uid === props?.activeUser?.uid);
});

// Métodos
function openBannerModal() {
  showBannerModal.value = true;
  document.body.style.overflow = 'hidden'; // Fija el fondo
}

function closeBannerModal() {
  showBannerModal.value = false;
  selectedFile.value = null;
  previewUrl.value = null;
  document.body.style.overflow = ''; // Restaura el scroll del body
}

function handleFileChange(event) {
  errorBannerFileMessage.value = ''; // Reiniciar mensaje de error

  const file = event.target.files[0];
  if (!file) return
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    errorBannerFileMessage.value = "El tipo de archivo no es permitido. Selecciona una imagen o video.";
    event.target.value = ''; // Limpiar el input
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    selectedFile.value = e.target.result; // Guardar como Base64
    previewUrl.value = e.target.result; // Usar Base64 para previsualización
  };
  reader.readAsDataURL(file); // Convertir a Base64
}

async function saveBanner() {
  if (!props.isOwnProfile || !selectedFile.value) return;
  uploading.value = true;
  try {
    const filepath = `banners/${props.activeUser?.email}.jpg`;
    await uploadFile(filepath, selectedFile.value);
    const url = await getFileUrl(filepath);
    
    await updateUserBanner(props.activeUser.uid, {
      bannerUrlFile: url,
      bannerPathFile: filepath,
    });

    props.activeUser.bannerUrlFile = url;
    closeBannerModal();
  } catch (err) {
    console.error('Error al actualizar el banner:', err);
    alert('Hubo un error al subir el banner. Intenta de nuevo.');
  } finally {
    uploading.value = false;
  }
}

const handlerAddConnection = async () => {
  if (!authUser.value) {
    alert('Debes estar autenticado para seguir a alguien.');
    return;
  }

  isAddingConnection.value = true;
  try {
    const connectionData = {
      uid: props.activeUser.uid,
      displayName: props.activeUser.displayName,
      email: props.activeUser.email,
      avatar: props.activeUser.photoURLFile,
    };
    await addConnection(authUser.value.uid, connectionData);
    authUser.value.connections.push(connectionData);
  } catch (error) {
    console.error('Error al seguir al usuario:', error);
    alert('Hubo un error al intentar seguir a este usuario.');
  } finally {
    isAddingConnection.value = false;
  }
};

const handlerRemoveConnection = async () => {
  if (!authUser.value) {
    alert('Debes estar autenticado para dejar de seguir a alguien.');
    return;
  }

  isRemovingConnection.value = true;
  try {
    const connectionData = {
      uid: props.activeUser.uid,
      displayName: props.activeUser.displayName,
      email: props.activeUser.email,
      avatar: props.activeUser.photoURLFile,
    };
    await removeConnection(authUser.value.uid, connectionData);
    if (authUser.value.connections) {
      authUser.value.connections = authUser.value.connections.filter(
        conn => conn.uid !== connectionData.uid
      );
    }
  } catch (error) {
    console.error('Error al dejar de seguir al usuario:', error);
    alert('Hubo un error al intentar dejar de seguir a este usuario.');
  } finally {
    isRemovingConnection.value = false;
  }
};

function editProfile() {
  showEditModal.value = true;
  document.body.style.overflow = 'hidden'; // Fija el fondo
}

function closeEditModal() {
  showEditModal.value = false;
  document.body.style.overflow = ''; // Restaura el scroll del body
}

async function sendMessage() {
  if (authUser.value.email && props.activeUser?.email) {
    const chatId = await getChatIdByReference(authUser.value.email, props.activeUser?.email);
    privateChatsStore.setSelectedChatId(chatId);
    privateChatsStore.setFromEmail(authUser.value.email);
    privateChatsStore.setToEmail(props.activeUser?.email);
  }
}
</script>

<style scoped>
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