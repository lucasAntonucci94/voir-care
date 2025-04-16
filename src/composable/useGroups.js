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
  arrayUnion,
  arrayRemove, 
} from 'firebase/firestore'

const db = getFirestore();
const groupsRef = collection(db, 'groups')

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
  }
}
