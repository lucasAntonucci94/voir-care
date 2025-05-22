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
import { useNotifications } from './useNotifications'; // Asegúrate de tener este composable para las notificaciones
import { newGuid } from '../utils/newGuid';
import { id } from 'date-fns/locale';

const db = getFirestore();
const { user } = useAuth();
const { uploadFile, getFileUrl } = useStorage();
const { sendNotification } = useNotifications();

export function useGroupPosts() {
  const isLoading = ref(false);

  /**
   * Crea un nuevo post en la subcolección de posts de un grupo.
   * @param {string} idGroup - ID del grupo
   * @param {Object} postData - Datos del post
   * @returns {Promise<void>}
   */
  async function createPostGroup(idGroup, postData) {
    if(!idGroup) {
      console.error('ID del grupo no proporcionado');
      return;
    }
    if(!postData) { 
      console.error('Datos del post no proporcionados');
      return;
    }
    if(!user.value) {
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
        const filePath = `groups/${idGroup}/posts/${user.value.email}/${postData.id}.${extension}`;
        await uploadFile(filePath, postData.media.imageBase64);
        postData.media = {
          path: filePath,
          url: await getFileUrl(filePath),
          type: postData.media.type,
        };
      }

      const postsRef = collection(db, 'groups', idGroup, 'posts');
      await addDoc(postsRef, {
        ...postData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creando post en grupo:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Suscribe a los posts de un grupo específico.
   * @param {string} groupId - ID del grupo
   * @param {Function} callback - Función que recibe los posts
   * @returns {Function} - Función para desuscribirse
   */
  function suscribePostsByGroupId(group, callback) {
    try {
      const postsRef = collection(db, 'groups', group.idDoc, 'posts');
      const q = query(postsRef, orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const posts = snapshot.docs.map((docSnap) => {
          const post = docSnap.data();
          return {
            idDoc: docSnap.id,
            ...post,
            group : {...group,  id: group.idDoc},
          };
        });
        
        callback(posts);
      });
    } catch (error) {
      console.error('Error al suscribirse a los posts del grupo:', error);
      throw error;
    }
  }

  /**
   * Actualiza un post en la subcolección de posts de un grupo.
   * @param {string} idGroup - ID del grupo
   * @param {string} postId - ID del post
   * @param {Object} data - Datos actualizados del post
   * @returns {Promise<void>}
   */
  async function updatePostGroup(idGroup, postId, { title, body, categories, media, user }) {
    try {
      isLoading.value = true;
      const postDocRef = doc(db, 'groups', idGroup, 'posts', postId);
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
      console.error('Error al actualizar el post en grupo:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Obtiene un post por su ID desde la subcolección de posts de un grupo.
   * @param {string} idGroup - ID del grupo
   * @param {string} postId - ID del post
   * @returns {Promise<Object>} - Datos del post
   */
  async function getPostById(idGroup, postId) {
    try {
      const postDocRef = doc(db, 'groups', idGroup, 'posts', postId);
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
   * Elimina un post por su ID desde la subcolección de posts de un grupo.
   * @param {string} idGroup - ID del grupo
   * @param {string} postId - ID del post
   * @returns {Promise<void>}
   */
  async function deletePostGroup(idGroup, postId) {
    try {
      isLoading.value = true;
      const postDocRef = doc(db, 'groups', idGroup, 'posts', postId);
      await deleteDoc(postDocRef);
    } catch (error) {
      console.error('Error al eliminar post en grupo:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Agrega un like a un post en la subcolección de posts de un grupo.
   * @param {string} idGroup - ID del grupo
   * @param {string} postIdDoc - ID del documento del post
   * @param {Object} userData - Datos del usuario que da el like
   * @returns {Promise<void>}
   */
  async function addLikePostGroup(idGroup, postIdDoc, userData) {
    try {
      isLoading.value = true;
      const postDocRef = doc(db, 'groups', idGroup, 'posts', postIdDoc);
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
          message: `${userData.email} le dio like a tu publicación en el grupo.`,
          entityId: postIdDoc,
          entityType: 'groupPost',
        });
      }
    } catch (error) {
      console.error('Error al agregar like en post de grupo:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Quita un like de un post en la subcolección de posts de un grupo.
   * @param {string} idGroup - ID del grupo
   * @param {string} postIdDoc - ID del documento del post
   * @param {Object} userData - Datos del usuario que quita el like
   * @returns {Promise<void>}
   */
  async function removeLikePostGroup(idGroup, postIdDoc, userData) {
    try {
      isLoading.value = true;
      const postDocRef = doc(db, 'groups', idGroup, 'posts', postIdDoc);
      const likeData = {
        userId: userData.id,
        email: userData.email,
      };
      await updateDoc(postDocRef, {
        likes: arrayRemove(likeData),
      });
    } catch (error) {
      console.error('Error al quitar like en post de grupo:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Oculta un post para un usuario específico.
   * @param {string} userId - ID del usuario
   * @param {string} postId - ID del post
   * @returns {Promise<boolean>} - True si se ocultó correctamente, false si falló
   */
  async function hidePostGroup(userId, postId) {
    try {
      isLoading.value = true;
      const hiddenGroupPostsRef = collection(db, 'users', userId, 'hiddenGroupPosts');
      await addDoc(hiddenGroupPostsRef, {
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
    createPostGroup,
    suscribePostsByGroupId,
    updatePostGroup,
    getPostById,
    deletePostGroup,
    addLikePostGroup,
    removeLikePostGroup,
    hidePostGroup,
  };
}