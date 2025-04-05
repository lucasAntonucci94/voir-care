<template>
  <div class="space-y-4">
    <!-- Filtros superiores -->
    <div class="flex flex-wrap gap-4 justify-between items-center">
      <div class="flex gap-2 flex-wrap">
        <label for="filter" class="text-sm font-medium text-gray-700 dark:text-white">Filtrar por</label>
        <select
          id="filter"
          v-model="selectedFilter"
          @change="applyFilter(selectedFilter)"
          class="px-4 py-2 text-sm rounded-lg border bg-white dark:bg-gray-700 text-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
        >
          <option v-for="([key, label]) in Object.entries(sections)" :key="key" :value="key">
            {{ label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Contenido -->
    <div v-if="totalFilteredEvents > 0">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
import { ref, computed } from 'vue'
import { useEventsStore } from '../../stores/events'
import { useAuth } from '../../api/auth/useAuth'
import { useUpcomingEventFilters } from '../../composable/useUpcomingEventFilters'
import EventCard from '../organisms/EventCard.vue'

const { user } = useAuth()
const eventsStore = useEventsStore()
const selectedFilter = ref('all')
const notOwnedEvents = computed(() =>
  eventsStore.upcomingEvents?.value?.filter(e => e.ownerId !== user?.value?.uid) ?? []
)

const { filteredEvents, filterEventsByCategory } = useUpcomingEventFilters(notOwnedEvents)

const sections = {
  all: 'Todos',
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
  if (selectedFilter.value === 'all') {
    return Object.values(filteredEvents.value).flat()
  }
  return filteredEvents.value[selectedFilter.value] ?? []
})

const totalFilteredEvents = computed(() => filteredByCategory.value.length)
</script>
