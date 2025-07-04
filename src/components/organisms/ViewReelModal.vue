<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/95 z-[101] transition-opacity duration-300 overflow-hidden"
    @click.self="closeModal"
    tabindex="0"
    ref="viewModal"
  >
    <div class="flex h-full w-full">
      <!-- Área multimedia: fondo oscuro con gradiente -->
      <div class="flex-1 flex items-center justify-center relative bg-gradient-to-b from-gray-900 to-black">
        <div v-if="reel?.mediaType === 'image'" class="media-container">
          <img
            :src="reel.mediaUrl"
            :alt="reel.title"
            class="max-w-full max-h-full object-contain rounded-2xl shadow-xl border border-gray-800/50"
          />
        </div>
        <div v-else-if="reel?.mediaType === 'video'" class="media-container">
          <video
            :src="reel.mediaUrl"
            controls
            autoplay
            class="max-w-full max-h-full object-contain rounded-2xl shadow-xl border border-gray-800/50"
          ></video>
        </div>
        <!-- Navegación: flechas con diseño elegante -->
        <button
          v-if="hasPreviousReel"
          @click.stop="previousReel"
          class="absolute left-6 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-12 h-12 bg-gray-500/80 dark:bg-gray-800/80 text-gray-100 dark:text-gray-200 hover:bg-primary/80 dark:hover:bg-secondary/80 hover:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary transition-all duration-300 shadow-lg"
          aria-label="Reel anterior"
        >
          <i class="fa-solid fa-chevron-left text-lg"></i>
        </button>
        <button
          v-if="hasNextReel"
          @click.stop="nextReel"
          class="absolute right-6 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-12 h-12 bg-gray-500/80 dark:bg-gray-800/80 text-gray-100 dark:text-gray-200 hover:bg-primary/80 dark:hover:bg-secondary/80 hover:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary transition-all duration-300 shadow-lg"
          aria-label="Siguiente reel"
        >
          <i class="fa-solid fa-chevron-right text-lg"></i>
        </button>
      </div>

      <!-- Panel de metadatos: lateral con diseño mejorado -->
      <div
        class="w-full md:w-96 bg-gradient-to-b from-gray-200 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-white p-6 flex flex-col justify-between relative rounded-t-2xl md:rounded-l-2xl shadow-2xl overflow-y-auto border-l border-gray-300 dark:border-gray-700"
      >
        <div class="space-y-6">
          <!-- Sección del usuario con avatar -->
          <router-link
            :to="`/profile/${reel?.user?.email}`"
            class="flex items-center gap-3 rounded hover:bg-gray-300/50 dark:hover:bg-gray-700/50 p-2 transition-all duration-200"
          >
            <img v-if="!reel?.default"
              :src="reel?.user?.photoURL || AvatarDefault"
              alt="User avatar"
              class="w-12 h-12 rounded-full object-cover border-2 border-primary dark:border-secondary shadow-md"
            />
            <div v-else>
              <img
                src="../../assets/icons/logoGreen.png"
                alt="User avatar"
                class="w-12 h-12 rounded-full object-cover border-2 border-primary dark:border-secondary shadow-md dark:hidden"
              />
              <img
                src="../../assets/icons/logoOrange.png" 
                alt="User avatar"
                class="w-12 h-12 rounded-full object-cover border-2 border-primary dark:border-secondary shadow-md hidden dark:inline"
              />
            </div>
            <div>
              <p class="text-lg font-semibold text-primary dark:text-secondary">{{ reel?.user?.displayName }}</p>
              <p class="text-xs text-gray-600 dark:text-gray-400">{{ formatTimestamp(reel?.createdAt) }}</p>
            </div>
          </router-link>

          <!-- Botón de opciones -->
          <div v-if="!reel?.default" class="absolute ml-5 left-0 bottom-0 z-10" ref="dropdownRef">
            <button
              @click="showSettingsMenu = !showSettingsMenu"
              class="flex items-center text-gray-600 hover:text-primary dark:text-white dark:hover:text-gray-300 focus:outline-none transition-colors duration-200 bg-gray-100/10 hover:bg-gray-100/40 dark:bg-gray-700 hover:dark:bg-gray-600 rounded-lg p-2 h-8 shadow-sm hover:shadow-md"
            >
              <i class="fas fa-ellipsis-h"></i>
              <span class="ml-2 text-sm hidden md:inline">Opciones</span>
            </button>
            <div
              v-if="showSettingsMenu"
              class="absolute left-0 bottom-10 mt-2 w-40 bg-white dark:bg-gray-700 dark:border-gray-800 border border-gray-200 rounded-lg shadow-lg z-10"
            >
              <ul class="py-1 text-sm text-gray-700 dark:text-gray-200">
                <!-- Delete Reel (Owner or Admin) -->
                <li v-if="isOwner">
                  <button
                    @click="openDeleteModal"
                    class="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-primary dark:bg-gray-700 dark:hover:bg-gray-800 dark:hover:text-secondary transition-all duration-200"
                  >
                    <i class="fas fa-trash-can mr-2"></i> Eliminar
                  </button>
                </li>
                <!-- Report Reel (Non-owner) -->
                <li v-if="!isOwner">
                  <button
                    @click="openReportModal"
                    class="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-primary dark:bg-gray-700 dark:hover:bg-gray-800 dark:hover:text-secondary transition-all duration-200"
                  >
                    <i class="fas fa-flag mr-2"></i> Reportar
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <!-- Separador -->
          <hr class="border-gray-300 dark:border-gray-600" />

          <!-- Título del reel -->
          <h3 class="text-xl font-bold text-gray-800 dark:text-white tracking-tight overflow-wrap break-word word-break-break-word max-w-full">
            {{ reel?.title }}
          </h3>

          <!-- Mensaje de feedback -->
          <transition name="fade">
            <div
              v-if="message"
              class="p-3 rounded-lg text-sm"
              :class="{
                'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200': messageType === 'success',
                'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200': messageType === 'error',
              }"
            >
              {{ message }}
            </div>
          </transition>

          <!-- Acciones -->
          <div v-if="!reel?.default" class="text-sm space-y-4">
            <p class="flex items-center space-x-2">
              <span class="font-semibold text-gray-600 dark:text-gray-300">Visualizaciones:</span>
              <span class="text-gray-600 dark:text-gray-100 flex items-center">
                {{ formatNumber(reel?.views || 0) }}
                <i class="fa-solid fa-eye text-primary dark:text-secondary ml-2"></i>
              </span>
            </p>
            <div class="flex items-center space-x-2">
              <span class="font-semibold text-gray-600 dark:text-gray-300">Me gusta:</span>
              <span class="text-gray-600 dark:text-gray-100">{{ reel?.likes?.length || 0 }}</span>
              <button
                @click="handleToggleLike"
                :disabled="isLiking || !user || !isAuthenticated"
                class="ml-2 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 transform hover:scale-110"
                :class="{
                  'bg-red-100/50 dark:bg-red-600/20 text-red-400 hover:bg-red-200/50 dark:hover:bg-red-600/30': !hasLiked,
                  'bg-red-500/20 dark:bg-red-700/20 text-red-500 hover:bg-red-600/30 dark:hover:bg-red-700/30': hasLiked,
                  'opacity-50 cursor-not-allowed': isLiking || !user || !isAuthenticated,
                }"
                aria-label="Toggle like"
              >
                <i class="fa-heart text-xl" :class="{ 'fa-solid': hasLiked, 'fa-regular': !hasLiked }"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Botón de cierre -->
        <button
          @click="closeModal"
          class="absolute top-4 right-4 flex items-center justify-center w-10 h-10 bg-gray-500/80 dark:bg-gray-800/80 text-gray-100 dark:text-gray-200 hover:bg-primary dark:hover:bg-secondary hover:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary transition-all duration-300 shadow-lg"
          aria-label="Cerrar modal"
        >
          <i class="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>
    </div>

    <!-- Modal de reporte -->
    <ModalReport
      :visible="showReportModal"
      :entity-type="'reel'"
      :entity-id="reel?.idDoc || ''"
      :metadata="{ reelTitle: reel?.title || '' }"
      @close="closeReportModal"
      @reported="closeReportModal"
    />

    <!-- Modal de confirmación al eliminar un mensaje -->
    <GenericConfirmModal
      :visible="showDeleteModal"
      title="Confirmar eliminación"
      message="¿Estás seguro de que deseas eliminar este mensaje?"
      confirmButtonText="Eliminar"
      cancelButtonText="Cancelar"
      @cancel="closeDeleteModal"
      @confirmed="deleteReel"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue';
import { formatTimestamp } from '../../utils/formatTimestamp.js';
import { useReelsStore } from '../../stores/reels.js';
import { useAuth } from '../../api/auth/useAuth';
import { useSnackbarStore } from '../../stores/snackbar';
import AvatarDefault from '../../assets/avatar1.jpg';
import GenericConfirmModal from '../molecules/GenericConfirmModal.vue';
import ModalReport from '../molecules/ReportModal.vue';

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  reel: {
    type: Object,
    default: null,
  },
  reels: {
    type: Array,
    required: true,
  },
});
debugger
// Emits
const emit = defineEmits(['close', 'update-reel']);

// References
const viewModal = ref(null);
const reelsStore = useReelsStore();
const { user, isAuthenticated } = useAuth();
const isLiking = ref(false);
const message = ref(null);
const messageType = ref(null);
const snackbarStore = useSnackbarStore();
const viewedReelId = ref(null);
const showSettingsMenu = ref(false);
const dropdownRef = ref(null);
const showDeleteModal = ref(false);
const showReportModal = ref(false);

// Almacenar índices actuales para navegación
const currentGroupIndexRef = ref(-1);
const currentReelInGroupIndexRef = ref(-1);

// Computed
const hasLiked = computed(() => {
  return props.reel?.likes?.some((like) => like.userId === user.value?.uid) || false;
});

const isOwner = computed(() => {
  return props.reel?.user?.uid === user.value?.uid || false;
});

// Calcular índices basados en la lista actual
const calculateIndices = () => {
  if (!props.reel || !props.reels || !props.reels.length) {
    currentGroupIndexRef.value = -1;
    currentReelInGroupIndexRef.value = -1;
    return;
  }
  const groupIndex = props.reels.findIndex((group) => group.reels.some((reel) => reel.id === props.reel.id));
  if (groupIndex === -1) {
    // Reel no encontrado, mantener índices previos o cerrar modal si no hay más reels
    if (props.reels.length === 0) {
      closeModal();
    }
    return;
  }
  const currentGroup = props.reels[groupIndex];
  const reelIndex = currentGroup.reels.findIndex((reel) => reel.id === props.reel.id);
  currentGroupIndexRef.value = groupIndex;
  currentReelInGroupIndexRef.value = reelIndex;
};

// Determinar si hay un reel anterior
const hasPreviousReel = computed(() => {
  if (currentGroupIndexRef.value === -1) return false;
  // Hay un reel anterior en el grupo actual
  if (currentReelInGroupIndexRef.value > 0) return true;
  // O hay un grupo anterior
  return currentGroupIndexRef.value > 0;
});

// Determinar si hay un reel siguiente
const hasNextReel = computed(() => {
  if (currentGroupIndexRef.value === -1) return false;
  const currentGroup = props.reels[currentGroupIndexRef.value];
  if (!currentGroup) return false;
  // Hay un reel siguiente en el grupo actual
  if (currentReelInGroupIndexRef.value < currentGroup.reels.length - 1) return true;
  // O hay un grupo siguiente
  return currentGroupIndexRef.value < props.reels.length - 1;
});

// Utility
const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num;
};

const incrementView = async () => {
  if (!props.reel?.idDoc || !user.value || viewedReelId.value === props.reel.idDoc) {
    return;
  }
  try {
    const updatedReel = await reelsStore.incrementView(props.reel.idDoc, {
      uid: user.value.uid,
      email: user.value.email,
    });
    viewedReelId.value = props.reel.idDoc;
    emit('update-reel', updatedReel);
  } catch (err) {
    console.error('Error incrementing view:', err);
    snackbarStore.show('Error registering view', 'error');
  }
};

// Handle like toggle
const handleToggleLike = async () => {
  if (!user.value || !isAuthenticated.value) {
    snackbarStore.show('You must be logged in to like', 'error');
    return;
  }
  isLiking.value = true;
  try {
    const updatedReel = await reelsStore.toggleLike(props.reel.idDoc, {
      uid: user.value.uid,
      displayName: user.value.displayName || user.value.email,
      email: user.value.email,
    });
    emit('update-reel', updatedReel);
    snackbarStore.show(hasLiked.value ? 'Me gusta eliminado' : 'Me gusta agregado', hasLiked.value ? 'error' : 'success');
  } catch (err) {
    snackbarStore.show('Error processing like', 'error');
    console.error('Error in toggleLike:', err);
  } finally {
    isLiking.value = false;
  }
};

// Modal controls
const closeModal = () => {
  viewedReelId.value = null;
  showSettingsMenu.value = false;
  currentGroupIndexRef.value = -1;
  currentReelInGroupIndexRef.value = -1;
  emit('close');
};

const previousReel = () => {
  if (!hasPreviousReel.value) return;

  const currentGroup = props.reels[currentGroupIndexRef.value];
  if (!currentGroup) {
    closeModal();
    return;
  }
  // Si hay un reel anterior en el grupo actual
  if (currentReelInGroupIndexRef.value > 0) {
    const previousReelInGroup = currentGroup.reels[currentReelInGroupIndexRef.value - 1];
    currentReelInGroupIndexRef.value -= 1;
    emit('update-reel', previousReelInGroup);
  } else {
    // Ir al último reel del grupo anterior
    const previousGroupIndex = currentGroupIndexRef.value - 1;
    const previousGroup = props.reels[previousGroupIndex];
    if (!previousGroup) {
      closeModal();
      return;
    }
    const lastReelInPreviousGroup = previousGroup.reels[previousGroup.reels.length - 1];
    currentGroupIndexRef.value = previousGroupIndex;
    currentReelInGroupIndexRef.value = previousGroup.reels.length - 1;
    emit('update-reel', lastReelInPreviousGroup);
  }
};

const nextReel = () => {
  if (!hasNextReel.value) return;
  const currentGroup = props.reels[currentGroupIndexRef.value];
  if (!currentGroup) {
    closeModal();
    return;
  }
  // Si hay un reel siguiente en el grupo actual
  if (currentReelInGroupIndexRef.value < currentGroup.reels.length - 1) {
    const nextReelInGroup = currentGroup.reels[currentReelInGroupIndexRef.value + 1];
    currentReelInGroupIndexRef.value += 1;
    emit('update-reel', nextReelInGroup);
  } else {
    // Ir al primer reel del grupo siguiente
    const nextGroupIndex = currentGroupIndexRef.value + 1;
    const nextGroup = props.reels[nextGroupIndex];
    if (!nextGroup) {
      closeModal();
      return;
    }
    const firstReelInNextGroup = nextGroup.reels[0];
    currentGroupIndexRef.value = nextGroupIndex;
    currentReelInGroupIndexRef.value = 0;
    emit('update-reel', firstReelInNextGroup);
  }
};

// Dropdown actions
const deleteReel = async () => {
  showSettingsMenu.value = false;
  if (!props.reel?.idDoc) return;
  try {
    await reelsStore.deleteReel(props.reel);
    snackbarStore.show('Reel eliminado exitosamente', 'success');
    closeModal();
    emit('update-reel', null);
    showDeleteModal.value = false;
    viewedReelId.value = null;
  } catch (err) {
    console.error('Error deleting reel:', err);
    snackbarStore.show('Error al eliminar el reel', 'error');
  }
};

const closeDeleteModal = () => {
  showSettingsMenu.value = false;
  showDeleteModal.value = false;
};

const openDeleteModal = () => {
  showSettingsMenu.value = false;
  showDeleteModal.value = true;
};

const openReportModal = () => {
  showSettingsMenu.value = false;
  showReportModal.value = true;
};

const closeReportModal = () => {
  showSettingsMenu.value = false;
  showReportModal.value = false;
  document.body.style.overflow = '';
};

// Handle click outside to close dropdown
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    showSettingsMenu.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  nextTick(() => {
    if (viewModal.value) {
      viewModal.value.focus();
    }
  });
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Watch for modal visibility and reel changes
watch(
  [() => props.visible, () => props.reel, () => props.reels],
  ([newVisible, newReel, newReels], [oldVisible, oldReel]) => {
    if (newVisible && newReel?.idDoc && (newReel?.idDoc !== oldReel?.idDoc || !oldVisible)) {
      nextTick(() => {
        if (viewModal.value) {
          viewModal.value.focus();
          calculateIndices();
          if (!newReel?.default) incrementView();
        }
      });
    }
  },
  { deep: true }
);
</script>

<style scoped>
/* Modal transition */
.fixed {
  transition: opacity 0.3s ease-in-out;
}

/* Media container */
.media-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4));
}

/* Title overflow correction */
.overflow-wrap {
  overflow-wrap: break-word;
}

.word-break-break-word {
  word-break: break-word;
}

/* Message transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive styles for mobile */
@media (max-width: 768px) {
  .media-container {
    height: calc(100vh - 14rem);
  }
  .flex {
    flex-direction: column;
  }
  .w-96 {
    width: 100%;
    max-height: 14rem;
  }
}

/* Custom scrollbar for metadata panel */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
</style>