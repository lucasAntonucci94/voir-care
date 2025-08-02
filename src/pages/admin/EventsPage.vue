<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
    <!-- Header with Back Button -->
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Administración de Eventos</h1>
    </div>

    <!-- Loading and Error States -->
    <div v-if="eventsStore.isLoading" class="text-center text-gray-600 dark:text-gray-300">
      <i class="fas fa-spinner fa-spin mr-2"></i> Cargando eventos...
    </div>
    <div v-else-if="eventsStore.error" class="text-center text-red-500 dark:text-red-400">
      Error: {{ eventsStore.error }}
    </div>
    <div v-else>
      <!-- Search and Filters -->
      <div class="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por título o descripción..."
          class="w-full sm:w-1/3 p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Buscar eventos"
        />
        <select
          v-model="filterOwner"
          class="p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          aria-label="Filtrar por propietario"
        >
          <option value="">Filtrar por propietario</option>
          <option v-for="owner in uniqueOwners" :key="owner" :value="owner">{{ owner }}</option>
        </select>
        <select
          v-model="filterStatus"
          class="p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          <option value="upcoming">Próximos</option>
          <option value="past">Pasados</option>
        </select>
      </div>

      <!-- Events Table -->
      <div v-if="filteredEvents?.length" class="overflow-x-auto rounded-lg">
        <table class="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow">
          <thead>
            <tr class="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-sm leading-normal dosis-font">
              <th class="py-3 px-6 text-left">Título</th>
              <th class="py-3 px-6 text-left">Descripción</th>
              <th class="py-3 px-6 text-left">Fecha de Inicio</th>
              <th class="py-3 px-6 text-left">Propietario</th>
              <th class="py-3 px-6 text-center">Estado</th>
              <th class="py-3 px-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 dark:text-gray-300 text-sm font-light josefin-font">
            <tr
              v-for="event in filteredEvents"
              :key="event.idDoc"
              class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <td class="py-3 px-6 text-left whitespace-nowrap">
                <span>{{ event.title || 'Sin título' }}</span>
              </td>
              <td class="py-3 px-6 text-left">{{ event.description || 'N/A' }}</td>
              <td class="py-3 px-6 text-left">
                {{ formatDate(event.startTime) }}
              </td>
              <td class="py-3 px-6 text-left">{{ event.ownerId || 'N/A' }}</td>
              <td class="py-3 px-6 text-center">
                <span :class="isUpcoming(event.startTime) ? 'text-green-500' : 'text-red-500'">
                  {{ isUpcoming(event.startTime) ? 'Próximo' : 'Pasado' }}
                </span>
              </td>
              <td class="py-3 px-6 text-center">
                <div class="flex item-center justify-center gap-2">
                  <button
                    @click="openEditModal(event)"
                    class="text-blue-500 hover:text-blue-700"
                    title="Editar"
                    aria-label="Editar evento"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    @click="handleDelete(event)"
                    class="text-red-500 hover:text-red-700"
                    title="Eliminar"
                    aria-label="Eliminar evento"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center text-gray-600 dark:text-gray-300">
        No se encontraron eventos con los filtros aplicados.
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useEventsStore } from '../../stores/events';
import { useSnackbarStore } from '../../stores/snackbar';
import EditEventModal from '../../components/organisms/EditEventModal.vue';
import GenericConfirmModal from '../../components/molecules/GenericConfirmModal.vue';

const eventsStore = useEventsStore();
const snackbarStore = useSnackbarStore();

const searchQuery = ref('');
const filterOwner = ref('');
const filterStatus = ref('');

const showDeleteModal = ref(false);
const showEditModal = ref(false);
const selectedEvent = ref(null);
// Computed property for filtered events
const filteredEvents = computed(() => {
  let filtered = eventsStore.allEvents.value;
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (event) =>
        event.title?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query)
    );
  }

  if (filterOwner.value) {
    filtered = filtered.filter((event) => event.ownerId === filterOwner.value);
  }

  if (filterStatus.value) {
    filtered = filtered.filter((event) =>
      filterStatus.value === 'upcoming'
        ? isUpcoming(event.startTime)
        : !isUpcoming(event.startTime)
    );
  }

  return filtered;
});

// Unique owners for filter dropdown
const uniqueOwners = computed(() => {
  const owners = new Set(eventsStore.allEvents.map((event) => event.ownerId).filter(Boolean));
  return [...owners].sort();
});

// Helper para saber si es evento próximo
const isUpcoming = (startTime) => {
  const now = new Date();
  return startTime && new Date(startTime.toDate ? startTime.toDate() : startTime) > now;
};

// Format date
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

//Edit functions
function openEditModal(event) {
  selectedEvent.value = { ...event };
  showEditModal.value = true;
  document.body.style.overflow = 'hidden';
}

function closeEditModal() {
  showEditModal.value = false;
  document.body.style.overflow = '';
  selectedEvent.value = null;
}

function submitEdit(updatedEvent) {
  closeEditModal();
}

// Delete functions
function handleDelete(event) {
  showDeleteModal.value = true;
  selectedEvent.value = event;
  document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
  showDeleteModal.value = false;
  document.body.style.overflow = '';
  selectedEvent.value = null;
}

async function confirmDelete() {
  try {
    debugger
    await eventsStore.deleteEvent(selectedEvent.value.idDoc);
    snackbarStore.show(`Evento ${selectedEvent.value.title} eliminado exitosamente`, 'success');
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    snackbarStore.show(`Error al eliminar evento. IdDoc:${selectedEvent.value.idDoc}, Title: ${selectedEvent.value.title}.`, 'error');
  }
  closeDeleteModal();
}

onMounted(() => {
  eventsStore.subscribeAllEvents();
});

onUnmounted(() => {
  eventsStore.unsubscribeAllEvents();
});
</script>

<style scoped>
</style>