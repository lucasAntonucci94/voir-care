/**
 * Convierte un archivo a Base64 y devuelve el resultado junto con el tipo de medio.
 * @param {Event} event - Evento de cambio del input file
 * @returns {Promise<{ base64: string, mediaType: 'image' | 'video' | '' }>} Promesa con el Base64 y el tipo
 */
export function fileToBase64(event) {
    return new Promise((resolve, reject) => {
      const file = event.target.files[0];
      if (!file) {
        resolve({ base64: null, mediaType: '' }); // Si no hay archivo, devolvemos valores vacíos
        return;
      }
  
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result; // String Base64 completo
        const mediaType = file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : '';
        resolve({ base64, mediaType });
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  }