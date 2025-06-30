<template>
  <div>
    <label v-if="label" :for="id" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">{{ label }}</label>
    <input
      :id="id"
      ref="inputRef"
      type="tel"
      :placeholder="placeholder"
      :disabled="disabled"
      v-mask="mask"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :class="[
        'w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:bg-gray-600 border rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent placeholder-gray-400 dark:placeholder-gray-400 disabled:opacity-50',
        error ? 'border-red-500' : 'border-gray-300 dark:border-gray-800'
      ]"
      aria-describedby="phoneError phoneHelp"
      :aria-invalid="!!error"
      :aria-label="label || 'Teléfono del usuario'"
      aria-required="true"
      :aria-disabled="!disabled"
      minlength="3"
      maxlength="25"
      inputmode="tel"
      required
    />
    <span id="phoneHelp" class="sr-only">
      El número debe estar en formato internacional, por ejemplo: +54 9 11 1234-5678
    </span>
    <p v-if="error" id="phoneError" role="alert" aria-live="assertive" class="text-sm text-red-500 mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  modelValue: String,
  label: String,
  id: String,
  placeholder: {
    type: String,
    default: '+54 9 11 1234-5678',
  },
  disabled: Boolean,
  error: String,
  mask: {
    type: String,
    default: '+54 9 ## ####-####',
  },
});
defineEmits(['update:modelValue']);

const inputRef = ref(null);
</script>