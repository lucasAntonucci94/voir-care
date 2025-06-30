import { ref } from 'vue';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  deleteDoc,
  getDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { useAuth } from '../api/auth/useAuth';
import { useStorage } from './useStorage';
import { useNotifications } from './useNotifications';
import { newGuid } from '../utils/newGuid';

const db = getFirestore();
const { user } = useAuth();
const { uploadFile, getFileUrl } = useStorage();
const { sendNotification } = useNotifications();

export function useEventPosts() {
  const isLoading = ref(false);

  /**
   * Creates a new post in the event's posts subcollection.
   * @param {string} idEvent - ID of the event
   * @param {Object} postData - Post data
   * @returns {Promise<void>}
   */
  async function createPostEvent(idEvent, postData) {
    if (!idEvent) {
      console.error('ID del evento no proporcionado');
      return;
    }
    if (!postData) {
      console.error('Datos del post no proporcionados');
      return;
    }
    if (!user.value) {
      console.error('Usuario no autenticado');
      return;
    }

    try {
      isLoading.value = true;
      postData.id = newGuid();
      postData.user = {
        id: user.value?.uid,
        displayName: user.value?.displayName,
        email: user.value?.email,
        photoURLFile: user.value?.photoURLFile,
        photoPath: user.value?.photoPathFile,
      };

      if (postData.media && postData.media.imageBase64) {
        const extension = postData.media.type === 'image' ? 'jpg' : 'mp4';
        const filePath = `events/${idEvent}/posts/${user.value.email}/${postData.id}.${extension}`;
        await uploadFile(filePath, postData.media.imageBase64);
        postData.media = {
          path: filePath,
          url: await getFileUrl(filePath),
          type: postData.media.type,
        };
      }

      const postsRef = collection(db, 'events', idEvent, 'posts');
      await addDoc(postsRef, {
        ...postData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creando post en evento:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Subscribes to posts of a specific event.
   * @param {Object} event - Event object
   * @param {Function} callback - Callback to receive posts
   * @returns {Function} - Unsubscribe function
   */
  function subscribePostsByEventId(event, callback) {
    try {
      const postsRef = collection(db, 'events', event.idDoc, 'posts');
      const q = query(postsRef, orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const posts = snapshot.docs.map((docSnap) => {
          const post = docSnap.data();
          return {
            idDoc: docSnap.id,
            ...post,
            event: { ...event, id: event.idDoc },
            group: { ...event, id: event.idDoc }, //borrar
          };
        });
        callback(posts);
      });
    } catch (error) {
      console.error('Error al suscribirse a los posts del evento:', error);
      throw error;
    }
  }

  /**
   * Updates a post in the event's posts subcollection.
   * @param {string} idEvent - ID of the event
   * @param {string} postId - ID of the post
   * @param {Object} data - Updated post data
   * @returns {Promise<void>}
   */
  async function updatePostEvent(idEvent, postId, { title, body, categories, media, user }) {
    try {
      isLoading.value = true;
      const postDocRef = doc(db, 'events', idEvent, 'posts', postId);
      const updatedData = {
        user,
        title,
        body,
        categories: categories || [],
        media: media || null,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(postDocRef, updatedData);
    } catch (error) {
      console.error('Error al actualizar el post en evento:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetches a post by its ID from the event's posts subcollection.
   * @param {string} idEvent - ID of the event
   * @param {string} postId - ID of the post
   * @returns {Promise<Object>} - Post data
   */
  async function getPostById(idEvent, postId) {
    try {
      const postDocRef = doc(db, 'events', idEvent, 'posts', postId);
      const postSnap = await getDoc(postDocRef);

      if (!postSnap.exists()) throw new Error('Post no encontrado');

      const post = postSnap.data();
      return {
        idDoc: postId,
        id: post.id,
        title: post.title,
        body: post.body,
        user: post.user,
        categories: post.categories,
        createdAt: post.createdAt,
        likes: post.likes || [],
        media: post.media ?? null,
      };
    } catch (error) {
      console.error('Error al obtener post por ID:', error);
      throw error;
    }
  }

  /**
   * Deletes a post by its ID from the event's posts subcollection.
   * @param {string} idEvent - ID of the event
   * @param {string} postId - ID of the post
   * @returns {Promise<void>}
   */
  async function deletePostEvent(idEvent, postId) {
    try {
      isLoading.value = true;
      const postDocRef = doc(db, 'events', idEvent, 'posts', postId);
      await deleteDoc(postDocRef);
    } catch (error) {
      console.error('Error al eliminar post en evento:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Adds a like to a post in the event's posts subcollection.
   * @param {string} idEvent - ID of the event
   * @param {string} postIdDoc - ID of the post document
   * @param {Object} userData - Data of the user liking the post
   * @returns {Promise<void>}
   */
  async function addLikePostEvent(idEvent, postIdDoc, userData) {
    try {
      isLoading.value = true;
      const postDocRef = doc(db, 'events', idEvent, 'posts', postIdDoc);
      const likeData = {
        userId: userData.id,
        email: userData.email,
      };
      await updateDoc(postDocRef, {
        likes: arrayUnion(likeData),
      });

      const postSnap = await getDoc(postDocRef);
      const post = postSnap.data();

      if (post.user?.id !== userData.id) {
        await sendNotification({
          toUid: post.user?.id,
          fromUid: userData.id,
          type: 'like',
          message: `${userData.email} le dio me gusta a tu publicación en el evento.`,
          entityId: postIdDoc,
          entityType: 'eventPost',
        });
      }
    } catch (error) {
      console.error('Error al agregar like en post de evento:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Removes a like from a post in the event's posts subcollection.
   * @param {string} idEvent - ID of the event
   * @param {string} postIdDoc - ID of the post document
   * @param {Object} userData - Data of the user removing the like
   * @returns {Promise<void>}
   */
  async function removeLikePostEvent(idEvent, postIdDoc, userData) {
    try {
      isLoading.value = true;
      const postDocRef = doc(db, 'events', idEvent, 'posts', postIdDoc);
      const likeData = {
        userId: userData.id,
        email: userData.email,
      };
      await updateDoc(postDocRef, {
        likes: arrayRemove(likeData),
      });
    } catch (error) {
      console.error('Error al quitar like en post de evento:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Hides a post for a specific user.
   * @param {string} userId - ID of the user
   * @param {string} postId - ID of the post
   * @returns {Promise<boolean>} - True if hidden successfully, false if failed
   */
  async function hidePostEvent(userId, postId) {
    try {
      isLoading.value = true;
      const hiddenEventPostsRef = collection(db, 'users', userId, 'hiddenEventPosts');
      await addDoc(hiddenEventPostsRef, {
        postId,
        createdAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error al ocultar el post:', error);
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    isLoading,
    createPostEvent,
    subscribePostsByEventId,
    updatePostEvent,
    getPostById,
    deletePostEvent,
    addLikePostEvent,
    removeLikePostEvent,
    hidePostEvent,
  };
}