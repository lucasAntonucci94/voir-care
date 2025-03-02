<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuth } from '../api/auth/auth';

const { user } = useAuth();

// Estado del modal y nueva publicación
const showModal = ref(false);
const newPost = ref({
  title: '',
  description: '',
  media: null as File | null,
  mediaType: '' as 'image' | 'video' | '',
  categories: [] as string[],
});
// Estado inicial de posts con showMenu
const posts = ref([
  {
    id: 1,
    user: { id: '1', name: 'Juan Pérez', avatar: 'https://via.placeholder.com/40' },
    title: 'Evento de Adopción',
    description: 'Este sábado en el parque.',
    media: 'https://via.placeholder.com/300',
    mediaType: 'image',
    categories: ['Eventos'],
    timestamp: new Date(),
    likes: [{ userId: '2' }],
    comments: [{ id: 1, user: 'Ana Gómez', text: '¡Qué buena iniciativa!', timestamp: new Date() }],
    showComments: false,
    showMenu: false, // Nuevo estado para el menú
  },
]);
const highlights = ref([
  { id: 1, title: 'Reel: Adopción', thumbnail: 'https://via.placeholder.com/150' },
]);
const categoriesList = ['General', 'Eventos', 'Educación', 'Adopciones'];

// Manejo de multimedia
const handleMediaUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const file = target.files[0];
    newPost.value.media = file;
    newPost.value.mediaType = file.type.startsWith('image') ? 'image' : 'video';
  }
};

// Crear publicación
const createPost = () => {
  if (!newPost.value.title || !newPost.value.description) return;
  posts.value.unshift({
    id: posts.value.length + 1,
    user: { id: user.value.id, name: user.value.displayName, avatar: user.value.photoURL },
    title: newPost.value.title,
    description: newPost.value.description,
    media: newPost.value.media ? URL.createObjectURL(newPost.value.media) : null,
    mediaType: newPost.value.mediaType,
    categories: newPost.value.categories,
    timestamp: new Date(),
    likes: [],
    comments: [],
  });
  newPost.value = { title: '', description: '', media: null, mediaType: '', categories: [] };
  showModal.value = false;
};

// Gestión de Likes
const toggleLike = (postId: number) => {
  const post = posts.value.find(p => p.id === postId);
  if (!post || !user.value) return;
  const userLiked = post.likes.some(like => like.userId === user.value.id);
  if (userLiked) {
    post.likes = post.likes.filter(like => like.userId !== user.value.id);
  } else {
    post.likes.push({ userId: user.value.id });
  }
};

// Gestión de Comentarios
const newComment = ref('');
const addComment = (postId: number) => {
  if (!newComment.value || !user.value) return;
  const post = posts.value.find(p => p.id === postId);
  if (post) {
    post.comments.push({
      id: post.comments.length + 1,
      user: user.value.displayName,
      text: newComment.value,
      timestamp: new Date(),
    });
    newComment.value = '';
  }
};

// Funciones para las acciones del menú
const editPost = (post) => {
  console.log('Editar post:', post.id);
  // Aquí podrías abrir un modal con el formulario de edición
  post.showMenu = false;
};

const deletePost = (postId: number) => {
  posts.value = posts.value.filter(p => p.id !== postId);
  console.log('Post eliminado:', postId);
};

const sharePost = (post) => {
  console.log('Compartir post:', post.id);
  // Aquí podrías implementar lógica para copiar URL o compartir en redes
  post.showMenu = false;
};

const reportPost = (post) => {
  console.log('Reportar post:', post.id);
  // Aquí podrías abrir un modal para reportar o enviar al backend
  post.showMenu = false;
};
</script>

<template>
  <!-- Main Content -->
  <main class="pt-10 pb-10 bg-gray-50 min-h-screen font-poppins">
    <div class="container mx-auto px-4">
      <!-- Botón/Input para Crear Publicación -->
      <section class="flex justify-center mb-6">
        <input
          type="text"
          placeholder="¿Qué tienes en mente?"
          @click="showModal = true"
          class="w-full max-w-md p-3 rounded-full bg-white border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#02bcae] cursor-pointer"
          readonly
        />
      </section>

      <!-- Modal de Creación -->
      <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-30">
        <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-lg">
          <h2 class="text-xl font-bold text-[#2c3e50] mb-4">Nueva Publicación</h2>
          <form @submit.prevent="createPost" class="space-y-4">
            <input
              v-model="newPost.title"
              type="text"
              placeholder="Título"
              class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02bcae]"
            />
            <textarea
              v-model="newPost.description"
              placeholder="Descripción"
              class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02bcae] resize-y"
              rows="3"
            ></textarea>
            <input
              type="file"
              accept="image/*,video/*"
              @change="handleMediaUpload"
              class="w-full p-2 border rounded-lg text-sm text-gray-600"
            />
            <div v-if="newPost.media" class="mt-2">
              <img v-if="newPost.mediaType === 'image'" :src="URL.createObjectURL(newPost.media)" alt="Preview" class="w-full h-32 object-cover rounded-lg" />
              <video v-else-if="newPost.mediaType === 'video'" :src="URL.createObjectURL(newPost.media)" controls class="w-full h-32 rounded-lg"></video>
            </div>
            <div class="flex flex-wrap gap-2">
              <label v-for="category in categoriesList" :key="category" class="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  v-model="newPost.categories"
                  :value="category"
                  class="h-4 w-4 text-[#02bcae] focus:ring-[#02bcae]"
                />
                {{ category }}
              </label>
            </div>
            <div class="flex justify-end gap-2">
              <button type="button" @click="showModal = false" class="px-4 py-2 text-gray-600 hover:text-[#2c3e50]">
                Cancelar
              </button>
              <button type="submit" class="px-4 py-2 bg-[#02bcae] text-white rounded-lg hover:bg-teal-600 transition-colors">
                Publicar
              </button>
            </div>
          </form>
        </div>
      </div>
<!-- Feed de Publicaciones -->
<section class="space-y-6 flex flex-col items-center">
  <div v-for="post in posts" :key="post.id" class="bg-white p-4 rounded-lg shadow-md w-full max-w-lg border border-gray-100 relative">
    <!-- Encabezado del Post -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-3">
        <img :src="post.user.avatar" alt="Avatar" class="w-10 h-10 rounded-full" />
        <div>
          <p class="text-sm font-bold text-[#2c3e50]">{{ post.user.name }}</p>
          <p class="text-xs text-gray-500">{{ post.timestamp.toLocaleDateString() }}</p>
        </div>
      </div>
      <!-- Botón de Tres Puntitos -->
      <div class="relative">
        <button
          @click="post.showMenu = !post.showMenu"
          class="text-gray-600 hover:text-[#02bcae] focus:outline-none"
        >
          <i class="fas fa-ellipsis-h"></i>
        </button>
        <!-- Menú Desplegable -->
        <div
          v-if="post.showMenu"
          class="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
        >
          <ul class="py-1 text-sm text-gray-700">
            <li v-if="post.user.id === user?.id || user?.isAdmin">
              <button
                @click="editPost(post)"
                class="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                <i class="fas fa-pen mr-2"></i> Editar
              </button>
            </li>
            <li v-if="post.user.id === user?.id || user?.isAdmin">
              <button
                @click="deletePost(post.id)"
                class="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
              >
                <i class="fas fa-trash mr-2"></i> Eliminar
              </button>
            </li>
            <li>
              <button
                @click="sharePost(post)"
                class="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                <i class="fas fa-share mr-2"></i> Compartir
              </button>
            </li>
            <li v-if="post.user.id !== user?.id">
              <button
                @click="reportPost(post)"
                class="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                <i class="fas fa-flag mr-2"></i> Reportar
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <!-- Contenido del Post -->
    <h3 class="text-lg font-bold text-[#2c3e50]">{{ post.title }}</h3>
    <p class="text-gray-700 mt-1 text-sm">{{ post.description }}</p>
    <div v-if="post.media" class="mt-3">
      <img v-if="post.mediaType === 'image'" :src="post.media" alt="Post media" class="w-full h-48 object-cover rounded-lg" />
      <video v-else-if="post.mediaType === 'video'" :src="post.media" controls class="w-full h-48 rounded-lg"></video>
    </div>
    <div class="flex gap-2 mt-2 flex-wrap">
      <span v-for="category in post.categories" :key="category" class="text-xs text-[#02bcae] bg-teal-100 px-2 py-1 rounded-full">
        {{ category }}
      </span>
    </div>
    <div class="flex justify-between mt-3 text-sm text-gray-600">
      <button
        @click="toggleLike(post.id)"
        :class="{ 'text-[#02bcae]': post.likes.some(l => l.userId === user?.id) }"
        class="hover:text-[#02bcae] transition-colors flex items-center gap-1"
      >
        <i class="fas fa-heart"></i> {{ post.likes.length }} Me gusta
      </button>
      <button @click="post.showComments = !post.showComments" class="hover:text-[#02bcae] transition-colors">
        {{ post.comments.length }} Comentarios
      </button>
    </div>
    <!-- Sección de Comentarios -->
    <div v-if="post.showComments" class="mt-4 border-t pt-4">
      <div v-for="comment in post.comments" :key="comment.id" class="text-sm text-gray-700 mb-2">
        <p><strong>{{ comment.user }}</strong> - {{ comment.text }}</p>
        <p class="text-xs text-gray-500">{{ comment.timestamp.toLocaleTimeString() }}</p>
      </div>
      <form @submit.prevent="addComment(post.id)" class="flex gap-2 mt-2">
        <input
          v-model="newComment"
          type="text"
          placeholder="Escribe un comentario..."
          class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02bcae]"
        />
        <button type="submit" class="px-3 py-2 bg-[#02bcae] text-white rounded-lg hover:bg-teal-600">
          <i class="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  </div>
  <p v-if="!posts.length" class="text-center text-gray-500">No hay publicaciones aún.</p>
</section>

      <!-- Destacados/Reels -->
      <section class="mt-10">
        <h2 class="text-xl font-bold text-[#2c3e50] mb-4 text-center">Destacados</h2>
        <div class="flex overflow-x-auto space-x-4 scrollbar-hide snap-x snap-mandatory px-4">
          <div v-for="highlight in highlights" :key="highlight.id" class="min-w-[160px] bg-white p-3 rounded-lg shadow-md snap-center border border-gray-100">
            <img :src="highlight.thumbnail" alt="Thumbnail" class="w-full h-24 object-cover rounded-lg" />
            <p class="mt-2 text-sm text-gray-700 font-bold text-center">{{ highlight.title }}</p>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.font-poppins {
  font-family: 'Poppins', sans-serif;
}
</style>