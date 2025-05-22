import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useGroupPosts } from '../composable/useGroupPosts';
import { useGroups } from '../composable/useGroups';
import { useSavedGroupPosts } from '../composable/useSavedGroupPosts';
import { useGroupsStore } from './groups';

export const useGroupPostsStore = defineStore('groupPosts', {
  state: () => ({
    isLoading: ref(false),
    unsubscribePosts: ref(null),
    savedPostIds: ref([]),
    savedPosts: ref([]),
    userGroupFeed: ref([]),
    unsubscribePostsUserFeed: ref([]),
    unsubscribeUserGroups: ref(null),
    groupDetailPosts: ref([]), // New state for group-specific posts
  }),
  actions: {
    // Suscribirse al feed de posts de los grupos del usuario
    subscribeUserGroupFeed(uid) {
      const { subscribeToUserGroups } = useGroups();
      const { suscribePostsByGroupId } = useGroupPosts();
      const groupsStore = useGroupsStore();

      if (groupsStore.unsubscribeUserGroups || this.unsubscribePostsUserFeed?.length) {
        console.log('[Feed] Ya está suscrito, cancelando...');
        this.unsubscribeUserGroupFeed();
      }

      console.log('[Feed] Suscribiendo a los grupos del usuario...');
      groupsStore.unsubscribeUserGroups = subscribeToUserGroups(uid, (groups) => {
        if (!Array.isArray(groups)) {
          console.warn('[Feed] No se pudo obtener la lista de grupos del usuario');
          this.userGroupFeed.value = [];
          return;
        }

        groupsStore.userGroups.value = groups;
        const groupIds = groups.map((g) => g.idDoc);

        if (groupIds.length === 0) {
          console.log('[Feed] El usuario no tiene grupos, cancelando feed');
          this.userGroupFeed.value = [];
          return;
        }

        this.unsubscribePostsUserFeed = [];
        groupsStore.userGroups?.value?.forEach((group) => {
          const unsubscribe = suscribePostsByGroupId(group, (posts) => {
            const postsWithGroupDetail = posts.map((post) => ({
              ...post,
              group: {
                id: group.idDoc,
                title: group.title,
                media: group.media,
              },
            }));

            const uniquePosts = [
              ...this.userGroupFeed?.value?.filter(
                (p) => p.group.id !== group.idDoc
              ),
              ...postsWithGroupDetail,
            ];

            this.userGroupFeed.value = uniquePosts.sort(
              (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
            );
          });

          this.unsubscribePostsUserFeed.push(unsubscribe);
        });
      });
    },

    // Cancelar suscripción al feed de grupos del usuario
    unsubscribeUserGroupFeed() {
      const groupsStore = useGroupsStore();
      if (this.unsubscribePostsUserFeed?.length) {
        console.log('[Feed] Cancelando suscripciones a posteos...');
        this.unsubscribePostsUserFeed.forEach((unsubscribe) => unsubscribe());
        this.unsubscribePostsUserFeed = [];
      }

      if (groupsStore.unsubscribeUserGroups) {
        console.log('[Feed] Cancelando suscripción a grupos del usuario...');
        groupsStore.unsubscribeUserGroups();
        groupsStore.unsubscribeUserGroups = null;
      }

      this.userGroupFeed.value = [];
    },

    // Suscribirse a los posts de un grupo
    async suscribePostsByGroupId(group, callback) {
      const { suscribePostsByGroupId } = useGroupPosts();
      if (this.unsubscribePosts) {
        console.log('Suscripción a posts de grupo ya activa, cancelando...');
        this.unsuscribePostsByGroupId();
      }
      try {
        this.unsubscribePosts = suscribePostsByGroupId(group, (data) => {
          this.groupDetailPosts.value = data;
          if (callback) { callback(this.groupDetailPosts.value); }
        });
      } catch (error) {
        console.error('Error al suscribirse a los posts del grupo:', error);
        throw error;
      }
    },

    // Cancelar la suscripción a posts de un grupo
    unsuscribePostsByGroupId() {
      if (this.unsubscribePosts) {
        console.log('Cancelando suscripción a posts de grupo...');
        this.unsubscribePosts();
        this.unsubscribePosts = null;
        this.groupDetailPosts.value = []; // Clear the posts state
      }
    },

    // Crear un nuevo post en un grupo
    async createPostGroup(idGroup, postData) {
      const { createPostGroup } = useGroupPosts();
      this.isLoading = true;
      try {
        await createPostGroup(idGroup, postData);
      } catch (error) {
        console.error('Error al crear el post en grupo:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Actualizar un post en un grupo
    async updatePostGroup(idGroup, postId, postData) {
      const { updatePostGroup } = useGroupPosts();
      this.isLoading = true;
      try {
        await updatePostGroup(idGroup, postId, postData);
      } catch (error) {
        console.error('Error al actualizar el post en grupo:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Obtener un post por ID en un grupo
    async getGroupPostById(idGroup, postId) {
      const { getPostById } = useGroupPosts();
      this.isLoading = true;
      try {
        return await getPostById(idGroup, postId);
      } catch (error) {
        console.error('Error al obtener el post por ID:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Eliminar un post en un grupo
    async deletePostGroup(idGroup, postId) {
      const { deletePostGroup } = useGroupPosts();
      this.isLoading = true;
      try {
        await deletePostGroup(idGroup, postId);
      } catch (error) {
        console.error('Error al eliminar el post en grupo:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Agregar un like a un post en un grupo
    async addLikePostGroup(idGroup, postIdDoc, userData) {
      const { addLikeGroup } = useGroupPosts();
      this.isLoading = true;
      try {
        await addLikeGroup(idGroup, postIdDoc, userData);
      } catch (error) {
        console.error('Error al agregar like en post de grupo:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Quitar un like de un post en un grupo
    async removeLikePostGroup(idGroup, postIdDoc, userData) {
      const { removeLikeGroup } = useGroupPosts();
      this.isLoading = true;
      try {
        await removeLikeGroup(idGroup, postIdDoc, userData);
      } catch (error) {
        console.error('Error al quitar like en post de grupo:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Ocultar un post
    async hidePostGroup(userId, postId) {
      const { hidePostGroup } = useGroupPosts();
      this.isLoading = true;
      try {
        return await hidePostGroup(userId, postId);
      } catch (error) {
        console.error('Error al ocultar el post:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Alternar like (dar o quitar like)
    async toggleLikePostGroup(idGroup, postIdDoc, userData) {
      const { addLikeGroup, removeLikeGroup } = useGroupPosts();
      // Buscar el post en el arreglo del store (posts or userGroupFeed)
      let post = this.groupDetailPosts.find((p) => p.idDoc === postIdDoc) || this.userGroupFeed.find((p) => p.idDoc === postIdDoc);
      if (!post) return;

      const userLiked = post?.likes?.some((like) => like.userId === userData.id);
      this.isLoading = true;
      try {
        if (userLiked) {
          await removeLikeGroup(idGroup, postIdDoc, userData);
          post.likes = post.likes.filter((like) => like.userId !== userData.id);
        } else {
          await addLikeGroup(idGroup, postIdDoc, userData);
          post.likes = (post?.likes === null || post?.likes === undefined)
            ? [{ userId: userData.id, email: userData.email }]
            : [...post.likes, { userId: userData.id, email: userData.email }];
        }
      } catch (error) {
        console.error('Error toggling like:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Toggle save/unsave post
    async toggleSavePost(userId, postId, groupId) {
      const { savePost, unsavePost, isPostSavedQuery } = useSavedGroupPosts();
      const isSaved = await isPostSavedQuery(userId, postId, groupId);
      if (isSaved) {
        await unsavePost(userId, postId, groupId);
      } else {
        await savePost(userId, postId, groupId);
      }
    },
  },
});