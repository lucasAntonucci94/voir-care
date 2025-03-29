<template>
  <div class="groups-screen p-4">
    <!-- Barra de Tabs -->
    <div class="tabs flex gap-4 mb-4">
      <button @click="activeTab = 'feed'" :class="{ active: activeTab === 'feed' }">
        Tus Feed
      </button>
      <button @click="activeTab = 'discover'" :class="{ active: activeTab === 'discover' }">
        Descubrir
      </button>
      <button @click="activeTab = 'yourGroups'" :class="{ active: activeTab === 'yourGroups' }">
        Tus Grupos
      </button>
    </div>

    <!-- Contenido de la pestaña "Tus Feed" -->
    <div v-if="activeTab === 'feed'">
      <h2 class="text-xl font-bold mb-2">Tus Feed</h2>
      <div v-if="feedPosts.length">
        <div 
          v-for="post in feedPosts" 
          :key="post.id" 
          class="post-card border p-2 mb-2 rounded"
        >
          <h3 class="font-semibold">{{ getGroupTitle(post.groupId) }}</h3>
          <p>{{ post.content }}</p>
          <small class="text-gray-500">{{ post.createdAt }}</small>
        </div>
      </div>
      <div v-else>
        <p>No hay posteos en tu feed.</p>
      </div>
    </div>

    <!-- Contenido de la pestaña "Descubrir" -->
    <div v-if="activeTab === 'discover'">
      <h2 class="text-xl font-bold mb-2">Descubrir Grupos</h2>
      <div v-if="discoverGroups.length">
        <div 
          v-for="group in discoverGroups" 
          :key="group.id" 
          class="group-card border p-2 mb-2 rounded"
        >
          <h3 class="font-semibold">{{ group.title }}</h3>
          <p>{{ group.description }}</p>
        </div>
      </div>
      <div v-else>
        <p>No hay nuevos grupos para descubrir.</p>
      </div>
    </div>

    <!-- Contenido de la pestaña "Tus Grupos" -->
    <div v-if="activeTab === 'yourGroups'">
      <h2 class="text-xl font-bold mb-2">Tus Grupos</h2>
      <div v-if="userGroups.length">
        <div 
          v-for="group in userGroups" 
          :key="group.id" 
          class="group-card border p-2 mb-2 rounded"
        >
          <h3 class="font-semibold">{{ group.title }}</h3>
          <p>{{ group.description }}</p>
        </div>
      </div>
      <div v-else>
        <p>No perteneces a ningún grupo.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Datos "mock" de grupos
const groups = ref([
  {
    id: '1',
    title: 'Cuidado Animal',
    description: 'Grupo dedicado al cuidado y bienestar animal.',
    imageUrl: 'https://via.placeholder.com/150',
    privacy: 'public',
    ownerId: 'user1'
  },
  {
    id: '2',
    title: 'Adopciones',
    description: 'Encuentra animales para adoptar y comparte experiencias.',
    imageUrl: 'https://via.placeholder.com/150',
    privacy: 'public',
    ownerId: 'user2'
  },
  {
    id: '3',
    title: 'Rescate Animal',
    description: 'Grupo para coordinar rescates y emergencias.',
    imageUrl: 'https://via.placeholder.com/150',
    privacy: 'public',
    ownerId: 'user3'
  }
]);

// Datos "mock" de posteos en grupos
const posts = ref([
  {
    id: 'post1',
    groupId: '1',
    content: 'Primer post en Cuidado Animal',
    createdAt: new Date().toLocaleString(),
    author: 'user1'
  },
  {
    id: 'post2',
    groupId: '2',
    content: 'Post interesante en Adopciones',
    createdAt: new Date().toLocaleString(),
    author: 'user2'
  },
  {
    id: 'post3',
    groupId: '1',
    content: 'Otro post en Cuidado Animal',
    createdAt: new Date().toLocaleString(),
    author: 'user1'
  }
]);

// Simulación de grupos a los que el usuario pertenece (IDs de grupos)
const userMembership = ref(['1', '2']);

// Grupos a los que pertenece el usuario
const userGroups = computed(() => groups.value.filter(group => userMembership.value.includes(group.id)));

// Grupos para descubrir (aquellos a los que el usuario aún no se unió)
const discoverGroups = computed(() => groups.value.filter(group => !userMembership.value.includes(group.id)));

// Posteos para el feed (posteos de grupos en los que el usuario es miembro)
const feedPosts = computed(() => posts.value.filter(post => userMembership.value.includes(post.groupId)));

// Tab activo: "feed", "discover" o "yourGroups"
const activeTab = ref('feed');

// Función auxiliar para obtener el título del grupo según el id del grupo
const getGroupTitle = (groupId) => {
  const group = groups.value.find(g => g.id === groupId);
  return group ? group.title : 'Grupo desconocido';
}
</script>

<style scoped>
.tabs button {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  background: none;
  cursor: pointer;
  transition: background 0.2s;
}

.tabs button:hover {
  background: #f0f0f0;
}

.tabs button.active {
  background: #007BFF;
  color: #fff;
  border-color: #007BFF;
}
</style>
