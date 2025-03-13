<!-- ProfileHeader.vue -->
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
          <button v-if="!isEditingBanner" @click="toggleEditBanner" class="px-4 py-2 bg-white/80 text-gray-700 rounded-full hover:bg-white transition-all shadow-md">
            <i class="fa fa-camera pr-2"></i> Editar portada
          </button>
          <div v-if="isEditingBanner" class="flex items-center gap-2">
            <input type="file" @change="updateBanner($event.target.files[0])" class="px-4 py-2 bg-white/80 text-gray-700 rounded-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary file:text-white hover:file:bg-primary-md" />
            <button @click="toggleEditBanner" class="px-3 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div class="flex justify-center md:justify-end mt-auto">
          <div class="flex flex-col gap-2 md:flex-row md:gap-4">
            <CreateStoryModal />
            <button class="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-all shadow-md" @click="editProfile">
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
            class="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-md hover:text-gray-10 transition-all shadow-md"
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
            <router-link class="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-md hover:text-gray-10 transition-all shadow-md" to="/chats" @click="sendMessage">
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
  <div v-if="showEditModal" class="fixed inset-0 bg-black/50 z-101 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between p-4 border-b">
        <h2 class="text-lg font-semibold text-gray-800">Editar Perfil</h2>
        <button @click="closeEditModal" class="text-gray-500 hover:text-gray-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <ProfileForm :activeUser="activeUser" :closeEditModal="closeEditModal" :updateRefData="updateRefData" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStorage } from '../../composable/useStorage';
import ProfileForm from '../molecules/ProfileForm.vue';
import ProfileInfoCard from './ProfileInfoCard.vue';
import { usePrivateChatsStore } from '../../stores/privateChats';
import { usePrivateChats } from '../../composable/usePrivateChats';
import { useAuth } from '../../api/auth/useAuth';
import CreateStoryModal from '../organisms/CreateStoryModal.vue';
import { useUsers } from '../../composable/useUsers';

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
const privateChatsStore = usePrivateChatsStore();
const { getUser, addConnection, removeConnection } = useUsers();

// Estados
const isAddingConnection = ref(false);
const isRemovingConnection = ref(false);
const isEditingBanner = ref(false);
const showEditModal = ref(false);
const bannerUrl = ref('https://scontent.faep7-1.fna.fbcdn.net/v/t39.30808-6/468006144_10235042225423750_1721754758729309234_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeHLiv8dN0LxWRWLAoantdebrW8BVSE3WC2tbwFVITdYLWPE5IcKzXsjstYJCRhTML4&_nc_ohc=h4dpp8obhPsQ7kNvgEFWjFO&_nc_oc=AdghQMM5J-uvHF2Rmsco8ZEkpWJW-fFeLzgudtB3nZO6NqLLr9A3i9BKaXhb9glG3PbjTLs2dtlcSMGnK5O0qEBw&_nc_zt=23&_nc_ht=scontent.faep7-1.fna&_nc_gid=AtJyPxfdbpgLXVow-4flfwi&oh=00_AYA6zA75nJh-mEs-Sbe2DAm0c8oq9FE4aYp8IINt2nvSpQ&oe=67C9CC8E');

// Computados
const isFollowing = computed(() => {
  return authUser.value?.connections?.some(conn => conn.uid === props?.activeUser?.uid);
});

// Métodos
function toggleEditBanner() {
  isEditingBanner.value = !isEditingBanner.value;
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
    // alert(`¡Ahora sigues a ${props.activeUser.displayName}!`);
    authUser.value.connections.push(connectionData);
    // props.updateRefData(); // Actualizamos los datos del usuario autenticado
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
    // alert(`Has dejado de seguir a ${props.activeUser.displayName}.`);
    if (authUser.value.connections) {
      authUser.value.connections = authUser.value.connections.filter(
        conn => conn.uid !== connectionData.uid
      );
    }
    // props.updateRefData(); // Actualizamos los datos del usuario autenticado
  } catch (error) {
    console.error('Error al dejar de seguir al usuario:', error);
    alert('Hubo un error al intentar dejar de seguir a este usuario.');
  } finally {
    isRemovingConnection.value = false;
  }
};

async function updateBanner(file) {
  if (!props.isOwnProfile || !file) return;
  const filepath = `banners/${props.activeUser?.email}.jpg`;
  try {
    await uploadFile(filepath, file);
    const url = await getFileUrl(filepath);
    props.activeUser.bannerUrlFile = url;
    isEditingBanner.value = false;
  } catch (err) {
    console.error('Error al actualizar banner:', err);
  }
}

function editProfile() {
  showEditModal.value = true;
}

function closeEditModal() {
  showEditModal.value = false;
}

async function sendMessage() {
  if(authUser.value.email !== null && authUser.value.email !== undefined && props.activeUser?.email !== null && props.activeUser?.email !== undefined){
    const chatId = await getChatIdByReference(authUser.value.email, props.activeUser?.email);
    privateChatsStore.setSelectedChatId(chatId);
    privateChatsStore.setFromEmail(authUser.value.email);
    privateChatsStore.setToEmail(props.activeUser?.email);
  }
}
</script>