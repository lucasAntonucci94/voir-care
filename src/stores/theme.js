import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useUsers } from '../composable/useUsers';

// Define el store de Pinia para manejar el tema de la aplicación
export const useThemeStore = defineStore('theme', () => {
  // Estado reactivo para el modo oscuro
  const isDarkMode = ref(false);
  // Importa el método para actualizar el tema en Firestore
  const { updateUserTheme } = useUsers();

  /**
   * Inicializa el tema basado en la configuración del usuario, localStorage o preferencia del sistema
   * @param {string|null} userTheme - Tema del usuario desde Firestore (light/dark), o null si no está disponible
   */
  function initializeTheme(userTheme = null) {
    const savedTheme = localStorage.getItem('theme');
    if (userTheme) {
      // Usa el tema de la configuración de Firestore si está disponible
      isDarkMode.value = userTheme === 'dark';
    } else if (savedTheme) {
      // Usa el tema guardado en localStorage como respaldo
      isDarkMode.value = savedTheme === 'dark';
    } else {
      // Usa la preferencia del sistema como último recurso
      isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    // Aplica el tema al documento
    applyTheme();
  }

  /**
   * Aplica el tema al documento y actualiza localStorage
   */
  function applyTheme() {
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  /**
   * Cambia el tema y actualiza Firestore si hay un usuario autenticado
   * @param {string} theme - Tema a establecer ('light' o 'dark')
   * @param {string|null} userId - ID del usuario autenticado, o null si no hay usuario
   */
  async function setTheme(theme, userId = null) {
    if (!['light', 'dark'].includes(theme)) {
      throw new Error('Valor de tema inválido. Debe ser "light" o "dark"');
    }

    // Actualiza el estado del modo oscuro
    isDarkMode.value = theme === 'dark';
    // Aplica el tema al documento
    applyTheme();

    // Actualiza Firestore si se proporciona un userId
    if (userId) {
      try {
        await updateUserTheme(userId, theme);
      } catch (error) {
        console.error('Error al actualizar el tema en Firestore:', error);
        // Revierte los cambios locales si la actualización en Firestore falla
        isDarkMode.value = !isDarkMode.value;
        applyTheme();
      }
    }
  }

  return {
    isDarkMode,
    initializeTheme,
    setTheme,
  };
});