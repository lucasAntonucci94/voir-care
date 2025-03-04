import { defineStore } from 'pinia';
import { ref } from 'vue';
import { usePrivateChats } from '../composable/usePrivateChats'; // Ajusta la ruta según tu estructura

export const usePrivateChatsStore = defineStore('privateChats', {
  state: () => ({
    chats: ref([]),
    selectedChatId: ref(null),
    loading: ref(true),
    error: ref(null),
  }),
  actions: {
    async initializeSubscription(email) {
      this.loading = true;
      const { subscribeToPrivateChats } = usePrivateChats();
      this.unsubscribe = subscribeToPrivateChats(email, (updatedChats) => {
        console.log('Chats actualizados:', updatedChats);
        this.chats.value = updatedChats;
        this.loading = false;
      }, (err) => {
        this.error.value = err.message;
        this.loading = false;
        console.error('Error suscribing to chats:', err);
      });
    },
    unsubscribe() {
      if (this.unsubscribe) {
        console.log('Cancelando suscripción a chats...');
        this.unsubscribe();
        this.unsubscribe = null;
      }
    },
    setSelectedChatId(chatId) {
      this.selectedChatId = chatId;
    },
    async deleteChat(chatId) {
      if (confirm('¿Estás seguro de eliminar este chat?')) {
        try {
          const { db, deleteDoc, doc } = usePrivateChats(); // Añadimos acceso a Firebase desde el composable
          await deleteDoc(doc(db, 'chats-private', chatId));
          this.chats.value = this.chats.value.filter(chat => chat.idDoc !== chatId);
          if (this.selectedChatId === chatId) {
            this.selectedChatId = null;
          }
        } catch (err) {
          this.error.value = err.message;
          console.error('Error deleting chat:', err);
        }
      }
    },
  },
});