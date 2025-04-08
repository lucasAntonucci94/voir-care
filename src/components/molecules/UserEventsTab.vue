<template>
    <div>
      <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 sr-only">Tus Eventos</h2>
      <div v-if="eventsStore?.events?.value?.length > 0" class="flex flex-wrap gap-2 md:gap-6 justify-center align-center">
        <EventCard
          v-for="event in eventsStore?.events?.value"
          :key="event.idDoc"
          :event="event"
        />
      </div>
       <!-- Sin grupos -->
       <div
        v-else
        class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md"
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
import { useEventsStore } from '../../stores/events'
import EventCard from '../organisms/EventCard.vue'

const eventsStore = useEventsStore()
const emit = defineEmits(['open-create-modal','open-discover-tab']);


const navigateToCreateEvent = () => {
    emit('open-create-modal')
  };
  
  const navigateToDiscoverEvent = () => {
    emit('open-discover-tab')
  };
</script>
