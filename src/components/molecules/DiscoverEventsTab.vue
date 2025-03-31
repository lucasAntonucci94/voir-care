<template>
    <div>
      <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Descubrir</h2>
      <div v-if="eventsStore?.allEvents?.value?.length > 0" class="flex flex-wrap gap-2 md:gap-6 justify-center align-center">
        <EventCard
          v-for="event in eventsStore?.allEvents?.value"
          :key="event.idDoc"
          :event="event"
        />
      </div>
      <p v-else class="text-center text-gray-500">
        No hay eventos para descubrir.
      </p>
    </div>
  </template>

<script setup>
import { useEventsStore } from '../../stores/events'
import EventCard from '../organisms/EventCard.vue'

const eventsStore = useEventsStore()
</script>
