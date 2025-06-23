<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/60 z-[101] flex items-center justify-center p-4 overflow-hidden"
    @click.self="emit('close')"
    tabindex="0"
    ref="modalRef"
    aria-labelledby="subscription-modal-title"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl transform transition-all duration-300 scale-100 relative max-h-[90vh] overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <!-- Encabezado del modal -->
      <div class="sticky top-0 bg-white dark:bg-gray-800 z-10 border-b flex items-center rounded-t-xl justify-between mb-6">
        <h2
          id="subscription-modal-title"
          class="text-2xl font-semibold text-gray-800 dark:text-gray-100 tracking-tight"
        >
          Suscribirse a Voir Premium
        </h2>
        <button
          @click="emit('close')"
          class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
          aria-label="Cerrar modal"
        >
          <i class="fa-solid fa-xmark w-6 h-6"></i>
        </button>
      </div>

      <!-- Barra de progreso -->
      <div class="flex justify-center mb-6">
        <div class="flex items-center space-x-2">
          <div v-for="(step, index) in steps" :key="index" class="relative flex items-center">
            <div
              class="flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all duration-300"
              :class="{
                'bg-primary dark:bg-secondary text-white animate-pulse-step': currentStep === index + 1,
                'bg-primary dark:bg-secondary text-white': currentStep > index + 1,
                'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300': currentStep < index + 1,
              }"
              :aria-current="currentStep === index + 1 ? 'step' : undefined"
              :aria-label="`Paso ${index + 1}: ${step.label}`"
            >
              <span v-if="currentStep <= index + 1">{{ index + 1 }}</span>
              <i v-else class="fa-solid fa-check"></i>
            </div>
            <div v-if="index < steps.length - 1" class="w-6 h-1 bg-gray-200 dark:bg-gray-600">
              <div
                class="h-full transition-all duration-300"
                :class="currentStep > index + 1 ? 'bg-primary dark:bg-secondary' : 'bg-gray-200 dark:bg-gray-600'"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido del formulario -->
      <div class="space-y-6">
        <!-- Paso 1: Aceptar términos -->
        <div v-if="currentStep === 1">
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            Con Voir Premium, disfruta de creación ilimitada de grupos y eventos, acceso a contenido exclusivo y soporte prioritario. Para procesar tu suscripción, recopilaremos tu nombre, correo electrónico y datos de pago, protegidos bajo nuestra <a href="/privacy" target="_blank" class="underline text-primary dark:text-secondary hover:text-primary-darker dark:hover:text-secondary-darker">política de privacidad</a>.
          </p>
          <div class="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="terms"
              v-model="acceptedTerms"
              class="w-4 h-4 text-primary dark:text-secondary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-secondary focus:ring-2"
              aria-label="Aceptar términos y condiciones"
              :aria-invalid="!acceptedTerms"
            />
            <label for="terms" class="text-sm text-gray-600 dark:text-gray-400">
              He leído y acepto los <a href="/terms" target="_blank" class="underline text-primary dark:text-secondary hover:text-primary-darker dark:hover:text-secondary-darker">términos y condiciones</a> y la <a href="/privacy" target="_blank" class="underline text-primary dark:text-secondary hover:text-primary-darker dark:hover:text-secondary-darker">política de privacidad</a>.
            </label>
          </div>
          <p v-if="!acceptedTerms && showValidationError" class="text-red-500 text-sm">
            Debes aceptar los términos para continuar.
          </p>
        </div>

        <!-- Paso 2: Seleccionar plan -->
        <div v-if="currentStep === 2">
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            Elige tu plan de facturación para Voir Premium y desbloquea todas las funciones exclusivas.
          </p>
          <div class="flex justify-center items-center gap-4 mb-4">
            <button
              @click="isAnnual = !isAnnual"
              class="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
              :aria-label="isAnnual ? 'Cambiar a plan mensual' : 'Cambiar a plan anual'"
            >
              <span class="text-sm font-medium">{{ isAnnual ? 'Anual' : 'Mensual' }}</span>
              <i :class="['fa-solid', isAnnual ? 'fa-toggle-on' : 'fa-toggle-off', 'text-lg']"></i>
            </button>
            <p class="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {{ isAnnual ? '$59.99/año' : '$5.99/mes' }}
              <span v-if="isAnnual" class="text-sm font-normal text-gray-500 dark:text-gray-400">~ $5/mes, ahorra 16%</span>
            </p>
          </div>
          <p class="text-gray-600 dark:text-gray-400 text-sm text-center">
            Total a pagar: <span class="font-semibold">{{ isAnnual ? '$59.99' : '$5.99' }}</span>
          </p>
        </div>

        <!-- Paso 3: Confirmación -->
        <div v-if="currentStep === 3" class="text-center">
          <i class="fa-solid fa-check-circle text-4xl text-green-500 mb-4"></i>
          <p class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            ¡Suscripción confirmada!
          </p>
          <p class="text-gray-600 dark:text-gray-400">
            Has seleccionado el plan {{ isAnnual ? 'anual ($59.99)' : 'mensual ($5.99)' }}. El modal se cerrará en breve.
          </p>
        </div>
      </div>

      <!-- Botones de navegación -->
      <div v-if="currentStep < 3" class="flex justify-between gap-3 mt-6">
        <button
          v-if="currentStep === 1"
          type="button"
          @click="emit('close')"
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
          aria-label="Cancelar suscripción"
        >
          <i class="fa-solid fa-times"></i>
          <p class="hidden md:block">Cancelar</p>
        </button>
        <button
          v-if="currentStep === 2"
          type="button"
          @click="previousStep"
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
          aria-label="Volver al paso anterior"
        >
          <i class="fa-solid fa-arrow-left"></i>
          <p class="hidden md:block">Atrás</p>
        </button>
        <div class="flex-grow"></div>
        <button
          type="button"
          @click="nextStep"
          :disabled="currentStep === 1 && !acceptedTerms"
          class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-lg hover:bg-primary/90 dark:hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          :aria-label="currentStep === 1 ? 'Siguiente paso' : 'Confirmar plan'"
        >
          <p class="hidden md:block">{{ currentStep === 1 ? 'Siguiente' : 'Confirmar' }}</p>
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  initialPlan: {
    type: String,
    default: 'monthly',
  },
});

const emit = defineEmits(['close', 'confirm']);

const modalRef = ref(null);
const currentStep = ref(1);
const acceptedTerms = ref(false);
const isAnnual = ref(props.initialPlan === 'annual');
const showValidationError = ref(false);
const steps = ref([
  { label: 'Términos' },
  { label: 'Plan' },
  { label: 'Confirmación' },
]);

// Auto-close modal after 1 second on confirmation step
watch(currentStep, (newStep) => {
  if (newStep === 3) {
    setTimeout(() => {
      emit('confirm', isAnnual.value ? 'annual' : 'monthly');
      emit('close');
    }, 1000);
  }
});

// Block/unblock background scroll
watch(() => props.visible, (newValue) => {
  if (newValue) {
    document.body.classList.add('overflow-hidden');
  } else {
    document.body.classList.remove('overflow-hidden');
  }
});

function nextStep() {
  if (currentStep.value === 1 && !acceptedTerms.value) {
    showValidationError.value = true;
    return;
  }
  if (currentStep.value < steps.value.length) {
    currentStep.value += 1;
  }
}

function previousStep() {
  if (currentStep.value > 1) {
    currentStep.value -= 1;
  }
}

onMounted(() => {
  nextTick(() => {
    if (modalRef.value) {
      modalRef.value.focus();
    }
  });
});
</script>

<style scoped>
/* Modal transition */
.fixed {
  transition: opacity 0.3s ease-in-out;
}

/* Pulse animation for active step */
@keyframes pulseStep {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.animate-pulse-step {
  animation: pulseStep 1s infinite;
}

/* Custom scrollbar */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
</style>