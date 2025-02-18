<template>
  <div class="md:min-w-md p-8 mb-8 mx-auto bg-white border border-gray-200 rounded-2xl shadow-lg">
    <h3 class="font-heading tracking-tight text-4xl font-bold text-voir-darker mb-3 text-left">Iniciar Sesión</h3>
    <p class="text-gray-500 mb-8 text-left">¡Bienvenido! Por favor, ingresa tus datos.</p>

    <form @submit.prevent="handleSubmit">
      <TextInput v-model="email" label="Correo Electrónico" type="email" id="email" placeholder="Ingresa tu correo electrónico" :hasError= emailHasError :hasErrorMessage= emailHasErrorMessage />
      <PasswordInput v-model="password" label="Contraseña" type="text" id="password" placeholder="Ingresa tu contraseña" :hasError= passwordHasError :hasErrorMessage= passwordHasErrorMessage />

      <div class="text-right mb-8">
        <router-link to="/forgot-password" class="inline-block text-sm font-semibold text-yellowGreen-700 hover:text-yellowGreen-600">¿Olvidaste tu contraseña?</router-link>
      </div>

      <button type="submit":disabled="isLoading" class="group relative flex items-center justify-center px-5 h-12 w-full font-bold text-white bg-gradient-to-br bg-voir to-cyan-800 rounded-lg transition-all duration-300 border hover:text-gray-200 hover:border-green-700">
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
import { useRouter } from "vue-router";
import TextInput from '../atoms/TextInput.vue';
import PasswordInput from '../atoms/PasswordInput.vue';
import { useAuth } from '../../api/auth/auth';

const { user, isAuthenticated, loading, error, login, logout, register, updateProfile } = useAuth();

const router = useRouter();
const email = ref('');
const emailHasError = ref(false);
const emailHasErrorMessage = ref('');
const password = ref('');
const passwordHasError = ref(false);
const passwordHasErrorMessage = ref('');
const isLoading = ref(false);
const message = ref(null);

const handleSubmit = async () => {
  isLoading.value = true;
  message.value = null;
  const validated = validateForm();
  if(validated){
    const result = await login(email.value, password.value);
    isLoading.value = false;
    if (result!== true) {
      if (error.value.code) {
        setError(error.value.code, error.value.message);
      }
    } else {
      router.push("/");
    }
  }else{
    setError('form-not-validated','Campo requerido.');
  }
};

const setError = (code, message) => {
      emailHasError.value = false; 
      passwordHasError.value = false; 
      emailHasErrorMessage.value = '';
      passwordHasErrorMessage.value = '';
    if(code === 'auth/invalid-email' || code === 'auth/missing-email' || code === 'auth/user-not-found'){
      emailHasError.value = true;  
      emailHasErrorMessage.value = message;
    } 
    if(code === 'auth/wrong-password' || code === 'auth/weak-password'){
      passwordHasError.value = true;
      passwordHasErrorMessage.value = message;
    }
    if(code === 'auth/internal-error' || code === 'auth/admin-restricted-operation' || code === 'form-not-validated'){
      if(!email.value) emailHasError.value = true; 
      if(!password.value) passwordHasError.value = true; 
      emailHasErrorMessage.value = message;
      passwordHasErrorMessage.value = message;
    } 
    isLoading.value = false;
};

const validateForm = () => {
  emailHasError.value =!email.value;  
  passwordHasError.value =!password.value; 
  if(emailHasError.value || passwordHasError.value){
    return false
  }
  return true
};
</script>