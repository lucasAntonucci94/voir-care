<template>
  <form @submit.prevent="saveProfile" class="p-4 space-y-6 max-w-md mx-auto">
    <!-- Nombre de usuario -->
    <div>
      <label class="block text-sm font-medium text-[#2c3e50]">Nombre de usuario</label>
      <input
        v-model="editForm.displayName"
        type="text"
        class="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-full text-[#2c3e50] focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent placeholder-gray-400 disabled:opacity-50"
        placeholder="Nombre de usuario"
        :disabled="isLoading"
      />
    </div>

    <!-- Nombre -->
    <div>
      <label class="block text-sm font-medium text-[#2c3e50]">Nombre</label>
      <input
        v-model="editForm.firstName"
        type="text"
        class="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-full text-[#2c3e50] focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent placeholder-gray-400 disabled:opacity-50"
        placeholder="Nombre"
        :disabled="isLoading"
      />
    </div>

    <!-- Apellido -->
    <div>
      <label class="block text-sm font-medium text-[#2c3e50]">Apellido</label>
      <input
        v-model="editForm.lastName"
        type="text"
        class="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-full text-[#2c3e50] focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent placeholder-gray-400 disabled:opacity-50"
        placeholder="Apellido"
        :disabled="isLoading"
      />
    </div>

    <!-- Email -->
    <div>
      <label class="block text-sm font-medium text-[#2c3e50]">Email</label>
      <input
        v-model="editForm.email"
        type="email"
        class="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-full text-[#2c3e50] focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent placeholder-gray-400 disabled:opacity-50"
        placeholder="Correo electrónico"
        :disabled="isLoading"
      />
    </div>

    <!-- Teléfono -->
    <div>
      <label class="block text-sm font-medium text-[#2c3e50]">Teléfono</label>
      <input
        v-model="editForm.phoneNumber"
        type="tel"
        class="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-full text-[#2c3e50] focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent placeholder-gray-400 disabled:opacity-50"
        placeholder="Número de teléfono"
        :disabled="isLoading"
      />
    </div>

    <!-- Fecha de nacimiento -->
    <div>
      <label class="block text-sm font-medium text-[#2c3e50]">Fecha de nacimiento</label>
      <input
        v-model="editForm.birthday"
        type="date"
        class="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-full text-[#2c3e50] focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent disabled:opacity-50"
        :disabled="isLoading"
      />
    </div>

    <!-- Género -->
    <div>
      <label class="block text-sm font-medium text-[#2c3e50]">Género</label>
      <select
        v-model="editForm.genre"
        class="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-full text-[#2c3e50] focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent disabled:opacity-50"
        :disabled="isLoading"
      >
        <option :value="null">Seleccionar</option>
        <option value="Masculino">Masculino</option>
        <option value="Femenino">Femenino</option>
        <option value="Otro">Otro</option>
      </select>
    </div>

    <!-- País -->
    <div>
      <label class="block text-sm font-medium text-[#2c3e50]">País</label>
      <input
        v-model="editForm.country"
        type="text"
        class="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-full text-[#2c3e50] focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent placeholder-gray-400 disabled:opacity-50"
        placeholder="País"
        :disabled="isLoading"
      />
    </div>

    <!-- Foto de perfil -->
    <div>
      <label class="block text-sm font-medium text-[#2c3e50]">Foto de perfil</label>
      <input
        type="file"
        accept="image/*"
        @change="handlePhotoUpload"
        class="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-full text-[#2c3e50] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary file:text-white hover:file:bg-primary-md disabled:opacity-50"
        :disabled="isLoading"
      />
      <img
        v-if="editForm.photoURL"
        :src="editForm.photoURL"
        alt="Vista previa"
        class="mt-2 w-20 h-20 rounded-full object-cover border-2 border-gray-200"
      />
    </div>

    <!-- Botones del formulario -->
    <div class="flex justify-end gap-2 pt-4 border-t border-gray-200">
      <button
        type="button"
        @click="closeEditModal"
        :disabled="isLoading"
        class="px-4 py-2 bg-gray-200 text-[#2c3e50] rounded-full hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cancelar
      </button>
      <button
        type="submit"
        :disabled="isLoading"
        class="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <span v-if="isLoading">
          <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
        {{ isLoading ? 'Guardando...' : 'Guardar' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUsers } from '../../composable/useUsers';
import { useMediaUpload } from '../../composable/useMediaUpload'; // Nueva importación

// Props
const props = defineProps({
  activeUser: { type: Object, required: true },
  closeEditModal: { type: Function, required: true },
  updateRefData: { type: Function, required: true },
});

// Instancias
const { updateUser } = useUsers();
const { uploadMedia, isUploading } = useMediaUpload();

// Estados
const editForm = ref({});
const isLoading = ref(false);

onMounted(() => {
  editProfile();
});

function editProfile() {
  editForm.value = {
    id: props.activeUser?.uid || props.activeUser?.id || null,
    displayName: props.activeUser?.displayName || '',
    firstName: props.activeUser?.firstName || '',
    lastName: props.activeUser?.lastName || '',
    email: props.activeUser?.email || '',
    phoneNumber: props.activeUser?.phoneNumber || '',
    birthday: props.activeUser?.birthday ? new Date(props.activeUser?.birthday).toISOString().split('T')[0] : '',
    genre: props.activeUser?.genre || null,
    country: props.activeUser?.country || '',
    photoURL: props.activeUser?.photoURL || '', // URL para previsualización
    photoURLFile: props.activeUser?.photoURLFile || null, // Path o archivo existente
    newMediaBase64: null,
    mediaType: props.activeUser?.mediaType || '',
  };
}

function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      editForm.value.newMediaBase64 = reader.result; // Guardar el base64
      editForm.value.photoURL = URL.createObjectURL(file); // Previsualización local
      editForm.value.mediaType = file.type.startsWith('image') ? 'image' : 'video';
    };
    reader.onerror = (error) => {
      console.error('Error al leer el archivo:', error);
    };
    reader.readAsDataURL(file);
  }
}

async function saveProfile() {
  isLoading.value = true;

  try {
    let updatedPhotoUrl = props.activeUser?.photoURLFile;
    let updatedPhotoPath = props.activeUser?.photoPathFile;

    if (editForm.value.newMediaBase64) {
      const dynamicPath = `profile/${props.activeUser?.email}`;
      const { url, path } = await uploadMedia({
        currentUrl: props.activeUser?.photoURLFile,
        currentPath: props.activeUser?.photoPathFile,
        newMediaBase64: editForm.value.newMediaBase64,
        mediaType: editForm.value.mediaType,
        dynamicPath,
      });
      updatedPhotoUrl = url;
      updatedPhotoPath = path;
    }

    const profileToUpdate = {
      ...props.activeUser,
      ...editForm.value,
      photoURL: updatedPhotoUrl,
      photoURLFile: updatedPhotoUrl,
      photoPathFile: updatedPhotoPath,
    };

    await updateUser(profileToUpdate.uid, profileToUpdate);
    props.updateRefData(profileToUpdate);
    console.log('Perfil actualizado:', profileToUpdate);
    props.closeEditModal();
  } catch (err) {
    console.error('Error al guardar el perfil:', err);
  } finally {
    isLoading.value = false;
  }
}
</script>