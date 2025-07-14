<template>
  <div class="flex gap-3 flex-wrap items-center">
    <!-- Filtro por texto -->
    <input
      v-if="showSearch"
      v-model="searchModel"
      type="text"
      placeholder="Buscar evento..."
      class="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary dark:bg-gray-800 dark:text-white"
    />
    <!-- Filtro por categoría -->
    <select
      v-if="showSelect"
      v-model="selectModel"
      name="selectCategories"
      id="selectCategories"
      class="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary dark:bg-gray-800 dark:text-white"
    >
      <option value="">Todas las categorías</option>
      <option
        v-for="category in categories"
        :key="category.id"
        :value="category.id"
      >
        {{ category.name }}
      </option>
    </select>
    <!-- Filtro por fecha -->
    <select
      v-if="showSelectDate"
      v-model="dateFilterModel"
      name="selectDateFilter"
      id="selectDateFilter"
      class="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary dark:bg-gray-800 dark:text-white"
    >
      <option value="all">Todos los eventos</option>
      <option value="upcoming">Próximos eventos</option>
      <option value="past">Eventos pasados</option>
    </select>
    <!-- Filtro por propiedad -->
    <select
      v-if="showOwnership"
      v-model="ownershipModel"
      class="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary dark:bg-gray-800 dark:text-white"
    >
      <option value="all">Todos los eventos</option>
      <option
        v-for="option in ownershipOptions"
        :key="option.id"
        :value="option.id"
      >
        {{ option.name }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { defineModel } from 'vue';

const props = defineProps({
  modelValue: {
    type: String, // Changed to String for consistency with GroupFilters.vue
    default: '',
  },
  selectedCategory: {
    type: String,
    default: '',
  },
  selectedOwnership: {
    type: String,
    default: 'all',
  },
  selectedDateFilter: {
    type: String,
    default: 'upcoming',
  },
  showSearch: {
    type: Boolean,
    default: true,
  },
  showSelect: {
    type: Boolean,
    default: true,
  },
  showSelectDate: {
    type: Boolean,
    default: false,
  },
  showOwnership: {
    type: Boolean,
    default: false,
  },
  categories: {
    type: Array,
    default: () => [
        { id: 'adopcion', name: 'Adopción' },
        { id: 'educacion', name: 'Educación' },
        { id: 'salud', name: 'Salud y Bienestar' },
        { id: 'recreativo', name: 'Recreativo' },
        { id: 'competencia', name: 'Concursos y Muestras' },
        { id: 'voluntariado', name: 'Voluntariado' },
        { id: 'beneficencia', name: 'Solidarios' },
        { id: 'otros', name: 'Otros' }
    ],
  },
});

const ownershipOptions = [
  { id: 'owned', name: 'Propietario' },
  { id: 'joined', name: 'Participante' },
];

// const emit = defineEmits([
//   'update:modelValue',
//   'update:selectedCategory',
//   'update:selectedOwnership',
// ]);

const searchModel = defineModel('modelValue');
const selectModel = defineModel('selectedCategory');
const ownershipModel = defineModel('selectedOwnership');
const dateFilterModel = defineModel('selectedDateFilter');
</script>