import { defineStore } from 'pinia';
import { ref } from 'vue';
import { usePrivateChats } from '../composable/usePrivateChats';
import { useAuth } from '../api/auth/useAuth';
import { useStorage } from '../composable/useStorage';
import AvatarImage from '../assets/avatar1.jpg';

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
    photoCache: ref(new Map()), // Caché reactivo para fotos de perfil
  }),
  getters: {
    // Getter para obtener el email del otro usuario en un chat
    getOtherUserEmail: (state) => {
      const { user } = useAuth();
      const currentUserEmail = user.value?.email || null;

      return (chatId = null) => {
        const targetChatId = chatId || state.selectedChatId;
        if (!targetChatId) {
          return state.to || null;
        }

        const selectedChat = state.chats.value.find(chat => chat.idDoc === targetChatId);
        if (!selectedChat || !currentUserEmail) {
          return state.to || null;
        }

        return selectedChat.users.find(email => email !== currentUserEmail) || null;
      };
    },
    // Getter para obtener la URL de la foto de un usuario por chatId
    getUserPhoto: (state) => {
      return (chatId) => {
        const email = state.getOtherUserEmail(chatId);
        return state.photoCache.get(email) || AvatarImage;
      };
    },
  },
  actions: {
    // Obtener y cachear la foto de un usuario por email
    async fetchUserPhoto(email) {
      if (!email) return AvatarImage;
      if (this.photoCache?.has(email)) {
        return this.photoCache?.get(email);
      }

      try {
        const { getFileUrl } = useStorage();
        const fileUrl = await getFileUrl(`/profile/${email}.jpg`);
        const photoUrl = fileUrl && typeof fileUrl === 'string' && fileUrl.trim() ? fileUrl : AvatarImage;
        this.photoCache.set(email, photoUrl);
        return photoUrl;
      } catch (error) {
        // console.error(`Error fetching photo for ${email}:`, error);
        this.photoCache.set(email, AvatarImage);
        return AvatarImage;
      }
    },
    // Cargar fotos para todos los chats
    async loadChatPhotos() {
      if (!this.chats?.value) return;

      for (const chat of this.chats.value) {
        const email = this.getOtherUserEmail(chat.idDoc);
        if (email && !this.photoCache?.has(email)) {
          await this.fetchUserPhoto(email);
        }
      }
    },
    // Limpiar el caché de fotos
    clearPhotoCache() {
      this.photoCache?.clear();
    },
    initializeSubscription(email) {
      if (this.unsubscribe) {
        // console.log('Ya hay una suscripción activa, ignorando...');
        return;
      }

      this.loading = true;
      const { subscribeToPrivateChats } = usePrivateChats();
      this.unsubscribe = subscribeToPrivateChats(email, async (updatedChats) => {
        // console.log('Chats actualizados:', updatedChats);
        if (this.deletedChatId.length > 0) {
          updatedChats = updatedChats.filter(chat => !this.deletedChatId.includes(chat.idDoc));
        }
        this.chats.value = updatedChats ?? [];
        this.loading = false;
        // Cargar fotos después de actualizar los chats
        await this.loadChatPhotos();
      }, (err) => {
        this.error.value = err.message;
        this.loading = false;
        console.error('Error subscribing to chats:', err);
        this.unsubscribe = null;
      });
    },
    initializeUnsubscribe() {
      if (this.unsubscribe) {
        // console.log('Cancelando suscripción a chats...');
        this.unsubscribe();
        this.unsubscribe = null;
      } else {
        // console.log('No hay suscripción activa para cancelar.');
      }
      this.chats.value = [];
      this.loading = true;
      this.selectedChatId = null;
      this.clearPhotoCache(); // Limpiar caché al cerrar suscripción
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
        this.chats.value = this.chats.value.filter(chat => chat.idDoc !== chatId);
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
    async deleteAllChats() {
      try {
        const { deleteChat } = usePrivateChats();
        const chatIds = this.chats.value.map(chat => chat.idDoc);
        await Promise.all(chatIds.map(chatId => deleteChat(chatId)));
        this.chats.value = [];
        this.selectedChatId = null;
        this.deletedChatId = [];
        this.clearPhotoCache();
      } catch (err) {
        this.error.value = err.message;
        console.error('Error deleting all chats:', err);
      }
    },
  },
});