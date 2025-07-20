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
      <FullCalendar ref="calendarRef" :options="computedCalendarOptions" />
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

// Estado reactivo para detectar si es móvil
const isMobile = ref(false);

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
];

// Eventos para el calendario
const calendarEvents = computed(() => {
  return eventsStore.allEvents?.value
    ?.filter(event => event.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
    .filter(event => !selectedCategory.value || event.categories?.some(c => c.id === selectedCategory.value))
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

// Función para actualizar el estado de isMobile
const checkMobile = () => {
  isMobile.value = window.matchMedia('(max-width: 767px)').matches;
};

// Opciones del calendario computadas para ser reactivas al cambio de media query
const computedCalendarOptions = computed(() => {
  return {
    plugins: [dayGridPlugin],
    initialView: isMobile.value ? 'dayGridDay' : 'dayGridMonth', // Vista inicial condicional
    events: [], // Se llenará con el watcher
    locale: 'es',
    aspectRatio: 1.7,
    dayMaxEventRows: true,
    dayMaxEvents: 3, // Máximo de eventos visibles antes de mostrar "+more"
    fixedWeekCount: false,
    displayEventEnd: true,
    headerToolbar: isMobile.value ? { // Toolbar condicional para móvil
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridWeek,dayGridDay', // Vistas de semana y día en móvil
    } : { // Toolbar para desktop/tablet
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay',
    },
    firstDay: 1, // Comienza la semana en lunes (0 = domingo, 1 = lunes)
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día'
    },
    dayHeaderFormat: { weekday: 'short' }, // Nombres abreviados de los días en las vista
    moreLinkClick: 'popover', // Controla el comportamiento del enlace "+more" (popover)
    moreLinkText: 'Ver más', // Texto personalizado para el enlace "+more"
    eventDisplay: 'block', // Muestra los eventos como bloques
    eventContent: function(arg) {
      return {
        html: `
          <div class="px-2 py-1 font-semibold bg-primary hover:bg-primary-md dark:bg-secondary dark:hover:bg-secondary-md text-white rounded text-xs text-center truncate">
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
      // Crear el elemento tooltip si no es mobile.
      if(!isMobile.value){
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
      }
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
});

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

// Watch para el cambio de isMobile, para forzar la actualización de la vista y recargar eventos
watch(isMobile, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    const calendarApi = calendarRef.value?.getApi();
    if (calendarApi) {
      // Cambia la vista activa según la resolución (Diario para mobile, mensual para desktop y tablet)
      calendarApi.changeView(newVal ? 'dayGridDay' : 'dayGridMonth');
      // Recarga los eventos      
      calendarApi.removeAllEvents();
      calendarApi.addEventSource(calendarEvents.value);
    }
  }
});


onMounted(async () => {
  eventsStore.subscribeAllEvents();
  checkMobile(); // Comprueba el estado inicial al montar
  window.addEventListener('resize', checkMobile); // Añade listener para cambios de tamaño
  
  await nextTick();
  const calendarApi = calendarRef.value?.getApi();
  if (calendarApi && calendarEvents?.value?.length > 0) {
    calendarApi.removeAllEvents();
    calendarApi.addEventSource(calendarEvents.value);
  }
});

onUnmounted(() => {
  eventsStore.unsubscribeAllEvents();
  window.removeEventListener('resize', checkMobile);
  const calendarApi = calendarRef.value?.getApi();
  if (calendarApi) {
    calendarApi.removeAllEvents();
  }
});
</script>

<style scoped>
.fc-tooltip {
  position: absolute;
  background-color: #333;
  color: #fff;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none; /* Asegura que el tooltip no interfiera con eventos del mouse */
  z-index: 1000;
}
</style>