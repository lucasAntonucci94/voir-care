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
        class="block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:bg-gray-600 border border-gray-300 dark:border-gray-800 rounded-full text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent transition-colors duration-200"
        :class="{ 'border-red-500': hasError }"
      >
        <option class="text-gray-600 dark:text-gray-400" value="" disabled selected>Selecciona un país</option>
        <option v-for="country in countries" :key="country.code" :value="country.name" class="text-gray-800 dark:text-gray-200">
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
  select {
    appearance: none;
    background-image: url("../../assets/icons/down.png");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1.5em;
  }
  </style>