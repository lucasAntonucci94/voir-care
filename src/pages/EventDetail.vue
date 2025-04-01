<template>
  <div v-if="loading" class="p-8 text-center text-gray-500 dark:text-gray-300">Cargando evento...</div>

  <div v-else-if="!event" class="p-8 text-center text-red-500 dark:text-red-400">Evento no encontrado.</div>

  <div v-else class="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
    <!-- Banner -->
    <div class="relative w-full h-64 bg-black">
      <img
        v-if="event.mediaType === 'image'"
        :src="event.media"
        alt="Banner del evento"
        class="w-full h-full object-cover"
      />
      <video
        v-else-if="event.mediaType === 'video'"
        :src="event.media"
        controls
        class="w-full h-full object-cover"
      ></video>

      <!-- Título encima -->
      <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
        <h1 class="text-3xl md:text-4xl font-bold text-white text-center px-4">
          {{ event.title }}
        </h1>
      </div>
    </div>

    <!-- Contenido -->
    <div class="container mx-auto px-4 md:px-8 py-8">
      <!-- Tabs -->
      <div class=" pb-1 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto whitespace-nowrap">
        <nav class="flex gap-2 md:gap-4 text-sm font-medium">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
           :class="[
              'pb-2 text-gray-700 dark:text-gray-300 transition',
              activeTab === tab.id
                ? 'text-primary dark:text-primary border-b-2 border-primary'
                : 'border-b-2 border-gray-700'
            ]"
            >
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="mt-4">
        <div v-if="activeTab === 'description'" class="prose dark:prose-invert max-w-none">
          <p>{{ event.description }}</p>
          <ul class="mt-4 text-sm">
            <li><strong>Inicio:</strong> {{ formatTimestamp(event.startTime) }}</li>
            <li><strong>Fin:</strong> {{ formatTimestamp(event.endTime) }}</li>
            <li><strong>Ubicación:</strong> {{ event.location?.address || 'No definida' }}</li>
            <li v-if="event.price"><strong>Precio:</strong> ${{ event.price }}</li>
            <li><strong>Capacidad:</strong> {{ event.capacity || 'Ilimitada' }}</li>
            <li><strong>Privacidad:</strong> {{ event.privacy }}</li>
          </ul>
        </div>

        <div v-else-if="activeTab === 'participants'" class="text-sm text-gray-600 dark:text-gray-300">
          <p>Sección de participantes (proximamente).</p>
        </div>

        <div v-else-if="activeTab === 'comments'" class="text-sm text-gray-600 dark:text-gray-300">
          <p>Sección de comentarios (proximamente).</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { formatTimestamp } from '../utils/formatTimestamp'
import { useEventsStore } from '../stores/events'

const route = useRoute()
const { findEventById } = useEventsStore()

const event = ref(null)
const loading = ref(true)

// Tabs
const tabs = [
  { id: 'description', label: 'Descripción' },
  { id: 'participants', label: 'Participantes' },
  { id: 'comments', label: 'Comentarios' },
]
const activeTab = ref('description')

onMounted(async () => {
  const id = route.params.idEvent
  if (id) {
    try {
      event.value = await findEventById(id)
    } catch (error) {
      console.error('Error al cargar evento:', error)
    }
  }
  loading.value = false
})
</script>
