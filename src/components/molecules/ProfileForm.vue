<template>
    <!-- Formulario -->
    <form @submit.prevent="saveProfile" class="p-4 space-y-6 max-w-md mx-auto">
      <!-- Nombre de usuario -->
      <div>
        <label class="block text-sm font-medium text-[#2c3e50]">Nombre de usuario</label>
        <input
          v-model="editForm.displayName"
          type="text"
          class="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-full text-[#2c3e50] focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent placeholder-gray-400"
          placeholder="Nombre de usuario"
        />
      </div>
  
      <!-- Nombre -->
      <div>
        <label class="block text-sm font-medium text-[#2c3e50]">Nombre</label>
        <input
          v-model="editForm.firstName"
          type="text"
          class="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-full text-[#2c3e50] focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent placeholder-gray-400"
          placeholder="Nombre"
        />
      </div>
  
      <!-- Apellido -->
      <div>
        <label class="block text-sm font-medium text-[#2c3e50]">Apellido</label>
        <input
          v-model="editForm.lastName"
          type="text"
          class="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-full text-[#2c3e50] focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent placeholder-gray-400"
          placeholder="Apellido"
        />
      </div>
  
      <!-- Email -->
      <div>
        <label class="block text-sm font-medium text-[#2c3e50]">Email</label>
        <input
          v-model="editForm.email"
          type="email"
          class="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-full text-[#2c3e50] focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent placeholder-gray-400"
          placeholder="Correo electrónico"
        />
      </div>
  
      <!-- Teléfono -->
      <div>
        <label class="block text-sm font-medium text-[#2c3e50]">Teléfono</label>
        <input
          v-model="editForm.phoneNumber"
          type="tel"
          class="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-full text-[#2c3e50] focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent placeholder-gray-400"
          placeholder="Número de teléfono"
        />
      </div>
  
      <!-- Fecha de nacimiento -->
      <div>
        <label class="block text-sm font-medium text-[#2c3e50]">Fecha de nacimiento</label>
        <input
          v-model="editForm.birthday"
          type="date"
          class="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-full text-[#2c3e50] focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent"
        />
      </div>
  
      <!-- Género -->
      <div>
        <label class="block text-sm font-medium text-[#2c3e50]">Género</label>
        <select
          v-model="editForm.genre"
          class="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-full text-[#2c3e50] focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent"
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
          class="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-full text-[#2c3e50] focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent placeholder-gray-400"
          placeholder="País"
        />
      </div>
  
      <!-- Foto de perfil -->
      <div>
        <label class="block text-sm font-medium text-[#2c3e50]">Foto de perfil</label>
        <input
          type="file"
          @change="handlePhotoUpload"
          class="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-full text-[#2c3e50] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary file:text-white hover:file:bg-primary-md"
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
          class="px-4 py-2 bg-gray-200 text-[#2c3e50] rounded-full hover:bg-gray-300 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-md transition-colors"
        >
          Guardar
        </button>
      </div>
    </form>
  </template>
  
  <script setup>
  import { ref, defineProps, onMounted } from 'vue';
  import { useStorage } from '../../composable/useStorage';
  import { useUsers } from '../../composable/useUsers';
  
  // Props
  const props = defineProps({
    activeUser: { type: Object, required: true },
    closeEditModal: { type: Function, required: true },
    updateRefData: { type: Function, required: true },
  });
  
  // Instancias
  const { updateUser } = useUsers();
  const { uploadFile, getFileUrl } = useStorage();
  
  // Estados
  const editForm = ref({});
  
  onMounted(() => {
    editProfile();
  });
  
  function editProfile() {
    editForm.value = {
      id: props.activeUser?.uid || props.activeUser?.id,
      displayName: props.activeUser?.displayName || 'No ha definido un displayName',
      firstName: props.activeUser?.firstName || 'No ha definido un nombre',
      lastName: props.activeUser?.lastName || 'No ha definido un apellido',
      email: props.activeUser?.email || 'No ha definido un correo',
      phoneNumber: props.activeUser?.phoneNumber || 'No ha definido un número de teléfono',
      birthday: props.activeUser?.birthday ? new Date(props.activeUser.birthday).toISOString().split('T')[0] : null,
      genre: props.activeUser?.genre || null,
      country: props.activeUser?.country || 'No ha definido un país',
      photoURL: props.activeUser?.photoURL || null,
      photoURLFile: props.activeUser?.photoURLFile || null,
    };
  }
  
  // Funciones de carga de imagen
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
      const oldPhotoURL = props.activeUser.photoURL;
      if (editForm.value.photoURLFile != null && editForm.value.photoURLFile !== props.activeUser.photoURLFile) {
        const filepath = `profile/${props.activeUser.email}.jpg`; // Corregí props.activeUserEmail a props.activeUser.email
        await uploadFile(filepath, editForm.value.photoURLFile);
        editForm.value.photoURL = await getFileUrl(filepath);
      }
      const profiletoUpdate = {
        ...props.activeUser,
        ...editForm.value,
        photoURLFile: editForm.value.photoURL ?? oldPhotoURL,
      };
      debugger
      await updateUser(profiletoUpdate.uid, profiletoUpdate);
      props.updateRefData(profiletoUpdate);
      console.log('Perfil actualizado:', profiletoUpdate);
      props.closeEditModal();
    } catch (err) {
      console.error('Error al guardar el perfil:', err);
    }
  }
  </script>