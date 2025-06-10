import { defineStore } from 'pinia';
import { ref } from 'vue';
import { usePosts } from '../composable/usePosts';
import { useSavedPosts } from '../composable/useSavedPost';

export const usePostsStore = defineStore('posts', {
  state: () => {
    const posts = ref([]); // Posts globales (feed)
    const profilePosts = ref([]); // Posts del perfil
    const adoptionPosts = ref([]); // Posts de adopción
    const isLoading = ref(true); // Loading global
    const isLoadingProfile = ref(true); // Loading para el perfil
    const unsubscribeGlobal = ref(null); // Suscripción global
    const unsubscribeProfile = ref(null); // Suscripción del perfil
    const savedPostIds = ref([]); // IDs de posts guardados
    const savedPost = ref([]); // fetch guardados
    const hiddenPosts = ref([]); // fetch guardados
    const unsubscribeSavedPosts = ref(null); // Suscripción a posts guardados
    const unsubscribeAdoption = ref(null); // Suscripción para adopción
    
    return {
      posts,
      profilePosts,
      adoptionPosts,
      isLoading,
      isLoadingProfile,
      unsubscribeGlobal,
      unsubscribeProfile,
      savedPostIds,
      savedPost,
      hiddenPosts,
      unsubscribeSavedPosts,
      unsubscribeAdoption,
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
      // Find the post in posts, profilePosts, or savedPosts
      let postInPosts = this.posts?.value?.find(p => p.idDoc === postIdDoc);
      let postInProfile = this.profilePosts?.value?.find(p => p.idDoc === postIdDoc);
      let postInSaved = this.savedPosts?.find(p => p.idDoc === postIdDoc);
      let post = postInPosts || postInProfile || postInSaved;
      if (!post) return;

      const userLiked = post.likes.some(like => like.userId === userData.id);
      try {
        if (userLiked) {
          await removeLike(postIdDoc, userData);
          // Update local arrays after successful removal
          if (postInPosts) postInPosts.likes = postInPosts.likes.filter(like => like.userId !== userData.id);
          if (postInProfile) postInProfile.likes = postInProfile.likes.filter(like => like.userId !== userData.id);
          if (postInSaved) postInSaved.likes = postInSaved.likes.filter(like => like.userId !== userData.id);
        } else {
          await addLike(postIdDoc, userData);
          // Update local arrays after successful addition
          if (postInPosts) postInPosts.likes = [...postInPosts.likes, { userId: userData.id, timestamp: new Date().toISOString() }];
          if (postInProfile) postInProfile.likes = [...postInProfile.likes, { userId: userData.id, timestamp: new Date().toISOString() }];
          if (postInSaved) postInSaved.likes = [...postInSaved.likes, { userId: userData.id, timestamp: new Date().toISOString() }];
        }
      } catch (error) {
        console.error('Error toggling like:', error);
      }
    },
    // Suscribirse a los posts guardados del usuario
    subscribeToSavedPosts(userId) {
      if (this.unsubscribeSavedPosts.value) {
        console.log('Cancelando suscripción anterior a posts guardados...');
        this.unsubscribeSavedPosts.value();
        this.unsubscribeSavedPosts.value = null;
      }
      if (!userId) {
        console.warn('No se proporcionó userId para la suscripción a posts guardados');
        return;
      }
      console.log(`Iniciando suscripción a posts guardados para userId: ${userId}...`);
      const { subscribeToSavedPosts } = useSavedPosts();
      this.unsubscribeSavedPosts.value = subscribeToSavedPosts(userId, (savedPosts) => {
        console.log('Posts guardados recibidos desde Firebase:', savedPosts.value);
        this.savedPostIds = savedPosts.map(sp => sp.postId);
      });
    },
    // Cancelar suscripción a posts guardados
    unsubscribeSavedPosts() {
      if (this.unsubscribeSavedPosts.value) {
        console.log('Cancelando suscripción a posts guardados...');
        this.unsubscribeSavedPosts.value();
        this.unsubscribeSavedPosts.value = null;
      }
    },
    // Toggle save/unsave post
    async toggleSavePost(userId, postId) {
      const { savePost, unsavePost, isPostSaved } = useSavedPosts();
      const isSaved = await isPostSaved(userId, postId);
      if (isSaved) {
        await unsavePost(userId, postId);
        // Quitar el postId del array savedPostIds
        this.savedPostIds = this.savedPostIds.filter(id => id !== postId);
      } else {
        await savePost(userId, postId);
        // Agregar el postId al array savedPostIds, evitando duplicados
        if (!this.savedPostIds.includes(postId)) {
          this.savedPostIds.push(postId);
        }
      }
    },
    async fetchSavedPosts() {
      const { getPostById } = usePosts();
      try {
        const fetchedPosts = await Promise.all(
          this.savedPostIds.map(async (postId) => {
            try {
              const post = await getPostById(postId);
              return post;
            } catch (error) {
              console.error(`Error fetching post with ID ${postId}:`, error);
              return null;
            }
          })
        );
        this.savedPosts = fetchedPosts.filter(post => post !== null);
      } catch (error) {
        console.error('Error fetching saved posts:', error);
        this.savedPosts = []; // Reset si falla
      }
    },
    async fetchHiddenPosts(postIds) {
      const { getPostById } = usePosts()
      try {
        this.isLoading = true
        const fetchedPosts = await Promise.all(
          postIds.map(async (postId) => {
            try {
              const post = await getPostById(postId)
              return post
            } catch (error) {
              console.error(`Error fetching post with ID ${postId}:`, error)
              return null
            }
          })
        )
        this.hiddenPosts = fetchedPosts.filter(post => post !== null)
      } catch (error) {
        console.error('Error fetching hidden posts:', error)
        this.hiddenPosts = []
      } finally {
        this.isLoading = false
      }
    },
    async unhidePost(userId, postId) {
      const { deleteHiddenPost } = usePosts();
      try {
        console.log(`Eliminando hiddenPost para userId: ${userId}, postId: ${postId}`);
        const success = await deleteHiddenPost(userId, postId);
        
        if (success) {
          this.hiddenPosts = this.hiddenPosts.filter(post => post.idDoc !== postId);
          console.log('HiddenPost eliminado correctamente');
          return true
        } else {
          console.warn('No se encontró el hiddenPost para eliminar');
          return false
        }
      } catch (error) {
        console.error('Error al eliminar hiddenPost:', error);
        return false
      }
    },
    // Suscribirse a posts de adopción
    subscribeToAdoptionPosts() {
      if (this.unsubscribeAdoption) {
        console.log('Suscripción a posts de adopción ya activa, ignorando...');
        return;
      }
      console.log('Iniciando suscripción a posts de adopción...');
      const { subscribeToAdoptionPosts } = usePosts();
      this.unsubscribeAdoption = subscribeToAdoptionPosts((posts) => {
        this.adoptionPosts.value = posts;
        // this.isLoading = false;
      });
    },
    // Cancelar suscripción a posts de adopción
    unsubscribeAdoptionPosts() {
      if (this.unsubscribeAdoption) {
        console.log('Cancelando suscripción a posts de adopción...');
        this.unsubscribeAdoption();
        this.unsubscribeAdoption = null;
      }
    },
  },
});