import { getFirestore, addDoc, setDoc, doc, getDocs, updateDoc, deleteDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where, limit } from "firebase/firestore";
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
      } = locationData

      // Si faltan coords, intentamos geocodificar a partir de address.street
      let lat = address.coordinates?.lat ?? null
      let lng = address.coordinates?.lng ?? null
      if ((lat == null || lng == null) && address.street) {
        try {
          const coords = await getCoordinatesFromAddress(address.street)
          lat = coords.lat
          lng = coords.lng
        } catch (err) {
          console.warn('No se pudieron obtener coordenadas:', err.message)
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
      }

      // Guardamos usando setDoc y usamos el id como documento
      // await addDoc(locationsRef, docData)
      await setDoc(doc(locationsRef, id), docData)
    } catch (err) {
      console.error('Error al grabar el lugar de interés:', err)
      throw err
    }
  }

 /**
 * Actualiza un location completo usando merge,
 * respetando la estructura anidada:
 *   { title, description,
 *     address: { street, coordinates:{lat,lng} },
 *     type,
 *     contact: { phone, socialNetworkLink },
 *     media: { url, path, type },
 *     pending }
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
    } = locationData

    // Re-geocoding si hiciera falta
    let lat = address.coordinates?.lat ?? null
    let lng = address.coordinates?.lng ?? null
    if ((lat == null || lng == null) && address.street) {
      try {
        const coords = await getCoordinatesFromAddress(address.street)
        lat = coords.lat; lng = coords.lng
      } catch (err) {
        console.warn('No se pudieron obtener coordenadas:', err.message)
      }
    }

    // Subir nuevo media si viene base64
    let media = {
      url: newMedia.url || null,
      path: newMedia.path || null,
      type: newMedia.type || null,
    }
    if (newMedia.imageBase64) {
      const dynamicPath = `locations/${locationData.ownerId}/${newGuid()}`
      const upload = await uploadMedia({
        currentUrl: null,
        currentPath: null,
        newMediaBase64: newMedia.imageBase64,
        mediaType: newMedia.type,
        dynamicPath,
      })
      media = {
        url: upload.url,
        path: upload.path,
        type: newMedia.type,
      }
    }

    // Document data con merge
    const docRef = doc(locationsRef, idDoc)
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
    )
  } catch (err) {
    console.error('Error al actualizar el location:', err)
    throw err
  }
}

/**
 * Se suscribe en tiempo real a todos los locations
 * y mapea cada doc a la estructura que espera tu UI/store.
 */
async function subscribeToIncomingLocations(callback) {
  const query = query(locationsRef, orderBy('timestamp', 'desc'))
  return onSnapshot(query, snapshot => {
    const locations = snapshot.docs.map(d => {
      const L = d.data()
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
      }
    })
    callback(locations)
  }, err => {
    console.error('Error en onSnapshot locations:', err)
    throw err
  })
}

/**
 * Devuelve un único location por su campo `id`.
 */
async function getLocationById(id) {
  try {
    const q = query(locationsRef, where('id', '==', id), limit(1))
    const snap = await getDocs(q)
    if (snap.empty) throw new Error('Location no encontrado')
    const d = snap.docs[0]
    const L = d.data()
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
    }
  } catch (err) {
    console.error('Error al obtener location por ID:', err)
    throw err
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