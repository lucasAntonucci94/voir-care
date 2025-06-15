<template>
  <div
    class="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden w-full max-w-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl cursor-pointer flex flex-col h-full"
    @click="goToDetail"
  >
    <!-- Media -->
    <div class="relative h-40 w-full">
      <img
        v-if="group.media?.url && group?.media.type === 'image'"
        :src="group.media.url"
        :alt="group.title"
        class="w-full h-full object-cover transition-opacity duration-300"
        loading="lazy"
      />
      <video
        v-else-if="group.media?.url && group?.media.type === 'video'"
        :src="group?.media?.url"
        class="w-full h-full object-cover"
        autoplay
        loop
        muted
      />
      <div
        v-else
        class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500"
      >
        <i class="fas fa-image text-3xl"></i>
      </div>
      <!-- Badge de privacidad -->
      <span
        class="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold text-white rounded-full shadow-sm"
        :class="group.privacy === 'public' ? 'bg-green-500' : 'bg-red-500'"
      >
        {{ group.privacy === 'public' ? 'Público' : 'Privado' }}
      </span>
    </div>

    <!-- Contenido -->
    <div class="p-4 space-y-2 text-sm text-gray-800 dark:text-gray-200 flex-grow">
      <h3 class="text-xl font-semibold">{{ group.title }}</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        {{ group.description || 'Sin descripción' }}
      </p>
      <!-- Categorías -->
      <div class="flex flex-wrap gap-2">
        <span
          v-for="category in group.categories"
          :key="category.id"
          class="text-xs px-2 py-1 rounded-full bg-teal-200 text-teal-900 dark:bg-teal-600 dark:text-white"
        >
          {{ category.name }}
        </span>
      </div>
    </div>

    <!-- Footer con miembros -->
    <div class="p-4 border-t border-gray-100 dark:border-gray-700">
      <div class="flex justify-between items-center flex-wrap gap-y-2">
        <div class="flex gap-2">
          <span
            class="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
          >
            <i class="fas fa-users text-primary dark:text-secondary"></i>
            {{ (group?.members && group?.members?.length ? group.members.length - 1 : 0) || 0 }}
            {{ (group?.members && group?.members?.length ? group.members.length - 1 : 0) === 1 ? 'miembro' : 'miembros' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const props = defineProps({
  group: {
    type: Object,
    required: true,
  },
});

const router = useRouter();

function goToDetail() {
  router.push({ name: 'groupDetail', params: { idGroup: props.group.idDoc } });
}
</script>

<style scoped>
/* Ajustar el diseño del card */
.rounded-2xl {
  border-radius: 1rem;
}

/* Mejorar sombras */
.shadow-md {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.shadow-xl {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.15);
}

/* Mejorar el texto */
.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.leading-relaxed {
  line-height: 1.625;
}

/* Estilo para el badge de privacidad */
.rounded-full {
  font-size: 0.75rem;
  line-height: 1rem;
}
</style>