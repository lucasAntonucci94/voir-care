<template>
    <!-- Banner -->
    <div class="relative w-full h-38 md:h-64 overflow-hidden">
      <img :src="activeUser?.bannerUrlFile ?? bannerUrl" alt="Banner" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-black/50">
      </div>
    </div>
    <!-- Perfil -->
    <div class="container mx-auto px-4 md:px-8 lg:px-16 -mt-12 md:-mt-16 relative">
      <div class="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
        <!-- Datos del usuario -->
         <ProfileInfoCard :activeUser="activeUser" :connections="connections" :setTabConexiones="setTabConexiones" />
        <!-- Botones de acción -->
        <div v-if="isOwnProfile" class="flex flex-col gap-4 h-30 w-full md:w-auto">
          <!-- Editar portada (superior derecha) -->
          <div class="hidden md:flex justify-center md:justify-end gap-2">
            <button 
              v-if="!isEditingBanner" 
              @click="toggleEditBanner" 
              class="px-4 py-2 bg-white/80 text-gray-700 rounded-full hover:bg-white transition-all shadow-md"
            >
              <i class="fa fa-camera pr-2"></i>
              Editar portada
            </button>
            <div v-if="isEditingBanner" class="flex items-center gap-2">
              <input 
                type="file" 
                @change="updateBanner($event.target.files[0])" 
                class="px-4 py-2 bg-white/80 text-gray-700 rounded-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary file:text-white hover:file:bg-primary-md"
              />
              <button 
                @click="toggleEditBanner" 
                class="px-3 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <!-- Agregar historia y Editar perfil (inferior derecha) -->
          <div class="flex justify-center md:justify-end mt-auto">
            <div class="flex flex-col gap-2 md:flex-row md:gap-4">
              <button 
                class="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-md transition-all shadow-md" 
                @click="addStory"
              >
                <i class="fa fa-book pr-2"></i>
                Agregar historia
              </button>
              <button 
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-all shadow-md" 
                @click="editProfile"
              >
              <i class="fa fa-edit pr-2"></i>
                Editar perfil
              </button>
            </div>
          </div>
        </div>
        <div v-else class="flex flex-col gap-4 h-30 w-full md:w-auto">
          <div class="flex justify-center md:justify-end gap-2">
            <button 
              v-if="!isEditingBanner" 
              @click="addConnection" 
              class="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-md hover:text-gray-10 transition-all shadow-md"
            >
            <i class="fa fa-user-plus pr-2"></i>
            Seguir
            </button>
          </div>
          <!-- Agregar historia y Editar perfil (inferior derecha) -->
          <div class="flex justify-center md:justify-end mt-auto">
            <div class="flex flex-col gap-2 md:flex-row md:gap-4">
              <router-link 
                class="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-md hover:text-gray-10 transition-all shadow-md" 
                to="/chats"
                @click="sendMessage"
              >
              <i class="fa fa-message pr-2"></i>
              Enviar Mensaje
            </router-link>
            <button 
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-all shadow-md" 
            @click="setTabInformation"
            >
              <i class="fa fa-info pr-2"></i>
                Ver Información
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal para editar perfil -->
  <div v-if="showEditModal" class="fixed inset-0 bg-black/50 z-101 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
      <!-- Header del modal -->
      <div class="flex items-center justify-between p-4 border-b">
        <h2 class="text-lg font-semibold text-gray-800">Editar Perfil</h2>
        <button 
          @click="closeEditModal" 
          class="text-gray-500 hover:text-gray-700"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Formulario -->
       <ProfileForm :activeUser="activeUser" :closeEditModal="closeEditModal" :updateRefData="updateRefData" />
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue';
import { useStorage } from '../../composable/useStorage';
import ProfileForm from '../molecules/ProfileForm.vue';
import ProfileInfoCard from './ProfileInfoCard.vue';
import { usePrivateChatsStore } from '../../stores/privateChats';
import { usePrivateChats } from '../../composable/usePrivateChats';
import { useAuth } from '../../api/auth/useAuth';


// Props
const props = defineProps({
    activeUser: { type: Object, required: true },
    activeTab: { type: String, required: true },
    isOwnProfile : { type: Boolean, required: true },
    setTabConexiones : { type: Function, required: true },
    setTabInformation : { type: Function, required: true },
    connections : { type: Array, required: true },
    updateRefData : { type: Function, required: true },
});

// Instancias
const { uploadFile, getFileUrl } = useStorage();
const { user: authUser } = useAuth();
const { getChatIdByReference } = usePrivateChats();
const privateChatsStore = usePrivateChatsStore();

// Estados
const isEditingBanner = ref(false);
const showEditModal = ref(false);
const defaultAvatar = 'https://firebasestorage.googleapis.com/v0/b/parcialcwantonucci.appspot.com/o/profile%2Flucas.e.antonucci%40gmail.com.jpg?alt=media&token=a8d69477-990e-4e3d-bba3-8a19a83fccd4';
const bannerUrl = ref('https://scontent.faep7-1.fna.fbcdn.net/v/t39.30808-6/468006144_10235042225423750_1721754758729309234_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeHLiv8dN0LxWRWLAoantdebrW8BVSE3WC2tbwFVITdYLWPE5IcKzXsjstYJCRhTML4&_nc_ohc=h4dpp8obhPsQ7kNvgEFWjFO&_nc_oc=AdghQMM5J-uvHF2Rmsco8ZEkpWJW-fFeLzgudtB3nZO6NqLLr9A3i9BKaXhb9glG3PbjTLs2dtlcSMGnK5O0qEBw&_nc_zt=23&_nc_ht=scontent.faep7-1.fna&_nc_gid=AtJyPxfdbpgLXVow-4flfwi&oh=00_AYA6zA75nJh-mEs-Sbe2DAm0c8oq9FE4aYp8IINt2nvSpQ&oe=67C9CC8E');

// Computados
// const isOwnProfile = computed(() => props?.activeUser?.email === authUser.value?.email);

//Metodos
function toggleEditBanner() {
  isEditingBanner.value = !isEditingBanner.value;
}

function addConnection() {
  
}

async function updateBanner(file) {
  if (!props.isOwnProfile || !file) return;
  const filepath = `banners/${props.activeUser.email}.jpg`;
  try {
    await uploadFile(filepath, file);
    const url = await getFileUrl(filepath);
    props.activeUser.value.bannerUrlFile = url;
    isEditingBanner.value = false;
  } catch (err) {
    console.error('Error al actualizar banner:', err);
  }
}

function editProfile() {
  // Inicializar el formulario con los datos actuales del usuario
  console.log(props.activeUser)
  showEditModal.value = true;
}

function addStory() {
  console.log('Agregar historia');
}


function closeEditModal() {
  showEditModal.value = false;
}

async function sendMessage() {
  const chatId = await getChatIdByReference(authUser.value.email, props.activeUser.email)
  privateChatsStore.setSelectedChatId(chatId);
}
</script>