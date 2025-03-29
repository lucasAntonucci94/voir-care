import { getFirestore, addDoc, deleteDoc, doc, getDocs, updateDoc, collection, onSnapshot, query, where, orderBy, limit, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { newGuid } from '../utils/newGuid';
import { useStorage } from './useStorage';

const db = getFirestore();
const reportRef = collection(db, 'reports');

export function useReports() {
  /**
   * Graba un reporte en la base de datos.
   * @param {{postId: string, userId: string, reason: string}} data
   * @returns {Promise<void>}
   */
  async function saveReport(postId, userId, reason = 'No especificado', description) {
    debugger
    try {
      const reportData = {
        reportId: newGuid(),
        postId,
        userId,
        reason,
        description,
        created_at: serverTimestamp(),
        status: 'pending',
      };
      await addDoc(reportRef, reportData);
      return reportRef.id;
    } catch (err) {
      console.error('Error al grabar el report:', err);
      throw err;
    }
  }

  // /**
  //  * Retorna un listado de publicaciones filtradas.
  //  * @param {Array} filters - Filtros para categorías
  //  * @returns {Promise<Array>} - Lista de posts
  //  */
  // async function find(filters) {
  //   try {
  //     const posts = [];
  //     const q = query(postRef, where('categories', 'array-contains-any', filters || []), orderBy('created_at', 'desc'));
  //     const querySnapshot = await getDocs(q);

  //     querySnapshot.forEach((doc) => {
  //       const post = doc.data();
  //       posts.push({
  //         idDoc: doc.id,
  //         id: post.id,
  //         title: post.title,
  //         body: post.body,
  //         user: post.user,
  //         categories: post.categories,
  //         created_at: post.created_at,
  //         imagePathFile: post.imagePathFile,
  //         imageUrlFile: post.imageUrlFile,
  //       });
  //     });

  //     return posts;
  //   } catch (err) {
  //     console.error('Error al buscar posts:', err);
  //     throw err;
  //   }
  // }

  // /**
  //  * Retorna un post por su ID.
  //  * @param {string} id - ID del post
  //  * @returns {Promise<Object>} - Datos del post
  //  */
  // async function getPostById(id) {
  //   try {
  //     const queryPost = query(postRef, where('id', '==', id), limit(1));
  //     const snapshot = await getDocs(queryPost);
  //     if (snapshot.empty) throw new Error('Post no encontrado');

  //     const post = snapshot.docs[0].data();
  //     const filePath = `post/${post.user.email}/${post.id}.jpg`;

  //     return {
  //       id: post.id,
  //       title: post.title,
  //       body: post.body,
  //       user: post.user,
  //       created_at: post.created_at,
  //       imagePathFile: post.imagePathFile ?? filePath,
  //       imageUrlFile: post.imageUrlFile ?? null,
  //     };
  //   } catch (err) {
  //     console.error('Error al obtener post por ID:', err);
  //     throw err;
  //   }
  // }

  // /**
  //  * Elimina un post por su ID.
  //  * @param {string} id - ID del documento
  //  * @returns {Promise<void>}
  //  */
  // async function deletePost(id) {
  //   try {
  //     const docRef = doc(db, 'posts', id);
  //     await deleteDoc(docRef);
  //   } catch (err) {
  //     console.error('Error al eliminar post:', err);
  //     throw err;
  //   }
  // }

  // Devolvemos las funciones para usarlas en los componentes
  return {
    saveReport,
    // find,
  };
}