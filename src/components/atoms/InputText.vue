<template>
  <div class="mb-4">
    <label :for="id" class="block mb-2 text-sm font-medium text-gray-700">{{ label }}</label>
    <input
      :id="id"
      :type="type"
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
    <div v-if="modelValue.hasError" :id="`${id}-error`" class="text-red-500 text-sm mt-1">
      <slot name="error-message">{{ modelValue.errorMessage ?? 'Este campo es obligatorio.' }}</slot>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  label: { type: String, required: true },
  placeholder: { type: String, default: null },
  type: { type: String, default: 'text' },
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
</script>