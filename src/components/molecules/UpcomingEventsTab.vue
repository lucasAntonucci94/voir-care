<template>
    <div>
        <h2 class="text-lg font-semibold text-[#2c3e50] dark:text-white mb-4">Próximos Eventos</h2>
        <div v-if="eventsStore?.upcomingEvents?.value?.length > 0" class="flex flex-wrap gap-2 md:gap-6 justify-center align-center">
        <EventCard
            v-for="event in eventsStore?.upcomingEvents?.value"
            :key="event.idDoc"
            :event="event"
        />
        </div>
        <p v-else class="text-center text-gray-500">
        No hay eventos próximos.
        </p>
    </div>
</template>

<script setup>
import { useEventsStore } from '../../stores/events'
import EventCard from '../organisms/EventCard.vue'

const eventsStore = useEventsStore()
</script>
