/**
 * Genera una miniatura de un video a partir de un fotograma específico.
 * La miniatura se retorna en formato Base64 con una relación de aspecto 1:1 (cuadrada).
 * @param {string} videoUrl - La URL del video del cual se extraerá la miniatura.
 * @param {number} [time=2] - El tiempo en segundos (fotograma) desde el cual se tomará la miniatura.
 * @param {number} [size=128] - El tamaño deseado para el lado de la miniatura cuadrada (ej. 128px).
 * @returns {Promise<string>} Una promesa que resuelve con la URL Base64 de la imagen thumbnail.
 * Rechaza si hay un error al cargar el video o generar la miniatura.
 */
export function generateVideoThumbnail(videoUrl, time = 2, size = 128) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = videoUrl;
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;

    // Manejar errores de carga del video
    video.onerror = (e) => {
      const error = e.target.error;
      const errorDetails = {
        code: error?.code,
        message: error?.message || 'Error desconocido',
        url: videoUrl
      };
      console.error('Error al cargar el video:', errorDetails);
      reject(new Error(`No se pudo cargar el video: ${errorDetails.message} (Código: ${errorDetails.code})`));
    };

    // Cuando los metadatos del video estén cargados
    video.onloadedmetadata = () => {
      if (!video.duration || isNaN(video.duration)) {
        reject(new Error('El video no tiene una duración válida'));
        return;
      }

      const safeTime = Math.min(time, video.duration - 0.1);
      if (safeTime < 0) {
        reject(new Error('El tiempo especificado es inválido'));
        return;
      }

      video.currentTime = safeTime;
    };

    // Cuando el video haya buscado el tiempo especificado
    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (video.videoWidth === 0 || video.videoHeight === 0) {
          reject(new Error('El video no tiene dimensiones válidas'));
          return;
        }

        const minDimension = Math.min(video.videoWidth, video.videoHeight);
        canvas.width = size;
        canvas.height = size;

        const sx = (video.videoWidth - minDimension) / 2;
        const sy = (video.videoHeight - minDimension) / 2;

        ctx.drawImage(video, sx, sy, minDimension, minDimension, 0, 0, size, size);

        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataURL);

        video.src = '';
        video.remove();
      } catch (error) {
        console.error('Error al generar el thumbnail:', error);
        reject(new Error('No se pudo generar el thumbnail: ' + error.message));
      }
    };

    video.onseeking = () => {
      if (video.currentTime === 0 && video.readyState < 2) {
        reject(new Error('El video no está listo para buscar el fotograma'));
      }
    };

    video.load();
  });
}