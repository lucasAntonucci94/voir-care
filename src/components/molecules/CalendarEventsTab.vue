<template>
    <div class="p-4 bg-white dark:bg-gray-800 dark:text-gray-300 rounded-lg shadow-md">
      <FullCalendar ref="calendarRef" :options="calendarOptions" />
    </div>
  </template>
  
  <script setup>
  import { ref, watch, computed, nextTick, onMounted  } from 'vue';
  import { useEventsStore } from '../../stores/events';
  import FullCalendar from '@fullcalendar/vue3';
  import dayGridPlugin from '@fullcalendar/daygrid';
  
  const eventsStore = useEventsStore();
  const calendarRef = ref(null);

  // Mapear los eventos al formato requerido por FullCalendar
  const calendarEvents = computed(() =>
    eventsStore.allEvents?.value?.map(event => ({
      id: event.idDoc,
      title: event.title,
      start: event.startTime?.toDate(),
      end: event.endTime ? event.endTime.toDate() : null,
    }))
  );
  console.log('Eventos calendar del store:', calendarEvents);
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
    // Aquí puedes manejar el clic en el evento, por ejemplo, abrir un modal con más detalles
    console.log('Evento clicado:', info.event.title);
  },
  };

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
  /* Puedes agregar estilos personalizados aquí si es necesario */
  </style>
  