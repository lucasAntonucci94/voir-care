<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
    <!-- Header with Back Button -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-4">
        <RouterLink
          to="/admin/dashboard"
          class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center gap-2"
          aria-label="Volver al Dashboard"
        >
          <i class="fas fa-arrow-left"></i> Volver al Dashboard
        </RouterLink>
        <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Administración de Eventos</h1>
      </div>
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
      <div v-if="filteredEvents.length" class="overflow-x-auto">
        <table class="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow">
          <thead>
            <tr class="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-sm leading-normal">
              <th class="py-3 px-6 text-left">Título</th>
              <th class="py-3 px-6 text-left">Descripción</th>
              <th class="py-3 px-6 text-left">Fecha de Inicio</th>
              <th class="py-3 px-6 text-left">Propietario</th>
              <th class="py-3 px-6 text-center">Estado</th>
              <th class="py-3 px-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 dark:text-gray-300 text-sm font-light">
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
                    @click="deleteEvent(event.idDoc)"
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

    <!-- Edit Modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-4">Editar Evento</h2>
        <form @submit.prevent="saveEvent">
          <div class="mb-4">
            <label class="block text-gray-700 dark:text-gray-300 mb-1" for="title">Título</label>
            <input
              id="title"
              v-model="editEvent.title"
              type="text"
              class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              aria-required="true"
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 dark:text-gray-300 mb-1" for="description">Descripción</label>
            <textarea
              id="description"
              v-model="editEvent.description"
              class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            ></textarea>
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 dark:text-gray-300 mb-1" for="startTime">Fecha de Inicio</label>
            <input
              id="startTime"
              v-model="editEvent.startTime"
              type="datetime-local"
              class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              aria-required="true"
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 dark:text-gray-300 mb-1" for="ownerId">Propietario (UID)</label>
            <input
              id="ownerId"
              v-model="editEvent.ownerId"
              type="text"
              class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              disabled
            />
          </div>
          <div class="flex justify-end gap-2">
            <button
              type="button"
              @click="showEditModal = false"
              class="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
              aria-label="Cancelar"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-primary text-white rounded-md"
              aria-label="Guardar cambios"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useEvents } from '../../composable/useEvents';
import { useEventsStore } from '../../stores/events';
import { useSnackbarStore } from '../../stores/snackbar';

const eventsStore = useEventsStore();
const { updateEvent } = useEvents();
const snackbarStore = useSnackbarStore();

const searchQuery = ref('');
const filterOwner = ref('');
const filterStatus = ref('');
const showEditModal = ref(false);
const editEvent = ref(null);

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

// Helper to check if event is upcoming
const isUpcoming = (startTime) => {
  const now = new Date();
  return startTime && new Date(startTime.toDate ? startTime.toDate() : startTime) > now;
};

// Format date for display
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

// Open edit modal
const openEditModal = (event) => {
  editEvent.value = {
    ...event,
    startTime: event.startTime
      ? new Date(event.startTime.toDate ? event.startTime.toDate() : event.startTime)
          .toISOString()
          .slice(0, 16)
      : '',
  };
  showEditModal.value = true;
};

// Save event changes
const saveEvent = async () => {
  try {
    await updateEvent(editEvent.value.idDoc, {
      title: editEvent.value.title,
      description: editEvent.value.description,
      startTime: new Date(editEvent.value.startTime),
      ownerId: editEvent.value.ownerId,
    });
    snackbarStore.show('Evento actualizado exitosamente', 'success');
    showEditModal.value = false;
  } catch (error) {
    console.error('Error updating event:', error);
    snackbarStore.show('Error al guardar los cambios', 'error');
  }
};

// Delete event
const deleteEvent = async (idDoc) => {
  if (!confirm('¿Estás seguro de que deseas eliminar este evento?')) return;
  try {
    await eventsStore.deleteEvent(idDoc);
    snackbarStore.show('Evento eliminado exitosamente', 'success');
  } catch (error) {
    snackbarStore.show(`Error al eliminar el evento: ${eventsStore.error || 'Intenta de nuevo.'}`, 'error');
  }
};

// Manage subscription lifecycle
onMounted(() => {
  eventsStore.subscribeAllEvents();
});

onUnmounted(() => {
  eventsStore.unsubscribeAllEvents();
});
</script>

<style scoped>
/* Custom styles for table and buttons */
table {
  border-collapse: separate;
  border-spacing: 0;
}

th,
td {
  border-right: 1px solid #e5e7eb;
}

th:last-child,
td:last-child {
  border-right: none;
}

button i {
  font-size: 1.25rem;
}

/* Primary color for buttons */
.bg-primary {
  background-color: #3b82f6;
}

.bg-primary:hover {
  background-color: #2563eb;
}

.bg-primary-dark {
  background-color: #2563eb;
}

/* Dark mode adjustments */
.dark .bg-primary {
  background-color: #60a5fa;
}

.dark .bg-primary:hover {
  background-color: #3b82f6;
}

.dark .bg-primary-dark {
  background-color: #3b82f6;
}
</style>