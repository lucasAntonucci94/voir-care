<template>
  <div class="md:min-w-md p-8 mb-8 mx-auto bg-white border border-gray-200 rounded-2xl shadow-lg">
    <h3 class="font-heading tracking-tight text-4xl font-bold text-voir-darker mb-3 text-left">Registro</h3>
    <p class="text-gray-500 mb-8 text-left">¡Bienvenido! Por favor, ingresa tus datos.</p>

    <form @submit.prevent="handleSubmit">
      <InputText v-model="name.field.value" label="Nombre" type="text" id="name" placeholder="Ingresa tu nombre" />
      <InputText v-model="email.field.value" label="Correo Electrónico" type="email" id="email" placeholder="Ingresa tu correo electrónico" />
      <InputPassword v-model="password.field.value" label="Contraseña" type="password" id="password" placeholder="Ingresa tu contraseña" />
      <InputPassword v-model="confirmPassword.field.value" label="Confirmar Contraseña" id="confirmpassword" placeholder="Ingresa nuevamente tu contraseña" />

      <button type="submit" :disabled="isLoading" class="group relative flex items-center justify-center px-5 h-12 w-full font-bold text-white bg-gradient-to-br bg-voir to-cyan-800 rounded-lg transition-all duration-300 focus:outline-none">
        <div v-if="isLoading" class="absolute top-0 left-0 w-full h-full rounded-lg bg-cyanGreen-900 opacity-50 animate-pulse"></div>
        <span v-if="isLoading">Registrando...</span>
        <span v-else>Registrar</span>
      </button>

      <div class="text-center mt-4 text-gray-700">
        ¿Ya tienes una cuenta? <router-link to="/login" class="text-voir hover:text-voir-darker font-semibold ml-1">Iniciar Sesión</router-link>
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
import { useAuth } from '../../api/auth/auth';
import { useFormField } from '../../composable/useFormField';

// Definimos el esquema de validación con yup
const registerSchema = yup.object({
  name: yup.string().required('El nombre es obligatorio'),
  email: yup.string().required('El correo es obligatorio').email('El correo no es válido'),
  password: yup.string().required('La contraseña es obligatoria').min(6, 'La contraseña debe tener al menos 6 caracteres'),
  // confirmPassword: yup
  //   .string()
  //   .required('Confirmar la contraseña es obligatorio')
    // .oneOf([yup.ref('password')], 'Las contraseñas no coinciden'),
});
// Regla manual para confirmPassword
const confirmPasswordRules = [
  (v) => !!v || 'Confirmar la contraseña es obligatorio',
  (v) => v !== password.field.value.value || 'Las contraseñas no coinciden',
];
const { doRegister, error } = useAuth();
const router = useRouter();
const isLoading = ref(false);

// Usamos el composable para cada campo con su respectivo esquema
const name = useFormField('', registerSchema.fields.name);
const email = useFormField('', registerSchema.fields.email);
const password = useFormField('', registerSchema.fields.password);
const confirmPassword = useFormField('');

const handleSubmit = async () => {
  isLoading.value = true;
  // Validamos todos los campos de forma independiente
  const nameValid = name.validate();
  const emailValid = email.validate();
  const passwordValid = password.validate();
  const confirmPasswordValid = confirmPassword.validate(confirmPasswordRules);
  
  // Solo continuamos si todos son válidos
  if (!nameValid || !emailValid || !passwordValid || !confirmPasswordValid) {
    isLoading.value = false;
    return;
  }

  // Registro en Firebase
  const result = await doRegister(email.field.value.value, password.field.value.value);
  if (result !== true && error.value?.code) {
    setErrorFromFirebase(error.value.code, error.value.message);
  } else {
    router.push('/');
  }

  isLoading.value = false;
};

// Manejo de errores de Firebase
const setErrorFromFirebase = (code, message) => {
  name.clearError();
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