import { getFirestore, addDoc, doc, getDocs, updateDoc, deleteDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where, limit } from "firebase/firestore";
import { newGuid } from '../utils/newGuid';
import { useGoogleMaps } from './useGoogleMaps';
import { useStorage } from '../composable/useStorage';

const db = getFirestore();
const locationRef = collection(db, 'locations');

export function useLocations() {
    const { getCoordinatesFromAddress } = useGoogleMaps();
    const { uploadFile, getFileUrl } = useStorage();

  /**
   * Graba un lugar de interés en la base de datos
   */
  async function saveLocation({ title, detail, address, phone, socialNetworkLink, type, photo, pending }) {
    try {
      let lat = null;
      let lng = null;
      try {
        const coords = await getCoordinatesFromAddress(address);
        lat = coords.lat;
        lng = coords.lng;
      } catch (err) {
        console.warn('No se pudieron obtener coordenadas:', err.message);
      }

      const data = {
        id: newGuid(),
        title,
        detail,
        address,
        phone,
        type,
        socialNetworkLink,
        timestamp: serverTimestamp(),
        imagePathFile: null,
        imageUrlFile: null,
        pending: pending ?? true,
        lat,
        lng
      };

      if (photo?.imageBase64) {
        const filePath = `location/${data.id}.jpg`;
        await uploadFile(filePath, photo.imageBase64, {
          customMetadata: photo.dimensions || {}
        });
        data.imagePathFile = filePath;
        data.imageUrlFile = await getFileUrl(filePath);
      }

      await addDoc(locationRef, data);
    } catch (err) {
      console.error('Error al grabar el lugar de interés:', err);
      throw err;
    }
  }

  /**
   * Actualiza un location en la base de datos
   */
  async function updateLocation(locationIdDoc, { title, detail, address, phone, socialNetworkLink, type, photo, pending }) {
    try {
      const docRef = doc(db, 'locations', locationIdDoc);

      let lat = null;
      let lng = null;
      if (address) {
        try {
          const coords = await getCoordinatesFromAddress(address);
          lat = coords.lat;
          lng = coords.lng;
        } catch (err) {
          console.warn('No se pudieron obtener coordenadas:', err.message);
        }
      }

      const updatedData = {
        title,
        detail,
        address,
        phone,
        type,
        socialNetworkLink,
        imagePathFile: null,
        imageUrlFile: null,
        pending: pending ?? true,
        lat,
        lng,
        updated_at: serverTimestamp()
      };

      if (photo?.imageBase64) {
        const filePath = `location/${locationIdDoc}.jpg`;
        await uploadFile(filePath, photo.imageBase64, {
          customMetadata: photo.dimensions || {}
        });
        updatedData.imagePathFile = filePath;
        updatedData.imageUrlFile = await getFileUrl(filePath);
      }

      await updateDoc(docRef, updatedData);
    } catch (err) {
      console.error('Error al actualizar el location:', err);
      throw err;
    }
  }

  function subscribeToIncomingLocations(callback) {
    try {
      const q = query(locationRef, orderBy('timestamp', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const locations = snapshot.docs.map(doc => {
          const location = doc.data();
          return {
            idDoc: doc.id,
            id: location.id,
            title: location.title,
            detail: location.detail,
            address: location.address,
            phone: location.phone,
            type: location.type,
            socialNetworkLink: location.socialNetworkLink,
            timestamp: location.timestamp,
            imagePathFile: location.imagePathFile ?? null,
            imageUrlFile: location.imageUrlFile ?? null,
            pending: location.pending ?? true,
            lat: location.lat ?? null,
            lng: location.lng ?? null
          };
        });
        callback(locations);
      });
    } catch (err) {
      console.error('Error al suscribirse a locations:', err);
      throw err;
    }
  }

  async function getLocationById(id) {
    try {
      const q = query(locationRef, where('id', '==', id), limit(1));
      const snapshot = await getDocs(q);
      if (snapshot.empty) throw new Error('Location no encontrado');

      const location = snapshot.docs[0].data();
      return {
        idDoc: snapshot.docs[0].id,
        id: location.id,
        title: location.title,
        detail: location.detail,
        address: location.address,
        phone: location.phone,
        type: location.type,
        socialNetworkLink: location.socialNetworkLink,
        timestamp: location.timestamp,
        imagePathFile: location.imagePathFile ?? null,
        imageUrlFile: location.imageUrlFile ?? null,
        pending: location.pending ?? true,
        lat: location.lat ?? null,
        lng: location.lng ?? null
      };
    } catch (err) {
      console.error('Error al obtener location por ID:', err);
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
        updated_at: serverTimestamp()
      });
    } catch (err) {
      console.error('Error al cambiar estado de location:', err);
      throw err;
    }
  }

  return {
    saveLocation,
    subscribeToIncomingLocations,
    getLocationById,
    updateLocation,
    deleteLocation,
    changeStateLocation
  };
}