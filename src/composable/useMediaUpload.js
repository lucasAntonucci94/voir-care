import { useStorage } from './useStorage';
import { ref } from 'vue';

export function useMediaUpload() {
  const { uploadFile, getFileUrl } = useStorage();
  const isUploading = ref(false);

  /**
   * Sube un archivo multimedia a Firebase Storage y devuelve la URL y el path actualizados.
   * @param {Object} options - Opciones para la subida
   * @param {string|null} options.currentUrl - URL actual del archivo en Storage (si existe)
   * @param {string|null} options.currentPath - Path actual del archivo en Storage (si existe)
   * @param {string|null} options.newMediaBase64 - Nuevo archivo en formato base64
   * @param {string} options.mediaType - Tipo de medio ('image' o 'video')
   * @param {string} options.dynamicPath - Path dinámico para el archivo (ej. 'post/email/id')
   * @returns {Promise<{ url: string|null, path: string|null }>} - URL y path actualizados
   */
  async function uploadMedia({
    currentUrl = null,
    currentPath = null,
    newMediaBase64 = null,
    mediaType = '',
    dynamicPath = '',
  }) {
    isUploading.value = true;

    let updatedUrl = currentUrl; // Mantener la URL actual por defecto
    let updatedPath = currentPath; // Mantener el path actual por defecto

    try {
      if (newMediaBase64) {
        // Determinar la extensión según el tipo de medio
        const extension = mediaType === 'image' ? 'jpg' : 'mp4';
        let filepath;

        // Si no hay archivo previo (URL o path), usar el path dinámico con extensión
        if (!currentUrl || !currentPath) {
          filepath = `${dynamicPath}.${extension}`;
          // console.log('Creando nuevo archivo en:', filepath);
        } else {
          // Si ya existe un archivo, sobrescribir en el path actual
          filepath = currentPath;
          // console.log('Actualizando archivo existente en:', filepath);
        }

        // Subir el archivo a Firebase Storage
        await uploadFile(filepath, newMediaBase64);
        updatedUrl = await getFileUrl(filepath);
        updatedPath = filepath; // Actualizar el path
      }

      return { url: updatedUrl, path: updatedPath };
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      throw error; // Permitir que el llamador maneje el error
    } finally {
      isUploading.value = false;
    }
  }

  return {
    uploadMedia,
    isUploading,
  };
}