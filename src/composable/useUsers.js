import { ref } from 'vue';
import { getFirestore, doc, setDoc, getDocs, updateDoc, collection, query, where, limit } from 'firebase/firestore';
import { useStorage } from './useStorage'; // Ajusta la ruta según tu estructura
import { usePosts } from '../composable/usePosts';

const db = getFirestore();
const usersRef = collection(db, 'users');
const { getFileUrl } = useStorage();
const { updateUserFromPost } = usePosts();
// Estado reactivo para el perfil del usuario (opcional, dependiendo de cómo quieras usarlo)
const userProfile = ref(null);

export function useUsers() {
  /**
   * Retorna un listado de usuarios a partir de los filtros establecidos
   * @returns {Promise<Array>} - Lista de usuarios
   */
  async function getAllUsers() {
    try {
      const users = [];
      const q = query(usersRef);
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        const user = doc.data();
        users.push({
          uid: userDoc.id,
          email: user.email,
          displayName: user.displayName,
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          phoneNumber: user.phoneNumber || null,
          genre: user.genre || null,
          birthday: user.birthday || null,
          country: user.country || null,
          photoURLFile: user.photoURLFile|| null,
          avatar: user.avatar || null,
          isAdmin: user.isAdmin || false,
        });
      });

      return users;
    } catch (error) {
      console.error('Error al obtener todos los usuarios:', error);
      throw error;
    }
  }

  /**
   * Obtiene el perfil de un usuario por email
   * @param {string} email - Email del usuario
   * @returns {Promise<Object|null>} - Datos del perfil o null si no existe
   */
  async function getUserProfileByEmail(email) {
    try {
      const queryUser = query(usersRef, where('email', '==', email), limit(1));
      const snapshot = await getDocs(queryUser);

      if (snapshot.empty) return null;

      const userDoc = snapshot.docs[0];
      const user = userDoc.data();
      return {
        uid: userDoc.id,
        email: user.email,
        displayName: user.displayName,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        phoneNumber: user.phoneNumber || null,
        genre: user.genre || null,
        birthday: user.birthday || null,
        country: user.country || null,
        photoURLFile: user.photoURLFile|| null,
        avatar: user.avatar || null,
        isAdmin: user.isAdmin || false,
      };
    } catch (error) {
      console.error('Error al obtener el perfil por email:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo usuario en Firestore
   * @param {string} id - ID del usuario (normalmente el UID de Firebase Auth)
   * @param {Object} data - Datos del usuario (email, displayName, etc.)
   * @returns {Promise<void>}
   */
  async function createUser(id, data) {
    try {
      const docRef = doc(db, 'users', id);
      await setDoc(docRef, {
        email: data.email,
        displayName: data.displayName,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        phoneNumber: data.phoneNumber || null,
        genre: data.genre || null,
        birthday: data.birthday || null,
        country: data.country || null,
        photoURLFile: data.photoURLFile|| null,
        avatar: data.avatar || null,
        isAdmin: data.isAdmin || false,
      });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  /**
   * Actualiza los datos de un usuario en Firestore
   * @param {string} id - ID del usuario
   * @param {Object} data - Datos a actualizar (displayName, firstName, etc.)
   * @returns {Promise<void>}
   */
  async function updateUser(id, data) {
    debugger
    try {
      const docRef = doc(db, 'users', id);
      const userData = {
        displayName: data.displayName,
        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',
        phoneNumber: data.phoneNumber ?? '',
        birthday: data.birthday ?? '',
        genre: data.genre ?? '',
        country: data.country ?? '',
        avatar: data.avatar || null,
        photoURLFile: data.photoURLFile || null,
      }
      await updateDoc(docRef, userData);
      debugger
      await updateUserFromPost(id, userData)
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  /**
   * Carga la información completa del perfil del usuario desde Storage y Firestore.
   * @param {Object} firebaseUser - Objeto del usuario de Firebase Auth
   * @returns {Promise<Object>} - Datos combinados del usuario
   */
  async function loadProfileInfo(firebaseUser) {
    if (!firebaseUser) return null;

    try {
      const photoURLFilePromise = firebaseUser.photoURL
        ? getFileUrl(firebaseUser.photoURL)
        : Promise.resolve(null);

      const userProfilePromise = getUserProfileByEmail(firebaseUser.email);

      const [photoURLFile, profile] = await Promise.all([
        photoURLFilePromise,
        userProfilePromise,
      ]);

      const combinedData = {
        ...firebaseUser, // Datos de Firebase Auth
        photoURLFile,    // URL de la imagen desde Storage
        ...profile,      // Datos adicionales de Firestore
      };

      userProfile.value = combinedData; // Actualizamos el estado reactivo
      return combinedData;
    } catch (error) {
      console.error('Error al cargar el perfil del usuario:', error);
      throw error;
    }
  }

  return {
    userProfile, // Estado reactivo opcional
    getAllUsers,
    getUserProfileByEmail,
    createUser,
    updateUser,
    loadProfileInfo,
  };
}