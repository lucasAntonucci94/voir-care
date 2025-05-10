import { ref } from 'vue';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export function useGoogleMaps() {
  const isGoogleMapsLoaded = ref(false);
  let geocoder = null;

  // Cargar las librerias de Google Maps
  const loadGoogleMaps = async () => {
    if (isGoogleMapsLoaded.value) return Promise.resolve();

    // Cargar siempre 'marker' y 'places'
    const libraries = ['marker', 'places'];

    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        geocoder = new window.google.maps.Geocoder();
        isGoogleMapsLoaded.value = true;
        resolve();
      } else {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&v=beta&libraries=${libraries.join(',')}`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          geocoder = new window.google.maps.Geocoder();
          isGoogleMapsLoaded.value = true;
          resolve();
        };
        script.onerror = () => {
          reject(new Error('No se pudo cargar Google Maps. Verifica la conexión o la clave de API.'));
        };
        document.head.appendChild(script);
      }
    });
  };

  // Obtener coordenadas a partir de una dirección
  const getCoordinatesFromAddress = async (address) => {
    if (!isGoogleMapsLoaded.value) {
      await loadGoogleMaps();
    }

    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const { lat, lng } = results[0].geometry.location;
          resolve({
            lat: lat(),
            lng: lng(),
          });
        } else {
          reject(new Error('No se pudieron obtener las coordenadas para la dirección: ' + address));
        }
      });
    });
  };

  return {
    loadGoogleMaps,
    getCoordinatesFromAddress,
    isGoogleMapsLoaded,
  };
}