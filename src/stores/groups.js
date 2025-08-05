import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useGroups } from '../composable/useGroups';

export const useGroupsStore = defineStore('groups', {
  state: () => ({
    userGroups: ref([]),
    allGroups: ref([]),
    adoptionGroups: ref([]),
    isLoading: ref(false),
    unsubscribeUserGroups: ref(null),
    unsubscribeAll: ref(null),
    unsubscribeAdoption: ref(null),
  }),
  actions: {
    // Suscribirse a los grupos en los que el usuario es miembro
    subscribeUserGroups(uid) {
      // console.log('Iniciando suscripción a grupos del usuario...');
      const { subscribeToUserGroups } = useGroups();

      if (this.unsubscribeUserGroups) {
        // console.log('Suscripción a grupo de usuario ya activa, ignorando...');
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
        // console.log('Cancelando suscripción a grupos de usuario...');
        this.unsubscribeUserGroups();
        this.unsubscribeUserGroups = null;
      }
    },

    // Suscribirse a todos los grupos
    subscribeAllGroups() {
      if (this.unsubscribeAll) {
        // console.log('Suscripción a todos los grupos ya activa, ignorando...');
        return;
      }
      // console.log('Iniciando suscripción a todos los grupos...');
      const { subscribeToGroups } = useGroups();
      this.unsubscribeAll = subscribeToGroups((groups) => {
        this.allGroups.value = groups;
        this.isLoading = false;
      });
    },

    // Cancelar la suscripción a todos los grupos
    unsubscribeAllGroups() {
      if (this.unsubscribeAll) {
        // console.log('Cancelando suscripción a todos los grupos...');
        this.unsubscribeAll();
        this.unsubscribeAll = null;
      }
    },
    // Suscripción a grupos de adopción
    subscribeToAdoptionGroups() {
      if (this.unsubscribeAdoption) {
        // console.log('Suscripción a grupos de adopción ya activa, ignorando...');
        return;
      }
      // console.log('Iniciando suscripción a grupos de adopción...');
      const { subscribeToAdoptionGroups } = useGroups();
      this.unsubscribeAdoption = subscribeToAdoptionGroups((groups) => {
        this.adoptionGroups.value = groups;
        this.isLoading = false;
      });
    },

    // Cancelar suscripción de grupos de adopción
    unsubscribeAdoptionGroups() {
      if (this.unsubscribeAdoption) {
        // console.log('Cancelando suscripción a grupos de adopción...');
        this.unsubscribeAdoption();
        this.unsubscribeAdoption = null;
      }
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
      try {
        const { joinGroup } = useGroups();
        this.isLoading = true;
        return await joinGroup(groupId, userId);
      } catch (error) {
        console.error(`Error al unirse al grupo con id: ${groupId}`, error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    // Unirse a un grupo
    async joinDefautGroups(userId) {
      try {
        const groupDefaultIds = [
          'AybOkhRASczu3DnP3gm3',
          'qhDTjajjusURU1eOcEcN',
          'uy39JvtFJueZjkmMs7uW',   
          'U5ciLrvMr5vxmhRVOlku',   
          '4gGYZIwn75V7futYU3h5',   
          'Jf7OftGTVx4nPaFd4wju',   
        ];
        const joinPromises = groupDefaultIds.map(groupId => this.joinGroup(groupId, userId));
        this.isLoading = true;
        await Promise.all(joinPromises);
        console.log('Usuario unido a grupos por defecto exitosamente');
        // Retornar el resultado de unirse al primer grupo como confirmación
        if (joinPromises.length > 0) {
          return joinPromises[0];
        }
        console.warn('No se proporcionaron grupos por defecto para unirse');
        return null;
      } catch (error) {
        console.error(`Error al unirse al grupo`, error);
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
    async getCount() {
      try {
          const { getAllGroupsCount } = useGroups();
          return await getAllGroupsCount();
      } catch (error) {
          console.error('Error al obtener la cantidad de grupos en el store:', error);
          this.error = error.message || 'Error al obtener la cantidad de grupos en el store';
          throw error;
      }
    },
    async getCountByOwnerId(ownerId) {
      try {
          const { getGroupCountByOwnerId } = useGroups();
          return await getGroupCountByOwnerId(ownerId);
      } catch (error) {
          console.error('Error al obtener la cantidad de grupos en el store:', error);
          this.error = error.message || 'Error al obtener la cantidad de grupos en el store';
          throw error;
      }
    },
    async getLastGroupByOwnerId(ownerId) {
      try {
          const { getLastGroupByOwnerId } = useGroups();
          return await getLastGroupByOwnerId(ownerId);
      } catch (error) {
          console.error('Error al obtener el último grupo en el store:', error);
          this.error = error.message || 'Error al obtener el último grupo en el store';
          throw error;
      }
    },
  },
});