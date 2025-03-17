import { getFirestore, addDoc, deleteDoc, doc, collection, onSnapshot, query, orderBy, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useStorage } from './useStorage';
import { newGuid } from '../utils/newGuid';

const { uploadFile, getFileUrl } = useStorage();
const db = getFirestore();
const reelsRef = collection(db, 'reels');

export function useReels() {
  /**
   * Guarda un reel en Firestore y sube el archivo a Firebase Storage.
   * @param {{user: Object, title: string, file: File}} data
   * @returns {Promise<void>}
   */
  async function saveReel({ user, title, file, mediaType, thumbnail }) {
    try {
      // Determinar tipo de archivo y extensión
      const extension = mediaType === 'image' ? 'jpg' : 'mp4';
      const filePath = `reels/${user.uid}/${newGuid()}.${extension}`;
      const thumbnailPath = `reels/${user.uid}/${newGuid()}_thumb.jpg`;

      // Subir archivo principal (base64) a Storage
      await uploadFile(filePath, file);
      const mediaUrl = await getFileUrl(filePath);

      // Subir thumbnail (base64) a Storage
      await uploadFile(thumbnailPath, thumbnail);
      const thumbnailUrl = await getFileUrl(thumbnailPath);

      // Datos del reel
      const reelData = {
        id: newGuid(),
        user: {
          uid: user.uid,
          displayName: user.displayName || user.email,
          photoURL: user.photoURL || null,
        },
        title,
        mediaUrl,
        thumbnailUrl,
        mediaType,
        mediaPath: filePath,
        createdAt: serverTimestamp(),
        likes: [],
        views: 0,
        isPublic: true,
        status: 'active',
      };

      // Guardar en Firestore
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
      // Nota: Podrías también eliminar el archivo de Storage aquí si es necesario
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
        userId: userData.uid, // Usamos uid en lugar de id para consistencia con Firebase Auth
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

  return {
    saveReel,
    subscribeToIncomingReels,
    deleteReel,
    addLike,
    removeLike,
  };
}