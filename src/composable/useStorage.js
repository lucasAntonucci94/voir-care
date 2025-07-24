import { getStorage, ref as storageRef, uploadString, getDownloadURL, getMetadata, deleteObject } from 'firebase/storage';

// Inicializamos el storage de Firebase
const storage = getStorage();

export function useStorage() {
  /**
   * Sube un archivo al storage de Firebase.
   * @param {string} filepath - Ruta del archivo en el storage.
   * @param {string} file - Contenido del archivo en formato data_url (base64).
   * @param {Object} metadata - Metadatos opcionales para el archivo.
   * @returns {Promise<void>}
   */
  async function uploadFile(filepath, file, metadata = {}) {
    const imageRef = storageRef(storage, filepath);
    return await uploadString(imageRef, file, 'data_url', metadata);
  }

  /**
   * Obtiene la URL de descarga de un archivo en el storage.
   * @param {string} filepath - Ruta del archivo en el storage.
   * @returns {Promise<string|null>} - URL de descarga del archivo, o null si hay un error (ej. archivo no encontrado).
   */
  async function getFileUrl(filepath) {
    try {
      const fileRef = storageRef(storage, filepath);
      return await getDownloadURL(fileRef);
    } catch (error) {
      // Si el archivo no existe, devolvemos null en lugar de lanzar un error.
      if (error.code === 'storage/object-not-found') {
        return null;
      }
      console.error(`Error al obtener URL del archivo ${filepath}:`, error);
      throw error; // Re-lanzar si es otro tipo de error
    }
  }

  /**
   * Obtiene los metadatos de un archivo en el storage.
   * @param {string} filepath - Ruta del archivo en el storage.
   * @returns {Promise<Object>} - Metadatos del archivo.
   */
  async function getFileMetadata(filepath) {
    const fileRef = storageRef(storage, filepath);
    return await getMetadata(fileRef);
  }

  /**
   * Elimina un archivo del storage de Firebase.
   * @param {string} filepath - Ruta del archivo en el storage.
   * @returns {Promise<void>}
   */
  async function deleteFile(filepath) {
    if (!filepath) {
      console.warn('deleteFile: No se proporcionó una ruta de archivo para eliminar.');
      return;
    }
    const fileRef = storageRef(storage, filepath);
    try {
      await deleteObject(fileRef);
      console.log(`Archivo en Storage eliminado exitosamente: ${filepath}`);
    } catch (error) {
      // Si el archivo no existe, no es un error crítico.
      if (error.code === 'storage/object-not-found') {
        console.warn(`deleteFile: Intento de eliminar archivo no existente en Storage: ${filepath}`);
      } else {
        console.error(`Error al eliminar archivo de Storage ${filepath}:`, error);
        throw error; // Re-lanzar si es otro tipo de error
      }
    }
  }

  return {
    uploadFile,
    getFileUrl,
    getFileMetadata,
    deleteFile,
  };
}