<template>
  <section class="py-10 bg-gray-200 dark:bg-gray-800 josefin-font">
    <div class="container mx-auto px-4">
      <h2 class="text-4xl font-bold text-gray-700 dark:text-gray-300 text-center mb-12 font-abril">{{ title }}</h2>
      <div class="relative">
        <div
          ref="scrollContainer"
          class="flex overflow-x-auto overflow-y-hidden space-x-3 scrollbar-hide snap-x snap-mandatory"
          style="scroll-behavior: smooth;"
          @scroll="updateActiveIndex"
        >
          <div
            v-for="(event, index) in events"
            :key="event.title"
            class="min-w-[220px] sm:min-w-[200px] bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all snap-center relative flex-shrink-0 h-64"
          >
            <span
              class="absolute top-4 left-4 bg-primary dark:bg-secondary text-white text-xs font-semibold px-2 py-1 rounded-full z-10"
            >
              {{ event.date.includes('Únete') ? 'Grupo' : 'Evento' }}
            </span>
            <img
              :src="event.image"
              :alt="event.title"
              class="w-full h-32 rounded-md object-cover mb-4"
              loading="lazy"
              @error="handleImageError($event)"
            />
            <h3 class="text-base font-semibold text-gray-700 dark:text-gray-200 mb-2 text-center josefin-font line-clamp-2">{{ event.title }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300 text-center line-clamp-1">{{ event.date }}</p>
          </div>
        </div>
        <button
          v-if="events.length > 1"
          class="absolute left-0 top-1/2 -translate-y-1/2 bg-[#F4A261] hover:bg-[#E76F51] rounded-full w-12 h-12 flex items-center justify-center transition-colors sm:w-8 sm:h-8"
          @click="scroll(-1)"
        >
          <i class="fa-solid fa-chevron-left text-white text-lg sm:text-base"></i>
        </button>
        <button
          v-if="events.length > 1"
          class="absolute right-0 top-1/2 -translate-y-1/2 bg-[#F4A261] hover:bg-[#E76F51] rounded-full w-12 h-12 flex items-center justify-center transition-colors sm:w-8 sm:h-8"
          @click="scroll(1)"
        >
          <i class="fa-solid fa-chevron-right text-white text-lg sm:text-base"></i>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  title: { type: String, default: 'Eventos y Grupos' },
  events: {
    type: Array,
    default: () => [],
  },
  autoScroll: { type: Boolean, default: true },
});

const scrollContainer = ref(null);
const activeIndex = ref(0);
let scrollInterval = null;

const scroll = (direction) => {
  if (scrollContainer.value) {
    const cardWidth = window.innerWidth < 640 ? 200 + 12 : 220 + 12;
    const newScrollLeft = scrollContainer.value.scrollLeft + direction * cardWidth;
    scrollContainer.value.scrollLeft = newScrollLeft;
  }
};

const scrollTo = (index) => {
  if (scrollContainer.value) {
    const cardWidth = window.innerWidth < 640 ? 200 + 12 : 220 + 12;
    scrollContainer.value.scrollLeft = index * cardWidth;
  }
};

const updateActiveIndex = () => {
  if (scrollContainer.value) {
    const cardWidth = window.innerWidth < 640 ? 200 + 12 : 220 + 12;
    const newIndex = Math.round(scrollContainer.value.scrollLeft / cardWidth);
    activeIndex.value = Math.max(0, Math.min(newIndex, props.events.length - 1));
  }
};

const handleImageError = (event) => {
  console.error('Error loading image:', event.target.src);
  event.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
};

onMounted(() => {
  if (scrollContainer.value && props.autoScroll) {
    scrollInterval = setInterval(() => {
      const cardWidth = window.innerWidth < 640 ? 200 + 12 : 220 + 12;
      const maxScroll = (props.events.length - 1) * cardWidth;
      if (scrollContainer.value.scrollLeft >= maxScroll) {
        scrollContainer.value.scrollLeft = 0;
      } else {
        scroll(1);
      }
    }, 8000);
  }
});

onUnmounted(() => {
  if (scrollInterval) clearInterval(scrollInterval);
});
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>