import { getFirestore, doc, getDoc, getDocs, updateDoc, collection, onSnapshot,deleteDoc,serverTimestamp, addDoc } from 'firebase/firestore';
import { newGuid } from '../utils/newGuid';

// Inicializamos Firestore
const db = getFirestore();
const reportRef = collection(db, 'reports');

// Tipos válidos de entidad a reportar
const VALID_ENTITY_TYPES = [
  'post',
  'reel',
  'group',
  'groupPost',
  'event',
  'eventPost',
  'user',
];

export function useReports() {
  /**
   * Saves a report for any type of entity in the database.
   * @param {Object} params
   * @param {string} params.entityType - The type of entity being reported (ej. 'post', 'group', 'user')
   * @param {string} params.entityId - The ID of the entity being reported
   * @param {string} params.userId - The ID of the user submitting the report
   * @param {string} [params.reason='No especificado'] - The reason for the report
   * @param {string} [params.description] - Additional description of the issue
   * @param {Object} [params.metadata] - Optional metadata for additional context
   * @returns {Promise<string>} The ID of the created report document
   * @throws {Error} If entityType or entityId is missing or invalid
   */
  async function saveReport({ entityType, entityId, userId, reason = 'No especificado', description, metadata = {} }) {
    // Validation
    if (!entityType || !entityId || !userId) {
      throw new Error('entityType, entityId, and userId are required');
    }

    if (!VALID_ENTITY_TYPES.includes(entityType)) {
      throw new Error(`Invalid entityType: ${entityType}. Must be one of ${VALID_ENTITY_TYPES.join(', ')}`);
    }

    try {
      const reportData = {
        reportId: newGuid(),
        entityType,
        entityId,
        userId,
        reason,
        description,
        metadata,
        created_at: serverTimestamp(),
        status: 'pending',
      };
      const docRef = await addDoc(reportRef, reportData);
      return docRef.id;
    } catch (err) {
      console.error('Error al grabar el report:', err);
      throw err;
    }
  }

  /**
   * Retorna la cantidad de reportes en la colección reports.
   * @returns {Promise<number>} - Cantidad de reportes
   */
  async function getReportsCount() {
    try {
      const querySnapshot = await getDocs(reportRef);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error al obtener la cantidad de reportes:', error);
      throw error;
    }
  }

  /**
   * Elimina un reporte por su ID de documento.
   * @param {string} docId - ID del documento del reporte
   * @returns {Promise<void>}
   * @throws {Error} Si el reporte no existe o hay un error al eliminar
   */
  async function deleteReport(docId) {
    try {
      if (!docId) {
        throw new Error('docId es requerido');
      }
      const reportDoc = doc(reportRef, docId);
      await deleteDoc(reportDoc);
    } catch (error) {
      console.error('Error al eliminar el reporte:', error);
      throw error;
    }
  }
  
  /**
   * Baja lógica de un reporte por su ID de documento.
   * @param {string} docId - ID del documento del reporte
   * @returns {Promise<void>}
   * @throws {Error} Si el reporte no existe o hay un error al eliminar
   */
  async function softDeleteReport(docId) {
    try {
      if (!docId) {
        throw new Error('docId es requerido');
      }
      const reportDoc = doc(reportRef, docId);
      await updateDoc(reportDoc, {
        isDeleted: true,
        deletedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error al eliminar el reporte:', error);
      throw error;
    }
  }

  /**
   * Obtiene un reporte por su ID de documento.
   * @param {string} docId - ID del documento del reporte
   * @returns {Promise<Object|null>} - Datos del reporte o null si no existe
   * @throws {Error} Si docId es inválido
   */
  async function getReportById(docId) {
    try {
      if (!docId) {
        throw new Error('docId es requerido');
      }
      const reportDoc = doc(reportRef, docId);
      const reportSnap = await getDoc(reportDoc);
      if (reportSnap.exists()) {
        return { id: reportSnap.id, ...reportSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error al obtener el reporte por ID:', error);
      throw error;
    }
  }

  //metodo para obtener todo los reportes
  async function getAllReports() {
    try {
      const querySnapshot = await getDocs(reportRef);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error al obtener todos los reportes:', error);
      throw error;
    }
  }

  /**
   * Escucha los reportes en tiempo real.
   * @param {function} callback - Función que recibe un array de reportes
   * @returns {function} - Función para cancelar la suscripción
   */
  function subscribeToReports(callback) {
    try {
      return onSnapshot(reportRef, (snapshot) => {
        const reports = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(reports);
      }, (error) => {
        console.error('Error al suscribirse a reportes:', error);
        throw error;
      });
    } catch (err) {
      console.error('Error al configurar la suscripción a reportes:', err);
      throw err;
    }
  }

  return {
    saveReport,
    getReportsCount,
    deleteReport,
    getReportById,
    getAllReports,
    softDeleteReport,
    subscribeToReports,
  };
}