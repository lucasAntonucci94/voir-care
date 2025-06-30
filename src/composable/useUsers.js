import { ref } from 'vue';
import { getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, collection, query, where, limit, arrayUnion, arrayRemove, onSnapshot,deleteDoc } from 'firebase/firestore';
import { useStorage } from './useStorage';
import { usePosts } from '../composable/usePosts';
import { useAuth } from '../api/auth/useAuth'
import { AppError } from '../api/Exceptions/AppError';

const db = getFirestore();
const usersRef = collection(db, 'users');
const { getFileUrl } = useStorage();
const { updateUserFromPost } = usePosts();
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
          uid: doc.id,
          email: user.email,
          displayName: user.displayName,
          displayNameNormalized: user.displayNameNormalized || user.displayName.toLowerCase().trim(),
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          phoneNumber: user.phoneNumber || null,
          genre: user.genre || null,
          birthday: user.birthday || null,
          country: user.country || null,
          photoURLFile: user.photoURLFile || null,
          photoPathFile: user.photoPathFile || null,
          bannerUrlFile: user.bannerUrlFile || null,
          bannerPathFile: user.bannerPathFile || null,
          avatar: user.avatar || null,
          isAdmin: user.isAdmin || false,
          isBlocked: user.isBlocked || false,
          isSuscribed: user.isSuscribed || false,
          configs: user.configs || {},
          socialNetwork: user.socialNetwork || [],
        });
      });

      return users;
    } catch (error) {
      console.error('Error al obtener todos los usuarios:', error);
      throw error;
    }
  }

  /**
   * Escucha los usuarios en tiempo real.
   * @param {function} callback - Función que recibe un array de usuarios
   * @returns {function} - Función para cancelar la suscripción
   */
  function subscribeToUsers(callback) {
    try {
      const q = query(usersRef);
      return onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        }));
        callback(users);
      }, (error) => {
        console.error('Error al suscribirse a usuarios:', error);
        throw error;
      });
    } catch (err) {
      console.error('Error al suscribirse a usuarios:', err);
      throw err;
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
        displayNameNormalized: user.displayNameNormalized || user.displayName.toLowerCase().trim(),
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        phoneNumber: user.phoneNumber || null,
        genre: user.genre || null,
        birthday: user.birthday || null,
        country: user.country || null,
        avatar: user.avatar || null,
        connections: user.connections || [],
        photoURLFile: user.photoURLFile || null,
        photoPathFile: user.photoPathFile || null,
        bannerUrlFile: user.bannerUrlFile || null,
        bannerPathFile: user.bannerPathFile || null,
        isAdmin: user.isAdmin || false,
        isBlocked: user.isBlocked || false,
        isSuscribed: user.isSuscribed || false,
        configs: user.configs || {},
        socialNetwork: user.socialNetwork || [],
      };
    } catch (error) {
      console.error('Error al obtener el perfil por email:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene el displayName de un usuario por su email
   * @param {string} email - Email del usuario
   * @returns {Promise<string>} - DisplayName del usuario
   */
  async function getEmailByDisplayName(displayName) {
    try {
      if (!displayName) {
        throw new AppError('Este campo es obligatorio', { code: 'MISSING_DISPLAY_NAME' });
      }
      const queryUser = query(usersRef, where('displayNameNormalized', '==', displayName.trim().toLowerCase()), limit(1));
      const snapshot = await getDocs(queryUser);

      if (snapshot.empty) {
        throw new AppError('Usuario no encontrado por nombre de usuario: ' + displayName, { code: 'USER_NOT_FOUND' });
      }

      const userDoc = snapshot.docs[0];
      const user = userDoc.data();
      return user.email;
    } catch (error) {
      console.error('Error al obtener el displayName por email:', error);
      throw error instanceof AppError ? error : new AppError(error.message, { code: 'UNKNOWN_ERROR' });
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
        displayNameNormalized: data.displayName?.toLowerCase()?.trim(),
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        phoneNumber: data.phoneNumber || null,
        genre: data.genre || null,
        birthday: data.birthday || null,
        country: data.country || null,
        photoURLFile: data.photoURLFile || null,
        photoPathFile: data.photoPathFile || null,
        avatar: data.avatar || null,
        bannerUrlFile: data.bannerUrlFile || null,
        bannerPathFile: data.bannerPathFile || null,
        isAdmin: data.isAdmin || false,
        isBlocked: false,
        isSuscribed: false,
        configs: {theme: 'light'},
        connections: [],
        socialNetwork: [],
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
        displayNameNormalized: data.displayName?.toLowerCase()?.trim(),
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
        isBlocked: data.isBlocked || false,
        isSuscribed: data.isSuscribed || false,
        configs: data.configs || {},
        configs: data.configs || {},
        socialNetwork: data.socialNetwork || [],
      };
      await updateDoc(docRef, userData);
      await updateUserFromPost(id, userData);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  /**
   * Elimina un usuario de Firestore
   * @param {string} id - ID del usuario
   * @returns {Promise<void>}
   */
  async function deleteUser(id) {
    try {
      const userRef = doc(db, 'users', id);
      await deleteDoc(userRef);
      // console.log(`Usuario con ID ${id} eliminado exitosamente`);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }

  /**
   * Realiza un borrado lógico de un usuario en Firestore estableciendo isDeleted en true
   * @param {string} id - ID del usuario
   * @returns {Promise<void>}
   */
  async function softDelete(id) {
    try {
      const userRef = doc(db, 'users', id);
      await updateDoc(userRef, {
        isDeleted: true,
        deletedAt: new Date().toISOString(), // Opcional: registra la fecha de eliminación
      });
      // console.log(`Usuario con ID ${id} marcado como eliminado exitosamente`);
    } catch (error) {
      console.error('Error al realizar borrado lógico del usuario:', error);
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
    // const { fetchSavedPosts } = useSavedGroupPosts();
    try {
      const photoURLFilePromise = firebaseUser.photoURL
        ? getFileUrl(firebaseUser.photoURL)
        : Promise.resolve(null);

      const userProfilePromise = getUserProfileByEmail(firebaseUser.email);
      const hiddenPostsPromise = getHiddenPostsForUser(firebaseUser.uid);
      const hiddenGroupPostsPromise = getHiddenGroupPostsForUser(firebaseUser.uid);
      const hiddenEventPostsPromise = getHiddenEventPostsForUser(firebaseUser.uid);
      // const savedGroupPostsPromise = fetchSavedPosts(firebaseUser.uid);

      const [photoURLFile, profile, hiddenPosts, hiddenGroupPosts, hiddenEventPosts, savedGroupPosts] = await Promise.all([
        photoURLFilePromise,
        userProfilePromise,
        hiddenPostsPromise,
        hiddenGroupPostsPromise,
        hiddenEventPostsPromise,
        // savedGroupPostsPromise,
      ]);

      const combinedData = {
        ...firebaseUser,
        photoURLFile,
        ...profile,
        hiddenPosts,
        hiddenGroupPosts,
        hiddenEventPosts,
        savedGroupPosts,
      };

      userProfile.value = combinedData;

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

      await updateDoc(userRef, {
        connections: arrayUnion(connection),
      });
      // console.log(`Conexión con ${connectionData.displayName} agregada exitosamente`);
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
      // console.log(`Conexión con ${connectionData.displayName} eliminada exitosamente`);
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
      });
    } catch (error) {
      console.error('Error al actualizar el banner del usuario:', error);
      throw error;
    }
  }
  
  /**
   * Bloquea a un usuario de forma global (sera ejecutado por el admin)
   * @param {string} id - ID del usuario
   * @param {boolean} isBlocked - true para bloquear, false para desbloquear
   * @returns {Promise<void>}
   */
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

  /**
   * Bloquea a un usuario de forma global (sera ejecutado por el admin)
   * @param {string} id - ID del usuario
   * @param {boolean} isBlocked - true para bloquear, false para desbloquear
   * @returns {Promise<void>}
   */
  async function getHiddenGroupPostsForUser(userId) {
    try {
      const hiddenGroupPostsRef = collection(db, 'users', userId, 'hiddenGroupPosts');
      const snapshot = await getDocs(hiddenGroupPostsRef);
      const hiddenGroupPosts = [];
      snapshot.forEach((doc) => {
        hiddenGroupPosts.push({ id: doc.id, ...doc.data() });
      });
      return hiddenGroupPosts;
    } catch (error) {
      console.error('Error al obtener los hiddenGroupPosts:', error);
      throw error;
    }
  }

  /**
   * Bloquea a un usuario de forma global (sera ejecutado por el admin)
   * @param {string} id - ID del usuario
   * @param {boolean} isBlocked - true para bloquear, false para desbloquear
   * @returns {Promise<void>}
   */
  async function getHiddenEventPostsForUser(userId) {
    try {
      const hiddenEventPostsRef = collection(db, 'users', userId, 'hiddenEventPosts');
      const snapshot = await getDocs(hiddenEventPostsRef);
      const hiddenEventPosts = [];
      snapshot.forEach((doc) => {
        hiddenEventPosts.push({ id: doc.id, ...doc.data() });
      });
      return hiddenEventPosts;
    } catch (error) {
      console.error('Error al obtener los hiddenEventPosts:', error);
      throw error;
    }
  }
  
  /**
   * Bloquea a un usuario de forma global (sera ejecutado por el admin)
   * @param {string} id - ID del usuario
   * @param {boolean} isBlocked - true para bloquear, false para desbloquear
   * @returns {Promise<void>}
   */
  async function getUserIdByEmail(email) {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) throw new Error('Usuario no encontrado con email: ' + email);

    return snapshot.docs[0].id;
  }
  
  /**
   * Bloquea a un usuario de forma global
   * @param {string} id - ID del usuario
   * @param {boolean} isBlocked - true para bloquear, false para desbloquear
   * @returns {Promise<void>}
   */
  async function blockUserGlobally(id, isBlocked) {
    try {
      // verifico que exista usuario logueado
      const { user: authUser } = useAuth();
      if (!authUser.value) throw new Error('No hay usuario autenticado');
      
      // Verifico que el usuario logueado sea admin
      const currentUserDoc = await getDoc(doc(db, 'users', authUser.value.uid));
      if (!currentUserDoc.exists() || !currentUserDoc.data().isAdmin) {
        throw new Error('Solo los administradores pueden bloquear globalmente');
      }  
      // Actualizo propiedad isBlocked en Firestore
      const userRef = doc(db, 'users', id);
      await updateDoc(userRef, {
        isBlocked: isBlocked,
      });
      // console.log(`Usuario con ID ${id} ${isBlocked ? 'bloqueado' : 'desbloqueado'} exitosamente`);
    } catch (error) {
      console.error('Error al bloquear usuario:', error);
      throw error;
    }
  }
  
  /**
   * Bloquea a un usuario individualmente
   * @param {string} targetId - ID del usuario a bloquear
   * @returns {Promise<void>}
   */
  async function blockUserIndividually(targetId) {
    try {
      // verifico que exista usuario logueado
      const { user: authUser } = useAuth();
      if (!authUser.value) throw new Error('No hay usuario autenticado');
      
      if (authUser.value.uid === targetId) throw new Error('No puedes bloquearte a ti mismo');

      const targetRef = doc(db, 'users', targetId);
      await updateDoc(targetRef, {
        blockedBy: arrayUnion(authUser.value.uid),
      });
      // console.log(`Usuario con ID ${targetId} bloqueado por ${authUser.value.uid}`);
    } catch (error) {
      console.error('Error al bloquear usuario individualmente:', error);
      throw error;
    }
  }

  /**
   * Desbloquea a un usuario individualmente
   * @param {string} targetId - ID del usuario a desbloquear
   * @returns {Promise<void>}
   */
  async function unblockUserIndividually(targetId) {
    try {
      // verifico que exista usuario logueado
      const { user: authUser } = useAuth();
      if (!authUser.value) throw new Error('No hay usuario autenticado');
      
      if (!authUser.value) throw new Error('No hay usuario autenticado');

      const targetRef = doc(db, 'users', targetId);
      await updateDoc(targetRef, {
        blockedBy: arrayRemove(authUser.value.uid),
      });
      // console.log(`Usuario con ID ${targetId} desbloqueado por ${authUser.value.uid}`);
    } catch (error) {
      console.error('Error al desbloquear usuario individualmente:', error);
      throw error;
    }
  }

  /**
   * Bloquea a un usuario de forma global (sera ejecutado por el admin)
   * @param {string} id - ID del usuario
   * @param {boolean} isSuscribed - true para suscribir, false para desuscribir
   * @returns {Promise<void>}
   */
  async function suscribeUser(id, isSuscribed) {
    try {
      // verifico que exista usuario logueado
      const { user: authUser } = useAuth();
      if (!authUser.value) throw new Error('No hay usuario autenticado');
      
      // Verifico que el usuario logueado sea admin
      const currentUserDoc = await getDoc(doc(db, 'users', authUser.value.uid));
      if (!currentUserDoc.exists() || !currentUserDoc.data().isAdmin) {
        throw new Error('Solo los administradores pueden bloquear globalmente');
      }  
      // Actualizo propiedad isSuscribed en Firestore
      const userRef = doc(db, 'users', id);
      await updateDoc(userRef, {
        isSuscribed: isSuscribed,
      });
      // console.log(`Usuario con ID ${id} ${isSuscribed ? 'suscripto' : 'desuscripto'} exitosamente`);
    } catch (error) {
      console.error('Error al suscribir usuario:', error);
      throw error;
    }
  }

  /**
   * Updates the theme preference for a user in Firestore
   * @param {string} userId - ID of the user
   * @param {string} theme - Theme to set ('light' or 'dark')
   * @returns {Promise<void>}
   */
  async function updateUserTheme(userId, theme) {
    try {
      if (!['light', 'dark'].includes(theme)) {
        throw new Error('Tema inválido. Debe ser "claro" o "oscuro"');
      }
      
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'configs.theme': theme
      });
      // console.log(`Theme updated to ${theme} for user ${userId}`);
    } catch (error) {
      console.error('Error updating user theme:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene los UIDs de los usuarios a partir de un array de correos electrónicos
   * @param {Array<string>} emails - Array de correos electrónicos
   * @returns {Promise<Array<string>>} - Array de UIDs correspondientes
   */
  async function getUidsByEmails(emails) {
    try {
      if (!emails?.length) return [];
      const uids = [];
      // Dividir en lotes de 30 correos (límite de Firestore para 'in')
      const batches = [];
      for (let i = 0; i < emails.length; i += 30) {
        batches.push(emails.slice(i, i + 30));
      }

      for (const batch of batches) {
        // Verificar que el lote no esté vacío
        if (!batch.length) {
          console.warn('getUidsByEmails: Se encontró un lote vacío, omitiendo');
          continue;
        }
        const q = query(usersRef, where('email', 'in', batch));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          uids.push(doc.id); // El ID del documento es el UID
        });
      }

      return uids;
    } catch (error) {
      console.error('Error al obtener UIDs por correos electrónicos:', error);
      throw error;
    }
  }
  
  /**
   * Seteo el valor de isAdmin para un usuario
   * Esta función solo puede ser ejecutada por un usuario administrador
   * @param {string} id - ID del usuario
   * @param {boolean} isSuscribed - true para suscribir, false para desuscribir
   * @returns {Promise<void>}
   */
  async function setRolAdmin(id, isAdmin) {
    try {
       // verifico que exista usuario logueado
      const { user: authUser } = useAuth();
      if (!authUser.value) throw new Error('No hay usuario autenticado');
      
      // Verifico que el usuario logueado sea admin
      const currentUserDoc = await getDoc(doc(db, 'users', authUser.value.uid));
      if (!currentUserDoc.exists() || !currentUserDoc.data().isAdmin) {
        throw new Error('Solo los administradores pueden bloquear globalmente');
      }  

      // verifico que exista el usuario seleccionado
      const selectedUser = await getUser(id);
      if (!selectedUser) throw new Error('No hay usuario autenticado');
      // Actualizo propiedad isSuscribed en Firestore
      const userRef = doc(db, 'users', id);
      await updateDoc(userRef, {
        isAdmin: isAdmin,
      });
      // console.log(`Usuario con ID ${id} ${isSuscribed ? 'suscripto' : 'desuscripto'} exitosamente`);
    } catch (error) {
      console.error('Error al suscribir usuario:', error);
      throw error;
    }
  }

  /**
   * Retorna la cantidad de usuarios registrados en la colección users
   * @returns {Promise<number>} - Cantidad de usuarios
   */
  async function getUsersCount() {
    try {
      const querySnapshot = await getDocs(usersRef);
      return querySnapshot.size; // Retorna el número total de documentos
    } catch (error) {
      console.error('Error al obtener la cantidad de usuarios:', error);
      throw error;
    }
  }

  return {
    userProfile,
    getAllUsers,
    subscribeToUsers,
    getUserProfileByEmail,
    createUser,
    updateUser,
    deleteUser,
    softDelete,
    loadProfileInfo,
    addConnection,
    removeConnection,
    getUser,
    updateUserBanner,
    getUserIdByEmail,
    blockUserGlobally,
    blockUserIndividually,
    unblockUserIndividually,
    suscribeUser,
    updateUserTheme,
    getUidsByEmails,
    getEmailByDisplayName,
    setRolAdmin,
    getUsersCount,
  };
}