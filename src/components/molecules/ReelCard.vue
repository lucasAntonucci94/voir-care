<template>
  <div
    class="min-w-[180px] bg-white dark:bg-gray-700 rounded-lg shadow-md snap-center border border-gray-200 dark:border-gray-600 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group relative"
    @click="emit('open-reel', group.reels[0])"
  >
    <!-- Imagen del reel (usamos el thumbnail del primer reel) -->
    <div class="relative">
      <img
        :src="group.reels[0].thumbnailUrl ?? AvatarFallback"
        :alt="group.reels[0].title"
        class="w-full h-28 object-cover rounded-t-lg"
        loading="lazy"
      />
      <!-- Overlay para efecto moderno -->
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-t-lg transition-opacity duration-300"></div>
    </div>

    <!-- Título del reel (usamos el título del primer reel) -->
    <p class="mt-2 px-3 text-sm text-gray-700 dark:text-gray-300 font-semibold text-center line-clamp-2">
      {{ group.reels[0].title }}
    </p>

    <!-- Información del usuario y progreso -->
    <div class="absolute bottom-0 left-0 right-0 px-3 py-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-600 rounded-b-lg">
      <!-- Información del usuario -->
      <div class="flex items-center space-x-2">
        <img
          v-if="!group.reels[0].default"
          :key="group.reels[0].user.photoURL"
          :src="group.reels[0].user.photoURL"
          :alt="group.reels[0].user.displayName"
          class="w-6 h-6 rounded-full object-cover border border-gray-300 dark:border-gray-500"
          loading="lazy"
        />
        <div v-else>
          <img
            src="../../assets/icons/logoGreen.png"
            alt="User avatar"
            class="w-6 h-6 rounded-full object-cover border border-gray-300 dark:border-gray-500 dark:hidden"
          />
          <img
            src="../../assets/icons/logoOrange.png" 
            alt="User avatar"
            class="w-6 h-6 rounded-full object-cover border border-gray-300 dark:border-gray-500 hidden dark:inline"
          />
        </div>
        <p class="text-xs text-gray-800 dark:text-gray-200 font-medium truncate">
          {{ group.reels[0].user.displayName }}
        </p>
      </div>

      <!-- Indicador de progreso (puntos) si hay más de un reel -->
      <div v-if="group.reels.length > 1" class="flex justify-center space-x-1 mt-1">
        <span
          v-for="i in group.reels.length"
          :key="i"
          class="w-2 h-2 rounded-full"
          :class="i === 1 ? 'bg-gray-800 dark:bg-gray-200' : 'bg-gray-400 dark:bg-gray-500'"
        ></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue';
import AvatarFallback from '../../assets/avatar1.jpg';
const props = defineProps({
  group: {
    type: Object,
    required: true,
    validator: (group) => {
      return (
        Array.isArray(group.reels) &&
        group.reels.length > 0 &&
        group.reels[0].thumbnailUrl &&
        group.reels[0].title &&
        group.reels[0].user &&
        group.reels[0].user.photoURL &&
        group.reels[0].user.displayName
      );
    },
  },
});

const emit = defineEmits(['open-reel']);
</script>

<style scoped>
</style>