import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useUsers } from '../composable/useUsers';

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: ref([]),
    usersCache: ref({}),
    unsubscribeUsersFn: ref(null),
    isLoading: ref(true),
    error: ref(null),
  }),
  actions: {
    async getUser(id) {
      if (this.usersCache[id]) {
        return this.usersCache[id];
      }
      const { getUser } = useUsers();
      const user = await getUser(id);
      this.usersCache[id] = user;
      return user;
    },
    subscribeUsers() {
      if (this.unsubscribeUsersFn) {
        console.log('Suscripción a usuarios ya activa, ignorando...');
        return;
      }
      console.log('Iniciando suscripción a usuarios...');
      const { subscribeToUsers } = useUsers();
      this.unsubscribeUsersFn = subscribeToUsers((updatedUsers) => {
        console.log('Usuarios recibidos desde Firebase:', updatedUsers);
        this.users = updatedUsers;
        this.isLoading = false;
      });
    },
    unsubscribeUsers() {
      if (this.unsubscribeFn) {
        console.log('Cancelando suscripción a usuarios...');
        this.unsubscribeUsersFn();
        this.unsubscribeUsersFn = null;
      }
    },
    async deleteUser(id) {
      try {
        const { deleteUser } = useUsers();
        await deleteUser(id);
        // Remove user from users array
        this.users = this.users.filter((user) => user.uid !== id);
        // Remove user from cache
        delete this.usersCache[id];
        this.error = null;
        console.log(`Usuario con ID ${id} eliminado del store`);
      } catch (error) {
        console.error('Error al eliminar usuario en el store:', error);
        this.error = error.message || 'Error al eliminar el usuario';
        throw error;
      }
    },
    async blockUserGlobally(id, block) {
      try {
        const { blockUserGlobally } = useUsers();
        await blockUserGlobally(id, block);
        const user = this.users.find((u) => u.uid === id);
        if (user) {
          user.isBlockedGlobally = block;
        }
        this.error = null;
        console.log(`Usuario con ID ${id} ${block ? 'bloqueado' : 'desbloqueado'} en el store`);
      } catch (error) {
        console.error('Error al bloquear/desbloquear usuario globalmente en el store:', error);
        this.error = error.message || 'Error al bloquear/desbloquear usuario';
        throw error;
      }
    },
    async blockUserIndividually(targetId) {
      try {
        const { blockUserIndividually } = useUsers();
        await blockUserIndividually(targetId);
        this.error = null;
        console.log(`Usuario con ID ${targetId} bloqueado individualmente en el store`);
      } catch (error) {
        console.error('Error al bloquear usuario individualmente en el store:', error);
        this.error = error.message || 'Error al bloquear usuario';
        throw error;
      }
    },
    async unblockUserIndividually(targetId) {
      try {
        const { unblockUserIndividually } = useUsers();
        await unblockUserIndividually(targetId);
        this.error = null;
        console.log(`Usuario con ID ${targetId} desbloqueado individualmente en el store`);
      } catch (error) {
        console.error('Error al desbloquear usuario individualmente en el store:', error);
        this.error = error.message || 'Error al desbloquear usuario';
        throw error;
      }
    },
  },
});