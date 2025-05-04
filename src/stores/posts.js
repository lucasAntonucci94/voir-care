import { defineStore } from 'pinia';
import { ref } from 'vue';
import { usePosts } from '../composable/usePosts';

export const usePostsStore = defineStore('posts', {
  state: () => {
    const posts = ref([]); // Posts globales (feed)
    const profilePosts = ref([]); // Posts del perfil
    const isLoading = ref(true); // Loading global
    const isLoadingProfile = ref(true); // Loading para el perfil
    const unsubscribeGlobal = ref(null); // Suscripción global
    const unsubscribeProfile = ref(null); // Suscripción del perfil

    return {
      posts,
      profilePosts,
      isLoading,
      isLoadingProfile,
      unsubscribeGlobal,
      unsubscribeProfile,
    };
  },
  actions: {
    // Suscribirse a los posts globales
    subscribeGlobal() {
      if (this.unsubscribeGlobal.value) {
        console.log('Suscripción global ya activa, ignorando...');
        return;
      }
      console.log('Iniciando suscripción global a posts...');
      const { subscribeToIncomingPosts } = usePosts();
      this.unsubscribeGlobal.value = subscribeToIncomingPosts((updatedPosts) => {
        console.log('Posts globales recibidos desde Firebase:', updatedPosts);
        this.posts.value = updatedPosts;
        this.isLoading = false;
      });
    },
    // Suscribirse a los posts de un perfil específico
    subscribeProfile(userId) {
      if (this.unsubscribeProfile.value) {
        console.log('Cancelando suscripción anterior del perfil...');
        this.unsubscribeProfile.value();
        this.unsubscribeProfile.value = null;
      }
      if (!userId) {
        console.warn('No se proporcionó userId para la suscripción del perfil');
        return;
      }
      console.log(`Iniciando suscripción a posts del perfil para userId: ${userId}...`);
      const { subscribeToIncomingProfilePosts } = usePosts();
      this.unsubscribeProfile.value = subscribeToIncomingProfilePosts(userId, (updatedPosts) => {
        console.log('Posts del perfil recibidos desde Firebase:', updatedPosts);
        this.profilePosts.value = updatedPosts;
        this.isLoadingProfile = false;
      });
    },
    // Cancelar suscripción global
    unsubscribeGlobal() {
      if (this.unsubscribeGlobal.value) {
        console.log('Cancelando suscripción global a posts...');
        this.unsubscribeGlobal.value();
        this.unsubscribeGlobal.value = null;
      }
    },
    // Cancelar suscripción del perfil
    unsubscribeProfile() {
      if (this.unsubscribeProfile.value) {
        console.log('Cancelando suscripción a posts del perfil...');
        this.unsubscribeProfile.value();
        this.unsubscribeProfile.value = null;
      }
    },
    async addPost(postData) {
      console.log('Añadiendo nuevo post:', postData);
      const { savePost } = usePosts();
      await savePost(postData);
    },
    async updatePost(postId, updatedPostData) {
      console.log('Actualizando post:', postId, updatedPostData);
      const { updatePost } = usePosts();
      await updatePost(postId, updatedPostData);
    },
    async deletePost(postIdDoc) {
      console.log('Eliminando post con idDoc:', postIdDoc);
      const { deletePost } = usePosts();
      await deletePost(postIdDoc);
    },
    async toggleLike(postIdDoc, userData) {
      const { addLike, removeLike } = usePosts();
      const post = this.posts?.value?.find(p => p.idDoc === postIdDoc) || 
                   this.profilePosts?.value?.find(p => p.idDoc === postIdDoc);
      if (!post) return;

      const userLiked = post.likes.some(like => like.userId === userData.id);
      if (userLiked) {
        await removeLike(postIdDoc, userData);
      } else {
        await addLike(postIdDoc, userData);
      }
    },
  },
});