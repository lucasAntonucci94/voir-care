import { getFirestore, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { newGuid } from '../utils/newGuid';

// Incializamos Firestore
const db = getFirestore();
const reportRef = collection(db, 'reports');

// Tipos validos de entidad a reportar
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

  return {
    saveReport,
  };
}