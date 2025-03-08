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
        <div class="flex flex-col md:flex-row items-center md:items-start gap-4">
          <img :src="activeUser?.photoURLFile || defaultAvatar" alt="Avatar" class="w-20 h-20 md:w-32 md:h-32 rounded-full border-4 border-white object-cover shadow-lg" />
          <div class="text-center md:text-left text-gray-800 md:text-white">
            <h1 class="text-xl md:text-2xl font-bold">{{ activeUser?.displayName || 'Usuario' }}</h1>
            <p class="text-sm">{{ connections?.length || 0 }} conexiones</p>
            <div class="mt-2 flex -space-x-2 items-center">
              <img 
                v-for="connection in connections?.slice(0, 5)" 
                :key="connection.idDoc"
                :src="connection.photoURLFile"
                alt=""
                class="inline-block h-8 w-8 rounded-full ring-2 ring-white"
              />
              <button 
                v-if="connections?.length > 5" 
                @click="setTabConexiones" 
                class="relative inline-block h-8 w-8 rounded-full ring-2 ring-white hover:ring-primary transition"
              >
                <img 
                  :src="connections[5]?.photoURLFile" 
                  class="h-8 w-8 rounded-full object-cover"
                  alt="Más conexiones"
                />
                <div class="absolute inset-0 bg-gray-800/70 rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="white">
                    <circle cx="4" cy="12" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="20" cy="12" r="2" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
        <!-- Botones de acción -->
        <div v-if="isOwnProfile" class="flex flex-col gap-4 h-30 w-full md:w-auto">
          <!-- Editar portada (superior derecha) -->
          <div class="hidden md:flex justify-center md:justify-end gap-2">
            <button 
              v-if="!isEditingBanner" 
              @click="toggleEditBanner" 
              class="px-4 py-2 bg-white/80 text-gray-700 rounded-full hover:bg-white transition-all shadow-md"
            >
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
                Agregar historia
              </button>
              <button 
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-all shadow-md" 
                @click="editProfile"
              >
                Editar perfil
              </button>
            </div>
          </div>
        </div>
        <div v-else class="flex flex-col gap-4 h-30 w-full md:w-auto">
          <!-- Agregar historia y Editar perfil (inferior derecha) -->
          <div class="flex justify-center md:justify-end mt-auto">
            <div class="flex flex-col gap-2 md:flex-row md:gap-4">
              <router-link 
                class="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-md transition-all shadow-md" 
                :to="activeUser ? `/chat/${activeUser?.email}` : '/chat'"
              >
                Enviar Mensaje
              </router-link>
              <button 
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-all shadow-md" 
                @click="setTabInformation"
              >
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
      <form @submit.prevent="saveProfile" class="p-4 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Nombre de usuario</label>
          <input
            v-model="editForm.displayName"
            type="text"
            class="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Nombre de usuario"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            v-model="editForm.firstName"
            type="text"
            class="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Nombre"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Apellido</label>
          <input
            v-model="editForm.lastName"
            type="text"
            class="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Apellido"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="editForm.email"
            type="email"
            class="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Correo electrónico"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Teléfono</label>
          <input
            v-model="editForm.phoneNumber"
            type="tel"
            class="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Número de teléfono"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Fecha de nacimiento</label>
          <input
            v-model="editForm.birthday"
            type="date"
            class="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Género</label>
          <select
            v-model="editForm.gender"
            class="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="No ha definido un género">Seleccionar</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">País</label>
          <input
            v-model="editForm.country"
            type="text"
            class="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="País"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Foto de perfil</label>
          <input
            type="file"
            @change="handlePhotoUpload"
            class="mt-1 w-full px-3 py-2 border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary file:text-white hover:file:bg-primary-md"
          />
          <img 
            v-if="editForm.photoURL" 
            :src="editForm.photoURL" 
            alt="Vista previa" 
            class="mt-2 w-20 h-20 rounded-full object-cover"
          />
        </div>

        <!-- Botones del formulario -->
        <div class="flex justify-end gap-2 pt-4 border-t">
          <button
            type="button"
            @click="closeEditModal"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-md"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps,computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '../../api/auth/useAuth';
import { useStorage } from '../../composable/useStorage';
import { usePostsStore } from '../../stores/posts';
import { useUsers } from '../../composable/useUsers';

// Props
const props = defineProps({
    activeUser: { type: Object, required: true },
    activeTab: { type: String, required: true },
    isOwnProfile : { type: Boolean, required: true },
    setTabConexiones : { type: Function, required: true },
    setTabInformation : { type: Function, required: true },
    connections : { type: Array, required: true },
    updateDataFromChild : { type: Function, required: true },
});

// Instancias
const route = useRoute();
const { user: authUser } = useAuth();
const { uploadFile, getFileUrl } = useStorage();
const {  updateUser } = useUsers();

// Estados
const isEditingBanner = ref(false);
const showEditModal = ref(false);
const defaultAvatar = 'https://firebasestorage.googleapis.com/v0/b/parcialcwantonucci.appspot.com/o/profile%2Flucas.e.antonucci%40gmail.com.jpg?alt=media&token=a8d69477-990e-4e3d-bba3-8a19a83fccd4';
const editForm = ref({});
const bannerUrl = ref('https://scontent.faep7-1.fna.fbcdn.net/v/t39.30808-6/468006144_10235042225423750_1721754758729309234_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeHLiv8dN0LxWRWLAoantdebrW8BVSE3WC2tbwFVITdYLWPE5IcKzXsjstYJCRhTML4&_nc_ohc=h4dpp8obhPsQ7kNvgEFWjFO&_nc_oc=AdghQMM5J-uvHF2Rmsco8ZEkpWJW-fFeLzgudtB3nZO6NqLLr9A3i9BKaXhb9glG3PbjTLs2dtlcSMGnK5O0qEBw&_nc_zt=23&_nc_ht=scontent.faep7-1.fna&_nc_gid=AtJyPxfdbpgLXVow-4flfwi&oh=00_AYA6zA75nJh-mEs-Sbe2DAm0c8oq9FE4aYp8IINt2nvSpQ&oe=67C9CC8E');

// Computados
// const isOwnProfile = computed(() => props?.activeUser?.email === authUser.value?.email);

//Metodos
function toggleEditBanner() {
  isEditingBanner.value = !isEditingBanner.value;
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

function addStory() {
  console.log('Agregar historia');
}

function editProfile() {
  // Inicializar el formulario con los datos actuales del usuario
  console.log(props.activeUser)
  editForm.value = {
    id: props.activeUser?.uid || props.activeUser?.id,
    displayName: props.activeUser?.displayName || 'No ha definido un displayName',
    firstName: props.activeUser?.firstName || 'No ha definido un nombre',
    lastName: props.activeUser?.lastName || 'No ha definido un apellido',
    email: props.activeUser?.email || 'No ha definido un correo',
    phoneNumber: props.activeUser?.phoneNumber || 'No ha definido un número de teléfono',
    birthday: props.activeUser?.birthday || 'No ha definido una fecha de nacimiento',
    gender: props.activeUser?.gender || 'No ha definido un género',
    country: props.activeUser?.country || 'No ha definido un país',
    photoURL: props.activeUser?.photoURL || null,
    photoURLFile: props.activeUser?.photoURLFile || null,
  };
  showEditModal.value = true;
}

function closeEditModal() {
  showEditModal.value = false;
}

// funciones de carga de imagen
const handlePhotoUpload = (ev) => {
  const reader = new FileReader();
  const file = ev.target.files[0];
  reader.addEventListener("load", function () {
    editForm.value.photoURLFile = reader.result;
  });
  editForm.value.photoURL = URL.createObjectURL(file); // Vista previa
  reader.readAsDataURL(file);
};

async function saveProfile() {
  try {
    // Si hay una nueva foto, subirla primero
    if (editForm.value.photoURLFile != null && editForm.value.photoURLFile !== props.activeUser.photoURLFile) {
      const filepath = `profile/${props.activeUserEmail}.jpg`;
      await uploadFile(filepath, editForm.value.photoURLFile);
      editForm.value.photoURL = await getFileUrl(filepath);
    }
    // Actualizar activeUser con los nuevos datos
    const profiletoUpdate = {
      ...props.activeUser,
      ...editForm.value,
      photoURLFile: editForm.value.photoURL, // Actualizar la URL de la foto
    };

    await updateUser(profiletoUpdate.uid, profiletoUpdate);
    props.updateDataFromChild(profiletoUpdate);
    // Aquí iría la lógica para guardar en tu backend o base de datos
    console.log('Perfil actualizado:', profiletoUpdate);
    closeEditModal();
  } catch (err) {
    console.error('Error al guardar el perfil:', err);
  }
}

function sendMessage() {
  console.log('Enviar Mensaje');
}
</script>