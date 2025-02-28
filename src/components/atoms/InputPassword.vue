<template>
  <div class="mb-4">
    <label :for="id" class="block mb-2 text-sm font-medium text-gray-700">{{ label }}</label>
    <div class="relative flex items-center">
      <input
        :id="id"
        :type="passwordType"
        :value="modelValue.value"
        @input="updateValue"
        :placeholder="placeholder ?? `Ingrese ${label}`"
        :class="[
          'px-3 h-11 w-full text-gray-500 placeholder-gray-500 bg-gray-50 bg-opacity-40 border rounded-lg shadow-sm outline-none ring ring-transparent focus:ring-gray-500',
          modelValue.hasError ? 'border-red-500 focus:border-red-500 ring-red-500' : 'border-gray-200 focus:border-gray-500',
        ]"
        :aria-invalid="modelValue.hasError"
        :aria-describedby="modelValue.hasError ? `${id}-error` : null"
      />
      <button
        type="button"
        @click="togglePasswordVisibility"
        class="absolute inset-y-0 right-0 p-0 border-none bg-transparent h-full flex items-center justify-center text-gray-500 hover:text-gray-700"
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