// stores/posts.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { usePosts } from '../composable/usePosts'; // Ruta correcta

export const usePostsStore = defineStore('posts', {
  state: () => {
    const posts = ref([]); // Definimos el ref fuera del state
    const isLoading = ref(true); // Definimos el ref fuera del state

    return {
      posts, // Retornamos como ref
      isLoading, // Retornamos como ref
    };
  },
  actions: {
    // Suscribirse a los posts en tiempo real
    subscribe() {
      console.log('Iniciando suscripción a posts...');
      const { subscribeToIncomingPosts } = usePosts();
      this.unsubscribe = subscribeToIncomingPosts((updatedPosts) => {
        console.log('Posts recibidos desde Firebase:', updatedPosts);
        this.posts.value = updatedPosts; // Asignamos al .value del ref
        this.isLoading = false;
        console.log('Posts actualizados en el store:', this.posts.value);
      });
    },
    // Cancelar la suscripción
    unsubscribe() {
      if (this.unsubscribe) {
        console.log('Cancelando suscripción a posts...');
        this.unsubscribe();
      }
    },
    // Añadir un nuevo post
    async addPost(newPostData) {
      console.log('Añadiendo nuevo post:', newPostData);
      const { savePost } = usePosts();
      // Preparar los datos para Firebase
      const postData = {
        user: newPostData.user, // Objeto user con id, name, avatar
        title: newPostData.title,
        body: newPostData.description, // Cambiamos description a body para coincidir con tu estructura
        categories: newPostData.categories || [],
        imageBase64: newPostData.media, // El archivo en crudo (File object)
      };
      postData.user.email = 'lucas.e.antonucci@gmail.com'
      try {
        await savePost(postData);
        console.log('Post añadido exitosamente a Firebase');
      } catch (error) {
        console.error('Error al añadir el post:', error);
        throw error; // Para manejar el error en el componente si es necesario
      }
    },
    // Eliminar un post
    async deletePost(postIdDoc) {
      console.log('Eliminando post con idDoc:', postIdDoc);
      const { deletePost } = usePosts();
      await deletePost(postIdDoc);
      console.log('Post eliminado, esperando actualización de Firebase...');
    },
  },
});