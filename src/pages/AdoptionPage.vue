<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
    <!-- Header de la sección -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Sección de Adopción 🐾</h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Encuentra recursos, eventos, grupos y posteos relacionados con la adopción de mascotas.
      </p>
    </div>

    <!-- Sección: Eventos -->
    <section class="mb-12">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">Eventos</h2>
        <button
          class="px-4 py-2 bg-primary text-white rounded-full text-sm font-semibold hover:bg-opacity-90 transition"
          @click="viewMoreEvents"
        >
          Ver más
        </button>
      </div>
      <div v-if="events.length === 0" class="text-center text-gray-500 dark:text-gray-400 italic">
        No hay eventos disponibles en este momento.
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <EventCard
          v-for="event in events"
          :key="event.idDoc"
          :event="event"
        />
      </div>
    </section>

    <!-- Sección: Grupos -->
    <section class="mb-12">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">Grupos</h2>
        <button
          class="px-4 py-2 bg-primary text-white rounded-full text-sm font-semibold hover:bg-opacity-90 transition"
          @click="viewMoreGroups"
        >
          Ver más
        </button>
      </div>
      <div v-if="groups.length === 0" class="text-center text-gray-500 dark:text-gray-400 italic">
        No hay grupos disponibles en este momento.
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GroupCard
          v-for="group in groups"
          :key="group.idDoc"
          :group="group"
        />
      </div>
    </section>

    
    <!-- Sección: Blogs -->
    <section class="mb-12">
      <div v-if="blogsStore.isLoading" class="text-center py-8">
        <p class="text-gray-600 dark:text-gray-300">Cargando blogs...</p>
      </div>
      <div v-else-if="blogsStore.error" class="text-center py-8 text-red-600">
        {{ blogsStore.error }}
      </div>
      <div v-else>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">Blogs</h2>
          <button
            v-if="filteredBlogs.length > 5"
            class="px-4 py-2 bg-primary text-white rounded-full text-sm font-semibold hover:bg-opacity-90 transition"
            @click="viewMoreBlogs"
          >
            Ver más
          </button>
        </div>
        <div v-if="filteredBlogs.length === 0" class="text-center text-gray-500 dark:text-gray-400 italic">
          No hay blogs disponibles en este momento.
        </div>
        <div v-else>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <BlogPostCard
              v-for="blog in displayedBlogs"
              :key="blog.id"
              :blog="blog"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useEducationBlogsStore } from '../stores/educationBlogs';
import { useEventsStore } from '../stores/events';
import { useGroupsStore } from '../stores/groups';
import BlogPostCard from '../components/organisms/BlogCard.vue';
import EventCard from '../components/organisms/EventSimpleCard.vue';
import GroupCard from '../components/organisms/GroupSimpleCard.vue';

const router = useRouter();
const blogsStore = useEducationBlogsStore();
const eventsStore = useEventsStore();
const groupsStore = useGroupsStore();

// Filtrado de blogs por categoría "Adopción"
const filteredBlogs = computed(() => {
  return blogsStore.blogs.value.filter(blog => {
    return blog.categories?.some(
      category =>
        category.name === 'Adopción' || category.name === 'Adopcion'
    );
  });
});

// Limitar a los primeros 5 blogs
const displayedBlogs = computed(() => {
  return filteredBlogs.value.slice(0, 4);
});

// Método para redirigir a la pantalla de educación
const viewMoreBlogs = () => {
  router.push('/education');
};

// Método para redirigir a la pantalla de eventos
const viewMoreEvents = () => {
  router.push('/events');
};

// Método para redirigir a la pantalla de grupos
const viewMoreGroups = () => {
  router.push('/groups');
};

// Referencia reactiva para eventos y grupos (conectada al store)
const events = computed(() => eventsStore.adoptionEvents?.value || []);
const groups = computed(() => groupsStore.adoptionGroups?.value || []);

// Suscripción a blogs, eventos y grupos de adopción al montar el componente
onMounted(() => {
  blogsStore.subscribeToBlogs();
  eventsStore.subscribeToAdoptionEvents();
  groupsStore.subscribeToAdoptionGroups();
});

// Cancelar suscripción al desmontar el componente
onUnmounted(() => {
  blogsStore.unsubscribeFromBlogs();
  eventsStore.unsubscribeAdoptionEvents();
  groupsStore.unsubscribeAdoptionGroups();
});
</script>

<style scoped>
/* Ajustes responsivos */
@media (max-width: 640px) {
  .p-6 {
    padding: 1rem; /* Reducir padding en mobile */
  }

  .text-3xl {
    font-size: 1.5rem; /* Reducir tamaño del título en mobile */
  }

  .text-2xl {
    font-size: 1.25rem; /* Reducir tamaño de subtítulos en mobile */
  }

  .h-40 {
    height: 8rem; /* Reducir altura de imágenes en mobile */
  }

  .h-48 {
    height: 10rem; /* Reducir altura de imágenes de posteos en mobile */
  }
}

/* Estilo para truncar texto */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>