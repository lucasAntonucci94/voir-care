import { getFirestore, addDoc, deleteDoc, doc, getDoc, getDocs, updateDoc, collection, onSnapshot, query, where, orderBy, limit, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { newGuid } from '../utils/newGuid';
import { useStorage } from './useStorage'; // Importamos el composable de storage
import { useNotifications } from './useNotifications'

const { uploadFile, getFileUrl, getFileMetadata } = useStorage();
const db = getFirestore();
const postRef = collection(db, 'posts');

export function usePosts() {
  /**
   * Graba un post en la base de datos.
   * @param {{user: Object, title: string, body: string, categories: Array, imageBase64: string}} data
   * @returns {Promise<void>}
   */
  async function savePost({ title, body, categories, media, user }) {
    try {
      user.isAdmin = false;
      const data = {
        id: newGuid(),
        user,
        title,
        body,
        categories: categories || [],
        created_at: serverTimestamp(),
        media: null,
        likes: [],
        connections: [],
      };

      if (media && media?.imageBase64) {
        const extension = media.type === 'image' ? 'jpg' : 'mp4'; // Dinámico según mediaType
        const filePath = `post/${data.user.email}/${data.id}.${extension}`;
        await uploadFile(filePath, media.imageBase64);
        data.media ={
          path: filePath,
          url: await getFileUrl(filePath),
          type: media.type,
        }
      }

      await addDoc(postRef, data);
    } catch (err) {
      console.error('Error al grabar el post:', err);
      throw err;
    }
  }

   /**
   * Actualiza un post en la base de datos.
   * @param {{user: Object, title: string, body: string, categories: Array, imageBase64: string}} data
   * @returns {Promise<void>}
   */
  async function updatePost(postId, { title, body, categories, media, user }) {
    try {
      const postDocRef = doc(db, 'posts', postId);
      const updatedData = {
        user,
        title,
        body,
        categories: categories || [],
        media: media || null,
        updated_at: serverTimestamp(), // Actualizamos timestamp al editar
      };
      await updateDoc(postDocRef, updatedData);
    } catch (err) {
      console.error('Error al actualizar el post:', err);
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
      const q = query(postRef, orderBy('created_at', 'desc'));
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
            created_at: post.created_at,
            likes: post.likes || [],
            media: post.media ?? null,
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
      const q = query(postRef, where('categories', 'array-contains-any', filters || []), orderBy('created_at', 'desc'));
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
          created_at: post.created_at,
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
      const postDocRef = doc(db, 'posts', id)
      const postSnap = await getDoc(postDocRef)
  
      if (!postSnap.exists()) throw new Error('Post no encontrado')
  
      const post = postSnap.data()
  
      return {
        idDoc: id,
        id: post.id,
        title: post.title,
        body: post.body,
        user: post.user,
        categories: post.categories,
        created_at: post.created_at,
        likes: post.likes || [],
        media: post.media ?? null,
      }
    } catch (err) {
      console.error('Error al obtener post por ID:', err)
      throw err
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
      const { sendNotification } = useNotifications()
      const docRef = doc(db, 'posts', postIdDoc);
      const likeData = {
        userId: userData.id,
        email: userData.email,
        // timestamp: serverTimestamp(),
      };
      await updateDoc(docRef, {
        likes: arrayUnion(likeData), // Agrega el like si no existe
      });
      
      // Obtener datos del post para saber quién es el autor
      const postSnap = await getDoc(docRef)
      const post = postSnap.data()

      // Evitar notificar si el usuario se da like a sí mismo
      if (post.user?.id !== userData.id) {
        await sendNotification({
          toUid: post.user?.id,
          fromUid: userData.id,
          type: 'like',
          message: `${userData.email} le dio me gusta a tu publicación.`,
          entityId: postIdDoc,
          entityType: 'post',
        })
      } 
    } catch (err) {
      console.error('Error al agregar like:', err);
      throw err;
    }
  }

  async function removeLike(postIdDoc, userData) {
    try {
      const docRef = doc(db, 'posts', postIdDoc);
      const likeData = {
        userId: userData.id,
        email: userData.email,
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
      const q = query(postRef, where('user.id', '==', idUser), orderBy('created_at', 'desc'));
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
            created_at: post.created_at,
            likes: post.likes || [],
            media: post.media ?? null,
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

  async function hidePost(userId, postId) {
    try {
      const hiddenPostsRef = collection(db, 'users', userId, 'hiddenPosts');
      await addDoc(hiddenPostsRef, {
        postId,
        created_at: serverTimestamp(),
      });
      return true
    } catch (err) {
      console.error('Error al ocultar el post:', err);
      return false
    }
  }
  async function deleteHiddenPost(userId, postId) {
    try {
      const hiddenPostsRef = collection(db, 'users', userId, 'hiddenPosts');
      const q = query(hiddenPostsRef, where('postId', '==', postId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await deleteDoc(docRef);
        return true;
      }
      return false; // No se encontró el hiddenPost
    } catch (err) {
      console.error('Error al eliminar el hiddenPost:', err);
      return false;
    }
  }

  /**
   * Escucha los últimos 5 posts con categoría "Adopción" en tiempo real.
   * @param {function} callback - Función que recibe un array de posts
   * @returns {function} - Función para cancelar la suscripción
   */
  function subscribeToAdoptionPosts(callback) {
    try {
      const q = query(
        postRef,
        where('categories', 'array-contains', { id: '01fef174-f5e6-432b-bb44-6a156927f0af', name: 'Adopción' }),
        orderBy('created_at', 'desc'),
        limit(5)
      );
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
            created_at: post.created_at,
            likes: post.likes || [],
            media: post.media ?? null,
            userAvatar: post.user.photoURLFile || null, 
            userName: post.user.displayName || post.user.email,
            date: post.created_at ? post.created_at : null,
            image: post.media?.url || null,
          };
        });
        callback(posts);
      });
    } catch (err) {
      console.error('Error al suscribirse a posts de adopción:', err);
      throw err;
    }
  }

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
    hidePost,
    deleteHiddenPost,
    subscribeToAdoptionPosts,
  };
}