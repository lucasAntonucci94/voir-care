import { ref } from 'vue';
import {
  getAuth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { getDatabase, ref as rtdbRef, set, onDisconnect, onValue } from 'firebase/database';
import { useUsers } from '../../composable/useUsers';
import { useUserStatus } from '../../composable/useUserStatus';
import { firebaseApp } from '../../api/firebase/config';
import { useThemeStore } from '../../stores/theme';
// Importamos Pinia para asegurarnos que el store esté disponible
import { getActivePinia } from 'pinia';
import { AppError } from '../../api/Exceptions/AppError';

// Inicializo la instancia de autenticación de Firebase
const auth = getAuth(firebaseApp);
const { createUser, loadProfileInfo, getEmailByDisplayName } = useUsers();
const userStatusComposable = useUserStatus();
// const groupsComposable = useGroups();
// Mensajes de error para autenticación
const AUTH_ERRORS_MESSAGES = {
  'auth/invalid-email': 'El email no tiene un formato correcto.',
  'auth/internal-error': 'Verifique los datos y vuelva a intentarlo',
  'auth/admin-restricted-operation': 'Verifique los datos y vuelva a intentarlo',
  'auth/user-not-found': 'El usuario no existe.',
  'auth/wrong-password': 'La contraseña es incorrecta.',
  'auth/missing-email': 'Debe ingresar el email, es obligatorio.',
  'auth/weak-password': 'Contraseña débil, debe tener al menos 6 caracteres.',
};

// Estado reactivo
const user = ref(null);
const isAuthenticated = ref(false);
const loading = ref(false);
const error = ref(null);

// Clave para localStorage
const AUTH_STORAGE_KEY = 'isAuthenticated';

// Función para inicializar el estado desde localStorage
const initializeAuthState = () => {
  const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
  isAuthenticated.value = storedAuth === 'true';
};

// Listener de autenticación de Firebase
const initializeAuthListener = () => {
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      user.value = firebaseUser; // Datos básicos de Firebase Auth
      isAuthenticated.value = true;
      localStorage.setItem(AUTH_STORAGE_KEY, 'true'); // Guardo en localStorage para asi poder mantener el estado autenticado cuando se reinicia la app. Por unos segundos pierde la autenticacion reactiva genenrando un mal fucionamiento en al redireccion.
      user.value = await loadProfileInfo(firebaseUser); // Cargar perfil completo, datos de collection users
      // Actualizar estado de autenticación en useUserStatus
      userStatusComposable.setAuthState(user.value, isAuthenticated.value);
      await userStatusComposable.updateUserStatus();
      // Verifica si Pinia está activo antes de usar el store
      const pinia = getActivePinia();
      if (pinia) {
        // Importa el store dinámicamente para evitar uso antes de inicialización
        const { useThemeStore } = await import('../../stores/theme');
        const themeStore = useThemeStore();
        // Inicializa el tema con la configuración del usuario en Firestore
        themeStore.initializeTheme(user.value?.configs?.theme || null);
      } else {
        console.warn('Pinia no está activo, omitiendo inicialización del tema');
      }
    } else {
      user.value = null;
      isAuthenticated.value = false;
      localStorage.removeItem(AUTH_STORAGE_KEY); // Limpiar localStorage
      
      // Verifica si Pinia está activo antes de usar el store
      const pinia = getActivePinia();
      if (pinia) {
        const { useThemeStore } = await import('../../stores/theme');
        const themeStore = useThemeStore();
        // Inicializa el tema sin configuración de usuario
        themeStore.initializeTheme();
      } else {
        console.warn('Pinia no está activo, omitiendo inicialización del tema');
      }
    }
  });
};

// Login
async function login(email, password, isEmail = true) {
  loading.value = true;
  error.value = null;
  try {
    if (!isEmail) {
      // Si no es un email, buscar el email asociado al displayName
      email = await getEmailByDisplayName(email);
    }
    await signInWithEmailAndPassword(auth, email, password);
    await userStatusComposable.updateUserStatus();
    return true;
  } catch (err) {
    error.value = {
      code: err instanceof AppError ? err.code : err.code || 'auth/unknown-error',
      message: err instanceof AppError ? err.message : AUTH_ERRORS_MESSAGES[err.code] || err.message,
    };
    return false;
  } finally {
    loading.value = false;
  }
}

// Logout
async function logout() {
  loading.value = true;
  error.value = null;
  try {
    // // Marcar como desconectado antes de cerrar sesión
    if (user.value?.uid) {
      const rtdb = getDatabase(firebaseApp);
      const rtdbStatusRef = rtdbRef(rtdb, `status/${user.value.uid}`);
      await set(rtdbStatusRef, { isOnline: false, email: user.value.email, lastActivity: Date.now() });
    }
    await signOut(auth);
    localStorage.removeItem(AUTH_STORAGE_KEY); // Limpiar al cerrar sesión
  } catch (err) {
    error.value = err;
  } finally {
    loading.value = false;
  }
}

// Registro
async function doRegister(displayName, email, password) {
  loading.value = true;
  error.value = null;
  try {
    const { user: newAuthUser } = await createUserWithEmailAndPassword(auth, email, password);
    debugger
    if (newAuthUser) {
      await createUser(newAuthUser.uid, {
        email: email,
        displayName: displayName,
      });
    }
     return  {
        id: newAuthUser?.uid,
        status: true,
      };
  } catch (err) {
    error.value = {
      code: err.code,
      message: AUTH_ERRORS_MESSAGES[err.code] || err.message,
    };
    return {status: false, error: error.value.message};
  } finally {
    loading.value = false;
  }
}

// Actualizar perfil
async function doUpdateProfile(profileData) {
  loading.value = true;
  error.value = null;
  try {
    await updateProfile(auth.currentUser, profileData);
    return { success: true };
  } catch (err) {
    error.value = err;
    return { success: false };
  } finally {
    loading.value = false;
  }
}

// Resetear contraseña
const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    error.value = null;
    return true;
  } catch (err) {
    error.value = err;
    return false;
  }
};

export function useAuth() {
  // Inicializar estado desde localStorage al cargar el composable
  if (!user.value && !isAuthenticated.value) {
    initializeAuthState(); // Chequear localStorage primero
    initializeAuthListener(); // Luego escuchar Firebase
  }

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    doRegister,
    doUpdateProfile,
    resetPassword,
  };
}