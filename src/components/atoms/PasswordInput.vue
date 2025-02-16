<template>
  <div class="mb-4">
    <label :for="id" class="block mb-2 text-sm font-medium text-gray-700">
      {{ label }}
    </label>
    <div class="relative flex items-center">  
      <input
      :id="id"
      :type="passwordType"
        v-model="inputValue"
        :placeholder="'Ingrese '+label"
        @input="updateValue"
        :class="[
              'px-3 h-11 w-full text-gray-500 placeholder-gray-500 bg-gray-50 bg-opacity-40 border rounded-lg shadow-sm outline-none ring ring-transparent focus:ring-gray-500',
              hasError? 'border-red-500 focus:border-red-500 ring-red-500': 'border-gray-200 focus:border-gray-500',
          ]"
      />
      <button
        type="button"
        @click="togglePasswordVisibility"
        class="absolute inset-y-0 right-0 p-0 border-none bg-transparent h-full flex items-center justify-center text-gray-500 hover:text-gray-700"
      >
        <i :class="passwordVisible? 'fas fa-eye pr-3': 'fas fa-eye-slash pr-3'"></i>
      </button>
    </div>
    <div v-if="hasError" class="text-red-500 text-sm mt-1">
      <slot name="error-message">{{hasErrorMessage ?? 'Este campo es obligatorio.'}}</slot>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  label: { type: String, required: true },
  placeholder: { type: String, required: false },
  type: { type: String, default: 'text', required: true },
  hasError: { type: Boolean, default: false },  
  hasErrorMessage: { type: String, default: false },
  modelValue: { type: String, required: true }, 
});

const emit = defineEmits(['update:modelValue']);
const inputValue = ref(props.modelValue);

const updateValue = () => {
  emit('update:modelValue', inputValue.value);
};

const id = computed(() => `input-${Math.random().toString(36).substring(7)}`);
const passwordVisible = ref(false);
const passwordType = computed(() => passwordVisible.value ? 'text' : 'password');

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value;
};
</script>