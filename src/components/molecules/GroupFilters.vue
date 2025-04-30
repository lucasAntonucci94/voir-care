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
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    modelValue: String,
    selectedCategory: String,
    showSearch: { type: Boolean, default: true },
    showSelect: { type: Boolean, default: true },
    categories: { type: Array, default: () => [] },
  });
  
  const emit = defineEmits(['update:modelValue', 'update:selectedCategory']);
  const searchModel = defineModel('modelValue');
  const selectModel = defineModel('selectedCategory');
  </script>
  