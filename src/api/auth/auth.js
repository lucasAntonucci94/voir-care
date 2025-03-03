import { ref } from 'vue';
import {
  getAuth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
// import { doc, getDoc, updateDoc } from 'firebase/firestore'; // Importamos Firestore
// import { db } from '../../firebase'; // Asegúrate de importar tu instancia de Firestore
import { useStorage } from '../../composable/useStorage'; // Composable de storage
import { useUsers } from '../../composable/useUsers'; // Composable de storage

const auth = getAuth();
const { getFileUrl } = useStorage();
const { getUserProfileByEmail } = useUsers();

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

onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    user.value = firebaseUser; // Establecemos inicialmente el usuario de auth
    isAuthenticated.value = true;
    await loadProfileInfo(); // Cargamos datos adicionales
  } else {
    user.value = null;
    isAuthenticated.value = false;
  }
});

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

async function doRegister(email, password) {
  loading.value = true;
  error.value = null;
  try {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
    // Aquí podrías inicializar datos en Firestore si lo deseas
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
    await updateDoc(doc(db, 'users', user.value.uid), profileData);
    return { success: true };
  } catch (err) {
    error.value = err;
    return { success: false };
  } finally {
    loading.value = false;
  }
}
/**
 * Carga la información completa del perfil del usuario desde Storage y Firestore.
 * Actualiza el ref 'user' con datos combinados de auth, storage y Firestore.
 */
async function loadProfileInfo() {
  if (!user.value) return; // Si no hay usuario, no hacemos nada

  try {
    // Promesa para obtener la URL de la imagen desde Storage
    const photoURLFilePromise = user.value.photoURL
      ? getFileUrl(user.value.photoURL)
      : Promise.resolve(null);

    // Promesa para obtener datos adicionales desde Firestore usando useUsers
    const userProfilePromise = getUserProfileByEmail(user.value.email);

    // Esperamos ambas promesas
    const [photoURLFile, userProfile] = await Promise.all([
      photoURLFilePromise,
      userProfilePromise,
    ]);
    // Combinamos todos los datos en user.value
    user.value = {
      ...user.value, // Datos de Firebase Auth
      photoURLFile,  // URL de la imagen desde Storage
      ...userProfile, // Datos adicionales de Firestore desde useUsers
    };
  } catch (err) {
    console.error('Error al cargar el perfil del usuario:', err);
    error.value = err; // Guardamos el error para manejarlo si es necesario
  }
}

export function useAuth() {
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