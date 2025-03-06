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
        // Verificación más estricta: solo ignoramos si unsubscribe ya tiene un valor (suscripción activa)
        if (this.unsubscribe) {
          console.log('Ya hay una suscripción activa, ignorando...');
          return;
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
      },
      initializeUnsubscribe() {
        debugger
        if (this.unsubscribe) { // Check if unsubscribe is not null before calling
          debugger
          console.log('Cancelando suscripción a chats...');
          this.unsubscribe();
          this.unsubscribe = null; // Set to null immediately after calling to prevent further calls
        } else {
          console.log('No hay suscripción activa para cancelar.');
        }
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