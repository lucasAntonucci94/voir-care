<template>
  <div class="container mx-auto p-4 md:p-6 lg:p-8 font-inter">
    <!-- Sección de Cabecera y Búsqueda -->
    <div class="mb-6">
      <!-- Título principal -->
      <h2 class="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-center md:text-left">
        Blog de Cuidado Animal
      </h2>

      <!-- Barra de Búsqueda -->
      <div class="relative mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar blogs por título o descripción..."
          class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary transition-colors shadow-sm"
          aria-label="Buscar blogs"
        />
        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
          aria-label="Limpiar búsqueda"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Filtros de Categoría -->
      <div class="flex md:flex-wrap gap-2 overflow-x-auto pb-2 px-4 md:px-0 md:justify-center lg:justify-start">
        <button
          v-for="category in uniqueCategories"
          :key="category.idDoc"
          :class="[
            'flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap',
            selectedFilter === category.idDoc
              ? 'bg-primary dark:bg-secondary text-white shadow-md'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
          ]"
          @click="selectedFilter = category.idDoc"
          :aria-pressed="selectedFilter === category.idDoc"
          :aria-label="`Filtrar por ${category.name}`"
        >
          {{ category.name }}
        </button>
      </div>
    </div>

    <!-- Estado de carga -->
    <div v-if="blogsStore.isLoading || isLoadingCategories" class="text-center py-8">
      <p class="text-gray-600 dark:text-gray-300">
        <i class="fas fa-spinner fa-spin mr-2"></i> Cargando blogs o categorías...
      </p>
    </div>

    <!-- Estado de error -->
    <div v-else-if="blogsStore.error || errorCategories" class="text-center py-8 text-red-600 bg-red-100 dark:bg-red-900/20 p-4 rounded-lg">
      <i class="fas fa-exclamation-circle mr-2"></i> {{ blogsStore.error || errorCategories }}
    </div>

    <!-- Mensaje si no hay resultados -->
    <div v-else-if="filteredBlogs.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
      <i class="fas fa-box-open text-5xl mb-4"></i>
      <p class="text-lg">No se encontraron blogs con los criterios de búsqueda o filtro.</p>
      <button
        v-if="searchQuery || selectedFilter"
        @click="clearAllFilters"
        class="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
      >
        Limpiar filtros
      </button>
    </div>

    <!-- Lista de blogs -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <BlogPostCard
        v-for="blog in filteredBlogs"
        :key="blog.idDoc"
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
    // Asegurarse de que cada categoría tenga un idDoc para el filtro
    categories.value = blogCategories.map(cat => ({
      ...cat,
      idDoc: cat.idDoc || cat.id // Fallback si idDoc no está presente
    })).sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error loading categories:", error);
    errorCategories.value = 'Error al cargar las categorías';
  } finally {
    isLoadingCategories.value = false;
  }
};

// Computed properties
const uniqueCategories = computed(() => {
  // Asegúrate de que 'Todos' tenga un idDoc vacío para que el filtro funcione correctamente
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

// Métodos de utilidad
const clearSearch = () => {
  searchQuery.value = '';
};

const clearAllFilters = () => {
  searchQuery.value = '';
  selectedFilter.value = '';
};

// Lifecycle hooks
onMounted(async () => {
  blogsStore.subscribeToBlogs();
  await loadCategories();
});

onUnmounted(() => {
  blogsStore.unsubscribeFromBlogs();
});
</script>

<style scoped>
/* Oculta la barra de desplazamiento pero permite el scroll */
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
}
</style>
