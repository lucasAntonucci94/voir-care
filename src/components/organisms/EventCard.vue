<template>
    <div class="bg-white p-4 rounded-lg shadow-md w-full max-w-lg border border-gray-100 relative hover:shadow-lg dark:bg-gray-800 dark:border-gray-800 text-[#2c3e50] dark:text-white">
      <!-- Encabezado del evento -->
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold">{{ event?.title }}</h3>
        <div class="flex items-center gap-2">
          <!-- Botón Eliminar -->
          <button
          v-if="event.ownerId === user?.uid || event.ownerId === user?.id || user.isAdmin"
          class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          @click="handleDelete"
        >
          <i class="fa-solid fa-trash"></i>
        </button>
        </div>
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
      <div class="flex justify-between items-start mt-3 text-sm gap-4">
        <!-- Info del evento -->
        <div class="flex flex-col space-y-1">
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
        </div>
        <!-- Botón RSVP alineado a la derecha -->
        <div class="self-end">
          <button
            v-if="event.ownerId !== user?.uid"
            class="px-4 py-2 bg-primary text-white rounded hover:bg-primary-md transition"
            @click="handleRSVP"
            :disabled="!user"
          >
            {{ rsvpLabel }}
          </button>
          <button
            v-else
            class="px-4 py-2 bg-primary text-white rounded hover:bg-primary-md transition"
            @click="openEditModal"
            :disabled="!user"
          >
            Editar
          </button>
        </div>
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
      <!-- Modal de confirmación de eliminación -->
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      >
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            ¿Eliminar evento?
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-6">
            Esta acción no se puede deshacer. ¿Querés continuar?
          </p>
          <div class="flex justify-end gap-3">
            <button
              class="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500"
              @click="closeDeleteModal"
            >
              Cancelar
            </button>
            <button
              class="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
              @click="confirmDelete"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de edición de evento -->
      <div
        v-if="showEditModal"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
      >
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-xl relative">
          <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">
            Editar Evento
          </h3>

          <div class="space-y-3">
            <input
              v-model="editForm.title"
              type="text"
              placeholder="Título"
              class="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
            />

            <textarea
              v-model="editForm.description"
              rows="3"
              placeholder="Descripción"
              class="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
            ></textarea>

            <div class="flex gap-3">
              <input
                v-model="editForm.startTime"
                type="datetime-local"
                class="w-full px-3 py-2 rounded border text-sm dark:bg-gray-700 dark:text-white"
              />
              <input
                v-model="editForm.endTime"
                type="datetime-local"
                class="w-full px-3 py-2 rounded border text-sm dark:bg-gray-700 dark:text-white"
              />
            </div>

            <select
              v-model="editForm.privacy"
              class="w-full px-3 py-2 rounded border text-sm dark:bg-gray-700 dark:text-white"
            >
              <option value="public">Público</option>
              <option value="private">Privado</option>
            </select>

            <input
              v-model="editForm.capacity"
              type="number"
              placeholder="Capacidad"
              class="w-full px-3 py-2 rounded border text-sm dark:bg-gray-700 dark:text-white"
            />

            <input
              v-model="editForm.location.address"
              type="text"
              placeholder="Ubicación"
              class="w-full px-3 py-2 rounded border text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Acciones -->
          <div class="flex justify-end gap-3 mt-6">
            <button
              class="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500"
              @click="closeEditModal"
            >
              Cancelar
            </button>
            <button
              class="px-4 py-2 rounded bg-primary text-white hover:bg-primary-md"
              @click="submitEdit"
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </div>

    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { useAuth } from '../../api/auth/useAuth'
  import { formatTimestamp } from '../../utils/formatTimestamp'
  import { useEventsStore } from '../../stores/events'

  const props = defineProps({
    event: {
      type: Object,
      required: true,
    }
  })
  
  const { user } = useAuth()
  const showMediaModal = ref(false)
  const showDeleteModal = ref(false)
  const eventsStore = useEventsStore()
  const showEditModal = ref(false)
  const editForm = ref({ ...props.event })
  
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
  
  // Funciones para abrir y cerrar el modal de media
  function openEditModal() {
    showEditModal.value = true
    document.body.style.overflow = 'hidden'
  }
  function closeEditModal() {
    showEditModal.value = false
    document.body.style.overflow = ''
  }
  
  function handleDelete() {
    showDeleteModal.value = true
    document.body.style.overflow = 'hidden'
  }
  function closeDeleteModal() {
    showDeleteModal.value = false
    document.body.style.overflow = ''
  }
  
  function confirmDelete() {
    eventsStore.deleteEvent(props.event.idDoc)
    closeDeleteModal()
  }

  function submitEdit() {
    debugger
    const updatedEvent = {
      title: editForm.value.title,
      description: editForm.value.description,
      media: props.event.media,
      mediaPath: props.event.mediaPath,
      mediaType: props.event.mediaType,
      categories: props.event.categories,
      privacy: editForm.value.privacy,
      ownerId: props.event.ownerId,
      // startTime: editForm.value.startTime,
      // endTime: editForm.value.endTime,
      startTime: editForm.value.startTime ? new Date(editForm.value.startTime).toISOString().split('T')[0] : '',
      endTime: editForm.value.endTime ? new Date(editForm.value.endTime ).toISOString().split('T')[0] : '',
      location: {
        address: editForm.value.location?.address || '',
        lat: null,
        lng: null
      },
      capacity: Number(editForm.value.capacity),
      members: props.event.members
    }
    // eventsStore.updateEvent(props.event.idDoc, updatedEvent)
    showEditModal.value = false
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
  