<template>
  <div class="relative">
    <button
      @click="toggle"
      class="relative flex items-center gap-2 text-white hover:text-primary-lighter transition-colors duration-300 group"
      title="Usuario"
    >
      <i class="fa-solid fa-user text-xl"></i>
      <span class="text-sm font-medium hidden sm:block">{{ user?.displayName ?? '' }}</span>
      <!-- Tooltip (oculto en mobile) -->
      <span
        class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden sm:group-hover:block bg-primary-darker text-white text-xs font-medium py-1 px-2 rounded-lg shadow-md pointer-events-none transition-opacity duration-200 opacity-0 group-hover:opacity-100"
      >
        {{ user?.displayName ?? 'Usuario' }}
      </span>
    </button>
    <transition name="dropdown">
      <div
        v-if="isOpen"
        class="fixed sm:absolute top-0 sm:top-auto left-0 sm:left-auto sm:right-0 w-full sm:w-72 md:w-80 lg:w-96 h-full sm:h-auto max-h-[calc(100vh-4rem)] bg-white shadow-lg rounded-none sm:rounded-lg z-20 overflow-y-auto flex flex-col"
      >
        <!-- Botón de cierre (solo mobile) -->
        <button
          @click="toggle"
          class="sm:hidden absolute top-4 right-2 w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-primary transition-colors md:hidden"
        >
          <i class="fa-solid fa-times text-xl"></i>
        </button>
        <!-- Información del usuario -->
        <div v-if="isAuthenticated" class="pt-10 p-4 border-b border-gray-100">
          <div class="flex items-center gap-3">
            <img
              :src="user?.photoURLFile || 'https://via.placeholder.com/48'"
              alt="Avatar del usuario"
              class="w-12 h-12 rounded-full object-cover"
            />
            <div class="flex-1">
              <p class="text-lg font-semibold text-gray-900 truncate">{{ user?.displayName ?? 'Usuario' }}</p>
              <p class="text-sm text-gray-500 truncate">{{ user?.email ?? '' }}</p>
            </div>
          </div>
          <router-link
            to="/profile"
            @click="toggle"
            class="block w-full mt-3 text-center font-medium py-2 px-4 text-white bg-primary hover:bg-primary-darker rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <i class="fa-solid fa-user-circle text-sm"></i>
            Ver Perfil
          </router-link>
        </div>
        <!-- Opciones -->
        <ul class="divide-y divide-gray-100 flex-1">
          <li class="px-4 py-3">
            <ThemeModeButton />
          </li>
          <router-link v-if="isAuthenticated" to="/adm" @click="toggle">
            <li class="block px-7 py-3 text-gray-900 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2">
              <i class="fa-solid fa-shield-alt text-sm"></i>
              Panel de Administrador
            </li>
          </router-link>
          <router-link v-if="!isAuthenticated" to="/login" @click="toggle">
            <li class="block px-4 py-3 text-gray-900 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2">
              <i class="fa-solid fa-sign-in-alt text-sm"></i>
              Iniciar Sesión
            </li>
          </router-link>
        </ul>
        <!-- Cerrar Sesión -->
        <div v-if="isAuthenticated" class="p-2 sm:p-0 bg-gray-50 sm:bg-transparent">
          <button
            @click="doLogout"
            class="w-full font-medium py-2 px-4 text-white bg-primary hover:bg-primary-darker rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
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
import { useRouter } from 'vue-router';
import { useAuth } from '../../api/auth/useAuth';
import { defineProps, defineEmits } from 'vue';
import ThemeModeButton from '../atoms/ThemeModeButton.vue';

const { user, isAuthenticated, logout } = useAuth();
const router = useRouter();

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['toggle']);

function toggle() {
  emit('toggle');
}

const doLogout = async () => {
  await logout();
  router.push('/login');
};
</script>

<style scoped>
/* Animación del desplegable */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

/* Mobile: deslizar desde arriba */
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

/* Tablet y Desktop: deslizar desde el botón */
@media (min-width: 640px) {
  .dropdown-enter-from,
  .dropdown-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
}
</style>