import { ref } from 'vue'
import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  deleteDoc,
  where,
  limit,
  arrayUnion,
  arrayRemove,
  updateDoc,
} from 'firebase/firestore'

const db = getFirestore();
const eventsRef = collection(db, 'events')

export function useEvents() {
  const isCreating = ref(false)

  async function createEvent(eventData) {
    try {
      isCreating.value = true
      await addDoc(eventsRef, {
        ...eventData,
        createdAt: serverTimestamp(),
      })
    } catch (error) {
      console.error('Error creando evento:', error)
      throw error
    } finally {
      isCreating.value = false
    }
  }
  async function updateEvent(idDoc, eventData) {
    try {
      const docRef = doc(db, 'events', idDoc)
      await updateDoc(docRef, {
        ...eventData,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error actualizando evento:', error)
      throw error
    }
  }
  /**
   * Se suscribe a todos los grupos.
   * @param {function} callback - Función que recibe un array de grupos.
   * @returns {function} - Función para cancelar la suscripción.
   */
  function subscribeToEvents(callback) {
    try {
      const q = query(eventsRef, orderBy('createdAt', 'desc'))
      return onSnapshot(q, (snapshot) => {
        const events = snapshot.docs.map((docSnap) => {
          const event = docSnap.data()
          return {
            idDoc: docSnap.id,
            ...event,
          }
        })
        callback(events)
      })
    } catch (error) {
      console.error('Error al suscribirse a eventos:', error)
      throw error
    }
  }

  /**
   * Se suscribe a los grupos en los que el usuario (authUser.uid) es miembro.
   * @param {string} uid - El uid del usuario autenticado.
   * @param {function} callback - Función que recibe un array de grupos.
   * @returns {function} - Función para cancelar la suscripción.
   */
  function subscribeToUserEvents(uid, callback) {
    try {
      const q = query(
        eventsRef,
        // where('ownerId', '==', uid),
        where('attendees.going', 'array-contains', uid),
        orderBy('createdAt', 'desc')
      )
      return onSnapshot(q, (snapshot) => {
        const events = snapshot.docs.map((docSnap) => {
          const event = docSnap.data()
          return {
            idDoc: docSnap.id,
            ...event,
          }
        })
        callback(events)
      })
    } catch (error) {
      console.error('Error al suscribirse a grupos del usuario:', error)
      throw error
    }
  }

  /**
   * Se suscribe a los 20 grupos más próximos.
   * @param {function} callback - Función que recibe un array de grupos.
   * @returns {function} - Función para cancelar la suscripción.
   */
  function subscribeToUpcomingEvents(callback) {
    try {
      const now = new Date()
      const q = query(
        eventsRef,
        where('startTime', '>=', now),
        orderBy('startTime', 'asc'),
        limit(20)
      )
      return onSnapshot(q, (snapshot) => {
        const events = snapshot.docs.map((docSnap) => ({
          idDoc: docSnap.id,
          ...docSnap.data(),
        }))
        callback(events)
      })
    } catch (error) {
      console.error('Error al suscribirse a eventos próximos:', error)
      throw error
    }
  }

  async function deleteEvent(idDoc) {
    try {
      const docRef = doc(db, 'events', idDoc)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Error al eliminar evento:', error)
      throw error
    }
  }

  async function findById(idDoc) {
    try {
      const docRef = doc(db, 'events', idDoc)
      const docSnap = await getDoc(docRef)
      if( !docSnap.exists()) {
        console.error('El evento no existe')
        throw new Error('Evento no encontrado')
      }
      
      return {
        idDoc: docSnap.id,
        ...docSnap.data(),
      }
    } catch (error) {
      console.error('Error al eliminar evento:', error)
      throw error
    }
  }

  async function setUserAttendanceStatus(idDoc, userId, status) {
    const docRef = doc(db, 'events', idDoc)
  
    const updateData = {}
  
    if (status === 'going') {
      updateData['attendees.going'] = arrayUnion(userId)
    } else {
      updateData['attendees.going'] = arrayRemove(userId)
    }
  
    await updateDoc(docRef, updateData)
  }

  
  /**
   * Se suscribe a los últimos 3 eventos con categoría "adopcion".
   * @param {function} callback - Función que recibe un array de eventos.
   * @returns {function} - Función para cancelar la suscripción.
   */
  function subscribeToAdoptionEvents(callback) {
    try {
      const q = query(
        eventsRef,
        where('categories', 'array-contains', { id: 'adopcion', name: 'Adopción' }),
        orderBy('createdAt', 'desc'),
        limit(3)
      )
      return onSnapshot(q, (snapshot) => {
        const events = snapshot.docs.map((docSnap) => ({
          idDoc: docSnap.id,
          ...docSnap.data(),
        }))
        callback(events)
      })
    } catch (error) {
      console.error('Error al suscribirse a eventos de adopción:', error)
      throw error
    }
  }

  /**
   * Obtiene la cantidad de eventos donde el usuario es el ownerId.
   * @param {string} userId - El ID del usuario.
   * @returns {Promise<number>} - La cantidad de eventos.
   */
  async function getEventCountByOwnerId(userId) {
    try {
      const q = query(eventsRef, where('ownerId', '==', userId))
      const querySnapshot = await getDocs(q)
      return querySnapshot.size
    } catch (error) {
      console.error('Error al contar eventos por ownerId:', error)
      throw error
    }
  }

  /**
   * Obtiene la cantidad total de eventos en la colección events.
   * @returns {Promise<number>} - La cantidad de eventos.
   */
  async function getAllEventsCount() {
    try {
      const querySnapshot = await getDocs(eventsRef);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error al contar todos los eventos:', error);
      throw error;
    }
  }
  
  return {
    isCreating,
    createEvent,
    updateEvent,
    subscribeToEvents,
    subscribeToUserEvents,
    subscribeToUpcomingEvents,
    deleteEvent,
    findById,
    setUserAttendanceStatus,
    subscribeToAdoptionEvents,
    getEventCountByOwnerId,
    getAllEventsCount,
  }
}
