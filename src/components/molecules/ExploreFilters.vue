<template>
    <div class="p-4 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Filtrar por tipo</h3>
      <div class="flex flex-col gap-3">
        <label
          v-for="filter in filters"
          :key="filter.id"
          class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-100"
        >
          <input
            type="checkbox"
            :value="filter.id"
            :checked="modelValue.includes(filter.id)"
            @change="onChange(filter.id, $event.target.checked)"
            class="accent-indigo-600"
          />
          {{ filter.label }}
        </label>
      </div>
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    filters: Array,
    modelValue: {
      type: Array,
      default: () => []
    }
  });
  
  const emit = defineEmits(['update:modelValue']);
  
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
  </script>
  