import { ref } from "vue";
import {
  getAuth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
// import { doc, onSnapshot, updateDoc } from "firebase/firestore";
// import { db } from "@/firebase"; // Asegúrate de importar tu instancia de Firestore

const auth = getAuth();

const AUTH_ERRORS_MESSAGES = {
  "auth/invalid-email": "El email no tiene un formato correcto.",
  "auth/internal-error": "Verifique los datos y vuelva a intentarlo",
  "auth/admin-restricted-operation":
  "Verifique los datos y vuelva a intentarlo",
  "auth/user-not-found": "El usuario no existe.",
  "auth/wrong-password": "La contraseña es incorrecta.",
  "auth/missing-email": "Debe ingresar el email, es obligatorio.",
  "auth/weak-password": "Contraseña débil, debe tener al menos 6 caracteres.",
};

const user = ref(null);
const isAuthenticated = ref(false);
const loading = ref(false);
const error = ref(null);

onAuthStateChanged(auth, (firebaseUser) => {
    user.value = firebaseUser;
    isAuthenticated.value = !!firebaseUser;
    console.log(firebaseUser)
//   if (firebaseUser) {
//     const userDocRef = doc(db, "users", firebaseUser.uid);
//     onSnapshot(
//       userDocRef,
//       (doc) => {
//         if (doc.exists()) {
//           user.value = { ...firebaseUser, ...doc.data() };
//         }
//       },
//       (error) => {
//         console.error("Error al obtener el documento del usuario:", error);
//       }
//     );
//   } else {
//     user.value = null;
//   }
});

const login = async (email, password) => {
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
};

const logout = async () => {
  loading.value = true;
  error.value = null;
  try {
    await signOut(auth);
  } catch (err) {
    error.value = err;
  } finally {
    loading.value = false;
  }
};

const doRegister = async (email, password) => {
  loading.value = true;
  error.value = null;

  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    // Aquí puedes añadir la lógica para crear el usuario en Firestore
    // await setDoc(doc(db, "users", user.uid), {
    //   // ... datos del usuario
    // });
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
};

const doUpdateProfile = async (profileData) => {
  loading.value = true;
  error.value = null;

  try {
    await updateProfile(auth.currentUser, profileData);

    // Actualiza los datos en Firestore
    await updateDoc(doc(db, "users", user.value.uid), profileData);

    return { success: true };
  } catch (err) {
    error.value = err;
    return { success: false };
  } finally {
    loading.value = false;
  }
};

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