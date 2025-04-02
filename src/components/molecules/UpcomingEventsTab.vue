<template>
    <div>
      <h2 class="text-lg font-semibold text-gray-700 dark:text-white mb-4 sr-only">Próximos Eventos</h2>
  
      <template v-for="([key, label]) in Object.entries(sections)" :key="key">
        <div class="mb-6">
          <!-- Título de la sección SIEMPRE visible -->
          <h3 class="text-lg font-bold mb-4 text-gray-700 dark:text-white capitalize">
            {{ label }}
          </h3>
  
          <!-- Si hay eventos -->
          <div v-if="filteredEvents[key]?.length > 0" class="flex flex-wrap gap-2 md:gap-6 justify-center">
            <EventCard
              v-for="event in filteredEvents[key]"
              :key="event.idDoc"
              :event="event"
            />
          </div>
  
          <!-- Si NO hay eventos -->
          <div v-else class="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
            <i class="fa-regular fa-calendar-xmark text-xl mb-2 block"></i>
            No hay eventos para esta fecha.
          </div>
        </div>
      </template>
  
      <!-- Si no hay NINGÚN evento en ninguna sección -->
      <p v-if="totalEvents === 0" class="text-center text-gray-500 mt-6">
        No hay eventos próximos.
      </p>
    </div>
  </template>
  
  
  <script setup>
  import { computed } from 'vue'
  import { useEventsStore } from '../../stores/events'
  import { useAuth } from '../../api/auth/useAuth'
  import { useUpcomingEventFilters } from '../../composable/useUpcomingEventFilters'
  import EventCard from '../organisms/EventCard.vue'
  
  const { user } = useAuth()
  const eventsStore = useEventsStore()
  // Filtro store y quito eventos del usuario autenticado, para evitar mostrarlos en la vista de descubrimiento
  const notOwnedEvents = computed(() =>
    eventsStore.upcomingEvents?.value?.filter(e => e.ownerId !== user?.value?.uid) ?? []
  )
  // Instancia del composable para agrupar eventos por fechas, le paso array de eventos a filtrar
  const { filteredEvents } = useUpcomingEventFilters(notOwnedEvents)
  // Filtros por fecha
  const sections = {
    today: 'Hoy',
    tomorrow: 'Mañana',
    thisWeek: 'Esta semana',
    thisMonth: 'Este mes',
    // custom: 'Búsqueda personalizada'
  }
  // Creo computado para obtener la cantidad total de eventos filtrados para esta sección. Object.values elimina las key del objeto y devuelve un array con los valores, luego reduce suma la cantidad de eventos por cada key del objeto sections. Y asi tengo la cantidad de eventos totales :D (Y)
  const totalEvents = computed(() =>
    Object.values(filteredEvents.value).reduce((acc, group) => acc + group.length, 0)
  )
  </script>
  