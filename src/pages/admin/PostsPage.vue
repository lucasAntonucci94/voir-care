<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Administración de Posteos</h1>
    </div>

    <!-- Loading State -->
    <div v-if="postsStore.isLoading || isLoadingCategories" class="text-center text-gray-600 dark:text-gray-300">
      <i class="fas fa-spinner fa-spin mr-2"></i> Cargando posteos...
    </div>
    <div v-else>
      <!-- Search and Filters -->
      <div class="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por título o contenido..."
          class="w-full sm:w-1/3 p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary transition-all duration-200"
          aria-label="Buscar posteos"
        />
        <CategoryMultiselect
          v-model="filterCategory"
          :categories="categories"
          :multiple="false"
          :is-loading="postsStore.isLoading || isLoadingCategories"
          placeholder="Filtrar por categoría"
          :allow-empty="true"
          label-key="name"
          track-by-key="idDoc"
          aria-label="Filtrar por categoría"
        />
      </div>

      <!-- Posts Table -->
      <div v-if="filteredPosts.length" class="overflow-x-auto">
        <table class="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow">
          <thead>
            <tr class="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-sm leading-normal">
              <th class="py-3 px-6 text-left">Título</th>
              <th class="py-3 px-6 text-left">Autor</th>
              <th class="py-3 px-6 text-left">Categorías</th>
              <th class="py-3 px-6 text-center">Fecha</th>
              <th class="py-3 px-6 text-center">Likes</th>
              <th class="py-3 px-6 text-center">Media</th>
              <th class="py-3 px-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 dark:text-gray-300 text-sm font-light">
            <tr
              v-for="post in filteredPosts"
              :key="post.idDoc"
              class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100/80 dark:hover:bg-gray-600/80"
            >
              <td class="py-3 px-6 text-left whitespace-nowrap">
                <div class="flex items-center">
                  <span>{{ post.title || 'Sin título' }}</span>
                </div>
              </td>
              <td class="py-3 px-6 text-left">{{ post.userId || 'N/A' }}</td>
              <td class="py-3 px-6 text-left">{{ post.categories?.length ? post.categories.map(cat => cat.name).join(', ') : 'N/A' }}</td>
              <td class="py-3 px-6 text-center">{{ formatDate(post.created_at) }}</td>
              <td class="py-3 px-6 text-center">{{ post.likes?.length || 0 }}</td>
              <td class="py-3 px-6 text-center">
                <span :class="post.media ? 'text-green-500' : 'text-red-500'">
                  {{ post.media ? 'Sí' : 'No' }}
                </span>
              </td>
              <td class="flex items-center justify-between gap-2 py-3 px-6 text-center">
                <button
                  @click="openPostDetailModal(post)"
                  class="w-full text-left px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 hover:text-primary dark:bg-gray-700 dark:hover:bg-gray-800 dark:hover:text-secondary transition-all duration-200"
                >
                  <i class="fas fa-eye mr-2 text-primary dark:text-secondary"></i> Ver
                </button>
                <div class="relative" :ref="`dropdown-${post.idDoc}`">
                  <button
                    @click="toggleActionsMenu(post.idDoc)"
                    class="text-gray-600 hover:text-primary dark:text-white dark:hover:text-secondary focus:outline-none transition-colors duration-200 bg-gray-100/10 hover:bg-gray-100/40 dark:bg-gray-700 hover:dark:bg-gray-800 rounded-full p-1 w-8 h-8 shadow-sm hover:shadow-md"
                    aria-label="Más acciones"
                  >
                    <i class="fas fa-ellipsis-h"></i>
                  </button>
                  <div
                    v-if="activeDropdown === post.idDoc"
                    class="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 dark:border-gray-800 border border-gray-200 rounded-lg shadow-lg z-10"
                  >
                    <ul class="py-1 text-sm text-gray-700 dark:text-gray-200">
                      <li>
                        <button
                          @click="setGenericModalConfig('delete', post)"
                          class="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-primary dark:bg-gray-700 dark:hover:bg-gray-800 dark:hover:text-secondary transition-all duration-200"
                        >
                          <i class="fas fa-trash-can mr-2 text-red-500"></i> Eliminar
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center text-gray-600 dark:text-gray-300">
        No se encontraron posteos con los filtros aplicados.
      </div>
    </div>

    <!-- Modal detalle de posteo -->
    <PostDetailModal
      v-if="showPostDetailModal"
      :visible="showPostDetailModal"
      :post="selectedPost"
      @close="closePostDetailModal"
    />

    <!-- Modal de confirmación -->
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
import { usePostsStore } from '../../stores/posts';
import { useSnackbarStore } from '../../stores/snackbar';
import { useThemeStore } from '../../stores/theme';
import { useCategories } from '../../composable/useCategories';
import CategoryMultiselect from '../../components/atoms/SelectCategories.vue';
import PostDetailModal from '../../components/organisms/PostDetailModal.vue';
import GenericConfirmModal from '../../components/molecules/GenericConfirmModal.vue';
import 'vue-multiselect/dist/vue-multiselect.css';

const postsStore = usePostsStore();
const snackbarStore = useSnackbarStore();
const themeStore = useThemeStore();
const { categories, loadCategories } = useCategories(); // Usar el composable

const isDark = computed(() => themeStore.isDarkMode);
const isLoadingCategories = ref(false);

// Estado reactivo
const searchQuery = ref('');
const filterCategory = ref(null);
const showPostDetailModal = ref(false);
const showConfirmModal = ref(false);
const selectedPost = ref(null);
const activeDropdown = ref(null);

// Cargar categorías al montar el componente
onMounted(async () => {
  postsStore.subscribeGlobal();
  document.addEventListener('click', handleClickOutside);
  isLoadingCategories.value = true;
  try {
    await loadCategories();
  } catch (error) {
    snackbarStore.show('Error al cargar categorías', 'error');
  } finally {
    isLoadingCategories.value = false;
  }
});

// Computed para posts filtrados
const filteredPosts = computed(() => {
  let filtered = postsStore.posts.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (post) =>
        post.title?.toLowerCase().includes(query) ||
        post.body?.toLowerCase().includes(query)
    );
  }

  if (filterCategory.value) {
    filtered = filtered.filter((post) =>
      post.categories?.some((cat) => cat.idDoc === filterCategory.value.idDoc)
    );
  }

  return filtered;
});

// Format date
const formatDate = (timestamp) => {
  if (!timestamp || !timestamp.toDate) return 'N/A';
  return timestamp.toDate().toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Open detail modal
const openPostDetailModal = (post) => {
  selectedPost.value = { ...post };
  showPostDetailModal.value = true;
  activeDropdown.value = null;
  document.body.style.overflow = 'hidden';
};

// Close detail modal
const closePostDetailModal = () => {
  selectedPost.value = null;
  showPostDetailModal.value = false;
  document.body.style.overflow = '';
};

// Delete post
const deletePost = async (idDoc) => {
  try {
    await postsStore.deletePost(idDoc);
    snackbarStore.show('Posteo eliminado exitosamente', 'success');
    activeDropdown.value = null;
  } catch (error) {
    snackbarStore.show(`Error al eliminar el posteo: ${error.message}`, 'error');
  }
};

// Toggle dropdown menu
const toggleActionsMenu = (idDoc) => {
  activeDropdown.value = activeDropdown.value === idDoc ? null : idDoc;
};

// Handle click outside to close dropdown
const handleClickOutside = (event) => {
  filteredPosts.value.forEach((post) => {
    const dropdown = document.querySelector(`[ref="dropdown-${post.idDoc}"]`);
    if (dropdown && !dropdown.contains(event.target)) {
      activeDropdown.value = null;
    }
  });
};

// Set generic modal configuration
const setGenericModalConfig = (action, post) => {
  switch (action) {
    case 'delete':
      genericModalConfig.value = {
        title: 'Eliminar posteo',
        message: `¿Estás seguro de que deseas eliminar el posteo "${post.title || 'sin título'}"?`,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
        confirmMethod: () => {
          deletePost(post.idDoc);
          showConfirmModal.value = false;
          document.body.style.overflow = '';
        },
        cancelMethod: () => {
          showConfirmModal.value = false;
          document.body.style.overflow = '';
        },
      };
      break;
    default:
      genericModalConfig.value = {
        title: 'Acción no definida',
        message: 'No se ha definido una acción para esta operación.',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        confirmMethod: () => {},
        cancelMethod: () => {
          showConfirmModal.value = false;
          document.body.style.overflow = '';
        },
      };
  }
  showConfirmModal.value = true;
  document.body.style.overflow = 'hidden';
};

// Limpiar suscripciones al desmontar
onUnmounted(() => {
  postsStore.unsubscribeGlobal();
  document.removeEventListener('click', handleClickOutside);
});
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
</style>