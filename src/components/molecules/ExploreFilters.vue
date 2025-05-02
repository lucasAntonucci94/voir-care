<template>
  <div class="p-6 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto">
    <!-- Título y botón de borrar filtros -->
    <div class="flex items-center justify-between mb-6 bg-gray-100 dark:bg-gray-900 p-4 rounded-xl shadow-sm">
      <div class="flex items-center gap-3">
        <i class="fa-solid fa-filter text-indigo-600 dark:text-indigo-400 text-lg"></i>
        <h3 class="text-xl font-bold text-indigo-600 dark:text-indigo-400">
          Filtrar
          <span
            v-if="modelValue.length"
            class="ml-2 px-2 py-1 bg-indigo-100 dark:bg-indigo-700 text-indigo-800 dark:text-indigo-200 rounded-full text-xs"
          >
            {{ modelValue.length }}
          </span>
        </h3>
      </div>
      <button
        v-if="modelValue.length"
        @click="deleteAllFilters"
        class="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 dark:hover:bg-red-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Borrar todos los filtros"
        :disabled="!modelValue.length"
      >
        <i class="fa-solid fa-trash-can"></i>
        <!-- Borrar filtros -->
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
        <span v-if="modelValue.length > 0" class="ml-2 text-sm text-indigo-600 dark:text-indigo-400">
          ({{ modelValue.length }})
        </span>
      </span>
      <i :class="showFilters ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'" class="text-lg"></i>
    </button>

    <!-- Lista de filtros -->
    <div
      :class="{
        'max-h-0': !isDesktop && !showFilters,
        'max-h-screen': isDesktop || showFilters,
        'overflow-hidden': !isDesktop
      }"
      class="flex flex-col gap-2 transition-all duration-300"
    >
      <label
        v-for="filter in filters"
        :key="filter.id"
        class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer"
      >
        <input
          type="checkbox"
          :value="filter.id"
          :checked="modelValue.includes(filter.id)"
          @change="onChange(filter.id, $event.target.checked)"
          class="hidden"
        />
        <span
          :class="modelValue.includes(filter.id) ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-gray-200 dark:bg-gray-600'"
          class="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200"
        >
          <i v-if="modelValue.includes(filter.id)" class="fa-solid fa-check text-white text-sm"></i>
        </span>
        <span class="text-sm font-medium text-gray-800 dark:text-gray-100">{{ filter.label }}</span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
});

const filters = ref([
    { id: 'veterinaria', label: 'Veterinaria' },
    { id: 'petshop', label: 'Pet Shop' },
    { id: 'guarderia', label: 'Guardería' },
    { id: 'petfriendly', label: 'Pet Friendly' },
    { id: 'parque', label: 'Parque' },
    { id: 'servicio', label: 'Servicio' },
]);

const emit = defineEmits(['update:modelValue']);

// Estado Reactivo
const isDesktop = ref(false);
const showFilters = ref(false); // Controla si los filtros están expandidos en mobile

// Detectar si estamos en desktop o mobile
const checkIfDesktop = () => {
  isDesktop.value = window.innerWidth >= 768; // 768px es el breakpoint para md en Tailwind
  if (isDesktop.value) {
    showFilters.value = true; // En desktop, los filtros siempre están expandidos
  }
};

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
}
</style>