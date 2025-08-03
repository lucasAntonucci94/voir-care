<template>
  <aside
    :class="[
      'dosis-font bg-gray-100 dark:bg-gray-800 w-64 p-4 shadow-lg transition-transform duration-300 fixed top-0 bottom-0 z-100',
      show ? 'translate-x-0' : '-translate-x-full',
      'md:w-72 md:static md:translate-x-0'
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
    <nav class="space-y-4">
      <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-4">Panel de Administración</h2>
      <ul class="space-y-2">
        <li v-for="item in navItems" :key="item.label">
          <RecursiveSidebarItem :item="item" />
        </li>
      </ul>
    </nav>
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
import RecursiveSidebarItem from '../atoms/RecursiveSidebarItem.vue';
const props = defineProps(['show']);
const emit = defineEmits(['toggle']);
const navItems = [
  { label: 'Dashboard', route: '/admin/dashboard', icon: 'fas fa-tachometer-alt' },
  
  {
    label: 'Gestión',
    icon: 'fas fa-user-shield',
    subItems: [
      { label: 'Reportes', route: '/admin/reports', icon: 'fas fa-exclamation-triangle' },
      { label: 'Subscripciones', route: '/admin/subscriptions', icon: 'fas fa-user-plus' },
    ],
  },
  {
    label: 'Actividad de Usuarios',
    icon: 'fas fa-chart-line',
    subItems: [
      { label: 'Usuarios', route: '/admin/users', icon: 'fas fa-users' },
      { label: 'Eventos', route: '/admin/events', icon: 'fas fa-calendar-alt' },
      { label: 'Grupos', route: '/admin/groups', icon: 'fas fa-users-cog' },
      { label: 'Marcadores', route: '/admin/locations', icon: 'fas fa-bookmark' },
      { label: 'Publicaciones', route: '/admin/posts', icon: 'fas fa-book' },
    ],
  },
  {
    label: 'Contenido Administrativo',
    icon: 'fas fa-cogs',
    subItems: [
      { label: 'Educación', route: '/admin/education', icon: 'fas fa-graduation-cap' },
      { label: 'Reels por defecto', route: '/admin/defaultReels', icon: 'fas fa-video' },
      {
        label: 'Categorias',
        icon: 'fas fa-tags',
        subItems: [
          { label: 'Posts', route: '/admin/categories/posts', icon: 'fas fa-square-share-nodes' },
          { label: 'Blogs', route: '/admin/categories/blogs', icon: 'fas fa-blog' },
        ],
      },
    ],
  },
];
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>