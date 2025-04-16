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
        <!-- <p class="mt-2 text-sm sm:text-base text-gray-200">
          {{ formatTimestamp(event.startTime, { includeTime: true }) }} - {{ formatTimestamp(event.endTime, { includeTime: true }) }}
        </p> -->
        <!-- <p class="mt-1 text-xs sm:text-sm text-gray-300">
          {{ event.location?.address || 'Ubicación no definida' }}
        </p> -->
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
        <div v-if="activeTab === 'info'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Columna izquierda: Detalles y Mapa -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Card de Detalles -->
            <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 class="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Detalles</h2>
              <ul class="space-y-4 text-gray-600 dark:text-gray-300">
                <li class="flex items-center gap-3">
                  <i class="fas fa-edit text-primary dark:text-secondary text-xl"></i>
                  <span><strong>Descripción:</strong> {{ event.description }}</span>
                </li>
                <li class="flex items-center gap-3">
                  <i class="fas fa-calendar-alt text-primary dark:text-secondary text-xl"></i>
                  <span><strong>Inicio:</strong> {{ formatTimestamp(event.startTime, { includeTime: true }) }}</span>
                </li>
                <li class="flex items-center gap-3">
                  <i class="fas fa-calendar-alt text-primary dark:text-secondary text-xl"></i>
                  <span><strong>Fin:</strong> {{ formatTimestamp(event.endTime, { includeTime: true }) }}</span>
                </li>
                <li class="flex items-center gap-3">
                  <i class="fas fa-map-marker-alt text-primary dark:text-secondary text-xl"></i>
                  <span><strong>Ubicación:</strong> {{ event.location?.address || 'No definida' }}</span>
                </li>
                <li v-if="event.price" class="flex items-center gap-3">
                  <i class="fas fa-dollar-sign text-primary dark:text-secondary text-xl"></i>
                  <span><strong>Precio:</strong> ${{ event.price }}</span>
                </li>
                <li class="flex items-center gap-3">
                  <i class="fas fa-users text-primary dark:text-secondary text-xl"></i>
                  <span><strong>Capacidad:</strong> {{ event.capacity || 'Ilimitada' }}</span>
                </li>
                <li class="flex items-center gap-3">
                  <i class="fas fa-lock text-primary dark:text-secondary text-xl"></i>
                  <span><strong>Privacidad:</strong> {{ event.privacy }}</span>
                </li>
              </ul>
            </div>

            <!-- Mapa -->
            <div v-if="event.location?.address" class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 class="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Ubicación</h2>
              <div class="w-full h-64 rounded-lg overflow-hidden">
                <!-- ya que solo deseo mostra el pin de la ubicacion lo implementare con iframe para mayor facilidad. -->
                <iframe
                  class="w-full h-full"
                  :src="`https://www.google.com/maps/embed/v1/place?q=${encodeURIComponent(event.location.address)}&key=AIzaSyDbCImtrddG3Zm7roBIeYMWug-rsfoCH7c`"
                  allowfullscreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>

          <!-- Columna derecha: Boletos, Organizador, Asistentes -->
          <div class="space-y-6">
            <!-- Card de Boletos -->
            <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 class="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Boletos</h2>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Por show agotado, y a pedido del público: Nueva función. ¡No te quedes sin tu entrada!
              </p>
              <a
                :href="event.ticketLink"
                target="_blank"
                rel="nofollow noreferrer"
                class="inline-block px-4 py-2 bg-primary hover:bg-primary-md dark:bg-secondary dark:hover:bg-secondary-md text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary transition-colors duration-200"
              >
                Buscar boletos
              </a>
            </div>

            <!-- Card de Conoce al organizador -->
            <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 class="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Conoce al organizador</h2>
              <div class="flex items-center gap-4">
                <img
                  :src="event.organizer?.photoURL || imageToDelete"
                  alt="Organizador"
                  class="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <a
                    :href="event.organizer?.link || '#'"
                    target="_blank"
                    rel="nofollow noreferrer"
                    class="text-lg font-semibold text-primary dark:text-secondary hover:underline"
                  >
                    {{ event.organizer?.name || 'Organizador' }}
                  </a>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ event.organizer?.location || '' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Lista de Asistentes -->
            <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100">Invitados</h2>
                <a
                  href="#"
                  class="text-sm text-primary dark:text-secondary hover:underline"
                >
                  Ver todo
                </a>
              </div>

              <!-- Resumen: Asistirán e Interesados -->
              <div class="flex gap-4 mb-6">
                <button
                  class="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  <span class="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {{ event?.attendees?.going?.length || 0 }}
                  </span>
                  <span class="text-sm text-gray-600 dark:text-gray-400">Asistirán</span>
                </button>
                <button
                  class="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  <span class="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {{ event?.attendees?.interested?.length || 0 }}
                  </span>
                  <span class="text-sm text-gray-600 dark:text-gray-400">Interesados</span>
                </button>
              </div>

              <!-- Separador -->
              <div class="border-t border-gray-200 dark:border-gray-700 mb-6"></div>

              <!-- Título: Ir con amigos -->
              <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Ir con amigos</h3>

              <!-- Lista de Asistentes -->
              <ul v-if="attendeesDetails.length" class="space-y-4">
                <li v-for="attendee in attendeesDetails.slice(0, 3)" :key="attendee.id" class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <img
                      :src="attendee.photoURL || 'https://via.placeholder.com/150'"
                      alt="Asistente"
                      class="w-10 h-10 rounded-full object-cover"
                    />
                    <span class="text-sm text-gray-600 dark:text-gray-300">{{ attendee.name }}</span>
                  </div>
                  <button
                    class="px-3 py-1 text-sm text-primary dark:text-secondary border border-primary dark:border-secondary rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                  >
                    Invitar
                  </button>
                </li>
              </ul>
              <p v-else class="text-sm text-gray-600 dark:text-gray-400">
                No hay asistentes confirmados aún.
              </p>
            </div>
          </div>
        </div>

        <!-- Otras pestañas (Participantes, Comentarios) -->
        <div v-else-if="activeTab === 'participants'" class="text-sm text-gray-600 dark:text-gray-300">
          <p>Sección de participantes (próximamente).</p>
        </div>

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
import { formatTimestamp } from '../utils/formatTimestamp'
import { useEventsStore } from '../stores/events'
import imageToDelete from '../assets/avatar1.jpg'

const route = useRoute()
const { findEventById } = useEventsStore()

const event = ref(null)
const loading = ref(true)
const attendeesDetails = ref([])

// Definir las pestañas
const tabs = [
  { id: 'info', label: 'Información' },
  { id: 'participants', label: 'Participantes' },
  { id: 'comments', label: 'Comentarios' },
]
const activeTab = ref('info')

// Mock function to fetch user details by ID (replace with your actual implementation)
const fetchUserById = async (userId) => {
  return {
    id: userId,
    name: `User ${userId}`, // Replace with actual user name
    photoURL: imageToDelete, // Replace with actual photo URL
  }
}

onMounted(async () => {
  const id = route.params.idEvent
  if (id) {
    try {
      event.value = await findEventById(id)

      // Fetch user details for attendees in the "going" list
      if (event.value?.attendees?.going?.length) {
        const userPromises = event.value.attendees.going.map(async (userId) => {
          return await fetchUserById(userId)
        })
        attendeesDetails.value = await Promise.all(userPromises)
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

.shadow-lg {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* Estilo para el mapa */
iframe {
  border: 0;
}

/* Ajustes para pantallas pequeñas */
/* @media (max-width: 1024px) {
  .lg\:col-span-2 {
    grid-column: span 1;
  }
} */

/* Ajustes para pantallas muy pequeñas */
@media (max-width: 640px) {
  .text-2xl {
    font-size: 1.25rem;
  }

  .text-xl {
    font-size: 1.125rem;
  }

  .h-64 {
    height: 16rem;
  }

  .px-4 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>