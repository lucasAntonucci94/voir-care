<template>
  <div>
    <!-- Filtros -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Blog de Cuidado Animal
        </h2>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar blogs..."
          class="px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-gray-200"
        />
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="category in uniqueCategories"
          :key="category.idDoc"
          :class="[
            'px-3 py-1 rounded-full text-sm font-semibold transition',
            selectedFilter === category.idDoc
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
          ]"
          @click="selectedFilter = category.idDoc"
        >
          {{ category.name }}
        </button>
        <button
          v-if="selectedFilter"
          class="px-3 py-1 rounded-full text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition"
          @click="selectedFilter = ''"
        >
          Limpiar Filtro
        </button>
      </div>
    </div>

    <!-- Estado de carga -->
    <div v-if="blogsStore.isLoading || isLoadingCategories" class="text-center py-8">
      <p class="text-gray-600 dark:text-gray-300">Cargando blogs o categorías...</p>
    </div>

    <!-- Estado de error -->
    <div v-else-if="blogsStore.error || errorCategories" class="text-center py-8 text-red-600">
      {{ blogsStore.error || errorCategories }}
    </div>

    <!-- Lista de blogs -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <BlogPostCard
        v-for="blog in filteredBlogs"
        :key="blog.id"
        :blog="blog"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useEducationBlogsStore } from '../../stores/educationBlogs';
import { useCategories } from '../../composable/useCategories';
import BlogPostCard from './BlogCard.vue';

// Store y composable
const blogsStore = useEducationBlogsStore();
const { fetchBlogCategories } = useCategories();

// Estados
const searchQuery = ref('');
const selectedFilter = ref('');
const categories = ref([]);
const isLoadingCategories = ref(false);
const errorCategories = ref(null);

// Obtener categorías
const loadCategories = async () => {
  try {
    isLoadingCategories.value = true;
    const blogCategories = await fetchBlogCategories();
    categories.value = blogCategories.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    errorCategories.value = 'Error al cargar las categorías';
  } finally {
    isLoadingCategories.value = false;
  }
};

// Computed properties
const uniqueCategories = computed(() => {
  return [{ idDoc: '', name: 'Todos' }, ...categories.value];
});

const filteredBlogs = computed(() => {
  let filtered = blogsStore.blogs.value || [];

  // Aplicar filtro por categoría (comparando idDoc)
  if (selectedFilter.value && selectedFilter.value !== '') {
    filtered = filtered.filter((blog) =>
      blog.categories?.some((cat) => cat.idDoc === selectedFilter.value)
    );
  }

  // Aplicar filtro por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (blog) =>
        blog.title?.toLowerCase().includes(query) ||
        blog.intro?.toLowerCase().includes(query) ||
        blog.summary?.toLowerCase().includes(query)
    );
  }

  return filtered;
});

// Lifecycle hooks
onMounted(async () => {
  blogsStore.subscribeToBlogs();
  await loadCategories();
});

onUnmounted(() => {
  blogsStore.unsubscribeFromBlogs();
});
</script>