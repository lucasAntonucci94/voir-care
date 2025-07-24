<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 sr-only">Tus Eventos</h2>
    <EventFilters
        v-if="eventsStore.events?.value?.length > 0"
        v-model="searchQuery"
        v-model:selectedCategory="selectedCategory"
        v-model:selectedOwnership="selectedOwnership"
        v-model:selectedDateFilter="selectedDateFilter"
        :showSearch="true"
        :showSelect="true"
        :showSelectDate="true"
        :showOwnership="true"
      />
    <div v-if="filteredEvents.length > 0" class="flex justify-center md:block">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <EventCard
          v-for="event in filteredEvents"
          :key="event.idDoc"
          :event="event"
        />
      </div>
    </div>
    <!-- Sin eventos -->
    <div v-else-if="(searchQuery !== '' || selectedCategory !== '') && filteredEvents?.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-10">
      <i class="fa-regular fa-calendar-xmark text-4xl mb-3"></i>
      <p>No hay eventos para los filtros seleccionados.</p>
    </div>
    <div
      v-else
      class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md mt-5"
    >
      <p class="text-gray-500 dark:text-gray-400">No perteneces a ningún evento aún.</p>
      <button
        class="mt-4 px-4 py-2 bg-primary hover:bg-primary-md dark:bg-secondary dark:hover:bg-secondary-md text-white rounded-lg text-sm transition-colors"
        @click="navigateToCreateEvent"
      >
        Crea tu primer evento
      </button>
      <button
        class="mt-4 px-4 py-2 ml-3 bg-primary hover:bg-primary-md dark:bg-secondary dark:hover:bg-secondary-md text-white rounded-lg text-sm transition-colors"
        @click="navigateToDiscoverEvent"
      >
        Descubre un evento
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../../api/auth/useAuth'
import { useEventsStore } from '../../stores/events'
import EventCard from '../organisms/EventCard.vue'
import EventFilters from '../molecules/EventFilters.vue'

const { user } = useAuth()
const eventsStore = useEventsStore()
const emit = defineEmits(['open-create-modal', 'open-discover-tab'])

// Estados
const searchQuery = ref('');
const selectedCategory = ref('');
const selectedOwnership = ref('all');
const selectedDateFilter = ref('upcoming');

// Computados
const filteredEvents = computed(() => {
  let events = eventsStore.events?.value ?? [];

  // Filtro por búsqueda
  events = events.filter(event => event.title.toLowerCase().includes(searchQuery.value.toLowerCase()))

  // Filtro por categoría
  events = events.filter(event => !selectedCategory.value || event.categories?.some(c => c.id === selectedCategory.value))
  
  // Filtro por fecha
  const now = new Date(); // Obtiene la fecha y hora actual
  if (selectedDateFilter.value === 'upcoming') {
    // Filtra eventos cuya fecha es igual o posterior a la fecha actual
    events = events.filter(event => {
      const eventDate = event.startTime?.toDate ? event.startTime.toDate() : new Date(event.startTime);
      return eventDate >= now;
    });
  } else if (selectedDateFilter.value === 'past') {
    // Filtra eventos cuya fecha es anterior a la fecha actual
    events = events.filter(event => {
      const eventDate = event.startTime?.toDate ? event.startTime.toDate() : new Date(event.startTime);
      return eventDate < now;
    });
  }

  // Filtro por propiedad
  if (selectedOwnership.value === 'owned') {
    events = events.filter(event => event.ownerId === user.value.uid);
  } else if (selectedOwnership.value === 'joined') {
    events = events.filter(event => event.ownerId !== user.value.uid);
  }
  return events;
})

// Helper to check if event is upcoming
const isUpcoming = (startTime) => {
  const now = new Date();
  return startTime && new Date(startTime.toDate ? startTime.toDate() : startTime) > now;
};

// Suscripción a eventos del usuario
onMounted(() => {
  if (user.value) {
    eventsStore.subscribeUserEvents(user.value.uid)
  }
})

// Desuscripción al desmontar el componente
onUnmounted(() => {
  eventsStore.unsubscribeUserEvents()
})

const navigateToCreateEvent = () => {
  emit('open-create-modal')
}

const navigateToDiscoverEvent = () => {
  emit('open-discover-tab')
}
</script>