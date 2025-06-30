<template>
  <main class="flex-grow max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
    <!-- Hero Section -->
    <section class="text-center mb-12">
      <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-300">
        ¡Únete a la Comunidad Premium!
      </h1>
      <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6 transition-colors duration-300">
        Potencia tu experiencia en Voir con funciones exclusivas, mayor libertad creativa y acceso a contenido premium. ¡Conecta, crea y comparte como nunca antes!
      </p>
      <!-- Pricing Display -->
      <div class="flex justify-center items-center gap-4 mb-8">
        <button
          @click="isAnnual = !isAnnual"
          class="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
          :aria-label="isAnnual ? 'Cambiar a plan mensual' : 'Cambiar a plan anual'"
        >
          <span class="text-sm font-medium">{{ isAnnual ? 'Anual' : 'Mensual' }}</span>
          <i :class="['fa-solid', isAnnual ? 'fa-toggle-on' : 'fa-toggle-off', 'text-lg']"></i>
        </button>
        <p class="text-3xl font-bold text-primary dark:text-secondary">
          {{ isAnnual ? '$59999/año' : '$5999/mes' }}
          <span v-if="isAnnual" class="text-sm font-normal text-gray-500 dark:text-gray-400">~ $5999/mes, ahorra 16%</span>
        </p>
      </div>
    </section>

    <!-- Comparison Table -->
    <section class="mb-12">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th class="py-4 px-6 text-lg font-semibold text-gray-900 dark:text-gray-100">Funcionalidad</th>
              <th class="py-4 px-6 text-lg font-semibold text-gray-900 dark:text-gray-100 text-center">Básico (Gratis)</th>
              <th class="py-4 px-6 text-lg font-semibold text-gray-900 dark:text-gray-100 text-center relative">
                <i class="fa-solid fa-crown text-yellow-500 mr-2"></i>Premium
                <span class="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded-full">Recomendado</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <td class="py-3 px-6 text-gray-800 dark:text-gray-200">Creación de grupos por mes</td>
              <td class="py-3 px-6 text-center text-gray-600 dark:text-gray-400">1</td>
              <td class="py-3 px-6 text-center text-gray-800 dark:text-gray-200"><i class="fa-solid fa-check text-green-500 mr-2"></i>Ilimitado</td>
            </tr>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <td class="py-3 px-6 text-gray-800 dark:text-gray-200">Creación de eventos por mes</td>
              <td class="py-3 px-6 text-center text-gray-600 dark:text-gray-400">1</td>
              <td class="py-3 px-6 text-center text-gray-800 dark:text-gray-200"><i class="fa-solid fa-check text-green-500 mr-2"></i>Ilimitado</td>
            </tr>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <td class="py-3 px-6 text-gray-800 dark:text-gray-200">Posts en feed, grupos y eventos</td>
              <td class="py-3 px-6 text-center text-gray-600 dark:text-gray-400"><i class="fa-solid fa-check text-green-500 mr-2"></i>Ilimitado</td>
              <td class="py-3 px-6 text-center text-gray-800 dark:text-gray-200"><i class="fa-solid fa-check text-green-500 mr-2"></i>Ilimitado</td>
            </tr>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <td class="py-3 px-6 text-gray-800 dark:text-gray-200">Creación de Reels</td>
              <td class="py-3 px-6 text-center text-gray-600 dark:text-gray-400"><i class="fa-solid fa-check text-green-500 mr-2"></i>Ilimitado</td>
              <td class="py-3 px-6 text-center text-gray-800 dark:text-gray-200"><i class="fa-solid fa-check text-green-500 mr-2"></i>Ilimitado</td>
            </tr>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <td class="py-3 px-6 text-gray-800 dark:text-gray-200">Acceso a blogs</td>
              <td class="py-3 px-6 text-center text-gray-600 dark:text-gray-400">Gratuitos</td>
              <td class="py-3 px-6 text-center text-gray-800 dark:text-gray-200"><i class="fa-solid fa-check text-green-500 mr-2"></i>Gratuitos + Premium</td>
            </tr>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <td class="py-3 px-6 text-gray-800 dark:text-gray-200">Vista de mapa</td>
              <td class="py-3 px-6 text-center text-gray-600 dark:text-gray-400">Solo visualización</td>
              <td class="py-3 px-6 text-center text-gray-800 dark:text-gray-200"><i class="fa-solid fa-check text-green-500 mr-2"></i>Crear pines ilimitados</td>
            </tr>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <td class="py-3 px-6 text-gray-800 dark:text-gray-200">Vista de Reels e Historias</td>
              <td class="py-3 px-6 text-center text-gray-600 dark:text-gray-400">Reels gratuitos</td>
              <td class="py-3 px-6 text-center text-gray-800 dark:text-gray-200"><i class="fa-solid fa-check text-green-500 mr-2"></i>Reels + Historias Premium</td>
            </tr>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <td class="py-3 px-6 text-gray-800 dark:text-gray-200">Mensajería privada</td>
              <td class="py-3 px-6 text-center text-gray-600 dark:text-gray-400"><i class="fa-solid fa-check text-green-500 mr-2"></i>Ilimitada</td>
              <td class="py-3 px-6 text-center text-gray-800 dark:text-gray-200"><i class="fa-solid fa-check text-green-500 mr-2"></i>Ilimitada</td>
            </tr>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <td class="py-3 px-6 text-gray-800 dark:text-gray-200">Soporte ChatBot FAQs</td>
              <td class="py-3 px-6 text-center text-gray-600 dark:text-gray-400"><i class="fa-solid fa-check text-green-500 mr-2"></i>Incluido</td>
              <td class="py-3 px-6 text-center text-gray-800 dark:text-gray-200"><i class="fa-solid fa-check text-green-500 mr-2"></i>Incluido</td>
            </tr>
            <tr>
              <td class="py-3 px-6 text-gray-800 dark:text-gray-200">Soporte prioritario</td>
              <td class="py-3 px-6 text-center text-gray-600 dark:text-gray-400"><i class="fa-solid fa-times text-red-500 mr-2"></i>No incluido</td>
              <td class="py-3 px-6 text-center text-gray-800 dark:text-gray-200"><i class="fa-solid fa-check text-green-500 mr-2"></i>Incluido</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="text-center mb-12">
      <h3 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-300">
        ¡Da el salto a Premium hoy!
      </h3>
      <p class="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-6 transition-colors duration-300">
        Desbloquea todo el potencial de nuestra comunidad por solo {{ isAnnual ? '$59999/año (~$5999/mes)' : '$5999/mes' }}. ¡Crea sin límites y accede a contenido exclusivo!
      </p>
      <button
        @click="openSubscriptionModal"
        class="inline-flex items-center gap-2 bg-primary hover:bg-primary-darker dark:bg-secondary dark:hover:bg-secondary-darker text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary"
        aria-label="Suscribirse al plan Premium"
      >
        <i class="fa-solid fa-crown text-yellow-200"></i>
        Suscribirse a Premium
      </button>
    </section>

    <!-- Community Benefits -->
    <section class="text-center">
      <h3 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-300">
        Únete a una Comunidad Activa y Consciente
      </h3>
      <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto transition-colors duration-300">
        Voir está diseñado para conectar personas con ideas afines, fomentar la creatividad y promover interacciones significativas. Con Premium, obtienes herramientas para liderar y participar activamente en nuestra comunidad.
      </p>
    </section>

    <!-- Subscription Modal -->
    <SubscriptionModal
      :visible="showSubscriptionModal"
      :initial-plan="isAnnual ? 'annual' : 'monthly'"
      @close="showSubscriptionModal = false"
      @confirm="handleSubscriptionConfirm"
    />
  </main>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../api/auth/useAuth';
import { useThemeStore } from '../stores/theme';
import SubscriptionModal from '../components/molecules/SubcriptionModal.vue';

// Ensure user is authenticated and not subscribed
const { isAuthenticated, user } = useAuth();
const router = useRouter();
const themeStore = useThemeStore();
const isAnnual = ref(false);
const showSubscriptionModal = ref(false);

// Redirect to login if not authenticated, or to feed if already subscribed
if (!isAuthenticated.value) {
  router.push('/login');
} else if (user.value?.isSubscribed) {
  router.push('/feed');
}

function openSubscriptionModal() {
  showSubscriptionModal.value = true;
}

function handleSubscriptionConfirm(plan) {
  showSubscriptionModal.value = false;
}
</script>

<style scoped>
/* Smooth scrollbar for table overflow */
.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

/* Hover and focus effects for buttons */
button:hover {
  transform: translateY(-1px);
}

button:focus {
  outline: none;
}
</style>