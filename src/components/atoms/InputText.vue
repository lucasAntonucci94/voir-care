<template>
  <div class="mb-4">
    <label :for="id" class="block mb-2 text-sm font-medium text-[#2c3e50]">{{ label }}</label>
    <input
      :id="id"
      :type="type"
      :value="modelValue.value"
      @input="updateValue"
      :placeholder="placeholder ?? `Ingrese ${label}`"
      :class="[
        'mt-1 w-full px-4 py-2 bg-gray-50 border rounded-full text-[#2c3e50] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-gray-400',
        modelValue.hasError ? 'border-red-500' : 'border-gray-300',
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      ]"
      :disabled="disabled"
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
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(['update:modelValue']);

const updateValue = (event) => {
  emit('update:modelValue', { ...props.modelValue, value: event.target.value });
};

const id = `input-${Math.random().toString(36).substring(7)}`;
</script>