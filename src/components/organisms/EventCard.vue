<template>
    <div class="bg-white p-4 rounded-lg shadow-md w-full max-w-lg border border-gray-100 relative hover:shadow-lg dark:bg-gray-800 dark:border-gray-800 text-[#2c3e50] dark:text-white">
      <!-- Encabezado del evento -->
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold">{{ event?.title }}</h3>
        <!-- Botón para inscribirse (RSVP) -->
        <button
          class="px-3 py-1 bg-primary text-white rounded hover:bg-primary-md transition-colors"
          @click="handleRSVP"
          :disabled="!user"
        >
          {{ rsvpLabel }}
        </button>
      </div>
      <!-- Descripción -->
      <p class="mt-1 text-sm">{{ event?.description }}</p>
      <!-- Media (Imagen o Video) -->
      <div v-if="event?.media" class="mt-3">
        <img
          v-if="event?.mediaType === 'image'"
          :src="event?.media"
          alt="Media del Evento"
          class="w-full h-48 object-cover rounded-lg cursor-pointer"
          @click="openMediaModal"
        />
        <video
          v-else-if="event?.mediaType === 'video'"
          :src="event?.media"
          controls
          class="w-full h-48 rounded-lg cursor-pointer"
          @click="openMediaModal"
        ></video>
      </div>
      <!-- Detalles del Evento -->
      <div class="flex flex-col mt-3 space-y-1 text-sm">
        <div>
          <span class="font-semibold">Inicio:</span> {{ formattedStartTime }}
        </div>
        <div v-if="event?.endTime">
          <span class="font-semibold">Fin:</span> {{ formattedEndTime }}
        </div>
        <div>
          <span class="font-semibold">Ubicación:</span> {{ event?.location?.address || 'No definida' }}
        </div>
        <div v-if="event?.capacity">
          <span class="font-semibold">Capacidad:</span> {{ event?.capacity }}
        </div>
      </div>
      <!-- Categorías -->
      <div class="flex gap-2 mt-2 flex-wrap">
        <span
          v-for="category in event?.categories"
          :key="category.id"
          class="text-xs text-primary bg-teal-100 dark:text-white dark:bg-secondary px-2 py-1 rounded-full"
        >
          {{ category.name }}
        </span>
      </div>
      
      <!-- Modal para visualizar la media en grande -->
      <div
        v-if="showMediaModal"
        class="fixed inset-0 bg-black/90 z-101 transition-opacity duration-300 overflow-hidden"
        @click.self="closeMediaModal"
      >
        <div class="flex h-full w-full">
          <div class="flex-1 flex items-center justify-center relative">
            <div v-if="event?.mediaType === 'image'" class="media-container">
              <img
                :src="event?.media"
                alt="Media del Evento"
                class="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
            <div v-else-if="event?.mediaType === 'video'" class="media-container">
              <video
                :src="event?.media"
                controls
                autoplay
                class="max-w-full max-h-full object-contain rounded-lg"
              ></video>
            </div>
          </div>
          <button
            @click="closeMediaModal"
            class="absolute top-2 right-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          >
            <i class="fa-solid fa-times text-xl"></i>
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { useAuth } from '../../api/auth/useAuth'
  import { formatTimestamp } from '../../utils/formatTimestamp'

  const props = defineProps({
    event: {
      type: Object,
      required: true,
    }
  })
  
  const { user } = useAuth()
  const showMediaModal = ref(false)
  
  // Computed para formatear las fechas (se asume que startTime y endTime son convertibles a Date)
  const formattedStartTime = computed(() => {
    if (!props.event.startTime) return 'No definida'
    
    return formatTimestamp(props.event.startTime)
  })
  const formattedEndTime = computed(() => {
    if (!props.event.endTime) return ''
    return formatTimestamp(props.event.endTime)

  })
  
  // Estado y lógica para el RSVP (inscripción)
  const isRSVPed = ref(false)
  const rsvpLabel = computed(() => (isRSVPed.value ? 'Inscrito' : 'Inscribirse'))
  
  function handleRSVP() {
    if (!user.value) {
      console.log('Usuario no autenticado')
      return
    }
    // Aquí implementarías la lógica para inscribirse/cancelar inscripción en el evento.
    isRSVPed.value = !isRSVPed.value
  }
  
  // Funciones para abrir y cerrar el modal de media
  function openMediaModal() {
    showMediaModal.value = true
    document.body.style.overflow = 'hidden'
  }
  function closeMediaModal() {
    showMediaModal.value = false
    document.body.style.overflow = ''
  }
  </script>
  
  <style scoped>
  .media-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100vh;
  }
  
  .fixed {
    transition: opacity 0.3s ease-in-out;
  }
  </style>
  