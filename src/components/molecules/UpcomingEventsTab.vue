<template>
  <div class="space-y-4">
    <!-- Filtros superiores -->
    <div class="flex flex-wrap gap-4 justify-between items-center">
      <div class="flex gap-3 flex-wrap items-center">
        <!-- Campo de búsqueda -->
        <input
          v-model="searchModel"
          type="text"
          placeholder="Buscar evento..."
          class="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary dark:bg-gray-800 dark:text-white"
        />
        <!-- Filtro por categoría -->
        <label for="filter" class="text-sm font-medium text-gray-700 dark:text-white sr-only">Filtrar por</label>
        <select
          id="filter"
          v-model="selectedFilter"
          @change="applyFilter(selectedFilter)"
          class="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary dark:bg-gray-800 dark:text-white"
        >
          <option v-for="([key, label]) in Object.entries(sections)" :key="key" :value="key">
            {{ label }}
          </option>
        </select>
      </div>
    </div>
    <!-- Contenido -->
    <div v-if="totalFilteredEvents > 0" class="flex justify-center md:block">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-1">
        <EventCard
          v-for="event in filteredByCategory"
          :key="event.idDoc"
          :event="event"
        />
      </div>
    </div>
    <div v-else class="text-center text-gray-500 dark:text-gray-400 py-10">
      <i class="fa-regular fa-calendar-xmark text-4xl mb-3"></i>
      <p>No hay eventos próximos que coincidan con el filtro.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useEventsStore } from '../../stores/events'
import { useAuth } from '../../api/auth/useAuth'
import { useUpcomingEventFilters } from '../../composable/useUpcomingEventFilters'
import EventCard from '../organisms/EventCard.vue'

const { user } = useAuth()
const eventsStore = useEventsStore()

// Variable reactiva para el texto de búsqueda
const searchModel = ref('')

onMounted(() => {
  eventsStore.subscribeUpcomingEvents()
})

onUnmounted(() => {
  eventsStore.unsubscribeUpcomingEvents()
})

const selectedFilter = ref('all')
const notOwnedEvents = computed(() =>
  eventsStore.upcomingEvents?.value
    ?.filter(e => e.ownerId !== user?.value?.uid)
    ?.filter(e => e.privacy === 'public')
    ?? []
)

const { filteredEvents, filterEventsByCategory } = useUpcomingEventFilters(notOwnedEvents)

const sections = {
  all: 'Cualquier Fecha',
  today: 'Hoy',
  tomorrow: 'Mañana',
  thisWeek: 'Esta semana',
  thisMonth: 'Este mes',
}

const applyFilter = (key) => {
  selectedFilter.value = key
  filterEventsByCategory()
}

const filteredByCategory = computed(() => {
  let events = selectedFilter.value === 'all'
    ? Object.values(filteredEvents.value).flat()
    : filteredEvents.value[selectedFilter.value] ?? []

  // Aplicar filtro de búsqueda por título
  if (searchModel.value.trim()) {
    const searchTerm = searchModel.value.trim().toLowerCase()
    events = events.filter(event =>
      event.title?.toLowerCase().includes(searchTerm)
    )
  }

  return events
})

const totalFilteredEvents = computed(() => filteredByCategory.value.length)
</script>