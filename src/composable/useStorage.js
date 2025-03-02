import { getStorage, ref as storageRef, uploadString, getDownloadURL, getMetadata } from 'firebase/storage';

// Inicializamos el storage de Firebase
const storage = getStorage();

export function useStorage() {
  /**
   * Hace un uploadfile en el storage de Firestore
   * @param {string} filepath - Ruta del archivo en el storage
   * @param {string} file - Contenido del archivo en formato data_url
   * @param {Object} metadata - Metadatos opcionales para el archivo
   * @returns {Promise<void>}
   */
  async function uploadFile(filepath, file, metadata = {}) {
    const imageRef = storageRef(storage, filepath);
    return await uploadString(imageRef, file, 'data_url', metadata);
  }

  /**
   * Obtiene la URL de descarga de un archivo en el storage
   * @param {string} filepath - Ruta del archivo en el storage
   * @returns {Promise<string>} - URL de descarga del archivo
   */
  async function getFileUrl(filepath) {
    debugger
    const imageRef = storageRef(storage, filepath);
    return await getDownloadURL(imageRef);
  }

  /**
   * Obtiene los metadatos de un archivo en el storage
   * @param {string} filepath - Ruta del archivo en el storage
   * @returns {Promise<Object>} - Metadatos del archivo
   */
  async function getFileMetadata(filepath) {
    const imageRef = storageRef(storage, filepath);
    return await getMetadata(imageRef);
  }

  // Devolvemos las funciones para usarlas en los componentes
  return {
    uploadFile,
    getFileUrl,
    getFileMetadata,
  };
}