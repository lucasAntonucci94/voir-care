<!-- components/atoms/SelectGenre.vue -->
<template>
    <div class="relative">
      <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {{ label }}
      </label>
      <select
        :id="id"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        class="block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:bg-gray-600 border border-gray-300 dark:border-gray-800 rounded-full text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent transition-colors duration-200"
        :class="{ 'border-red-500': hasError }"
        :disabled="disabled"
      >
        <option class="text-gray-600 dark:text-gray-400" value="" disabled selected>Selecciona un género</option>
        <option v-for="genre in genres" :key="genre.value" :value="genre.value" class="text-gray-800 dark:text-gray-200">
          {{ genre.label }}
        </option>
      </select>
      <p v-if="hasError" class="mt-1 text-sm text-red-600">{{ errorMessage }}</p>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  // Props
  defineProps({
    modelValue: { type: String, default: '' }, // Para v-model
    label: { type: String, default: 'Género' },
    id: { type: String, default: 'genre-select' },
    hasError: { type: Boolean, default: false },
    errorMessage: { type: String, default: 'Por favor, selecciona un género.' },
    disabled: { type: Boolean, default: false }, // Para deshabilitar como en ProfileForm
  });
  
  // Emits
  defineEmits(['update:modelValue']);
  
  // Lista de géneros
  const genres = ref([
    { value: 'Masculino', label: 'Masculino' },
    { value: 'Femenino', label: 'Femenino' },
    { value: 'Otro', label: 'Otro' },
  ]);
  </script>
  
  <style scoped>
  select {
    appearance: none;
    background-image: var(--select-down-arrow-bg);
    /* background-image: url("../../assets/icons/down-white.png"); */
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1.5em;
  }
  </style>