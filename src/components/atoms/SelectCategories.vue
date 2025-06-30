<template>
  <div>
    <multiselect
      v-model="internalValue"
      :options="categories"
      :multiple="multiple"
      :class="{ 'dark': isDark }"
      :placeholder="placeholder"
      :label="labelKey"
      :track-by="trackByKey"
      aria-label="Seleccionar categorías"
      :disabled="isLoading"
      :aria-invalid="hasError ? 'true' : 'false'"
      :aria-describedby="hasError ? errorId : null"
      :aria-required="required"
      :show-labels="false"
      :close-on-select="closeOnSelect"
      :allow-empty="allowEmpty"
      :max-height="200"
      :searchable="true"
      :loading="isLoading"
      role="listbox"
      :aria-multiselectable="multiple ? 'true' : 'false'"
    >
    </multiselect>
    <span v-if="hasError" :id="errorId" class="text-red-500 text-sm mt-1">{{ errorMessage }}</span>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { defineAsyncComponent } from 'vue';
import 'vue-multiselect/dist/vue-multiselect.css';
import { useThemeStore } from '../../stores/theme';

const themeStore = useThemeStore();
const isDark = computed(() => themeStore.isDarkMode);
const Multiselect = defineAsyncComponent(() => import('vue-multiselect'));


const props = defineProps({
  modelValue: { type: [Array, Object, null], default: () => [] },
  categories: { type: Array, required: true },
  multiple: { type: Boolean, default: true },
  placeholder: { type: String, default: 'Seleccionar categorías' },
  isLoading: { type: Boolean, default: false },
  hasError: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
  required: { type: Boolean, default: false },
  closeOnSelect: { type: Boolean, default: true },
  allowEmpty: { type: Boolean, default: false },
  labelKey: { type: String, default: 'name' },
  trackByKey: { type: String, default: 'id' },
});

const emit = defineEmits(['update:modelValue']);

const errorId = computed(() => `error-${Math.random().toString(36).substring(7)}`);
const internalValue = ref(props.modelValue);

watch(internalValue, (newValue) => {
  emit('update:modelValue', newValue);
});

watch(() => props.modelValue, (newValue) => {
  internalValue.value = newValue;
});
</script>

<style scoped>

</style>