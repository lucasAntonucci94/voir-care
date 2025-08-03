<template>
    <div class="flex-grow py-2 min-h-screen dosis-font overflow-y-auto">
        <CarrouselReels />
        <div class="flex items-center mx-auto min-w-xs xs:w-sm max-w-lg sm:w-lg px-4 md:px-1 gap-4 mb-6">
            <CreatePostModal />
            <!-- Contenedor del dropdown de filtros -->
            <div class="relative" ref="filtersDropdownRef">
                <button @click="toggleFiltersDropdown"
                        class="flex items-center px-4 py-2 bg-primary hover:bg-primary-md dark:bg-secondary dark:hover:bg-secondary-md text-white rounded-full text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-secondary/50 transition-colors"
                        aria-haspopup="true"
                        :aria-expanded="showFilters.toString()">
                    <i class="fas fa-filter" aria-hidden="true"></i>
                    <span class="hidden sm:inline-block ml-2">Filtros</span>
                </button>

                <div v-if="showFilters" class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-xl py-2 z-100">
                    <!-- Checkbox "Todas las Categorías" -->
                    <label class="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                        <input
                            type="checkbox"
                            :checked="isAllSelected"
                            @change="handleSelectAll"
                            class="form-checkbox h-4 w-4 text-primary-accent rounded focus:ring-primary-accent border-gray-300 dark:border-gray-500 dark:bg-gray-800 dark:checked:bg-primary-accent">
                        <span class="ml-2 text-gray-800 dark:text-gray-200">Todas las Categorías</span>
                    </label>

                    <div class="max-h-60 md:max-h-80 overflow-y-auto bg-gray-100 dark:bg-gray-800">
                        <!-- Checkboxes para categorías individuales -->
                        <label v-for="category in categories" :key="category.id" class="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                            <input
                                type="checkbox"
                                :value="category.id"
                                v-model="selectedCategoryIds"
                                class="form-checkbox h-4 w-4 text-primary-accent rounded focus:ring-primary-accent border-gray-300 dark:border-gray-500 dark:bg-gray-800 dark:checked:bg-primary-accent">
                            <span class="ml-2 text-gray-800 dark:text-gray-200">{{ category.name }}</span>
                        </label>
                    </div>
                    <div class="px-4 py-2 border-t border-gray-200 dark:border-gray-600">
                        <button @click="applyFilters" class="w-full bg-primary hover:bg-primary-md dark:bg-secondary dark:hover:bg-secondary-md text-white py-1 rounded-md text-sm">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>

        <section class="space-y-6 flex flex-col items-center mt-6 px-4">
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
</template>

<script setup>
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

// Estado para el multiselect 
const showFilters = ref(false);
const selectedCategoryIds = ref([]);
const filtersDropdownRef = ref(null);

// Observador para inicializar selectedCategoryIds cuando las categorías estén disponibles
watch(categories, (newCategories) => {
    if (newCategories && newCategories.length > 0) {
        selectedCategoryIds.value = newCategories.map(cat => cat.id);
    } else {
        selectedCategoryIds.value = [];
    }
}, { immediate: true });

// Determina si todas las categorías individuales están seleccionadas.
const isAllSelected = computed(() => {
    return selectedCategoryIds.value.length === categories.value.length;
});

// Maneja el clic en el checkbox "Todas las Categorías".
const handleSelectAll = (event) => {
    if (event.target.checked) {
        selectedCategoryIds.value = categories.value.map(cat => cat.id);
    } else {
        selectedCategoryIds.value = [];
    }
};

const toggleFiltersDropdown = () => {
    showFilters.value = !showFilters.value;
};

const applyFilters = () => {
    showFilters.value = false;
};

// Función para cerrar el dropdown al hacer clic fuera
const closeFiltersDropdown = (event) => {
    if (showFilters.value && filtersDropdownRef.value && !filtersDropdownRef.value.contains(event.target)) {
        showFilters.value = false;
    }
};

const filteredAndVisiblePosts = computed(() => {
    let postsToFilter = postsStore.posts.value || [];

    // Lógica de filtrado por categoría
    if (!isAllSelected.value) {
        postsToFilter = postsToFilter.filter(post => {
            if (post.categories && Array.isArray(post.categories)) {
                return post.categories.some(postCategory =>
                    selectedCategoryIds.value.includes(postCategory.id)
                );
            }
            return false;
        });
    }

    // Filtrar por posts ocultos por el usuario
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
    // Añadimos el listener al documento
    document.addEventListener('click', closeFiltersDropdown);
});

onUnmounted(() => {
    postsStore.unsubscribeGlobal();
    postsStore.unsubscribeSavedPosts();
    // Eliminamos el listener al desmontar el componente
    document.removeEventListener('click', closeFiltersDropdown);
});
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
