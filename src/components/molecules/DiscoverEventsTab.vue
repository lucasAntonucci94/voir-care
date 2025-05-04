<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 sr-only">Descubrir</h2>
    <EventFilters
      v-if="eventsStore.allEvents?.value?.length > 0"
      v-model="searchQuery"
      v-model:selectedCategory="selectedCategory"
      :categories="categories"
      :showSearch="true"
      :showSelect="true"
    />
    <div v-if="filteredEvents?.length > 0" class="flex flex-wrap gap-2 md:gap-6 justify-center align-center mt-4">
      <EventCard
        v-for="event in filteredEvents"
        :key="event.idDoc"
        :event="event"
      />
    </div>
    <div v-else class="text-center text-gray-500 dark:text-gray-400 py-10">
      <i class="fa-regular fa-calendar-xmark text-4xl mb-3"></i>
      <p>No hay eventos para descubrir.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useEventsStore } from '../../stores/events'
import EventCard from '../organisms/EventCard.vue'
import { useAuth } from '../../api/auth/useAuth'
import EventFilters from '../molecules/EventFilters.vue'
// Instancias
const eventsStore = useEventsStore()
const { user } = useAuth()
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
  return eventsStore.allEvents?.value
    ?.filter(event => event.ownerId !== user?.value?.uid) //Busco los eventos que no sean del usuario logueado
    ?.filter(event => event.title.toLowerCase().includes(searchQuery.value.toLowerCase())) //filtro por searchQuery
    ?.filter(event => !selectedCategory.value || event.categories?.some(c => c.id === selectedCategory.value)) //filtro por categorias
    ?? [] //vacio si no hay eventos
})

onMounted(() => {
  eventsStore.subscribeAllEvents()
})

onUnmounted(() => {
  eventsStore.unsubscribeAllEvents()
})

</script>
