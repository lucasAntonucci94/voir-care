// composables/useFormField.js
import { ref } from 'vue';

export function useFormField(initialValue = '') {
  const field = ref({
    value: initialValue,
    hasError: false,
    errorMessage: '',
  });

  // Validación frontend básica
  const validate = (rules = []) => {
    field.value.hasError = false;
    field.value.errorMessage = '';

    for (const rule of rules) {
      const result = rule(field.value.value);
      if (result !== true) {
        field.value.hasError = true;
        field.value.errorMessage = result;
        return false;
      }
    }
    return true;
  };

  // Manejo de errores desde el backend (como Firebase)
  const setError = (code, message) => {
    field.value.hasError = true;
    field.value.errorMessage = message;
  };

  const clearError = () => {
    field.value.hasError = false;
    field.value.errorMessage = '';
  };

  return {
    field,
    validate,
    setError,
    clearError,
  };
}