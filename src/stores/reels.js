import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useReels } from '../composable/useReels';

export const useReelsStore = defineStore('reels', {
  state: () => {
    const reels = ref([]);
    const isLoading = ref(true);
    const unsubscribe = ref(null);

    return {
      reels,
      isLoading,
      unsubscribe,
    };
  },
  actions: {
    // Suscribirse a los reels en tiempo real
    subscribeToReels() {
        debugger
      if (this.unsubscribe) {
        console.log('Suscripción a reels ya activa, ignorando...');
        return;
      }
      console.log('Iniciando suscripción a reels...');
      const { subscribeToIncomingReels } = useReels();
      this.unsubscribe = subscribeToIncomingReels((updatedReels) => {
        console.log('Reels recibidos desde Firebase:', updatedReels);
        debugger
        this.reels = updatedReels;
        this.isLoading = false;
      });
    },

    // Cancelar la suscripción
    unsubscribeFromReels() {
      if (this.unsubscribe?.value) {
        console.log('Cancelando suscripción a reels...');
        this.unsubscribe.value();
        this.unsubscribe.value = null;
      }
    },

    // Añadir un nuevo reel
    async addReel(newReelData) {
        debugger
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
      const { addLike, removeLike } = useReels();
      const reel = this.reels.value.find((r) => r.idDoc === reelIdDoc);
      if (!reel) return;

      const userLiked = reel.likes.some((like) => like.userId === userData.id);
      if (userLiked) {
        await removeLike(reelIdDoc, userData);
      } else {
        await addLike(reelIdDoc, userData);
      }
    },
  },
});