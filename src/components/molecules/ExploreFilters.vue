<template>
  <div class="p-4 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
        Filtrar por tipo
        <span
          v-if="modelValue.length"
          class="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs"
        >
          {{ modelValue.length }}
        </span>
      </h3>
      <button
        @click="deleteAllFilters"
        class="flex items-center gap-2 px-3 py-1.5 bg-transparent border border-red-500 text-red-500 rounded-lg text-sm font-medium hover:bg-red-500 hover:text-white transition"
        aria-label="Borrar todos los filtros"
        :disabled="!modelValue.length"
      >
        <i class="fa-solid fa-trash-can"></i>
        Borrar filtros
      </button>
    </div>
    <div class="flex flex-col gap-2">
      <label
        v-for="filter in filters"
        :key="filter.id"
        class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
      >
        <input
          type="checkbox"
          :value="filter.id"
          :checked="modelValue.includes(filter.id)"
          @change="onChange(filter.id, $event.target.checked)"
          class="hidden"
        />
        <span
          :class="modelValue.includes(filter.id) ? 'bg-indigo-600' : 'bg-gray-200'"
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
const props = defineProps({
  filters: Array,
  modelValue: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue']);

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
</script>

<style scoped>
input + span {
  transition: background-color 0.3s ease, transform 0.2s ease;
}
input:checked + span {
  background-color: #4f46e5;
  transform: scale(1.05);
}
label:hover span {
  transform: scale(1.1);
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>