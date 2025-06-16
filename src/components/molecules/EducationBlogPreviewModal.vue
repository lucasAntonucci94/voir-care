<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/60 z-101 flex items-center justify-center p-4"
  >
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <!-- Modal Header -->
      <div class="sticky top-0 bg-white dark:bg-gray-800 z-10 p-6 border-b flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-300">
          Vista previa del Blog
        </h3>
        <button
          @click="emitClose"
          class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
          aria-label="Cerrar modal de vista previa"
        >
          <i class="fa-solid fa-xmark w-6 h-6"></i>
        </button>
      </div>

      <!-- Blog Preview Content -->
      <div class="p-6 space-y-6">
        <!-- Main Image -->
        <img
          v-if="blog.image"
          :src="blog.image"
          :alt="blog.title"
          class="w-full h-64 object-cover rounded-lg shadow-sm"
        />

        <!-- Blog Header -->
        <div>
          <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">{{ blog.title || 'Sin título' }}</h2>
          <div class="mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span>{{ blog.date || 'N/A' }}</span>
            <span v-if="blog.categories?.length"> | {{ blog.categories.join(', ') }}</span>
            <span v-if="blog.type"> | {{ blog.type }}</span>
          </div>
        </div>

        <!-- Introduction -->
        <div>
          <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200">Introducción</h3>
          <p class="mt-2 text-gray-600 dark:text-gray-300">{{ blog.intro || 'Sin introducción' }}</p>
        </div>

        <!-- Summary -->
        <div>
          <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200">Resumen</h3>
          <p class="mt-2 text-gray-600 dark:text-gray-300">{{ blog.summary || 'Sin resumen' }}</p>
        </div>

        <!-- Sections -->
        <div v-if="blog.sections?.length" class="space-y-6">
          <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200">Secciones</h3>
          <div v-for="(section, index) in blog.sections" :key="index" class="space-y-4">
            <h4 class="text-md font-medium text-gray-700 dark:text-gray-200">{{ section.title || `Sección ${index + 1}` }}</h4>
            <p class="text-gray-600 dark:text-gray-300">{{ section.text || 'Sin contenido' }}</p>
            <img
              v-if="section.image"
              :src="section.image"
              :alt="`Imagen de la sección ${index + 1}`"
              class="w-full h-48 object-cover rounded-lg shadow-sm"
            />
          </div>
        </div>
        <div v-else>
          <p class="text-gray-600 dark:text-gray-300">No hay secciones disponibles.</p>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="p-6 border-t flex justify-end">
        <button
          @click="emitClose"
          class="px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="Cerrar vista previa"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  blog: {
    type: Object,
    required: true,
    default: () => ({
      id: null,
      title: '',
      image: '',
      date: '',
      intro: '',
      categories: [],
      type: '',
      summary: '',
      sections: [],
    }),
  },
});

const emit = defineEmits(['close']);

const emitClose = () => {
  emit('close');
};
</script>

<style scoped>
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(155, 155, 155, 0.5);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
</style>