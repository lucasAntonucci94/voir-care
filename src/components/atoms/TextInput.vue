<template>
  <div class="mb-4">
      <label :for="id" class="block mb-2 text-sm font-medium text-gray-700">
          {{ label }}
      </label>
      <input
        :id="id"
        :type="type"
        :value="modelValue" 
          @input="updateValue" 
        :placeholder="placeholder!= null? placeholder: 'Ingrese ' + label"
        :class="[
              'px-3 h-11 w-full text-gray-500 placeholder-gray-500 bg-gray-50 bg-opacity-40 border rounded-lg shadow-sm outline-none ring ring-transparent focus:ring-gray-500',
              hasError? 'border-red-500 focus:border-red-500 ring-red-500': 'border-gray-200 focus:border-gray-500',
          ]"
      />
      <div v-if="hasError" class="text-red-500 text-sm mt-1">
            <slot name="error-message">{{hasErrorMessage ?? 'Este campo es obligatorio.'}}</slot>
      </div>
  </div>
</template>

<script setup>
const props = defineProps({
  label: { type: String, required: true },
  placeholder: { type: String, required: false },
  type: { type: String, default: 'text', required: true },
  hasError: { type: Boolean, default: false },
  hasErrorMessage: { type: String, default: false },
  modelValue: { type: String, required: true }, 
});

const emit = defineEmits(['update:modelValue']);

const updateValue = (event) => {
  emit('update:modelValue', event.target.value); 
};

const id = `input-${Math.random().toString(36).substring(7)}`;
</script>