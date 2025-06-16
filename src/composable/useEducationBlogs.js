import { ref } from 'vue';
import {
  getFirestore,
  collection,
  getDoc,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const db = getFirestore();
const storage = getStorage();
const blogsRef = collection(db, 'educationBlogs');

// Reactive state
const blogs = ref([]);
const error = ref(null);
const isPending = ref(false);

/**
 * Migrates blogs from JSON to Firestore
 * @param {Array} jsonBlogs - Array of blog objects to migrate
 * @returns {Promise<void>}
 */
async function migrateBlogs(jsonBlogs) {
  if (!Array.isArray(jsonBlogs)) {
    throw new Error('El archivo JSON debe contener un array de blogs.');
  }

  try {
    isPending.value = true;
    for (const blog of jsonBlogs) {
      // Validate blog structure
      if (!blog.id || !blog.title || !blog.date || !blog.intro || !blog.categories || !blog.type || !blog.summary || !blog.sections) {
        console.warn(`Blog inválido, falta información requerida (ID: ${blog.id || 'sin ID'})`, blog);
        continue;
      }
      // Ensure ID is a string for Firestore
      const blogId = blog.id.toString();
      // Check if blog already exists to avoid duplicates
      const blogDoc = doc(db, 'educationBlogs', blogId);
      const docSnap = await getDoc(blogDoc);
      if (!docSnap.exists()) {
        // Remove imageFile and imagePreview if present (not needed for migration)
        const cleanedBlog = {
          ...blog,
          image: blog.image || null,
          sections: blog.sections.map((section) => ({
            title: section.title,
            text: section.text || '',
            image: section.image || null,
          })),
        };
        await setDoc(blogDoc, cleanedBlog);
        console.log(`Blog ${blogId} migrated successfully`);
      } else {
        console.log(`Blog ${blogId} ya existe, omitiendo`);
      }
    }
    console.log('Migration completed');
  } catch (err) {
    console.error('Error migrating blogs:', err);
    error.value = 'Error migrating blogs: ' + err.message;
    throw err;
  } finally {
    isPending.value = false;
  }
}

/**
 * Loads blogs from Firestore (one-time fetch)
 * @returns {Promise<void>}
 */
async function loadBlogs() {
  try {
    const q = query(blogsRef, orderBy('id', 'desc'));
    const querySnapshot = await getDocs(q);
    blogs.value = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: parseInt(doc.id),
    }));
    error.value = null;
  } catch (err) {
    console.error('Error loading blogs:', err);
    error.value = 'Error loading blogs: ' + err.message;
    throw err;
  }
}

/**
 * Subscribes to real-time updates for blogs
 * @param {Function} callback - Function to handle updated blogs
 * @returns {Function} - Unsubscribe function
 */
function subscribeToBlogs(callback) {
  const q = query(blogsRef, orderBy('id', 'desc'));
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const updatedBlogs = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: parseInt(doc.id),
      }));
      blogs.value = updatedBlogs;
      callback(updatedBlogs);
      error.value = null;
    },
    (err) => {
      console.error('Error in subscription:', err);
      error.value = 'Error in subscription: ' + err.message;
      callback([]);
    }
  );
  return unsubscribe;
}

/**
 * Fetches a single blog by ID
 * @param {string|number} id - Blog ID
 * @returns {Promise<Object|null>} - Blog object or null if not found
 */
async function getBlogById(id) {
  try {
    const blogDoc = doc(db, 'educationBlogs', id.toString());
    const docSnap = await getDoc(blogDoc);
    if (docSnap.exists()) {
      return { ...docSnap.data(), id: parseInt(docSnap.id) };
    }
    return null;
  } catch (err) {
    console.error('Error fetching blog:', err);
    error.value = 'Error fetching blog: ' + err.message;
    throw err;
  }
}

/**
 * Saves a new blog to Firestore
 * @param {Object} blogData - Blog data
 * @returns {Promise<void>}
 */
async function saveBlog(blogData) {
  try {
    // Generate new ID
    const querySnapshot = await getDocs(blogsRef);
    const maxId = querySnapshot.docs.reduce((max, doc) => {
      const id = parseInt(doc.id);
      return id > max ? id : max;
    }, 0);
    const newId = maxId + 1;

    // Upload images
    if (blogData.imageFile) {
      blogData.image = await uploadImage(blogData.imageFile, newId, 'main');
      delete blogData.imageFile;
    }
    for (let i = 0; i < blogData.sections.length; i++) {
      if (blogData.sections[i].imageFile) {
        blogData.sections[i].image = await uploadImage(blogData.sections[i].imageFile, newId, `section_${i}`);
        delete blogData.sections[i].imageFile;
      }
    }

    await setDoc(doc(db, 'educationBlogs', newId.toString()), {
      ...blogData,
      id: newId,
    });
    error.value = null;
  } catch (err) {
    console.error('Error saving blog:', err);
    error.value = 'Error saving blog: ' + err.message;
    throw err;
  }
}

/**
 * Updates an existing blog in Firestore
 * @param {string|number} id - Blog ID
 * @param {Object} blogData - Updated blog data
 * @returns {Promise<void>}
 */
async function updateBlog(id, blogData) {
  try {
    // Upload new images if provided
    if (blogData.imageFile) {
      if (blogData.image) {
        await deleteImage(blogData.image); // Delete old image
      }
      blogData.image = await uploadImage(blogData.imageFile, id, 'main');
      delete blogData.imageFile;
    }
    for (let i = 0; i < blogData.sections.length; i++) {
      if (blogData.sections[i].imageFile) {
        if (blogData.sections[i].image) {
          await deleteImage(blogData.sections[i].image); // Delete old section image
        }
        blogData.sections[i].image = await uploadImage(blogData.sections[i].imageFile, id, `section_${i}`);
        delete blogData.sections[i].imageFile;
      }
    }

    await setDoc(doc(db, 'educationBlogs', id.toString()), blogData, { merge: true });
    error.value = null;
  } catch (err) {
    console.error('Error updating blog:', err);
    error.value = 'Error updating blog: ' + err.message;
    throw err;
  }
}

/**
 * Deletes a blog from Firestore
 * @param {string|number} id - Blog ID
 * @returns {Promise<void>}
 */
async function deleteBlog(id) {
  try {
    const blog = await getBlogById(id);
    if (blog) {
      // Delete associated images
      if (blog.image) {
        await deleteImage(blog.image);
      }
      for (const section of blog.sections) {
        if (section.image) {
          await deleteImage(section.image);
        }
      }
      await deleteDoc(doc(db, 'educationBlogs', id.toString()));
      error.value = null;
    }
  } catch (err) {
    console.error('Error deleting blog:', err);
    error.value = 'Error deleting blog: ' + err.message;
    throw err;
  }
}

/**
 * Uploads an image to Firebase Storage
 * @param {File} file - Image file
 * @param {string|number} blogId - Blog ID
 * @param {string} type - Image type (main or section_X)
 * @returns {Promise<string>} - Download URL
 */
async function uploadImage(file, blogId, type) {
  if (!file) return null;
  const path = `blogs/${blogId}/${type}_${file.name}`;
  const storageReference = storageRef(storage, path);
  await uploadBytes(storageReference, file);
  return await getDownloadURL(storageReference);
}

/**
 * Deletes an image from Firebase Storage
 * @param {string} url - Image URL
 * @returns {Promise<void>}
 */
async function deleteImage(url) {
  try {
    const imageRef = storageRef(storage, url);
    await deleteObject(imageRef);
  } catch (err) {
    console.warn('Error deleting image:', err);
  }
}

export function useEducationBlogs() {
  return {
    blogs,
    error,
    isPending,
    migrateBlogs,
    loadBlogs,
    subscribeToBlogs,
    getBlogById,
    saveBlog,
    updateBlog,
    deleteBlog,
  };
}