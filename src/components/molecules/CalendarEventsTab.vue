<template>
  <div>
    <!-- Header -->
    <div class="flex flex-wrap justify-between items-center mb-4 gap-4">
      <h2 class="text-xl font-semibold text-gray-700 dark:text-white">Calendario de eventos</h2>
      <div class="flex gap-3 flex-wrap">
        <!-- Filtro por título -->
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar evento..."
          class="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />

        <!-- Select de categorías (opcional si se implementa luego) -->
        <!--
        <select
          v-model="selectedCategory"
          class="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="">Todas las categorías</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
        -->
      </div>
    </div>

    <div class="p-4 bg-white dark:bg-gray-900 dark:text-gray-200 rounded-xl shadow-lg">
      <FullCalendar ref="calendarRef" :options="calendarOptions" />
    </div>

    <ShowEventModal :event="selectedEvent" :visible="showModal" @close="closeModal" />
  </div>
</template>

<script setup>
import { ref, watch, computed, nextTick, onMounted } from 'vue';
import { useEventsStore } from '../../stores/events';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import ShowEventModal from '../organisms/ShowEventModal.vue';

const eventsStore = useEventsStore();
const calendarRef = ref(null);
const showModal = ref(false);
const selectedEvent = ref(null);
const searchQuery = ref('');
// const selectedCategory = ref('');

const calendarEvents = computed(() => {
  return eventsStore.allEvents?.value
    ?.filter(event => event.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
    // .filter(event => !selectedCategory.value || event.categories?.some(c => c.id === selectedCategory.value))
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
  aspectRatio: 1.5,
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

<style scoped>
.fc-event-custom {
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: var(--fc-event-bg-color, #1e90ff);
  color: white;
  text-align: center;
}
</style>
