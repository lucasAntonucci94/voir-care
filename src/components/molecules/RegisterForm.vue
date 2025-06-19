<template>
  <div class="md:min-w-md p-8 my-8 mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg">
    <h3 class="font-heading tracking-tight text-4xl font-bold text-primary dark:text-secondary mb-3 text-left">Registro</h3>
    <p class="text-gray-500 dark:text-gray-300 mb-8 text-left">¡Bienvenido! Por favor, completa los pasos para registrarte.</p>

    <!-- Stepper -->
    <div class="flex justify-center mb-4">
      <div class="flex items-center space-x-2">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="relative flex items-center"
          :class="{ 'cursor-pointer': index <= currentStep }"
          @click="jumpToStep(index)"
          role="button"
          :tabindex="index <= currentStep ? 0 : -1"
          :aria-label="`Paso ${index + 1}: ${step}`"
          :aria-current="currentStep === index ? 'step' : undefined"
        >
          <div
            class="flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all duration-300"
            :class="{
              'bg-primary dark:bg-secondary text-white animate-pulse-step': currentStep === index,
              'bg-green-500 text-white': currentStep > index,
              'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300': currentStep < index,
            }"
          >
            <span v-if="currentStep <= index">{{ index + 1 }}</span>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div
            v-if="index < steps.length - 1"
            class="w-6 h-1 bg-gray-200 dark:bg-gray-600">
            <div
              class="h-full bg transition-all duration-300"
              :class="currentStep > index ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Step 1: Username and Email -->
      <div v-if="currentStep === 0">
        <div>
          <InputText
            v-model="displayName.field.value"
            label="Nombre de usuario"
            type="text"
            id="displayName"
            maxLength="30"
            placeholder="Ingresa tu nombre de usuario"
            :disabled="isLoading"
          />
          <p v-if="displayName.field.error" class="text-red-500 text-sm mt-1">{{ displayName.field.error }}</p>
        </div>
        <div class="mt-4">
          <InputText
            v-model="email.field.value"
            label="Correo Electrónico"
            type="email"
            id="email"
            maxLength="254"
            placeholder="Ingresa tu correo electrónico"
            :disabled="isLoading"
          />
          <p v-if="email.field.error" class="text-red-500 text-sm mt-1">{{ email.field.error }}</p>
        </div>
      </div>

      <!-- Step 2: Password and Confirm Password -->
      <div v-if="currentStep === 1">
        <div>
          <InputPassword
            v-model="password.field.value"
            label="Contraseña"
            type="password"
            id="password"
            placeholder="Ingresa tu contraseña"
            :disabled="isLoading"
          />
          <p v-if="password.field.error" class="text-red-500 text-sm mt-1">{{ password.field.error }}</p>
        </div>
        <div class="mt-4">
          <InputPassword
            v-model="confirmPassword.field.value"
            label="Confirmar Contraseña"
            id="confirmpassword"
            placeholder="Ingresa nuevamente tu contraseña"
            :disabled="isLoading"
          />
          <p v-if="confirmPassword.field.error" class="text-red-500 text-sm mt-1">{{ confirmPassword.field.error }}</p>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="flex justify-between gap-1 md:gap-4 mt-6">
        <button
          v-if="currentStep > 0"
          type="button"
          @click="prevStep"
          class="relative flex items-center justify-center px-5 h-12 w-full font-bold text-gray-100 hover:text-white bg-gray-400 dark:bg-gray-600 hover:bg-gray-600 hover:dark:bg-gray-500 rounded-lg transition-all duration-300 border dark:border-gray-800"
          :disabled="isLoading"
        >
          Volver
        </button>
        <button 
          type="button"
          @click="currentStep < steps.length - 1 ? nextStep() : handleSubmit()"
          :disabled="isLoading"
          class="relative flex items-center justify-center px-5 h-12 w-full font-bold text-gray-100 hover:text-white bg-primary-md dark:bg-secondary-md hover:bg-primary hover:dark:bg-secondary rounded-lg transition-all duration-300 border dark:border-gray-800">
          <span v-if="isLoading">{{ currentStep < steps.length - 1 ? 'Cargando...' : 'Registrando...' }}</span>
          <span v-else>{{ currentStep < steps.length - 1 ? 'Siguiente' : 'Registrar' }}</span>
        </button>
      </div>
    </form>

    <div v-if="currentStep === 0" class="text-center mt-6 text-gray-700 dark:text-gray-300">
      ¿Ya tienes una cuenta?
      <router-link to="/login" class="text-primary hover:text-primary-md dark:text-secondary dark:hover:text-secondary-md font-semibold ml-1">Iniciar Sesión</router-link>
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

const { doRegister, error } = useAuth();
const router = useRouter();
const isLoading = ref(false);

// Stores
const snackbarStore = useSnackbarStore();

// Stepper state
const steps = ['Usuario y Correo', 'Contraseña'];
const currentStep = ref(0);

// Validation schema
const registerSchema = yup.object({
  displayName: yup
    .string()
    .required('El nombre de usuario es obligatorio')
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(30, 'El nombre de usuario no puede exceder 30 caracteres'),
  email: yup.string().required('El correo es obligatorio').email('El correo no es válido'),
  password: yup.string().required('La contraseña es obligatoria').min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

// Custom rules for confirmPassword
const confirmPasswordRules = [
  (v) => !!v || 'Confirmar la contraseña es obligatorio',
  (v) => v === password.field.value.value || 'Las contraseñas no coinciden',
];

// Form fields
const displayName = useFormField('', registerSchema.fields.displayName);
const email = useFormField('', registerSchema.fields.email);
const password = useFormField('', registerSchema.fields.password);
const confirmPassword = useFormField('');

// Navigation methods
const nextStep = async () => {
  let isValid = true;
  if (currentStep.value === 0) {
    const displayNameValid = await displayName.validate();
    const emailValid = await email.validate();
    isValid = displayNameValid && emailValid;
  } else if (currentStep.value === 1) {
    const passwordValid = await password.validate();
    const confirmPasswordValid = await confirmPassword.validate(confirmPasswordRules);
    isValid = passwordValid && confirmPasswordValid;
  }
  if (isValid) {
    currentStep.value++;
  }
};

const prevStep = () => {
  currentStep.value--;
};

const jumpToStep = async (index) => {
  if (index <= currentStep.value) {
    currentStep.value = index;
  } else if (index === currentStep.value + 1) {
    await nextStep(); // Validate and move to next step if valid
  }
};

// Form submission
const handleSubmit = async () => {
  isLoading.value = true;
  const displayNameValid = await displayName.validate();
  const emailValid = await email.validate();
  const passwordValid = await password.validate();
  const confirmPasswordValid = await confirmPassword.validate(confirmPasswordRules);

  if (!displayNameValid || !emailValid || !passwordValid || !confirmPasswordValid) {
    isLoading.value = false;
    return;
  }
  const result = await doRegister(displayName.field.value.value, email.field.value.value, password.field.value.value);
  if (result !== true && error.value?.code) {
    setErrorFromFirebase(error.value.code, error.value.message);
  } else {
    router.push('/');
    snackbarStore.show('Bienvenido!', 'success');
  }

  isLoading.value = false;
};

// Handle Firebase errors
const setErrorFromFirebase = (code, message) => {
  displayName.clearError();
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
      snackbarStore.show('Error desconocido, contacte con soporte', 'error');
  }
};
</script>

<style scoped>
@keyframes pulse-step {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>