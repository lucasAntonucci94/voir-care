<template>
  <div class="flex flex-1 overflow-hidden">
    <main class="flex-grow py-2 min-h-screen dosis-font overflow-y-auto">
      <div class="container mx-auto px-4">
        <CarrouselReels />

        <div class="flex items-center mx-auto w-xs xs:w-sm max-w-lg sm:w-lg  gap-4 mb-6"> 
          <CreatePostModal /> 
          
          <div class="relative">
            <button @click="toggleFiltersDropdown" 
                    class="flex items-center px-4 py-2 bg-primary hover:bg-primary-md dark:bg-secondary dark:hover:bg-secondary-md text-white rounded-full text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-secondary/50 transition-colors"
                    aria-haspopup="true" 
                    :aria-expanded="showFilters.toString()">
                <i class="fas fa-filter" aria-hidden="true"></i>
                <span class="hidden sm:inline-block ml-2">Filtros</span>
            </button>
            
            <div v-if="showFilters" 
                 class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-xl py-2 z-100"
                 @click.stop>
                <label class="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                    <input type="checkbox" 
                           value="all" 
                           v-model="selectedCategoryIds" 
                           @change="handleSelectAll"
                           class="form-checkbox h-4 w-4 text-primary-accent rounded focus:ring-primary-accent border-gray-300 dark:border-gray-500 dark:bg-gray-800 dark:checked:bg-primary-accent">
                    <span class="ml-2 text-gray-800 dark:text-gray-200">Todas las Categorías</span>
                </label>

                <label v-for="category in categories" :key="category.id" class="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                    <input type="checkbox" 
                           :value="category.id" 
                           v-model="selectedCategoryIds" 
                           @change="handleIndividualCategoryChange"
                           class="form-checkbox h-4 w-4 text-primary-accent rounded focus:ring-primary-accent border-gray-300 dark:border-gray-500 dark:bg-gray-800 dark:checked:bg-primary-accent">
                    <span class="ml-2 text-gray-800 dark:text-gray-200">{{ category.name }}</span>
                </label>
                <div class="px-4 py-2 border-t border-gray-200 dark:border-gray-600">
                    <button @click="applyFilters" class="w-full bg-primary hover:bg-primary-md dark:bg-secondary dark:hover:bg-secondary-md text-white py-1 rounded-md text-sm">Aplicar</button>
                </div>
            </div>
          </div>
        </div>

        <section class="space-y-6 flex flex-col items-center mt-6"> 
          <template v-if="postsStore.isLoading">
            <img src="../assets/loaders/pawOrange.gif" alt="Cargando..." class="w-24 h-24">
            <p class="text-center text-primary dark:text-secondary animate-pulse">Cargando publicaciones...</p>
          </template>
          <template v-else>
            <PostCard
              v-for="post in filteredAndVisiblePosts"
              :key="post.idDoc"
              :post="post"
            />
            <p v-if="filteredAndVisiblePosts.length === 0" class="text-center text-gray-500">No hay publicaciones disponibles con los filtros actuales.</p>
          </template>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
// ... (tu script setup existente sin cambios, ya que la lógica ya fue adaptada)
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import CreatePostModal from '../components/organisms/CreatePostModal.vue';
import PostCard from '../components/organisms/PostCard.vue';
import CarrouselReels from '../components/organisms/CarrouselReels.vue';
import { usePostsStore } from '../stores/posts';
import { useAuth } from '../api/auth/useAuth';
import { useCategories } from '../composable/useCategories';

const { user } = useAuth();
const postsStore = usePostsStore();
const { categories } = useCategories();

// Estado para el multiselect de filtros
const showFilters = ref(false);
const selectedCategoryIds = ref([]);

// Observador para inicializar selectedCategoryIds cuando las categorías estén disponibles
watch(categories, (newCategories) => {
    if (newCategories && newCategories.length > 0) {
        selectedCategoryIds.value = ['all', ...newCategories.map(cat => cat.id)];
    }else {
        selectedCategoryIds.value = [];
    }
}, { immediate: true });

// Maneja la selección de "Todas las Categorías"
const handleSelectAll = () => {
    if (selectedCategoryIds.value.includes('all')) {
        // Si 'all' se marcó, seleccionamos todas las categorías individuales
        selectedCategoryIds.value = ['all', ...categories.value.map(cat => cat.id)];
    } else {
        // Si 'all' se desmarcó, desmarcamos todas las categorías individuales
        selectedCategoryIds.value = [];
    }
    // Si desmarcan 'all' y el array queda vacío, lo volvemos a poner para mostrar todo
    if (selectedCategoryIds.value.length === 0 && categories.value.length > 0) {
        selectedCategoryIds.value = ['all', ...categories.value.map(cat => cat.id)];
    }
};

// Maneja la selección de categorías individuales
const handleIndividualCategoryChange = () => {
    if (selectedCategoryIds.value.includes('all') && selectedCategoryIds.value.length > categories.value.length + 1) {
        // Si "all" está seleccionado y se elige otra categoría, quita "all"
        selectedCategoryIds.value = selectedCategoryIds.value.filter(id => id !== 'all');
    } else if (selectedCategoryIds.value.length === categories.value.length && !selectedCategoryIds.value.includes('all')) {
        // Si todas las categorías individuales están seleccionadas, añade "all"
        selectedCategoryIds.value.push('all');
    } else if (selectedCategoryIds.value.length === 0) {
        // Si no hay ninguna seleccionada, selecciona "all" por defecto
        selectedCategoryIds.value = ['all', ...categories.value.map(cat => cat.id)];
    }
};

const toggleFiltersDropdown = () => {
    showFilters.value = !showFilters.value;
};

const applyFilters = () => {
    showFilters.value = false;
};

const closeFiltersDropdown = (event) => { //TODO AGREGAR ID ESPECIFICA APRA ESTETILO DE EVENTO
    const filterContainer = document.querySelector('.flex.items-center.gap-4.mb-6'); // Selector ajustado
    if (showFilters.value && filterContainer && !filterContainer.contains(event.target)) {
        showFilters.value = false;
    }
};

const filteredAndVisiblePosts = computed(() => {
    let postsToFilter = postsStore.posts.value || [];
    // 1. Filtrar por categorías seleccionadas
    if (selectedCategoryIds.value.length > 0 && !selectedCategoryIds.value.includes('all')) {
        postsToFilter = postsToFilter.filter(post => {
            // Verifica si el post tiene la propiedad 'categories' y si es un array
            if (post.categories && Array.isArray(post.categories)) {
                // Comprueba si AL MENOS UNA de las categorías del post
                // coincide con ALGUNA de las categorías seleccionadas por el usuario.
                return post.categories.some(postCategory =>
                    selectedCategoryIds.value.includes(postCategory.id)
                );
            }
            return false; // Si el post no tiene 'categories' o no es un array, no lo incluimos
        });
    }
    // Si 'all' está seleccionado (o no hay filtros específicos), no filtramos por categoría

    // 2. Filtrar por posts ocultos por el usuario (esta lógica está correcta)
    if (user.value?.hiddenPosts) {
        postsToFilter = postsToFilter.filter(post => 
            !user.value.hiddenPosts.some(hidden => hidden.postId === post.idDoc)
        );
    }

    return postsToFilter;
});

onMounted(() => {
    postsStore.subscribeGlobal();
    if (user.value?.uid) {
        postsStore.subscribeToSavedPosts(user.value.uid);
    }
    document.addEventListener('click', closeFiltersDropdown);
});

onUnmounted(() => {
    postsStore.unsubscribeGlobal();
    postsStore.unsubscribeSavedPosts();
    document.removeEventListener('click', closeFiltersDropdown);
});
</script>

<style scoped>
.font-poppins { font-family: 'Poppins', sans-serif; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.dosis-font { font-family: 'Dosis', sans-serif; } /* Asegúrate de que esta clase esté definida si la usas */
</style>