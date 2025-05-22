<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 sr-only">Tus Eventos</h2>
    <EventFilters
      v-if="eventsStore.events?.value?.length > 0"
      v-model="searchQuery"
      v-model:selectedCategory="selectedCategory"
      :categories="categories"
      :showSearch="true"
      :showSelect="true"
    />
    <div v-if="filteredEvents.length > 0" class="flex flex-wrap gap-2 md:gap-6 justify-center mt-4">
      <EventCard
        v-for="event in filteredEvents"
        :key="event.idDoc"
        :event="event"
      />
    </div>
    <!-- Sin eventos -->
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../../api/auth/useAuth'
import { useEventsStore } from '../../stores/events'
import EventCard from '../organisms/EventCard.vue'
import EventFilters from '../molecules/EventFilters.vue'

const { user } = useAuth()
const eventsStore = useEventsStore()
const emit = defineEmits(['open-create-modal', 'open-discover-tab'])

// Estados
const searchQuery = ref('')
const selectedCategory = ref('')
const categories = [
  { id: 'adopcion', name: 'Adopción' },
  { id: 'educacion', name: 'Educación' },
  { id: 'salud', name: 'Salud y Bienestar' },
  { id: 'recreativo', name: 'Recreativo' },
  { id: 'competencia', name: 'Concursos y Muestras' },
  { id: 'voluntariado', name: 'Voluntariado' },
  { id: 'beneficencia', name: 'Solidarios' },
  { id: 'otros', name: 'Otros' }
]

// Computados
const filteredEvents = computed(() => {
  debugger
  return eventsStore.events?.value
    ?.filter(event => event.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
    ?.filter(event => !selectedCategory.value || event.categories?.some(c => c.id === selectedCategory.value))
    ?? []
})

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