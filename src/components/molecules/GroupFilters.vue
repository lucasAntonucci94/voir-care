<template>
  <div class="flex gap-3 flex-wrap items-center mb-4">
    <!-- Filtro por nombre -->
    <input
      v-if="showSearch"
      v-model="searchModel"
      type="text"
      placeholder="Buscar grupo..."
      class="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
    />
    <!-- Filtro por categoría -->
    <select
      v-if="showSelect"
      v-model="selectModel"
      class="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
    <!-- Filtro por propiedad -->
    <select
      v-if="showOwnership"
      v-model="ownershipModel"
      class="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
    >
      <option value="all">Todos los grupos</option>
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
const props = defineProps({
  modelValue: String,
  selectedCategory: String,
  selectedOwnership: String,
  showSearch: { type: Boolean, default: true },
  showSelect: { type: Boolean, default: true },
  showOwnership: { type: Boolean, default: false },
});
const categories = [
  { id: 'educacion', name: 'Educación' },
  { id: 'ayuda', name: 'Ayuda y Asistencia' },
  { id: 'interes', name: 'Intereses' },
  { id: 'cuidado', name: 'Cuidado Animal' },
  { id: 'voluntariado', name: 'Voluntariado' },
  { id: 'otros', name: 'Otros' },
];

const ownershipOptions = [
  { id: 'owned', name: 'Propietario' },
  { id: 'joined', name: 'Miembro' },
];
const emit = defineEmits(['update:modelValue', 'update:selectedCategory', 'update:selectedOwnership']);
const searchModel = defineModel('modelValue');
const selectModel = defineModel('selectedCategory');
const ownershipModel = defineModel('selectedOwnership');
</script>