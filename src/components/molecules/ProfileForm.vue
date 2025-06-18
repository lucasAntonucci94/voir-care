<template>
  <form @submit.prevent="saveProfile" class="flex flex-col min-h-full p-4">
    <!-- Stepper -->
    <div class="flex justify-center mb-4">
      <div class="flex items-center space-x-2">
        <div v-for="(step, index) in steps" :key="index" class="relative flex items-center">
          <div
            class="flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all duration-300"
            :class="{
              'bg-primary dark:bg-secondary text-white animate-pulse-step': currentStep === index,
              'bg-green-500 text-white': currentStep > index,
              'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300': currentStep < index,
            }"
            :aria-current="currentStep === index ? 'step' : undefined"
            :aria-label="`Paso ${index + 1}`"
          >
            <span v-if="currentStep <= index">{{ index + 1 }}</span>
            <i v-else class="fa-solid fa-check"></i>
          </div>
          <div
            v-if="index < steps.length - 1"
            class="w-6 h-1 bg-gray-200 dark:bg-gray-600"
          >
            <div
              class="h-full transition-all duration-300"
              :class="currentStep > index ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido de los pasos -->
    <div class="flex-1 flex flex-col justify-center space-y-4 min-h-[200px]">
      <!-- Paso 1: Información personal -->
      <div v-if="currentStep === 0" class="space-y-4 animate-fade-in">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
          <input
            v-model="editForm.email"
            type="email"
            class="mt-1 w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent placeholder-gray-400 dark:placeholder-gray-400 disabled:opacity-50 shadow-sm"
            placeholder="Correo electrónico"
            disabled
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de usuario</label>
          <input
            v-model="editForm.displayName"
            type="text"
            :class="[
              'mt-1 w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent placeholder-gray-400 dark:placeholder-gray-400 disabled:opacity-50 shadow-sm',
              stepErrors.displayName ? 'border-red-500' : 'border-gray-300 dark:border-gray-800'
            ]"
            placeholder="Nombre de usuario"
            :disabled="isLoading"
          />
          <p v-if="stepErrors.displayName" class="text-red-500 text-sm mt-1">{{ stepErrors.displayName }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
          <input
            v-model="editForm.firstName"
            type="text"
            :class="[
              'mt-1 w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent placeholder-gray-400 dark:placeholder-gray-400 disabled:opacity-50 shadow-sm',
              stepErrors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-800'
            ]"
            placeholder="Nombre"
            :disabled="isLoading"
          />
          <p v-if="stepErrors.firstName" class="text-red-500 text-sm mt-1">{{ stepErrors.firstName }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Apellido</label>
          <input
            v-model="editForm.lastName"
            type="text"
            :class="[
              'mt-1 w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent placeholder-gray-400 dark:placeholder-gray-400 disabled:opacity-50 shadow-sm',
              stepErrors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-800'
            ]"
            placeholder="Apellido"
            :disabled="isLoading"
          />
          <p v-if="stepErrors.lastName" class="text-red-500 text-sm mt-1">{{ stepErrors.lastName }}</p>
        </div>
      </div>

      <!-- Paso 2: Contacto -->
      <div v-if="currentStep === 1" class="space-y-4 animate-fade-in">
        <PhoneInput
          v-model="editForm.phoneNumber"
          label="Teléfono"
          id="phone"
          :error="stepErrors.phoneNumber"
          :disabled="isLoading"
        />
      </div>

      <!-- Paso 3: Detalles personales -->
      <div v-if="currentStep === 2" class="space-y-4 animate-fade-in">
        <div>
          <SelectDate
            v-model="editForm.birthday"
            label="Fecha de nacimiento"
            :disabled="isLoading"
            :timeEnabled="false"
            />
            <!-- :error="stepErrors.birthday" -->
          <p v-if="stepErrors.birthday" class="text-red-500 text-sm mt-1">{{ stepErrors.birthday }}</p> 
        </div>
        <div>
          <SelectGenre
            v-model="editForm.genre"
            label="Género"
            id="genre"
            :disabled="isLoading"
            :class="[
              'mt-1 w-full hover:bg-transparent dark:hover:bg-transparent',
              stepErrors.genre ? 'border-red-500' : ''
            ]"
          />
          <p v-if="stepErrors.genre" class="text-red-500 text-sm mt-1">{{ stepErrors.genre }}</p>
        </div>
        <div>
          <SelectCountry
            v-model="editForm.country"
            label="País"
            id="country"
            :disabled="isLoading"
            :class="[
              'mt-1 w-full hover:bg-transparent dark:hover:bg-transparent',
              stepErrors.country ? 'border-red-500' : ''
            ]"
          />
          <p v-if="stepErrors.country" class="text-red-500 text-sm mt-1">{{ stepErrors.country }}</p>
        </div>
      </div>

      <!-- Paso 4: Foto de perfil -->
      <div v-if="currentStep === 3" class="space-y-4 animate-fade-in">
        <div>
          <input
            type="file"
            accept="image/*"
            @change="handlePhotoUpload"
            :class="[
              'w-full mt-2 md:mt-4 mb-2 md:mb-4 p-2 border dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary dark:file:bg-secondary file:text-white hover:file:bg-primary/90 dark:hover:file:bg-secondary/90 transition-colors duration-200 shadow-sm',
              errorFileMessage ? 'border-red-500' : 'border-gray-300 dark:border-gray-800'
            ]"
            :disabled="isLoading"
          />
          <p v-if="errorFileMessage" class="text-red-500 text-sm mt-1">{{ errorFileMessage }}</p>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Vista previa del perfil</label>
          <div class="mt-2 flex flex-col md:flex-row items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
            <div class="relative">
              <img
                v-if="editForm.newMediaBase64 || editForm.photoURLFile"
                :src="editForm.newMediaBase64 || editForm.photoURLFile"
                alt="Vista previa del perfil"
                class="w-15 h-15 md:w-25 md:h-25 rounded-full border-4 border-white object-cover shadow-lg cursor-pointer"
              />
              <div
                v-else
                class="w-20 h-20 md:w-32 md:h-32 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-300 border-4 border-white shadow-lg"
              >
                <i class="fa-solid fa-user text-2xl md:text-4xl"></i>
              </div>
            </div>
            <div class="text-center md:text-left">
              <h1 class="text-gray-700 dark:text-gray-300 text-xl md:text-2xl font-bold">
                {{ editForm.displayName || editForm.email || 'Usuario' }}
              </h1>
              <p class="text-gray-700 dark:text-gray-300 text-sm">
                0 conexiones
              </p>
            </div>
          </div>
        </div>
      </div>
      <!-- Paso 5: Redes sociales -->
      <div v-if="currentStep === 4" class="space-y-4 animate-fade-in">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Redes sociales</label>
          <div class="space-y-2">
            <div v-for="(network, index) in editForm.socialNetwork" :key="index" class="flex items-center gap-2">
              <select
                v-model="network.name"
                :class="[
                  'w-1/4 px-4 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent',
                  stepErrors[`socialNetwork[${index}].name`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-800'
                ]"
                :disabled="isLoading"
              >
                <option value="LinkedIn">LinkedIn</option>
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="X">X</option>
                <option value="TikTok">TikTok</option>
                <option value="Website">Website</option>
              </select>
              <input
                v-model="network.value"
                type="text"
                placeholder="URL"
                :class="[
                  'flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent',
                  stepErrors[`socialNetwork[${index}].value`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-800'
                ]"
                :disabled="isLoading"
              />
              <button
                type="button"
                @click="removeNetwork(index)"
                :disabled="isLoading || editForm.socialNetwork.length <= 1"
                class="px-2 py-1 text-red-500 hover:text-red-700"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
            <button
              type="button"
              @click="addNetwork"
              :disabled="isLoading"
              class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-lg hover:bg-primary/90 dark:hover:bg-secondary/90 transition-colors disabled:opacity-50"
            >
              Agregar más
            </button>
          </div>
          <p v-if="stepErrors.socialNetwork" class="text-red-500 text-sm mt-1">{{ stepErrors.socialNetwork }}</p>
        </div>
      </div>
    </div>

    <!-- Botones de navegación -->
    <div class="flex justify-between gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
      <button
        v-if="currentStep === 0"
        type="button"
        @click="props.closeEditModal"
        :disabled="isLoading"
        class="px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        aria-label="Cancelar edición del perfil"
      >
        <i class="fa-solid fa-times"></i>
        <p class="hidden md:block">Cancelar</p>
      </button>
      <button
        v-if="currentStep > 0"
        type="button"
        @click="prevStep"
        :disabled="isLoading"
        class="px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        aria-label="Volver al paso anterior"
      >
        <i class="fa-solid fa-arrow-left"></i>
        <p class="hidden md:block">Atrás</p>
      </button>
      <div class="flex items-center gap-2">
        <button
          v-if="currentStep < steps.length - 1"
          type="button"
          @click="nextStep"
          :disabled="isLoading || hasStepErrors"
          class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-lg hover:bg-primary/90 dark:hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          aria-label="Avanzar al siguiente paso"
        >
          <p class="hidden md:block">Siguiente</p>
          <i class="fa-solid fa-arrow-right"></i>
        </button>
        <button
          v-if="currentStep === steps.length - 1"
          type="submit"
          :disabled="isLoading || hasGlobalErrors"
          class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-lg hover:bg-primary/90 dark:hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          aria-label="Guardar perfil"
        >
          <span v-if="isLoading">
            <i class="fa-solid fa-spinner animate-spin"></i>
          </span>
          <p class="hidden md:block">
            {{ isLoading ? 'Guardando...' : 'Guardar' }}
          </p>
          <i v-if="!isLoading" class="fa-solid fa-save"></i>
        </button>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useUsers } from '../../composable/useUsers';
import { useMediaUpload } from '../../composable/useMediaUpload';
import SelectCountry from '../atoms/SelectCountry.vue';
import SelectGenre from '../atoms/SelectGenre.vue';
import PhoneInput from '../atoms/PhoneInput.vue';
import { useSnackbarStore } from '../../stores/snackbar'
import SelectDate from '../atoms/SelectDate.vue';

// Props
const props = defineProps({
  activeUser: { type: Object, required: true },
  closeEditModal: { type: Function, required: true },
  updateRefData: { type: Function, required: true },
});

// Instancias
const { updateUser } = useUsers();
const { uploadMedia } = useMediaUpload();
const snackbarStore = useSnackbarStore()

// Estados
const editForm = ref({});
const isLoading = ref(false);
const errorFileMessage = ref('');
const errors = ref({});
const currentStep = ref(0);
const stepErrors = ref({});

// Definición de pasos
const steps = ref([
  { label: 'Información personal', fields: ['displayName', 'firstName', 'lastName'] },
  { label: 'Contacto', fields: ['phoneNumber'] },
  { label: 'Detalles personales', fields: ['birthday', 'genre', 'country'] },
  { label: 'Foto de perfil', fields: ['photoURL'] },
  { label: 'Redes sociales', fields: ['socialNetwork'] }, 
]);

// Validar si el paso actual tiene errores
const hasStepErrors = computed(() => {
  return Object.keys(stepErrors.value).length > 0;
});

// Validar si hay errores globales
const hasGlobalErrors = computed(() => {
  debugger
  return Object.keys(errors.value).length > 0;
});


// Watch para re-validar el displayname al cambiar
watch(
  () => editForm.value.displayName,
  (newDisplayName) => {
    if (currentStep.value === 0) { //valida solo si es step 1
      stepErrors.displayName = '';
      validateStep(currentStep.value);
    }
  }
);
// Watch para re-validar el número de teléfono al cambiar
watch(
  () => editForm.value.phoneNumber,
  (newPhone) => {
    if (currentStep.value === 1) { //valida solo si es step 2
      stepErrors.phoneNumber = '';
      validateStep(currentStep.value);
    }
  }
);
// Watch para re-validar fecha de nacimiento al cambiar
watch(
  () => editForm.value.birthday,
  (newBirthday) => {
    if (currentStep.value === 2) { //valida solo si es step 3
      stepErrors.birthday = '';
      validateStep(currentStep.value);
    }
  }
);
// Watch para re-validar el displayname al cambiar
watch(
  () => editForm.value.country,
  (newCountry) => {
    if (currentStep.value === 2) { //valida solo si es step 3
      stepErrors.country = '';
      validateStep(currentStep.value);
    }
  }
);
// Watch para re-validar el displayname al cambiar
watch(
  () => editForm.value.genre,
  (newGenre) => {
    if (currentStep.value === 2) { //valida solo si es step 3
      stepErrors.genre = '';
      validateStep(currentStep.value);
    }
  }
);
watch(
  () => editForm.value.socialNetwork,
  (newSocialNetwork) => {
    debugger
    if (currentStep.value === 4) {
      stepErrors.value = {};
      validateStep(currentStep.value);
    }
  },
  { deep: true } // Detecta cambios en el array y sus objetos
);

onMounted(() => {
  editProfile();
});

function editProfile() {
  let phone = props.activeUser?.phoneNumber || '';
  if (phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('549') && digits.length === 13) {
      phone = `+54 9 ${digits.slice(3, 5)} ${digits.slice(5, 9)}-${digits.slice(9)}`;
    } else if (digits.startsWith('54') && digits.length === 12) {
      phone = `+54 ${digits.slice(2, 4)} ${digits.slice(4, 8)}-${digits.slice(8)}`;
    } else {
      phone = '';
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
    socialNetwork: props.activeUser?.socialNetwork || [{ name: 'LinkedIn', value: '' }, { name: 'Instagram', value: '' }],
  };
}

function handlePhotoUpload(event) {
  errorFileMessage.value = '';
  const file = event.target.files[0];

  if (!file) return;
  if (!file.type.startsWith('image/')) {
    errorFileMessage.value = 'Selecciona una imagen válida.';
    event.target.value = '';
    return;
  }

  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      editForm.value.newMediaBase64 = reader.result;
      editForm.value.photoURL = URL.createObjectURL(file);
      editForm.value.mediaType = 'image';
    };
    reader.readAsDataURL(file);
  }
}

function validateStep(stepIndex) {
  stepErrors.value = {};
  const stepFields = steps.value[stepIndex].fields;

  // Validaciones específicas por campo
  if (stepFields.includes('displayName')) {
    if (!editForm.value.displayName || editForm.value.displayName.trim() === '') {
      stepErrors.value.displayName = 'El nombre de usuario no puede estar vacío';
    }
  }

  if (stepFields.includes('firstName')) {
    if (editForm.value.firstName && editForm.value.firstName.trim() === '') {
      stepErrors.value.firstName = 'El nombre no puede estar vacío';
    }
  }

  if (stepFields.includes('lastName')) {
    if (editForm.value.lastName && editForm.value.lastName.trim() === '') {
      stepErrors.value.lastName = 'El apellido no puede estar vacío';
    }
  }

  if (stepFields.includes('phoneNumber')) {
    if (!editForm.value.phoneNumber || editForm.value.phoneNumber.trim() === '') {
      stepErrors.value.phoneNumber = 'El número de teléfono es obligatorio';
    } else {
      const cleanedPhone = editForm.value.phoneNumber.replace(/\D/g, '');
      if (cleanedPhone.startsWith('549') && cleanedPhone.length === 13) {
        // Formato móvil: +54 9 ## ####-####
      } else if (cleanedPhone.startsWith('54') && cleanedPhone.length === 12) {
        // Formato fijo: +54 ## ####-####
      } else {
        stepErrors.value.phoneNumber = 'El número debe seguir el formato +54 9 XX XXXX-XXXX (móvil, 13 dígitos) o +54 XX XXXX-XXXX (fijo, 12 dígitos)';
      }
    }
  }

  if (stepFields.includes('birthday')) {
    if (!editForm.value.birthday) {
      stepErrors.value.birthday = 'La fecha de nacimiento es obligatoria';
    } else if (new Date(editForm.value.birthday) > new Date()) {
      stepErrors.value.birthday = 'La fecha de nacimiento no puede ser futura';
    }
  }

  if (stepFields.includes('genre')) {
    if (!editForm.value.genre || editForm.value.genre.trim() === '') {
      stepErrors.value.genre = 'El género es obligatorio';
    }
  }

  if (stepFields.includes('country')) {
    if (!editForm.value.country || editForm.value.country.trim() === '') {
      stepErrors.value.country = 'El país es obligatorio';
    }
  }

  if (stepFields.includes('socialNetwork')) {
    editForm.value?.socialNetwork?.forEach((network, index) => {
      if (!network.name || network.name.trim() === '') {
        stepErrors.value[`socialNetwork[${index}].name`] = 'El nombre de la red social es obligatorio';
      }
      if (!network.value || network.value.trim() === '') {
        stepErrors.value[`socialNetwork[${index}].value`] = 'La URL es obligatoria';
      } else if (!isValidUrl(network.value)) {
        stepErrors.value[`socialNetwork[${index}].value`] = 'La URL no es válida';
      }
    });
  }

  // Actualizar errores globales
  errors.value = stepErrors.value;
  // errors.value = { ...errors.value, ...stepErrors.value };
  return Object.keys(stepErrors.value).length === 0;
}

function nextStep() {
  if (validateStep(currentStep.value)) {
    currentStep.value++;
    errors.value = { ...stepErrors.value };
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--;
    stepErrors.value = {};
    errors.value = { ...stepErrors.value };
  }
}

async function saveProfile() {
  isLoading.value = true;
  errors.value = {};

  // Validar todos los campos antes de guardar
  const validationErrors = validateForm();
  if (Object.keys(validationErrors).length > 0) {
    errors.value = validationErrors;
    stepErrors.value = validationErrors;
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
    props.closeEditModal();
    snackbarStore.show("Perfil actualizado exitosamente.","success")
  } catch (err) {
    snackbarStore.show("Error al guardar el perfil. Error"+err,"error")
  } finally {
    isLoading.value = false;
  }
}

function validateForm() {
  const validationErrors = {};

  // Validaciones completas
  if (!editForm.value.displayName || editForm.value.displayName.trim() === '') {
    validationErrors.displayName = 'El nombre de usuario no puede estar vacío';
  }

  if (editForm.value.firstName && editForm.value.firstName.trim() === '') {
    validationErrors.firstName = 'El nombre no puede estar vacío';
  }

  if (editForm.value.lastName && editForm.value.lastName.trim() === '') {
    validationErrors.lastName = 'El apellido no puede estar vacío';
  }

  if (!editForm.value.phoneNumber || editForm.value.phoneNumber.trim() === '') {
    validationErrors.phoneNumber = 'El número de teléfono es obligatorio';
  } else {
    const cleanedPhone = editForm.value.phoneNumber.replace(/\D/g, '');
    if (cleanedPhone.startsWith('549') && cleanedPhone.length === 13) {
      // Formato móvil: +54 9 ## ####-####
    } else if (cleanedPhone.startsWith('54') && cleanedPhone.length === 12) {
      // Formato fijo: +54 ## ####-####
    } else {
      validationErrors.phoneNumber = 'El número debe seguir el formato +54 9 XX XXXX-XXXX (móvil, 13 dígitos) o +54 XX XXXX-XXXX (fijo, 12 dígitos)';
    }
  }

  if (!editForm.value.birthday) {
    validationErrors.birthday = 'La fecha de nacimiento es obligatoria';
  } else if (new Date(editForm.value.birthday) > new Date()) {
    validationErrors.birthday = 'La fecha de nacimiento no puede ser futura';
  }

  if (!editForm.value.genre || editForm.value.genre.trim() === '') {
    validationErrors.genre = 'El género es obligatorio';
  }

  if (!editForm.value.country || editForm.value.country.trim() === '') {
    validationErrors.country = 'El país es obligatorio';
  }

  editForm.value?.socialNetwork?.forEach((network, index) => {
    if (!network.name || network.name.trim() === '') {
      validationErrors[`socialNetwork[${index}].name`] = 'El nombre de la red social es obligatorio';
    }
    if (!network.value || network.value.trim() === '') {
      validationErrors[`socialNetwork[${index}].value`] = 'La URL es obligatoria';
    } else if (!isValidUrl(network.value)) {
      validationErrors[`socialNetwork[${index}].value`] = 'La URL no es válida';
    }
  });

  return validationErrors;
}

// Métodos para redes sociales
function addNetwork() {
  editForm.value?.socialNetwork?.push({ name: 'Website', value: '' });
}

function removeNetwork(index) {
  editForm.value?.socialNetwork?.splice(index, 1);
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
</script>

<style scoped>
/* Animación para cambio de pasos */
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Animación para los pasos del stepper */
.animate-pulse-step {
  animation: pulseStep 0.5s ease-in-out;
}

@keyframes pulseStep {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.2);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 0 8px rgba(0, 0, 0, 0.1);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
  }
}

/* Estilo para inputs y selects */
input, select {
  transition: all 0.2s ease;
}

/* Eliminar efecto hover en selects */
select:hover {
  background: transparent !important;
}

/* Estilo responsivo */
@media (max-width: 640px) {
  .p-4 {
    padding: 0.75rem;
  }
  .w-8 {
    width: 1.5rem;
    height: 1.5rem;
    font-size: 0.65rem;
  }
  .w-6 {
    width: 1rem;
  }
}
</style>