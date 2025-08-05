<template>
  <main class="flex-grow max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
    <!-- Hero Section -->
    <section class="text-center mb-12">
      <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-300">
        ¡Haz la Diferencia para las Mascotas con Premium!
      </h1>
      <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6 transition-colors duration-300">
        Únete a la comunidad Premium de Voir y accede a herramientas exclusivas y conocimiento para cuidar mejor a tus mascotas, promover adopciones responsables y ayudar a todos los animales a encontrar un hogar lleno de amor.
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
        ¡Empodera el Bienestar Animal con Premium!
      </h3>
      <p class="text-left text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-6 transition-colors duration-300">
        Por solo {{ isAnnual ? '$59999/año (~$5999/mes)' : '$5999/mes' }}, obtén herramientas exclusivas para educarte, conectar con otros amantes de las mascotas y promover adopciones responsables. ¡Haz una diferencia para todas las mascotas!
      </p>
      <button
        @click="openSubscriptionModal"
        class="inline-flex items-center gap-2 bg-primary hover:bg-primary-darker dark:bg-secondary dark:hover:bg-secondary-darker text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary"
        :disabled="hasPendingSubscription"
        :class="{ 'opacity-50 cursor-not-allowed': hasPendingSubscription, 'hover:transform hover:-translate-y-1' : !hasPendingSubscription }"
        aria-label="Suscribirse al plan Premium"
      >
        <i class="fa-solid fa-crown text-yellow-200"></i>
        Suscribirse a Premium
      </button>
      <p v-if="hasPendingSubscription" class="text-sm text-primary dark:text-secondary mt-4">
        Tu solicitud de suscripción está en proceso.
      </p>
    </section>

    <!-- Community Benefits -->
    <section class="text-center">
      <h3 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-300">
        Sé Parte de la Comunidad que Cuida a las Mascotas
      </h3>
      <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto transition-colors duration-300">
        Con Voir Premium, liderarás una comunidad dedicada al bienestar animal. Crea grupos y eventos ilimitados, comparte conocimiento a través de blogs premium y ayuda a que más mascotas encuentren un hogar amoroso.
      </p>
    </section>

    <!-- Donation Section -->
    <section class="mt-8 md:mt-16 p-6 sm:p-8 bg-gradient-to-r from-primary to-primary/80 dark:from-secondary dark:to-secondary/80 text-white rounded-2xl flex flex-col md:flex-row items-center justify-between shadow-2xl" aria-labelledby="donation-promo-title">
      <div class="text-center md:text-left mb-6 md:mb-0 max-w-xl">
        <h2 id="donation-promo-title" class="text-2xl md:text-3xl font-bold font-dosis flex items-center justify-center md:justify-start">
          <i class="fas fa-heart text-2xl mr-2" aria-hidden="true"></i>
          ¡Apoya a nuestra comunidad!
        </h2>
        <p class="mt-2 text-lg text-white/90 dark:text-white/80">
          Tu donación mantiene viva la misión de Voir: conectar mascotas con familias, promover adopciones responsables y crear un espacio para los amantes de los animales. ¡Cada aporte hace la diferencia!
        </p>
      </div>
      <router-link
        to="/donate"
        class="px-6 py-3 bg-white text-primary dark:text-secondary font-bold rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors duration-200 transition-transform transform hover:scale-105 shrink-0"
        aria-label="Dona para apoyar a la comunidad de Voir"
      >
        Dona Ahora
      </router-link>
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../api/auth/useAuth';
import { useThemeStore } from '../stores/theme';
import SubscriptionModal from '../components/molecules/SubcriptionModal.vue';
import { useSubscriptionRequests } from '../composable/useSubscriptionRequest';

// Ensure user is authenticated and not subscribed
const { isAuthenticated, user } = useAuth();
const router = useRouter();
const themeStore = useThemeStore();
const isAnnual = ref(false);
const showSubscriptionModal = ref(false);
const hasPendingSubscription = ref(false);
// Redirect to login if not authenticated, or to feed if already subscribed
if (!isAuthenticated.value) {
  router.push('/login');
} else if (user.value?.isSubscribed) {
  router.push('/feed');
}

function openSubscriptionModal() {
  showSubscriptionModal.value = true;
}

async function handleSubscriptionConfirm(plan) {
  showSubscriptionModal.value = false;
  hasPendingSubscription.value = true;
}
onMounted(async () => {
  const { hasPendingRequest } = useSubscriptionRequests();
  hasPendingSubscription.value = await hasPendingRequest(user.value?.uid);
});
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