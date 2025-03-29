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
import { useUsers } from '../../composable/useUsers';
import { firebaseApp } from '../../api/firebase/config';

const auth = getAuth(firebaseApp);
const { createUser, loadProfileInfo } = useUsers();

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
      debugger
    } else {
      user.value = null;
      isAuthenticated.value = false;
      localStorage.removeItem(AUTH_STORAGE_KEY); // Limpiar localStorage
    }
  });
};

// Login
async function login(email, password) {
  loading.value = true;
  error.value = null;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return true;
  } catch (err) {
    error.value = {
      code: err.code,
      message: AUTH_ERRORS_MESSAGES[err.code] || err.message,
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
    // console.log(newAuthUser);
    if (newAuthUser) {
      await createUser(newAuthUser.uid, {
        email: email,
        displayName: displayName,
      });
    }
    return true;
  } catch (err) {
    error.value = {
      code: err.code,
      message: AUTH_ERRORS_MESSAGES[err.code] || err.message,
    };
    return false;
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