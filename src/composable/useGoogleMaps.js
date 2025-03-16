// src/composable/useGoogleMaps.js
import { ref } from 'vue';

// Clave de la API de Google Maps (idealmente en un .env)
const GOOGLE_MAPS_API_KEY = 'AIzaSyDbCImtrddG3Zm7roBIeYMWug-rsfoCH7c';

export function useGoogleMaps() {
  const isGoogleMapsLoaded = ref(false);
  let geocoder = null;

  // Cargar la biblioteca de Google Maps dinámicamente
  const loadGoogleMaps = async (options = {}) => {
    if (isGoogleMapsLoaded.value) return Promise.resolve();

    const defaultOptions = {
      libraries: ['places'], // Mantener places para geocoder
    };
    const { libraries } = { ...defaultOptions, ...options };

    // Añadir 'marker' si no está en la lista
    if (!libraries.includes('marker')) {
      libraries.push('marker');
    }

    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        geocoder = new window.google.maps.Geocoder();
        isGoogleMapsLoaded.value = true;
        resolve();
      } else {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=${libraries.join(',')}`;
        script.async = true;
        script.onload = () => {
          geocoder = new window.google.maps.Geocoder();
          isGoogleMapsLoaded.value = true;
          resolve();
        };
        script.onerror = () => reject(new Error('No se pudo cargar Google Maps'));
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