<template>
   <div class="md:min-w-md p-8 mb-8 mx-auto bg-white border border-gray-200 rounded-2xl shadow-lg">
      <h3 class="font-heading tracking-tight text-4xl font-bold text-voir-darker mb-3 text-left">Registro</h3>
      <p class="text-gray-500 mb-8 text-left">¡Bienvenido! Por favor, ingresa tus datos.</p>

      <form @submit.prevent="handleSubmit">
        
      <InputText v-model="name" label="Nombre" type="text" id="name" placeholder="Ingresa tu nombre" :hasError= nameHasError :hasErrorMessage= nameHasErrorMessage />
      <InputText v-model="email" label="Correo Electrónico" type="email" id="email" placeholder="Ingresa tu correo electrónico" :hasError= emailHasError :hasErrorMessage= emailHasErrorMessage />
      <InputPassword v-model="password" label="Contraseña" type="text" id="password" placeholder="Ingresa tu contraseña" :hasError= passwordHasError :hasErrorMessage= passwordHasErrorMessage />
      <InputPassword v-model="confirmPassword" label="Confirmar Contraseña" id="confirmpassword" placeholder="Ingresa nuevamente tu contraseña" :hasError= confirmPasswordHasError :hasErrorMessage= confirmPasswordHasErrorMessage />
      
      <button type="submit":disabled="isLoading" class="group relative flex items-center justify-center px-5 h-12 w-full font-bold text-white bg-gradient-to-br bg-voir to-cyan-800 rounded-lg transition-all duration-300 focus:outline-none">
        <div v-if="isLoading" class="absolute top-0 left-0 w-full h-full rounded-lg bg-cyanGreen-900 opacity-50 animate-pulse"></div>
        <span v-if="isLoading">Registrando...</span>
        <span v-else>Registrar</span>
      </button>
<!--       
      <div v-if="errorMessage" class="text-center mt-4 text-red-500">
        {{ errorMessage }}
      </div> -->
      
      <div class="text-center mt-4 text-gray-700">
        ¿Ya tienes una cuenta? <router-link to="/login" class="text-voir hover:text-voir-darker font-semibold ml-1">Iniciar Sesión</router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import InputText from '../atoms/InputText.vue';
import InputPassword from '../atoms/InputPassword.vue';
import { useRouter } from "vue-router";

import { useAuth } from "../../api/auth/auth.js";
const { user, isAuthenticated, loading, error, login, logout, doRegister, doUUpdateProfile } = useAuth();

const router = useRouter();
const isLoading = ref(false);
const name = ref('');
const nameHasError = ref(false);
const nameHasErrorMessage = ref('');
const email = ref('');
const emailHasError = ref(false);
const emailHasErrorMessage = ref('');
const password = ref('');
const passwordHasError = ref(false);
const passwordHasErrorMessage = ref('');
const confirmPassword = ref('');
const confirmPasswordHasError = ref(false);
const confirmPasswordHasErrorMessage = ref('');
const errorMessage = ref(null);

const handleSubmit = async () => {
  debugger
  isLoading.value = true;
  // message.value = null;
  const validated = validateForm();
  if(validated){
    const result = await doRegister(email.value, password.value);
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
      if(!name.value) nameHasError.value = true; 
      if(!email.value) emailHasError.value = true; 
      if(!password.value) passwordHasError.value = true; 
      if(!confirmPassword.value) confirmPasswordHasError.value = true; 
      nameHasErrorMessage.value = message;
      emailHasErrorMessage.value = message;
      passwordHasErrorMessage.value = message;
      confirmPasswordHasErrorMessage.value = message;
    } 
    isLoading.value = false;
};

const validateForm = () => {
  emailHasError.value =!email.value;  
  passwordHasError.value =!password.value; 
  
  if (password.value !== confirmPassword.value) {
    confirmPasswordHasError.value = true;
  }

  if(emailHasError.value || passwordHasError.value){
    return false
  }
  return true
};
</script>