<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Administración de Blogs</h1>
      <div class="flex gap-4">
        <button
          @click="openCreateModal"
          class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center gap-2"
          aria-label="Crear nuevo blog"
        >
          <i class="fas fa-plus"></i> Nuevo Blog
        </button>
        <button
          @click="toggleMigrationModal"
          class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          aria-label="Migrar blogs desde JSON"
        >
          Migrar JSON
        </button>
      </div>
    </div>

    <!-- Loading and Error States -->
    <div v-if="blogsStore.isLoading" class="text-center text-gray-600 dark:text-gray-300">
      <i class="fas fa-spinner fa-spin mr-2"></i> Cargando blogs...
    </div>
    <div v-else-if="blogsStore.error" class="text-center text-red-500 dark:text-red-400">
      Error: {{ blogsStore.error }}
    </div>
    <div v-else>
      <!-- Search and Filters -->
      <div class="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por título o introducción..."
          class="w-full sm:w-1/3 p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary"
          aria-label="Buscar blogs"
        />
        <multiselect
          v-model="selectedCategories"
          :options="categories"
          :multiple="true"
          :class="{ 'dark': isDark }"
          placeholder="Seleccionar categorías"
          aria-label="Filtrar por categorías"
          label="name"
          track-by="idDoc"
          :disabled="isLoading"
        ></multiselect>
        <select
          v-model="filterType"
          class="p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary dark:focus:ring-secondary"
          aria-label="Filtrar por tipo"
        >
          <option value="">Todos los tipos</option>
          <option v-for="option in blogTypeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- Blogs Table -->
      <div v-if="filteredBlogs.length" class="overflow-x-auto rounded-lg">
        <table class="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow">
          <thead>
            <tr class="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-sm leading-normal dosis-font">
              <th class="py-3 px-6 text-left">ID</th>
              <th class="py-3 px-6 text-left">Título</th>
              <th class="py-3 px-6 text-left">Fecha</th>
              <th class="py-3 px-6 text-left">Categorías</th>
              <th class="py-3 px-6 text-center">Tipo</th>
              <th class="py-3 px-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 dark:text-gray-300 text-sm font-light josefin-font">
            <tr
              v-for="blog in filteredBlogs"
              :key="blog.id"
              class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/30"
            >
              <td class="py-3 px-6 text-left whitespace-nowrap">{{ blog.id }}</td>
              <td class="py-3 px-6 text-left whitespace-nowrap">
                <div class="flex items-center">
                  <img
                    :src="blog.image"
                    alt="Blog Image"
                    class="w-8 h-8 rounded-full mr-2 object-cover"
                  />
                  <span>{{ blog.title || 'Sin título' }}</span>
                </div>
              </td>
              <td class="py-3 px-6 text-left">{{ formatTimestamp(blog.date) || 'N/A' }}</td>
              <td class="py-3 px-6 text-left">
                {{ blog.categories?.length ? blog.categories.map(cat => cat.name).join(', ') : 'N/A' }}
              </td>              
              <td class="py-3 px-6 text-center">{{ getTypeLabel(blog.type) }}</td>
              <td class="py-3 px-6 text-center">
                <div class="flex item-center justify-center gap-2">
                  <button
                    @click="openPreviewModal(blog)"
                    class="p-2 rounded-full text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                    title="Vista previa"
                    aria-label="Vista previa del blog"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button
                    @click="openEditModal(blog)"
                    class="p-2 rounded-full text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-700/30 hover:bg-blue-200 dark:hover:bg-blue-600 transition-colors duration-200"
                    title="Editar"
                    aria-label="Editar blog"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    @click="setGenericModalConfig('delete', blog)"
                    class="p-2 rounded-full text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-700/30 hover:bg-red-200 dark:hover:bg-red-600 transition-colors duration-200"
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
      <div v-else class="text-center text-gray-600 dark:text-gray-300">
        No se encontraron blogs con los filtros aplicados.
      </div>
    </div>
    <!-- Create/Edit Modal Blog -->
    <EducationBlogFormModal
      :visible="showModal"
      :is-editing="isEditing"
      :blog-data="newBlog"
      :categories="categories"
      @save="handleSaveBlog"
      @close="closeModal"
    />
    <!-- Preview Modal -->
    <EducationBlogPreviewModal
      :visible="showPreviewModal"
      :blog="previewBlog"
      @close="closePreviewModal"
    />
    <!-- Migration Modal -->
    <EducationBlogMigrationModal
      :visible="showMigrationModal"
      @close="toggleMigrationModal"
    />
    <!-- Modal de confirmación genérico -->
    <GenericConfirmModal
      v-if="showConfirmModal"
      :visible="showConfirmModal"
      :title="genericModalConfig.title"
      :message="genericModalConfig.message"
      :confirmButtonText="genericModalConfig.confirmButtonText"
      :cancelButtonText="genericModalConfig.cancelButtonText"
      @cancel="genericModalConfig.cancelMethod"
      @confirmed="genericModalConfig.confirmMethod"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { defineAsyncComponent } from 'vue';
import { useEducationBlogsStore } from '../../stores/educationBlogs';
import { useSnackbarStore } from '../../stores/snackbar';
import { useCategories } from '../../composable/useCategories';
import Img from '../../assets/3.png';
import EducationBlogFormModal from '../../components/organisms/EducationBlogFormModal.vue';
import EducationBlogPreviewModal from '../../components/molecules/EducationBlogPreviewModal.vue';
import EducationBlogMigrationModal from '../../components/organisms/EducationBlogMigrationModal.vue';
import { formatTimestamp } from '../../utils/formatTimestamp';
import 'vue-multiselect/dist/vue-multiselect.css';
import { useThemeStore } from '../../stores/theme'; // Adjust path as needed
import GenericConfirmModal from '../../components/molecules/GenericConfirmModal.vue';

const themeStore = useThemeStore();
const isDark = computed(() => themeStore.isDarkMode); // Sync with store
const Multiselect = defineAsyncComponent(() => import('vue-multiselect'));

const blogsStore = useEducationBlogsStore();
const snackbarStore = useSnackbarStore();
const { fetchBlogCategories } = useCategories();

const searchQuery = ref('');
const selectedCategories = ref([]);
const filterType = ref('');
const showModal = ref(false);
const isEditing = ref(false);
const categoriesInput = ref('');
const showPreviewModal = ref(false);
const previewBlog = ref({});
const showMigrationModal = ref(false);
const showConfirmModal = ref(false);
const categories = ref([]);
const categoriesName = ref([]);

// Blog Type Enum
const blogType = Object.freeze({
  FREE: 0,
  PREMIUM: 1,
});

const blogTypeOptions = [
  { value: blogType.FREE, label: 'Free' },
  { value: blogType.PREMIUM, label: 'Premium' },
];

// Helper to get type label
const getTypeLabel = (type) => {
  const option = blogTypeOptions.find(opt => opt.value.toString() === type?.toString());
  return option ? option.label : 'N/A';
};
// Blog data
const newBlog = ref({
  id: null,
  title: '',
  image: Img,
  imageFile: null,
  imagePreview: null,
  date: new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }),
  intro: '',
  categories: [],
  type: 0, // Default to FREE
  summary: '',
  sections: [],
});

const genericModalConfig = ref({
  title: "",
  message: "",
  confirmButtonText: "Confirmar",
  cancelButtonText: "Cancelar",
  cancelMethod: () => {
    showConfirmModal.value = false;
    document.body.style.overflow = "";
  },
  confirmMethod: () => {
    showConfirmModal.value = false;
    document.body.style.overflow = "";
  },
});

// Computed properties
const filteredBlogs = computed(() => {
  let filtered = blogsStore.blogs.value || [];
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
      selectedCategories.value.every((selectedCat) =>
        blog.categories?.some((blogCat) => blogCat.idDoc === selectedCat.idDoc)
      )
    );
  }

  if (filterType.value !== '') {
    filtered = filtered.filter((blog) => blog.type?.toString() === filterType.value.toString());
  }

  return filtered;
});

// Fetch categories on mount
onMounted(async () => {
  blogsStore.subscribeToBlogs();
  try {
    const blogCategories = await fetchBlogCategories();
    categories.value = blogCategories.sort((a, b) => a.name.localeCompare(b.name)); // ordeno x name  
    categoriesName.value = blogCategories.map(cat => cat.name);
  } catch (error) {
    console.error('Error al cargar categorías:', error);
    snackbarStore.show('Error al cargar categorías: ' + error.message, 'error');
  }
});

// Modal handling
const openCreateModal = () => {
  resetForm();
  isEditing.value = false;
  showModal.value = true;
};

const openEditModal = async (blog) => {
  try {
    const blogData = await blogsStore.getBlogById(blog.id);
    newBlog.value = {
      id: blogData.id,
      title: blogData.title || '',
      image: blogData.image || Img,
      imageFile: null,
      imagePreview: null,
      date: blogData.date || '',
      intro: blogData.intro || '',
      categories: blogData.categories || [],
      type: blogData.type || 0,
      summary: blogData.summary || '',
      sections: blogData.sections.map((section) => ({
        ...section,
        imageFile: null,
        imagePreview: null,
      })),
    };
    categoriesInput.value = blogData.categories?.join(', ') || '';
    isEditing.value = true;
    showModal.value = true;
  } catch (error) {
    console.error('Error al cargar blog para edición:', error);
    snackbarStore.show('Error al cargar blog: ' + error.message, 'error');
  }
};

const closeModal = () => {
  resetForm();
  showModal.value = false;
};

const openPreviewModal = async (blog) => {
  try {
    const blogData = await blogsStore.getBlogById(blog.id);
    previewBlog.value = {
      id: blogData.id,
      title: blogData.title,
      image: blogData.image || Img,
      date: blogData.date,
      intro: blogData.intro,
      categories: blogData.categories || [],
      type: blogData.type,
      summary: blogData.summary,
      sections: blogData.sections || [],
    };
    showPreviewModal.value = true;
  } catch (error) {
    console.error('Error al cargar vista previa:', error);
    snackbarStore.show('Error al cargar vista previa: ' + error.message, 'error');
  }
};

const closePreviewModal = () => {
  showPreviewModal.value = false;
  previewBlog.value = {};
};

const toggleMigrationModal = () => {
  showMigrationModal.value = !showMigrationModal.value;
};

const resetForm = () => {
  newBlog.value = {
    id: null,
    title: '',
    image: Img,
    imageFile: null,
    imagePreview: null,
    date: new Date().toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    intro: '',
    categories: [],
    type: 0, // Default to FREE
    summary: '',
    sections: [],
  };
  categoriesInput.value = '';
};

// Save blog
const handleSaveBlog = ({ blog, error }) => {
  showModal.value = false;
  if (error) {
    snackbarStore.show('Error al guardar blog: ' + error, 'error');
  } else {
    snackbarStore.show(`Blog ${isEditing.value ? 'actualizado' : 'creado'} exitosamente`, 'success');
  }
};

// Delete blog
const deleteBlog = async (id) => {
  try {
    await blogsStore.deleteBlog(id);
    snackbarStore.show('Blog eliminado exitosamente', 'success');
  } catch (error) {
    console.error('Error al eliminar blog:', error);
    snackbarStore.show('Error al eliminar blog: ' + error.message, 'error');
  }
};

// Configurar modal genérico
const setGenericModalConfig = (action, blog) => {
  switch (action) {
    case "delete":
      genericModalConfig.value = {
        title: "Eliminar Blog Permanentemente",
        message: `¿Estás seguro de que deseas eliminar el blog: ${blog.title}?`,
        confirmButtonText: "Eliminar",
        cancelButtonText: "Cancelar",
        confirmMethod: () => {
          deleteBlog(blog.id);
          showConfirmModal.value = false;
          document.body.style.overflow = "";
        },
        cancelMethod: () => {
          showConfirmModal.value = false;
          document.body.style.overflow = "";
        },
      };
      break;
    default:
      // Fallback
      genericModalConfig.value = {
        title: "Acción no definida",
        message: "No se ha definido una acción para esta operación.",
        confirmButtonText: "Aceptar",
        cancelButtonText: "Cancelar",
        confirmMethod: () => {},
        cancelMethod: () => {
          showConfirmModal.value = false;
          document.body.style.overflow = "";
        },
      };
  }
  showConfirmModal.value = true;
};

// Lifecycle hooks
onUnmounted(() => {
  blogsStore.unsubscribeFromBlogs();
});
</script>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(155, 155, 155, 0.5);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.animate-pulse-step {
  animation: pulseStep 0.5s ease-in-out;
}

@keyframes pulseStep {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.2);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 0 8px rgba(0, 0, 0, 0.1);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
  }
}
</style>