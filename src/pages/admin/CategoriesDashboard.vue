<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Banner -->
      <div class="bg-gradient-to-r from-primary/10 to-primary/70 dark:from-secondary/70 dark:to-secondary/20 rounded-2xl p-6 mb-8 shadow-md">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white font-dosis">Dashboard de categorías</h1>
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
        <!-- Admin Content Section -->
        <section>
          <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center justify-between font-dosis bg-primary/5 dark:bg-secondary/10 p-3 rounded-lg">
            Contenido Administrativo
          </h2>
          <transition name="fade">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <DashboardCard
                title="Categorías de Blogs"
                icon="fas fa-graduation-cap"
                routeTo="/admin/categories/blogs"
                tooltip="Blogs educativos creados por el equipo"
              />
              <DashboardCard
                title="Categorías de Posts"
                icon="fas fa-image"
                routeTo="/admin/categories/posts"
                tooltip="Reels informativos creados por el equipo"
              />
            </div>
          </transition>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import DashboardCard from '../../components/atoms/DashboardCard.vue';
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