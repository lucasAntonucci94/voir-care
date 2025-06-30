<template>
  <aside class="w-64 bg-white dark:bg-gray-800 p-4 hidden md:block">
    <nav class="space-y-4">
      <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-4">Panel Admin</h2>
      <ul class="space-y-2">
        <li v-for="item in navItems" :key="item.label">
          <!-- Ítem con desplegable -->
          <div v-if="item.subItems" class="flex flex-col">
            <button
              @click="toggleDropdown(item.label)"
              class="flex items-center justify-between w-full text-gray-700 dark:text-gray-300 hover:text-primary py-2 px-2"
            >
              <div class="flex items-center gap-2">
                <i :class="item.icon" class="w-5 h-5"></i>
                <span>{{ item.label }}</span>
              </div>
              <i
                :class="isOpen(item.label) ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"
                class="w-5 h-5 transition-transform duration-200"
              ></i>
            </button>
            <transition name="slide">
              <ul v-if="isOpen(item.label)" class="pl-6 space-y-1 mt-1">
                <li v-for="subItem in item.subItems" :key="subItem.label">
                  <RouterLink
                    :to="subItem.route"
                    class="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary text-sm py-1 px-2"
                  >
                    <i :class="subItem.icon" class="w-4 h-4"></i>
                    <span>{{ subItem.label }}</span>
                  </RouterLink>
                </li>
              </ul>
            </transition>
          </div>
          <!-- Ítem sin desplegable -->
          <RouterLink
            v-else
            :to="item.route"
            class="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary py-2 px-2"
          >
            <i :class="item.icon" class="w-5 h-5"></i>
            <span>{{ item.label }}</span>
          </RouterLink>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

const navItems = [
  { label: 'Dashboard', route: '/admin/dashboard', icon: 'fas fa-tachometer-alt' },
  { label: 'Usuarios', route: '/admin/users', icon: 'fas fa-users' },
  {
    label: 'Categorias',
    icon: 'fas fa-tags',
    subItems: [
      { label: 'Posts', route: '/admin/categories/posts', icon: 'fas fa-square-share-nodes' },
      { label: 'Blogs', route: '/admin/categories/blogs', icon: 'fas fa-users-cog' },
      // { label: 'Grupos', route: '/admin/categories/groups', icon: 'fas fa-users-cog' },
      // { label: 'Eventos', route: '/admin/categories/events', icon: 'fas fa-calendar-alt' },
    ],
  },
  { label: 'Default Reels', route: '/admin/defaultReels', icon: 'fas fa-book' },
  { label: 'Eventos', route: '/admin/events', icon: 'fas fa-calendar-alt' },
  { label: 'Grupos', route: '/admin/groups', icon: 'fas fa-users-cog' },
  { label: 'Educación', route: '/admin/education', icon: 'fas fa-graduation-cap' },
  { label: 'Publicaciones', route: '/admin/posts', icon: 'fas fa-book' },
  { label: 'Reportes', route: '/admin/reports', icon: 'fas fa-exclamation-triangle' },
];

const openDropdowns = ref([]);

const toggleDropdown = (label) => {
  if (openDropdowns.value.includes(label)) {
    openDropdowns.value = openDropdowns.value.filter((item) => item !== label);
  } else {
    openDropdowns.value.push(label);
  }
};

const isOpen = (label) => openDropdowns.value.includes(label);
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