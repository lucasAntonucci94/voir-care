<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col h-full">
    
    <!-- Media Section (Image or Video) -->
    <div class="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden bg-gray-200 dark:bg-gray-700">
      <template v-if="location.media && location.media.url">
        <img
          v-if="location.media.type === 'image'"
          :src="location.media.url"
          :alt="location.title"
          class="w-full h-full object-cover"
          onerror="this.onerror=null;this.src='https://placehold.co/600x400/E0E0E0/666666?text=No+Image';"
        />
        <video
          v-else-if="location.media.type === 'video'"
          :src="location.media.url"
          :title="location.title"
          autoplay
          loop
          muted
          playsinline
          class="w-full h-full object-cover"
          onerror="this.onerror=null;this.src='https://placehold.co/600x400/E0E0E0/666666?text=No+Video';"
        ></video>
        <img
          v-else
          src="https://placehold.co/600x400/E0E0E0/666666?text=Media+Type+Unknown"
          alt="Media Type Unknown"
          class="w-full h-full object-cover"
        />
      </template>
      <img
        v-else
        src="https://placehold.co/600x400/E0E0E0/666666?text=No+Media"
        alt="No Media Available"
        class="w-full h-full object-cover"
      />
      <!-- Botón de elipsis -->
        <div
            v-if="location.user.id === user?.id || user?.isAdmin"
            class="absolute top-3 right-3"
        >
            <button
                ref="menuButton"
                @click.stop="toggleMenu"
                class="p-2 text-white bg-gray-900/50 dark:bg-gray-900/70 rounded-full hover:bg-gray-900/70 dark:hover:bg-gray-900/90 transition-colors"
                aria-label="Opciones del marcador"
            >
                <i class="fas fa-ellipsis-v"></i>
            </button>
            <!-- Menú desplegable -->
            <div
                v-if="showMenu"
                ref="menu"
                class="absolute top-10 right-0 bg-white dark:bg-gray-700 rounded-lg shadow-lg w-48 py-2 z-22 border border-gray-100 dark:border-gray-600"
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
      <!-- Title and Type -->
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ location.title }}</h3>
        <span class="text-xs font-semibold px-2 py-1 rounded-full" :class="typeBadgeClass">{{ location.type }}</span>
      </div>

      <!-- Description -->
      <p class="text-sm text-gray-600 dark:text-gray-300 mb-3 flex-grow line-clamp-3">{{ location.description }}</p>

      <!-- Address -->
      <div v-if="location.address && location.address.street" class="flex items-center text-gray-700 dark:text-gray-300 text-sm mb-2">
        <i class="fas fa-map-marker-alt mr-2 text-primary dark:text-secondary"></i>
        <span>{{ location.address.street }}</span>
      </div>

      <!-- Contact Info -->
      <div v-if="location.contact" class="flex flex-col gap-1 mb-3">
        <a v-if="location.contact.phone" :href="`tel:${location.contact.phone}`" class="flex items-center text-primary dark:text-secondary text-sm hover:underline">
          <i class="fas fa-phone mr-2"></i>
          <span>{{ location.contact.phone }}</span>
        </a>
        <a v-if="location.contact.socialNetworkLink" :href="location.contact.socialNetworkLink" target="_blank" rel="noopener noreferrer" class="flex items-center text-primary dark:text-secondary text-sm hover:underline">
          <i class="fab fa-instagram mr-2"></i> <!-- O el icono de la red social correspondiente -->
          <span>Red Social</span>
        </a>
      </div>

      <!-- User Info -->
      <div v-if="location.user" class="flex items-center mt-auto pt-3 border-t border-gray-200 dark:border-gray-700">
        <img
          :src="location.user.photoURLFile || AvatarFallback"
          :alt="location.user.displayName || 'Usuario'"
          class="w-8 h-8 rounded-full object-cover mr-3"
        /> 
        <span class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ location.user.displayName || 'Usuario Desconocido' }}</span>
      </div>

      <!-- Timestamp (optional, can be formatted) -->
      <p v-if="location.timestamp" class="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Publicado: {{ formattedTimestamp }}
      </p>
    </div>
    <CreateLocationModal 
      v-if="showEditModal"
      :visible="showEditModal"
      :locationToEdit="selectedLocation"
      @close="closeEditModal"
      @submit="submitEdit"
    />
    <!-- Modal de confirmación para eliminar el marcador -->
    <GenericConfirmModal
      :visible="showDeleteModal"
      title="Confirmar eliminación"
      message="¿Estás seguro de que deseas eliminar este marcado del mapa?"
      confirmButtonText="Eliminar"
      cancelButtonText="Cancelar"
      @cancel="closeDeleteModal"
      @confirmed="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { defineProps, computed } from 'vue';
import { useAuth } from '../../api/auth/useAuth';
import { useLocationsStore } from '../../stores/locations';
import { useSnackbarStore } from '../../stores/snackbar';
import CreateLocationModal from '../organisms/CreateLocationModal.vue';
import AvatarFallback from '../../assets/avatar1.jpg'; // Fallback image for user avatar
import GenericConfirmModal from './GenericConfirmModal.vue';

const props = defineProps({
    location: {
        type: Object,
        required: true,
        validator: (value) => {
            // Basic validation to ensure key properties exist
            return value && value.title && value.description && value.type;
        },
    },
});

const { user } = useAuth();

const showMenu = ref(false);
const menu = ref(null);
const menuButton = ref(null);
const showDeleteModal = ref(false);
const showEditModal = ref(false);
const selectedLocation = ref(null);
const locationsStore = useLocationsStore();
const snackbarStore = useSnackbarStore();

// Computed property for dynamic badge class based on location type
const typeBadgeClass = computed(() => {
  switch (props.location.type) {
    case 'veterinaria':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
    case 'refugio':
      return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
    case 'estetica':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-800 dark:text-pink-100';
    case 'etologo':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100';
    case 'paseador':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
    case 'petshop':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100';
    case 'especialista':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
});

// Computed property to format timestamp
const formattedTimestamp = computed(() => {
  if (props.location.timestamp) {
    // Check if it's a Firebase Timestamp object
    const date = props.location.timestamp.toDate 
      ? props.location.timestamp.toDate() 
      : new Date(props.location.timestamp); // Fallback for non-Timestamp dates

    if (!isNaN(date)) { // Check if date is valid
      return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }
  return 'Fecha desconocida';
});

// Handle clicks outside the menu
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

function toggleMenu() {
  showMenu.value = !showMenu.value;
}


function handleDelete() {
  showDeleteModal.value = true;
  showMenu.value = false;
  document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
  showDeleteModal.value = false;
  document.body.style.overflow = '';
}

async function confirmDelete() {
  try {
    await locationsStore.deleteLocation(props.location.idDoc);
    snackbarStore.show(`Marcador de mapa ${props.location.title} eliminado exitosamente`, 'success');
  } catch (error) {
    console.error('Error al eliminar location:', error);
    snackbarStore.show(`Error al eliminar el marcador. IdDoc:${props.location.idDoc}, Title: ${props.location.title}.`, 'error');
  }
  closeDeleteModal();
}

function openEditModal() {
  selectedLocation.value = { ...props.location };
  showEditModal.value = true;
  showMenu.value = false;
  document.body.style.overflow = 'hidden';
}

function closeEditModal() {
  showEditModal.value = false;
  document.body.style.overflow = '';
}

function submitEdit(updatedLocation) {
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
/* You might need to import Font Awesome if you haven't already in your main CSS or HTML */
/* Example: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"> */

/* Utility for line clamping */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
