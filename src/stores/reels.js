import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useReels } from '../composable/useReels';
import { useDefaultReels } from '../composable/useDefaultReels';

export const useReelsStore = defineStore('reels', {
  state: () => {
    const reels = ref([]);
    const userReels = ref([]);
    const defaultReels = ref([]);
    const isLoading = ref(true);
    const unsubscribe = ref(null);
    const unsubscribeDefaultReels = ref(null);
    const unsubscribeUserReels = ref(null);

    return {
      reels,
      userReels,
      defaultReels,
      isLoading,
      unsubscribe,
      unsubscribeDefaultReels,
      unsubscribeUserReels,
    };
  },
  actions: {
    // Suscribirse a los reels en tiempo real
    subscribeToReels() {
      if (this.unsubscribe) {
        // console.log('Suscripción a reels ya activa, ignorando...');
        return;
      }
      // console.log('Iniciando suscripción a reels...');
      const { subscribeToIncomingReels } = useReels();
      this.unsubscribe = subscribeToIncomingReels((updatedReels) => {
        // console.log('Reels recibidos desde Firebase:', updatedReels);
        this.reels = updatedReels;
        this.isLoading = false;
      });
    },
    // Cancelar la suscripción
    unsubscribeFromReels() {
      if (this.unsubscribe) {
        // console.log('Cancelando suscripción a reels...');
        this.unsubscribe();
        this.unsubscribe = null;
      }
    },
    // Subscribe to default reels
    subscribeToDefaultReels() {
      if (this.unsubscribeDefaultReels) {
        // console.log('Default reels subscription already active, ignoring...');
        return;
      }
      // console.log('Initiating subscription to default reels...');
      const { subscribeToDefaultReels } = useDefaultReels();
      this.unsubscribeDefaultReels = subscribeToDefaultReels((updatedDefaultReels) => {
        this.defaultReels = updatedDefaultReels;
        // console.log('Default reels received from Firebase:', updatedDefaultReels);
      });
    },
    // Cancelar la suscripción a default reels
    unsubscribeFromDefaultReels() {
      if (this.unsubscribeDefaultReels) {
        // console.log('Cancelando suscripción a default reels...');
        this.unsubscribeDefaultReels();
        this.unsubscribeDefaultReels = null;
      }
    },
    // Suscribirse a los reels en tiempo real
    subscribeToUserReels(userId) {
      if (this.unsubscribeUserReels) {
        return;
      }
      const { subscribeToUserReels } = useReels();
      this.unsubscribeUserReels = subscribeToUserReels(userId, (fetchedReed) => {
        this.userReels = fetchedReed;
        this.isLoading = false;
      });
    },
    // Cancelar la suscripción
    unsubscribeFromReels() {
      if (this.unsubscribeUserReels) {
        this.unsubscribeUserReels();
        this.unsubscribeUserReels = null;
      }
    },
    // Fetch default reels once
    // async fetchDefaultReels() {
    //   console.log('Fetching default reels...');
    //   const { fetchDefaultReels } = useDefaultReels();
    //   try {
    //     const reels = await fetchDefaultReels();
    //     this.defaultReels = reels;
    //     console.log('Default reels fetched from Firebase:', reels);
    //   } catch (err) {
    //     console.error('Error fetching default reels:', err);
    //     throw err;
    //   }
    // },
    // Añadir un nuevo reel
    async addReel(newReelData) {
      this.loading = true;
      this.error = null;
      try {
        const { saveReel } = useReels();
        await saveReel(newReelData);
      } catch (err) {
        console.error('Error en el store al añadir reel:', err);
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
    // Para actualizar un reel existente
    async updateReel(idDoc, updatedReelData) {
      this.loading = true;
      this.error = null;
      try {
        const { updateReelData } = useReels();
        // Pasamos idDoc y los datos actualizados, incluyendo base64 si hay un nuevo archivo
        await updateReelData(idDoc, updatedReelData);
      } catch (err) {
        console.error('Error en el store al actualizar reel:', err);
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
    // Eliminar un reel
    async deleteReel(reel) {
      this.loading = true;
      this.error = null;
      try {
        const { deleteReel } = useReels();
        await deleteReel(reel.idDoc, reel.mediaPath, reel.thumbnailPath);
        this.reels = this.reels.filter(r => r.idDoc !== reel.idDoc);
      } catch (err) {
        console.error('Error en el store al eliminar reel:', err);
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
    // Toggle like en un reel
    async toggleLike(reelIdDoc, userData) {
      try {
        const { addLike, removeLike } = useReels();
        const reel = this.reels.find((r) => r.idDoc === reelIdDoc);
        if (!reel) throw new Error('Reel no encontrado');

        const userLiked = reel.likes.some((like) => like.userId === userData.uid);
        if (userLiked) {
          await removeLike(reelIdDoc, userData);
        } else {
          await addLike(reelIdDoc, userData);
        }

        // Buscar el reel actualizado luego del cambio
        const updatedReel = this.reels.find((r) => r.idDoc === reelIdDoc);
        return { ...updatedReel }; // Devolver copia para nueva referencia reactiva
      } catch (err) {
        console.error('Error al alternar like:', err);
        throw err;
      }
    },
    // Incrementar visualizaciones de un reel
    async incrementView(reelIdDoc, userData) {
      try {
        const { incrementView } = useReels();
        const updatedReel = await incrementView(reelIdDoc, userData);

        // Actualizar el reel en el estado local
        const index = this.reels.findIndex((r) => r.idDoc === reelIdDoc);
        if (index !== -1) {
          this.reels[index] = { ...updatedReel };
        }

        return { ...updatedReel };
      } catch (err) {
        console.error('Error al incrementar visualización:', err);
        throw err;
      }
    },
    /**
     * Obtiene un reel por su idDoc.
     * @param {string} idDoc - El ID del documento del reel a buscar.
     * @returns {Promise<Object|null>} El objeto reel si se encuentra, o null si no.
     */
    async getByIdDoc(idDoc) {
      try {
        const { getReelByIdDoc } = useReels();
        const reel = await getReelByIdDoc(idDoc);
        return reel;
      } catch (err) {
        console.error('Error en el store al obtener reel por ID:', err);
        throw err;
      } finally {
      }
    },
    async getCount() {
      try {
          const { getAllReelsCount } = useReels();
          return await getAllReelsCount();
      } catch (error) {
          console.error('Error al obtener la cantidad de grupos en el store:', error);
          this.error = error.message || 'Error al obtener la cantidad de grupos en el store';
          throw error;
      }
    },
    async getDefaultCount() {
      try {
          const { getAllCount } = useDefaultReels();
          return await getAllCount();
      } catch (error) {
          console.error('Error al obtener la cantidad de grupos en el store:', error);
          this.error = error.message || 'Error al obtener la cantidad de grupos en el store';
          throw error;
      }
    },
},
});