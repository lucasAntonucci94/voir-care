<template>
  <section class="mt-2 md:mt-4 p-6 sm:px-8 bg-gray-50 dark:bg-gray-900" aria-labelledby="donation-methods-title">
    <div class="max-w-4xl mx-auto">
      <h1 id="donation-methods-title" class="text-3xl md:text-4xl font-bold font-dosis text-gray-800 dark:text-gray-100 mb-6 text-center">
        <i class="fas fa-paw text-2xl mr-2" aria-hidden="true"></i>
        Formas de apoyar a Voir
      </h1>
      <p class="text-lg text-gray-600 dark:text-gray-300 mb-8 text-center">
        ¡Ayúdanos a seguir conectando mascotas con sus familias! Elige un método de donación y copia el alias para transferir.
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- MercadoPago -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 flex flex-col items-center text-center transition-transform hover:scale-105">
          <i class="fas fa-credit-card text-4xl text-primary dark:text-secondary mb-4" aria-hidden="true"></i>
          <!-- Replace with <img src="/path/to/mercadopago-logo.png" alt="MercadoPago Logo" class="w-16 h-16 mb-4"> when you have the logo -->
          <h3 class="text-xl font-semibold font-dosis text-gray-800 dark:text-gray-100 mb-2">MercadoPago</h3>
          <p class="text-gray-600 dark:text-gray-300 mb-4">Alias: <span class="font-mono">voir.mascotas.mp</span></p>
          <button
            @click="copyToClipboard('voir.mascotas.mp', 'MercadoPago')"
            class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-full hover:bg-primary/80 dark:hover:bg-secondary/80 transition-colors duration-200 flex items-center"
            :aria-label="`Copiar alias de MercadoPago: voir.mascotas.mp`"
          >
            <i class="fas fa-copy mr-2" aria-hidden="true"></i>
            {{ copiedMethod === 'MercadoPago' ? '¡Copiado!' : 'Copiar Alias' }}
          </button>
        </div>
        <!-- Bank Account -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 flex flex-col items-center text-center transition-transform hover:scale-105">
          <i class="fas fa-university text-4xl text-primary dark:text-secondary mb-4" aria-hidden="true"></i>
          <!-- Replace with <img src="/path/to/bank-logo.png" alt="Bank Account Logo" class="w-16 h-16 mb-4"> when you have the logo -->
          <h3 class="text-xl font-semibold font-dosis text-gray-800 dark:text-gray-100 mb-2">Transferencia Bancaria</h3>
          <p class="text-gray-600 dark:text-gray-300 mb-4">Alias: <span class="font-mono">voir.banco</span></p>
          <button
            @click="copyToClipboard('voir.banco', 'Bank Account')"
            class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-full hover:bg-primary/80 dark:hover:bg-secondary/80 transition-colors duration-200 flex items-center"
            :aria-label="`Copiar alias de Transferencia Bancaria: voir.banco`"
          >
            <i class="fas fa-copy mr-2" aria-hidden="true"></i>
            {{ copiedMethod === 'Bank Account' ? '¡Copiado!' : 'Copiar Alias' }}
          </button>
        </div>
        <!-- Cafecito -->
        <!-- <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 flex flex-col items-center text-center transition-transform hover:scale-105">
          <i class="fas fa-coffee text-4xl text-primary dark:text-secondary mb-4" aria-hidden="true"></i>
          <h3 class="text-xl font-semibold font-dosis text-gray-800 dark:text-gray-100 mb-2">Cafecito</h3>
          <p class="text-gray-600 dark:text-gray-300 mb-4">Dona directamente en nuestra página de Cafecito</p>
          <router-link
            to="/donate"
            class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-full hover:bg-primary/80 dark:hover:bg-secondary/80 transition-colors duration-200 flex items-center"
            aria-label="Donar un cafecito para apoyar a Voir"
          >
            <i class="fas fa-coffee mr-2" aria-hidden="true"></i>
            Donar un Cafecito
          </router-link>
        </div> -->
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';

const copiedMethod = ref(null);

const copyToClipboard = (text, method) => {
  navigator.clipboard.writeText(text).then(() => {
    copiedMethod.value = method;
    setTimeout(() => {
      copiedMethod.value = null;
    }, 2000); // Reset after 2 seconds
  });
};
</script>

<style scoped>
/* Animation for card hover */
.transition-transform {
  transition: transform 0.2s ease;
}

/* Scrollbar styles for consistency */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(155, 155, 155, 0.5);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

/* Fade animation for content */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>