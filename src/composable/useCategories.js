// composables/useCategories.js
import { ref } from 'vue';
import { getFirestore, addDoc, collection, getDocs } from 'firebase/firestore';
import { newGuid } from '../utils/newGuid';
// import { db } from '../api/firebase/config'; 

const db = getFirestore();
const categoriesRef = collection(db, 'categories');

// Variable reactiva global (singleton)
const categories = ref([]);

/**
 * Carga las categorías desde Firebase una sola vez.
 * @returns {Promise<void>}
 */
async function loadCategories() {
  if (categories.value.length > 0) return; // Evita recargas si ya están cargadas
  try {
    const querySnapshot = await getDocs(categoriesRef);
    categories.value = querySnapshot.docs.map(doc => doc.data());
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

export function useCategories() {
  return {
    categories, // Reactivo y compartido
    loadCategories, // Carga inicial
    saveCategorie, // Para moderadores
  };
}