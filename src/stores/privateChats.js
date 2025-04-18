import { defineStore } from 'pinia';
import { ref } from 'vue';
import { usePrivateChats } from '../composable/usePrivateChats';

export const usePrivateChatsStore = defineStore('privateChats', {
    state: () => ({
      chats: ref([]),
      selectedChatId: ref(null),
      from: ref(null),
      to: ref(null),
      loading: ref(true),
      error: ref(null),
      deletedChatId: ref([]),
      unsubscribe: ref(null),
    }),
    actions: {
      initializeSubscription(email) {
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
          this.chats.value = updatedChats ?? [];
          this.loading = false;
        }, (err) => {
          this.error.value = err.message;
          this.loading = false;
          console.error('Error subscribing to chats:', err);
          this.unsubscribe = null;
        });
      },
      initializeUnsubscribe() {
        if (this.unsubscribe) {
          console.log('Cancelando suscripción a chats...');
          this.unsubscribe();
          this.unsubscribe = null;
        } else {
          console.log('No hay suscripción activa para cancelar.');
        }
        this.chats.value = [];
        this.loading = true;

      },
      setSelectedChatId(chatId) {
        this.selectedChatId = chatId;
      },
      setFromEmail(email) {
        this.from = email;
      },
      setToEmail(email) {
        this.to = email;
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
          this.chats.value = this.chats.value
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