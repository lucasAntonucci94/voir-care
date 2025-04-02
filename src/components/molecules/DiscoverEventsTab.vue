<template>
    <div>
      <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 sr-only">Descubrir</h2>
      <div v-if="filteredEvents.length > 0" class="flex flex-wrap gap-2 md:gap-6 justify-center align-center">
        <EventCard
          v-for="event in filteredEvents"
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
import { computed } from 'vue'
import { useEventsStore } from '../../stores/events'
import EventCard from '../organisms/EventCard.vue'
import { useAuth } from '../../api/auth/useAuth'

const eventsStore = useEventsStore()
const { user } = useAuth()
const filteredEvents = computed(() => {
  return eventsStore.allEvents?.value?.filter(event => event.ownerId !== user?.value?.uid)
})
</script>
