import { getFirestore, collection, query, where, getDoc, getDocs, doc, setDoc, deleteDoc, onSnapshot, orderBy } from 'firebase/firestore';

const db = getFirestore();
const savedPostsRef = collection(db, 'savedPosts');

export function useSavedPosts() {
  /**
   * Saves a post for a user.
   * @param {string} userId - The ID of the user saving the post
   * @param {string} postId - The ID of the post to save
   * @returns {Promise<void>}
   */
  async function savePost(userId, postId) {
    try {
      const savedPostId = `${userId}_${postId}`;
      const savedPostDocRef = doc(db, 'savedPosts', savedPostId);
      await setDoc(savedPostDocRef, {
        userId,
        postId,
        savedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error saving post:', err);
      throw err;
    }
  }

  /**
   * Unsaves a post for a user.
   * @param {string} userId - The ID of the user unsaving the post
   * @param {string} postId - The ID of the post to unsave
   * @returns {Promise<void>}
   */
  async function unsavePost(userId, postId) {
    try {
      const savedPostId = `${userId}_${postId}`;
      const savedPostDocRef = doc(db, 'savedPosts', savedPostId);
      await deleteDoc(savedPostDocRef);
    } catch (err) {
      console.error('Error unsaving post:', err);
      throw err;
    }
  }

  /**
   * Checks if a post is saved by a user.
   * @param {string} userId - The ID of the user
   * @param {string} postId - The ID of the post
   * @returns {Promise<boolean>}
   */
  async function isPostSaved(userId, postId) {
    try {
      const savedPostId = `${userId}_${postId}`;
      const savedPostDocRef = doc(db, 'savedPosts', savedPostId);
      const docSnap = await getDoc(savedPostDocRef);
      return docSnap.exists();
    } catch (err) {
      console.error('Error checking if post is saved:', err);
      return false;
    }
  }

  /**
   * Fetches all saved posts for a user.
   * @param {string} userId - The ID of the user
   * @returns {Promise<Array>}
   */
  async function fetchSavedPosts(userId) {
    try {
      const q = query(savedPostsRef, where('userId', '==', userId), orderBy('savedAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data());
    } catch (err) {
      console.error('Error fetching saved posts:', err);
      return [];
    }
  }

  /**
   * Subscribes to real-time updates for a user's saved posts.
   * @param {string} userId - The ID of the user
   * @param {function} callback - Function to call with the updated saved posts
   * @returns {function} - Unsubscribe function
   */
  function subscribeToSavedPosts(userId, callback) {
    try {
      const q = query(savedPostsRef, where('userId', '==', userId), orderBy('savedAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const savedPosts = snapshot.docs.map(doc => doc.data());
        callback(savedPosts);
      });
    } catch (err) {
      console.error('Error subscribing to saved posts:', err);
      throw err;
    }
  }

  return {
    savePost,
    unsavePost,
    isPostSaved,
    fetchSavedPosts,
    subscribeToSavedPosts,
  };
}