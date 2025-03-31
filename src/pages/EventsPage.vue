<template>
  <div class="flex min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="flex-1 overflow-y-auto">
      <!-- Encabezado -->
      <div class="bg-white dark:bg-gray-800 shadow-sm">
        <div class="container mx-auto px-4 md:px-8 lg:px-16 py-4 flex items-center justify-between">
          <h1 class="text-xl font-bold text-[#2c3e50] dark:text-white">Eventos</h1>
          <button
            @click="handleModalCreate"
            class="hidden sm:inline-flex px-4 py-2 bg-primary dark:bg-secondary text-white rounded-full hover:bg-primary-md dark:hover:bg-secondary-md transition-colors"
          >
            + Crear Evento
          </button>
        </div>
        <!-- Tabs específicos para eventos -->
        <div class="container mx-auto px-4 md:px-8 lg:px-16">
          <div class="mt-4 flex gap-2 overflow-x-auto scrollbar-hide whitespace-nowrap">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[ 
                'px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200',
                activeTab === tab.id
                  ? 'bg-primary hover:bg-primary-md dark:bg-secondary dark:hover:bg-secondary-md text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'
              ]"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Contenido de cada tab -->
      <div class="container mx-auto px-4 md:px-8 lg:px-16 my-6">
        <!-- Próximos Eventos -->
        <UpcomingEventsTab v-if="activeTab === 'upcoming'" />
        <!-- Descubrir Eventos -->
        <DiscoverEventsTab v-else-if="activeTab === 'discover'" />
        <!-- Tus Eventos -->
        <UserEventsTab v-else-if="activeTab === 'userEvents'" />
        <!-- Eventos Destacados -->
        <!-- <FeaturedEventsTab v-else-if="activeTab === 'featured'" /> -->
        <!-- <div v-else-if="activeTab === 'featured'">
          <h2 class="text-lg font-semibold text-[#2c3e50] dark:text-white mb-4">Eventos Destacados</h2>
          <EventCard
            v-for="event in featuredEvents"
            :key="event.idDoc"
            :event="event"
          />
          <p v-if="featuredEvents.length === 0" class="text-center text-gray-500">
            No hay eventos destacados.
          </p>
        </div> -->
       
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuth } from '../api/auth/useAuth'
import { useEventsStore } from '../stores/events'
import EventCard from '../components/organisms/EventCard.vue'
import CreateEventModal from '../components/organisms/CreateEventModal.vue'
import UpcomingEventsTab from '../components/molecules/UpcomingEventsTab.vue'
import DiscoverEventsTab from '../components/molecules/DiscoverEventsTab.vue'
import UserEventsTab from '../components/molecules/UserEventsTab.vue'

const { user } = useAuth()
const eventsStore  = useEventsStore()

// Estado
const showModalCreate = ref(false);
const isLoading = ref(false)

// Definición de las tabs
const tabs = [
  { id: 'upcoming', label: 'Proximamente' },
  { id: 'discover', label: 'Descubrir' },
  { id: 'userEvents', label: 'Tus Eventos' },
]
const activeTab = ref('upcoming')

const handleModalCreate = () => {
  showModalCreate.value = true
  document.body.style.overflow = 'hidden';

}
const closeModalCreate = () => {
  showModalCreate.value = false
  document.body.style.overflow = '';
}

// Suscribirse a los eventossegun el tab seleccionado
watch(activeTab, (tab) => {
  if (tab === 'upcoming') {
    eventsStore.subscribeUpcomingEvents()
  } else {
    eventsStore.unsubscribeUpcomingEvents()
  }

  if (tab === 'discover') {
    eventsStore.subscribeAllEvents()
  } else {
    eventsStore.unsubscribeAllEvents()
  }

  if (tab === 'userEvents' && user.value) {
    eventsStore.subscribeUserEvents(user.value.uid)
  } else {
    eventsStore.unsubscribeUserEvents()
  }
}, { immediate: true })
// Desuscribirse al desmontar el componente
onUnmounted(() => {
  eventsStore.unsubscribeUpcomingEvents()
  eventsStore.unsubscribeUserEvents()
  eventsStore.unsubscribeAllEvents()
})
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
