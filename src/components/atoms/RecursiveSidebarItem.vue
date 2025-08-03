<template>
  <div>
    <!-- Si tiene subItems, es un menú desplegable -->
    <div v-if="item.subItems" class="flex flex-col">
      <button
        @click="toggleDropdown"
        class="flex items-center justify-between w-full text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-secondary py-2 px-2"
        :class="{ 'text-primary dark:text-secondary': isDropdownOpen }"
      >
        <div class="flex items-center text-left gap-2">
          <i :class="item.icon" class="w-5 h-5"></i>
          <span>{{ item.label }}</span>
        </div>
        <i
          :class="isDropdownOpen ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"
          class="w-5 h-5 transition-transform duration-200"
        ></i>
      </button>
      <transition name="slide">
        <ul v-if="isDropdownOpen" class="pl-6 space-y-1 mt-1">
          <!-- Llamada recursiva para cada subItem -->
          <li v-for="subItem in item.subItems" :key="subItem.label">
            <RecursiveSidebarItem :item="subItem" />
          </li>
        </ul>
      </transition>
    </div>
    <!-- Si no tiene subItems, es un enlace directo -->
    <RouterLink
      v-else
      :to="item.route"
      class="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-secondary py-2 px-2 text-sm"
      :class="{ 'font-semibold text-primary dark:text-secondary': isActiveLink(item.route) }"
    >
      <i :class="item.icon" class="w-4 h-4"></i>
      <span>{{ item.label }}</span>
    </RouterLink>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

// Define las props, asumiendo que un ítem siempre tendrá al menos 'label' y 'icon'
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

// Estado local para cada instancia del componente
const isDropdownOpen = ref(false);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

// Lógica para resaltar el enlace activo
const route = useRoute();
const isActiveLink = (linkRoute) => {
  return route.path === linkRoute;
};
</script>

<style scoped>
/* Las mismas transiciones de tu componente original */
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
