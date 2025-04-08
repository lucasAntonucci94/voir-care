<!-- ProfileForm.vue -->
<template>
  <form @submit.prevent="saveProfile" class="p-4 space-y-6 max-w-md mx-auto">
    <!-- Email -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
      <input
        v-model="editForm.email"
        type="email"
        class="mt-1 w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:bg-gray-600 border border-gray-300 dark:border-gray-800 rounded-full text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent placeholder-gray-400 dark:placeholder-gray-100 disabled:opacity-50"
        placeholder="Correo electrónico"
        disabled
      />
    </div>
    
    <!-- Nombre de usuario -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de usuario</label>
      <input
        v-model="editForm.displayName"
        type="text"
        class="mt-1 w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:bg-gray-600 border border-gray-300 dark:border-gray-800 rounded-full text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent placeholder-gray-400 dark:placeholder-gray-100 disabled:opacity-50"
        placeholder="Nombre de usuario"
        :disabled="isLoading"
      />
    </div>

    <!-- Nombre -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
      <input
        v-model="editForm.firstName"
        type="text"
        class="mt-1 w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:bg-gray-600 border border-gray-300 dark:border-gray-800 rounded-full text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent placeholder-gray-400 dark:placeholder-gray-100 disabled:opacity-50"
        placeholder="Nombre"
        :disabled="isLoading"
      />
    </div>

    <!-- Apellido -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Apellido</label>
      <input
        v-model="editForm.lastName"
        type="text"
        class="mt-1 w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:bg-gray-600 border border-gray-300 dark:border-gray-800 rounded-full text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent placeholder-gray-400 dark:placeholder-gray-100 disabled:opacity-50"
        placeholder="Apellido"
        :disabled="isLoading"
      />
    </div>

    <!-- Teléfono -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
      <input
        v-model="editForm.phoneNumber"
        type="tel"
        class="mt-1 w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:bg-gray-600 border border-gray-300 dark:border-gray-800 rounded-full text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent disabled:opacity-50"
        placeholder="Número de teléfono"
        :disabled="isLoading"
      />
    </div>

    <!-- Fecha de nacimiento -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de nacimiento</label>
      <input
        v-model="editForm.birthday"
        type="date"
        class="mt-1 w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:bg-gray-600 border border-gray-300 dark:border-gray-800 rounded-full text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent disabled:opacity-50"
        :disabled="isLoading"
      />
    </div>

    <!-- Género (usando SelectGenre) -->
    <div>
      <SelectGenre
        v-model="editForm.genre"
        label="Género"
        id="genre"
        :disabled="isLoading"
        class="mt-1 w-full"
      />
    </div>

    <!-- País -->
    <div>
      <SelectCountry
        v-model="editForm.country"
        label="País"
        id="country"
        :disabled="isLoading"
        class="mt-1 w-full"
      />
    </div>

    <!-- Foto de perfil -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Foto de perfil</label>
      <input
        type="file"
        accept="image/*"
        @change="handlePhotoUpload"
        :class="[
          'w-full p-2 border dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary dark:file:bg-secondary file:text-white hover:file:bg-opacity-90 transition-colors duration-200',
          errorBannerFileMessage ? 'border-red-500' : 'border-gray-300  dark:border-gray-800'
        ]"
        :disabled="isLoading"
        required
      />
      <p v-if="errorFileMessage" class="text-red-500 text-sm mt-1">{{ errorFileMessage }}</p>
      <img
        v-if="editForm.photoURL"
        :src="editForm.photoURL"
        alt="Vista previa"
        class="mt-2 w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-800"
      />
    </div>

    <!-- Botones del formulario -->
    <div class="flex justify-end gap-2 pt-4 border-t border-gray-200">
      <button
        type="button"
        @click="closeEditModal"
        :disabled="isLoading"
        class="px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cancelar
      </button>
      <button
        type="submit"
        :disabled="isLoading"
        class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-full hover:bg-primary-md dark:hover:bg-secondary-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <span v-if="isLoading">
          <i class="fa-solid fa-spinner animate-spin h-5 w-5"></i>
        </span>
        {{ isLoading ? 'Guardando...' : 'Guardar' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUsers } from '../../composable/useUsers';
import { useMediaUpload } from '../../composable/useMediaUpload';
import SelectCountry from '../atoms/SelectCountry.vue';
import SelectGenre from '../atoms/SelectGenre.vue'; // Nueva importación

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
const errorFileMessage = ref('');

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
    genre: props.activeUser?.genre || '',
    country: props.activeUser?.country || '',
    photoURL: props.activeUser?.photoURL || '',
    photoURLFile: props.activeUser?.photoURLFile || null,
    newMediaBase64: null,
    mediaType: props.activeUser?.mediaType || '',
  };
}

function handlePhotoUpload(event) {
  errorFileMessage.value = ''; // Reiniciar mensaje de error
  const file = event.target.files[0];

  if (!file) return
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    errorFileMessage.value = "El tipo de archivo no es permitido. Selecciona una imagen o video.";
    event.target.value = ''; // Limpiar el input
    return;
  }

  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      editForm.value.newMediaBase64 = reader.result;
      editForm.value.photoURL = URL.createObjectURL(file);
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