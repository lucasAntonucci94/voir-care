<template>
  <div class="md:min-w-md p-8 my-8 mx-auto bg-white border border-gray-200 rounded-2xl shadow-lg">
    <h3 class="font-heading tracking-tight text-4xl font-bold text-primary mb-3 text-left">Registro</h3>
    <p class="text-gray-500 mb-8 text-left">¡Bienvenido! Por favor, ingresa tus datos.</p>

    <form @submit.prevent="handleSubmit">
      <InputText v-model="displayName.field.value" label="Nombre de usuario" type="text" id="displayName" placeholder="Ingresa tu nombre de usuario" :disabled="isLoading" />
      <!-- <InputText v-model="lastname.field.value" label="Apellido" type="text" id="lastname" placeholder="Ingresa tu apellido" :disabled="isLoading" /> -->
      <InputText v-model="email.field.value" label="Correo Electrónico" type="email" id="email" placeholder="Ingresa tu correo electrónico" :disabled="isLoading" />
      <InputPassword v-model="password.field.value" label="Contraseña" type="password" id="password" placeholder="Ingresa tu contraseña" :disabled="isLoading" />
      <InputPassword v-model="confirmPassword.field.value" label="Confirmar Contraseña" id="confirmpassword" placeholder="Ingresa nuevamente tu contraseña" :disabled="isLoading" />

      <button type="submit" :disabled="isLoading" class="group relative flex items-center justify-center px-5 h-12 w-full font-bold text-white bg-gradient-to-br bg-primary to-cyan-800 rounded-lg transition-all duration-300 focus:outline-none">
        <div v-if="isLoading" class="absolute top-0 left-0 w-full h-full rounded-lg bg-cyanGreen-900 opacity-50 animate-pulse"></div>
        <span v-if="isLoading">Registrando...</span>
        <span v-else>Registrar</span>
      </button>

      <div class="text-center mt-4 text-gray-700">
        ¿Ya tienes una cuenta? 
        <router-link to="/login" class="text-primary hover:text-primary-md font-semibold ml-1">Iniciar Sesión</router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import * as yup from 'yup';
import { useRouter } from 'vue-router';
import InputText from '../atoms/InputText.vue';
import InputPassword from '../atoms/InputPassword.vue';
import { useAuth } from '../../api/auth/useAuth';
import { useFormField } from '../../composable/useFormField';

const { doRegister, error } = useAuth();
const router = useRouter();
const isLoading = ref(false);

// Definimos el esquema de validación con yup
const registerSchema = yup.object({
  displayName: yup.string().required('El nombre de usuario es obligatorio'),
  // lastname: yup.string().required('El apellido es obligatorio'),
  email: yup.string().required('El correo es obligatorio').email('El correo no es válido'),
  password: yup.string().required('La contraseña es obligatoria').min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

// Regla manual para confirmPassword
const confirmPasswordRules = [
  (v) => !!v || 'Confirmar la contraseña es obligatorio',
  (v) => v === password.field.value.value || 'Las contraseñas no coinciden',
];

// Usamos el composable para cada campo con su respectivo esquema
const displayName = useFormField('', registerSchema.fields.displayName);
// const lastname = useFormField('', registerSchema.fields.lastname);
const email = useFormField('', registerSchema.fields.email);
const password = useFormField('', registerSchema.fields.password);
const confirmPassword = useFormField('');

const handleSubmit = async () => {
  isLoading.value = true;
  // Validamos todos los campos de forma independiente
  const displayNameValid = displayName.validate();
  // const lastnameValid = lastname.validate();
  const emailValid = email.validate();
  const passwordValid = password.validate();
  const confirmPasswordValid = confirmPassword.validate(confirmPasswordRules);
  
  // Solo continuamos si todos son válidos
  if (!displayNameValid || !emailValid || !passwordValid || !confirmPasswordValid) {
    isLoading.value = false;
    return;
  }

  // Registro en Firebase
  const result = await doRegister(displayName.field.value.value, email.field.value.value, password.field.value.value);
  if (result !== true && error.value?.code) {
    setErrorFromFirebase(error.value.code, error.value.message);
  } else {
    router.push('/');
  }

  isLoading.value = false;
};

// Manejo de errores de Firebase
const setErrorFromFirebase = (code, message) => {
  displayName.clearError();
  // lastName.clearError();
  email.clearError();
  password.clearError();
  confirmPassword.clearError();

  switch (code) {
    case 'auth/invalid-email':
    case 'auth/missing-email':
    case 'auth/email-already-in-use':
      email.setError(message);
      break;
    case 'auth/weak-password':
      password.setError(message);
      break;
    case 'auth/internal-error':
    case 'auth/admin-restricted-operation':
      email.setError('Error interno, revisa tus datos');
      password.setError('Error interno, revisa tus datos');
      break;
    default:
      email.setError('Error desconocido, contacte con soporte.');
      password.setError('Error desconocido, contacte con soporte.');
  }
};
</script>