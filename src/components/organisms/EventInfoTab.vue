<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Columna izquierda: Detalles y Mapa -->
    <div class="lg:col-span-2 space-y-6">
      <!-- Card de Detalles -->
      <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 class="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Detalles</h2>
        <ul class="space-y-4 text-gray-600 dark:text-gray-300">
          <li class="flex items-start gap-3">
            <i class="fas fa-edit text-primary dark:text-secondary text-xl"></i>
            <span><strong>Descripción:</strong> {{ event.description || 'Sin descripción' }}</span>
          </li>
          <li class="flex items-start gap-3">
            <i class="fas fa-calendar-alt text-primary dark:text-secondary text-xl"></i>
            <span><strong>Inicio:</strong> {{ formatTimestamp(event.startTime, { includeTime: true }) }}</span>
          </li>
          <li class="flex items-start gap-3">
            <i class="fas fa-calendar-alt text-primary dark:text-secondary text-xl"></i>
            <span><strong>Fin:</strong> {{ formatTimestamp(event.endTime, { includeTime: true }) }}</span>
          </li>
          <li class="flex items-start gap-3">
            <i class="fas fa-map-marker-alt text-primary dark:text-secondary text-xl"></i>
            <span><strong>Ubicación:</strong> {{ event.location?.address || 'No definida' }}</span>
          </li>
          <li v-if="event.price" class="flex items-start gap-3">
            <i class="fas fa-dollar-sign text-primary dark:text-secondary text-xl"></i>
            <span><strong>Precio:</strong> ${{ event.price }}</span>
          </li>
          <li class="flex items-start gap-3">
            <i class="fas fa-users text-primary dark:text-secondary text-xl"></i>
            <!-- <span><strong>Capacidad:</strong> {{ event.capacity - (event?.attendees?.going?.length || 0) || 'Ilimitada' }}</span> -->
            <span><strong>Capacidad:</strong> {{ event.capacity - (event?.attendees?.going && event?.attendees?.going?.length ? event.attendees.going.length - 1 : 0) || 0 }}</span>
          </li>
          <li class="flex items-start gap-3">
            <i class="fas fa-lock text-primary dark:text-secondary text-xl"></i>
            <span><strong>Privacidad:</strong> {{ event.privacy ??  event.privacy === 'public' ? 'Público' : 'Privado'  }}</span>
          </li>
          <li class="flex items-start gap-3" v-if="event.modality === 0 || event.modality === 1">
            <i :class="event.modality === 0 ? 'fa-solid fa-location-dot' : 'fa-solid fa-video'" class="fas fa-modality text-primary dark:text-secondary text-xl"></i>
            <span><strong>Modalidad:</strong> {{ event.modality === 0 ? 'Presencial' : 'Virtual' }}</span>
          </li>
          <li class="flex items-start gap-3" v-if="event.modality === 1 && event.meetLink">
            <i class="fas fa-link text-primary dark:text-secondary text-xl"></i>
            <span><strong>Link:</strong> {{ event.meetLink }}</span>
          </li>
        </ul>
      </div>

      <!-- Mapa -->
      <div v-if="event.modality === 0 && event.location?.address" class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
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
        v-if="!isAdmin && !isGoing && event?.attendees?.going && (event.capacity - (event?.attendees?.going && event?.attendees?.going?.length ? event.attendees.going.length - 1 : 0) || 0)"
        class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <h2 class="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100 sr-only">Acciones</h2>
        <div class="flex flex-col gap-3">
          <button
            v-if="user"
            @click="handleAttendance"
            class="w-full px-4 py-2 text-white rounded-md shadow-sm focus:outline-none transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
            :class="isGoing ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'"
          >
            <i
              :class="isGoing ? 'fas fa-check-circle' : 'fas fa-plus-circle'"
              class="text-white text-sm"
            ></i>
            {{ isGoing ? 'Salir' : 'Unirme' }}
          </button>
        </div>
      </section>

      <!-- Card de Boletos -->
      <div v-if="isSuscribed" class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <i class="fas fa-ticket-alt text-primary dark:text-secondary"></i> Boletos
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 italic">
          ¡Show agotado! Nueva función a pedido del público. ¡Asegura tu entrada ahora!
        </p>
        <a
          :href="event.ticketLink"
          target="_blank"
          rel="nofollow noreferrer"
          class="inline-flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary-md dark:bg-secondary dark:hover:bg-secondary-md text-white rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary transition-all duration-300 cursor-pointer"
          :disabled="!event.ticketLink"
        >
          <i class="fas fa-ticket"></i>
          <span>Boletos</span>
        </a>
      </div>

     <!-- Card de Conoce al organizador -->
      <div class="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
        <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Conoce al organizador</h2>
        <div class="flex justify-between items-center gap-4">
          <div class="flex items-center gap-4">
            <img
              :src="ownerDetails?.photoURLFile || AvatarDefault"
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
            v-if="ownerDetails?.email !== user?.email"
            @click="SendMessage(ownerDetails?.email)"
            class="flex items-center gap-2 px-4 py-2 text-sm bg-primary dark:bg-secondary text-white rounded-lg shadow-sm hover:bg-primary-md dark:hover:bg-secondary-md transition-colors duration-200 cursor-pointer"
            :disabled="!ownerDetails?.email"
            aria-label="Enviar mensaje al organizador"
          >
            <i class="fas fa-envelope"></i>
            <!-- Enviar mensaje -->
          </button>
        </div>
      </div>

     <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <!-- Header with Title and Invite Button -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <i class="fas fa-users"></i> Invitados
          </h2>
          <button
            class="w-auto px-4 py-2 bg-primary dark:bg-secondary text-white rounded-md shadow-sm hover:bg-primary-md dark:hover:bg-secondary-md transition-colors duration-200 flex items-center gap-2 cursor-pointer"
            @click="openInviteFriendsModal"
          >
            <i class="fas fa-user-plus"></i> <span class="hidden md:block">Invitar</span>
          </button>
        </div>

       <!-- Combined Count and View All Section -->
        <div class="flex items-center justify-between mb-6 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div class="flex items-center gap-2">
            <span class="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
              <i class="fas fa-check-circle mr-2"></i>  {{ (event?.attendees?.going && event?.attendees?.going?.length ? event.attendees.going.length - 1 : 0) || 0 }}
            </span>
            <span class="text-sm text-gray-600 dark:text-gray-400">Confirmados</span>
          </div>
          <button
            @click="switchToParticipants"
            class="text-sm text-primary dark:text-secondary hover:text-primary-md dark:hover:text-secondary-md flex items-center gap-1 cursor-pointer"
          >
            <span class="flex items-center justify-center w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full opacity-80 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
              <i class="fas fa-eye text-primary dark:text-secondary"></i>
            </span>
            <span class="hidden md:block">Ver todos</span>
          </button>
        </div>

        <!-- Attendee List Section -->
        <div class="mb-6">
          <ul v-if="attendeesDetails.length" class="space-y-3">
            <li v-for="attendee in attendeesDetails.slice(0, 3)" :key="attendee.id" class="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition">
              <div class="flex items-center gap-3">
                <img
                  :src="attendee.photoURLFile || AvatarDefault"
                  alt="Asistente"
                  class="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300">
                  {{ attendee.displayName || 'Anónimo' }}
                </span>
              </div>
              <router-link
                :to="attendee.email ? `/profile/${attendee.email}` : '#'"
                class="text-primary dark:text-secondary hover:text-primary-md dark:hover:text-secondary-md"
                title="Ver perfil"
              >
                <span class="flex items-center justify-center w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full opacity-80 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                  <i class="fas fa-arrow-right text-primary dark:text-secondary"></i>
                </span>
              </router-link>
            </li>
          </ul>
          <p v-else class="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <i class="fas fa-info-circle"></i> No hay asistentes confirmados aún.
          </p>
        </div>
      </div>
    </div>
    <!-- Modal para invitar amigos -->
    <InviteFriendsModal :visible="showModalInviteFriends" @close="closeInviteFriendsModal" :module="'event'" :entity="{ id: event?.idDoc, title: event?.title }" :members="event?.attendees?.going ?? []"/>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import AvatarDefault from '../../assets/avatar1.jpg';
import { formatTimestamp } from '../../utils/formatTimestamp';
import { useAuth } from '../../api/auth/useAuth';
import { usePrivateChatsStore } from '../../stores/privateChats';
import { usePrivateChats } from '../../composable/usePrivateChats';
import { useRouter } from 'vue-router';
import InviteFriendsModal from '../molecules/InviteFriendsModal.vue';
import { useUsers } from '../../composable/useUsers';



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
const { getUserProfileByEmail } = useUsers();

const showModalInviteFriends = ref(false);
const isAdmin = computed(() => props.event.ownerId === user.value?.uid || false);
const isSuscribed = ref(false);

function openInviteFriendsModal() {
  showModalInviteFriends.value = true
  document.body.style.overflow = 'hidden'
}

function closeInviteFriendsModal() {
  showModalInviteFriends.value = false
  document.body.style.overflow = ''
}

// Handle connection selection and chat creation
const SendMessage = async (toEmail) => {
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
}

onMounted(async () => {
  try {
    const ownerEmail = props.ownerDetails?.email;
    if (ownerEmail) {
      const ownerProfile = await getUserProfileByEmail(ownerEmail);
      if (ownerProfile) {
        isSuscribed.value = ownerProfile.isSuscribed || false;
      } else {
        console.warn('No se encontro un perfil existente para:', ownerEmail);
      }
    }
  } catch (error) {
    console.error('Error al obtener el perfil de usuario:', error);
  }
});

onUnmounted(() => {
  
});
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