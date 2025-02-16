<template>
   <div class="md:min-w-md p-8 mb-8 mx-auto bg-white border border-gray-200 rounded-2xl shadow-lg">
      <h3 class="font-heading tracking-tight text-4xl font-bold text-voir-darker mb-3 text-left">Registro</h3>
      <p class="text-gray-500 mb-8 text-left">¡Bienvenido! Por favor, ingresa tus datos.</p>

      <form @submit.prevent="handleSubmit">
        
      <TextInput v-model="name" label="Nombre" type="text" id="name" placeholder="Ingresa tu nombre"  />
      <TextInput v-model="email" label="Correo Electrónico"  type="email" id="email" placeholder="Ingresa tu correo electrónico" />
      <PasswordInput v-model="password" label="Contraseña" id="password" placeholder="Ingresa tu contraseña" />
      <PasswordInput v-model="confirmPassword" label="Confirmar Contraseña" id="confirmpassword" placeholder="Ingresa nuevamente tu contraseña" />
      
      <button type="submit":disabled="isLoading" class="group relative flex items-center justify-center px-5 h-12 w-full font-bold text-white bg-gradient-to-br bg-voir to-cyan-800 rounded-lg transition-all duration-300 focus:outline-none">
        <div v-if="isLoading" class="absolute top-0 left-0 w-full h-full rounded-lg bg-cyanGreen-900 opacity-50 animate-pulse"></div>
        <span v-if="isLoading">Registrando...</span>
        <span v-else>Registrar</span>
      </button>
      
      <div v-if="errorMessage" class="text-center mt-4 text-red-500">
        {{ errorMessage }}
      </div>
      
      <div class="text-center mt-4 text-gray-700">
        ¿Ya tienes una cuenta? <router-link to="/login" class="text-voir hover:text-voir-darker font-semibold ml-1">Iniciar Sesión</router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import TextInput from '../atoms/TextInput.vue';
import PasswordInput from '../atoms/PasswordInput.vue';
import { useRouter } from "vue-router";
import { doRegister } from "../../api/auth/auth.js"; // Import your register function

const router = useRouter();
const isLoading = ref(false);
const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorMessage = ref(null);

const handleSubmit = async () => {
  debugger
  errorMessage.value = null; // Clear any previous errors
  isLoading.value = true;

  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Las contraseñas no coinciden.";
    isLoading.value = false;
    return;
  }
  try {
    // const result = await doRegister(name.value, email.value, password.value);
    if(email.value !== undefined && email.value !== "" && password.value !== undefined && email.value !== ""){
      const result = await doRegister(email.value, password.value);
      if (result) { 
      // if (result.success) {
        router.push('/login');
      } else {
        errorMessage.value = result.message || "Error al registrar usuario."; // Display error message from API or a generic message
      }
    } 
  } catch (error) {
    console.error("Error during registration:", error);
    errorMessage.value = "Un error ocurrió durante el registro.";
  } finally {
    isLoading.value = false;
  }
};
</script>