<template>
  <div>
    <!-- Header -->
    <div class="flex flex-wrap justify-between items-center mb-4 gap-4">
      <h2 class="text-xl font-semibold text-gray-700 dark:text-white sr-only">Calendario de eventos</h2>
      <!-- Filtros de eventos -->
      <EventFilters
        v-model="searchQuery"
        v-model:selectedCategory="selectedCategory"
        :categories="categories"
        :showSearch="true"
        :showSelect="true"
      />
    </div>
    <!-- Calendario -->
    <div class="p-4 bg-white dark:bg-gray-900 dark:text-gray-200 rounded-xl shadow-lg">
      <FullCalendar ref="calendarRef" :options="calendarOptions" />
    </div>

    <!-- Modal -->
    <ShowEventModal v-if="selectedEvent" :event="selectedEvent" :visible="showModal" @close="closeModal" />
  </div>
</template>

<script setup>
import { ref, watch, computed, nextTick, onMounted } from 'vue';
import { useEventsStore } from '../../stores/events';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import ShowEventModal from '../organisms/ShowEventModal.vue';
import EventFilters from '../molecules/EventFilters.vue';

const eventsStore = useEventsStore();
const calendarRef = ref(null);
const showModal = ref(false);
const selectedEvent = ref(null);
const searchQuery = ref('');
const selectedCategory = ref('');

// Tus categorías
const categories = [
  { id: 'adopcion', name: 'Adopción' },
  { id: 'educacion', name: 'Educación' },
  { id: 'salud', name: 'Salud y Bienestar' },
  { id: 'recreativo', name: 'Recreativo' },
  { id: 'competencia', name: 'Concursos y Muestras' },
  { id: 'voluntariado', name: 'Voluntariado' },
  { id: 'beneficencia', name: 'Solidarios' },
  { id: 'otros', name: 'Otros' }
]

// Eventos para el calendario
const calendarEvents = computed(() => {
  return eventsStore.allEvents?.value
    ?.filter(event =>event.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
    .filter(event =>!selectedCategory.value ||event.categories?.some(c => c.id === selectedCategory.value))
    .map(event => ({
      id: event.idDoc,
      title: event.title,
      start: event.startTime?.toDate(),
      end: event.endTime ? event.endTime.toDate() : null,
      extendedProps: {
        ...event
      }
    }));
});

const calendarOptions = {
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  events: [],
  locale: 'es',
  aspectRatio: 1.7,
  dayMaxEventRows: true,
  fixedWeekCount: false,
  displayEventEnd: true,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,dayGridWeek,dayGridDay',
  },
  eventContent: function(arg) {
    return {
      html: `
        <div class="px-2 py-1 bg-primary text-white rounded text-xs text-center">
          ${arg.event.title}
        </div>
      `
    };
  },
  eventClick: function(info) {
    const evento = info.event.extendedProps;
    selectedEvent.value = evento;
    showModal.value = true;
    document.body.style.overflow = 'hidden';
  },
};

const closeModal = () => {
  showModal.value = false;
  document.body.style.overflow = '';
};

watch(calendarEvents, async (newEvents) => {
  await nextTick();
  const calendarApi = calendarRef.value?.getApi();
  if (calendarApi) {
    calendarApi.removeAllEvents();
    calendarApi.addEventSource(newEvents);
  }
});

onMounted(async () => {
  await nextTick();
  const calendarApi = calendarRef.value?.getApi();
  if (calendarApi && calendarEvents?.value?.length > 0) {
    calendarApi.removeAllEvents();
    calendarApi.addEventSource(calendarEvents.value);
  }
});
</script>