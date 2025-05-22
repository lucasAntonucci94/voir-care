<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Columna izquierda: Detalles y Mapa -->
    <div class="lg:col-span-2 space-y-6">
      <!-- Card de Detalles -->
      <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 class="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Detalles</h2>
        <ul class="space-y-4 text-gray-600 dark:text-gray-300">
          <li class="flex items-center gap-3">
            <i class="fas fa-edit text-primary dark:text-secondary text-xl"></i>
            <span><strong>Descripción:</strong> {{ event.description || 'Sin descripción' }}</span>
          </li>
          <li class="flex items-center gap-3">
            <i class="fas fa-calendar-alt text-primary dark:text-secondary text-xl"></i>
            <span><strong>Inicio:</strong> {{ formatTimestamp(event.startTime, { includeTime: true }) }}</span>
          </li>
          <li class="flex items-center gap-3">
            <i class="fas fa-calendar-alt text-primary dark:text-secondary text-xl"></i>
            <span><strong>Fin:</strong> {{ formatTimestamp(event.endTime, { includeTime: true }) }}</span>
          </li>
          <li class="flex items-center gap-3">
            <i class="fas fa-map-marker-alt text-primary dark:text-secondary text-xl"></i>
            <span><strong>Ubicación:</strong> {{ event.location?.address || 'No definida' }}</span>
          </li>
          <li v-if="event.price" class="flex items-center gap-3">
            <i class="fas fa-dollar-sign text-primary dark:text-secondary text-xl"></i>
            <span><strong>Precio:</strong> ${{ event.price }}</span>
          </li>
          <li class="flex items-center gap-3">
            <i class="fas fa-users text-primary dark:text-secondary text-xl"></i>
            <span><strong>Capacidad:</strong> {{ event.capacity - (event?.attendees?.going?.length || 0) || 'Ilimitada' }}</span>
          </li>
          <li class="flex items-center gap-3">
            <i class="fas fa-lock text-primary dark:text-secondary text-xl"></i>
            <span><strong>Privacidad:</strong> {{ event.privacy || 'Público' }}</span>
          </li>
          <li class="flex items-center gap-3" v-if="event.modality === 0 || event.modality === 1">
            <i class="fas fa-lock text-primary dark:text-secondary text-xl"></i>
            <span><strong>Modalidad:</strong> {{ event.modality === 0 ? 'Presencial' : 'Virtual' }}</span>
          </li>
        </ul>
      </div>

      <!-- Mapa -->
      <div v-if="event.location?.address" class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 class="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Ubicación</h2>
        <div class="w-full h-50 sm:h-90 rounded-lg overflow-hidden">
          <iframe
            class="w-full h-full"
            :src="`https://www.google.com/maps/embed/v1/place?q=${encodeURIComponent(event.location.address)}&key=AIzaSyDbCImtrddG3Zm7roBIeYMWug-rsfoCH7c`"
            allowfullscreen
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>

    <!-- Columna derecha: Boletos, Organizador, Asistentes -->
    <div class="space-y-6">
      <!-- Card de Acciones -->
      <section
        v-if="!isAdmin && !isGoing"
        class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <h2 class="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100 sr-only">Acciones</h2>
        <div class="flex flex-col gap-3">
          <button
            v-if="user"
            @click="handleAttendance"
            class="w-full px-4 py-2 text-white rounded-md shadow-sm focus:outline-none transition-colors duration-200 flex items-center justify-center gap-2"
            :class="isGoing ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'"
          >
            <i
              :class="isGoing ? 'fas fa-check-circle' : 'fas fa-plus-circle'"
              class="text-white text-sm"
            ></i>
            {{ isGoing ? 'Salir del evento' : 'Unirme al evento' }}
          </button>
        </div>
      </section>

      <!-- Card de Boletos -->
      <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Boletos</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Por show agotado, y a pedido del público: Nueva función. ¡No te quedes sin tu entrada!
        </p>
        <a
          :href="event.ticketLink"
          target="_blank"
          rel="nofollow noreferrer"
          class="inline-block px-4 py-2 bg-primary hover:bg-primary-md dark:bg-secondary dark:hover:bg-secondary-md text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary transition-colors duration-200"
          :disabled="!event.ticketLink"
        >
          Buscar boletos
        </a>
      </div>

     <!-- Card de Conoce al organizador -->
      <div class="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
        <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Conoce al organizador</h2>
        <div class="flex justify-between items-center gap-4">
          <div class="flex items-center gap-4">
            <img
              :src="ownerDetails?.photoURLFile || imageToDelete"
              :alt="`Foto de ${ownerDetails?.displayName || 'Organizador'}`"
              class="w-12 h-12 rounded-full object-cover"
              loading="lazy"
            />
            <div>
              <router-link
                :to="ownerDetails?.email ? `/profile/${ownerDetails.email}` : '#'"
                class="text-lg font-semibold text-primary dark:text-secondary hover:underline"
                :title="`Ver perfil de ${ownerDetails?.displayName || 'Organizador'}`"
              >
                {{ ownerDetails?.displayName || 'Organizador' }}
              </router-link>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ ownerDetails?.email || '' }}
              </p>
            </div>
          </div>
          <button
            @click="SendMessage(ownerDetails?.email)"
            class="flex items-center gap-2 px-4 py-2 text-sm bg-primary dark:bg-secondary text-white rounded-lg shadow-sm hover:bg-primary-md dark:hover:bg-secondary-md transition-colors duration-200"
            :disabled="!ownerDetails?.email"
            aria-label="Enviar mensaje al organizador"
          >
            <i class="fas fa-envelope"></i>
            <!-- Enviar mensaje -->
          </button>
        </div>
      </div>

      <!-- Lista de Asistentes -->
      <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100">Invitados</h2>
          <button
            @click="switchToParticipants"
            class="text-sm text-primary dark:text-secondary hover:underline"
          >
            Ver todos
          </button>
        </div>

        <!-- Resumen: Asistirán e Interesados -->
        <div class="flex flex-col gap-4 mb-6">
          <button
            class="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            <span class="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {{ event?.attendees?.going?.length || 0 }}
            </span>
            <span class="text-sm text-gray-600 dark:text-gray-400">Asistirán</span>
          </button>
          <button
            class="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            <span class="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {{ event?.attendees?.interested?.length || 0 }}
            </span>
            <span class="text-sm text-gray-600 dark:text-gray-400">Interesados</span>
          </button>
        </div>

        <!-- Separador -->
        <div class="border-t border-gray-200 dark:border-gray-700 mb-6"></div>

        <!-- Lista de asistentes -->
        <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Asistirán</h3>
        <div v-if="attendeesLoading" class="text-center text-gray-500 dark:text-gray-400 text-sm">
          Cargando asistentes...
        </div>
        <ul v-else-if="attendeesDetails.length" class="space-y-4">
          <li v-for="attendee in attendeesDetails.slice(0, 3)" :key="attendee.id" class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <img
                :src="attendee.photoURLFile || imageToDelete"
                alt="Asistente"
                class="w-10 h-10 rounded-full object-cover"
              />
              <span class="text-sm text-gray-600 dark:text-gray-300">
                {{ attendee.displayName || 'Anónimo' }}
              </span>
            </div>
            <router-link
              :to="attendee.email ? `/profile/${attendee.email}` : '#'"
              class="p-2 text-primary dark:text-secondary hover:bg-primary-md dark:hover:bg-secondary-md rounded-lg"
              title="Ver perfil"
            >
              <i class="fa-solid fa-arrow-right fa-lg"></i>
            </router-link>
          </li>
        </ul>
        <p v-else class="text-sm text-gray-600 dark:text-gray-400">
          No hay asistentes confirmados aún.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import imageToDelete from '../../assets/avatar1.jpg';
import { formatTimestamp } from '../../utils/formatTimestamp';
import { computed } from 'vue';
import { useAuth } from '../../api/auth/useAuth';
import { usePrivateChatsStore } from '../../stores/privateChats';
import { usePrivateChats } from '../../composable/usePrivateChats';
import { useRouter } from 'vue-router';

const props = defineProps({
  event: { type: Object, required: true },
  ownerDetails: { type: Object, required: true },
  attendeesDetails: { type: Array, required: true },
  attendeesLoading: { type: Boolean, required: true },
  switchToParticipants: { type: Function, required: true },
  isGoing: { type: Boolean, required: true },
  handleAttendance: { type: Function, required: true },
});

const router = useRouter();
const { user } = useAuth();
const { getChatIdByReference } = usePrivateChats();
const privateChatsStore = usePrivateChatsStore();
 
const isAdmin = computed(() => props.event.ownerId === user.value?.uid || false);


// Handle connection selection and chat creation
const SendMessage = async (toEmail) => {
  debugger
  if (!user.value?.email || !toEmail) return;

  try {
    const chatId = await getChatIdByReference(user.value.email, toEmail);
    privateChatsStore.setSelectedChatId(chatId);
    privateChatsStore.setFromEmail(user.value.email);
    privateChatsStore.setToEmail(toEmail);
    router.push('/chats');
  } catch (error) {
    console.error('Error creating/opening chat:', error);
  }
};
</script>

<style scoped>
.shadow-lg {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* Estilo para el mapa */
iframe {
  border: 0;
}

@media (max-width: 640px) {
  .text-2xl {
    font-size: 1.25rem;
  }
  .text-xl {
    font-size: 1.125rem;
  }
}
</style>