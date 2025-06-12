import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useReels } from '../composable/useReels';
import { useDefaultReels } from '../composable/useDefaultReels';

export const useReelsStore = defineStore('reels', {
  state: () => {
    const reels = ref([]);
    const defaultReels = ref([]);
    const isLoading = ref(true);
    const unsubscribe = ref(null);
    const unsubscribeDefaultReels = ref(null);

    return {
      reels,
      defaultReels,
      isLoading,
      unsubscribe,
      unsubscribeDefaultReels,
    };
  },
  actions: {
    // Suscribirse a los reels en tiempo real
    subscribeToReels() {
      if (this.unsubscribe) {
        console.log('Suscripción a reels ya activa, ignorando...');
        return;
      }
      console.log('Iniciando suscripción a reels...');
      const { subscribeToIncomingReels } = useReels();
      this.unsubscribe = subscribeToIncomingReels((updatedReels) => {
        console.log('Reels recibidos desde Firebase:', updatedReels);
        this.reels = updatedReels;
        this.isLoading = false;
      });
    },
    // Cancelar la suscripción
    unsubscribeFromReels() {
      if (this.unsubscribe) {
        console.log('Cancelando suscripción a reels...');
        this.unsubscribe();
        this.unsubscribe = null;
      }
    },
    // Subscribe to default reels
    subscribeToDefaultReels() {
      if (this.unsubscribeDefaultReels) {
        console.log('Default reels subscription already active, ignoring...');
        return;
      }
      console.log('Initiating subscription to default reels...');
      const { subscribeToDefaultReels } = useDefaultReels();
      this.unsubscribeDefaultReels = subscribeToDefaultReels((updatedDefaultReels) => {
        this.defaultReels = updatedDefaultReels;
        console.log('Default reels received from Firebase:', updatedDefaultReels);
      });
    },
    // Cancelar la suscripción a default reels
    unsubscribeFromDefaultReels() {
      if (this.unsubscribeDefaultReels) {
        console.log('Cancelando suscripción a default reels...');
        this.unsubscribeDefaultReels();
        this.unsubscribeDefaultReels = null;
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
      console.log('Añadiendo nuevo reel:', newReelData);
      const { saveReel } = useReels();
      const reelData = {
        user: newReelData.user,
        title: newReelData.title,
        file: newReelData.file,
        mediaType: newReelData.mediaType,
        thumbnail: newReelData.thumbnail,
      };
      await saveReel(reelData);
    },
    // Eliminar un reel
    async deleteReel(reelIdDoc) {
      console.log('Eliminando reel con idDoc:', reelIdDoc);
      const { deleteReel } = useReels();
      await deleteReel(reelIdDoc);
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
  },
});