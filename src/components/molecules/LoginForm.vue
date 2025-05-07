<!-- LoginForm.vue -->
<template>
  <div class="md:min-w-md p-8 mb-8 mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg">
    <h3 class="font-heading tracking-tight text-4xl font-bold text-primary dark:text-secondary mb-3 text-left">
      {{ showResetForm ? 'Restablecer Contraseña' : 'Iniciar Sesión' }}
    </h3>
    <p class="text-gray-500 dark:text-gray-300 mb-8 text-left">
      {{ showResetForm ? 'Ingresa tu correo para recibir un enlace de restablecimiento.' : '¡Bienvenido! Por favor, ingresa tus datos.' }}
    </p>

    <!-- Formulario de login -->
    <form v-if="!showResetForm" @submit.prevent="handleSubmit">
      <InputText v-model="email.field.value" label="Correo Electrónico" type="email" id="email" placeholder="Ingresa tu correo electrónico"/>
      <InputPassword v-model="password.field.value" label="Contraseña" type="password" id="password" placeholder="Ingresa tu contraseña"/>
      <div class="text-right mb-8">
        <button type="button" @click="showResetForm = true" class="inline-block text-sm font-semibold text-primary dark:text-secondary hover:text-primary-md dark:hover:text-secondary-md">
          ¿Olvidaste tu contraseña?
        </button>
      </div>
      <button type="submit" :disabled="isLoading" class="group relative flex items-center justify-center px-5 h-12 w-full font-bold text-white bg-gradient-to-br bg-primary to-cyan-800 dark:bg-gradient-to-br dark:bg-secondary dark:to-orange-800 rounded-lg transition-all duration-300 border dark:border-gray-800 hover:text-gray-200 hover:border-primary-lighter hover:border-secondary-lighter">
        <div v-if="isLoading" class="absolute top-0 left-0 w-full h-full rounded-lg bg-cyanGreen-900 opacity-50 animate-pulse"></div>
        <span v-if="isLoading">Cargando...</span>
        <span v-else>Iniciar Sesión</span>
      </button>
    </form>

    <!-- Formulario de reseteo de contraseña -->
    <form v-else @submit.prevent="handleResetPassword">
      <InputText v-model="resetEmail.field.value" label="Correo Electrónico" type="email" id="reset-email" placeholder="Ingresa tu correo"/>
      <div class="flex gap-2 mt-4">
        <button type="button" @click="showResetForm = false" class="flex-1 px-5 h-12 font-bold text-gray-700 bg-gray-200 hover:bg-gray-400 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg">
          Volver
        </button>
        <button type="submit" :disabled="isResetting" class="flex-1 px-5 h-12 font-bold text-white bg-primary dark:bg-secondary hover:bg-primary-md dark:hover:bg-secondary-md rounded-lg">
          <span v-if="isResetting">Enviando...</span>
          <span v-else>Enviar</span>
        </button>
      </div>
    </form>

    <!-- Link de registro (solo visible en login) -->
    <div v-if="!showResetForm" class="text-center mt-6 text-gray-700 dark:text-gray-300">
      ¿No tienes una cuenta?
      <router-link to="/register" class="text-primary hover:text-primary-md dark:text-secondary dark:hover:text-secondary-md font-semibold ml-1">Regístrate</router-link>
    </div>
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
import { useSnackbarStore } from '../../stores/snackbar';

const { login, resetPassword, error } = useAuth();
const router = useRouter();
const isLoading = ref(false);
const isResetting = ref(false);
const showResetForm = ref(false);

// Stores
const snackbarStore = useSnackbarStore();

// Schema para login
const loginSchema = yup.object({
  email: yup.string().required('El correo es obligatorio').email('El correo no es válido'),
  password: yup.string().required('La contraseña es obligatoria'),
});

// Schema para reseteo
const resetSchema = yup.object({
  resetEmail: yup.string().required('El correo es obligatorio').email('El correo no es válido'),
});

// Campos del formulario
const email = useFormField('', loginSchema.fields.email);
const password = useFormField('', loginSchema.fields.password);
const resetEmail = useFormField('', resetSchema.fields.resetEmail);

// Manejo del login
const handleSubmit = async () => {
  isLoading.value = true;

  const emailValid = email.validate();
  const passwordValid = password.validate();

  if (!emailValid || !passwordValid) {
    isLoading.value = false;
    return;
  }

  const result = await login(email.field.value.value, password.field.value.value);
  if (result !== true && error.value?.code) {
    setErrorFromFirebase(error.value.code, error.value.message);
  } else {
    router.push('/feed');
    snackbarStore.show('Bienvenido!', 'success');
  }

  isLoading.value = false;
};

// Manejo del reseteo de contraseña
const handleResetPassword = async () => {
  isResetting.value = true;

  const resetEmailValid = resetEmail.validate();
  if (!resetEmailValid) {
    isResetting.value = false;
    return;
  }

  const result = await resetPassword(resetEmail.field.value.value);
  if (result === true) {
    snackbarStore.show('Se ha enviado un enlace de restablecimiento a tu correo.', 'success');
    showResetForm.value = false;
    resetEmail.clearError();
    resetEmail.field.value.value = ''; // Limpiar el campo
  } else {
    setResetErrorFromFirebase(error.value.code, error.value.message);
  }

  isResetting.value = false;
};

// Manejo de errores de Firebase para login
const setErrorFromFirebase = (code, message) => {
  email.clearError();
  password.clearError();

  switch (code) {
    case 'auth/invalid-email':
    case 'auth/missing-email':
    case 'auth/user-not-found':
      email.setError(message);
      break;
    case 'auth/wrong-password':
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

// Manejo de errores de Firebase para reseteo
const setResetErrorFromFirebase = (code, message) => {
  resetEmail.clearError();

  switch (code) {
    case 'auth/invalid-email':
    case 'auth/missing-email':
      resetEmail.setError('Correo inválido o no proporcionado');
      break;
    case 'auth/user-not-found':
      resetEmail.setError('No existe una cuenta con este correo');
      break;
    default:
      resetEmail.setError('Error: ' + message);
  }
};
</script>