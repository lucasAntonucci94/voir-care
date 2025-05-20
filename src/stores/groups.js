import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useGroups } from '../composable/useGroups';
import { useGroupPosts } from '../composable/useGroupPosts';

export const useGroupsStore = defineStore('groups', {
  state: () => ({
    userGroups: ref([]),
    allGroups: ref([]),
    isLoading: ref(false),
    unsubscribeUserGroups: ref(null),
    unsubscribeAll: ref(null),
    userGroupFeed: ref([]),
    unsubscribePostsUserFeed: ref([]),
  }),
  actions: {
    // Suscribirse a los grupos en los que el usuario es miembro
    subscribeUserGroups(uid) {
      console.log('Iniciando suscripción a grupos del usuario...');
      const { subscribeToUserGroups } = useGroups();

      if (this.unsubscribeUserGroups) {
        console.log('Suscripción a grupo de usuario ya activa, ignorando...');
        return;
      }

      this.unsubscribeUserGroups = subscribeToUserGroups(uid, (groups) => {
        this.userGroups.value = groups;
        this.isLoading = false;
      });
    },

    // Cancelar la suscripción a grupos de usuario
    unsubscribeFromUserGroups() {
      if (this.unsubscribeUserGroups) {
        console.log('Cancelando suscripción a grupos de usuario...');
        this.unsubscribeUserGroups();
        this.unsubscribeUserGroups = null;
      }
    },

    // Suscribirse a todos los grupos
    subscribeAllGroups() {
      if (this.unsubscribeAll) {
        console.log('Suscripción a todos los grupos ya activa, ignorando...');
        return;
      }
      console.log('Iniciando suscripción a todos los grupos...');
      const { subscribeToGroups } = useGroups();
      this.unsubscribeAll = subscribeToGroups((groups) => {
        this.allGroups.value = groups;
        this.isLoading = false;
      });
    },

    // Cancelar la suscripción a todos los grupos
    unsubscribeAllGroups() {
      if (this.unsubscribeAll) {
        console.log('Cancelando suscripción a todos los grupos...');
        this.unsubscribeAll();
        this.unsubscribeAll = null;
      }
    },

    // Suscribirse al feed de posts de los grupos del usuario
    subscribeUserGroupFeed(uid) {
      const { subscribeToUserGroups } = useGroups();
      const { suscribePostsByGroupId } = useGroupPosts(); // Importado desde el composable

      // Evitar doble suscripción
      if (this.unsubscribeUserGroups || this.unsubscribePostsUserFeed?.length) {
        console.log('[Feed] Ya está suscrito, cancelando...');
        this.unsubscribeUserGroupFeed();
      }

      console.log('[Feed] Suscribiendo a los grupos del usuario...');
      this.unsubscribeUserGroups = subscribeToUserGroups(uid, (groups) => {
        if (!Array.isArray(groups)) {
          console.warn('[Feed] No se pudo obtener la lista de grupos del usuario');
          this.userGroupFeed.value = [];
          return;
        }

        this.userGroups.value = groups;
        const groupIds = groups.map((g) => g.idDoc);

        if (groupIds.length === 0) {
          console.log('[Feed] El usuario no tiene grupos, cancelando feed');
          this.userGroupFeed.value = [];
          return;
        }

        // Array para almacenar las funciones de desuscripción de los posteos
        this.unsubscribePostsUserFeed = [];
        this.userGroups?.value?.forEach((group) => {
          const unsubscribe = suscribePostsByGroupId(group.idDoc, (posts) => {
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
                (p) => p.group.id !== group.idDoc // Mantener posteos de otros grupos
              ),
              ...postsWithGroupDetail, // Agregar los nuevos posteos
            ];

            // Actualizar el feed, ordenando por fecha
            this.userGroupFeed.value = uniquePosts.sort(
              (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
            );
          });

          // Guardar la función de desuscripción
          this.unsubscribePostsUserFeed.push(unsubscribe);
        });
      });
    },

    // Cancelar suscripción al feed de grupos del usuario
    unsubscribeUserGroupFeed() {
      if (this.unsubscribePostsUserFeed?.length) {
        console.log('[Feed] Cancelando suscripciones a posteos...');
        this.unsubscribePostsUserFeed.forEach((unsubscribe) => unsubscribe());
        this.unsubscribePostsUserFeed = [];
      }

      if (this.unsubscribeUserGroups) {
        console.log('[Feed] Cancelando suscripción a grupos del usuario...');
        this.unsubscribeUserGroups();
        this.unsubscribeUserGroups = null;
      }

      this.userGroupFeed.value = [];
    },

    // Crear un nuevo grupo
    async createGroup(groupData) {
      const { createGroup } = useGroups();
      this.isLoading = true;
      try {
        await createGroup(groupData);
      } catch (error) {
        console.error('Error al crear grupo:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Actualizar un grupo
    async editGroup(idDoc, groupData) {
      const { updateGroup } = useGroups();
      this.isLoading = true;
      try {
        await updateGroup(idDoc, groupData);
      } catch (error) {
        console.error('Error al actualizar grupo:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Eliminar un grupo por idDoc
    async deleteGroup(idDoc) {
      const { deleteGroup } = useGroups();
      this.isLoading = true;
      try {
        await deleteGroup(idDoc);
      } catch (error) {
        console.error('Error al eliminar grupo:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Buscar grupo por idDoc
    async findGroupById(idDoc) {
      const { findById } = useGroups();
      this.isLoading = true;
      try {
        return await findById(idDoc);
      } catch (error) {
        console.error(`Error al buscar grupo con id: ${idDoc}`, error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Unirse a un grupo
    async joinGroup(groupId, userId) {
      const { joinGroup } = useGroups();
      this.isLoading = true;
      try {
        return await joinGroup(groupId, userId);
      } catch (error) {
        console.error(`Error al unirse al grupo con id: ${groupId}`, error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Salir de un grupo
    async leaveGroup(groupId, userId) {
      const { leaveGroup } = useGroups();
      this.isLoading = true;
      try {
        return await leaveGroup(groupId, userId);
      } catch (error) {
        console.error(`Error al salir del grupo con id: ${groupId}`, error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
  },
});