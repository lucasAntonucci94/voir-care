import { getFirestore, addDoc, deleteDoc, doc, getDocs, updateDoc, collection, onSnapshot, query, where, orderBy, limit, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { newGuid } from '../utils/newGuid';
import { useStorage } from './useStorage';

const db = getFirestore();
const reportRef = collection(db, 'reports');

export function useReports() {
  /**
   * Graba un reporte en la base de datos.
   * @param {{postId: string, userId: string, reason: string}} data
   * @returns {Promise<void>}
   */
  async function saveReport(postId, userId, reason = 'No especificado', description) {
    try {
      const reportData = {
        reportId: newGuid(),
        postId,
        userId,
        reason,
        description,
        created_at: serverTimestamp(),
        status: 'pending',
      };
      await addDoc(reportRef, reportData);
      return reportRef.id;
    } catch (err) {
      console.error('Error al grabar el report:', err);
      throw err;
    }
  }

  return {
    saveReport,
    // find,
  };
}