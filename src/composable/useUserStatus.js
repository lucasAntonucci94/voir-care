import { ref, onUnmounted, watch } from 'vue';
import { getDatabase, ref as rtdbRef, set, onDisconnect, onValue } from 'firebase/database';
import { firebaseApp } from '../api/firebase/config';

// Inicializar Realtime Database
const rtdb = getDatabase(firebaseApp);

// Estado reactivo
const userStatus = ref({});
const loading = ref(false);
const error = ref(null);
const _user = ref(null);
const _isAuthenticated = ref(false);

export function useUserStatus({ user = ref(null), isAuthenticated = ref(false) } = {}) {
  // Actualizar los valores internos si se pasan parámetros
  _user.value = user.value;
  _isAuthenticated.value = isAuthenticated.value;

  // Función para actualizar el estado de conectividad del usuario actual
  const updateUserStatus = async () => {
    if (!_user.value || !_user.value.uid) {
      console.warn('No user UID available, skipping status update');
      return;
    }

    if (!navigator.onLine) {
      console.warn('No internet connection, skipping status update');
      error.value = new Error('No internet connection');
      return;
    }

    const rtdbStatusRef = rtdbRef(rtdb, `status/${_user.value.uid}`);
    try {
      // Establecer estado en línea
      await set(rtdbStatusRef, {
        isOnline: true,
        email: _user.value.email,
        lastActivity: Date.now(),
      });

      // Configurar onDisconnect para marcar como desconectado
      await onDisconnect(rtdbStatusRef).set({
        isOnline: false,
        email: _user.value.email,
        lastActivity: Date.now(),
      });
    } catch (err) {
      error.value = err;
      console.error('Error updating user status:', err);
    }
  };

  // Método para actualizar user e isAuthenticated desde fuera
  const setAuthState = (newUser, newIsAuthenticated) => {
    _user.value = newUser;
    _isAuthenticated.value = newIsAuthenticated;
  };

  // Escuchar el estado de un usuario específico
  const listenToUserStatus = (userId, callback) => {
    if (!userId) return () => {};

    const rtdbStatusRef = rtdbRef(rtdb, `status/${userId}`);
    const unsubscribe = onValue(rtdbStatusRef, (snapshot) => {
      if (snapshot.exists()) {
        userStatus.value[userId] = snapshot.val();
        callback?.(snapshot.val());
      } else {
        userStatus.value[userId] = { isOnline: false, lastActivity: null };
        callback?.({ isOnline: false, lastActivity: null });
      }
    }, (err) => {
      console.error('Error listening to user status:', err);
      error.value = err;
    });

    return unsubscribe;
  };

  // Escuchar el estado de múltiples usuarios
  const listenToMultipleUsersStatus = (userIds, callback) => {
    if (!userIds?.length) return () => {};

    const unsubscribes = userIds.map((userId) => listenToUserStatus(userId, callback));
    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  };

  // Inicializar estado del usuario cuando se autentica
  watch(() => _user.value?.uid, async (uid, oldUid) => {
    if (uid) {
      await updateUserStatus();
    } else if (oldUid && !uid) {
      // Limpiar estado al desconectar
    //   const rtdbStatusRef = rtdbRef(rtdb, `status/${oldUid}`);
    //   await set(rtdbStatusRef, { isOnline: false, lastActivity: Date.now() }).catch((err) => {
    //     console.error('Error clearing user status:', err);
    //   });
    }
  });

  // Escuchar cambios en la conexión del cliente
  const presenceRef = rtdbRef(rtdb, '.info/connected');
  const unsubscribePresence = onValue(presenceRef, async (snapshot) => {
    if (snapshot.val() && _user.value?.uid) {
      await updateUserStatus();
    }
  });

  // Limpiar listeners al desmontar el componente
  onUnmounted(() => {
    unsubscribePresence();
  });

  return {
    userStatus,
    loading,
    error,
    updateUserStatus,
    listenToUserStatus,
    listenToMultipleUsersStatus,
    setAuthState,
  };
}