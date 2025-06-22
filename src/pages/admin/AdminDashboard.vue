<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <div class="flex">
      <!-- Main content -->
      <main class="flex-1 p-6">
        <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-6">Dashboard</h1>

        <!-- Loader -->
        <template v-if="isLoading">
          <div class="flex flex-col items-center justify-center h-64">
            <img src="../../assets/loaders/pawOrange.gif" alt="Cargando" class="w-16 h-16 mb-4" />
            <p class="text-center text-primary dark:text-secondary animate-pulse">Cargando estadísticas...</p>
          </div>
        </template>

        <!-- Stat grid -->
        <template v-else>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardCard title="Usuarios" :value="stats.users" icon="fas fa-users" />
            <DashboardCard title="Eventos" :value="stats.events" icon="fas fa-calendar-alt" />
            <DashboardCard title="Grupos" :value="stats.groups" icon="fas fa-users-cog" />
            <DashboardCard title="Educación" :value="stats.educations" icon="fas fa-graduation-cap" />
            <DashboardCard title="Publicaciones" :value="stats.posts" icon="fas fa-book" />
            <DashboardCard title="Reportes" :value="stats.reports" icon="fas fa-exclamation-triangle" />
          </div>
        </template>
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
import { useReportsStore } from '../../stores/reports';
import { usePostsStore } from '../../stores/posts';
import { useEducationBlogsStore } from '../../stores/educationBlogs';
import { useSnackbarStore } from '../../stores/snackbar';

const snackbarStore = useSnackbarStore();
const usersStore = useUsersStore();
const eventsStore = useEventsStore();
const groupsStore = useGroupsStore();
const reportsStore = useReportsStore();
const postsStore = usePostsStore();
const educationBlogsStore = useEducationBlogsStore();
const isLoading = ref(true);
const stats = ref({
  users: 0,
  events: 0,
  groups: 0,
  educations: 0,
  reports: 0,
  posts: 0,
});

onMounted(async () => {
  try {
    isLoading.value = true;
    // Cargar todos los contadores en paralelo
    const [
      usersCount,
      eventsCount,
      groupsCount,
      reportsCount,
      postsCount,
      educationsCount,
    ] = await Promise.all([
      usersStore.getCount().catch((err) => {
        console.error('Error fetching users count:', err);
        return 0; // Fallback para evitar que falle todo
      }),
      eventsStore.getCount().catch((err) => {
        console.error('Error fetching events count:', err);
        return 0;
      }),
      groupsStore.getCount().catch((err) => {
        console.error('Error fetching groups count:', err);
        return 0;
      }),
      reportsStore.getCount().catch((err) => {
        console.error('Error fetching reports count:', err);
        return 0;
      }),
      postsStore.getCount().catch((err) => {
        console.error('Error fetching posts count:', err);
        return 0;
      }),
      educationBlogsStore.getCount().catch((err) => {
        console.error('Error fetching educations count:', err);
        return 0;
      }),
    ]);

    stats.value = {
      users: usersCount,
      events: eventsCount,
      groups: groupsCount,
      reports: reportsCount,
      posts: postsCount,
      educations: educationsCount,
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    snackbarStore.show('Error al cargar las estadísticas', 'error');
  } finally {
    isLoading.value = false;
  }
});

onUnmounted(() => {
  // Cancelar suscripciones si existen
  reportsStore.unsubscribeFromReports();
  // Agregar desuscripciones para otros stores si tienen suscripciones en tiempo real
});
</script>

<style scoped>

</style>