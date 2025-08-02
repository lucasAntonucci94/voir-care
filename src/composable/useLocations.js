import { getFirestore, addDoc, setDoc, doc, getDocs, getDoc, updateDoc, deleteDoc, collection, onSnapshot, orderBy, query as firebaseQuery, serverTimestamp, where, limit } from "firebase/firestore";
import { newGuid } from '../utils/newGuid';
import { useGoogleMaps } from './useGoogleMaps';
import { useStorage } from '../composable/useStorage';

const db = getFirestore();
const locationsRef = collection(db, 'locations');

export function useLocations() {
  const { getCoordinatesFromAddress } = useGoogleMaps();
  const { uploadFile, getFileUrl } = useStorage();

  /**
   * Graba un lugar de interés en la base de datos
   * con la nueva estructura de datos:
   * {
   *   id,
   *   title,
   *   description,
   *   address: { street, coordinates: { lat, lng } },
   *   type,
   *   contact: { phone, socialNetworkLink },
   *   media: { url, path, type },
   *   timestamp,
   *   pending,
   *   user: {}
   * }
   */
  async function saveLocation(locationData) {
    try {
      const {
        id = newGuid(),
        title,
        description,
        address,
        type,
        contact = {},
        media = {},
        timestamp = serverTimestamp(),
        pending = true,
        user,
      } = locationData;
      // Si faltan coords, intentamos geocodificar a partir de address.street
      let lat = address.coordinates?.lat ?? null;
      let lng = address.coordinates?.lng ?? null;
      if ((lat == null || lng == null) && address.street) {
        try {
          const coords = await getCoordinatesFromAddress(address.street);
          lat = coords.lat;
          lng = coords.lng;
        } catch (err) {
          console.warn('No se pudieron obtener coordenadas:', err.message);
        }
      }

      const docData = {
        id,
        title,
        description,
        address: {
          street: address.street,
          coordinates: { lat, lng },
        },
        type,
        contact: {
          phone: contact.phone || null,
          socialNetworkLink: contact.socialNetworkLink || null,
        },
        media: {
          url: media.url || null,
          path: media.path || null,
          type: media.type || null,
        },
        timestamp,
        pending,
        user,
      };

      // Guardamos usando setDoc y usamos el id como documento
      await setDoc(doc(locationsRef, id), docData);
    } catch (err) {
      console.error('Error al grabar el lugar de interés:', err);
      throw err;
    }
  }

  /**
   * Actualiza un location
   */
  async function updateLocation(idDoc, locationData) {
    try {
      const {
        title,
        description,
        address,
        type,
        contact = {},
        media: newMedia = {},
        pending,
      } = locationData;

      // Re-geocoding si hiciera falta
      let lat = address.coordinates?.lat ?? null;
      let lng = address.coordinates?.lng ?? null;
      if ((lat == null || lng == null) && address.street) {
        try {
          const coords = await getCoordinatesFromAddress(address.street);
          lat = coords.lat;
          lng = coords.lng;
        } catch (err) {
          console.warn('No se pudieron obtener coordenadas:', err.message);
        }
      }

      // Subir nuevo media si viene base64
      let media = {
        url: newMedia.url || null,
        path: newMedia.path || null,
        type: newMedia.type || null,
      };
      if (newMedia.imageBase64) {
        const dynamicPath = `locations/${locationData.ownerId}/${newGuid()}`;
        const upload = await uploadFile(newMedia.imageBase64, dynamicPath);
        media = {
          url: upload.url,
          path: dynamicPath,
          type: newMedia.type,
        };
      }

      // Document data con merge
      const docRef = doc(locationsRef, idDoc);
      await setDoc(
        docRef,
        {
          title,
          description,
          address: {
            street: address.street,
            coordinates: { lat, lng },
          },
          type,
          contact: {
            phone: contact.phone || null,
            socialNetworkLink: contact.socialNetworkLink || null,
          },
          media,
          pending,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error('Error al actualizar el location:', err);
      throw err;
    }
  }

  /**
   * Se suscribe en tiempo real a todos los locations
   * y mapea cada doc a la estructura que espera tu UI/store.
   */
  function subscribeToIncomingLocations(callback) {
    try {
      const q = firebaseQuery(locationsRef, orderBy('timestamp', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const locations = snapshot.docs.map((d) => {
          const L = d.data();
          return {
            idDoc: d.id,
            id: L.id,
            title: L.title,
            description: L.description,
            address: L.address, // { street, coordinates:{lat,lng} }
            type: L.type,
            contact: L.contact, // { phone, socialNetworkLink }
            media: L.media, // { url, path, type }
            timestamp: L.timestamp,
            pending: L.pending,
            user: L.user,
          };
        });

        callback(locations);
      }, (err) => {
        console.error('Error en onSnapshot locations:', err);
        throw err;
      });
    } catch (err) {
      console.error('Error setting up location subscription:', err);
      throw err;
    }
  }

  /**
   * Se suscribe en tiempo real a los locations creados por un usuario específico.
   * y mapea cada doc a la estructura que espera tu UI/store.
   * @param {string} userId - El ID del usuario (user.uid o user.id) para filtrar las locations.
   * @param {function(Array<Object>): void} callback - La función que se llamará con las locations del usuario.
   * @returns {function(): void} Una función para cancelar la suscripción.
   */
  function subscribeToUserLocations(userId, callback) {
    if (!userId) {
      console.warn('subscribeToUserLocations: userId es nulo o indefinido. No se establecerá la suscripción.');
      // Podrías llamar al callback con un array vacío o manejarlo como prefieras
      callback([]);
      return () => {}; // Retorna una función vacía para cancelar
    }

    try {
      // Construye la consulta: filtra por 'user.id' y ordena por 'timestamp'
      const q = firebaseQuery(
        locationsRef,
        where('user.id', '==', userId), // Filtra por el ID del usuario
        orderBy('timestamp', 'desc')
      );

      // Establece la suscripción en tiempo real
      return onSnapshot(q, (snapshot) => {
        const userLocations = snapshot.docs.map((d) => {
          const L = d.data();
          return {
            idDoc: d.id, // ID del documento en Firestore
            id: L.id, // ID interno de la ubicación (si lo tienes)
            title: L.title,
            description: L.description,
            address: L.address,
            type: L.type,
            contact: L.contact,
            media: L.media,
            timestamp: L.timestamp, // Firebase Timestamp
            pending: L.pending,
            user: L.user, // Información del usuario que creó la ubicación
          };
        });

        callback(userLocations);
      }, (err) => {
        console.error('Error en onSnapshot para locations del usuario:', err);
        // Puedes manejar el error aquí o dejar que se propague
        throw err;
      });
    } catch (err) {
      console.error('Error al configurar la suscripción de locations del usuario:', err);
      throw err;
    }
  }

  /**
   * Devuelve un único location por su campo `id`.
   */
  async function getLocationById(id) {
    try {
      const q = firebaseQuery(locationsRef, where('id', '==', id), limit(1));
      const snap = await getDocs(q);
      if (snap.empty) throw new Error('Location no encontrado');
      const d = snap.docs[0];
      const L = d.data();
      return {
        idDoc: d.id,
        id: L.id,
        title: L.title,
        description: L.description,
        address: L.address,
        type: L.type,
        contact: L.contact,
        media: L.media,
        timestamp: L.timestamp,
        pending: L.pending,
        user: L.user,
      };
    } catch (err) {
      console.error('Error al obtener location por ID:', err);
      throw err;
    }
  }

  /**
   * Devuelve un único location por su ID de documento de Firestore (`idDoc`).
   * @param {string} idDoc - El ID del documento en Firestore.
   * @returns {Promise<Object>} La data del location o null si no existe.
   */
  async function getLocationByIdDoc(idDoc) {
    try {
      const docRef = doc(locationsRef, idDoc);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.warn('No se encontró el documento con idDoc:', idDoc);
        return null;
      }

      const L = docSnap.data();
      return {
        idDoc: docSnap.id,
        id: L.id,
        title: L.title,
        description: L.description,
        address: L.address,
        type: L.type,
        contact: L.contact,
        media: L.media,
        timestamp: L.timestamp,
        pending: L.pending,
        user: L.user,
      };
    } catch (err) {
      console.error('Error al obtener location por idDoc:', err);
      throw err;
    }
  }

  async function deleteLocation(idDoc) {
    try {
      const docRef = doc(db, 'locations', idDoc);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Error al eliminar location:', err);
      throw err;
    }
  }
  
  async function changeStateLocation(location) {
    try {
      const docRef = doc(db, 'locations', location.idDoc);
      await updateDoc(docRef, {
        pending: !location.pending,
        updated_at: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error al cambiar estado de location:', err);
      throw err;
    }
  }

  /**
   * Obtiene la cantidad total de reels en la colección reels.
   * @returns {Promise<number>} - La cantidad de reels.
   */
  async function getAllCount() {
    try {
      const querySnapshot = await getDocs(locationsRef);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error al contar todas las locations:', error);
      throw error;
    }
  }

  return {
    saveLocation,
    subscribeToIncomingLocations,
    getLocationById,
    getLocationByIdDoc,
    updateLocation,
    deleteLocation,
    changeStateLocation,
    subscribeToUserLocations,
    getAllCount,
  };
}