<template>
  <div class="mb-4">
    <label :for="id" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{{ label }}</label>
    <div class="relative flex items-center">
      <input
        :id="id"
        :type="passwordType"
        :value="modelValue.value"
        @input="updateValue"
        :placeholder="placeholder ?? `Ingrese ${label}`"
        :class="[
          'mt-1 w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 hover:dark:bg-gray-600 border rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary dark:focus:bg-gray-600 dark:hover:bg-gray-600 focus:border-transparent placeholder-gray-400',
          modelValue.hasError ? 'border-red-500' : 'border-gray-300 dark:border-gray-800',
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        ]"
        :disabled="disabled"
        :aria-invalid="modelValue.hasError"
        :aria-describedby="modelValue.hasError ? `${id}-error` : null"
      />
      <button
        type="button"
        @click="togglePasswordVisibility"
        class="absolute inset-y-0 right-0 p-0 border-none bg-transparent h-full flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-100"
      >
        <i :class="passwordVisible ? 'fas fa-eye pr-3' : 'fas fa-eye-slash pr-3'"></i>
      </button>
    </div>
    <div v-if="modelValue.hasError" :id="`${id}-error`" class="text-red-500 text-sm mt-1">
      <slot name="error-message">{{ modelValue.errorMessage ?? 'Este campo es obligatorio.' }}</slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  label: { type: String, required: true },
  placeholder: { type: String, default: null },
  modelValue: {
    type: Object,
    required: true,
    validator: (value) => 'value' in value && 'hasError' in value && 'errorMessage' in value,
  },
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(['update:modelValue']);

const updateValue = (event) => {
  emit('update:modelValue', { ...props.modelValue, value: event.target.value });
};

const id = `input-${Math.random().toString(36).substring(7)}`;
const passwordVisible = ref(false);
const passwordType = computed(() => (passwordVisible.value ? 'text' : 'password'));

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value;
};
</script>