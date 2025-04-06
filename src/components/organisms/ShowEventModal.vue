<template>
  <div v-if="visible" class="fixed inset-0 z-101 bg-black/70 flex items-center justify-center px-4">
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
        <h2 class="text-2xl font-bold mb-3 text-[#2c3e50] dark:text-white">{{ event.title }}</h2>

        <!-- Descripción -->
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-4 whitespace-pre-line">
          {{ event.description || 'Sin descripción disponible.' }}
        </p>

        <!-- Info principal -->
        <div class="text-sm grid grid-cols-2 gap-4 mb-4 text-gray-700 dark:text-gray-200">
          <div><strong>Inicio:</strong> {{ formatTimestamp(event.startTime) }}</div>
          <div><strong>Fin:</strong> {{ formatTimestamp(event.endTime) }}</div>
          <div><strong>Ubicación:</strong> {{ event.location?.address || 'No definida' }}</div>
          <div v-if="event.price"><strong>Precio:</strong> ${{ event.price }}</div>
          <div><strong>Capacidad:</strong> {{ event.capacity || 'Ilimitada' }}</div>
          <div><strong>Privacidad:</strong> {{ event.privacy }}</div>
          <div><strong>Participantes:</strong> {{ event.members?.length || 0 }}</div>
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
            v-if="event.ownerId !== user?.uid"
            class="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-primary-md transition"
            @click.stop="handleAttendance"
          >
            {{ attendanceLabel }}
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
import { ref, computed, watch } from 'vue'
import { formatTimestamp } from '../../utils/formatTimestamp'
import { useAuth } from '../../api/auth/useAuth'
import { useEventsStore } from '../../stores/events'
const { user } = useAuth()
const eventsStore = useEventsStore()

// Propiedades del componente
const props = defineProps({
  event: { type: Object, required: true },
  visible: { type: Boolean, default: false }
})
const internalEvent = ref({ ...props.event })

watch(() => props.event, (newVal) => {
  internalEvent.value = { ...newVal }
})

// Estado y lógica para el Attendance (inscripción)
const isGoing = computed(() => {
  return internalEvent?.value.attendees?.going?.includes(user.value?.uid)
})
const attendanceLabel = computed(() => (isGoing.value ? 'Cancelar asistencia' : 'Asistiré'))

const emit = defineEmits(['close'])

async function handleAttendance() {
  if (!user.value) {
    console.log('Usuario no autenticado')
    return
  }
  const status = isGoing.value ? null : 'going'
  await eventsStore.setUserAttendanceStatus(internalEvent.value.idDoc, user.value.uid, status)
  console.log(`Usuario ${isGoing.value ? 'Confirma asistencia' : 'Cancela asistencia'} al evento: ${internalEvent.value.idDoc},  ${internalEvent.value.title}`)
  // Esto es para reflejar correctamente el dato en al vista
  if (!internalEvent.value.attendees) internalEvent.value.attendees = { going: [] }

  if (status === 'going') {
    if (!internalEvent.value.attendees.going.includes(user.value.uid)) {
      internalEvent.value.attendees.going.push(user.value.uid)
    }
  } else {
    internalEvent.value.attendees.going = internalEvent.value.attendees.going.filter(
      id => id !== user.value.uid
    )
  }
  console.log(`Usuario ${status ? 'inscrito' : 'removido'} del evento: ${internalEvent.value.title}`)
}

</script>
