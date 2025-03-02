import { getFirestore, doc, setDoc, getDocs, updateDoc, collection, query, where, limit } from 'firebase/firestore';
import { useStorage } from './useStorage'; // Importamos el composable de storage
// import { updateUserFromPost } from '../posts/index.js'; // Mantenemos esta dependencia

const db = getFirestore();
const usersRef = collection(db, 'users');
const { getFileUrl } = useStorage(); // Extraemos getFileUrl para usarlo si es necesario

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
          idDoc: doc.id,
          displayName: user.displayName,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar || null,
          photoURLFile: user.photoURLFile,
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
      console.log({
        id: userDoc.id,
        email: user.email,
        displayName: user.displayName,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        avatar: user.avatar || null,
        isAdmin: user.isAdmin || null,
        photoURLFile: user.photoURLFile,
      });

      return {
        id: userDoc.id,
        email: user.email,
        displayName: user.displayName,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        avatar: user.avatar || null,
        isAdmin: user.isAdmin || null,
        photoURLFile: user.photoURLFile,
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
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        avatar: data.avatar || null,
        photoURLFile: data.photoURLFile || null,
        isAdmin: data.isAdmin || false, // Valor por defecto
      });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  /**
   * Actualiza los datos de un usuario en Firestore y posts relacionados
   * @param {string} id - ID del usuario
   * @param {Object} data - Datos a actualizar (displayName, firstName, etc.)
   * @returns {Promise<void>}
   */
  async function updateUser(id, data) {
    try {
      const docRef = doc(db, 'users', id);
      await updateDoc(docRef, {
        displayName: data.displayName,
        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',
        avatar: data.avatar || null,
        photoURLFile: data.photoURLFile || null,
      });

      // Actualizamos datos en posts relacionados (si aplica)
    //   await updateUserFromPost({ id, data });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  // Devolvemos las funciones para usarlas en los componentes
  return {
    getAllUsers,
    getUserProfileByEmail,
    createUser,
    updateUser,
  };
}