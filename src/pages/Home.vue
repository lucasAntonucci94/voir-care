<template>
    <div class="container mx-auto p-4 md:p-8">
        <header class="mb-8 md:mb-12">
            <h1 class="text-3xl md:text-4xl font-bold font-dosis mb-2">¡Hola, {{ user?.displayName }}!</h1>
            <p class="text-base md:text-lg text-gray-600 dark:text-gray-400">¿Qué te gustaría descubrir hoy en Voir?</p>
            <div class="relative mt-6 flex items-center">
                <input type="text" 
                       placeholder="Buscar lugares, eventos, grupos..." 
                       class="w-full pl-12 pr-28 py-3 bg-white dark:bg-gray-800 border-2 border-transparent rounded-full shadow-sm focus:outline-none focus:border-primary-accent dark:focus:border-primary-accent transition-colors" 
                       aria-label="Buscar en Voir"
                       v-model="searchQuery">
                <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true"></i>
                
                <div class="absolute right-3 top-1/2 -translate-y-1/2">
                    <button @click="toggleFiltersDropdown" 
                            class="flex items-center px-4 py-2 bg-primary hover:bg-primary-md dark:bg-secondary dark:hover:bg-secondary-md text-white rounded-full text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-secondary/50 transition-colors"
                            aria-haspopup="true" 
                            :aria-expanded="showFilters.toString()">
                        <i class="fas fa-filter mr-2" aria-hidden="true"></i>
                        <span>Filtros</span>
                    </button>
                    
                    <div v-if="showFilters" 
                         class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-xl py-2 z-10"
                         @click.stop>
                        <label v-for="option in filterOptions" :key="option.value" class="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                            <input type="checkbox" 
                                   :value="option.value" 
                                   v-model="selectedFilters" 
                                   class="form-checkbox h-4 w-4 text-primary-accent rounded focus:ring-primary-accent border-gray-300 dark:border-gray-500 dark:bg-gray-800 dark:checked:bg-primary-accent">
                            <span class="ml-2 text-gray-800 dark:text-gray-200">{{ option.label }}</span>
                        </label>
                        <div class="px-4 py-2 border-t border-gray-200 dark:border-gray-600">
                            <button @click="applyFilters" class="w-full bg-primary hover:bg-primary-md dark:bg-secondary dark:hover:bg-secondary-md text-white py-1 rounded-md text-sm">Aplicar</button>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <HomeSearchResults 
            v-if="searchQuery"
            :filteredGroups="displayGroups"
            :filteredEvents="displayEvents"
            :filteredBlogs="displayBlogs"
            :filteredLocations="displayLocations"
            :filteredEntertainmentItems="displayEntertainmentItems"
            :searchQuery="searchQuery"
            :activeFilters="selectedFilters" />

        <HomeContent 
            v-else
            :user="user"
            :filteredEvents="baseFilteredEvents"
            :filteredGroups="baseFilteredGroups"
            :filteredBlogs="baseFilteredBlogs"
            :filteredEntertainmentItems="baseFilteredEntertainmentItems"
        />
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useAuth } from '../api/auth/useAuth';
import { usePostsStore } from '../stores/posts';
import { useReelsStore } from '../stores/reels';
import { useEventsStore } from '../stores/events';
import { useGroupsStore } from '../stores/groups';
import { useLocationsStore } from '../stores/locations';
import { useEducationBlogsStore } from '../stores/educationBlogs';
import HomeContent from '../components/organisms/HomeContent.vue';
import HomeSearchResults from '../components/organisms/HomeSearchResults.vue';

const { user } = useAuth();

// Stores
const postsStore = usePostsStore();
const reelsStore = useReelsStore();
const eventsStore = useEventsStore();
const groupsStore = useGroupsStore();
const blogsStore = useEducationBlogsStore();
const locationsStore = useLocationsStore();

const searchQuery = ref('');

// Estado para el multiselect de filtros
const showFilters = ref(false);
const filterOptions = ref([
    { label: 'Grupos', value: 'groups' },
    { label: 'Eventos', value: 'events' },
    { label: 'Blogs Educativos', value: 'blogs' },
    { label: 'Marcadores de Mapa', value: 'locations' },
    { label: 'Entretenimiento', value: 'entertainment' },
]);
const selectedFilters = ref(['groups', 'events', 'blogs', 'locations', 'entertainment']);

const toggleFiltersDropdown = () => {
    showFilters.value = !showFilters.value;
};

const applyFilters = () => {
    showFilters.value = false;
};

// Computed properties para los datos filtrados (basados en searchQuery)
const baseFilteredEvents = computed(() => {
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        return eventsStore.allEvents?.value?.filter(event => 
            event.title.toLowerCase().includes(query) || 
            event.location?.address?.street?.toLowerCase().includes(query) ||
            event.description?.toLowerCase().includes(query) 
        ) ?? [];
    }
    return eventsStore.allEvents?.value?.slice(0, 3) ?? [];
});

const baseFilteredGroups = computed(() => {
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        return groupsStore.allGroups?.value?.filter(group => 
            group.title.toLowerCase().includes(query) || 
            group.description.toLowerCase().includes(query)
        ) ?? [];
    }
    return groupsStore.allGroups?.value?.slice(0, 3) ?? [];
});

const baseFilteredLocations = computed(() => {
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        return locationsStore.locations?.value?.filter(location =>
            location.title.toLowerCase().includes(query) || 
            location.description.toLowerCase().includes(query) ||
            location.address?.street?.toLowerCase().includes(query) ||
            location.type.toLowerCase().includes(query)
        ) ?? [];
    }
    return locationsStore.locations?.value?.slice(0, 3) ?? [];
});

const baseFilteredBlogs = computed(() => {
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        return blogsStore.blogs?.value?.filter(blog => 
            blog.title.toLowerCase().includes(query) || 
            blog.summary.toLowerCase().includes(query) ||
            blog.intro.toLowerCase().includes(query)
        ) ?? [];
    }
    return blogsStore.blogs?.value?.slice(0, 3) ?? [];
});

const baseFilteredPosts = computed(() => {
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        return postsStore.posts?.value?.filter(post => 
            post.title?.toLowerCase().includes(query) || 
            post.body?.toLowerCase().includes(query) ||
            post.user?.displayName?.toLowerCase().includes(query)
        ) ?? [];
    }
    return postsStore.posts?.value ?? [];
});

const baseFilteredReels = computed(() => {
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        return reelsStore.reels?.filter(reel => 
            reel.title?.toLowerCase().includes(query) || 
            reel.description?.toLowerCase().includes(query) ||
            reel.user?.displayName?.toLowerCase().includes(query)
        ) ?? [];
    }
    return reelsStore.reels ?? [];
});

// Computed para combinar y formatear posts y reels para la sección de entretenimiento
const baseFilteredEntertainmentItems = computed(() => {
    const combinedItems = [];

    // Formatear Posts
    baseFilteredPosts.value.forEach(post => {
        combinedItems.push({
            id: post.idDoc, 
            type: 'post',
            title: post.title,
            body: post.body,
            mediaUrl: post.media?.url || 'https://placehold.co/400x250/cccccc/333333?text=No+Image', 
            mediaType: post.media?.type || 'image', 
            userPhotoURL: post.user?.photoURLFile || 'https://placehold.co/40x40/CCCCCC/666666?text=U', 
            userDisplayName: post.user?.displayName || 'Usuario Anónimo',
            createdAt: post.created_at 
        });
    });

    // Formatear Reels
    baseFilteredReels.value.forEach(reel => { // Usamos baseFilteredReels
        combinedItems.push({
            id: reel.idDoc, 
            type: 'reel',
            title: reel.title,
            mediaUrl: reel.mediaUrl || reel.thumbnailUrl, 
            mediaType: reel.mediaType || 'image', 
            userPhotoURL: reel.user?.photoURL || 'https://placehold.co/40x40/CCCCCC/666666?text=U', 
            userDisplayName: reel.user?.displayName || 'Usuario Anónimo',
            createdAt: reel.createdAt 
        });
    });

    // Si no hay búsqueda activa (HomeContent), ordenar y limitar
    if (!searchQuery.value) {
        return combinedItems
            .sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : a.createdAt;
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : b.createdAt;
                return dateB - dateA;
            })
            .slice(0, 6); 
    }
    // Si hay búsqueda activa, ya vienen filtrados por el término, no limitar más.
    return combinedItems;
});


// Computed properties que se pasan a HomeSearchResults, aplicando los filtros de categoría
const displayGroups = computed(() => {
    return selectedFilters.value.includes('groups') ? baseFilteredGroups.value : [];
});

const displayEvents = computed(() => {
    return selectedFilters.value.includes('events') ? baseFilteredEvents.value : [];
});

const displayBlogs = computed(() => {
    return selectedFilters.value.includes('blogs') ? baseFilteredBlogs.value : [];
});

const displayLocations = computed(() => {
    return selectedFilters.value.includes('locations') ? baseFilteredLocations.value : [];
});

const displayEntertainmentItems = computed(() => {
    return selectedFilters.value.includes('entertainment') ? baseFilteredEntertainmentItems.value : [];
});


// Suscripciones
onMounted(() => {
    eventsStore.subscribeAllEvents();
    groupsStore.subscribeAllGroups();
    blogsStore.subscribeToBlogs();
    postsStore.subscribeGlobal();
    reelsStore.subscribeToReels();
    locationsStore.subscribeTolocations();
});

onUnmounted(() => {
    eventsStore.unsubscribeAllEvents();
    groupsStore.unsubscribeAllGroups();
    blogsStore.unsubscribeFromBlogs();
    postsStore.unsubscribeGlobal();
    reelsStore.unsubscribeFromReels();
    locationsStore.unsubscribeAll();
});
</script>

<style>
/* Estilos globales para el body y fuentes */
body {
    background-color: #F8F7F4;
    font-family: 'Josefin Sans', sans-serif;
    color: #264653;
}
.dark body {
    background-color: #1a202c; /* Un gris oscuro para el modo oscuro */
    color: #E2E8F0;
}
.font-dosis {
    font-family: 'Dosis', sans-serif;
}
/* Colores personalizados de la paleta "Warm Paws" */
.bg-primary-accent { background-color: #F4A261; }
.bg-secondary-accent { background-color: #2A9D8F; }
.text-primary-accent { color: #F4A261; }
.text-secondary-accent { color: #2A9D8F; }
.border-primary-accent { border-color: #F4A261; }

.hover\:bg-primary-accent-dark:hover { background-color: #E76F51; }
.hover\:bg-secondary-accent-dark:hover { background-color: #264653; }

/* Estilo para el scrollbar del carrusel */
.horizontal-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #F4A261 #e2e8f0;
}
.horizontal-scrollbar::-webkit-scrollbar {
    height: 6px;
}
.horizontal-scrollbar::-webkit-scrollbar-track {
    background: #e2e8f0;
    border-radius: 10px;
}
.horizontal-scrollbar::-webkit-scrollbar-thumb {
    background-color: #F4A261;
    border-radius: 10px;
}
.dark .horizontal-scrollbar {
    scrollbar-color: #F4A261 #4a5568;
}
.dark .horizontal-scrollbar::-webkit-scrollbar-track {
    background: #4a5568;
}
/* Utility for line clamping */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
/* Clase para ocultar visualmente elementos pero mantenerlos accesibles para lectores de pantalla */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>