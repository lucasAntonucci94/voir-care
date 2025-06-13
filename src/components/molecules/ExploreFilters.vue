<template>
  <div class="relative p-6 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 max-h-[100vh]">
    <div v-if="user?.isSuscribed || user?.isAdmin" class="flex-col items-center mb-2">
        <p class="text-sm text-gray-700 dark:text-gray-300 font-bold mb-2">Queres adherirte a nuestro mapa?</p>
        <button class="px-4 py-2 mb-5 dark:bg-primary bg-secondary text-white rounded-lg shadow-lg hover:bg-primary-dark transition-all duration-300"
        @click="openCreateModal" aria-label="Agregar lugar">
        <i class="fa-solid fa-plus mr-2"></i> Agregar Lugar
      </button>
    </div>
    <!-- Título y botón de borrar filtros -->
    <div class="flex items-center justify-between mb-6 bg-gray-100 dark:bg-gray-900 p-4 rounded-xl shadow-sm">
      <div class="flex items-center gap-3">
        <i class="fa-solid fa-filter  text-primary dark:text-secondary text-lg"></i>
        <h3 class="text-xl font-bold text-primary dark:text-secondary">
          Filtrar
          <span
            v-if="modelValue.length"
            class="ml-2 px-2 py-1 bg-primary/70 dark:bg-secondary/70 text-gray-100 rounded-full text-xs hidden md:inline-block"
          >
            {{ modelValue.length }}
          </span>
        </h3>
      </div>
      <button
        @click="centerOnUserLocation"
        class="md:hidden flex items-center gap-1 md:gap-2 px-3 md:px-5 py-1.5 md:py-2 bg-white text-primary dark:text-secondary rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300"
        :disabled="loadingLocation"
      >
        <i :class="loadingLocation ? 'fa-solid fa-spinner animate-spin' : 'fa-solid fa-location-crosshairs'" class="h-4 w-4 md:h-5 md:w-5"></i>
        <span class="text-sm md:text-base">{{ loadingLocation ? 'Buscando...' : 'Mi Ubicación' }}</span>
      </button>
      <button
        v-if="modelValue.length"
        @click="deleteAllFilters"
        class="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 dark:hover:bg-red-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Borrar todos los filtros"
        :disabled="!modelValue.length"
      >
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>

    <!-- Botón para colapsar/expandir en mobile -->
    <button
      v-if="!isDesktop"
      @click="toggleFilters"
      class="md:hidden flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm mb-4 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300"
      :aria-label="showFilters ? 'Ocultar filtros de búsqueda' : 'Mostrar filtros de búsqueda'"
      :aria-expanded="showFilters"
    >
      <span class="font-semibold">
        {{ showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros' }}
        <span v-if="modelValue.length > 0" class="ml-2 text-sm text-primary dark:text-secondary">
          ({{ modelValue.length }})
        </span>
      </span>
      <i :class="showFilters ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'" class="text-lg"></i>
    </button>

    <!-- Lista de filtros -->
    <div
      :class="{
        'max-h-0 overflow-hidden': !isDesktop && !showFilters,
        'max-h-[35vh] md:max-h-[83vh] overflow-y-auto': isDesktop || showFilters
      }"
      class="flex flex-col gap-2 transition-all duration-300"
    >
      <label
        v-for="filter in filters"
        :key="filter.id"
        class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer"
        :class="{ 'shadow-md': modelValue.includes(filter.id) }"
      >
        <input
          type="checkbox"
          :value="filter.id"
          :checked="modelValue.includes(filter.id)"
          @change="onChange(filter.id, $event.target.checked)"
          class="hidden"
        />
        <span
          :class="modelValue.includes(filter.id) ? 'bg-primary dark:bg-secondary/80' : 'bg-gray-200 dark:bg-gray-600'"
          class="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200"
        >
          <i v-if="modelValue.includes(filter.id)" class="fa-solid fa-check text-white text-sm"></i>
        </span>
        <img :src="filter.icon" :alt="`${filter.label} icon`" class="w-6 h-6 object-contain" />
        <span class="text-sm font-medium text-gray-800 dark:text-gray-100">{{ filter.label }}</span>
      </label>
    </div>
    <CreateLocationModal :visible="showCreateModal" @close="closeCreateModal" />
  </div>
</template>

<script setup>
import { ref, defineEmits, onMounted, watch } from 'vue';
import CreateLocationModal from '../../components/organisms/CreateLocationModal.vue';
import { useAuth } from '../../api/auth/useAuth.js'

import CatIcon from '../../assets/icons/cat_1.png';
import VetIcon from '../../assets/icons/locations/veterinary 2.png';
import TrainerIcon from '../../assets/icons/locations/trainer1.png';
import GroomingIcon from '../../assets/icons/locations/groomer2.png';
import PaseadorIcon from '../../assets/icons/locations/walking-the-dog.png';
import GuarderiaIcon from '../../assets/icons/locations/guardery4.png';
import ParqueIcon from '../../assets/icons/locations/park.png';
import PetfriendlyIcon from '../../assets/icons/locations/petfriendly3.png';
import PetShopIcon from '../../assets/icons/locations/assistant.png';
import EtologoIcon from '../../assets/icons/locations/veterinary.png';
import PetSitterIcon from '../../assets/icons/locations/guarderia3.png';
import ShelterIcon from '../../assets/icons/locations/animal-shelter.png';
import EmergencyIcon from '../../assets/icons/locations/first-aid-kit.png';
import TherapyIcon from '../../assets/icons/locations/rehab1.png';


const { user } = useAuth();

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  flagCentered: {
    type: Boolean,
    default: false
  }
});

const filters = ref([
  { id: 'veterinaria', label: 'Veterinaria', icon: VetIcon },
  { id: 'petshop', label: 'Pet Shop', icon: PetShopIcon },
  { id: 'guarderia', label: 'Guardería', icon: GuarderiaIcon },
  { id: 'peluqueria', label: 'Peluquería y Baño', icon: GroomingIcon },
  { id: 'cuidador', label: 'Cuidadores', icon: PetSitterIcon },
  { id: 'etologo', label: 'Etólogo', icon: EtologoIcon },
  { id: 'paseador', label: 'Paseador', icon: PaseadorIcon },
  { id: 'entrenador', label: 'Entrenadores de Mascotas', icon: TrainerIcon },
  { id: 'parque', label: 'Parques y Plazas', icon: ParqueIcon },
  { id: 'petfriendly', label: 'Lugares Pet-Friendly', icon: PetfriendlyIcon },
  { id: 'refugio', label: 'Refugios y Adopción', icon: ShelterIcon },
  // { id: 'eventos', label: 'Eventos Pet-Friendly', icon: EventIcon },
  { id: 'emergencias', label: 'Emergencias', icon: EmergencyIcon },
  // { id: 'alojamiento', label: 'Alojamientos Pet-Friendly', icon: AccommodationIcon },
  // { id: 'suministros', label: 'Entrega de Suministros', icon: DeliveryIcon },
  { id: 'rehabilitacion', label: 'Rehabilitación y Terapia', icon: TherapyIcon },
]);

const emit = defineEmits(['update:modelValue', 'center-location']);

watch(
  () => [props.flagCentered, props.modelValue], ([flagCentered]) => {
    if (flagCentered) {
      setTimeout(() => {
        centerOnUserLocation();
      }, 1000);    }
  }
);

// Estado Reactivo
const isDesktop = ref(false);
const showFilters = ref(false); // Controla si los filtros están expandidos en mobile
const showCreateModal = ref(false);
const loadingLocation = ref(false);

// Detectar si estamos en desktop o mobile
const checkIfDesktop = () => {
  isDesktop.value = window.innerWidth >= 768; // 768px es el breakpoint para md en Tailwind
  if (isDesktop.value) {
    showFilters.value = true; // En desktop, los filtros siempre están expandidos
  }
};
function centerOnUserLocation() {
  emit('center-location');
}
// Logica de modal y formulario
function openCreateModal() {
  showCreateModal.value = true;
}

function closeCreateModal() {
  showCreateModal.value = false;
}

onMounted(() => {
  checkIfDesktop();
  window.addEventListener('resize', checkIfDesktop);
});

// Métodos
function deleteAllFilters() {
  emit('update:modelValue', []);
}

function onChange(id, checked) {
  const updated = [...props.modelValue];
  if (checked && !updated.includes(id)) {
    updated.push(id);
  } else if (!checked && updated.includes(id)) {
    const index = updated.indexOf(id);
    if (index !== -1) updated.splice(index, 1);
  }
  emit('update:modelValue', updated);
}

function toggleFilters() {
  showFilters.value = !showFilters.value;
}
</script>

<style scoped>
/* Estilo para los checkboxes personalizados */
input + span {
  transition: background-color 0.3s ease, transform 0.2s ease;
}
input:checked + span {
  transform: scale(1.05);
}
label:hover span {
  transform: scale(1.1);
}

/* Estilo para los íconos */
img {
  filter: brightness(0.9); /* Suaviza los íconos para que no sean demasiado brillantes */
  transition: transform 0.2s ease;
}
label:hover img {
  transform: scale(1.1); /* Efecto de hover para los íconos */
}

/* Estilo para la sombra en filtros seleccionados */
.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
}

/* Estilo para el contenedor de filtros */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;
}
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Ajustes responsivos para mobile */
@media (max-width: 767px) {
  .p-6 {
    padding: 1rem; /* Reducir padding en mobile */
  }
  .p-4 {
    padding: 0.75rem; /* Reducir padding del título en mobile */
  }
  .text-xl {
    font-size: 1.125rem; /* Reducir tamaño del título en mobile */
  }
  .px-4 {
    padding-left: 0.75rem;
    padding-right: 0.75rem; /* Reducir padding del botón en mobile */
  }
  .py-2 {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem; /* Reducir padding del botón en mobile */
  }
  img {
    width: 1.25rem; /* Reducir tamaño de íconos en mobile */
    height: 1.25rem;
  }
  .w-6 {
    width: 1.5rem; /* Reducir tamaño del checkbox en mobile */
    height: 1.5rem;
  }
}
</style>