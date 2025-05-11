<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
    <!-- Header with Back Button and Create Blog Button -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-4">
        <RouterLink
          to="/admin/dashboard"
          class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center gap-2"
          aria-label="Volver al Dashboard"
        >
          <i class="fas fa-arrow-left"></i> Volver al Dashboard
        </RouterLink>
        <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Administración de Blogs</h1>
      </div>
      <div class="flex gap-4">
        <button
          @click="openCreateModal"
          class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          aria-label="Crear nuevo blog"
        >
          Crear Blog
        </button>
        <button
          @click="downloadBlogsFile"
          class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          aria-label="Descargar blogs.js"
        >
          Descargar blogs.js
        </button>
      </div>
    </div>

    <!-- Loading State (not needed since data is local) -->
    <div v-if="filteredBlogs.length === 0" class="text-center text-gray-600 dark:text-gray-300">
      No se encontraron blogs con los filtros aplicados.
    </div>
    <div v-else>
      <!-- Search and Filters -->
      <div class="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por título o introducción..."
          class="w-full sm:w-1/3 p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Buscar blogs"
        />
        <div class="relative">
          <button
            @click="showCategoryFilter = !showCategoryFilter"
            class="p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-full text-left"
            aria-label="Filtrar por categorías"
          >
            {{ selectedCategories.length ? `Categorías: ${selectedCategories.join(', ')}` : 'Filtrar por categorías' }}
          </button>
          <div
            v-if="showCategoryFilter"
            class="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg p-4"
          >
            <label v-for="category in uniqueCategories" :key="category" class="flex items-center">
              <input
                type="checkbox"
                v-model="selectedCategories"
                :value="category"
                class="mr-2"
                @change="showCategoryFilter = false"
              />
              {{ category }}
            </label>
          </div>
        </div>
        <select
          v-model="filterType"
          class="p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          aria-label="Filtrar por tipo"
        >
          <option value="">Filtrar por tipo</option>
          <option v-for="type in uniqueTypes" :key="type" :value="type">{{ type }}</option>
        </select>
      </div>

      <!-- Blogs Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow">
          <thead>
            <tr class="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-sm leading-normal">
              <th class="py-3 px-6 text-left">Título</th>
              <th class="py-3 px-6 text-left">Fecha</th>
              <th class="py-3 px-6 text-left">Categorías</th>
              <th class="py-3 px-6 text-center">Tipo</th>
              <th class="py-3 px-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 dark:text-gray-300 text-sm font-light">
            <tr
              v-for="blog in filteredBlogs"
              :key="blog.id"
              class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <td class="py-3 px-6 text-left whitespace-nowrap">
                <div class="flex items-center">
                  <img
                    :src="blog.image"
                    alt="Blog Image"
                    class="w-8 h-8 rounded-full mr-2"
                  />
                  <span>{{ blog.title || 'Sin título' }}</span>
                </div>
              </td>
              <td class="py-3 px-6 text-left">{{ blog.date || 'N/A' }}</td>
              <td class="py-3 px-6 text-left">{{ blog.categories?.join(', ') || 'N/A' }}</td>
              <td class="py-3 px-6 text-center">{{ blog.type || 'N/A' }}</td>
              <td class="py-3 px-6 text-center">
                <div class="flex item-center justify-center gap-2">
                  <button
                    @click="openEditModal(blog)"
                    class="text-blue-500 hover:text-blue-700"
                    title="Editar"
                    aria-label="Editar blog"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    @click="deleteBlog(blog.id)"
                    class="text-red-500 hover:text-red-700"
                    title="Eliminar"
                    aria-label="Eliminar blog"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-4">Editar Blog</h2>
        <form @submit.prevent="saveBlog">
          <div class="mb-4">
            <label class="block text-gray-700 dark:text-gray-300 mb-1" for="title">Título</label>
            <input
              id="title"
              v-model="editBlog.title"
              type="text"
              class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              aria-required="true"
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 dark:text-gray-300 mb-1" for="date">Fecha</label>
            <input
              id="date"
              v-model="editBlog.date"
              type="text"
              class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              aria-required="true"
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 dark:text-gray-300 mb-1" for="intro">Introducción</label>
            <textarea
              id="intro"
              v-model="editBlog.intro"
              class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              aria-required="true"
            ></textarea>
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 dark:text-gray-300 mb-1" for="categories">Categorías (separadas por comas)</label>
            <input
              id="categories"
              v-model="categoriesInput"
              type="text"
              class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              placeholder="Ej: Salud, Perros"
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 dark:text-gray-300 mb-1" for="type">Tipo</label>
            <input
              id="type"
              v-model="editBlog.type"
              type="text"
              class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              aria-required="true"
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 dark:text-gray-300 mb-1" for="summary">Resumen</label>
            <textarea
              id="summary"
              v-model="editBlog.summary"
              class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              aria-required="true"
            ></textarea>
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 dark:text-gray-300 mb-1">Secciones</label>
            <div v-for="(section, index) in editBlog.sections" :key="index" class="mb-2 p-2 border border-gray-300 dark:border-gray-700 rounded-md">
              <div class="flex justify-between">
                <h4 class="text-gray-700 dark:text-gray-300">Sección {{ index + 1 }}</h4>
                <button
                  type="button"
                  @click="editBlog.sections.splice(index, 1)"
                  class="text-red-500 hover:text-red-700"
                  aria-label="Eliminar sección"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
              <input
                v-model="section.title"
                type="text"
                placeholder="Título de la sección"
                class="w-full p-2 mt-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
              <textarea
                v-model="section.text"
                placeholder="Texto de la sección"
                class="w-full p-2 mt-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              ></textarea>
            </div>
            <button
              type="button"
              @click="editBlog.sections.push({ title: '', text: '', image: editBlog.image })"
              class="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
              aria-label="Agregar sección"
            >
              Agregar Sección
            </button>
          </div>
          <div class="flex justify-end gap-2">
            <button
              type="button"
              @click="showEditModal = false"
              class="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
              aria-label="Cancelar"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-primary text-white rounded-md"
              aria-label="Guardar cambios"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Create Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-4">Crear Blog</h2>
        <form @submit.prevent="createBlog">
          <div class="mb-4">
            <label class="block text-gray-700 dark:text-gray-300 mb-1" for="new-title">Título</label>
            <input
              id="new-title"
              v-model="newBlog.title"
              type="text"
              class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              aria-required="true"
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 dark:text-gray-300 mb-1" for="new-date">Fecha</label>
            <input
              id="new-date"
              v-model="newBlog.date"
              type="text"
              class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              aria-required="true"
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 dark:text-gray-300 mb-1" for="new-intro">Introducción</label>
            <textarea
              id="new-intro"
              v-model="newBlog.intro"
              class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              aria-required="true"
            ></textarea>
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 dark:text-gray-300 mb-1" for="new-categories">Categorías (separadas por comas)</label>
            <input
              id="new-categories"
              v-model="newCategoriesInput"
              type="text"
              class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              placeholder="Ej: Salud, Perros"
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 dark:text-gray-300 mb-1" for="new-type">Tipo</label>
            <input
              id="new-type"
              v-model="newBlog.type"
              type="text"
              class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              aria-required="true"
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 dark:text-gray-300 mb-1" for="new-summary">Resumen</label>
            <textarea
              id="new-summary"
              v-model="newBlog.summary"
              class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              aria-required="true"
            ></textarea>
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 dark:text-gray-300 mb-1">Secciones</label>
            <div v-for="(section, index) in newBlog.sections" :key="index" class="mb-2 p-2 border border-gray-300 dark:border-gray-700 rounded-md">
              <div class="flex justify-between">
                <h4 class="text-gray-700 dark:text-gray-300">Sección {{ index + 1 }}</h4>
                <button
                  type="button"
                  @click="newBlog.sections.splice(index, 1)"
                  class="text-red-500 hover:text-red-700"
                  aria-label="Eliminar sección"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
              <input
                v-model="section.title"
                type="text"
                placeholder="Título de la sección"
                class="w-full p-2 mt-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
              <textarea
                v-model="section.text"
                placeholder="Texto de la sección"
                class="w-full p-2 mt-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              ></textarea>
            </div>
            <button
              type="button"
              @click="newBlog.sections.push({ title: '', text: '', image: newBlog.image })"
              class="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
              aria-label="Agregar sección"
            >
              Agregar Sección
            </button>
          </div>
          <div class="flex justify-end gap-2">
            <button
              type="button"
              @click="showCreateModal = false"
              class="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
              aria-label="Cancelar"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-primary text-white rounded-md"
              aria-label="Crear blog"
            >
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useSnackbarStore } from '../../stores/snackbar';
import { blogs } from '../../data/blogs';
import Img from '../../assets/3.png';

const snackbarStore = useSnackbarStore();

// Reactive state for blogs
const localBlogs = ref(JSON.parse(JSON.stringify(blogs.value)));

// Search and filter states
const searchQuery = ref('');
const selectedCategories = ref([]);
const filterType = ref('');
const showCategoryFilter = ref(false);

// Modal states
const showEditModal = ref(false);
const showCreateModal = ref(false);
const editBlog = ref(null);
const categoriesInput = ref('');
const newBlog = ref({
  id: 0,
  title: '',
  image: Img,
  date: '',
  intro: '',
  categories: [],
  type: '',
  summary: '',
  sections: [],
});
const newCategoriesInput = ref('');

// Computed properties
const filteredBlogs = computed(() => {
  let filtered = localBlogs.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (blog) =>
        blog.title?.toLowerCase().includes(query) ||
        blog.intro?.toLowerCase().includes(query)
    );
  }

  if (selectedCategories.value.length) {
    filtered = filtered.filter((blog) =>
      selectedCategories.value.every((cat) => blog.categories?.includes(cat))
    );
  }

  if (filterType.value) {
    filtered = filtered.filter((blog) => blog.type === filterType.value);
  }

  return filtered;
});

const uniqueCategories = computed(() => {
  const categories = new Set();
  localBlogs.value.forEach((blog) => {
    blog.categories?.forEach((cat) => categories.add(cat));
  });
  return [...categories].sort();
});

const uniqueTypes = computed(() => {
  const types = new Set(localBlogs.value.map((blog) => blog.type).filter(Boolean));
  return [...types].sort();
});

// Modal handlers
const openEditModal = (blog) => {
  editBlog.value = JSON.parse(JSON.stringify(blog));
  categoriesInput.value = blog.categories?.join(', ') || '';
  showEditModal.value = true;
};

const openCreateModal = () => {
  newBlog.value = {
    id: Math.max(...localBlogs.value.map((b) => b.id), 0) + 1,
    title: '',
    image: Img,
    date: new Date().toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    intro: '',
    categories: [],
    type: '',
    summary: '',
    sections: [],
  };
  newCategoriesInput.value = '';
  showCreateModal.value = true;
};

// Save blog changes
const saveBlog = () => {
  try {
    const index = localBlogs.value.findIndex((b) => b.id === editBlog.value.id);
    if (index === -1) throw new Error('Blog no encontrado');
    editBlog.value.categories = categoriesInput.value
      .split(',')
      .map((cat) => cat.trim())
      .filter(Boolean);
    localBlogs.value[index] = { ...editBlog.value };
    snackbarStore.show('Blog actualizado exitosamente', 'success');
    showEditModal.value = false;
  } catch (error) {
    console.error('Error updating blog:', error);
    snackbarStore.show('Error al guardar los cambios', 'error');
  }
};

// Create new blog
const createBlog = () => {
  try {
    newBlog.value.categories = newCategoriesInput.value
      .split(',')
      .map((cat) => cat.trim())
      .filter(Boolean);
    localBlogs.value.push({ ...newBlog.value });
    snackbarStore.show('Blog creado exitosamente', 'success');
    showCreateModal.value = false;
  } catch (error) {
    console.error('Error creating blog:', error);
    snackbarStore.show('Error al crear el blog', 'error');
  }
};

// Delete blog
const deleteBlog = (id) => {
  if (!confirm('¿Estás seguro de que deseas eliminar este blog?')) return;
  try {
    localBlogs.value = localBlogs.value.filter((b) => b.id !== id);
    snackbarStore.show('Blog eliminado exitosamente', 'success');
  } catch (error) {
    snackbarStore.show('Error al eliminar el blog', 'error');
  }
};

// Download blogs.js file
const downloadBlogsFile = () => {
  const fileContent = `import Img from '../assets/3.png'
import { ref } from 'vue'

export const blogs = ref(${JSON.stringify(localBlogs.value, null, 2)})
`;
  const blob = new Blob([fileContent], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'blogs.js';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  snackbarStore.show('Archivo blogs.js descargado', 'success');
};
</script>

<style scoped>
/* Custom styles for table and buttons */
table {
  border-collapse: separate;
  border-spacing: 0;
}

th,
td {
  border-right: 1px solid #e5e7eb;
}

th:last-child,
td:last-child {
  border-right: none;
}

button i {
  font-size: 1.25rem;
}

/* Primary color for buttons */
.bg-primary {
  background-color: #3b82f6;
}

.bg-primary:hover {
  background-color: #2563eb;
}

.bg-primary-dark {
  background-color: #2563eb;
}

/* Dark mode adjustments */
.dark .bg-primary {
  background-color: #60a5fa;
}

.dark .bg-primary:hover {
  background-color: #3b82f6;
}

.dark .bg-primary-dark {
  background-color: #3b82f6;
}

/* Category filter dropdown */
.relative {
  position: relative;
}

.absolute {
  position: absolute;
}
</style>