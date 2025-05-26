import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useEventPosts } from '../composable/useEventPosts';

export const useEventPostsStore = defineStore('eventPosts', {
  state: () => ({
    isLoading: ref(false),
    unsubscribePosts: ref(null),
    eventDetailPosts: ref([]),
  }),
  actions: {
    // Subscribe to posts of an event
    async subscribePostsByEventId(event, callback) {
      const { subscribePostsByEventId } = useEventPosts();
      if (this.unsubscribePosts) {
        console.log('Suscripción a posts de evento ya activa, cancelando...');
        this.unsubscribePostsByEventId();
      }
      try {
        this.unsubscribePosts = subscribePostsByEventId(event, (data) => {
          this.eventDetailPosts.value = data;
          if (callback) {
            callback(this.eventDetailPosts.value);
          }
        });
      } catch (error) {
        console.error('Error al suscribirse a los posts del evento:', error);
        throw error;
      }
    },

    // Unsubscribe from event posts
    unsubscribePostsByEventId() {
      if (this.unsubscribePosts) {
        console.log('Cancelando suscripción a posts de evento...');
        this.unsubscribePosts();
        this.unsubscribePosts = null;
        this.eventDetailPosts.value = [];
      }
    },

    // Create a new post in an event
    async createPostEvent(idEvent, postData) {
      const { createPostEvent } = useEventPosts();
      this.isLoading = true;
      try {
        await createPostEvent(idEvent, postData);
      } catch (error) {
        console.error('Error al crear el post en evento:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Update a post in an event
    async updatePostEvent(idEvent, postId, postData) {
      const { updatePostEvent } = useEventPosts();
      this.isLoading = true;
      try {
        await updatePostEvent(idEvent, postId, postData);
      } catch (error) {
        console.error('Error al actualizar el post en evento:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Get a post by ID in an event
    async getEventPostById(idEvent, postId) {
      const { getPostById } = useEventPosts();
      this.isLoading = true;
      try {
        return await getPostById(idEvent, postId);
      } catch (error) {
        console.error('Error al obtener el post por ID:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Delete a post in an event
    async deletePostEvent(idEvent, postId) {
      const { deletePostEvent } = useEventPosts();
      this.isLoading = true;
      try {
        await deletePostEvent(idEvent, postId);
      } catch (error) {
        console.error('Error al eliminar el post en evento:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Hide a post
    async hidePostEvent(userId, postId) {
      const { hidePostEvent } = useEventPosts();
      this.isLoading = true;
      try {
        return await hidePostEvent(userId, postId);
      } catch (error) {
        console.error('Error al ocultar el post:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Toggle like (add or remove like)
    async toggleLikePostEvent(idEvent, postIdDoc, userData) {
      const { addLikePostEvent, removeLikePostEvent } = useEventPosts();

      const postInEventDetail = this.eventDetailPosts?.value?.find((p) => p.idDoc === postIdDoc);
      if (!postInEventDetail) return;

      const userLiked = postInEventDetail?.likes?.some((like) => like.userId === userData.id);

      this.isLoading = true;
      try {
        if (userLiked) {
          await removeLikePostEvent(idEvent, postIdDoc, userData);
          postInEventDetail.likes = postInEventDetail.likes.filter(
            (like) => like.userId !== userData.id
          );
        } else {
          await addLikePostEvent(idEvent, postIdDoc, userData);
          const newLike = { userId: userData.id, email: userData.email };
          postInEventDetail.likes = postInEventDetail.likes
            ? [...postInEventDetail.likes, newLike]
            : [newLike];
        }
      } catch (error) {
        console.error('Error toggling like:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
  },
});