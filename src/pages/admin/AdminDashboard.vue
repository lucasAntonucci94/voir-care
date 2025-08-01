<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Welcome Banner -->
      <div class="bg-gradient-to-r from-primary/10 to-primary/70 dark:from-secondary/70 dark:to-secondary/20 rounded-2xl p-6 mb-8 shadow-md">
        <h1 class="text-3xl font-bold text-gray-800 dark:text-white font-dosis">Bienvenido al Dashboard</h1>
        <p class="text-gray-700 dark:text-gray-300 mt-2 font-dosis">
          Gestiona la comunidad de amantes de las mascotas. {{ isLoading ? 'Cargando...' : `${stats.users} usuarios activos y ${stats.events} eventos programados.` }}
        </p>
      </div>

      <!-- Header + Buscador + Filtros + Accion Rápida -->
      <!-- Integrar mas adelante el buscador, por search, temporalidad, y boton de accion rapida -->
      <!-- <header class="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div class="flex items-center gap-4 w-full sm:w-auto">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar usuarios, eventos, publicaciones..."
            class="p-2 w-full sm:w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary font-dosis"
            aria-label="Buscar en el dashboard"
            @input="handleSearch"
          />
        </div>
        <div class="flex items-center gap-4">
          <div class="flex gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-lg p-1">
            <button
              v-for="filter in timeFilters"
              :key="filter.value"
              class="px-3 py-1 rounded-lg text-sm font-dosis"
              :class="{
                'bg-primary dark:bg-secondary text-white': timeFilter.value === filter.value,
                'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700': timeFilter.value !== filter.value,
              }"
              @click="timeFilter.value = filter.value; fetchStats()"
              :aria-label="`Filtrar por ${filter.label}`"
            >
              {{ filter.label }}
            </button>
          </div>
          <button
            class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-lg hover:bg-primary/90 dark:hover:bg-secondary/90 transition-all font-dosis"
            @click="openQuickActions"
            aria-label="Abrir acciones rápidas"
          >
            <i class="fas fa-plus mr-2"></i> Acciones
          </button>
        </div>
      </header> -->

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
        <!-- Moderation Section -->
        <section class="mb-8">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center justify-between font-dosis bg-primary/5 dark:bg-secondary/10 p-3 rounded-lg">
            Moderación
            <button
              class="text-sm text-primary dark:text-secondary hover:underline"
              @click="toggleSection('moderation')"
              aria-label="Alternar visibilidad de la sección de moderación"
            >
              {{ sections.moderation ? 'Ocultar' : 'Mostrar' }}
            </button>
          </h2>
          <transition name="fade">
            <div v-if="sections.moderation" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
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
        <!-- User Activity Section -->
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
                :badge="stats.events > 50 ? 'success' : null"
              />
              <DashboardCard
                title="Grupos"
                :value="stats.groups"
                icon="fas fa-users-cog"
                routeTo="/admin/groups"
                tooltip="Grupos creados por usuarios"
                :badge="stats.groups > 20 ? 'success' : null"
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
              />
              <DashboardCard
                title="Marcadores de Mapa"
                :value="stats?.mapMarkers ?? 0"
                icon="fas fa-map-marker-alt"
                routeTo="/admin/posts"
                tooltip="Marcadores creados por usuarios"
              />
                <!-- :badge="stats.mapMarkers > 100 ? 'success' : null" -->
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
const { getPendingSubscriptionRequestsCount } = useSubscriptionRequests();

const isLoading = ref(true);
const timeFilter = ref('month');
const searchQuery = ref('');
const timeFilters = [
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: '7 días' },
  { value: 'month', label: '30 días' },
];
const stats = ref({
  users: 0,
  events: 0,
  groups: 0,
  educations: 0,
  reels: 0,
  reelsDefault: 0,
  reports: 0,
  subscriptionRequests: 0,
});
const sections = ref({
  userActivity: true,
  adminContent: true,
  moderation: true,
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
    ]);
    debugger
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

function openQuickActions() {
  router.push('/admin/quick-actions');
}

function handleSearch() {
  // Implement search logic (e.g., filter users, events, posts)
  console.log('Searching:', searchQuery.value);
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