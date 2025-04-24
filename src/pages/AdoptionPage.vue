<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <!-- Header de la sección -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Sección de Adopción 🐾</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Encuentra recursos, eventos, grupos y posteos relacionados con la adopción de mascotas.
        </p>
      </div>
  
      <!-- Sección: Blogs -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Blogs sobre Adopción</h2>
        <div v-if="blogs.length === 0" class="text-center text-gray-500 dark:text-gray-400 italic">
          No hay blogs disponibles en este momento.
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="blog in blogs"
            :key="blog.id"
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 hover:shadow-xl transition-shadow duration-300"
          >
            <img
              :src="blog.image"
              :alt="blog.title"
              class="w-full h-40 object-cover rounded-lg mb-4"
            />
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-2">{{ blog.title }}</h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">{{ blog.excerpt }}</p>
            <button
              class="mt-4 text-primary dark:text-secondary hover:underline text-sm"
              @click="viewBlog(blog.id)"
            >
              Leer más
            </button>
          </div>
        </div>
      </section>
  
      <!-- Sección: Eventos -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Eventos de Adopción</h2>
        <div v-if="events.length === 0" class="text-center text-gray-500 dark:text-gray-400 italic">
          No hay eventos disponibles en este momento.
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="event in events"
            :key="event.id"
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 hover:shadow-xl transition-shadow duration-300"
          >
            <img
              :src="event.image"
              :alt="event.title"
              class="w-full h-40 object-cover rounded-lg mb-4"
            />
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-2">{{ event.title }}</h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm">{{ event.date }} - {{ event.location }}</p>
            <button
              class="mt-4 text-primary dark:text-secondary hover:underline text-sm"
              @click="viewEvent(event.id)"
            >
              Ver detalles
            </button>
          </div>
        </div>
      </section>
  
      <!-- Sección: Grupos -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Grupos de Adopción</h2>
        <div v-if="groups.length === 0" class="text-center text-gray-500 dark:text-gray-400 italic">
          No hay grupos disponibles en este momento.
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="group in groups"
            :key="group.id"
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 hover:shadow-xl transition-shadow duration-300"
          >
            <img
              :src="group.image"
              :alt="group.name"
              class="w-full h-40 object-cover rounded-lg mb-4"
            />
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-2">{{ group.name }}</h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{{ group.description }}</p>
            <button
              class="mt-4 text-primary dark:text-secondary hover:underline text-sm"
              @click="viewGroup(group.id)"
            >
              Unirse al grupo
            </button>
          </div>
        </div>
      </section>
  
      <!-- Sección: Posteos -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Posteos Destacados sobre Adopción</h2>
        <div v-if="posts.length === 0" class="text-center text-gray-500 dark:text-gray-400 italic">
          No hay posteos disponibles en este momento.
        </div>
        <div v-else class="space-y-6">
          <div
            v-for="post in posts"
            :key="post.id"
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 hover:shadow-xl transition-shadow duration-300"
          >
            <div class="flex items-start gap-4">
              <img
                :src="post.userAvatar"
                :alt="post.userName"
                class="w-12 h-12 rounded-full object-cover"
              />
              <div class="flex-1">
                <div class="flex justify-between items-center mb-2">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-200">{{ post.userName }}</h3>
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{ post.date }}</span>
                </div>
                <p class="text-gray-600 dark:text-gray-300 text-sm">{{ post.content }}</p>
                <div v-if="post.image" class="mt-4">
                  <img
                    :src="post.image"
                    :alt="post.content"
                    class="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <button
                  class="mt-4 text-primary dark:text-secondary hover:underline text-sm"
                  @click="viewPost(post.id)"
                >
                  Ver más
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  // Datos simulados (mock data) - En un caso real, estos datos vendrían de un store o API
  const blogs = ref([
    {
      id: 1,
      title: 'Consejos para Adoptar a tu Primera Mascota',
      excerpt: 'Descubre cómo prepararte para la llegada de tu nuevo amigo peludo y qué esperar durante el proceso de adopción.',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=500&auto=format&fit=crop',
      tags: ['adopcion']
    },
    {
      id: 2,
      title: 'Historias de Adopción que Inspiran',
      excerpt: 'Conoce las historias de familias que encontraron a sus compañeros perfectos a través de la adopción.',
      image: 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?q=80&w=500&auto=format&fit=crop',
      tags: ['adopcion']
    },
    {
      id: 3,
      title: 'Cómo Ayudar a un Perro Adoptado a Adaptarse',
      excerpt: 'Consejos prácticos para hacer que tu perro adoptado se sienta seguro y amado en su nuevo hogar.',
      image: 'https://images.unsplash.com/photo-1586671267731-da2cf3ce0218?q=80&w=500&auto=format&fit=crop',
      tags: ['adopcion']
    }
  ]);
  
  const events = ref([
    {
      id: 1,
      title: 'Feria de Adopción 2025',
      date: '15 de mayo, 2025',
      location: 'Parque Central',
      image: 'https://images.unsplash.com/photo-1587405513210-3e8c8d9e8a5f?q=80&w=500&auto=format&fit=crop',
      tags: ['adopcion']
    },
    {
      id: 2,
      title: 'Día de Adopción en Refugio Amigo',
      date: '20 de mayo, 2025',
      location: 'Refugio Amigo',
      image: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=500&auto=format&fit=crop',
      tags: ['adopcion']
    }
  ]);
  
  const groups = ref([
    {
      id: 1,
      name: 'Amantes de la Adopción',
      description: 'Un grupo para compartir experiencias y consejos sobre la adopción de mascotas.',
      image: 'https://images.unsplash.com/photo-1601758177266-6d3347d58a94?q=80&w=500&auto=format&fit=crop',
      tags: ['adopcion']
    },
    {
      id: 2,
      name: 'Adopta un Amigo',
      description: 'Únete para colaborar con refugios y ayudar a más animales a encontrar un hogar.',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=500&auto=format&fit=crop',
      tags: ['adopcion']
    }
  ]);
  
  const posts = ref([
    {
      id: 1,
      userName: 'camila.rr',
      userAvatar: 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?q=80&w=100&auto=format&fit=crop',
      date: '16/04/25',
      content: 'Acabo de adoptar a este pequeño, ¡es un amor! 🐶 ¿Alguien tiene consejos para su primer día en casa?',
      image: 'https://images.unsplash.com/photo-1601758177266-6d3347d58a94?q=80&w=500&auto=format&fit=crop',
      tags: ['adopcion']
    },
    {
      id: 2,
      userName: 'chela.chela',
      userAvatar: 'https://images.unsplash.com/photo-1586671267731-da2cf3ce0218?q=80&w=100&auto=format&fit=crop',
      date: '15/04/25',
      content: 'Este sábado hay una feria de adopción en el parque, ¡no se la pierdan! 🐾',
      tags: ['adopcion']
    }
  ]);
  
  // Métodos para acciones (simuladas)
  const viewBlog = (blogId) => {
    console.log('Ver blog:', blogId);
    // Aquí iría la lógica para navegar al blog
  };
  
  const viewEvent = (eventId) => {
    console.log('Ver evento:', eventId);
    // Aquí iría la lógica para navegar al evento
  };
  
  const viewGroup = (groupId) => {
    console.log('Ver grupo:', groupId);
    // Aquí iría la lógica para navegar al grupo
  };
  
  const viewPost = (postId) => {
    console.log('Ver post:', postId);
    // Aquí iría la lógica para navegar al post
  };
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