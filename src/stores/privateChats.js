import { defineStore } from 'pinia';
import { ref } from 'vue';
import { usePrivateChats } from '../composable/usePrivateChats'; // Ajusta la ruta según tu estructura

export const usePrivateChatsStore = defineStore('privateChats', {
  state: () => ({
    chats: ref([]),
    selectedChatId: ref(null),
    loading: ref(true),
    error: ref(null),
    deletedChatId: ref([]),
  }),
  actions: {
    async initializeSubscription(email) {
      this.loading = true;
      const { subscribeToPrivateChats } = usePrivateChats();
      this.unsubscribe = subscribeToPrivateChats(email, (updatedChats) => {
        console.log('Chats actualizados:', updatedChats);
        debugger
        if (this.deletedChatId && Array.isArray(this.deletedChatId) && this.deletedChatId.length > 0) {
          updatedChats = updatedChats.filter(chat => !this.deletedChatId.includes(chat.idDoc));
        }
        debugger
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
    setDeletedChatId(chatId) {
      this.selectedChatId = chatId;
    },
    async deleteChat(chatId) {
      try {
        usePrivateChats().deleteChat(chatId);
        this.chats.value = this.chats.value.filter(chat => chat.idDoc !== chatId);
        debugger
        if (this.selectedChatId === chatId) {
          this.selectedChatId = null;
        }
        this.deletedChatId.push(chatId);
        debugger
      } catch (err) {
        this.error.value = err.message;
        console.error('Error deleting chat:', err);
      }
    },
  },
});