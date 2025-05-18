<template>
  <div v-if="loading" class="flex items-center justify-center h-screen">
    <p class="text-lg text-gray-500 dark:text-gray-300">Cargando evento...</p>
  </div>
  <div v-else-if="!event" class="flex items-center justify-center h-screen">
    <p class="text-lg text-red-500 dark:text-red-400">Evento no encontrado.</p>
  </div>
  <div v-else class="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
    <!-- Banner -->
    <div class="relative w-full h-64 md:h-96 overflow-hidden">
      <template v-if="event.mediaType === 'image'">
        <img
          :src="event.media"
          alt="Banner del evento"
          class="w-full h-full object-cover"
        />
      </template>
      <template v-else-if="event.mediaType === 'video'">
        <video
          :src="event.media"
          controls
          class="w-full h-full object-cover"
        ></video>
      </template>
      <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70"></div>
      <div class="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
          {{ event.title }}
        </h1>
      </div>
    </div>

    <!-- Navegación de Tabs -->
    <div class="container mx-auto px-4 md:px-8 py-6">
      <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav class="flex overflow-x-auto" role="tablist">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-4 py-2 whitespace-nowrap text-sm font-medium focus:outline-none',
              activeTab === tab.id ? 'border-b-2 border-primary dark:border-secondary text-primary dark:text-secondary' : 'text-gray-600 dark:text-gray-300'
            ]"
            :aria-selected="activeTab === tab.id ? 'true' : 'false'"
            role="tab"
          >
            {{ tab.label }}
          </button>
        </nav>
        <!-- Settings Dropdown Button -->
        <div ref="dropdownRef" class="relative">
          <button
            @click="showSettingsMenu = !showSettingsMenu"
            class="flex items-center text-gray-600 hover:text-primary dark:text-white dark:hover:text-gray-300 focus:outline-none transition-colors duration-200 bg-gray-100/10 hover:bg-gray-100/40 dark:bg-gray-700 hover:dark:bg-gray-600 rounded-lg p-2 h-8 shadow-sm hover:shadow-md"
          >
            <i class="fas fa-cog"></i>
            <span class="ml-2 text-sm hidden md:inline">Configuración</span>
          </button>
          <div
            v-if="showSettingsMenu"
            class="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 dark:border-gray-800 border border-gray-200 rounded-lg shadow-lg z-10"
          >
            <ul class="py-1 text-sm text-gray-700 dark:text-gray-200">
              <!-- Edit Event (Owner or Admin) -->
              <li v-if="isAdmin || event?.ownerId === user?.uid">
                <button
                  @click="showEditEventModal"
                  class="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-primary dark:bg-gray-700 dark:hover:bg-gray-800 dark:hover:text-secondary transition-all duration-200"
                >
                  <i class="fas fa-pen mr-2"></i> Editar Evento
                </button>
              </li>
              <!-- Delete Event (Owner or Admin) -->
              <li v-if="isAdmin || event?.ownerId === user?.uid">
                <button
                  @click="showDeleteEventModal"
                  class="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-primary dark:bg-gray-700 dark:hover:bg-gray-800 dark:hover:text-secondary transition-all duration-200"
                >
                  <i class="fas fa-trash-can mr-2"></i> Eliminar Evento
                </button>
              </li>
              <!-- Report Event (Non-owner, non-admin) -->
              <li v-if="event?.ownerId !== user?.uid && !isAdmin">
                <button
                  @click="showReportEventModal"
                  class="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-primary dark:bg-gray-700 dark:hover:bg-gray-800 dark:hover:text-secondary transition-all duration-200"
                >
                  <i class="fas fa-flag mr-2"></i> Reportar Evento
                </button>
              </li>
              <!-- Hide Event (Non-owner, non-admin) -->
              <li v-if="event?.ownerId !== user?.uid && !isAdmin && isGoing">
                <button
                  @click="handleAttendance"
                  class="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-primary dark:bg-gray-700 dark:hover:bg-gray-800 dark:hover:text-secondary transition-all duration-200"
                >
                  <i class="fas fa-close mr-2"></i> Salir del Evento
                </button>
              </li>
            </ul>
          </div>
        </div>
        <!-- Modal de reporte -->
        <ModalReport
          :visible="showReportModal"
          :entity-type="'event'"
          :entity-id="event?.idDoc || ''"
          :metadata="{ title: event?.title || '' }"
          @close="closeReportModal"
          @reported="closeReportModal"
        />
      </div>

      <!-- Contenido de la pestaña seleccionada -->
      <div>
        <!-- Pestaña "Información" -->
        <EventInfoTab
          v-if="activeTab === 'info'"
          :event="event"
          :owner-details="ownerDetails"
          :attendees-details="attendeesDetails"
          :attendees-loading="attendeesLoading"
          :switch-to-participants="() => activeTab = 'participants'"
          :is-going="isGoing"
          :handle-attendance="handleAttendance"
        />

        <!-- Pestaña "Participantes" -->
        <EventParticipantsTab v-else-if="activeTab === 'participants'" :attendees="attendeesDetails" />

        <!-- Pestaña "Comentarios" -->
        <div v-else-if="activeTab === 'comments'" class="text-sm text-gray-600 dark:text-gray-300">
          <p>Sección de comentarios (próximamente).</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useEventsStore } from '../stores/events';
import { useUsersStore } from '../stores/users';
import { useSnackbarStore } from '../stores/snackbar';
import EventInfoTab from '../components/organisms/EventInfoTab.vue';
import EventParticipantsTab from '../components/molecules/EventParticipantsTab.vue';
import ModalReport from '../components/molecules/ReportModal.vue';
import { useAuth } from '../api/auth/useAuth';

const route = useRoute();
const eventsStore = useEventsStore();
const snackbarStore = useSnackbarStore();
const usersStore = useUsersStore();
const { user } = useAuth();

const event = ref(null);
const loading = ref(true);
const attendeesLoading = ref(false);
const attendeesDetails = ref([]);
const ownerDetails = ref({});
const dropdownRef = ref(null);
const showSettingsMenu = ref(false);
const showReportModal = ref(false);
const isGoing = ref(false);
const isAdmin = ref(false);

// Definir las pestañas
const tabs = [
  { id: 'info', label: 'Información' },
  { id: 'participants', label: 'Participantes' },
  { id: 'comments', label: 'Comentarios' },
];
const activeTab = ref('info');

// Handle click outside to close dropdown
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    showSettingsMenu.value = false;
  }
};

async function showReportEventModal() {
  showSettingsMenu.value = false;
  showReportModal.value = true;
}

// Cerrar modal reportar post
function closeReportModal() {
  showReportModal.value = false;
  document.body.style.overflow = '';
}

function showDeleteEventModal() {
  showSettingsMenu.value = false;
  console.log('Abrir modal para eliminar evento');
}

function showEditEventModal() {
  showSettingsMenu.value = false;
  console.log('Abrir modal para editar evento');
}

async function handleAttendance() {
  if (!user.value) {
    console.log('Usuario no autenticado');
    return;
  }

  const currentStatus = isGoing.value;
  const newStatus = currentStatus ? null : 'going'; // null to cancel, 'going' to join
  try {
    await eventsStore.setUserAttendanceStatus(event.value.idDoc, user.value.uid, newStatus);

    // Update local state reactively
    if (currentStatus) {
      // Cancel attendance: remove user.uid from attendees.going
      event.value.attendees.going = event.value.attendees.going.filter(uid => uid !== user.value.uid);
      isGoing.value = false;
      console.log(`Usuario cancela asistencia al evento: ${event.value.idDoc}, ${event.value.title}`);
      snackbarStore.show(`Usuario cancela asistencia al evento: ${event.value.title}`, 'success');
    } else {
      // Join attendance: add user.uid to attendees.going
      event.value.attendees.going = [...event.value.attendees.going, user.value.uid];
      isGoing.value = true;
      console.log(`Usuario confirma asistencia al evento: ${event.value.idDoc}, ${event.value.title}`);
      snackbarStore.show(`Usuario confirma asistencia al evento: ${event.value.title}`, 'success');
    }
  } catch (error) {
    console.error(`Error al ${currentStatus ? 'cancelar' : 'confirmar'} asistencia:`, error);
    snackbarStore.show(`Error al ${currentStatus ? 'cancelar' : 'confirmar'} asistencia al evento`, 'error');
  }
}

onMounted(async () => {
  const id = route.params.idEvent;
  if (id) {
    try {
      event.value = await eventsStore.findEventById(id);
      isGoing.value = event.value?.attendees?.going?.includes(user.value?.uid) || false;
      isAdmin.value = event.value?.ownerId === user.value?.uid || false;
      // Cargar detalles del propietario
      if (event.value?.ownerId) {
        ownerDetails.value = await usersStore.getUser(event.value.ownerId);
      }

      // Cargar detalles de los asistentes (going)
      if (event.value?.attendees?.going?.length) {
        attendeesLoading.value = true;
        const userPromises = event.value.attendees.going.map(async (userId) => {
          try {
            return await usersStore.getUser(userId);
          } catch (error) {
            console.warn(`No se pudo obtener el usuario con ID ${userId}:`, error);
            return null;
          }
        });
        attendeesDetails.value = (await Promise.all(userPromises)).filter(user => user !== null);
        attendeesLoading.value = false;
      }
    } catch (error) {
      console.error('Error al cargar evento:', error);
    }
  }
  loading.value = false;
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.container {
  max-width: 1200px;
}

@media (max-width: 640px) {
  .h-64 {
    height: 16rem;
  }
  .px-4 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>