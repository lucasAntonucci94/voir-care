import { getFirestore, addDoc, deleteDoc, doc, collection, onSnapshot, query, orderBy, serverTimestamp, arrayUnion, arrayRemove, updateDoc, increment, getDoc } from 'firebase/firestore';
import { useStorage } from './useStorage';
import { newGuid } from '../utils/newGuid';

const { uploadFile, getFileUrl } = useStorage();
const db = getFirestore();
const reelsRef = collection(db, 'reels');

export function useReels() {
  /**
   * Guarda un reel en Firestore y sube el archivo a Firebase Storage.
   * @param {{user: Object, title: string, file: File, mediaType: string, thumbnail: File}} data
   * @returns {Promise<void>}
   */
  async function saveReel({ user, title, file, mediaType, thumbnail }) {
    try {
      const extension = mediaType === 'image' ? 'jpg' : 'mp4';
      const filePath = `reels/${user.uid}/${newGuid()}.${extension}`;
      const thumbnailPath = `reels/${user.uid}/${newGuid()}_thumb.jpg`;
      await uploadFile(filePath, file);
      const mediaUrl = await getFileUrl(filePath);
      await uploadFile(thumbnailPath, thumbnail);
      const thumbnailUrl = await getFileUrl(thumbnailPath);
      const reelData = {
        id: newGuid(),
        user: {
          uid: user.uid,
          displayName: user.displayName || user.email,
          photoURL: user.photoURL || null,
          email: user.email || null,
        },
        title,
        mediaUrl,
        thumbnailUrl,
        mediaType,
        mediaPath: filePath,
        createdAt: serverTimestamp(),
        likes: [],
        views: 0,
        viewDetails: {}, // Inicializar viewDetails como objeto vacío
        isPublic: true,
        status: 'active',
      };
      await addDoc(reelsRef, reelData);
    } catch (err) {
      console.error('Error al guardar el reel:', err);
      throw err;
    }
  }

  /**
   * Escucha los reels en tiempo real.
   * @param {function} callback - Función que recibe un array de reels
   * @returns {function} - Función para cancelar la suscripción
   */
  function subscribeToIncomingReels(callback) {
    try {
      const q = query(reelsRef, orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const reels = snapshot.docs.map((doc) => {
          const reel = doc.data();
          return {
            idDoc: doc.id,
            id: reel.id,
            title: reel.title,
            mediaUrl: reel.mediaUrl,
            thumbnailUrl: reel.thumbnailUrl,
            mediaType: reel.mediaType,
            mediaPath: reel.mediaPath,
            createdAt: reel.createdAt,
            user: reel.user,
            likes: reel.likes || [],
            views: reel.views || 0,
            viewDetails: reel.viewDetails || {},
            isPublic: reel.isPublic,
            status: reel.status,
          };
        });
        callback(reels);
      });
    } catch (err) {
      console.error('Error al suscribirse a reels:', err);
      throw err;
    }
  }

  /**
   * Elimina un reel por su ID de documento.
   * @param {string} idDoc - ID del documento en Firestore
   * @returns {Promise<void>}
   */
  async function deleteReel(idDoc) {
    try {
      const docRef = doc(db, 'reels', idDoc);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Error al eliminar reel:', err);
      throw err;
    }
  }

  /**
   * Agrega un "like" a un reel.
   * @param {string} reelIdDoc - ID del documento
   * @param {Object} userData - Datos del usuario que da like
   * @returns {Promise<void>}
   */
  async function addLike(reelIdDoc, userData) {
    try {
      const docRef = doc(db, 'reels', reelIdDoc);
      const likeData = {
        userId: userData.uid,
        displayName: userData.displayName || userData.email,
      };
      await updateDoc(docRef, {
        likes: arrayUnion(likeData),
      });
    } catch (err) {
      console.error('Error al agregar like:', err);
      throw err;
    }
  }

  /**
   * Quita un "like" de un reel.
   * @param {string} reelIdDoc - ID del documento
   * @param {Object} userData - Datos del usuario que quita el like
   * @returns {Promise<void>}
   */
  async function removeLike(reelIdDoc, userData) {
    try {
      const docRef = doc(db, 'reels', reelIdDoc);
      const likeData = {
        userId: userData.uid,
        displayName: userData.displayName || userData.email,
      };
      await updateDoc(docRef, {
        likes: arrayRemove(likeData),
      });
    } catch (err) {
      console.error('Error al quitar like:', err);
      throw err;
    }
  }

  /**
   * Incrementa el contador de visualizaciones de un reel si el usuario no lo ha visto antes.
   * @param {string} reelIdDoc - ID del documento
   * @param {Object} userData - Datos del usuario (uid, email)
   * @returns {Promise<Object>} - Reel actualizado
   */
  async function incrementView(reelIdDoc, userData) {
    try {
      const docRef = doc(db, 'reels', reelIdDoc);
      const reelSnap = await getDoc(docRef);
      if (!reelSnap.exists()) {
        throw new Error('Reel no encontrado');
      }

      const reelData = reelSnap.data();
      const viewDetails = reelData.viewDetails || {};

      // Solo incrementar si el usuario no ha visto el reel
      if (!viewDetails[userData.uid]) {
        await updateDoc(docRef, {
          views: increment(1),
          [`viewDetails.${userData.uid}`]: {
            email: userData.email,
            timestamp: serverTimestamp(),
          },
        });
      }

      // Devolver el reel actualizado
      return {
        idDoc: reelIdDoc,
        id: reelData.id,
        title: reelData.title,
        mediaUrl: reelData.mediaUrl,
        thumbnailUrl: reelData.thumbnailUrl,
        mediaType: reelData.mediaType,
        mediaPath: reelData.mediaPath,
        createdAt: reelData.createdAt,
        user: reelData.user,
        likes: reelData.likes || [],
        views: (reelData.views || 0) + (viewDetails[userData.uid] ? 0 : 1),
        viewDetails: {
          ...viewDetails,
          [userData.uid]: {
            email: userData.email,
            timestamp: new Date(), // Aproximación, ya que serverTimestamp no está resuelto aún
          },
        },
        isPublic: reelData.isPublic,
        status: reelData.status,
      };
    } catch (err) {
      console.error('Error incrementando visualización:', err);
      throw err;
    }
  }

  return {
    saveReel,
    subscribeToIncomingReels,
    deleteReel,
    addLike,
    removeLike,
    incrementView,
  };
}