import { getFirestore, doc, collection, setDoc, onSnapshot, query, orderBy, serverTimestamp, updateDoc, getDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { useStorage } from './useStorage';
import { useMediaUpload } from './useMediaUpload';
import { newGuid } from '../utils/newGuid';
// const { deleteFile } = useStorage();
const { uploadMedia } = useMediaUpload();
const db = getFirestore();
const defaultReelsRef = collection(db, 'defaultReels');

export function useDefaultReels() {
  /**
   * Saves a default reel to Firestore and uploads media/thumbnail to Firebase Storage.
   * @param {{title: string, mediaBase64?: string, mediaType: string, thumbnailBase64?: string, isActive?: boolean, priority?: number, mediaUrl?: string, mediaPath?: string, thumbnailUrl?: string, thumbnailPath?: string}} data
   * @returns {Promise<string>} - ID of the created document
   */
  async function saveDefaultReel({ title, mediaBase64, mediaType, thumbnailBase64, isActive = true, priority = 0, mediaUrl, mediaPath, thumbnailUrl, thumbnailPath }) {
    try {
      const reelId = newGuid();
      const docRef = doc(db, 'defaultReels', reelId);
      let finalMediaUrl = mediaUrl || '';
      let finalMediaPath = mediaPath || '';
      let finalThumbnailUrl = thumbnailUrl || '';
      let finalThumbnailPath = thumbnailPath || '';

      // Upload media if provided
      if (mediaBase64) {
        const dynamicPath = `defaultReels/${reelId}/media`;
        const { url, path } = await uploadMedia({
          currentUrl: mediaUrl,
          currentPath: mediaPath,
          newMediaBase64: mediaBase64,
          mediaType,
          dynamicPath,
        });
        finalMediaUrl = url || '';
        finalMediaPath = path || '';
      }

      // Upload thumbnail if provided
      if (thumbnailBase64) {
        const dynamicPath = `defaultReels/${reelId}/thumbnail`;
        const { url, path } = await uploadMedia({
          currentUrl: thumbnailUrl,
          currentPath: thumbnailPath,
          newMediaBase64: thumbnailBase64,
          mediaType: 'image',
          dynamicPath,
        });
        finalThumbnailUrl = url || '';
        finalThumbnailPath = path || '';
      }

      // Define reel data
      const reelData = {
        title,
        mediaUrl: finalMediaUrl,
        thumbnailUrl: finalThumbnailUrl,
        mediaType,
        mediaPath: finalMediaPath,
        thumbnailPath: finalThumbnailPath,
        user: {
          displayName: 'Voir',
          photoURL: null,
        },
        createdAt: serverTimestamp(),
        isActive: !!isActive,
        priority: Number(priority),
        default: true,
      };

      // Save to Firestore
      await setDoc(docRef, reelData);
      return reelId;
    } catch (err) {
      console.error('Error saving default reel:', err);
      throw err;
    }
  }

  /**
   * Subscribes to all default reels in real-time.
   * @param {function} callback - Function that receives an array of default reels
   * @param {function} errorCallback - Function to handle errors
   * @returns {function} - Unsubscribe function
   */
  function subscribeToDefaultReels(callback, errorCallback) {
    try {
      const q = query(
        defaultReelsRef,
        orderBy('priority', 'desc'),
        orderBy('createdAt', 'desc')
      );
      return onSnapshot(q, (snapshot) => {
        const defaultReels = snapshot.docs.map((doc) => ({
          idDoc: doc.id,
          id: doc.id,
          title: doc.data().title,
          mediaUrl: doc.data().mediaUrl,
          thumbnailUrl: doc.data().thumbnailUrl,
          mediaType: doc.data().mediaType,
          mediaPath: doc.data().mediaPath,
          thumbnailPath: doc.data().thumbnailPath,
          user: doc.data().user,
          createdAt: doc.data().createdAt,
          isActive: doc.data().isActive,
          priority: doc.data().priority,
          default: doc.data().default,
        }));
        callback(defaultReels);
      }, (err) => {
        console.error('Error subscribing to default reels:', err);
        errorCallback?.(err);
      });
    } catch (err) {
      console.error('Error setting up default reels subscription:', err);
      errorCallback?.(err);
      throw err;
    }
  }

  /**
   * Updates a default reel by its document ID.
   * @param {string} idDoc - Firestore document ID
   * @param {{title?: string, isActive?: boolean, priority?: number, mediaBase64?: string, thumbnailBase64?: string, mediaType?: string, mediaUrl?: string, mediaPath?: string, thumbnailUrl?: string, thumbnailPath?: string}} data
   * @returns {Promise<void>}
   */
  async function updateDefaultReel(idDoc, { title, isActive, priority, mediaBase64, thumbnailBase64, mediaType, mediaUrl, mediaPath, thumbnailUrl, thumbnailPath }) {
    try {
      const docRef = doc(db, 'defaultReels', idDoc);
      const updateData = {};

      if (title !== undefined) updateData.title = title;
      if (isActive !== undefined) updateData.isActive = !!isActive;
      if (priority !== undefined) updateData.priority = Number(priority);

      // Handle media update
      if (mediaBase64 && mediaType) {
        const dynamicPath = `defaultReels/${idDoc}/media`;
        const { url, path } = await uploadMedia({
          currentUrl: mediaUrl,
          currentPath: mediaPath,
          newMediaBase64: mediaBase64,
          mediaType,
          dynamicPath,
        });
        updateData.mediaUrl = url || '';
        updateData.mediaPath = path || '';
        updateData.mediaType = mediaType;
      } else if (mediaUrl !== undefined && mediaPath !== undefined) {
        updateData.mediaUrl = mediaUrl;
        updateData.mediaPath = mediaPath;
        if (mediaType !== undefined) updateData.mediaType = mediaType;
      }

      // Handle thumbnail update
      if (thumbnailBase64) {
        const dynamicPath = `defaultReels/${idDoc}/thumbnail`;
        const { url, path } = await uploadMedia({
          currentUrl: thumbnailUrl,
          currentPath: thumbnailPath,
          newMediaBase64: thumbnailBase64,
          mediaType: 'image',
          dynamicPath,
        });
        updateData.thumbnailUrl = url || '';
        updateData.thumbnailPath = path || '';
      } else if (thumbnailUrl !== undefined && thumbnailPath !== undefined) {
        updateData.thumbnailUrl = thumbnailUrl;
        updateData.thumbnailPath = thumbnailPath;
      }

      await updateDoc(docRef, updateData);
    } catch (err) {
      console.error('Error updating default reel:', err);
      throw err;
    }
  }

  /**
   * Deletes a default reel by its document ID and associated files.
   * @param {string} idDoc - Firestore document ID
   * @returns {Promise<void>}
   */
  async function deleteDefaultReel(idDoc) {
    try {
      const docRef = doc(db, 'defaultReels', idDoc);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { mediaPath, thumbnailPath } = docSnap.data();
        // if (mediaPath) await deleteFile(mediaPath);
        // if (thumbnailPath) await deleteFile(thumbnailPath);
      }
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Error deleting default reel:', err);
      throw err;
    }
  }

  
  /**
   * Obtiene la cantidad total de reels en la colección reels.
   * @returns {Promise<number>} - La cantidad de reels.
   */
  async function getAllCount() {
    try {
      const querySnapshot = await getDocs(defaultReelsRef);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error al contar todos los reels:', error);
      throw error;
    }
  }

  return {
    saveDefaultReel,
    subscribeToDefaultReels,
    updateDefaultReel,
    deleteDefaultReel,
    getAllCount,
  };
}