import { ref } from 'vue';
import { getFirestore, addDoc, doc, updateDoc, deleteDoc, collection, onSnapshot, query, orderBy, serverTimestamp, Timestamp, where, arrayUnion, arrayRemove, increment, getDoc } from 'firebase/firestore';
import { useStorage } from './useStorage'; // Importamos el composable useStorage
import { newGuid } from '../utils/newGuid';

const db = getFirestore();
const reelsRef = collection(db, 'reels');

export function useReels() {
  // Instanciamos useStorage para acceder a sus métodos
  const { uploadFile, getFileUrl, deleteFile } = useStorage();

  const error = ref(null);
  const isLoading = ref(false);

  /**
   * Guarda un nuevo reel en Firestore y sube el archivo a Firebase Storage.
   * @param {Object} reelData - Datos del reel.
   * @param {Object} reelData.user - Información del usuario.
   * @param {string} reelData.title - Título del reel.
   * @param {string} reelData.base64 - Contenido del archivo en base64.
   * @param {string} reelData.mediaType - Tipo de medio ('image' o 'video').
   * @param {string} reelData.thumbnailBase64 - Contenido del thumbnail en base64.
   * @returns {Promise<void>}
   */
  async function saveReel(reelData) {
    isLoading.value = true;
    error.value = null;
    try {
      const { user, title, base64, mediaType, thumbnailBase64 } = reelData;
      const mediaExtension = mediaType === 'image' ? 'jpg' : 'mp4';
      const mediaPath = `reels/${user.uid}/${newGuid()}.${mediaExtension}`;
      const thumbnailUrlPath = `reels/${user.uid}/thumbnails/${newGuid()}_thumb.jpg`;

      // Subir archivo principal usando useStorage.uploadFile
      await uploadFile(mediaPath, base64);
      const mediaUrl = await getFileUrl(mediaPath);

      // Subir thumbnail usando useStorage.uploadFile
      await uploadFile(thumbnailUrlPath, thumbnailBase64);
      const thumbnailUrl = await getFileUrl(thumbnailUrlPath);

      const newReelDoc = {
        id: newGuid(), // Generar un ID único para el documento
        user: {
          uid: user.uid,
          displayName: user.displayName || user.email,
          photoURL: user.photoURL || null,
          email: user.email || null,
        },
        title,
        mediaUrl,
        mediaPath,
        thumbnailUrl,
        thumbnailPath: thumbnailUrlPath,
        mediaType,
        createdAt: serverTimestamp(),
        likes: [],
        views: 0,
        viewDetails: {},
        isPublic: true,
        status: 'active',
      };

      await addDoc(reelsRef, newReelDoc);
      console.log('Reel guardado exitosamente en Firestore.');
    } catch (err) {
      console.error('Error al guardar el reel:', err);
      error.value = 'Error al guardar el reel.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Actualiza un reel existente en Firestore y gestiona la subida/eliminación de archivos en Storage.
   * @param {string} idDoc - El ID del documento de Firestore a actualizar.
   * @param {Object} updatedData - Los datos actualizados del reel.
   * @param {string} [updatedData.base64] - Nuevo contenido del archivo en base64 si se cambió el medio.
   * @param {string} [updatedData.thumbnailBase64] - Nuevo contenido del thumbnail en base64 si se cambió el medio.
   * @param {string} [updatedData.originalMediaPath] - Ruta original del medio en Storage si se cambió.
   * @param {string} [updatedData.originalThumbnailPath] - Ruta original del thumbnail en Storage si se cambió.
   * @returns {Promise<void>}
   */
  async function updateReelData(idDoc, updatedData) {
    isLoading.value = true;
    error.value = null;
    try {
      const reelDocRef = doc(db, 'reels', idDoc);
      const dataToUpdate = { ...updatedData };

      // Lógica para el archivo principal (media)
      if (updatedData.base64) {
        // Si hay un nuevo archivo base64, significa que el medio ha cambiado.
        // 1. Eliminar el archivo antiguo si existe
        if (updatedData.originalMediaPath) {
          await deleteFile(updatedData.originalMediaPath);
        }

        // 2. Subir el nuevo archivo
        const mediaExtension = updatedData.mediaType === 'image' ? 'jpg' : 'mp4';
        const newMediaPath = `reels/${updatedData.user.uid}/${newGuid()}.${mediaExtension}`;
        await uploadFile(newMediaPath, updatedData.base64);
        const newMediaUrl = await getFileUrl(newMediaPath);

        dataToUpdate.mediaUrl = newMediaUrl;
        dataToUpdate.mediaPath = newMediaPath;
      } else if (updatedData.mediaUrl === null && updatedData.originalMediaPath) {
        // Si mediaUrl es null y había una ruta original, significa que se eliminó el medio
        await deleteFile(updatedData.originalMediaPath);
        dataToUpdate.mediaPath = null;
        dataToUpdate.mediaType = null;
      }

      // Lógica para el thumbnail
      if (updatedData.thumbnailBase64) {
        // Si hay un nuevo thumbnail base64, significa que el thumbnail ha cambiado.
        if (updatedData.originalThumbnailPath) {
          await deleteFile(updatedData.originalThumbnailPath);
        }
        const newThumbnailPath = `reels/${updatedData.user.uid}/thumbnails/${newGuid()}_thumb.jpg`;
        await uploadFile(newThumbnailPath, updatedData.thumbnailBase64);
        const newThumbnailUrl = await getFileUrl(newThumbnailPath);

        dataToUpdate.thumbnailUrl = newThumbnailUrl;
        dataToUpdate.thumbnailPath = newThumbnailPath;
      } else if (updatedData.thumbnailUrl === null && updatedData.originalThumbnailPath) {
        // Si thumbnailUrl es null y había una ruta original, significa que se eliminó el thumbnail
        await deleteFile(updatedData.originalThumbnailPath);
        dataToUpdate.thumbnailPath = null;
      }

      // Eliminar los campos temporales de base64 y las rutas originales antes de actualizar Firestore
      delete dataToUpdate.base64;
      delete dataToUpdate.thumbnailBase64;
      delete dataToUpdate.originalMediaPath;
      delete dataToUpdate.originalThumbnailPath;

      await updateDoc(reelDocRef, dataToUpdate);
      console.log('Reel actualizado exitosamente en Firestore.');
    } catch (err) {
      console.error('Error al actualizar el reel:', err);
      error.value = 'Error al actualizar el reel.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Elimina un reel de Firestore y sus archivos asociados en Firebase Storage.
   * @param {string} idDoc - El ID del documento de Firestore a eliminar.
   * @param {string} mediaPath - La ruta del archivo principal en Storage.
   * @param {string} thumbnailPath - La ruta del archivo de thumbnail en Storage.
   * @returns {Promise<void>}
   */
  async function deleteReel(idDoc, mediaPath, thumbnailPath) {
    isLoading.value = true;
    error.value = null;
    try {
      // 1. Eliminar los archivos de Storage usando useStorage.deleteFile
      if (mediaPath) {
        await deleteFile(mediaPath);
      }
      if (thumbnailPath) {
        await deleteFile(thumbnailPath);
      }

      // 2. Eliminar el documento de Firestore
      const reelDocRef = doc(db, 'reels', idDoc);
      await deleteDoc(reelDocRef);
      console.log('Reel y archivos eliminados exitosamente.');
    } catch (err) {
      console.error('Error al eliminar el reel:', err);
      error.value = 'Error al eliminar el reel.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Escucha los reels en tiempo real.
   * @param {function} callback - Función que recibe un array de reels
   * @returns {function} - Función para cancelar la suscripción
   */
  function subscribeToIncomingReels(callback) {
    try {
      const twentyFourHoursAgo = Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000);

      const q = query(
        reelsRef,
        where('createdAt', '>=', twentyFourHoursAgo),
        orderBy('createdAt', 'desc')
      );
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
            thumbnailPath: reel.thumbnailPath,
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
   * Escucha los reels en tiempo real creados por un usuario específico.
   * @param {string} userId - El UID del usuario para filtrar los reels.
   * @param {function(Array<Object>): void} callback - Función que recibe un array de reels del usuario.
   * @returns {function(): void} - Función para cancelar la suscripción.
   */
  function subscribeToUserReels(userId, callback) {
    if (!userId) {
      console.warn('subscribeToUserReels: userId es nulo o indefinido. No se establecerá la suscripción.');
      callback([]);
      return () => {};
    }

    try {
      const q = query(
        reelsRef,
        where('user.uid', '==', userId),
        // where('createdAt', '>=', twentyFourHoursAgo),
        orderBy('createdAt', 'desc')
      );

      return onSnapshot(q, (snapshot) => {
        const userReels = snapshot.docs.map((doc) => {
          const reel = doc.data();
          return {
            idDoc: doc.id,
            id: reel.id,
            title: reel.title,
            mediaUrl: reel.mediaUrl,
            thumbnailUrl: reel.thumbnailUrl,
            mediaType: reel.mediaType,
            mediaPath: reel.mediaPath,
            thumbnailPath: reel.thumbnailPath,
            createdAt: reel.createdAt,
            user: reel.user,
            likes: reel.likes || [],
            views: reel.views || 0,
            viewDetails: reel.viewDetails || {},
            isPublic: reel.isPublic,
            status: reel.status,
          };
        });
        callback(userReels);
      }, (err) => {
        console.error(`Error en onSnapshot para reels del usuario ${userId}:`, err);
        throw err;
      });
    } catch (err) {
      console.error('Error al configurar la suscripción de reels del usuario:', err);
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
        thumbnailPath: reelData.thumbnailPath,
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
    updateReelData,
    subscribeToIncomingReels,
    subscribeToUserReels,
    deleteReel,
    addLike,
    removeLike,
    incrementView,
    error,
    isLoading,
  };
}