// stores/userStatus.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useUserStatus } from '../composable/useUserStatus';
import { useUsers } from '../composable/useUsers';
import { useAuth } from '../api/auth/useAuth';

export const useUserStatusStore = defineStore('userStatus', () => {
  const { listenToUserStatus } = useUserStatus();
  const { getUidsByEmails } = useUsers();
  const { user } = useAuth();

  // Estado reactivo
  const chatStatuses = ref(new Map()); // Mapa: { email: { uid, isOnline } }
  const unsubscribeStatuses = ref([]); // Array de funciones de desuscripción

  // Obtener el estado de conectividad de un usuario por email
  const getUserStatus = computed(() => (email) => {
    return chatStatuses.value.get(email)?.isOnline ?? false;
  });

  // Suscribirse a los estados de conectividad de múltiples usuarios por emails
  async function subscribeToUserStatuses(emails) {
    if (!emails?.length) return;

    // Eliminar duplicados
    const uniqueEmails = [...new Set(emails)];

    // Obtener UIDs
    const uids = await getUidsByEmails(uniqueEmails);
    if (!uids?.length) return;

    // Limpiar suscripciones existentes si los emails son diferentes
    const currentEmails = [...chatStatuses.value.keys()];
    if (JSON.stringify(currentEmails.sort()) !== JSON.stringify(uniqueEmails.sort())) {
      unsubscribeStatuses.value.forEach(unsubscribe => unsubscribe());
      unsubscribeStatuses.value = [];
      chatStatuses.value.clear();
    }

    // Suscribirse a los estados
    uids.forEach((uid) => {
      // Evitar suscribirse si ya está suscrito
      if (chatStatuses.value.has(uid.email)) return;

      const unsubscribe = listenToUserStatus(uid, (status) => {
        chatStatuses.value.set(status.email, {
          uid: uid.uid,
          isOnline: status?.isOnline ?? false,
        });
      });
      unsubscribeStatuses.value.push(unsubscribe);
    });
  }

  // Limpiar todas las suscripciones
  function clearSubscriptions() {
    unsubscribeStatuses.value.forEach(unsubscribe => unsubscribe());
    unsubscribeStatuses.value = [];
    chatStatuses.value.clear();
  }

  // Inicializar estados para una lista de chats
  async function initializeChatStatuses(chats) {
    if (!chats?.length) return;

    const emails = chats
      .map(chat => {
        const users = chat.users || [];
        return users.find(email => email !== user.value?.email) || '';
      })
      .filter(email => email);

    await subscribeToUserStatuses(emails);
  }

  return {
    chatStatuses,
    getUserStatus,
    subscribeToUserStatuses,
    clearSubscriptions,
    initializeChatStatuses,
  };
});