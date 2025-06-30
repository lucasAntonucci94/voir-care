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
import { ref, watch, computed, nextTick, onMounted, onUnmounted } from 'vue';
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
  dayMaxEvents: 3, // Máximo de eventos visibles antes de mostrar "+more"
  fixedWeekCount: false,
  displayEventEnd: true,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,dayGridWeek,dayGridDay',
  },
  firstDay: 1, // Comienza la semana en lunes (0 = domingo, 1 = lunes)
  buttonText: { // Personaliza el texto de los botones
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día'
  },
  dayHeaderFormat: { weekday: 'long' }, // Nombres completos de los días en la vista semanal/diaria
  moreLinkClick: 'popover', // Controla el comportamiento del enlace "+more" (popover)
  eventDisplay: 'block', // Muestra los eventos como bloques
  eventContent: function(arg) {
    return {
      html: `
        <div class="px-2 py-1 font-semibold bg-primary hover:bg-primary-md dark:bg-secondary dark:hover:bg-secondary-md text-white rounded text-xs text-center">
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
  // defino tooltip para hover en evento
  eventMouseEnter: function(info) {
    // Crear el elemento tooltip
    const tooltip = document.createElement('div');
    tooltip.innerHTML = `<strong>${info.event.title}</strong>`;
    tooltip.className = 'fc-tooltip'; // Clase para estilos personalizados
    document.body.appendChild(tooltip);

    // Función para actualizar la posición del tooltip
    const updateTooltipPosition = (e) => {
      tooltip.style.left = (e.pageX + 10) + 'px';
      tooltip.style.top = (e.pageY + 10) + 'px';
    };

    // Posicionar inicialmente el tooltip
    updateTooltipPosition(info.jsEvent);

    // Actualizar la posición cuando el mouse se mueva sobre el elemento del evento
    info.el.addEventListener('mousemove', updateTooltipPosition);

    // Guardar referencias en el elemento para luego eliminarlas
    info.el._tooltip = tooltip;
    info.el._tooltipUpdate = updateTooltipPosition;
  },
  eventMouseLeave: function(info) {
    // Eliminar el tooltip y el listener cuando el mouse salga del evento
    if (info.el._tooltip) {
      info.el.removeEventListener('mousemove', info.el._tooltipUpdate);
      info.el._tooltip.remove();
      info.el._tooltip = null;
      info.el._tooltipUpdate = null;
    }
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
  eventsStore.subscribeAllEvents()
  await nextTick();
  const calendarApi = calendarRef.value?.getApi();
  if (calendarApi && calendarEvents?.value?.length > 0) {
    calendarApi.removeAllEvents();
    calendarApi.addEventSource(calendarEvents.value);
  }
});

onUnmounted(() => {
  eventsStore.unsubscribeAllEvents()
  const calendarApi = calendarRef.value?.getApi();
  if (calendarApi) {
    calendarApi.removeAllEvents();
  }
});
</script>