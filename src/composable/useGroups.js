// /composables/useGroups.js
import { ref } from 'vue'
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  deleteDoc,
} from 'firebase/firestore'

const db = getFirestore();
const groupsRef = collection(db, 'groups')

export function useGroups() {
  const isCreating = ref(false)

  /**
   * Crea un nuevo grupo en Firestore.
   * @param {Object} groupData - Datos del grupo a crear.
   * @returns {Promise<void>}
   */
  async function createGroup(groupData) {
    try {
        debugger
      isCreating.value = true
      await addDoc(groupsRef, {
        ...groupData,
        createdAt: serverTimestamp(),
      })
    } catch (error) {
      console.error('Error creando grupo:', error)
      throw error
    } finally {
      isCreating.value = false
    }
  }

  /**
   * Se suscribe a los grupos en tiempo real.
   * @param {function} callback - Función que recibe un array de grupos.
   * @returns {function} - Función para cancelar la suscripción.
   */
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
   * Elimina un grupo por su ID de documento.
   * @param {string} idDoc - ID del documento en Firestore.
   * @returns {Promise<void>}
   */
  async function deleteGroup(idDoc) {
    try {
      const docRef = doc(db, 'groups', idDoc)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Error al eliminar grupo:', error)
      throw error
    }
  }

  return {
    isCreating,
    createGroup,
    subscribeToGroups,
    deleteGroup,
  }
}
