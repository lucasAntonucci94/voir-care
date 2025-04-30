import { ref, onUnmounted } from 'vue';
import { getFirestore, addDoc, deleteDoc, doc, collection, onSnapshot, orderBy, query, where, serverTimestamp } from 'firebase/firestore';
import { usePosts } from './usePosts'
import { useNotifications } from './useNotifications'

const db = getFirestore();
const commentsRef = collection(db, 'comments');

export function useComments(postId) {
  const comments = ref([]);
  let unsubscribe = null;

  /**
   * Graba un comentario en la base de datos.
   * @param {{user: { id: String, displayName: String }, message: string}} data
   * @returns {Promise<void>}
   */
  async function saveComment({ user, message }) {
    const { sendNotification } = useNotifications()
    const { getPostById } = usePosts()
    
    const data = {
      user,
      idPost: postId,
      message,
      timestamp: serverTimestamp(),
    };

    try {
      await addDoc(commentsRef, data);
      // Enviar notificación al autor del post
      const post = await getPostById(postId)
      const postOwnerId = post?.ownerId || post?.user?.id

      if (postOwnerId && postOwnerId !== user.id) {
        await sendNotification({
          toUid: postOwnerId,
          fromUid: user.id,
          type: 'comment',
          message: `${user.displayName} comentó tu publicación.`,
          entityId: postId,
          entityType: 'post',
          extra: {
            postTitle: post?.title || '',
          }
        })
      }
    } catch (err) {
      console.error('Error al grabar el comentario:', err);
      throw err;
    }
  }
  
  /**
   * Elimina un comentario por su ID.
   * @param {string} id - ID del comentario
   * @returns {Promise<void>}
   */
  async function deleteComment(idDoc) {
    try {
      const docRef = doc(db, 'comments', idDoc);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Error al eliminar post:', err);
      throw err;
    }
  }
  
  /**
   * Suscribe a los comentarios de un post específico en tiempo real.
   */
  function subscribeToComments() {
    if (!postId) {
      console.warn('No se proporcionó un postId para suscribirse a comentarios');
      return;
    }

    // const q = query(commentsRef, where('idPost', '==', postId), orderBy('timestamp'));
    const q = query(commentsRef, where('idPost', '==', postId), orderBy('timestamp', 'desc'));
    unsubscribe = onSnapshot(q, (snapshot) => {
      comments.value = snapshot.docs.map(doc => ({
        idDoc: doc.id,
        idPost: doc.data().idPost,
        message: doc.data().message,
        user: doc.data().user,
        timestamp: doc.data().timestamp
      }));
    }, (err) => {
      console.error('Error al escuchar comentarios:', err);
    });
  }

  // Iniciar la suscripción si hay un postId
  if (postId) {
    subscribeToComments();
  }

  // Limpiar la suscripción al desmontar
  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  return {
    comments, // Lista reactiva de comentarios
    saveComment, // Método para guardar un comentario
    deleteComment, // Método para guardar un comentario
  };
}