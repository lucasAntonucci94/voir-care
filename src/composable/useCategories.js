import { ref } from 'vue';
import { getFirestore, addDoc, collection, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { newGuid } from '../utils/newGuid';

const db = getFirestore();
const categoriesRef = collection(db, 'categories');
const blogCategoriesRef = collection(db, 'blogCategories');

// Reactive variables for categories
const categories = ref([]);
const blogCategories = ref([]);

/**
 * Loads post categories from Firebase.
 * @returns {Promise<void>}
 */
async function loadCategories() {
  try {
    const querySnapshot = await getDocs(categoriesRef);
    categories.value = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      idDoc: doc.id
    }));
    return categories.value;
  } catch (err) {
    console.error('Error al cargar categorías:', err);
    throw err;
  }
}

/**
 * Loads blog categories from Firebase.
 * @returns {Promise<void>}
 */
async function loadBlogCategories() {
  try {
    const querySnapshot = await getDocs(blogCategoriesRef);
    blogCategories.value = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      idDoc: doc.id
    }));
  } catch (err) {
    console.error('Error al cargar categorías de blogs:', err);
    throw err;
  }
}

/**
 * Fetches blog categories from Firebase (read-only, for use in other components).
 * @returns {Promise<Array>}
 */
async function fetchBlogCategories() {
  try {
    const querySnapshot = await getDocs(blogCategoriesRef);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      idDoc: doc.id
    }));
  } catch (err) {
    console.error('Error al obtener categorías de blogs:', err);
    throw err;
  }
}

/**
 * Saves a new post category to Firebase.
 * @param {string} name - Category name
 * @returns {Promise<void>}
 */
async function saveCategorie(name) {
  const data = {
    id: newGuid(),
    name,
    createdAt: serverTimestamp(),
  };
  try {
    await addDoc(categoriesRef, data);
    categories.value.push(data);
  } catch (err) {
    console.error('Error al grabar la categoría:', err);
    throw err;
  }
}

/**
 * Saves a new blog category to Firebase.
 * @param {Object} category - Category data { name, slug }
 * @returns {Promise<void>}
 */
async function saveBlogCategorie({ name, slug }) {
  const data = {
    name,
    createdAt: serverTimestamp(),
  };
  if (slug) {
    data.slug = slug;
  }
  try {
    const docRef = await addDoc(blogCategoriesRef, data);
    blogCategories.value.push({ ...data, idDoc: docRef.id });
  } catch (err) {
    console.error('Error al grabar la categoría de blog:', err);
    throw err;
  }
}

/**
 * Updates an existing post category in Firebase.
 * @param {string} docId - Firebase document ID
 * @param {string} name - New category name
 * @returns {Promise<void>}
 */
async function updateCategorie(docId, name) {
  try {
    const categoryDoc = doc(db, 'categories', docId);
    await updateDoc(categoryDoc, { name });
    categories.value = categories.value.map(category =>
      category.idDoc === docId ? { ...category, name } : category
    );
  } catch (err) {
    console.error('Error al actualizar la categoría:', err);
    throw err;
  }
}

/**
 * Updates an existing blog category in Firebase.
 * @param {string} docId - Firebase document ID
 * @param {Object} category - Category data { name, slug }
 * @returns {Promise<void>}
 */
async function updateBlogCategorie(docId, { name, slug }) {
  const data = { name };
  if (slug) {
    data.slug = slug;
  }
  try {
    const categoryDoc = doc(db, 'blogCategories', docId);
    await updateDoc(categoryDoc, data);
    blogCategories.value = blogCategories.value.map(category =>
      category.idDoc === docId ? { ...category, name, slug: slug || null } : category
    );
  } catch (err) {
    console.error('Error al actualizar la categoría de blog:', err);
    throw err;
  }
}

/**
 * Deletes a post category from Firebase.
 * @param {string} docId - Firebase document ID
 * @returns {Promise<void>}
 */
async function deleteCategorie(docId) {
  try {
    const categoryDoc = doc(db, 'categories', docId);
    await deleteDoc(categoryDoc);
    categories.value = categories.value.filter(category => category.idDoc !== docId);
  } catch (err) {
    console.error('Error al eliminar la categoría:', err);
    throw err;
  }
}

/**
 * Deletes a blog category from Firebase.
 * @param {string} docId - Firebase document ID
 * @returns {Promise<void>}
 */
async function deleteBlogCategorie(docId) {
  try {
    const categoryDoc = doc(db, 'blogCategories', docId);
    await deleteDoc(categoryDoc);
    blogCategories.value = blogCategories.value.filter(category => category.idDoc !== docId);
  } catch (err) {
    console.error('Error al eliminar la categoría de blog:', err);
    throw err;
  }
}

export function useCategories() {
  return {
    categories,
    blogCategories,
    loadCategories,
    loadBlogCategories,
    fetchBlogCategories,
    saveCategorie,
    saveBlogCategorie,
    updateCategorie,
    updateBlogCategorie,
    deleteCategorie,
    deleteBlogCategorie,
  };
}