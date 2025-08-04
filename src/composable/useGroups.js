import { ref } from 'vue'
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  deleteDoc,
  where,
  getDoc,
  getDocs,
  arrayUnion,
  arrayRemove, 
  limit,
} from 'firebase/firestore'
import { useAuth } from '../api/auth/useAuth';
import { useStorage } from './useStorage';
import { newGuid } from '../utils/newGuid';

const db = getFirestore();
const groupsRef = collection(db, 'groups')
const { user } = useAuth()
const { uploadFile, getFileUrl } = useStorage();

export function useGroups() {
  const isCreating = ref(false)

  async function createGroup(groupData) {
    try {
      isCreating.value = true
      await addDoc(groupsRef, {
        ...groupData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error('Error creando grupo:', error)
      throw error
    } finally {
      isCreating.value = false
    }
  }

  async function updateGroup(idDoc, groupData) {
    try {
      const docRef = doc(db, 'groups', idDoc)
      await updateDoc(docRef, {
        ...groupData,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error actualizando evento:', error)
      throw error
    }
  }
  
  function subscribeToGroups(callback) {
    try {
      const q = query(groupsRef, orderBy('createdAt', 'desc'))
      return onSnapshot(q, (snapshot) => {
        const groups = snapshot.docs.map((docSnap) => {
          const group = docSnap.data()
          return {
            idDoc: docSnap.id,
            ...group,
          }
        })
        callback(groups)
      })
    } catch (error) {
      console.error('Error al suscribirse a grupos:', error)
      throw error
    }
  }

  /**
   * Se suscribe a los grupos en los que el usuario (authUser.uid) es miembro.
   * @param {string} uid - El uid del usuario autenticado.
   * @param {function} callback - Función que recibe un array de grupos.
   * @returns {function} - Función para cancelar la suscripción.
   */
  function subscribeToUserGroups(uid, callback) {
    try {
      const q = query(
        groupsRef,
        where('members', 'array-contains', uid),
        orderBy('createdAt', 'desc')
      )
      return onSnapshot(q, (snapshot) => {
        const groups = snapshot.docs.map((docSnap) => {
          const group = docSnap.data()
          return {
            idDoc: docSnap.id,
            ...group,
          }
        })
        callback(groups)
      })
    } catch (error) {
      console.error('Error al suscribirse a grupos del usuario:', error)
      throw error
    }
  }

  async function deleteGroup(idDoc) {
    try {
      const docRef = doc(db, 'groups', idDoc)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Error al eliminar grupo:', error)
      throw error
    }
  }

  async function findById(idDoc) {
    try {
      const docRef = doc(db, 'groups', idDoc)
      const docSnap = await getDoc(docRef)
      if( !docSnap.exists()) {
        console.error('El grupo no existe')
        throw new Error('Grupo no encontrado')
      }
      
      return {
        idDoc: docSnap.id,
        ...docSnap.data(),
      }
    } catch (error) {
      console.error('Error al buscar grupo por ID:', error)
      throw error
    }
  }

  /**
   * Agrega un usuario al grupo
   * @param {string} groupId 
   * @param {string} userId 
   */
  async function joinGroup(groupId, userId) {
    try {
      const groupRef = doc(db, 'groups', groupId)
      await updateDoc(groupRef, {
        members: arrayUnion(userId),
      })
    } catch (error) {
      console.error('Error al unirse al grupo:', error)
      throw error
    }
  }

  /**
   * Elimina un usuario del grupo
   * @param {string} groupId 
   * @param {string} userId 
   */
  async function leaveGroup(groupId, userId) {
    try {
      const groupRef = doc(db, 'groups', groupId)
      await updateDoc(groupRef, {
        members: arrayRemove(userId),
      })
    } catch (error) {
      console.error('Error al salir del grupo:', error)
      throw error
    }
  }

  async function createPostGroup(idGroup, postData) {
    try {
      postData.id = newGuid()
      postData.user = {
        id: user.value?.uid,
        displayName: user.value?.displayName,
        email: user.value?.email,
        photoURLFile: user.value?.photoURLFile,
        photoPath: user.value?.photoPathFile
      }
      if (postData.media && postData.media.imageBase64) {
        const extension = postData.media.type === 'image' ? 'jpg' : 'mp4';
        const filePath = `groups/${idGroup}/posts/${user.value.email}/${postData.id}.${extension}`;
        await uploadFile(filePath, postData.media.imageBase64);
        postData.media = {
          path: filePath,
          url: await getFileUrl(filePath),
          type: postData.media.type,
        } 
      }
     
      const postsRef = collection(db, 'groups', idGroup, 'posts')
      await addDoc(postsRef, {
        ...postData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error('Error creando grupo:', error)
      throw error
    } finally {
      // isCreating.value = false
    }
  }

  // Metodos de suscripcion a posts por id de grupo
  function suscribePostsByGroupId(groupId, callback) {
    try {
      const postsRef = collection(db, 'groups', groupId, 'posts')
      const q = query(postsRef, orderBy('createdAt', 'desc'))
      return onSnapshot(q, (snapshot) => {
        const posts = snapshot.docs.map((docSnap) => {
          const post = docSnap.data()
          return {
            idDoc: docSnap.id,
            ...post,
          }
        })
        callback(posts)
      })
    } catch (error) {
      console.error('Error al suscribirse a los posts del grupo:', error)
      throw error
    }
  }

  /**
   * Se suscribe a los últimos 3 grupos con categoría "adopcion".
   * @param {function} callback - Función que recibe un array de grupos.
   * @returns {function} - Función para cancelar la suscripción.
   */
  function subscribeToAdoptionGroups(callback) {
    try {
      const q = query(
        groupsRef,
        where('categories', 'array-contains', { id: 'adopcion', name: 'Adopción' }),
        orderBy('createdAt', 'desc'),
        limit(4)
      )
      return onSnapshot(q, (snapshot) => {
        const groups = snapshot.docs.map((docSnap) => ({
          idDoc: docSnap.id,
          ...docSnap.data(),
        }))
        callback(groups)
      })
    } catch (error) {
      console.error('Error al suscribirse a grupos de adopción:', error)
      throw error
    }
  }

  /**
   * Obtiene la cantidad de grupos donde el usuario es el ownerId.
   * @param {string} userId - El ID del usuario.
   * @returns {Promise<number>} - La cantidad de grupos.
   */
  async function getGroupCountByOwnerId(userId) {
    try {
      const q = query(groupsRef, where('ownerId', '==', userId))
      const querySnapshot = await getDocs(q)
      return querySnapshot.size
    } catch (error) {
      console.error('Error al contar grupos por ownerId:', error)
      throw error
    }
  }

  /**
   * Obtiene la cantidad total de grupos en la colección groups.
   * @returns {Promise<number>} - La cantidad de grupos.
   */
  async function getAllGroupsCount() {
    try {
      const querySnapshot = await getDocs(groupsRef);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error al contar todos los grupos:', error);
      throw error;
    }
  }

  return {
    isCreating,
    createGroup,
    subscribeToGroups,
    subscribeToUserGroups,
    deleteGroup,
    findById,
    updateGroup,
    joinGroup,
    leaveGroup,
    createPostGroup,
    suscribePostsByGroupId,
    subscribeToAdoptionGroups,
    getGroupCountByOwnerId,
    getAllGroupsCount,
  }
}
