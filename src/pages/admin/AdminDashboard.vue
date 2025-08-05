<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Banner -->
      <div class="bg-gradient-to-r from-primary/10 to-primary/70 dark:from-secondary/70 dark:to-secondary/20 rounded-2xl p-6 mb-8 shadow-md">
        <h1 class="text-3xl font-bold text-gray-800 dark:text-white font-dosis">Bienvenido al Dashboard</h1>
        <p class="text-gray-700 dark:text-gray-300 mt-2 font-dosis">
          Gestiona la comunidad de amantes de las mascotas. {{ isLoading ? 'Cargando...' : `${stats.users} usuarios activos y ${stats.events} eventos programados.` }}
        </p>
      </div>
      <!-- Loader -->
      <template v-if="isLoading">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="n in 6" :key="n" class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md animate-pulse">
            <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
            <div class="h-8 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
          </div>
        </div>
      </template>

      <!-- Stats Sections -->
      <template v-else>
        <!-- Gestión Section -->
        <section class="mb-8">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center justify-between font-dosis bg-primary/5 dark:bg-secondary/10 p-3 rounded-lg">
            Gestión
            <button
              class="text-sm text-primary dark:text-secondary hover:underline"
              @click="toggleSection('gestion')"
              aria-label="Alternar visibilidad de la sección de gestión"
            >
              {{ sections.gestion ? 'Ocultar' : 'Mostrar' }}
            </button>
          </h2>
          <transition name="fade">
            <div v-if="sections.gestion" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              <DashboardCard
                title="Reportes"
                :value="stats.reports"
                icon="fas fa-exclamation-triangle"
                routeTo="/admin/reports"
                :badge="stats.reports > 10 ? 'warning' : 'info'"
                tooltip="Reportes pendientes de revisión"
              />
              <DashboardCard
                title="Suscripciones pendientes"
                :value="stats.subscriptionRequests"
                icon="fas fa-envelope"
                routeTo="/admin/subscriptions"
                :badge="stats.subscriptionRequests > 0 ? 'warning' : 'info'"
                tooltip="Solicitudes de suscripción pendientes de aprobación"
              />
            </div>
          </transition>
          
        </section>
        <!-- Activity Section -->
        <section class="mb-8">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center justify-between font-dosis bg-primary/5 dark:bg-secondary/10 p-3 rounded-lg">
            Actividad de Usuarios
            <button
              class="text-sm text-primary dark:text-secondary hover:underline"
              @click="toggleSection('userActivity')"
              aria-label="Alternar visibilidad de la sección de actividad de usuarios"
            >
              {{ sections.userActivity ? 'Ocultar' : 'Mostrar' }}
            </button>
          </h2>
          <transition name="fade">
            <div v-if="sections.userActivity" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <DashboardCard
                title="Usuarios"
                :value="stats.users"
                icon="fas fa-users"
                routeTo="/admin/users"
                tooltip="Usuarios registrados en la plataforma"
                :badge="stats.users > 1000 ? 'success' : null"
              />
              <DashboardCard
                title="Eventos"
                :value="stats.events"
                icon="fas fa-calendar-alt"
                routeTo="/admin/events"
                tooltip="Eventos creados por usuarios"
                :badge="stats.events > 500 ? 'success' : null"
              />
              <DashboardCard
                title="Grupos"
                :value="stats.groups"
                icon="fas fa-users-cog"
                routeTo="/admin/groups"
                tooltip="Grupos creados por usuarios"
                :badge="stats.groups > 500 ? 'success' : null"
              />
              <DashboardCard
                title="Publicaciones"
                :value="stats.posts"
                icon="fas fa-book"
                routeTo="/admin/posts"
                tooltip="Publicaciones creadas por usuarios"
                :badge="stats.posts > 100 ? 'success' : null"
              />
              <DashboardCard
                title="Reels"
                :value="stats.reels"
                icon="fas fa-video"
                routeTo="/admin/posts"
                tooltip="Publicaciones creadas por voir"
                :badge="stats.reels > 100 ? 'success' : null"
                :disabled="true"
              />
              <DashboardCard
                title="Marcadores de Mapa"
                :value="stats?.locations"
                icon="fas fa-map-marker-alt"
                routeTo="/admin/locations"
                tooltip="Marcadores creados por usuarios"
                :badge="stats.mapMarkers > 100 ? 'success' : null"
              />
            </div>
          </transition>
        </section>

        <!-- Admin Content Section -->
        <section>
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center justify-between font-dosis bg-primary/5 dark:bg-secondary/10 p-3 rounded-lg">
            Contenido Administrativo
            <button
              class="text-sm text-primary dark:text-secondary hover:underline"
              @click="toggleSection('adminContent')"
              aria-label="Alternar visibilidad de la sección de contenido administrativo"
            >
              {{ sections.adminContent ? 'Ocultar' : 'Mostrar' }}
            </button>
          </h2>
          <transition name="fade">
            <div v-if="sections.adminContent" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <DashboardCard
                title="Blogs de Educación"
                :value="stats.educations"
                icon="fas fa-graduation-cap"
                routeTo="/admin/education"
                tooltip="Blogs educativos creados por el equipo"
                badge="info"
              />
              <DashboardCard
                title="Reels por defecto"
                :value="stats.reels"
                icon="fas fa-video"
                routeTo="/admin/reels"
                tooltip="Reels informativos creados por el equipo"
                badge="info"
              />
              <DashboardCard
                title="Categorías"
                icon="fas fa-tags"
                routeTo="/admin/categories"
                tooltip="Categorías de la plataforma"
                badge="info"
              />
            </div>
          </transition>
          <!-- <div class="mt-4 flex justify-end">
            <button
              class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-primary/10 dark:hover:bg-secondary/10 transition-all font-dosis"
              @click="router.push('/admin/categories')"
              aria-label="Gestionar categorías de posts y blogs"
            >
              <i class="fas fa-tags mr-2"></i> Gestionar Categorías
            </button>
          </div> -->
        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import DashboardCard from '../../components/atoms/DashboardCard.vue';
import { useUsersStore } from '../../stores/users';
import { useEventsStore } from '../../stores/events';
import { useGroupsStore } from '../../stores/groups';
import { useReportsStore } from '../../stores/reports';
import { usePostsStore } from '../../stores/posts';
import { useEducationBlogsStore } from '../../stores/educationBlogs';
import { useReelsStore } from '../../stores/reels';
import { useLocationsStore } from '../../stores/locations';
import { useSnackbarStore } from '../../stores/snackbar';
import { useSubscriptionRequests } from '../../composable/useSubscriptionRequest';

const router = useRouter();
const snackbarStore = useSnackbarStore();
const usersStore = useUsersStore();
const eventsStore = useEventsStore();
const groupsStore = useGroupsStore();
const reportsStore = useReportsStore();
const postsStore = usePostsStore();
const educationBlogsStore = useEducationBlogsStore();
const reelsStore = useReelsStore();
const locationsStore = useLocationsStore();
const { getPendingSubscriptionRequestsCount } = useSubscriptionRequests();

const isLoading = ref(true);
const timeFilter = ref('month');

const stats = ref({
  users: 0,
  events: 0,
  groups: 0,
  educations: 0,
  reels: 0,
  reelsDefault: 0,
  reports: 0,
  subscriptionRequests: 0,
  locations: 0,
  posts: 0,
});
const sections = ref({
  userActivity: true,
  adminContent: true,
  gestion: true,
});

async function fetchStats() {
  try {
    isLoading.value = true;
    const [
      usersCount,
      eventsCount,
      groupsCount,
      reportsCount,
      postsCount,
      educationsCount,
      reelsCount,
      reelsDefaultCount,
      subscriptionRequestsCount,
      locationsCount
    ] = await Promise.all([
      usersStore.getCount(timeFilter.value).catch(() => 0),
      eventsStore.getCount(timeFilter.value).catch(() => 0),
      groupsStore.getCount(timeFilter.value).catch(() => 0),
      reportsStore.getCount(timeFilter.value).catch(() => 0),
      postsStore.getCount(timeFilter.value).catch(() => 0),
      educationBlogsStore.getCount().catch(() => 0),
      reelsStore.getCount().catch(() => 0),
      reelsStore.getDefaultCount().catch(() => 0),
      getPendingSubscriptionRequestsCount().catch(() => 0),
      locationsStore.getCount().catch(() => 0),
    ]);
    stats.value = {
      users: usersCount,
      events: eventsCount,
      groups: groupsCount,
      reports: reportsCount,
      posts: postsCount,
      educations: educationsCount,
      reels: reelsCount,
      reelsDefault: reelsDefaultCount,
      subscriptionRequests: subscriptionRequestsCount,
      locations: locationsCount,
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    snackbarStore.show('Error al cargar las estadísticas', 'error');
  } finally {
    isLoading.value = false;
  }
}

function toggleSection(section) {
  sections.value[section] = !sections.value[section];
}

onMounted(() => {
  fetchStats();
});

onUnmounted(() => {
  reportsStore.unsubscribeFromReports();
});
</script>

<style scoped>
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #02bcae transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #02bcae;
  border-radius: 3px;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: var(--color-secondary-md);
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.dark .overflow-y-auto::-webkit-scrollbar-track {
  background: #1F2937;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>