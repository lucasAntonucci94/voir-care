import { ref } from 'vue';
import { getFirestore, addDoc, collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { newGuid } from '../utils/newGuid';

const db = getFirestore();
const categoriesRef = collection(db, 'categories');

// Variable reactiva global
const categories = ref([]);

/**
 * Carga las categorías desde Firebase una sola vez.
 * @returns {Promise<void>}
 */
async function loadCategories(type) {
  try {
    const querySnapshot = await getDocs(categoriesRef);
    const allCategories = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      idDoc: doc.id // Mapeo Firebase document ID
    }));
    categories.value = type
      ? allCategories.filter(category => category.type === type)
      : allCategories;
  } catch (err) {
    console.error('Error al cargar categorías:', err);
    throw err;
  }
}

/**
 * Graba una nueva categoría en Firebase (para moderadores).
 * @param {string} name - Nombre de la categoría
 * @returns {Promise<void>}
 */
async function saveCategorie(name) {
  const data = {
    id: newGuid(),
    name,
  };
  try {
    await addDoc(categoriesRef, data);
    // Actualizamos localmente para mantener consistencia
    categories.value.push(data);
  } catch (err) {
    console.error('Error al grabar la categoría:', err);
    throw err;
  }
}

/**
 * Edita una categoría existente en Firebase (para moderadores).
 * @param {string} docId - ID del documento en Firebase
 * @param {string} name - Nuevo nombre de la categoría
 * @returns {Promise<void>}
 */
async function updateCategorie(docId, name) {
  debugger
  try {
    const categoryDoc = doc(db, 'categories', docId);
    await updateDoc(categoryDoc, { name });
    // Actualizamos localmente para mantener consistencia
    debugger
    categories.value = categories.value.map(category =>
      category.docId === docId ? { ...category, name } : category
    );
  } catch (err) {
    console.error('Error al actualizar la categoría:', err);
    throw err;
  }
}

/**
 * Elimina una categoría de Firebase (para moderadores).
 * @param {string} docId - ID del documento en Firebase
 * @returns {Promise<void>}
 */
async function deleteCategorie(docId) {
  try {
    const categoryDoc = doc(db, 'categories', docId);
    await deleteDoc(categoryDoc);
    // Actualizamos localmente para mantener consistencia
    categories.value = categories.value.filter(category => category.docId !== docId);
  } catch (err) {
    console.error('Error al eliminar la categoría:', err);
    throw err;
  }
}

export function useCategories() {
  return {
    categories, // Reactivo y compartido
    loadCategories, // Carga inicial
    saveCategorie, // Para moderadores
    updateCategorie, // Para moderadores
    deleteCategorie, // Para moderadores
  };
}