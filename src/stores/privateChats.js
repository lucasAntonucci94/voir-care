import { defineStore } from 'pinia';
import { ref } from 'vue';
import { usePrivateChats } from '../composable/usePrivateChats';
import { useAuth } from '../api/auth/useAuth';

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
  getters: {
    // Getter para obtener el email del otro usuario en un chat
    getOtherUserEmail: (state) => {
      const { user } = useAuth(); // Obtener el usuario autenticado desde useAuth
      const currentUserEmail = user.value?.email || null;

      return (chatId = null) => {
        // Usar chatId proporcionado o fallback a selectedChatId
        const targetChatId = chatId || state.selectedChatId;
        if (!targetChatId) {
          return state.to || null; // Fallback a 'to' si no hay chatId
        }

        const selectedChat = state.chats.value.find(chat => chat.idDoc === targetChatId);
        if (!selectedChat || !currentUserEmail) {
          return state.to || null; // Fallback si no hay chat o usuario autenticado
        }

        return selectedChat.users.find(email => email !== currentUserEmail) || null;
      };
    },
  },
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
      this.selectedChatId = null;
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
        this.setDeletedChatId(chatId);
        const { deleteChat } = usePrivateChats();
        await deleteChat(chatId);
        this.chats.value = this.chats.value.filter(chat => chat.idDoc !== chatId); // Actualizar chats
        if (this.selectedChatId === chatId) {
          this.selectedChatId = null;
        }
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
    async markChatAsReaded(userEmail, chatId) {
      const { markChatAsRead } = usePrivateChats();
      await markChatAsRead(userEmail, chatId);
      this.markChatAsReadInStore(chatId, userEmail);
    },
    markChatAsReadInStore(chatId, userEmail) {
      const chat = this.chats.value.find(chat => chat.idDoc === chatId);
      if (chat && chat.unreadCount && chat.unreadCount[userEmail] !== undefined) {
        chat.unreadCount[userEmail] = 0;
      }
    },
  },
});