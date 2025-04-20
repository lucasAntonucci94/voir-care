<template>
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div class="flex">
        <!-- Sidebar -->
        <aside class="w-64 bg-white dark:bg-gray-800 p-4 hidden md:block">
          <nav class="space-y-4">
            <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-4">Panel Admin</h2>
            <ul class="space-y-2">
              <li v-for="item in navItems" :key="item.label">
                <RouterLink :to="item.route" class="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary">
                  <i :class="item.icon" class="w-5 h-5"></i>
                  <span>{{ item.label }}</span>
                </RouterLink>
              </li>
            </ul>
          </nav>
        </aside>
  
        <!-- Main content -->
        <main class="flex-1 p-6">
          <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-6">Dashboard</h1>
  
          <!-- Stat grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardCard title="Usuarios" :value="stats.users" icon="fas fa-users" />
            <DashboardCard title="Eventos" :value="stats.events" icon="fas fa-calendar-alt" />
            <DashboardCard title="Grupos" :value="stats.groups" icon="fas fa-users-cog" />
            <DashboardCard title="FAQs" :value="stats.faqs" icon="fas fa-question-circle" />
            <DashboardCard title="Educación" :value="stats.education" icon="fas fa-graduation-cap" />
            <DashboardCard title="Adopción" :value="stats.adoption" icon="fas fa-paw" />
            <DashboardCard title="Reportes" :value="stats.reports" icon="fas fa-exclamation-triangle" />
          </div>
  
          <!-- Quick actions or recent activity -->
          <div class="mt-10">
            <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Últimas acciones</h2>
            <!-- Aquí podrías agregar una lista con acciones recientes del admin o de los usuarios -->
            <p class="text-gray-500 dark:text-gray-400">(Contenido en desarrollo...)</p>
          </div>
        </main>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { RouterLink } from 'vue-router'
  import DashboardCard from '../../components/atoms/DashboardCard.vue'
  
  const navItems = [
    { label: 'Usuarios', route: '/admin/users', icon: 'fas fa-users' },
    { label: 'Eventos', route: '/admin/events', icon: 'fas fa-calendar-alt' },
    { label: 'Grupos', route: '/admin/groups', icon: 'fas fa-users-cog' },
    { label: 'FAQs', route: '/admin/faqs', icon: 'fas fa-question-circle' },
    { label: 'Educación', route: '/admin/education', icon: 'fas fa-graduation-cap' },
    { label: 'Adopción', route: '/admin/adoption', icon: 'fas fa-paw' },
    { label: 'Reportes', route: '/admin/reports', icon: 'fas fa-exclamation-triangle' }
  ]
  
  const stats = ref({
    users: 1024,
    events: 230,
    groups: 56,
    faqs: 42,
    education: 18,
    adoption: 35,
    reports: 7
  })
  </script>
  
  <style scoped>
  /* Podés agregar animaciones o estilos personalizados si lo necesitás */
  </style>
  