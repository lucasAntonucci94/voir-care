import { ref, onUnmounted } from 'vue';
import { getFirestore, addDoc, deleteDoc, doc, collection, onSnapshot, orderBy, query, where, serverTimestamp } from 'firebase/firestore';

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
    const data = {
      user,
      idPost: postId, // Usamos el postId recibido como parámetro
      message,
      timestamp: serverTimestamp(),
    };

    try {
      await addDoc(commentsRef, data);
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
    debugger
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