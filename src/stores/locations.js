import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useLocations } from '../composable/useLocations';
import { useAuth } from '../api/auth/useAuth';
export const useLocationsStore = defineStore('locations', {
  state: () => ({
    locations: ref([]), // locations globales
    userLocations: ref([]), // locations del usuario autenticado
    isLoadingAll: ref(true), // Estado de carga para todas las locations
    isLoadingUser: ref(true), // Estado de carga para las locations del usuario
    unsubscribeAllFn: null, // Función para cancelar la suscripción global
    unsubscribeUserFn: null, // Nueva función para cancelar la suscripción del usuario
  }),
  actions: {
    // Suscribirse a TODAS las locations en tiempo real
    subscribeTolocations() {
      // console.log('Iniciando suscripción a TODAS las locations...');
      const { subscribeToIncomingLocations } = useLocations();
      try {
        this.unsubscribeAllFn = subscribeToIncomingLocations((updatedLocations) => {
          // console.log('Locations globales recibidas desde Firebase:', updatedLocations);
          this.locations.value = updatedLocations;
          this.isLoadingAll = false;
          // console.log('Locations globales actualizadas en el store:', this.locations.value);
        });
      } catch (error) {
        console.error('Error al suscribirse a TODAS las locations:', error);
        this.isLoadingAll = false;
      }
    },

    // Suscribirse a las locations del USUARIO logueado en tiempo real
    subscribeToCurrentUserLocations() {
      const { user } = useAuth();
      const { subscribeToUserLocations } = useLocations();

      if (!user.value || !user.value.uid) {
        console.warn('Usuario no autenticado o UID no disponible. No se suscribirá a locations del usuario.');
        this.userLocations.value = [];
        this.isLoadingUser = false;
        return;
      }

      // Cancelar suscripción anterior si existe
      if (typeof this.unsubscribeUserFn === 'function') {
        this.unsubscribeUserFn();
        this.unsubscribeUserFn = null;
      }

      // console.log(`Iniciando suscripción a locations del usuario: ${user.value.uid}`);
      try {
        this.isLoadingUser = true;
        this.unsubscribeUserFn = subscribeToUserLocations(user.value.uid, (updatedUserLocations) => {
          // console.log('Locations del usuario recibidas desde Firebase:', updatedUserLocations);
          this.userLocations.value = updatedUserLocations;
          this.isLoadingUser = false;
          // console.log('Locations del usuario actualizadas en el store:', this.userLocations.value);
        });
      } catch (error) {
        console.error('Error al suscribirse a locations del usuario:', error);
        this.isLoadingUser = false;
      }
    },

    // Cancelar la suscripción global
    unsubscribeAll() {
      if (typeof this.unsubscribeAllFn === 'function') {
        // console.log('Cancelando suscripción a TODAS las locations...');
        this.unsubscribeAllFn();
        this.unsubscribeAllFn = null;
      }
    },

    // Cancelar la suscripción de las locations del usuario
    unsubscribeUser() {
      if (typeof this.unsubscribeUserFn === 'function') {
        // console.log('Cancelando suscripción a locations del usuario...');
        this.unsubscribeUserFn();
        this.unsubscribeUserFn = null;
      }
    },

    // Agregar un nuevo location
    async addLocation(locationData) {
      // console.log('Añadiendo nuevo location:', locationData);
      const { saveLocation } = useLocations();
      try {
        await saveLocation(locationData);
        // console.log('Location añadido exitosamente a Firebase');
      } catch (error) {
        console.error('Error al añadir el location:', error);
        throw error;
      }
    },

    // Actualizar un location
    async updateLocation(locationIdDoc, updatedLocationData) {
      // console.log('Actualizando location:', locationIdDoc, updatedLocationData);
      const { updateLocation } = useLocations();
      try {
        await updateLocation(locationIdDoc, updatedLocationData);
        // console.log('Location actualizado exitosamente en Firebase');
      } catch (error) {
        console.error('Error al actualizar el location:', error);
        throw error;
      }
    },

    // Eliminar un location
    async deleteLocation(locationIdDoc) {
      // console.log('Eliminando location con idDoc:', locationIdDoc);
      const { deleteLocation } = useLocations();
      try {
        await deleteLocation(locationIdDoc);
        // console.log('Location eliminado, esperando actualización de Firebase...');
      } catch (error) {
        console.error('Error al eliminar el location:', error);
        throw error;
      }
    },
    /**
     * @param {string} idDoc El ID del documento de Firestore a buscar.
     * @returns {Promise<Object|null>} El objeto del location, o null si no se encuentra.
     */
    async fetchLocationByIdDoc(idDoc) {
      // console.log('Buscando location por idDoc:', idDoc);
      const { getLocationByIdDoc } = useLocations();
      try {
        const location = await getLocationByIdDoc(idDoc);
        return location;
      } catch (error) {
        console.error('Error al buscar location por idDoc:', error);
        throw error;
      }
    },
    // Cambiar estado pending
    async togglePending(location) {
      // console.log('Cambiando estado pending de location:', location.idDoc);
      const { changeStateLocation } = useLocations();
      try {
        await changeStateLocation(location);
        // console.log('Estado pending actualizado en Firebase');
      } catch (error) {
        console.error('Error al cambiar estado pending:', error);
        throw error;
      }
    },
    async getCount() {
      try {
          const { getAllCount } = useLocations();
          return await getAllCount();
      } catch (error) {
          console.error('Error al obtener la cantidad de grupos en el store:', error);
          this.error = error.message || 'Error al obtener la cantidad de grupos en el store';
          throw error;
      }
    },
    async getCountPendings() {
      // try {
      //     const { getAllReelsCount } = useReels();
      //     return await getAllReelsCount();
      // } catch (error) {
      //     console.error('Error al obtener la cantidad de grupos en el store:', error);
      //     this.error = error.message || 'Error al obtener la cantidad de grupos en el store';
      //     throw error;
      // }
    },
  },
});