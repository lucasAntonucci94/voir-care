<!-- components/atoms/SelectGenre.vue -->
<template>
    <div class="relative">
      <label v-if="label" :for="id" class="block text-sm font-medium text-[#2c3e50] mb-1">
        {{ label }}
      </label>
      <select
        :id="id"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        class="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-full text-[#2c3e50] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200"
        :class="{ 'border-red-500': hasError }"
        :disabled="disabled"
      >
        <option value="" disabled selected>Selecciona un género</option>
        <option v-for="genre in genres" :key="genre.value" :value="genre.value">
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
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1.5em;
  }
  </style>