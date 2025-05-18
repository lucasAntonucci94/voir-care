<template>
  <div
  class="bg-gray-100 dark:bg-gray-700 rounded-xl shadow-md overflow-hidden w-full max-w-sm border border-gray-200 dark:border-gray-600 transition hover:shadow-lg  cursor-pointer"
  @click="goToDetail"
  >
    <!-- Media -->
    <div v-if="event?.media" class="h-40 w-full relative">
      <img
        v-if="event?.mediaType === 'image'"
        :src="event?.media"
        alt="Media del Evento"
        class="w-full h-full object-cover"
        />
      <video
        v-else-if="event?.mediaType === 'video'"
        :src="event?.media"
        class="w-full h-full object-cover"
        controls
        />
        <span
          class="absolute top-2 right-2 px-2 py-1 text-xs font-semibold text-white rounded-full"
          :class="event.privacy === 'public' ? 'bg-green-500' : 'bg-red-500'"
        >
          {{ event.privacy === 'public' ? 'Público' : 'Privado' }}
        </span>
    </div>

    <!-- Contenido -->
    <div class="p-4 space-y-3 text-sm text-gray-800 dark:text-gray-200">
      <!-- Header -->
      <div class="flex justify-between items-start">
        <div>
          <h3 class="text-lg font-semibold">{{ event?.title }}</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ event.location?.address || 'Ubicación no definida' }}
          </p>
        </div>
        <button
          v-if="event.ownerId === user?.uid || event.ownerId === user?.id || user?.isAdmin"
          class="text-red-500 hover:text-red-600"
          @click.stop="handleDelete"
        >
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>

      <!-- Fechas -->
      <div class="flex flex-col gap-1">
        <span><strong>Inicio:</strong> {{ formattedStartTime }}</span>
        <!-- <span v-if="event?.endTime"><strong>Fin:</strong> {{ formattedEndTime }}</span> -->
        <!-- <span v-if="event?.capacity"><strong>Capacidad:</strong> {{ event.capacity }}</span> -->
        <span><strong>Participantes:</strong> {{ event?.attendance?.going?.length || 0 }}</span>
      </div>

      <!-- Descripción corta -->
      <!-- <p class="line-clamp-3 text-xs text-gray-600 dark:text-gray-300">
        {{ event.description }}
      </p> -->
    </div>

   <!-- Acción + Categorías -->
    <div class="p-4 pt-0 flex items-center justify-between flex-wrap gap-y-2">
      <!-- Categorías -->
      <div class="flex flex-wrap gap-2">
        <span
          v-for="category in event.categories"
          :key="category.id"
          class="text-xs px-2 py-1 rounded-full bg-teal-200 text-teal-900 dark:bg-teal-600 dark:text-white"
        >
          {{ category.name }}
        </span>
      </div>

      <!-- Botón -->
      <div>
        <button
          v-if="event.ownerId !== user?.uid"
          class="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-primary-md transition"
          @click.stop="handleAttendance"
          :disabled="!user"
        >
          {{ attendanceLabel }}
        </button>
        <button
          v-else
          class="px-4 py-2 text-sm bg-primary dark:bg-secondary text-white rounded hover:bg-primary-md dark:hover:bg-secondary-md transition"
          @click.stop="openEditModal"
        >
          Editar
        </button>
      </div>
    </div>
  </div>
  
  <!-- Modal de confirmación de eliminación -->
  <GenericConfirmModal 
    :visible="showDeleteModal"
    title="¿Eliminar evento?"
    message="Esta acción no se puede deshacer. ¿Querés continuar?"
    confirmButtonText="Eliminar"
    cancelButtonText="Cancelar"
    @cancel="closeDeleteModal"
    @confirmed="confirmDelete"
  />
  
  <!-- Modal de edición de evento -->
  <EditEventModal
    v-if="selectedEvent && showEditModal"
    :visible="showEditModal"
    :event="selectedEvent"
    @cancel="closeEditModal"
    @submit="submitEdit"
  />
</template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuth } from '../../api/auth/useAuth'
  import { formatTimestamp } from '../../utils/formatTimestamp'
  import { useEventsStore } from '../../stores/events'
  import GenericConfirmModal from '../../components/molecules/GenericConfirmModal.vue'
  import EditEventModal from './EditEventModal.vue'
  
  const props = defineProps({
    event: {
      type: Object,
      required: true,
    }
  })
  
  const router = useRouter()
  const { user } = useAuth()
  const showDeleteModal = ref(false)
  const eventsStore = useEventsStore()
  const showEditModal = ref(false)
  const selectedEvent = ref({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    privacy: 'public',
    capacity: 0,
    location: { address: '' }
  })
  function goToDetail() {
    router.push({ name: 'eventDetail', params: { idEvent: props.event.idDoc } })
  }
  const formattedStartTime = computed(() => {
    if (!props.event.startTime) return 'No definida'
    return formatTimestamp(props.event.startTime, { includeTime: true })
  })
  const formattedEndTime = computed(() => {
    if (!props.event.endTime) return ''
    return formatTimestamp(props.event.endTime, { includeTime: true })
  })
  
  // Estado y lógica para el Attendance (inscripción)
  const isGoing = computed(() => {
    return props.event?.attendees?.going?.includes(user.value?.uid)
  })
  const attendanceLabel = computed(() => (isGoing.value ? 'Cancelar asistencia' : 'Asistiré'))

  async function handleAttendance() {
    if (!user.value) {
      console.log('Usuario no autenticado')
      return
    }
    const status = isGoing.value ? null : 'going'
    await eventsStore.setUserAttendanceStatus(props.event.idDoc, user.value.uid, status)
    console.log(`Usuario ${isGoing.value ? 'Confirma asistencia' : 'Cancela asistencia'} al evento: ${props.event.idDoc},  ${props.event.title}`)
  }
  
  // Funciones para abrir y cerrar el modal de eliminacion
  function handleDelete() {
    showDeleteModal.value = true
    document.body.style.overflow = 'hidden'
  }
  function closeDeleteModal() {
    showDeleteModal.value = false
    document.body.style.overflow = ''
  }
  async function confirmDelete() {
    await eventsStore.deleteEvent(props.event.idDoc)
    closeDeleteModal()
  }

  // Funciones para abrir y cerrar el modal de edicion
  function openEditModal() {
    selectedEvent.value = { ...props.event }
    showEditModal.value = true
    document.body.style.overflow = 'hidden'
  }
  function closeEditModal() {
    showEditModal.value = false
    document.body.style.overflow = ''
  }
  function submitEdit(updatedEvent) {
    // eventsStore.updateEvent(updatedEvent.idDoc, updatedEvent)
    closeEditModal()
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
  