<template>
  <div class="flex min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="flex-1 overflow-y-auto">
      <!-- Encabezado -->
      <div class="bg-white dark:bg-gray-800 shadow-sm">
        <div class="container mx-auto px-4 md:px-8 lg:px-16 py-4 flex items-center justify-between">
          <h1 class="text-xl font-bold text-[rgb(44,62,80)] dark:text-white">
            <i class="fa-solid fa-calendar mr-2 text-primary dark:text-secondary"></i>
            Eventos
          </h1>
          <button
            @click="handleModalCreate"
            class="hidden sm:inline-flex px-4 py-2 bg-primary dark:bg-secondary text-white rounded-full hover:bg-primary-md dark:hover:bg-secondary-md transition-colors"
          >
            + Crear Evento
          </button>
        </div>
      </div>

      <!-- Tabs para eventos -->
      <div class="container mx-auto px-4 md:px-8 lg:px-16">
        <div
          class="mt-4 flex gap-1 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-hide whitespace-nowrap rounded-lg"
        >
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'relative px-4 py-3 text-sm font-medium transition-all duration-300 flex items-center space-x-2',
              activeTab === tab.id
                ? 'text-primary dark:text-secondary border-b-2 border-primary dark:border-secondary'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700',
              tab.hidden ? 'hidden' : ''
            ]"
            :aria-selected="activeTab === tab.id"
            role="tab"
          >
            <i :class="tab.icon" aria-hidden="true"></i>
            <span>{{ tab.label }}</span>
            <!-- Línea indicadora para la pestaña activa -->
            <span
              v-if="activeTab === tab.id"
              class="absolute inset-x-0 bottom-0 h-0.5 bg-primary dark:bg-secondary"
            ></span>
          </button>
        </div>
      </div>
      
      <!-- Contenido de cada tab -->
      <div class="container mx-auto px-4 md:px-8 lg:px-16 my-6">
        <!-- Próximos Eventos -->
        <UpcomingEventsTab v-if="activeTab === 'upcoming'" />
        <!-- Próximos Eventos -->
        <CalendarEventsTab v-else-if="activeTab === 'calendar'" />
        <!-- Descubrir Eventos -->
        <DiscoverEventsTab v-else-if="activeTab === 'discover'" />
        <!-- Tus Eventos -->
        <UserEventsTab v-else-if="activeTab === 'userEvents'" @open-create-modal="handleModalCreate" @open-discover-tab="setDiscoverTab" />
      </div>
    </div>
    <!-- Modal para crear evento -->
    <CreateEventModal
      :visible="showModalCreate"
      @close="closeModalCreate"
      />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CreateEventModal from '../components/organisms/CreateEventModal.vue'
import UpcomingEventsTab from '../components/molecules/UpcomingEventsTab.vue'
import DiscoverEventsTab from '../components/molecules/DiscoverEventsTab.vue'
import UserEventsTab from '../components/molecules/UserEventsTab.vue'
import CalendarEventsTab from '../components/molecules/CalendarEventsTab.vue'

// Estado
const showModalCreate = ref(false);

// Definición de las tabs
const tabs = [
  { id: 'upcoming', label: 'Proximamente', icon: 'fa-solid fa-clock', hidden: false },
  { id: 'calendar', label: 'Calendario', icon: 'fa-solid fa-calendar-days', hidden: false },
  { id: 'discover', label: 'Descubrir', icon: 'fa-solid fa-magnifying-glass', hidden: false },
  { id: 'userEvents', label: 'Tus Eventos', icon: 'fa-solid fa-user-check', hidden: false },
];

const activeTab = ref('upcoming')

const handleModalCreate = () => {
  showModalCreate.value = true
  document.body.style.overflow = 'hidden';

}
const closeModalCreate = () => {
  showModalCreate.value = false
  document.body.style.overflow = '';
}
// Funciones para abrir y cerrar la modal
const setDiscoverTab = () => {
  activeTab.value = 'discover'
}
</script>

<style scoped>
/* Oculta scrollbars en los contenedores scrollables */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

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
</style>
