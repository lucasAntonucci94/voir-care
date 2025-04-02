<template>
  <div>
    <div class="p-4 bg-white dark:bg-gray-800 dark:text-gray-300 rounded-lg shadow-md">
      <FullCalendar ref="calendarRef" :options="calendarOptions" />
    </div>
    <ShowEventModal
    :event="selectedEvent"
    :visible="showModal"
    @close="closeModal"
    />
  </div>
  </template>
  
  <script setup>
  import { ref, watch, computed, nextTick, onMounted  } from 'vue';
  import { useEventsStore } from '../../stores/events';
  import FullCalendar from '@fullcalendar/vue3';
  import dayGridPlugin from '@fullcalendar/daygrid';
  import ShowEventModal from '../organisms/ShowEventModal.vue';
  
  const eventsStore = useEventsStore();
  const calendarRef = ref(null);
  const showModal = ref(false)
  const selectedEvent = ref(null)

  // Mapear los eventos al formato requerido por FullCalendar
  const calendarEvents = computed(() =>
    eventsStore.allEvents?.value?.map(event => ({
      id: event.idDoc,
      title: event.title,
      start: event.startTime?.toDate(),
      end: event.endTime ? event.endTime.toDate() : null,
      extendedProps: {
        ...event
      }
    }))
  );

  const calendarOptions = {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    events: [],
    locale: 'es',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay',
    },
    eventContent: function(arg) {
    return {
      html: `
        <div class="fc-event-custom">
          <strong>${arg.event.title}</strong>
          <br/>
          <small>${arg.timeText}</small>
        </div>
      `
    }
  },
  eventClick: function(info) {
    const evento = info.event.extendedProps
    selectedEvent.value = evento
    showModal.value = true
    document.body.style.overflow = 'hidden';
  },
  };

  const closeModal = () => {
    showModal.value = false
    document.body.style.overflow = '';
  }

  watch(calendarEvents, async (newEvents) => {
    await nextTick(); // coloco nextTick para que el DOM se actualice antes de acceder a la API del calendar.
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
  </style>
  