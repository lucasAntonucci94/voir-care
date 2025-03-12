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
    async addPost(newPostData) {
      console.log('Añadiendo nuevo post:', newPostData);
      const { savePost } = usePosts();
      const postData = {
        user: newPostData.user,
        title: newPostData.title,
        body: newPostData.body, // Normalizado
        categories: newPostData.categories || [],
        imageBase64: newPostData.imageBase64, // Base64
        mediaType: newPostData.mediaType,
      };
      try {
        await savePost(postData);
        console.log('Post añadido exitosamente a Firebase');
      } catch (error) {
        console.error('Error al añadir el post:', error);
        throw error;
      }
    },
    async updatePost(postId, updatedPostData) {
      console.log('Actualizando post:', postId, updatedPostData);
      const { updatePost } = usePosts();
      const postData = {
        user: updatedPostData.user,
        title: updatedPostData.title,
        body: updatedPostData.body,
        categories: updatedPostData.categories || [],
        imageUrlFile: updatedPostData.imageUrlFile,
        imagePathFile: updatedPostData.imagePathFile,
        mediaType: updatedPostData.mediaType,
      };
      try {
        await updatePost(postId, postData);
        console.log('Post actualizado exitosamente en Firebase');
      } catch (error) {
        console.error('Error al actualizar el post:', error);
        throw error;
      }
    },
    // Eliminar un post
    async deletePost(postIdDoc) {
      console.log('Eliminando post con idDoc:', postIdDoc);
      const { deletePost } = usePosts();
      await deletePost(postIdDoc);
      console.log('Post eliminado, esperando actualización de Firebase...');
    },
    // Nueva acción para agregar un Like
    async toggleLike(postIdDoc, userData) {
      const { addLike, removeLike } = usePosts();
      const post = this.posts.value.find(p => p.idDoc === postIdDoc);
      if (!post) return;

      const userLiked = post.likes.some(like => like.userId === userData.id);
      if (userLiked) {
        await removeLike(postIdDoc, userData);
      } else {
        await addLike(postIdDoc, userData);
      }
      // La actualización en tiempo real vendrá del suscriptor
    },
  },
});