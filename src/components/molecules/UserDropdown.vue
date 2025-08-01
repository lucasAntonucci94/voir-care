<template>
  <div class="relative">
    <!-- Botón de usuario -->
    <button
      @click="toggle"
      class="relative flex flex-col items-center gap-1 text-white hover:text-primary-lighter dark:hover:text-secondary-lighter transition"
      title="Menú de usuario"
      aria-label="Abrir menú de usuario"
      :aria-expanded="isOpen.toString()"
      aria-controls="user-dropdown"
      aria-haspopup="menu"
    >
      <i class="fa-solid fa-user text-xl" aria-hidden="true"></i>
      <span class="text-xs lg:text-sm mt-1 font-bold hidden sm:block">{{ user?.displayName ?? (user?.email || 'Cuenta') }}</span>
      <!-- Tooltip (oculto en mobile) -->
      <span
        class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden sm:group-hover:block bg-primary-md dark:bg-secondary-md text-white text-xs font-medium py-1 px-3 rounded-lg shadow-md pointer-events-none transition-opacity duration-200 opacity-0 group-hover:opacity-100"
      >
        Menú de usuario
      </span>
    </button>

    <!-- Menú desplegable -->
    <transition name="dropdown">
      <div
        v-if="isOpen"
        id="user-dropdown"
        role="menu"
        aria-label="Menú de usuario"
        tabindex="-1"
        class="fixed sm:absolute top-0 sm:top-12 left-0 sm:left-auto sm:right-0 w-full sm:w-80 max-h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 shadow-xl sm:rounded-xl z-30 overflow-y-auto flex flex-col sm:pt-0 pt-12"
      >
        <!-- Botón de cerrar (solo en mobile) -->
        <button
          @click="toggle"
          class="sm:hidden absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Cerrar menú"
        >
          <i class="fa-solid fa-times text-xl"></i>
        </button>

        <!-- Sección de información del usuario -->
        <div v-if="isAuthenticated" class="p-5 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-4">
            <img
              :src="user?.photoURLFile || avatarDefault"
              alt="Avatar del usuario"
              class="w-14 h-14 rounded-full object-cover border-2 border-primary dark:border-secondary"
            />
            <div class="flex-1 min-w-0">
              <p class="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{{ user?.displayName ?? (user?.email || 'Usuario') }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ user?.email ?? '' }}</p>
            </div>
          </div>
          <router-link
            to="/profile"
            @click="toggle"
            class="block w-full mt-4 text-center font-medium py-2.5 px-4 text-white bg-primary hover:bg-primary-darker dark:bg-secondary dark:hover:bg-secondary-darker rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <i class="fa-solid fa-user-circle text-sm"></i>
            Ver Perfil
          </router-link>
        </div>

        <!-- Opciones del menú -->
        <ul class="flex-1 divide-y divide-gray-200 dark:divide-gray-700">
          <li
            role="menuitem"
            tabindex="0"
            @keydown="onKeydown($event, 'profile')"
            class="px-5 py-4 flex items-center justify-between"
          >
            <span class="text-gray-700 dark:text-gray-300 font-medium">Modo Tema</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="themeStore.isDarkMode"
                class="sr-only"
                @change="toggleTheme"
                aria-label="Cambiar entre modo claro y oscuro"
              />
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-sun text-yellow-400 dark:text-gray-600"></i>
                <div class="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full shadow-inner flex items-center px-1">
                  <div
                    class="w-5 h-5 bg-primary dark:bg-secondary rounded-full shadow-md transform transition-transform duration-300"
                    :class="{ 'translate-x-6': themeStore.isDarkMode }"
                  ></div>
                </div>
                <i class="fa-solid fa-moon text-gray-500 dark:text-gray-300"></i>
              </div>
            </label>
          </li>
          <li
            role="menuitem"
            tabindex="0"
            @keydown="onKeydown($event, 'admin')"
            class="block"
          >
            <router-link v-if="isAuthenticated && user?.isAdmin" to="/admin/dashboard" @click="toggle" class="px-5 py-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center gap-3">
              <i class="fa-solid fa-shield-halved text-lg" aria-hidden="true"></i>
              Panel de Administrador
            </router-link>
          </li>
        </ul>

        <!-- Botón de cerrar sesión -->
        <div v-if="isAuthenticated" class="p-4">
          <button
            @click="doLogout"
            class="w-full font-medium py-2.5 px-4 text-white bg-primary hover:bg-primary-darker dark:bg-secondary dark:hover:bg-secondary-darker rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <i class="fa-solid fa-sign-out-alt text-sm"></i>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../../api/auth/useAuth';
import { useThemeStore } from '../../stores/theme';
import avatarDefault from '../../assets/avatar1.jpg';

// Obtiene datos y métodos del composable de autenticación
const { user, isAuthenticated, logout } = useAuth();
// Obtiene el store de tema
const themeStore = useThemeStore();
// Inicializa el router
const router = useRouter();

// Define las propiedades del componente
const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
});

// Define los eventos emitidos por el componente
const emit = defineEmits(['toggle']);

watch(() => props.isOpen, (val) => {
  if (val) {
    nextTick(() => {
      const firstItem = document.querySelector('#user-dropdown [role="menuitem"]');
      firstItem?.focus();
    });
  }
});

/**
 * Alterna la visibilidad del menú desplegable
 */
function toggle() {
  emit('toggle');
}

/**
 * Cambia el tema usando el store de Pinia
 */
async function toggleTheme() {
  const newTheme = themeStore.isDarkMode ? 'dark' : 'light';
  await themeStore.setTheme(newTheme, isAuthenticated.value ? user.value?.uid : null);
}

/**
 * Cierra la sesión del usuario y redirige al login
 */
async function doLogout() {
  await logout();
  router.push('/login');
}

/**
 * Controla la navegación del menú con el teclado
 * @param {KeyboardEvent} event - El evento de teclado
 */
function onKeydown(event, action) {
  const items = Array.from(document.querySelectorAll('#user-dropdown [role="menuitem"]'));
  const currentIndex = items.indexOf(event.currentTarget);

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      items[(currentIndex + 1) % items.length]?.focus();
      break;
    case 'ArrowUp':
      event.preventDefault();
      items[(currentIndex - 1 + items.length) % items.length]?.focus();
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      event.currentTarget.click();
      break;
    case 'Escape':
      toggle();
      break;
  }
}

</script>

<style scoped>
/* Animación del desplegable */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

/* Mobile: Deslizamiento desde arriba */
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

/* Desktop: Desvanecimiento y deslizamiento desde el botón */
@media (min-width: 640px) {
  .dropdown-enter-from,
  .dropdown-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

/* Barra de desplazamiento suave para overflow */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

/* Efectos de hover y focus para botones */
button:hover,
a:hover {
  transform: translateY(-1px);
}

button:focus,
a:focus {
  outline: none;
}
</style>