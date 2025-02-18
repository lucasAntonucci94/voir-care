// composables/useFormValidation.js
import { ref, reactive } from 'vue';

export function useFormValidation() {
    const form = ref({}); // Inicializa form como un objeto vacío

    const validateForm = () => {
        let isValid = true;
        for (const field in form.value) { // Itera sobre las propiedades del formulario
            form.value[field].hasError = !form.value[field].value;
            if (form.value[field].hasError) {
                isValid = false;
            }
        }
        return isValid;
    };

    const setError = (code, message) => {
        // Reinicia todos los errores
        for (const field in form.value) {
            form.value[field].hasError = false;
            form.value[field].errorMessage = '';
        }

        // Establece errores específicos (si existen)
        switch (code) {
            case 'auth/invalid-email':
            case 'auth/missing-email':
            case 'auth/user-not-found':
                form.value.email.hasError = true;  // Asume que "email" siempre existe
                form.value.email.errorMessage = message;
                break;
            case 'auth/wrong-password':
            case 'auth/weak-password':
                form.value.password.hasError = true; // Asume que "password" siempre existe
                form.value.password.errorMessage = message;
                break;
            case 'auth/internal-error':
            case 'auth/admin-restricted-operation':
            case 'form-not-validated':
                for (const field in form.value) { // Itera y marca todos los campos vacíos
                    if (!form.value[field].value) {
                        form.value[field].hasError = true;
                        form.value[field].errorMessage = message; // Puedes personalizar el mensaje por campo
                    }
                }
                break;
             // Manejo de errores especificos de campos
             default:
                if (code && form.value[code]) {
                    form.value[code].hasError = true;
                    form.value[code].errorMessage = message;
                }
        }

    };

    const registerField = (fieldName) => {
      form.value[fieldName] = reactive({
          value: '',
          hasError: false,
          errorMessage: '',
      })
    }

    return { form, validateForm, setError, registerField };
}