<!-- src/pages/EventDetail.vue -->
<template>
  <div v-if="loading" class="flex items-center justify-center h-screen">
    <p class="text-lg text-gray-500 dark:text-gray-300">Cargando evento...</p>
  </div>
  <div v-else-if="!event" class="flex items-center justify-center h-screen">
    <p class="text-lg text-red-500 dark:text-red-400">Evento no encontrado.</p>
  </div>
  <div v-else class="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
    <!-- Banner -->
    <div class="relative w-full h-64 md:h-96 overflow-hidden">
      <template v-if="event.mediaType === 'image'">
        <img
          :src="event.media"
          alt="Banner del evento"
          class="w-full h-full object-cover"
        />
      </template>
      <template v-else-if="event.mediaType === 'video'">
        <video
          :src="event.media"
          controls
          class="w-full h-full object-cover"
        ></video>
      </template>
      <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70"></div>
      <div class="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
          {{ event.title }}
        </h1>
      </div>
    </div>

    <!-- Navegación de Tabs -->
    <div class="container mx-auto px-4 md:px-8 py-6">
      <div class="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav class="flex overflow-x-auto" role="tablist">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-4 py-2 whitespace-nowrap text-sm font-medium focus:outline-none',
              activeTab === tab.id ? 'border-b-2 border-primary dark:border-secondary text-primary dark:text-secondary' : 'text-gray-600 dark:text-gray-300'
            ]"
            :aria-selected="activeTab === tab.id ? 'true' : 'false'"
            role="tab"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Contenido de la pestaña seleccionada -->
      <div>
        <!-- Pestaña "Información" -->
        <EventInfoTab
          v-if="activeTab === 'info'"
          :event="event"
          :owner-details="ownerDetails"
          :attendees-details="attendeesDetails"
          :attendees-loading="attendeesLoading"
          :switch-to-participants="() => activeTab = 'participants'"
        />

        <!-- Pestaña "Participantes" -->
        <EventParticipantsTab v-else-if="activeTab === 'participants'" :attendees="attendeesDetails" />

        <!-- Pestaña "Comentarios" -->
        <div v-else-if="activeTab === 'comments'" class="text-sm text-gray-600 dark:text-gray-300">
          <p>Sección de comentarios (próximamente).</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useEventsStore } from '../stores/events'
import { useUsersStore } from '../stores/users'
import EventInfoTab from '../components/organisms/EventInfoTab.vue'
import EventParticipantsTab from '../components/molecules/EventParticipantsTab.vue'

const route = useRoute()
const eventsStore = useEventsStore()
const usersStore = useUsersStore()

const event = ref(null)
const loading = ref(true)
const attendeesLoading = ref(false)
const attendeesDetails = ref([])
const ownerDetails = ref({})

// Definir las pestañas
const tabs = [
  { id: 'info', label: 'Información' },
  { id: 'participants', label: 'Participantes' },
  { id: 'comments', label: 'Comentarios' },
]
const activeTab = ref('info')

onMounted(async () => {
  const id = route.params.idEvent
  if (id) {
    try {
      event.value = await eventsStore.findEventById(id)

      // Cargar detalles del propietario
      if (event.value?.ownerId) {
        ownerDetails.value = await usersStore.getUser(event.value.ownerId)
      }

      // Cargar detalles de los asistentes (going)
      if (event.value?.attendees?.going?.length) {
        attendeesLoading.value = true
        const userPromises = event.value.attendees.going.map(async (userId) => {
          try {
            return await usersStore.getUser(userId)
          } catch (error) {
            console.warn(`No se pudo obtener el usuario con ID ${userId}:`, error)
            return null
          }
        })
        attendeesDetails.value = (await Promise.all(userPromises)).filter(user => user !== null)
        attendeesLoading.value = false
      }
    } catch (error) {
      console.error('Error al cargar evento:', error)
    }
  }
  loading.value = false
})
</script>

<style scoped>
.container {
  max-width: 1200px;
}

@media (max-width: 640px) {
  .h-64 {
    height: 16rem;
  }
  .px-4 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>