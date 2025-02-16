import { ref, reactive } from 'vue';
import { getAuth, onAuthStateChanged } from "firebase/auth";

const auth = getAuth();

const authState = reactive({
  isAuthenticated: false,
  user: null, // Para almacenar información del usuario
});

// Observador de Firebase Auth
onAuthStateChanged(auth, (user) => {
  authState.user = user; // Actualiza la info del usuario
  authState.isAuthenticated = !!user; // !! transforma user a booleano
});

export const useAuthState = () => {
  return authState;
};