// composables/auth.js
import { ref } from 'vue';
import {
  getAuth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { useUsers } from '../../composable/useUsers';

const auth = getAuth();
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

const user = ref(null);
const isAuthenticated = ref(false);
const loading = ref(false);
const error = ref(null);

// Listener de autenticación
const initializeAuthListener = () => {
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      user.value = firebaseUser; // Solo datos de Firebase Auth
      isAuthenticated.value = true;
      user.value = await loadProfileInfo(firebaseUser)
    } else {
      user.value = null;
      isAuthenticated.value = false;
    }
  });
};

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

async function logout() {
  loading.value = true;
  error.value = null;
  try {
    await signOut(auth);
  } catch (err) {
    error.value = err;
  } finally {
    loading.value = false;
  }
}

async function doRegister(displayName, email, password) {
  loading.value = true;
  error.value = null;
  debugger
  try {
    const { user: newAuthUser } = await createUserWithEmailAndPassword(auth, email, password);
    console.log(newAuthUser)
    debugger
    if(newAuthUser){
      await createUser(newAuthUser.uid,{
        email: email,
        displayName: displayName,
      })
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

export function useAuth() {
  if (!user.value && !isAuthenticated.value) {
    initializeAuthListener();
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
  };
}