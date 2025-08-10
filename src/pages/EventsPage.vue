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
              v-if="activeTab === 'userEvents'"
              @click="handleModalCreate"
              class="flex justify-center items-center px-4 py-2 bg-primary dark:bg-secondary text-white rounded-full hover:bg-primary-md dark:hover:bg-secondary-md transition-colors"
              :class="{ 'opacity-50 cursor-not-allowed': !createPermission }"
              :disabled="!createPermission"
            >
              <i class="fa-solid fa-plus"></i>
              <span class="pl-2">
                Crear
              </span>
            </button>
        </div>
      </div>

      <!-- Tabs para eventos -->
      <div class="container mx-auto px-4 md:px-8 lg:px-16">
        <div
          role="tablist"
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
        <!-- Calendario de Eventos -->
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
import { ref, computed } from 'vue'
import CreateEventModal from '../components/organisms/CreateEventModal.vue'
import UpcomingEventsTab from '../components/molecules/UpcomingEventsTab.vue'
import DiscoverEventsTab from '../components/molecules/DiscoverEventsTab.vue'
import UserEventsTab from '../components/molecules/UserEventsTab.vue'
import CalendarEventsTab from '../components/molecules/CalendarEventsTab.vue'
import { useEventsStore } from '../stores/events'
import { useAuth } from '../api/auth/useAuth'
import { isCurrentMonth } from '../utils/isCurrentMonth'

// Inicializa los stores
const eventsStore = useEventsStore()
const { user } = useAuth()

// Estado
const showModalCreate = ref(false);

// Definición de las tabs
const tabs = [
  { id: 'upcoming', label: 'Próximamente', icon: 'fa-solid fa-clock', hidden: false },
  { id: 'calendar', label: 'Calendario', icon: 'fa-solid fa-calendar-days', hidden: false },
  { id: 'discover', label: 'Descubrir', icon: 'fa-solid fa-magnifying-glass', hidden: false },
  { id: 'userEvents', label: 'Tus Eventos', icon: 'fa-solid fa-user-check', hidden: false },
];

const activeTab = ref('upcoming')

// Propiedad computada para determinar el permiso de creación de eventos.
// Esta propiedad es la que se usará para habilitar/deshabilitar el botón de creación.
const createPermission = computed(() => {
  // Si no hay un usuario o no tiene uid retorna false.
  if (!user.value?.uid) return false;
  // Si el usuario está suscripto, retorna true.
  if (user.value.isSuscribed) return true;
  // Si no está suscripto, buscamos el último evento creado del usuario logueado.
  const lastEvent = eventsStore.events?.value?.filter(g => g.ownerId === user.value.uid)?.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate())[0];
  // Si no tiene eventos creados, tiene permiso.
  if (!lastEvent) return true;
  // Si tiene un evento, el permiso es TRUE si el evento NO es de este mes.
  return !isCurrentMonth(lastEvent.createdAt);
});

// Funciones para abrir y cerrar la modal
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
