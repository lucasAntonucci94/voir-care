<template>
  <div v-if="loading" class="flex items-center justify-center h-screen">
    <p class="text-lg text-gray-500 dark:text-gray-300">Cargando evento...</p>
  </div>
  <div v-else-if="!event" class="flex items-center justify-center h-screen">
    <p class="text-lg text-red-500 dark:text-red-400">Evento no encontrado.</p>
  </div>
  <div v-else class="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
    <!-- Banner -->
    <div  @click="openMediaModal(event.media,event.mediaType)" class="relative w-full h-64 md:h-96 overflow-hidden">
      <template v-if="event.mediaType === 'image' && event.media">
        <img
          :src="event.media"
          alt="Banner del grupo"
          class="w-full h-full object-cover"
        />
      </template>
      <template v-else-if="event.mediaType === 'video' && event.media">
        <video
          :src="event.media"
          controls
          class="w-full h-full object-cover"
        ></video>
      </template>
      <template v-else>
        <img
          :src="defaultEventBanner"
          alt="Banner por defecto"
          class="w-full h-full object-cover"
        />
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
                  @click="openEditModal"
                  class="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-primary dark:bg-gray-700 dark:hover:bg-gray-800 dark:hover:text-secondary transition-all duration-200"
                >
                  <i class="fas fa-pen mr-2"></i> Editar
                </button>
              </li>
              <!-- Delete Event (Owner or Admin) -->
              <li v-if="isAdmin || event?.ownerId === user?.uid">
                <button
                  @click="openDeleteModal"
                  class="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-primary dark:bg-gray-700 dark:hover:bg-gray-800 dark:hover:text-secondary transition-all duration-200"
                >
                  <i class="fas fa-trash-can mr-2"></i> Eliminar
                </button>
              </li>
              <!-- Report Event (Non-owner, non-admin) -->
              <li v-if="event?.ownerId !== user?.uid && !isAdmin">
                <button
                  @click="showReportEventModal"
                  class="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-primary dark:bg-gray-700 dark:hover:bg-gray-800 dark:hover:text-secondary transition-all duration-200"
                >
                  <i class="fas fa-flag mr-2"></i> Reportar
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
      <!-- Modal de confirmación de eliminación -->
      <GenericConfirmModal
        v-if="showDeleteModal"
        :visible="showDeleteModal"
        title="¿Eliminar evento?"
        message="Esta acción no se puede deshacer. ¿Estás seguro de que quieres continuar?"
        confirmButtonText="Eliminar"
        cancelButtonText="Cancelar"
        @cancel="closeDeleteModal"
        @confirmed="confirmDelete"
      />
      <!-- Modal de edición de evento -->
      <EditEventModal
        v-if="selectedEvent && showEditModal"
        :visible="showEditModal"
        :event="selectedEvent"
        @cancel="closeEditModal"
        @submit="submitEdit"
      />
      <!-- Media Modal -->
      <MediaModalViewer
        :visible="showMediaModal"
        :media="selectedMedia"
        @close="closeMediaModal"
      />
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

        <ConversationEventTab
          v-else-if="activeTab === 'comments'"
          :event="event"
          :is-going="isGoing"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEventsStore } from '../stores/events';
import { useUsersStore } from '../stores/users';
import { useSnackbarStore } from '../stores/snackbar';
import EventInfoTab from '../components/organisms/EventInfoTab.vue';
import EventParticipantsTab from '../components/molecules/EventParticipantsTab.vue';
import ModalReport from '../components/molecules/ReportModal.vue';
import { useAuth } from '../api/auth/useAuth';
import GenericConfirmModal from '../components/molecules/GenericConfirmModal.vue'
import EditEventModal from '../components/organisms/EditEventModal.vue'
import MediaModalViewer from '../components/molecules/MediaViewerModal.vue';
import ConversationEventTab from '../components/organisms/ConversationEventTab.vue';
const route = useRoute();
const router = useRouter();
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
const showDeleteModal = ref(false);
const isGoing = ref(false);
const isAdmin = ref(false);
const showEditModal = ref(false)
const showMediaModal = ref(false)
const selectedMedia = ref({ src: '', type: 'image' });
const selectedEvent = ref({
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  privacy: 'public',
  capacity: 0,
  location: { address: '' }
})

// Definir las pestañas
const tabs = [
  { id: 'info', label: 'Información' },
  { id: 'comments', label: 'Comentarios' },
  { id: 'participants', label: 'Participantes' },
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
    showSettingsMenu.value = false;
  } catch (error) {
    console.error(`Error al ${currentStatus ? 'cancelar' : 'confirmar'} asistencia:`, error);
    snackbarStore.show(`Error al ${currentStatus ? 'cancelar' : 'confirmar'} asistencia al evento`, 'error');
  }
}

function openDeleteModal() {
  showSettingsMenu.value = false;
  showDeleteModal.value = true
  document.body.style.overflow = 'hidden'
}

function closeDeleteModal() {
  showDeleteModal.value = false
  document.body.style.overflow = ''
}

async function confirmDelete() {
  try {
    await eventsStore.deleteEvent(event.value.idDoc)
    closeDeleteModal()
    console.log('Evento eliminado')
    router.push({ name: 'events' })
    snackbarStore.show('Evento eliminado', 'success')
  } catch (error) {
    console.error('Error al eliminar evento:', error)
    snackbarStore.show('Error al eliminar evento', 'error')
    return
  }
}

// Funciones para abrir y cerrar el modal de edicion
function openEditModal() {
  showSettingsMenu.value = false;
  selectedEvent.value = { ...event.value }
  showEditModal.value = true
  document.body.style.overflow = 'hidden'
}
function closeEditModal() {
  showEditModal.value = false
  document.body.style.overflow = ''
}
function submitEdit(updatedEvent) {
  event.value = { ...event.value, ...updatedEvent }
  closeEditModal()
}

// Modal functions
const openMediaModal = (url,type) => {
  selectedMedia.value = { src: url, type: type };
  showMediaModal.value = true;
  document.body.style.overflow = 'hidden';
};

const closeMediaModal = () => {
  selectedMedia.value = { src: '', type: 'image' };
  showMediaModal.value = false;
  document.body.style.overflow = '';
};

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