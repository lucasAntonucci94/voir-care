import { defineStore } from 'pinia';
import { ref } from 'vue';
import { usePrivateChats } from '../composable/usePrivateChats';

export const usePrivateChatsStore = defineStore('privateChats', {
  state: () => ({
    chats: ref([]),
    selectedChatId: ref(null),
    loading: ref(true),
    error: ref(null),
    deletedChatId: ref([]),
    unsubscribe: ref(null), // Usamos ref para mayor control
  }),
  actions: {
    initializeSubscription(email) {
      // Verificación más estricta: solo ignoramos si unsubscribe es una función válida
      if (typeof this.unsubscribe === 'function') {
        console.log('Ya hay una suscripción activa, ignorando...');
        debugger
        this.unsubscribe();
        // return; // No necesitamos retornar, ya que unsubscribe se encarga de limpiar
      }

      this.loading = true;
      const { subscribeToPrivateChats } = usePrivateChats();
      this.unsubscribe = subscribeToPrivateChats(email, (updatedChats) => {
        console.log('Chats actualizados:', updatedChats);
        if (this.deletedChatId.length > 0) {
          updatedChats = updatedChats.filter(chat => !this.deletedChatId.includes(chat.idDoc));
        }
        this.chats.value = updatedChats;
        this.loading = false;
      }, (err) => {
        this.error.value = err.message;
        this.loading = false;
        console.error('Error subscribing to chats:', err);
        this.unsubscribe = null; // Limpiamos en caso de error
      });
      debugger
    },
    unsubscribe() {
      debugger
      if (typeof this.unsubscribe === 'function') {
        console.log('Cancelando suscripción a chats...');
        this.unsubscribe();
      }
      this.unsubscribe = null; // Siempre seteamos a null después de cancelar
      this.chats.value = [];
      this.loading = true;
    },
    setSelectedChatId(chatId) {
      this.selectedChatId = chatId;
    },
    setDeletedChatId(chatId) {
      if (!this.deletedChatId.includes(chatId)) {
        this.deletedChatId.push(chatId);
      }
    },
    async deleteChat(chatId) {
      try {
        const { deleteChat } = usePrivateChats();
        await deleteChat(chatId);
        this.chats.value = this.chats.value.filter(chat => chat.idDoc !== chatId);
        if (this.selectedChatId === chatId) {
          this.selectedChatId = null;
        }
        this.setDeletedChatId(chatId);
      } catch (err) {
        this.error.value = err.message;
        console.error('Error deleting chat:', err);
      }
    },
    async deleteMessage(chatId, messageId) {
      try {
        const { deleteChatMessage } = usePrivateChats();
        await deleteChatMessage(chatId, messageId);
      } catch (err) {
        this.error.value = err.message;
        console.error('Error deleting message:', err);
      }
    },
  },
});