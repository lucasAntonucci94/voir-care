<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col h-full transition transition-transform hover:scale-101"
  >
    <!-- @click.stop="$emit('open-reel', reel)" -->
    
    <!-- Media Section (Image or Video) -->
    <div class="relative w-full h-52 sm:h-70 md:h-80 overflow-hidden bg-gray-200 dark:bg-gray-700">
      <template v-if="reel.mediaUrl">
        <img
          v-if="reel.mediaType === 'image'"
          :src="reel.mediaUrl"
          :alt="reel.title || 'Reel Image'"
          class="w-full h-full object-cover"
        />
        <video
          v-else-if="reel.mediaType === 'video'"
          :src="reel.mediaUrl"
          :title="reel.title || 'Reel Video'"
          autoplay
          loop
          muted
          playsinline
          class="w-full h-full object-cover"
        ></video>
        <img
          v-else
          :src="AvatarFallback"
          alt="Media Type Unknown"
          class="w-full h-full object-cover"
        />
      </template>
      <img
        v-else
        :src=AvatarFallback
        alt="No Media Available"
        class="w-full h-full object-cover"
      />

      <!-- Botón de elipsis (Opciones del Reel) -->
      <div
        v-if="reel.user.uid === user?.uid || user?.isAdmin"
        class="absolute top-3 right-3"
      >
        <button
          ref="menuButton"
          @click.stop="toggleMenu"
          class="p-2 text-white bg-gray-900/50 dark:bg-gray-900/70 rounded-full hover:bg-gray-900/70 dark:hover:bg-gray-900/90 transition-colors"
          aria-label="Opciones del reel"
        >
          <i class="fas fa-ellipsis-v"></i>
        </button>
        <!-- Menú desplegable -->
        <div
          v-if="showMenu"
          ref="menu"
          class="absolute top-10 right-0 bg-white dark:bg-gray-700 rounded-lg shadow-lg w-40 py-2 z-22 border border-gray-100 dark:border-gray-600"
        >
          <button
            @click.stop="openEditModal"
            class="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <i class="fas fa-edit"></i>
            Editar
          </button>
          <button
            @click.stop="handleDelete"
            class="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <i class="fas fa-trash-can"></i>
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="p-4 flex flex-col flex-grow">
      <!-- User Info -->
      <div v-if="reel.user" class="flex items-center mb-3">
        <img
          :src="reel.user.photoURL || AvatarFallback"
          :alt="reel.user.displayName || 'Usuario'"
          class="w-10 h-10 rounded-full object-cover mr-3 border-2 border-primary dark:border-secondary"
        />
        <div class="flex flex-col">
          <span class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ reel.user.displayName || 'Usuario Desconocido' }}</span>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ formattedCreatedAt }}</p>
        </div>
      </div>

      <!-- Title -->
      <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{{ reel.title || 'Sin título' }}</h3>

      <!-- Likes and Views -->
      <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-auto pt-3 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <i class="fas fa-heart mr-1 text-red-500"></i>
          <span>{{ reel.likes?.length || 0 }}</span>
        </div>
        <div class="flex items-center">
          <i class="fas fa-eye mr-1 text-blue-500"></i>
          <span>{{ reel.views || 0 }}</span>
        </div>
      </div>
    </div>

    <!-- Modals for Edit/Delete (similar to LocationCard, you'd define these in the parent or globally) -->
    <CreateReelModal
      v-if="showEditModal"
      :visible="showEditModal"
      :reelToEdit="selectedReel"
      @close="closeEditModal"
      @submit="submitEdit"
    />
    

    <GenericConfirmModal
      :visible="showDeleteModal"
      title="Confirmar eliminación de Reel"
      message="¿Estás seguro de que deseas eliminar este reel? Esta acción no se puede deshacer."
      confirmButtonText="Eliminar"
      cancelButtonText="Cancelar"
      @cancel="closeDeleteModal"
      @confirmed="confirmDelete"
    />

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useAuth } from '../../api/auth/useAuth';
import { useReelsStore } from '../../stores/reels';
import { useSnackbarStore } from '../../stores/snackbar';
import AvatarFallback from '../../assets/avatar1.jpg';
import GenericConfirmModal from '../molecules/GenericConfirmModal.vue';
import CreateReelModal from '../organisms/CreateReelModal.vue';

const props = defineProps({
  reel: {
    type: Object,
    required: true,
    validator: (value) => {
      // Validación básica para asegurar que las propiedades clave existen
      return value && value.idDoc && value.mediaUrl && value.mediaType && value.user;
    },
  },
});

const { user } = useAuth();
const reelsStore = useReelsStore();
const snackbarStore = useSnackbarStore();

const showMenu = ref(false);
const menu = ref(null);
const menuButton = ref(null);

// Modals
const showDeleteModal = ref(false);
const showEditModal = ref(false);
const selectedReel = ref(null);

// Formateo fecha
const formattedCreatedAt = computed(() => {
  if (props.reel.createdAt) {
    const date = props.reel.createdAt.toDate
      ? props.reel.createdAt.toDate()
      : new Date(props.reel.createdAt); // Fallback
    if (!isNaN(date)) {
      return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'short', // 'long' para mes completo, 'short' para abreviado
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }
  return 'Fecha desconocida';
});

// Lógica para mostrar/ocultar el menú de elipsis
const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

// Cierra el menú si se hace clic fuera
const handleClickOutside = (event) => {
  if (
    showMenu.value &&
    menu.value &&
    menuButton.value &&
    !menu.value.contains(event.target) &&
    !menuButton.value.contains(event.target)
  ) {
    showMenu.value = false;
  }
};

// Funciones para manejar los modales (similares a LocationCard)
const handleDelete = () => {
  showDeleteModal.value = true;
  showMenu.value = false;
  document.body.style.overflow = 'hidden'; // Si usas para bloquear scroll
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  document.body.style.overflow = '';
};

async function confirmDelete() {
  try {
    await reelsStore.deleteReel(props.reel);
    snackbarStore.show(`Reel ${props.reel.title} eliminado exitosamente`, 'success');
  } catch (error) {
    console.error('Error al eliminar reel:', error);
    snackbarStore.show(`Error al eliminar el reel.`, 'error');
  }
  closeDeleteModal();
}

const openEditModal = () => {
  selectedReel.value = { ...props.reel };
  showEditModal.value = true;
  showMenu.value = false;
  document.body.style.overflow = 'hidden';
};

const closeEditModal = () => {
  showEditModal.value = false;
  document.body.style.overflow = '';
};

function submitEdit(updatedReel) {
  closeEditModal();
}


onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* Utility for line clamping */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>