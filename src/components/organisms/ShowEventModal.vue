<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="fixed inset-0 bg-black/60 z-101 flex items-center justify-center px-4"
        @click.self="emit('close')"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl w-full max-w-2xl relative"
          @click.stop
        >
          <!-- Media del evento con fecha superpuesta -->
          <div v-if="event.media" class="h-56 w-full bg-black relative">
            <img
              v-if="event.mediaType === 'image'"
              :src="event.media"
              :alt="event.title"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <video
              v-else-if="event.mediaType === 'video'"
              :src="event.media"
              muted
              autoplay
              loop
              class="w-full h-full object-cover"
            />
            <!-- Badge de privacidad -->
            <span
              class="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold text-white rounded-full shadow-sm"
              :class="event.privacy === 'public' ? 'bg-green-500' : 'bg-red-500'"
            >
              {{ event.privacy === 'public' ? 'Público' : 'Privado' }}
            </span>
            <!-- Botón cerrar -->
            <button
              @click="emit('close')"
              class="absolute top-3 right-3 w-8 h-8 p-2 text-white bg-gray-900/50 dark:bg-gray-900/70 rounded-full hover:bg-gray-900/70 dark:hover:bg-gray-900/90 flex items-center justify-center transition-colors"
              aria-label="Cerrar modal"
            >
              <i class="fas fa-xmark text-xl"></i>
            </button>
            <!-- Fecha de inicio superpuesta -->
            <div class="absolute bottom-4 left-8 z-20">
              <div class="w-16 h-16 bg-red-500 text-white flex items-center justify-center rounded-lg font-bold text-2xl shadow-md">
                {{ formatEventDate(event.startTime).dayBox }}
              </div>
              <span class="text-xs mt-1 text-white text-center font-bold block bg-red-700 p-1 rounded-lg">{{ formatEventDate(event.startTime).label.split(' a las ')[0] }}</span>
            </div>
          </div>
          <div
            v-else
            class="h-56 w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 relative"
          >
            <i class="fas fa-image text-4xl"></i>
            <!-- Botón cerrar (sin media) -->
            <button
              @click="emit('close')"
              class="absolute top-3 right-3 w-8 h-8 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 rounded-full flex items-center justify-center transition-colors"
              aria-label="Cerrar modal"
            >
              <i class="fas fa-xmark text-xl"></i>
            </button>
          </div>

          <!-- Contenido -->
          <div class="p-6 space-y-6">
            <!-- Título -->
            <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 tracking-wide">{{ event.title }}</h2>

            <!-- Descripción -->
            <p class="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-line line-clamp-4 leading-relaxed">
              {{ event.description || 'Sin descripción disponible.' }}
            </p>

            <!-- Info principal -->
            <div class="text-sm space-y-2 text-gray-700 dark:text-gray-200">
              <div>
                <strong>Ubicación:</strong>
                {{ event.location?.address || 'No definida' }}
              </div>
              <div v-if="event.price">
                <strong>Precio:</strong> ${{ event.price }}
              </div>
              <div>
                <strong>Capacidad:</strong>
                {{ event.capacity || 'Ilimitada' }}
              </div>
              <div class="flex gap-2">
                <span
                  class="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                >
                  <i class="fas fa-users text-primary dark:text-secondary"></i>
                  {{ internalEvent?.attendees?.going?.length || 0 }}
                  {{ internalEvent?.attendees?.going?.length === 1 ? 'participante' : 'participantes' }}
                </span>
                <span
                  v-if="event.modality"
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="
                    event.modality === '1'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-blue-200'
                      : 'bg-purple-100 text-purple-700 dark:bg-purple-600 dark:text-purple-200'
                  "
                >
                  {{ event.modality === '1' ? 'Presencial' : 'Virtual' }}
                </span>
              </div>
            </div>

            <!-- Categorías -->
            <div v-if="event.categories?.length" class="flex flex-wrap gap-2 mt-2">
              <span
                v-for="cat in event.categories"
                :key="cat.id"
                class="text-xs px-3 py-1 rounded-full bg-teal-200/80 text-teal-900 dark:bg-teal-600/80 dark:text-white shadow-sm hover:bg-teal-300 dark:hover:bg-teal-700 transition-all duration-200"
              >
                {{ cat.name }}
              </span>
            </div>

            <!-- Acciones -->
            <div class="flex justify-between items-center mt-6 space-x-2">
              <button
                v-if="event.ownerId !== user?.uid"
                @click.stop="handleAttendance"
                class="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg shadow-md transition-colors duration-200"
                :class="{
                  'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 dark:from-red-600 dark:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800': isGoing,
                  'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 dark:from-green-600 dark:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800': !isGoing
                }"
                :disabled="!user"
              >
                <i :class="isGoing ? 'fas fa-user-minus' : 'fas fa-user-plus'"></i>
                <p class="hidden md:block">{{ attendanceLabel }}</p>
              </button>
              <router-link
                :to="`/event/${event.idDoc}`"
                class="px-4 py-2 text-sm text-primary rounded-lg border border-primary hover:bg-primary hover:text-white transition-colors duration-200 shadow-md"
                @click="emit('close')"
              >
                Ver evento
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { formatTimestamp } from '../../utils/formatTimestamp';
import { useAuth } from '../../api/auth/useAuth';
import { useEventsStore } from '../../stores/events';

const { user } = useAuth();
const eventsStore = useEventsStore();

const props = defineProps({
  event: { type: Object, required: true },
  visible: { type: Boolean, default: false },
});

const emit = defineEmits(['close']);

const internalEvent = ref({ ...props.event });

watch(
  () => props.event,
  (newVal) => {
    internalEvent.value = { ...newVal };
  },
  { deep: true }
);

const isGoing = computed(() => {
  return internalEvent.value?.attendees?.going?.includes(user.value?.uid);
});

const attendanceLabel = computed(() => (isGoing.value ? 'Cancelar' : 'Asistiré'));

async function handleAttendance() {
  if (!user.value) {
    // console.log('Usuario no autenticado');
    return;
  }
  try {
    const status = isGoing.value ? null : 'going';
    await eventsStore.setUserAttendanceStatus(internalEvent.value.idDoc, user.value.uid, status);
    // console.log(
    //   `Usuario ${status === 'going' ? 'Confirma asistencia' : 'Cancela asistencia'} al evento: ${
    //     internalEvent.value.idDoc
    //   }, ${internalEvent.value.title}`,
    // );
    if (!internalEvent.value.attendees) {
      internalEvent.value.attendees = { going: [] };
    }
    if (status === 'going') {
      if (!internalEvent.value.attendees.going.includes(user.value.uid)) {
        internalEvent.value.attendees.going.push(user.value.uid);
      }
    } else {
      internalEvent.value.attendees.going = internalEvent.value.attendees.going.filter(
        (id) => id !== user.value.uid,
      );
    }
    // console.log(
    //   `Usuario ${status ? 'inscrito' : 'removido'} del evento: ${internalEvent.value.title}`,
    // );
  } catch (error) {
    console.error('Error al actualizar asistencia:', error);
  }
}

// Función para formatear la fecha al estilo de la imagen
function formatEventDate(timestamp) {
  if (!timestamp) return 'Fecha no definida';
  const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const dayOfWeek = days[date.getUTCDay()];
  const day = date.getUTCDate();
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const time = date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
  return {
    dayBox: day,
    label: `${dayOfWeek}, ${day} de ${month} de ${year} a las ${time}`
  };
}

// Cerrar el modal con la tecla Escape
function handleKeydown(event) {
  if (event.key === 'Escape' && props.visible) {
    emit('close');
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
/* Estilos para el scroll del modal */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(155, 155, 155, 0.5);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

/* Estilos de transición para el modal */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .bg-white,
.modal-enter-active .dark\:bg-gray-800,
.modal-leave-active .bg-white,
.modal-leave-active .dark\:bg-gray-800 {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .bg-white,
.modal-enter-from .dark\:bg-gray-800,
.modal-leave-to .bg-white,
.modal-leave-to .dark\:bg-gray-800 {
  transform: translateY(-20px);
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
}

.modal-enter-to .bg-white,
.modal-enter-to .dark\:bg-gray-800,
.modal-leave-from .bg-white,
.modal-leave-from .dark\:bg-gray-800 {
  transform: translateY(0);
}
</style>