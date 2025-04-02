<template>
    <div v-if="visible" class="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
      <div class="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl w-full max-w-2xl relative">
        
        <!-- Media del evento -->
        <div v-if="event.media" class="h-56 w-full bg-black">
          <img
            v-if="event.mediaType === 'image'"
            :src="event.media"
            alt="Media del evento"
            class="w-full h-full object-cover"
          />
          <video
            v-else-if="event.mediaType === 'video'"
            :src="event.media"
            controls
            class="w-full h-full object-cover"
          />
        </div>
  
        <!-- Contenido -->
        <div class="p-6">
          <!-- Botón cerrar -->
          <button
            @click="emit('close')"
            class="absolute top-4 right-4 text-gray-500 hover:text-black dark:hover:text-white transition"
          >
            <i class="fa-solid fa-xmark text-xl"></i>
          </button>
  
          <!-- Título -->
          <h2 class="text-2xl font-bold mb-2 text-[#2c3e50] dark:text-white">{{ event.title }}</h2>
  
          <!-- Descripción -->
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-4 whitespace-pre-line">
            {{ event.description || 'Sin descripción disponible.' }}
          </p>
  
          <!-- Info -->
          <div class="text-sm space-y-2 mb-4 text-gray-700 dark:text-gray-200">
            <p><strong>Inicio:</strong> {{ formatTimestamp(event.startTime) }}</p>
            <p><strong>Fin:</strong> {{ formatTimestamp(event.endTime) }}</p>
            <p><strong>Ubicación:</strong> {{ event.location?.address || 'No definida' }}</p>
            <p v-if="event.price"><strong>Precio:</strong> ${{ event.price }}</p>
            <p><strong>Participantes:</strong> {{ event.participants?.length || 0 }}</p>
          </div>
  
          <!-- Categorías -->
          <div v-if="event.categories?.length" class="flex flex-wrap gap-2 mb-4">
            <span
              v-for="cat in event.categories"
              :key="cat.id"
              class="text-xs px-3 py-1 rounded-full bg-primary text-white"
            >
              {{ cat.name }}
            </span>
          </div>
  
          <!-- Acciones -->
          <div class="flex justify-between items-center mt-6">
            <button
              @click="handleRSVP"
              class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-md transition"
            >
              Inscribirse
            </button>
  
            <router-link
              :to="`/event/${event.idDoc}`"
              class="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition"
              @click="emit('close')"
            >
              Ver evento
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { formatTimestamp } from '../../utils/formatTimestamp'
  
  const props = defineProps({
    event: { type: Object, required: true },
    visible: { type: Boolean, default: false }
  })
  
  const emit = defineEmits(['close'])
  
  function handleRSVP() {
    alert(`Inscrito al evento: ${props.event.title}`)
  }
  </script>
  