<template>
    <!-- Sección de Accesos Rápidos -->
    <section class="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-8 md:mb-12" aria-labelledby="quick-access-title">
        <h2 id="quick-access-title" class="sr-only">Accesos Rápidos</h2>
        
        <ul class="contents">
            <li class="col-span-1">
                <RouterLink to="/explorar" class="flex flex-col items-center justify-center text-center p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full" aria-label="Ir a Mapa Interactivo">
                    <div class="flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/50 rounded-full mb-3">
                        <i class="fas fa-map-marked-alt text-2xl text-secondary" aria-hidden="true"></i>
                    </div>
                    <span class="font-bold font-dosis text-sm md:text-base">Mapa Interactivo</span>
                </RouterLink>
            </li>
            <li class="col-span-1">
                <RouterLink to="/groups" class="flex flex-col items-center justify-center text-center p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full" aria-label="Ir a Grupos">
                    <div class="flex items-center justify-center w-16 h-16 bg-sky-100 dark:bg-sky-900/50 rounded-full mb-3">
                        <i class="fas fa-users text-2xl text-sky-500" aria-hidden="true"></i>
                    </div>
                    <span class="font-bold font-dosis text-sm md:text-base">Grupos</span>
                </RouterLink>
            </li>
            <li class="col-span-1">
                <RouterLink to="/events" class="flex flex-col items-center justify-center text-center p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full" aria-label="Ir a Eventos">
                    <div class="flex items-center justify-center w-16 h-16 bg-teal-100 dark:bg-teal-900/50 rounded-full mb-3">
                        <i class="fas fa-calendar-alt text-2xl text-primary" aria-hidden="true"></i>
                    </div>
                    <span class="font-bold font-dosis text-sm md:text-base">Eventos</span>
                </RouterLink>
            </li>
            <li class="col-span-1">
                <RouterLink to="/education" class="flex flex-col items-center justify-center text-center p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full" aria-label="Ir a Educación">
                    <div class="flex items-center justify-center w-16 h-16 bg-violet-100 dark:bg-violet-900/50 rounded-full mb-3">
                        <i class="fas fa-graduation-cap text-2xl text-violet-500" aria-hidden="true"></i>
                    </div>
                    <span class="font-bold font-dosis text-sm md:text-base">Educación</span>
                </RouterLink>
            </li>
            <li class="col-span-1">
                <RouterLink to="/adoption" class="flex flex-col items-center justify-center text-center p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full" aria-label="Ir a Adopción">
                    <div class="flex items-center justify-center w-16 h-16 bg-rose-100 dark:bg-rose-900/50 rounded-full mb-3">
                        <i class="fas fa-heart text-2xl text-rose-500" aria-hidden="true"></i>
                    </div>
                    <span class="font-bold font-dosis text-sm md:text-base">Adopción</span>
                </RouterLink>
            </li>
        </ul>
    </section>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        <div class="lg:col-span-2 space-y-8">
            <!-- Sección Grupos Destacados -->
            <section aria-labelledby="groups-title">
                <div class="flex justify-between items-center mb-4">
                    <h2 id="groups-title" class="text-2xl font-bold font-dosis">Grupos Destacados</h2>
                    <RouterLink to="/groups" class="text-sm font-semibold text-primary dark:text-secondary hover:underline" aria-label="Ver todos los grupos">Ver todos</RouterLink>
                </div>
                <ul class="space-y-4" role="list">
                    <li
                        v-for="group in filteredGroups"
                        :key="group.idDoc"
                        @click="redirectToGroup(group.idDoc)"
                        class="flex items-center p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow transition-transform hover:scale-101 cursor-pointer"
                    >
                        <!-- Renderizar video o imagen según el tipo de medio -->
                        <div class="flex-shrink-0 w-16 h-16 rounded-lg mr-4 overflow-hidden">
                            <video
                                v-if="group.media?.type?.startsWith('video')"
                                :src="group.media.url"
                                class="w-full h-full object-cover"
                                muted
                                playsinline
                                loop
                                autoplay
                                :title="`Video del grupo ${group.title}`"
                                @error="handleMediaError($event, group)"
                            ></video>
                            <img
                                v-else
                                :src="group.media?.url || AvatarFallback"
                                :alt="`Imagen del grupo ${group.title}`"
                                class="w-full h-full object-cover"
                            />
                        </div>
                        <div class="flex-grow">
                            <h3 class="font-bold font-dosis">{{ group.title }}</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                                {{ group.description || 'Sin descripción.' }}
                            </p>
                            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <i class="fas fa-users fa-fw mr-1" aria-hidden="true"></i>{{ group.members?.length || 0 }} miembros
                            </div>
                        </div>
                    </li>
                </ul>
            </section>
            <!-- Sección Recreativo -->
            <section aria-labelledby="entertainment-title">
                <div class="flex justify-between items-center mb-4">
                    <h2 id="entertainment-title" class="text-2xl font-bold font-dosis">Recreativo</h2>
                    <RouterLink to="/social" class="text-sm font-semibold text-primary dark:text-secondary hover:underline" aria-label="Explorar recreativo">Ver más</RouterLink>
                </div>
                <div class="flex overflow-x-auto space-x-6 pb-4 horizontal-scrollbar" role="region" aria-label="Carrusel de Historias y Publicaciones">
                    <template v-if="filteredEntertainmentItems?.length > 0">
                        <ul class="flex space-x-6"> <!-- Usar ul/li para la lista de items de recreativo -->
                            <li v-for="item in filteredEntertainmentItems" :key="item.id" 
                                @click="item.type === 'post' ? router.push(`/post/${item.id}`) : router.push(`/reel/${item.id}`)"
                                :class="{'flex-none w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden relative': item.type === 'reel', 'flex-none w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden': item.type === 'post'}"
                                :aria-label="item.type === 'reel' ? `Reel de ${item.userDisplayName}` : undefined"
                                :aria-labelledby="item.type === 'post' ? `post-title-${item.id}` : undefined">
                                
                                <template v-if="item.mediaType && item.mediaType.startsWith('video')">
                                    <video :src="item.mediaUrl" autoplay loop muted class="w-full" :class="item.type === 'reel' ? 'h-full object-cover' : 'h-32 object-cover'" :title="item.title || 'Contenido de video'"></video>
                                </template>
                                <template v-else-if="item.mediaUrl && item.mediaType.startsWith('image')">
                                    <img :src="item.mediaUrl" :alt="item.title || 'Contenido'" class="w-full" :class="item.type === 'reel' ? 'h-full object-cover' : 'h-32 object-cover'">
                                </template>
                                
                                <div v-if="item.type === 'reel'" class="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/60 to-transparent">
                                    <div class="flex items-center">
                                        <img :src="item.userPhotoURL" :alt="`Avatar de ${item.userDisplayName}`" class="w-8 h-8 rounded-full border-2 border-white object-cover mr-2">
                                        <span class="text-white text-xs font-semibold">{{ item.userDisplayName }}</span>
                                    </div>
                                </div>
                                <div v-else-if="item.type === 'post'" class="p-4">
                                    <h3 :id="`post-title-${item.id}`" class="font-bold font-dosis">{{ item.title }}</h3>
                                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{{ item.body }}</p>
                                    <div class="flex items-center mt-3">
                                        <img :src="item.userPhotoURL" :alt="`Avatar de ${item.userDisplayName}`" class="w-8 h-8 rounded-full border-2 border-white object-cover mr-2">
                                        <span class="text-xs font-semibold">{{ item.userDisplayName }}</span>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </template>
                    <template v-else>
                        <p class="text-center text-gray-500 w-full">No hay contenido de recreativo disponible.</p>
                    </template>
                </div>
            </section>
        </div>

        <div class="lg:col-span-1 space-y-8">
            <!-- Sección Eventos Próximos -->
            <section aria-labelledby="events-title">
                <div class="flex justify-between items-center mb-4">
                        <h2 id="events-title" class="text-2xl font-bold font-dosis">Eventos Próximos</h2>
                        <RouterLink to="/events" class="text-sm font-semibold text-primary dark:text-secondary hover:underline" aria-label="Ver todos los eventos">Ver todos</RouterLink>
                </div>
                <ul class="space-y-4" role="list">
                    <li v-for="event in filteredEvents"
                        :key="event.idDoc"
                        @click="redirectToEvent(event.idDoc)"
                        class="flex items-center p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow transition transition-transform hover:scale-101 cursor-pointer">
                        <div :class="`flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 bg-primary/60 dark:bg-secondary/60 text-white rounded-lg mr-4`">
                            <span class="font-bold text-2xl font-dosis">{{ formatEventDate(event.startTime).day }}</span>
                            <span class="text-xs uppercase font-semibold">{{ formatEventDate(event.startTime).month }}</span>
                        </div>
                        <div>
                            <h3 class="font-bold font-dosis">{{ event.title }}</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                                <i :class="event.modality === 0 ? 'fa-solid fa-location-dot' : 'fa-solid fa-video'" class="text-primary-md dark:text-secondary-md pr-1" aria-hidden="true"></i>
                                {{ event.modality === 0 ? formatGoogleMapsAddress(event.location?.address)?.formatedAddress : event.meetLink }}
                            </p>
                        </div>
                    </li>
                </ul>
            </section>
            
            <!-- Sección Blogs Educativos -->
            <section aria-labelledby="blogs-title">
                <div class="flex justify-between items-center mb-4">
                        <h2 id="blogs-title" class="text-2xl font-bold font-dosis">Blogs Educativos</h2>
                        <RouterLink to="/education" class="text-sm font-semibold text-primary dark:text-secondary hover:underline" aria-label="Explorar blogs">Explorar</RouterLink>
                </div>
                <ul class="space-y-4" role="list">
                    <li v-for="blog in filteredBlogs" :key="blog.id">
                        <RouterLink :to="`/blog/${blog.id}`" class="flex items-center bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow transition transition-transform hover:scale-101">
                            <img :src="blog.image" :alt="`Miniatura del blog: ${blog.title}`" class="w-24 h-24 object-cover">
                            <div class="p-3">
                                <h3 class="font-bold font-dosis line-clamp-2">{{ blog.title }}</h3>
                            </div>
                        </RouterLink>
                    </li>
                </ul>
            </section>
        </div>
    </div>

    <!-- Sección Promocional de Adopción -->
    <section class="mt-8 md:mt-16 p-6 md:p-8 bg-gradient-to-r from-primary to-primary-lighter dark:from-secondary dark:to-secondary-lighter text-white rounded-2xl flex flex-col md:flex-row items-center justify-between shadow-lg" aria-labelledby="adoption-promo-title">
        <div class="text-center md:text-left mb-4 md:mb-0">
            <h2 id="adoption-promo-title" class="text-2xl md:text-3xl font-bold font-dosis">Transformando Vidas, un Hogar a la Vez</h2>
            <p class="mt-1">Descubrí mascotas que esperan una segunda oportunidad.</p>
        </div>
        <RouterLink to="/adoption" class="px-6 py-3 bg-white text-primary dark:text-secondary font-bold rounded-full shadow-md hover:bg-teal-50 dark:hover:bg-orange-50 transition-colors shrink-0 transition-transform transform hover:scale-101" aria-label="Ver Mascotas en Adopción">
            Ver Mascotas en Adopción
        </RouterLink>
    </section>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router';
import { formatGoogleMapsAddress } from '../../utils/formatGoogleMapsAddress';
import { formatEventDate } from '../../utils/formatEventDate';
import AvatarFallback from '../../assets/fallbackimage.png';

const props = defineProps({
    user: Object,
    filteredEvents: Array,
    filteredGroups: Array,
    filteredBlogs: Array,
    filteredEntertainmentItems: Array,
});

const router = useRouter();

// Función para manejar errores de carga de medios (imagen/video)
const handleMediaError = (event, item) => {
  console.error('Error al cargar medio:', event.target.src);
  // item.media.url = AvatarFallback;
  event.target.src = AvatarFallback; // Esto reemplaza la imagen/video roto con el fallback
};

function redirectToEvent(eventId) {
    router.push({ name: 'eventDetail', params: { idEvent: eventId } });
}

function redirectToGroup(groupId) {
    router.push({ name: 'groupDetail', params: { idGroup: groupId } });
}

</script>

<style scoped>
/* Estilo para el scrollbar del carrusel */
.horizontal-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #02BCAE #e2e8f0;
}
.horizontal-scrollbar::-webkit-scrollbar {
    height: 6px;
}
.horizontal-scrollbar::-webkit-scrollbar-track {
    background: #e2e8f0;
    border-radius: 10px;
}
.horizontal-scrollbar::-webkit-scrollbar-thumb {
    background-color: #02BCAE;
    border-radius: 10px;
}
.dark .horizontal-scrollbar {
    scrollbar-color: #F4A261 #4a5568;
}
.dark .horizontal-scrollbar::-webkit-scrollbar-track {
    background: #4a5568;
}

/* Utility para recortar lineas de texto al exceder cierto lenght */
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>