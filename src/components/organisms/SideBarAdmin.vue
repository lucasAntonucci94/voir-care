<template>
  <aside class="w-64 bg-gray-100 dark:bg-gray-800 p-4 md:p-5 hidden md:block">
    <nav class="space-y-4">
      <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-4">Panel de Administración</h2>
      <ul class="space-y-2">
        <li v-for="item in navItems" :key="item.label">
          <RecursiveSidebarItem :item="item" />
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { ref } from 'vue';
import RecursiveSidebarItem from '../atoms/RecursiveSidebarItem.vue';

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