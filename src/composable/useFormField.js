// composables/useFormField.js
import * as yup from 'yup';
import { ref } from 'vue';

export function useFormField(initialValue = '', schema = null) {
  const field = ref({
    value: initialValue,
    hasError: false,
    errorMessage: '',
  });

  // Validación frontend básica
  const validate = (rules = []) => {
    field.value.hasError = false;
    field.value.errorMessage = '';
    
    if(schema){
      //Valido por schema
      try {
        schema.validateSync(field.value.value, { abortEarly: true });
        return true;
      } catch (error) {
        field.value.hasError = true;
        field.value.errorMessage = error.message;
        return false;
      }
    }
    
    //Valido por reglas
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
  const setError = (message) => {
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