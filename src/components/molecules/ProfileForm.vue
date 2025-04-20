<!-- ProfileForm.vue -->
<template>
  <form @submit.prevent="saveProfile" class="p-4 space-y-6 max-w-md mx-auto">
    <!-- Email -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
      <input
        v-model="editForm.email"
        type="email"
        class="mt-1 w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:bg-gray-600 border border-gray-300 dark:border-gray-800 rounded-full text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent placeholder-gray-400 dark:placeholder-gray-400 disabled:opacity-50"
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
        :class="[
          'mt-1 w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:bg-gray-600 border rounded-full text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent placeholder-gray-400 dark:placeholder-gray-400 disabled:opacity-50',
          errors.displayName ? 'border-red-500' : 'border-gray-300 dark:border-gray-800'
        ]"
        placeholder="Nombre de usuario"
        :disabled="isLoading"
      />
      <p v-if="errors.displayName" class="text-red-500 text-sm mt-1">{{ errors.displayName }}</p>
    </div>

    <!-- Nombre -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
      <input
        v-model="editForm.firstName"
        type="text"
        :class="[
          'mt-1 w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:bg-gray-600 border rounded-full text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent placeholder-gray-400 dark:placeholder-gray-400 disabled:opacity-50',
          errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-800'
        ]"
        placeholder="Nombre"
        :disabled="isLoading"
      />
      <p v-if="errors.firstName" class="text-red-500 text-sm mt-1">{{ errors.firstName }}</p>
    </div>

    <!-- Apellido -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Apellido</label>
      <input
        v-model="editForm.lastName"
        type="text"
        :class="[
          'mt-1 w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:bg-gray-600 border rounded-full text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent placeholder-gray-400 dark:placeholder-gray-400 disabled:opacity-50',
          errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-800'
        ]"
        placeholder="Apellido"
        :disabled="isLoading"
      />
      <p v-if="errors.lastName" class="text-red-500 text-sm mt-1">{{ errors.lastName }}</p>
    </div>

    <!-- Teléfono -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
      <input
        v-model="editForm.phoneNumber"
        v-mask="'+54 9 ## ####-####'"
        type="tel"
        :class="[
          'mt-1 w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:bg-gray-600 border rounded-full text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent disabled:opacity-50',
          errors.phoneNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-800'
        ]"
        placeholder="+54 9 11 1234-5678"
        :disabled="isLoading"
      />
      <p v-if="errors.phoneNumber" class="text-red-500 text-sm mt-1">{{ errors.phoneNumber }}</p>
    </div>

    <!-- Fecha de nacimiento -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de nacimiento</label>
      <input
        v-model="editForm.birthday"
        type="date"
        :class="[
          'mt-1 w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:bg-gray-600 border rounded-full text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent disabled:opacity-50',
          errors.birthday ? 'border-red-500' : 'border-gray-300 dark:border-gray-800'
        ]"
        :disabled="isLoading"
      />
      <p v-if="errors.birthday" class="text-red-500 text-sm mt-1">{{ errors.birthday }}</p>
    </div>

    <!-- Género -->
    <div>
      <SelectGenre
        v-model="editForm.genre"
        label="Género"
        id="genre"
        :disabled="isLoading"
        :class="{ 'border-red-500': errors.genre }"
        class="mt-1 w-full"
      />
      <p v-if="errors.genre" class="text-red-500 text-sm mt-1">{{ errors.genre }}</p>
    </div>

    <!-- País -->
    <div>
      <SelectCountry
        v-model="editForm.country"
        label="País"
        id="country"
        :disabled="isLoading"
        :class="{ 'border-red-500': errors.country }"
        class="mt-1 w-full"
      />
      <p v-if="errors.country" class="text-red-500 text-sm mt-1">{{ errors.country }}</p>
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
          errorFileMessage ? 'border-red-500' : 'border-gray-300 dark:border-gray-800'
        ]"
        :disabled="isLoading"
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
        :disabled="isLoading || Object.keys(errors)?.length > 0"
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
import SelectGenre from '../atoms/SelectGenre.vue';

// Props
const props = defineProps({
  activeUser: { type: Object, required: true },
  closeEditModal: { type: Function, required: true },
  updateRefData: { type: Function, required: true },
});

// Instancias
const { updateUser } = useUsers();
const { uploadMedia } = useMediaUpload();

// Estados
const editForm = ref({});
const isLoading = ref(false);
const errorFileMessage = ref('');
const errors = ref({});

onMounted(() => {
  editProfile();
});

function editProfile() {
  let phone = props.activeUser?.phoneNumber || '';
  if (phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('549') && digits.length === 13) {
      // Formato móvil: +54 9 ## ####-####
      phone = `+54 9 ${digits.slice(3, 5)} ${digits.slice(5, 9)}-${digits.slice(9)}`;
    } else if (digits.startsWith('54') && digits.length === 12) {
      // Formato fijo: +54 ## ####-####
      phone = `+54 ${digits.slice(2, 4)} ${digits.slice(4, 8)}-${digits.slice(8)}`;
    } else {
      phone = ''; // Si no coincide con ningún formato, lo dejamos vacío
    }
  }

  editForm.value = {
    id: props.activeUser?.uid || props.activeUser?.id || null,
    displayName: props.activeUser?.displayName || '',
    firstName: props.activeUser?.firstName || '',
    lastName: props.activeUser?.lastName || '',
    email: props.activeUser?.email || '',
    phoneNumber: phone,
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
  errorFileMessage.value = '';
  const file = event.target.files[0];

  if (!file) return;
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    errorFileMessage.value = "El tipo de archivo no es permitido. Selecciona una imagen o video.";
    event.target.value = '';
    return;
  }

  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      editForm.value.newMediaBase64 = reader.result;
      editForm.value.photoURL = URL.createObjectURL(file);
      editForm.value.mediaType = file.type.startsWith('image') ? 'image' : 'video';
    };
    reader.readAsDataURL(file);
  }
}

async function saveProfile() {
  isLoading.value = true;
  errors.value = {};

  const validationErrors = validateForm();
  if (Object.keys(validationErrors).length > 0) {
    errors.value = validationErrors;
    isLoading.value = false;
    return;
  }

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

function validateForm() {
  const validationErrors = {};

  // Check displayName (required)
  if (!editForm.value.displayName || editForm.value.displayName.trim() === '') {
    validationErrors.displayName = 'El nombre de usuario no puede estar vacío';
  }

  // Check firstName (optional, but if provided, must not be empty)
  if (editForm.value.firstName && editForm.value.firstName.trim() === '') {
    validationErrors.firstName = 'El nombre no puede estar vacío';
  }

  // Check lastName (optional, but if provided, must not be empty)
  if (editForm.value.lastName && editForm.value.lastName.trim() === '') {
    validationErrors.lastName = 'El apellido no puede estar vacío';
  }

  // Check phoneNumber (required, with Argentine format validation)
  if (!editForm.value.phoneNumber || editForm.value.phoneNumber.trim() === '') {
    validationErrors.phoneNumber = 'El número de teléfono es obligatorio';
  } else {
    const cleanedPhone = editForm.value.phoneNumber.replace(/\D/g, '');
    if (cleanedPhone.startsWith('549') && cleanedPhone.length === 13) {
      // Formato móvil: +54 9 ## ####-####
      // Válido, no hacemos nada
    } else if (cleanedPhone.startsWith('54') && cleanedPhone.length === 12) {
      // Formato fijo: +54 ## ####-####
      // Válido, no hacemos nada
    } else {
      validationErrors.phoneNumber = 'El número debe seguir el formato +54 9 XX XXXX-XXXX (móvil, 13 dígitos) o +54 XX XXXX-XXXX (fijo, 12 dígitos)';
    }
  }

  // Check birthday (required)
  if (!editForm.value.birthday) {
    validationErrors.birthday = 'La fecha de nacimiento es obligatoria';
  } else if (new Date(editForm.value.birthday) > new Date()) {
    validationErrors.birthday = 'La fecha de nacimiento no puede ser futura';
  }

  // Check genre (required)
  if (!editForm.value.genre || editForm.value.genre.trim() === '') {
    validationErrors.genre = 'El género es obligatorio';
  }

  // Check country (required)
  if (!editForm.value.country || editForm.value.country.trim() === '') {
    validationErrors.country = 'El país es obligatorio';
  }

  return validationErrors;
}
</script>