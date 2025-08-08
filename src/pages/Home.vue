<template>
    <div class="container mx-auto p-4 md:p-8 dark:text-white">
        <header class="mb-8 md:mb-12">
            <h1 class="text-3xl md:text-4xl font-bold dosis-font mb-2">¡Hola, {{ user?.displayName }}!</h1>
            <p class="text-base md:text-lg text-gray-600 dark:text-gray-400">¿Qué te gustaría descubrir hoy en Voir?</p>
            <div class="searchContainer relative mt-6 flex items-center">
                <label for="search-input" class="sr-only">Buscar en Voir</label>
                <input type="text" id="search-input"
                    placeholder="Buscar eventos, grupos, usuarios, lugares..."
                    class="w-full pl-12 pr-28 py-3 bg-white dark:bg-gray-800 border-2 border-transparent rounded-full shadow-sm focus:outline-none focus:border-secondary dark:focus:border-secondary transition-colors"
                    aria-label="Buscar en Voir"
                    v-model="searchQuery"
                >
            
                <!-- Icono de búsqueda (visible cuando el campo está vacío) -->
                <i v-if="!searchQuery" class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true"></i>

                <!-- Botón de borrar (visible cuando hay texto en el campo) -->
                <button v-else @click="clearSearch" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none p-1 rounded-full" aria-label="Limpiar búsqueda">
                    <i class="fas fa-times" aria-hidden="true"></i>
                </button>
                
                <div class="absolute right-3 top-1/2 -translate-y-1/2">
                    <button @click="toggleFiltersDropdown" 
                            class="filtersButton flex items-center px-4 py-2 bg-primary hover:bg-primary-md dark:bg-secondary dark:hover:bg-secondary-md text-white rounded-full text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-secondary/50 transition-colors"
                            aria-haspopup="true" 
                            :aria-expanded="showFilters.toString()">
                        <i class="fas fa-filter mr-2" aria-hidden="true"></i>
                        <span>Filtros</span>
                    </button>
                    
                    <div v-if="showFilters" 
                        class="filtersDropdown absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-xl py-2 z-10"
                        @click.stop>
                        <label v-for="option in filterOptions" :key="option.value" class="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                            <input type="checkbox" 
                                :value="option.value" 
                                v-model="selectedFilters" 
                                class="form-checkbox h-4 w-4 text-secondary rounded focus:ring-primary-accent border-gray-300 dark:border-gray-500 dark:bg-gray-800 dark:checked:bg-secondary">
                            <span class="ml-2 text-gray-800 dark:text-gray-200">{{ option.label }}</span>
                        </label>
                        <div class="px-4 py-2 border-t border-gray-200 dark:border-gray-600">
                            <button @click="applyFilters" class="w-full bg-primary hover:bg-primary-md dark:bg-secondary dark:hover:bg-secondary-md text-white py-1 rounded-md text-sm">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <HomeSearchResults 
            v-if="searchQuery"
            :filteredUsers="displayUsers"
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
import { useUsersStore } from '../stores/users';
import HomeContent from '../components/organisms/HomeContent.vue';
import HomeSearchResults from '../components/organisms/HomeSearchResults.vue';
import AvatarFallback from '../assets/avatar1.jpg';
const { user } = useAuth();

// Stores
const postsStore = usePostsStore();
const reelsStore = useReelsStore();
const eventsStore = useEventsStore();
const groupsStore = useGroupsStore();
const blogsStore = useEducationBlogsStore();
const locationsStore = useLocationsStore();
const usersStore = useUsersStore();

const searchQuery = ref('');

// Estado para el multiselect de filtros
const showFilters = ref(false);
const filterOptions = ref([
    { label: 'Usuarios', value: 'users' },
    { label: 'Grupos', value: 'groups' },
    { label: 'Eventos', value: 'events' },
    { label: 'Blogs Educativos', value: 'blogs' },
    { label: 'Marcadores de Mapa', value: 'locations' },
    { label: 'Recreativo', value: 'entertainment' },
]);
const selectedFilters = ref(['users','groups', 'events', 'blogs', 'locations', 'entertainment']);

function clearSearch() {
    searchQuery.value = '';
}
const toggleFiltersDropdown = () => {
    showFilters.value = !showFilters.value;
};

const applyFilters = () => {
    showFilters.value = false;
};
//v1
// const closeFiltersDropdown = (event) => {
//     // Verifica si el clic fue fuera del botón y del dropdown
//     if (showFilters.value && !event.target.closest('.searchContainer')) {
//         showFilters.value = false;
//     }
// };
const closeFiltersDropdown = (event) => {
    // Verifica si el clic fue fuera del botón y del dropdown
    const filterButton = event.target.closest('.filtersButton');
    const filterDropdown = event.target.closest('.filtersDropdown'); // O una clase más específica si la tenés

    if (showFilters.value && !filterButton && !filterDropdown) {
        showFilters.value = false;
    }
};
// Computed properties para los datos filtrados (basados en searchQuery)
const baseFilteredUsers = computed(() => {
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        return usersStore.users?.filter(user => 
            user.email.toLowerCase().includes(query) || 
            user.displayName?.toLowerCase().includes(query) ||
            user.firstName?.toLowerCase().includes(query) || 
            user.lastName?.toLowerCase().includes(query) 
        ) ?? [];
    }
    return usersStore.users?.value?.slice(0, 10) ?? [];
});

const baseFilteredEvents = computed(() => {
  // Lógica de búsqueda, se mantiene intacta
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    return eventsStore.allEvents?.value?.filter(event => 
      event.title.toLowerCase().includes(query) || 
      event.location?.address?.street?.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query) 
    ) ?? [];
  }
  //Si no filtra, lo ordeno por temporalidad, y tomo los 3 más cercanos
  const now = new Date().getTime();

  const upcomingEvents = eventsStore.allEvents?.value?.filter(event => {
    if (!event.startTime || !event.startTime?.seconds) {
      return false; 
    }
    const eventTime = event.startTime?.seconds * 1000;
    return eventTime > now;
  }) ?? [];

  upcomingEvents.sort((a, b) => {
    const timeA = a.startTime?.seconds * 1000;
    const timeB = b.startTime?.seconds * 1000;
    return timeA - timeB;
  });

  return upcomingEvents.slice(0, 3);
});

const baseFilteredGroups = computed(() => {
    // Si hay una búsqueda activa, se mantiene la lógica de filtrado
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        return groupsStore.allGroups?.value?.filter(group => 
            group.title.toLowerCase().includes(query) || 
            group.description.toLowerCase().includes(query)
        ) ?? [];
    }

    // Ordenar por cantidad de miembros y tomar los 3 con más miembros
    const allGroups = groupsStore.allGroups?.value ?? [];
    
    const sortedGroups = [...allGroups].sort((a, b) => {
        const membersCountA = a.members?.length ?? 0;
        const membersCountB = b.members?.length ?? 0;
        return membersCountB - membersCountA; // Esto ordena de mayor a menor
    });

    return sortedGroups.slice(0, 3);
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
    return postsStore.posts?.value?.filter(post => 
        post.media !== null 
    ) ?? [];
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

// Computed para combinar y formatear posts y reels para la sección de recreativo
const baseFilteredEntertainmentItems = computed(() => {
    const combinedItems = [];

    // Formatear Posts
    baseFilteredPosts.value.forEach(post => {
        combinedItems.push({
            id: post.idDoc, 
            type: 'post',
            title: post.title,
            body: post.body,
            mediaUrl: post.media?.url, 
            mediaType: post.media?.type || 'image', 
            userPhotoURL: post.user?.photoURLFile || AvatarFallback, 
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
            userPhotoURL: reel.user?.photoURL || AvatarFallback, 
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
const displayUsers = computed(() => {
    return selectedFilters.value.includes('users') ? baseFilteredUsers.value : [];
});

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
  usersStore.subscribeUsers();
  document.addEventListener('click', closeFiltersDropdown);
});

onUnmounted(() => {
  eventsStore.unsubscribeAllEvents();
  groupsStore.unsubscribeAllGroups();
  blogsStore.unsubscribeFromBlogs();
  postsStore.unsubscribeGlobal();
  reelsStore.unsubscribeFromReels();
  locationsStore.unsubscribeAll();
  usersStore.unsubscribeUsers();
  document.removeEventListener('click', closeFiltersDropdown);
});
</script>

<style>
/* Utility for line clamping */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>