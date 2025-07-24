<template>
  <div
    class="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden w-full max-w-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl cursor-pointer flex flex-col h-full transition transition-transform hover:scale-101"
    @click="goToDetail"
  >
    <!-- Media -->
    <div v-if="event?.media" class="relative h-40 w-full">
      <img
        v-if="event?.mediaType === 'image'"
        :src="event?.media"
        :alt="event?.title"
        class="w-full h-full object-cover transition-opacity duration-300"
        loading="lazy"
      />
      <video
        v-else-if="event?.mediaType === 'video'"
        :src="event?.media"
        class="w-full h-full object-cover"
        autoplay
        loop
        muted
      />
      <!-- Badge de privacidad -->
      <span
        class="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold text-white rounded-full shadow-sm"
        :class="event.privacy === 'public' ? 'bg-green-500' : 'bg-red-500'"
      >
        {{ event.privacy === 'public' ? 'Público' : 'Privado' }}
      </span>
      <!-- Fecha de inicio superpuesta -->
      <div class="absolute bottom-1 left-2 z-20">
        <div class="w-10 h-10 bg-red-500 text-white flex items-center justify-center rounded-lg font-bold text-2xl shadow-md">
          {{ formatEventDate(event.startTime).dayBox }}
        </div>
        <span class="text-xs mt-1 text-white text-center font-bold block bg-red-700 p-1 rounded-lg">
          {{ formatEventDate(event.startTime).label.split(' a las ')[0] }}
        </span>
      </div>
    </div>
    <div
      v-else
      class="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500"
    >
      <i class="fas fa-image text-3xl"></i>
    </div>

    <!-- Contenido -->
    <div class="p-4 space-y-2 text-sm text-gray-800 dark:text-gray-200 flex-grow">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ event.location?.address || 'Ubicación no definida' }}
      </p>
      <h3 class="text-xl font-semibold">{{ event?.title }}</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
        {{ event.description || 'Sin descripción' }}
      </p>
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
    </div>

    <!-- Footer con miembros y modalidad -->
    <div class="p-4 border-t border-gray-100 dark:border-gray-700">
      <div class="flex justify-between items-center flex-wrap gap-y-2">
        <div class="flex gap-2">
          <span
            class="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
          >
            <i class="fas fa-users text-primary dark:text-secondary"></i>
            {{ event?.attendees?.going?.length > 0 ? event?.attendees?.going?.length - 1 : 0 }}
            {{ event?.attendees?.going?.length === 1 ? 'participante' : 'participantes' }}
          </span>
          <span
            v-if="event.modality === 0 || event.modality === 1"
            class="px-2 py-1 text-xs font-medium rounded-full"
            :class="
              event.modality === 0
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-blue-200'
                : 'bg-purple-100 text-purple-700 dark:bg-purple-600 dark:text-purple-200'
            "
          >
            {{ event.modality === 0 ? 'Presencial' : 'Virtual' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

// Función para formatear la fecha
function formatEventDate(timestamp) {
  if (!timestamp) return { dayBox: 'N/A', label: 'Fecha no definida' };
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

const props = defineProps({
  event: {
    type: Object,
    required: true,
  },
});

const router = useRouter();

function goToDetail() {
  router.push({ name: 'eventDetail', params: { idEvent: props.event.idDoc } });
}
</script>

<style scoped>
/* Ajustar el diseño del card */
.rounded-2xl {
  border-radius: 1rem;
}

/* Mejorar sombras */
.shadow-md {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.shadow-xl {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.15);
}

/* Mejorar el texto */
.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.leading-relaxed {
  line-height: 1.625;
}

/* Estilo para el badge de privacidad */
.rounded-full {
  font-size: 0.75rem;
  line-height: 1rem;
}
</style>