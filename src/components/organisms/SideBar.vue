<template>
  <aside
    :class="[
      'dosis-font bg-gray-100 dark:bg-gray-800 w-64 p-6 shadow-lg transition-transform duration-300 fixed top-0 bottom-0 z-100',
      'overflow-y-auto',
      show ? 'translate-x-0' : '-translate-x-full',
      'md:w-72 md:shadow-none md:static md:translate-x-0'
    ]"
    aria-label="Menú lateral de navegación"
    id="sidebar"
  >
    <!-- Cruz de cierre en móvil -->
    <button
      v-if="show"
      @click="emit('toggle')"
      type="button"
      class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-secondary transition-colors md:hidden"
      aria-label="Cerrar menú lateral"
      :aria-expanded="show"
      aria-controls="sidebar"
    >
      <span class="fa-solid fa-times text-lg" aria-hidden="true"></span>
    </button>

    <!-- Perfil del usuario -->
    <header class="mb-8">
      <router-link to="/profile" v-if="isAuthenticated" class="flex items-center gap-4 mb-8" aria-current="page">
        <img
          :src="user?.photoURLFile || avatarDefault"
          :alt="`Avatar de ${user?.displayName || user?.email || 'Usuario'}`"
          class="w-12 h-12 rounded-full border-2 border-gray-200 object-cover"
        />
        <div>
          <p class="text-gray-800 dark:text-gray-200 font-semibold text-base">
            {{ user?.displayName || user?.email || 'Usuario' }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ user?.isAdmin ? 'Administrador' : 'Miembro' }}</p>
        </div>
      </router-link>
    </header>

    <!-- Navegación principal -->
    <nav class="space-y-2" aria-label="Navegación principal">
      <router-link
        v-for="item in mainNavItems"
        :key="item.to"
        :to="item.to === '/home' ? pathLocation(isAuthenticated) : item.to"
        class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:hover:text-secondary"
        active-class="bg-primary text-white hover:bg-primary-md hover:text-gray-100 dark:bg-secondary dark:text-white dark:hover:bg-secondary-md dark:hover:text-white"
        @click="emit('toggle')"
      >
        <span :class="['fa-solid', item.icon, 'w-5', 'text-center']" aria-hidden="true"></span>
        <span class="text-base font-medium">{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- Sección "Otros" -->
    <div class="mt-8 space-y-2">
      <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide mb-3">Explorar</h3>
      <router-link
        v-for="item in filteredOtherNavItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:hover:text-secondary"
        active-class="bg-primary text-white hover:bg-primary-md hover:text-gray-100 dark:bg-secondary dark:text-white dark:hover:bg-secondary-md dark:hover:text-white"
        @click="emit('toggle')"
      >
        <span :class="['fa-solid', item.icon, 'w-5', 'text-center']" aria-hidden="true"></span>
        <span class="text-base font-medium">{{ item.label }}</span>
      </router-link>
    </div>
  </aside>
  <!-- Fondo semitransparente para cerrar en móvil -->
  <div
    v-if="show"
    @click="emit('toggle')"
    class="fixed inset-0 bg-black/40 md:hidden z-20"
    aria-hidden="true"
  ></div>
</template>

<script setup>
import { computed } from 'vue';
import avatarDefault from '../../assets/avatar1.jpg';
import { useAuth } from '../../api/auth/useAuth';

const { user, isAuthenticated } = useAuth();
const emit = defineEmits(['toggle']);
const props = defineProps(['show']);

// Computed para determinar si ocultar la página Premium
const hidePremiumPage = computed(() => {
  return !isAuthenticated.value || (isAuthenticated.value && user?.value?.isSuscribed) || false;
});

// Items de navegación principal
const mainNavItems = [
  { to: '/home', icon: 'fa-home', label: 'Inicio' },
  { to: '/groups', icon: 'fa-users', label: 'Grupos' },
  { to: '/events', icon: 'fa-calendar', label: 'Eventos' },
  { to: '/education', icon: 'fa-graduation-cap', label: 'Educación' },
  { to: '/social', icon: 'fa-photo-video', label: 'Recreativo' },
  { to: '/explorar', icon: 'fa-compass', label: 'Mapa interactivo' },
  { to: '/chats', icon: 'fa-message', label: 'Mensajes' },
];

// Items de navegación "Otros" filtrados reactivamente
const otherNavItems = computed(() => [
  { to: '/adoption', icon: 'fa-paw', label: 'Adopción' },
  { to: '/premium', icon: 'fa-gem', label: 'Suscríbete a Voir', hidden: hidePremiumPage?.value ?? false },
  { to: '/faqs', icon: 'fa-question', label: 'Preguntas Frecuentes' },
  // { to: '/about', icon: 'fa-info-circle', label: 'Acerca de Voir' },
  // { to: '/contact', icon: 'fa-envelope', label: 'Contacto' },
]);

// Filtrar elementos ocultos
const filteredOtherNavItems = computed(() => otherNavItems.value.filter(item => !item.hidden));

function pathLocation(isAuthenticated) {
  return isAuthenticated ? '/feed' : '/';
}
</script>