<template>
  <div>
    <!-- Contenedor principal del card -->
    <div
      class="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden w-full max-w-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl cursor-pointer"
      @click="goToDetail"
    >
      <!-- Media -->
      <div v-if="event?.media" class="relative h-40 w-full">
        <img
          v-if="event?.mediaType === 'image'"
          :src="event?.media"
          :alt="event?.title"
          class="w-full h-full object-cover transition-opacity duration-300"
          loading="lazy"
        />
        <video
          v-else-if="event?.mediaType === 'video'"
          :src="event?.media"
          class="w-full h-full object-cover"
          controls
        />
        <!-- Badge de privacidad -->
        <span
          class="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold text-white rounded-full shadow-sm"
          :class="event.privacy === 'public' ? 'bg-green-500' : 'bg-red-500'"
        >
          {{ event.privacy === 'public' ? 'Público' : 'Privado' }}
        </span>
        <!-- Botón de elipsis para administradores -->
        <div
          v-if="event.ownerId === user?.uid || event.ownerId === user?.id || user?.isAdmin"
          class="absolute top-3 right-3"
        >
          <button
            ref="menuButton"
            @click.stop="toggleMenu"
            class="p-2 text-white bg-gray-900/50 dark:bg-gray-900/70 rounded-full hover:bg-gray-900/70 dark:hover:bg-gray-900/90 transition-colors"
            aria-label="Opciones del evento"
          >
            <i class="fas fa-ellipsis-v"></i>
          </button>
          <!-- Menú desplegable -->
          <div
            v-if="showMenu"
            ref="menu"
            class="absolute top-10 right-0 bg-white dark:bg-gray-700 rounded-lg shadow-lg w-48 py-2 z-20 border border-gray-100 dark:border-gray-600"
          >
            <button
              @click.stop="openEditModal"
              class="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <i class="fas fa-edit"></i>
              Editar
            </button>
            <button
              @click.stop="handleDelete"
              class="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <i class="fas fa-trash-can"></i>
              Eliminar
            </button>
          </div>
        </div>
      </div>
      <div
        v-else
        class="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500"
      >
        <i class="fas fa-image text-3xl"></i>
      </div>

      <!-- Contenido -->
      <div class="p-4 space-y-2 text-sm text-gray-800 dark:text-gray-200">
        <h3 class="text-xl font-semibold">{{ event?.title }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ event.location?.address || 'Ubicación no definida' }}
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
          {{ event.description || 'Sin descripción' }}
        </p>
        <div class="flex flex-col gap-1">
          <span><strong>Inicio:</strong> {{ formattedStartTime }}</span>
          <span v-if="event?.endTime"><strong>Fin:</strong> {{ formattedEndTime }}</span>
          <div class="flex gap-2">
            <span
              class="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
            >
              <i class="fas fa-users text-primary dark:text-secondary"></i>
              {{ event?.attendees?.going?.length || 0 }}
              {{ event?.attendees?.going?.length === 1 ? 'participante' : 'participantes' }}
            </span>
            <span
              v-if="event.modality === 0 || event.modality === 1"
              class="px-2 py-1 text-xs font-medium rounded-full"
              :class="
                event.modality === 0
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-blue-200'
                  : 'bg-purple-100 text-purple-700 dark:bg-purple-600 dark:text-purple-200'
              "
            >
              {{ event.modality === 0 ? 'Presencial' : 'Virtual' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Acción + Categorías -->
      <div class="p-4 pt-0 flex justify-between items-center flex-wrap gap-y-2">
        <!-- Categorías -->
        <div class="flex flex-wrap gap-2">
          <span
            v-for="category in event.categories"
            :key="category.id"
            class="text-xs px-2 py-1 rounded-full bg-teal-200 text-teal-900 dark:bg-teal-600 dark:text-white"
          >
            {{ category.name }}
          </span>
        </div>
        <!-- Botón de asistencia/editar -->
        <button
          v-if="event.ownerId !== user?.uid && event.ownerId !== user?.id && !user?.isAdmin"
          @click.stop="handleAttendance"
          class="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg shadow-sm transition-colors duration-200"
          :class="
            isGoing
              ? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
              : 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
          "
          :disabled="!user"
        >
          <i :class="isGoing ? 'fas fa-user-minus' : 'fas fa-user-plus'"></i>
          {{ attendanceLabel }}
        </button>
        <button
          v-else-if="event.ownerId === user?.uid || event.ownerId === user?.id || user?.isAdmin"
          @click.stop="openEditModal"
          class="flex items-center gap-2 px-4 py-2 text-sm bg-primary dark:bg-secondary text-white rounded-lg hover:bg-primary-md dark:hover:bg-secondary-md transition-colors duration-200 shadow-sm"
        >
          <i class="fas fa-edit"></i>
          Editar
        </button>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <GenericConfirmModal
      :visible="showDeleteModal"
      title="¿Eliminar evento?"
      message="Esta acción no se puede deshacer. ¿Querés continuar?"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';import { useRouter } from 'vue-router';
import { useAuth } from '../../api/auth/useAuth';
import { formatTimestamp } from '../../utils/formatTimestamp';
import { useEventsStore } from '../../stores/events';
import GenericConfirmModal from '../../components/molecules/GenericConfirmModal.vue';
import EditEventModal from './EditEventModal.vue';
import { useSnackbarStore } from '../../stores/snackbar';

const props = defineProps({
  event: {
    type: Object,
    required: true,
  },
});

const router = useRouter();
const { user } = useAuth();
const eventsStore = useEventsStore();
const snackbarStore = useSnackbarStore();
const showDeleteModal = ref(false);
const showEditModal = ref(false);
const showMenu = ref(false);
const menuButton = ref(null);
const menu = ref(null);
const selectedEvent = ref({
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  privacy: 'public',
  capacity: 0,
  location: { address: '' },
  modality: 0, // 0: Presencial, 1: Virtual
});

function goToDetail() {
  router.push({ name: 'eventDetail', params: { idEvent: props.event.idDoc } });
}

const formattedStartTime = computed(() => {
  if (!props.event.startTime) return 'No definida';
  return formatTimestamp(props.event.startTime, { includeTime: true });
});

const formattedEndTime = computed(() => {
  if (!props.event.endTime) return '';
  return formatTimestamp(props.event.endTime, { includeTime: true });
});

const isGoing = computed(() => {
  return props.event?.attendees?.going?.includes(user.value?.uid);
});

const attendanceLabel = computed(() => (isGoing.value ? 'Cancelar asistencia' : 'Asistiré'));

// Handle clicks outside the menu
const handleClickOutside = (event) => {
  if (
    showMenu.value &&
    menu.value &&
    menuButton.value &&
    !menu.value.contains(event.target) &&
    !menuButton.value.contains(event.target)
  ) {
    showMenu.value = false;
  }
};

async function handleAttendance() {
  if (!user.value) {
    console.log('Usuario no autenticado');
    return;
  }
  try {
    const status = isGoing.value ? null : 'going';
    await eventsStore.setUserAttendanceStatus(props.event.idDoc, user.value.uid, status);
    console.log(`Asistencia ${status === 'going' ? 'confirmada' : 'cancelada'} para el evento ${props.event.idDoc}`);
    snackbarStore.show(`Usuario ${status === 'going' ? 'Confirma asistencia' : 'Cancela asistencia'} al evento: ${props.event.title}`, 'success');
  } catch (error) {
    console.error('Error al actualizar asistencia:', error);
    snackbarStore.show(`Error al actualizar asistencia:${error}`, 'error');
  }
}

function handleDelete() {
  showDeleteModal.value = true;
  showMenu.value = false;
  document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
  showDeleteModal.value = false;
  document.body.style.overflow = '';
}

async function confirmDelete() {
  try {
    await eventsStore.deleteEvent(props.event.idDoc);
    console.log(`Evento ${props.event.idDoc} eliminado`);
    snackbarStore.show(`Evento ${props.event.title} eliminado exitosamente`, 'success');
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    snackbarStore.show(`Error al eliminar evento. IdDoc:${props.event.idDoc}, Title: ${props.event.title}.`, 'error');
  }
  closeDeleteModal();
}

function openEditModal() {
  selectedEvent.value = { ...props.event };
  showEditModal.value = true;
  showMenu.value = false;
  document.body.style.overflow = 'hidden';
}

function closeEditModal() {
  showEditModal.value = false;
  document.body.style.overflow = '';
}

function submitEdit(updatedEvent) {
  closeEditModal();
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

function toggleMenu() {
  showMenu.value = !showMenu.value;
}
</script>

<style scoped>
/* Ajustar el diseño del card */
.rounded-2xl {
  border-radius: 1rem;
}

/* Mejorar sombras */
.shadow-md {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.shadow-xl {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.15);
}

/* Mejorar el texto */
.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.leading-relaxed {
  line-height: 1.625;
}

/* Estilo para el badge de privacidad y menú */
.rounded-full {
  font-size: 0.75rem;
  line-height: 1rem;
}
</style>