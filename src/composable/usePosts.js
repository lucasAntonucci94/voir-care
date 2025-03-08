import { getFirestore, addDoc, deleteDoc, doc, getDocs, updateDoc, collection, onSnapshot, query, where, orderBy, limit, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { newGuid } from '../utils/newGuid';
import { useStorage } from './useStorage'; // Importamos el composable de storage

const { uploadFile, getFileUrl, getFileMetadata } = useStorage();
const db = getFirestore();
const postRef = collection(db, 'posts');

export function usePosts() {
  /**
   * Graba un post en la base de datos.
   * @param {{user: Object, title: string, body: string, categories: Array, imageBase64: string}} data
   * @returns {Promise<void>}
   */
  async function savePost({ user, title, body, categories, imageBase64 }) {
    try {
      user.isAdmin = false; // Valor por defecto, ajustar según lógica
      const data = {
        id: newGuid(),
        user,
        title,
        body,
        categories: categories || [],
        timestamp: serverTimestamp(),
        imagePathFile: null,
        imageUrlFile: null,
        likes: [],
      };
      if (imageBase64) {
        const filePath = `post/${user.email}/${data.id}.jpg`;
        await uploadFile(filePath, imageBase64);
        data.imagePathFile = filePath;
        data.imageUrlFile = await getFileUrl(filePath); // Esperamos la URL directamente
      }

      await addDoc(postRef, data);
    } catch (err) {
      console.error('Error al grabar el post:', err);
      throw err;
    }
  }

  /**
   * Escucha los posts entrantes en tiempo real.
   * @param {function} callback - Función que recibe un array de posts
   * @returns {function} - Función para cancelar la suscripción
   */
  function subscribeToIncomingPosts(callback) {
    try {
      const q = query(postRef, orderBy('timestamp', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const posts = snapshot.docs.map((doc) => {
          const post = doc.data();
          return {
            idDoc: doc.id,
            id: post.id,
            title: post.title,
            body: post.body,
            user: post.user,
            categories: post.categories,
            timestamp: post.timestamp,
            imagePathFile: post.imagePathFile,
            imageUrlFile: post.imageUrlFile,
            likes: post.likes || [],
          };
        });
        callback(posts);
      });
    } catch (err) {
      console.error('Error al suscribirse a posts:', err);
      throw err;
    }
  }

  /**
   * Retorna un listado de publicaciones filtradas.
   * @param {Array} filters - Filtros para categorías
   * @returns {Promise<Array>} - Lista de posts
   */
  async function find(filters) {
    try {
      const posts = [];
      const q = query(postRef, where('categories', 'array-contains-any', filters || []), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        const post = doc.data();
        posts.push({
          idDoc: doc.id,
          id: post.id,
          title: post.title,
          body: post.body,
          user: post.user,
          categories: post.categories,
          timestamp: post.timestamp,
          imagePathFile: post.imagePathFile,
          imageUrlFile: post.imageUrlFile,
        });
      });

      return posts;
    } catch (err) {
      console.error('Error al buscar posts:', err);
      throw err;
    }
  }

  /**
   * Retorna un post por su ID.
   * @param {string} id - ID del post
   * @returns {Promise<Object>} - Datos del post
   */
  async function getPostById(id) {
    try {
      const queryPost = query(postRef, where('id', '==', id), limit(1));
      const snapshot = await getDocs(queryPost);
      if (snapshot.empty) throw new Error('Post no encontrado');

      const post = snapshot.docs[0].data();
      const filePath = `post/${post.user.email}/${post.id}.jpg`;

      return {
        id: post.id,
        title: post.title,
        body: post.body,
        user: post.user,
        timestamp: post.timestamp,
        imagePathFile: post.imagePathFile ?? filePath,
        imageUrlFile: post.imageUrlFile ?? null,
      };
    } catch (err) {
      console.error('Error al obtener post por ID:', err);
      throw err;
    }
  }

  /**
   * Actualiza los datos de un post.
   * @param {string} idDoc - ID del documento en Firestore
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<void>}
   */
  async function updatePost(idDoc, data) {
    try {
      if (data.imageBase64 && data.imageBase64 !== '') {
        const filePath = data.imagePathFile || `post/${data.user.email}/${data.id}.jpg`;
        await uploadFile(filePath, data.imageBase64);
        data.imageUrlFile = await getFileUrl(filePath); // Actualizamos la URL
      }

      const docRef = doc(db, 'posts', idDoc);
      await updateDoc(docRef, {
        title: data.title,
        body: data.body,
        imagePathFile: data.imagePathFile,
        imageUrlFile: data.imageUrlFile ?? null,
      });
    } catch (err) {
      console.error('Error al actualizar post:', err);
      throw err;
    }
  }

  /**
   * Elimina un post por su ID.
   * @param {string} id - ID del documento
   * @returns {Promise<void>}
   */
  async function deletePost(id) {
    try {
      const docRef = doc(db, 'posts', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Error al eliminar post:', err);
      throw err;
    }
  }

  // Nuevo método para agregar un Like
  async function addLike(postIdDoc, userData) {
    try {
      const docRef = doc(db, 'posts', postIdDoc);
      const likeData = {
        userId: userData.id,
        email: userData.email,
        // timestamp: serverTimestamp(),
      };
      await updateDoc(docRef, {
        likes: arrayUnion(likeData), // Agrega el like si no existe
      });
    } catch (err) {
      console.error('Error al agregar like:', err);
      throw err;
    }
  }

  // Nuevo método para quitar un Like
  async function removeLike(postIdDoc, userData) {
    try {
      const docRef = doc(db, 'posts', postIdDoc);
      const likeData = {
        userId: userData.id,
        email: userData.email,
        // No necesitamos email ni timestamp aquí, Firestore compara por igualdad estricta
      };
      await updateDoc(docRef, {
        likes: arrayRemove(likeData), // Quita el like si existe
      });
    } catch (err) {
      console.error('Error al quitar like:', err);
      throw err;
    }
  }

  /**
   * Actualiza el usuario en todos los posts relacionados.
   * @param {{id: string, data: Object}} options - ID y datos del usuario
   * @returns {Promise<void>}
   */
  async function updateUserFromPost( id, data ) {
    try {
      const q = query(postRef, where('user.id', '==', id));
      const postQuerySnapshot = await getDocs(q);
      const postIds = postQuerySnapshot.docs.map((doc) => doc.id);

      await Promise.all(
        postIds.map((idPost) =>
          updateDoc(doc(db, 'posts', idPost), {
            user: {
              id,
              ...data,
            },
          })
        )
      );
    } catch (err) {
      console.error('Error al actualizar usuario en posts:', err);
      throw err;
    }
  }

  /**
   * Escucha los posts de un perfil específico en tiempo real.
   * @param {string} idUser - ID del usuario
   * @param {function} callback - Función que recibe un array de posts
   * @returns {function} - Función para cancelar la suscripción
   */
  function subscribeToIncomingProfilePosts(idUser, callback) {
    try {
      const q = query(postRef, where('user.id', '==', idUser), orderBy('timestamp', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const posts = snapshot.docs.map((doc) => {
          const post = doc.data();
          return {
            idDoc: doc.id,
            id: post.id,
            user: post.user,
            title: post.title,
            body: post.body,
            image: post.image,
            timestamp: post.timestamp,
            imagePathFile: post.imagePathFile,
            imageUrlFile: post.imageUrlFile ?? null,
          };
        });
        callback(posts);
      });
    } catch (err) {
      console.error('Error al suscribirse a posts del perfil:', err);
      throw err;
    }
  }

  /**
   * Actualiza la imagen de usuario en un array de posts.
   * @param {Array} posts - Lista de posts
   * @param {string} photoURLFile - Nueva URL de la imagen
   * @returns {Array} - Posts actualizados
   */
  function reloadPostImage(posts, photoURLFile) {
    try {
      return posts.map((post) => ({
        ...post,
        photoURLFile,
      }));
    } catch (err) {
      console.error('Error al recargar imágenes de posts:', err);
      return [];
    }
  }

  // Devolvemos las funciones para usarlas en los componentes
  return {
    savePost,
    subscribeToIncomingPosts,
    find,
    getPostById,
    updatePost,
    deletePost,
    updateUserFromPost,
    subscribeToIncomingProfilePosts,
    reloadPostImage,
    addLike,
    removeLike,
  };
}