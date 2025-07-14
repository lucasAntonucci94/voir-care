<template>
    <section class="mt-8 md:mt-12" aria-labelledby="search-results-title">
        <h2 id="search-results-title" class="text-2xl font-bold font-dosis mb-6">Resultados de tu búsqueda para "{{ searchQuery }}"</h2>

        <div v-if="hasResults" class="space-y-8">
            <!-- Sección de Usuarios -->
            <div v-if="filteredUsers.length > 0">
                <h3 class="text-xl font-bold font-dosis mb-4">Usuarios</h3>
                <div class="flex overflow-x-auto space-x-4 pb-4 horizontal-scrollbar">
                    <div v-for="userResult in filteredUsers"
                        :key="userResult.uid"
                        @click="redirectToUser(userResult.email)"
                        class="flex-none w-64 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow transition transition-transform hover:scale-101 cursor-pointer p-4 flex flex-col items-center text-center"
                        role="listitem">
                        <img :src="userResult.photoURLFile || 'https://placehold.co/80x80/CCCCCC/666666?text=U'" 
                            :alt="`Foto de perfil de ${userResult.displayName || userResult.firstName}`" 
                            class="w-20 h-20 object-cover rounded-full mb-3 border-2 border-primary-accent dark:border-secondary-accent">
                        <h4 class="font-bold font-dosis text-lg">{{ userResult.displayName || `${userResult.firstName} ${userResult.lastName}` }}</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{{ userResult.email }}</p>
                        <p v-if="userResult.country" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <i class="fas fa-map-marker-alt fa-fw mr-1" aria-hidden="true"></i>{{ userResult.country }}
                        </p>
                    </div>
                </div>
            </div>
            <!-- Sección de Grupos -->
            <div v-if="filteredGroups.length">
                <h3 class="text-xl font-bold font-dosis mb-4">Grupos</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div
                    v-for="group in filteredGroups"
                    :key="group.idDoc"
                    @click="redirectToGroup(group.idDoc)"
                    class="flex items-center p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow transition-transform hover:scale-101 cursor-pointer"
                    role="listitem"
                    >
                    <!-- Renderizar video o imagen según el tipo de medio -->
                    <div class="flex-shrink-0 w-16 h-16 rounded-lg mr-4 overflow-hidden">
                        <video
                            v-if="group.media?.type === 'video'"
                            :src="group.media.url"
                            class="w-full h-full object-cover"
                            muted
                            playsinline
                            loop
                            autoplay
                            :alt="`Video del grupo ${group.title}`"
                        ></video>
                            <!-- @error="handleMediaError($event, group)" -->
                        <img
                            v-else
                            :src="group.media?.url || 'https://placehold.co/64x64/CCCCCC/666666?text=G'"
                            :alt="`Imagen del grupo ${group.title}`"
                            class="w-full h-full object-cover"
                        />
                    </div>
                    <div class="flex-grow">
                        <h4 class="font-bold font-dosis">{{ group.title }}</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                            {{ group.description || 'Sin descripción.' }}
                        </p>
                        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <i class="fas fa-users fa-fw mr-1" aria-hidden="true"></i>{{ group.members?.length || 0 }} miembros
                        </div>
                    </div>
                    </div>
                </div>
            </div>

            <div v-if="filteredEvents.length">
                <h3 class="text-xl font-bold font-dosis mb-4">Eventos</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div v-for="event in filteredEvents"
                        :key="event.idDoc"
                        @click="redirectToEvent(event.idDoc)"
                        class="flex items-center p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow transition transition-transform hover:scale-101"
                        role="listitem">
                        <div :class="`flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 bg-primary/60 dark:bg-secondary/60 text-white rounded-lg mr-4`">
                            <span class="font-bold text-2xl font-dosis">{{ formatEventDate(event.startTime).day }}</span>
                            <span class="text-xs uppercase font-semibold">{{ formatEventDate(event.startTime).month }}</span>
                        </div>
                        <div>
                            <h4 class="font-bold font-dosis">{{ event.title }}</h4>
                            <p class="text-sm text-gray-600 dark:text-gray-400"><i class="fas fa-map-marker-alt fa-fw mr-1" aria-hidden="true"></i>{{ event.modality === 0 ? formatGoogleMapsAddress(event.location?.address)?.formatedAddress : 'Online' }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="filteredBlogs.length">
                <h3 class="text-xl font-bold font-dosis mb-4">Blogs Educativos</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <RouterLink v-for="blog in filteredBlogs" :key="blog.id" :to="`/blog/${blog.id}`" class="flex items-center bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow transition transition-transform hover:scale-101" role="listitem">
                        <img :src="blog.image" :alt="`Miniatura del blog: ${blog.title}`" class="w-24 h-24 object-cover">
                        <div class="p-3">
                            <h4 class="font-bold font-dosis line-clamp-2">{{ blog.title }}</h4>
                        </div>
                    </RouterLink>
                </div>
            </div>

            <div v-if="filteredLocations.length">
                <h3 class="text-xl font-bold font-dosis mb-4">Marcadores de Mapa</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div v-for="location in filteredLocations"
                        :key="location.idDoc"
                        @click="redirectToLocation(location.idDoc)"
                        class="flex items-center p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow transition transition-transform hover:scale-101 cursor-pointer"
                        role="listitem">
                        <img :src="location.media?.url || 'https://placehold.co/64x64/CCCCCC/666666?text=L'" 
                                :alt="`Imagen de ${location.title}`" 
                                class="flex-shrink-0 w-16 h-16 object-cover rounded-lg mr-4">
                        <div class="flex-grow">
                            <h4 class="font-bold font-dosis">{{ location.title }}</h4>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">{{ location.description || 'Sin descripción.' }}</p>
                            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <i class="fas fa-map-marker-alt fa-fw mr-1" aria-hidden="true"></i>
                                {{ location.address?.street ? formatGoogleMapsAddress(location.address?.street)?.formatedAddress : 'Dirección no disponible' }}
                            </div>
                            <div v-if="location.contact?.phone" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <i class="fas fa-phone fa-fw mr-1" aria-hidden="true"></i>
                                <a :href="`tel:${location.contact.phone}`" @click.stop class="hover:underline">{{ location.contact.phone }}</a>
                            </div>
                            <div v-if="location.contact?.socialNetworkLink" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <i class="fas fa-link fa-fw mr-1" aria-hidden="true"></i>
                                <a :href="location.contact.socialNetworkLink" target="_blank" rel="noopener noreferrer" @click.stop class="hover:underline">Red Social</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="filteredEntertainmentItems.length">
                <h3 class="text-xl font-bold font-dosis mb-4">Contenido Recreativo</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div v-for="item in filteredEntertainmentItems" :key="item.id"  @click="item.type === 'reel' ? '' : router.push(`/post/${item.id}`)"
                        :class="{'bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden relative': item.type === 'reel', 'bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden': item.type === 'post'}"
                        :role="item.type === 'reel' ? 'img' : 'article'" 
                        :aria-label="item.type === 'reel' ? `Reel de ${item.userDisplayName}` : undefined"
                        :aria-labelledby="item.type === 'post' ? `post-title-${item.id}` : undefined">
                        
                        <template v-if="item.mediaType && item.mediaType.startsWith('video')">
                            <video :src="item.mediaUrl" controls class="w-full h-32 object-cover"></video>
                        </template>
                        <template v-else>
                            <img :src="item.mediaUrl" :alt="item.title || 'Contenido'" class="w-full h-32 object-cover">
                        </template>
                        
                        <div v-if="item.type === 'reel'" class="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/60 to-transparent">
                            <div class="flex items-center">
                                <img :src="item.userPhotoURL" :alt="`Avatar de ${item.userDisplayName}`" class="w-8 h-8 rounded-full border-2 border-white object-cover mr-2">
                                <span class="text-white text-xs font-semibold">{{ item.userDisplayName }}</span>
                            </div>
                        </div>
                        <div v-else-if="item.type === 'post'" class="p-4">
                            <h4 :id="`post-title-${item.id}`" class="font-bold font-dosis">{{ item.title }}</h4>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{{ item.body }}</p>
                            <div class="flex items-center mt-3">
                                <img :src="item.userPhotoURL" :alt="`Avatar de ${item.userDisplayName}`" class="w-8 h-8 rounded-full border-2 border-white object-cover mr-2">
                                <span class="text-xs font-semibold">{{ item.userDisplayName }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="text-center text-gray-500 py-10">
            <p>No se encontraron resultados para "{{ searchQuery }}".</p>
            <p class="mt-2">Intenta con otra palabra clave.</p>
        </div>
    </section>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { formatGoogleMapsAddress } from '../../utils/formatGoogleMapsAddress';
import { formatEventDate } from '../../utils/formatEventDate';

const props = defineProps({
    searchQuery: String,
    filteredUsers: Array,
    filteredGroups: Array,
    filteredEvents: Array,
    filteredBlogs: Array,
    filteredLocations: Array,
    filteredEntertainmentItems: Array,
});
const router = useRouter();

const hasResults = computed(() => {
    return props.filteredGroups.length > 0 || 
           props.filteredEvents.length > 0 || 
           props.filteredUsers.length > 0 || 
           props.filteredBlogs.length > 0 || 
           props.filteredLocations.length > 0 || 
           props.filteredEntertainmentItems.length > 0;
});

function redirectToEvent(eventId) {
    router.push({ name: 'eventDetail', params: { idEvent: eventId } });
}

function redirectToGroup(groupId) {
    router.push({ name: 'groupDetail', params: { idGroup: groupId } });
}

function redirectToLocation(groupId) {
    router.push({ name: 'groupDetail', params: { idGroup: groupId } });
}

function redirectToUser(userEmail) {
    router.push({ name: 'profile', params: { email: userEmail } });
}
</script>

<style scoped>
/* Estilo para el scrollbar horizontal */
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
</style>