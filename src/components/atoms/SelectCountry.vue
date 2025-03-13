<!-- components/atoms/SelectCountry.vue -->
<template>
    <div class="relative">
      <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {{ label }}
      </label>
      <select
        :id="id"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:focus:ring-blue-500 transition-colors duration-200"
        :class="{ 'border-red-500': hasError }"
      >
        <option value="" disabled selected>Selecciona un país</option>
        <option v-for="country in countries" :key="country.code" :value="country.name">
          {{ country.name }}
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
    label: { type: String, default: 'País' },
    id: { type: String, default: 'country-select' },
    hasError: { type: Boolean, default: false },
    errorMessage: { type: String, default: 'Por favor, selecciona un país.' },
  });
  
  // Emits
  defineEmits(['update:modelValue']);
  
  // Lista de países (puedes expandirla o usar una librería externa)
  const countries = ref([
    { code: 'AR', name: 'Argentina' },
    { code: 'BR', name: 'Brasil' },
    { code: 'CL', name: 'Chile' },
    { code: 'CO', name: 'Colombia' },
    { code: 'ES', name: 'España' },
    { code: 'MX', name: 'México' },
    { code: 'PE', name: 'Perú' },
    { code: 'US', name: 'Estados Unidos' },
    { code: 'UY', name: 'Uruguay' },
    // Agrega más países según necesites
  ]);
  </script>
  
  <style scoped>
  /* Opcional: ajustes adicionales si Tailwind no cubre algo específico */
  select {
    appearance: none; /* Quita el estilo nativo del navegador */
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1.5em;
  }
  </style>