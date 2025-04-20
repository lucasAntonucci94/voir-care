import { ref } from 'vue';
import { getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, collection, query, where, limit, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useStorage } from './useStorage';
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
          photoPathFile: user.photoPathFile|| null,
          bannerUrlFile: user.bannerUrlFile || null,
          bannerPathFile: user.bannerPathFile || null,
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
        avatar: user.avatar || null,
        connections: user.connections || [],
        photoURLFile: user.photoURLFile|| null,
        photoPathFile: user.photoPathFile|| null,
        bannerUrlFile: user.bannerUrlFile || null,
        bannerPathFile: user.bannerPathFile || null,
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
        photoPathFile: data.photoURLFile|| null,
        avatar: data.avatar || null,
        bannerUrlFile: data.bannerUrlFile || null,
        bannerPathFile: data.bannerPathFile || null,
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
    try {
      const docRef = doc(db, 'users', id);
      const userData = {
        displayName: data.displayName,
        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',
        email: data.email ?? '',
        phoneNumber: data.phoneNumber ?? '',
        birthday: data.birthday ?? '',
        genre: data.genre ?? '',
        country: data.country ?? '',
        avatar: data.avatar || null,
        photoURLFile: data.photoURLFile || null,
        photoPathFile: data.photoPathFile || null,
        bannerUrlFile: data.bannerUrlFile || null,
        bannerPathFile: data.bannerPathFile || null,
      }
      await updateDoc(docRef, userData);
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
      const hiddenPostsPromise = getHiddenPostsForUser(firebaseUser.uid);

      const [photoURLFile, profile, hiddenPosts] = await Promise.all([
        photoURLFilePromise,
        userProfilePromise,
        hiddenPostsPromise,
      ]);

      const combinedData = {
        ...firebaseUser, // Datos de Firebase Auth
        photoURLFile,    // URL de la imagen desde Storage
        ...profile,      // Datos adicionales de Firestore
        hiddenPosts,
      };

      userProfile.value = combinedData; // Actualizamos el estado reactivo

      return combinedData;
    } catch (error) {
      console.error('Error al cargar el perfil del usuario:', error);
      throw error;
    }
  }

  /**
   * Agrega una conexión al array 'connections' del usuario autenticado
   * @param {string} currentUserId - ID del usuario autenticado
   * @param {Object} connectionData - Datos del usuario a seguir (uid, displayName, email)
   * @returns {Promise<void>}
   */
  async function addConnection(currentUserId, connectionData) {
    try {
      const userRef = doc(db, 'users', currentUserId);
      const connection = {
        uid: connectionData.uid,
        displayName: connectionData.displayName,
        email: connectionData.email,
        avatar: connectionData.avatar || null,
      };

      // Usamos arrayUnion para agregar la conexión al array 'connections' sin duplicados
      await updateDoc(userRef, {
        connections: arrayUnion(connection),
      });
      console.log(`Conexión con ${connectionData.displayName} agregada exitosamente`);
    } catch (error) {
      console.error('Error al agregar conexión:', error);
      throw error;
    }
  }

  /**
   * Elimina una conexión del array 'connections' del usuario autenticado
   */
  async function removeConnection(currentUserId, connectionData) {
    try {
      const userRef = doc(db, 'users', currentUserId);
      const connection = {
        uid: connectionData.uid,
        displayName: connectionData.displayName,
        email: connectionData.email,
        avatar: connectionData.avatar || null,
      };
      await updateDoc(userRef, {
        connections: arrayRemove(connection),
      });
      console.log(`Conexión con ${connectionData.displayName} eliminada exitosamente`);
    } catch (error) {
      console.error('Error al eliminar conexión:', error);
      throw error;
    }
  }

  /**
   * Obtiene los datos de un usuario por su ID
   * @param {string} id - ID del usuario
   * @returns {Promise<Object>} - Datos del usuario
   */
  async function getUser(id) {
    try {
      debugger
      const userRef = doc(db, 'users', id);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() };
      } else {
        throw new Error('Usuario no encontrado');
      }
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw error;
    }
  }

  /**
   * Actualiza solo las propiedades del banner de un usuario en Firestore
   * @param {string} id - ID del usuario
   * @param {Object} bannerData - Datos del banner { bannerUrlFile, bannerPathFile }
   * @returns {Promise<void>}
   */
  async function updateUserBanner(id, bannerData) {
    try {
      const docRef = doc(db, 'users', id);
      await updateDoc(docRef, {
        bannerUrlFile: bannerData.bannerUrlFile,
        bannerPathFile: bannerData.bannerPathFile,
      }); // Actualización parcial solo del banner
    } catch (error) {
      console.error('Error al actualizar el banner del usuario:', error);
      throw error;
    }
  }

  async function getHiddenPostsForUser(userId) {
    try {
      const hiddenPostsRef = collection(db, 'users', userId, 'hiddenPosts');
      const snapshot = await getDocs(hiddenPostsRef);
      const hiddenPosts = [];
      snapshot.forEach((doc) => {
        hiddenPosts.push({ id: doc.id, ...doc.data() });
      });
      return hiddenPosts;
    } catch (error) {
      console.error('Error al obtener los hiddenPosts:', error);
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
    addConnection,
    removeConnection,
    getUser,
    updateUserBanner
  };
}