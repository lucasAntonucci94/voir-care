import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useLocations } from '../composable/useLocations';

export const useLocationsStore = defineStore('locations', {
  state: () => {
    const locations = ref([]);
    const isLoading = ref(true);

    return {
      locations,
      isLoading
    };
  },
  actions: {
    // Suscribirse a los locations en tiempo real
    subscribe() {
      console.log('Iniciando suscripción a locations...');
      const { subscribeToIncomingLocations } = useLocations();
      this.unsubscribe = subscribeToIncomingLocations((updatedLocations) => {
        console.log('Locations recibidos desde Firebase:', updatedLocations);
        this.locations.value = updatedLocations;
        this.isLoading = false;
        console.log('Locations actualizados en el store:', this.locations.value);
      });
    },
    // Cancelar la suscripción
    unsubscribe() {
      if (this.unsubscribe) {
        console.log('Cancelando suscripción a locations...');
        this.unsubscribe();
      }
    },
    // Agregar un nuevo location
    async addLocation(locationData) {
      console.log('Añadiendo nuevo location:', locationData);
      const { saveLocation } = useLocations();
      try {
        await saveLocation(locationData);
        console.log('Location añadido exitosamente a Firebase');
      } catch (error) {
        console.error('Error al añadir el location:', error);
        throw error;
      }
    },
    // Actualizar un location
    async updateLocation(locationIdDoc, updatedLocationData) {
      console.log('Actualizando location:', locationIdDoc, updatedLocationData);
      const { updateLocation } = useLocations();
      try {
        await updateLocation(locationIdDoc, updatedLocationData);
        console.log('Location actualizado exitosamente en Firebase');
      } catch (error) {
        console.error('Error al actualizar el location:', error);
        throw error;
      }
    },
    // Eliminar un location
    async deleteLocation(locationIdDoc) {
      console.log('Eliminando location con idDoc:', locationIdDoc);
      const { deleteLocation } = useLocations();
      try {
        await deleteLocation(locationIdDoc);
        console.log('Location eliminado, esperando actualización de Firebase...');
      } catch (error) {
        console.error('Error al eliminar el location:', error);
        throw error;
      }
    },
    // Cambiar estado pending
    async togglePending(location) {
      console.log('Cambiando estado pending de location:', location.idDoc);
      const { changeStateLocation } = useLocations();
      try {
        await changeStateLocation(location);
        console.log('Estado pending actualizado en Firebase');
      } catch (error) {
        console.error('Error al cambiar estado pending:', error);
        throw error;
      }
    }
  }
});