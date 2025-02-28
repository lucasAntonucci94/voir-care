<!-- LoginForm.vue -->
<template>
  <div class="md:min-w-md p-8 mb-8 mx-auto bg-white border border-gray-200 rounded-2xl shadow-lg">
    <h3 class="font-heading tracking-tight text-4xl font-bold text-voir-darker mb-3 text-left">Iniciar Sesión</h3>
    <p class="text-gray-500 mb-8 text-left">¡Bienvenido! Por favor, ingresa tus datos.</p>

    <form @submit.prevent="handleSubmit">
      <InputText v-model="email.field.value" label="Correo Electrónico" type="email" id="email" placeholder="Ingresa tu correo electrónico"/>
      <InputPassword v-model="password.field.value" label="Contraseña" type="password" id="password" placeholder="Ingresa tu contraseña"/>

      <div class="text-right mb-8">
        <router-link to="/forgot-password" class="inline-block text-sm font-semibold text-yellowGreen-700 hover:text-yellowGreen-600">¿Olvidaste tu contraseña?</router-link>
      </div>

      <button type="submit" :disabled="isLoading" class="group relative flex items-center justify-center px-5 h-12 w-full font-bold text-white bg-gradient-to-br bg-voir to-cyan-800 rounded-lg transition-all duration-300 border hover:text-gray-200 hover:border-green-700">
        <div v-if="isLoading" class="absolute top-0 left-0 w-full h-full rounded-lg bg-cyanGreen-900 opacity-50 animate-pulse"></div>
        <span v-if="isLoading">Cargando...</span>
        <span v-else>Iniciar Sesión</span>
      </button>
    </form>

    <div class="text-center mt-6 text-gray-700">
      ¿No tienes una cuenta?
      <router-link to="/register" class="text-voir hover:text-voir-darker font-semibold ml-1">Regístrate</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import InputText from '../atoms/InputText.vue';
import InputPassword from '../atoms/InputPassword.vue';
import { useAuth } from '../../api/auth/auth';
import { useFormField } from '../../composable/useFormField';

const { login, error } = useAuth();
const router = useRouter();
const isLoading = ref(false);

// Usamos el composable para cada campo
const email = useFormField('');
const password = useFormField('');

// Reglas de validación frontend
const emailRules = [
  (v) => !!v || 'El correo es obligatorio',
  (v) => /.+@.+\..+/.test(v) || 'El correo no es válido',
];
const passwordRules = [
  (v) => !!v || 'La contraseña es obligatoria',
];

const handleSubmit = async () => {
  isLoading.value = true;

  // Validación temprana de los campos
  const isValid = email.validate(emailRules) && password.validate(passwordRules);
  if (!isValid) {
    isLoading.value = false;
    return;
  }

  // Petición a Firebase
  const result = await login(email.field.value.value, password.field.value.value);
  if (result !== true && error.value?.code) {
    setErrorFromFirebase(error.value.code, error.value.message);
  } else {
    router.push('/');
  }

  isLoading.value = false;
};

// Manejo de errores de Firebase
const setErrorFromFirebase = (code, message) => {
  email.clearError();
  password.clearError();

  switch (code) {
    case 'auth/invalid-email':
    case 'auth/missing-email':
    case 'auth/user-not-found':
      email.setError(code, message);
      break;
    case 'auth/wrong-password':
    case 'auth/weak-password':
      password.setError(code, message);
      break;
    case 'auth/internal-error':
    case 'auth/admin-restricted-operation':
      email.setError(code, 'Error interno, revisa tus datos');
      password.setError(code, 'Error interno, revisa tus datos');
      break;
    default:
      email.setError(code, 'Error desconocido, contacte con soporte.');
      password.setError(code, 'Error desconocido, contacte con soporte.');
  }
};
</script>