import { getFirestore, serverTimestamp, collection, query, where, getDoc, getDocs, doc, setDoc, deleteDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { newGuid } from '../utils/newGuid';
import { useUsers } from '../composable/useUsers';
const db = getFirestore();
const subscriptionRequestsRef = collection(db, 'subscriptionRequests');
export function useSubscriptionRequests() {
  /**
   * Crear una solicitud de suscripción.
   * @param {string} userId - Firebase UID del usuario
   * @param {string} email - El correo electrónico del usuario
   * @param {string} planType - El tipo de plan ('weekly' o 'monthly')
   * @returns {Promise<void>}
   */
  async function createSubscriptionRequest(userId, email, planType) {
    try {
      const hasPending = await hasPendingRequest(userId);
      if (hasPending) {
          throw new Error('Ya tienes una solicitud de suscripción pendiente.');
      } 
      const requestId = newGuid();
      const requestDocRef = doc(db, 'subscriptionRequests', requestId);
      await setDoc(requestDocRef, {
        userId,
        email,
        planType,
        status: 'pending',
        createdAt: serverTimestamp()
    });
    } catch (err) {
        debugger
      console.error('Error creating subscription request:', err);
      throw err;
    }
  }

  /**
   * Aprobar una solicitud de suscripción.
   * @param {string} requestId - ID de la solicitud de suscripción
   * @returns {Promise<void>}
   */
  async function approveSubscriptionRequest(requestId, userId) {
    try {
      const { suscribeUser } = useUsers();
      debugger
      await suscribeUser(userId, true);  
      const requestDocRef = doc(db, 'subscriptionRequests', requestId);
      await setDoc(requestDocRef, { status: 'approved' }, { merge: true });
    } catch (err) {
      console.error('Error approving subscription request:', err);
      throw err;
    }
  }

  /**
   * Declines a subscription request.
   * @param {string} requestId - ID de la solicitud de suscripción
   * @returns {Promise<void>}
   */
  async function declineSubscriptionRequest(requestId) {
    try {
      const requestDocRef = doc(db, 'subscriptionRequests', requestId);
      await setDoc(requestDocRef, { status: 'declined' }, { merge: true });
    } catch (err) {
      console.error('Error declining subscription request:', err);
      throw err;
    }
  }

  /**
   * Obtener todas las solicitudes de suscripción.
   * @param {string} [status] - Filtro de estado opcional ('pending', 'approved', 'declined')
   * @returns {Promise<Array>}
   */
  async function fetchSubscriptionRequests(status = null) {
    try {
      let q = query(subscriptionRequestsRef, orderBy('createdAt', 'desc'));
      if (status) {
        q = query(subscriptionRequestsRef, where('status', '==', status), orderBy('createdAt', 'desc'));
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error('Error fetching subscription requests:', err);
      return [];
    }
  }

  /**
   * Verificar si un usuario tiene una solicitud de suscripción pendiente.
   * @param {string} userId - Firebase UID
   * @returns {Promise<boolean>}
   */
  async function hasPendingRequest(userId) {
    try {
      const q = query(subscriptionRequestsRef, where('userId', '==', userId), where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (err) {
      console.error('Error checking pending request:', err);
      return false;
    }
  }

  /**
   * Suscripcion a las peticiones de suscripcion premium.
   * @param {function} callback - Funcion de callback que recibe las peticiones
   * @param {string} [status] - Filtro de estado opcional ('pending', 'approved', 'declined')
   * @returns {function} - Funcion para cancelar la suscripcion
   */
  function subscribeToSubscriptionRequests(callback, status = null) {
    try {
      let q = query(subscriptionRequestsRef, orderBy('createdAt', 'desc'));
      if (status) {
        q = query(subscriptionRequestsRef, where('status', '==', status), orderBy('createdAt', 'desc'));
      }
      return onSnapshot(q, (snapshot) => {
        const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(requests);
      });
    } catch (err) {
      console.error('Error subscribing to subscription requests:', err);
      throw err;
    }
  }

  /**
   * Retorna la cantidad de peticiones de suscripcion.
   * @returns {Promise<number>} - Cantidad de peticiones de suscripcion
   */
  async function getSubscriptionRequestsCount() {
    try {
      const querySnapshot = await getDocs(subscriptionRequestsRef);
      return querySnapshot.size; 
    } catch (error) {
      console.error('Error al obtener la cantidad de peticiones de suscripción:', error);
      throw error;
    }
  }

  /**
   * Retorna la cantidad de peticiones de suscripción en estado 'pending'.
   * @returns {Promise<number>} - Cantidad de peticiones de suscripción en estado 'pending'
   */
  async function getPendingSubscriptionRequestsCount() {
    try {
      const q = query(subscriptionRequestsRef, where('status', '==', 'pending'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error al obtener la cantidad de peticiones de suscripción pendientes:', error);
      throw error;
    }
  }
  return {
    createSubscriptionRequest,
    approveSubscriptionRequest,
    declineSubscriptionRequest,
    fetchSubscriptionRequests,
    hasPendingRequest,
    subscribeToSubscriptionRequests,
    getSubscriptionRequestsCount,
    getPendingSubscriptionRequestsCount
  }
}