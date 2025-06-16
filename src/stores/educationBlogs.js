// stores/educationBlogs.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useEducationBlogs } from '../composable/useEducationBlogs';
import { useSnackbarStore } from './snackbar';

export const useEducationBlogsStore = defineStore('educationBlogs', {
  state: () => ({
    blogs: ref([]),
    isLoading: ref(true),
    error: ref(null),
    unsubscribeFn: ref(null),
  }),
  actions: {
    /**
     * Subscribes to real-time blog updates
     */
    subscribeToBlogs() {
      console.log('Iniciando suscripción a blogs...');
      const { subscribeToBlogs } = useEducationBlogs();
      try {
        this.unsubscribeFn = subscribeToBlogs((updatedBlogs) => {
          console.log('Blogs recibidos desde Firebase:', updatedBlogs);
          this.blogs.value = updatedBlogs;
          this.isLoading = false;
          this.error = null;
        });
      } catch (error) {
        console.error('Error al suscribirse a blogs:', error);
        this.error = 'Error al suscribirse a blogs: ' + error.message;
        this.isLoading = false;
      }
    },

    /**
     * Unsubscribes from real-time updates
     */
    unsubscribeFromBlogs() {
      if (typeof this.unsubscribeFn === 'function') {
        console.log('Cancelando suscripción a blogs...');
        this.unsubscribeFn();
        this.unsubscribeFn = null;
      }
    },

    /**
     * Migrates JSON blogs to Firestore
     * @param {Array} jsonBlogs - Array of blog objects to migrate
     */
    async migrateBlogs(jsonBlogs) {
      const snackbarStore = useSnackbarStore();
      const { migrateBlogs } = useEducationBlogs();
      try {
        await migrateBlogs(jsonBlogs);
        snackbarStore.show('Blogs migrados exitosamente', 'success');
      } catch (error) {
        console.error('Error al migrar blogs:', error);
        snackbarStore.show('Error al migrar blogs: ' + error.message, 'error');
        throw error;
      }
    },

    /**
     * Adds a new blog
     * @param {Object} blogData - Blog data
     */
    async addBlog(blogData) {
      const snackbarStore = useSnackbarStore();
      const { saveBlog } = useEducationBlogs();
      try {
        await saveBlog(blogData);
        snackbarStore.show('Blog creado exitosamente', 'success');
      } catch (error) {
        console.error('Error al añadir blog:', error);
        snackbarStore.show('Error al añadir blog: ' + error.message, 'error');
        throw error;
      }
    },

    /**
     * Updates an existing blog
     * @param {string|number} id - Blog ID
     * @param {Object} blogData - Updated blog data
     */
    async updateBlog(id, blogData) {
      const snackbarStore = useSnackbarStore();
      const { updateBlog } = useEducationBlogs();
      try {
        await updateBlog(id, blogData);
        snackbarStore.show('Blog actualizado exitosamente', 'success');
      } catch (error) {
        console.error('Error al actualizar blog:', error);
        snackbarStore.show('Error al actualizar blog: ' + error.message, 'error');
        throw error;
      }
    },

    /**
     * Deletes a blog
     * @param {string|number} id - Blog ID
     */
    async deleteBlog(id) {
      const snackbarStore = useSnackbarStore();
      const { deleteBlog } = useEducationBlogs();
      try {
        await deleteBlog(id);
        snackbarStore.show('Blog eliminado exitosamente', 'success');
      } catch (error) {
        console.error('Error al eliminar blog:', error);
        snackbarStore.show('Error al eliminar blog: ' + error.message, 'error');
        throw error;
      }
    },

    /**
     * Fetches a blog by ID
     * @param {string|number} id - Blog ID
     * @returns {Promise<Object|null>}
     */
    async getBlogById(id) {
      const { getBlogById } = useEducationBlogs();
      try {
        return await getBlogById(id);
      } catch (error) {
        console.error('Error al obtener blog:', error);
        const snackbarStore = useSnackbarStore();
        snackbarStore.show('Error al obtener blog: ' + error.message, 'error');
        throw error;
      }
    },
  },
});