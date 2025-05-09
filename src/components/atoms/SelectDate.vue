<template>
    <div class="relative w-full">
      <label v-if="label" :for="id" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
        {{ label }}
      </label>
      <VueDatePicker
        v-model="internalValue"
        :id="id"
        :enable-time-picker="timeEnabled"
        :format="timeEnabled ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy'"
        :locale="'es'"
        :text-input="true"
        class="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-gray-600"
        :class="{ 'border-red-500': error }"
        :teleport="true"
        :disabled="disabled"
        :placeholder="computedPlaceholder"
        @update:model-value="handleDateChange"
      />
      <p v-if="error" class="text-sm text-red-500 mt-1">{{ error }}</p>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, computed } from 'vue';
  import VueDatePicker from '@vuepic/vue-datepicker';
  import '@vuepic/vue-datepicker/dist/main.css';
  
  const props = defineProps({
    modelValue: { type: [String, Date, null], default: null }, // Supports ISO string or Date object
    label: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    timeEnabled: { type: Boolean, default: true }, // Controls whether time selection is enabled
    id: { type: String, default: () => `date-${Math.random().toString(36).substr(2, 9)}` }, // Unique ID
  });
  
  const emit = defineEmits(['update:modelValue']);
  
  const internalValue = ref(props.modelValue);
  const error = ref('');
  
  // Compute placeholder based on timeEnabled
  const computedPlaceholder = computed(() => {
    return props.placeholder || (props.timeEnabled ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy');
  });
  
  watch(
    () => props.modelValue,
    (newVal) => {
      internalValue.value = newVal ? new Date(newVal) : null;
    }
  );
  
  function handleDateChange(value) {
    if (value) {
      internalValue.value = value;
      emit('update:modelValue', value.toISOString());
      error.value = '';
    } else {
      internalValue.value = null;
      emit('update:modelValue', null);
      // error.value = 'Fecha inválida';
    }
  }
  </script>
  
  <style scoped>
  :deep(.dp__input) {
    padding-bottom: 0;
    padding-top: 0;
    padding-right: 0;
    border: none;
    background: transparent;
    color: inherit;
    font-size: inherit;
    line-height: inherit;
    width: 100%;
  }
  
  :deep(.dp__input:focus) {
    outline: none;
  }
  
  :deep(.dp__input::placeholder) {
    color: #9ca3af; /* Tailwind gray-400 */
  }
  </style>