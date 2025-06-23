<template>
  <div
    class="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md w-full flex items-center justify-between transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
    :class="{ 'cursor-pointer': routeTo, 'cursor-default': !routeTo }"
    @click="navigateTo"
  >
    <div>
      <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 group-hover:text-primary dark:group-hover:text-secondary">
        {{ title }}
      </h3>
      <p class="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-secondary">
        {{ value }}
      </p>
    </div>
    <i
      class="text-gray-400 dark:text-gray-500 text-2xl group-hover:text-primary dark:group-hover:text-secondary"
      :class="icon"
    ></i>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  routeTo: {
    type: String,
    default: null,
    required: false,
  },
});

function navigateTo() {
  if (props.routeTo) {
    router.push(props.  routeTo);
  }
}
</script>

<style scoped>
/* No se necesitan estilos adicionales, todas las clases están en el template */
</style>