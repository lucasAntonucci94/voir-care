<template>
  <div
    class="group bg-gray-100/40 dark:bg-gray-800 rounded-2xl p-6 shadow-md w-full flex items-center justify-between transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
    :class="{ 'cursor-pointer': routeTo, 'cursor-default': !routeTo }"
    @click="navigateTo"
  >
    <div>
      <div class="flex items-center gap-2 mb-1">
        <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-primary dark:group-hover:text-secondary font-dosis">
          {{ title }}
        </h3>
        <span
          v-if="tooltip"
          class="text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-secondary cursor-help"
          :title="tooltip"
          :aria-label="tooltip"
        >
          <i class="fas fa-info-circle"></i>
        </span>
      </div>
      <p class="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-secondary font-dosis">
        {{ value }}
        <span
          v-if="badge === 'warning'"
          class="inline-flex items-center px-2 py-1 ml-2 text-xs font-medium text-white bg-red-500 rounded-full"
        >
          {{ badgeTitle ?? '¡Atención!' }}
        </span>
        <span
          v-if="badge === 'success'"
          class="inline-flex items-center px-2 py-1 ml-2 text-xs font-medium text-white bg-green-500 rounded-full"
        >
          {{ badgeTitle ?? 'Estable' }}
        </span>
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
  },
  tooltip: {
    type: String,
    default: null,
  },
  badge: {
    type: String,
    default: null,
  },
  badgeTitle: {
    type: String,
    default: null,
  },
});

function navigateTo() {
  if (props.routeTo) {
    router.push(props.routeTo);
  }
}
</script>

<style scoped>
/* No additional styles needed, all classes are in the template */
</style>