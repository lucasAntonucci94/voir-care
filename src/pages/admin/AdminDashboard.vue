<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <div class="flex">
      <!-- Main content -->
      <main class="flex-1 p-6">
        <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-6">Dashboard</h1>

        <!-- Stat grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard title="Usuarios" :value="stats.users" icon="fas fa-users" />
          <DashboardCard title="Eventos" :value="stats.events" icon="fas fa-calendar-alt" />
          <DashboardCard title="Grupos" :value="stats.groups" icon="fas fa-users-cog" />
          <DashboardCard title="Educación" :value="stats.education" icon="fas fa-graduation-cap" />
          <DashboardCard title="Adopción" :value="stats.adoption" icon="fas fa-paw" />
          <DashboardCard title="Reportes" :value="stats.reports" icon="fas fa-exclamation-triangle" />
        </div>

        <!-- Ultimas acciones -->
        <!-- <div class="mt-10">
          <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Últimas acciones</h2>
          <p class="text-gray-500 dark:text-gray-400">(Contenido en desarrollo...)</p>
        </div> -->
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import DashboardCard from '../../components/atoms/DashboardCard.vue';
import { useUsersStore } from '../../stores/users';
import { useEventsStore } from '../../stores/events';
import { useGroupsStore } from '../../stores/groups';

const usersStore = useUsersStore();
const eventsStore = useEventsStore();
const groupsStore = useGroupsStore();

const stats = ref({
  users: 0,
  events: 0,
  groups: 0,
  education: 0,
  adoption: 0,
  reports: 0,
});

onMounted(async () => {
  stats.value.users = await usersStore.getCount();
  stats.value.events = await eventsStore.getCount();
  stats.value.groups = await groupsStore.getCount();
});
</script>

<style scoped>
</style>