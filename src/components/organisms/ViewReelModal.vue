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
            <img
              :src="reel?.user?.photoURL || 'https://via.placeholder.com/40'"
              alt="User avatar"
              class="w-12 h-12 rounded-full object-cover border-2 border-primary dark:border-secondary shadow-md"
            />
            <div>
              <p class="text-lg font-semibold text-primary dark:text-secondary">{{ reel?.user?.displayName }}</p>
              <p class="text-xs text-gray-600 dark:text-gray-400">{{ formatTimestamp(reel?.createdAt) }}</p>
            </div>
          </router-link>

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

          <!-- Estadísticas -->
          <div class="text-sm space-y-4">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { formatTimestamp } from '../../utils/formatTimestamp.js';
import { useReelsStore } from '../../stores/reels.js';
import { useAuth } from '../../api/auth/useAuth';
import { useSnackbarStore } from '../../stores/snackbar';

// Define props with proper validation
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

// Define emits
const emit = defineEmits(['close', 'update-reel']);

// Reactive references
const viewModal = ref(null);
const reelsStore = useReelsStore();
const { user, isAuthenticated } = useAuth();
const isLiking = ref(false);
const message = ref(null);
const messageType = ref(null);
const snackbarStore = useSnackbarStore();
const viewedReelId = ref(null); // Track the currently viewed reel to prevent duplicate increments

// Computed properties
const hasLiked = computed(() => {
  return props.reel?.likes?.some((like) => like.userId === user.value?.uid) || false;
});

const currentReelIndex = computed(() => {
  return props.reel ? props.reels.findIndex((r) => r.id === props.reel.id) : -1;
});

const hasPreviousReel = computed(() => currentReelIndex.value > 0);
const hasNextReel = computed(() => currentReelIndex.value < props.reels.length - 1);

// Utility functions
const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num;
};

// Increment view logic
const incrementView = async () => {
  if (!props.reel?.idDoc || !user.value || viewedReelId.value === props.reel.idDoc) {
    return; // Skip if no reel, no user, or already viewed
  }

  try {
    const updatedReel = await reelsStore.incrementView(props.reel.idDoc, {
      uid: user.value.uid,
      email: user.value.email,
    });
    viewedReelId.value = props.reel.idDoc; // Mark as viewed
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
    snackbarStore.show(hasLiked.value ? 'Like removed' : 'Like added', hasLiked.value ? 'error' : 'success');
  } catch (err) {
    snackbarStore.show('Error processing like', 'error');
    console.error('Error in toggleLike:', err);
  } finally {
    isLiking.value = false;
  }
};

// Modal controls
const closeModal = () => {
  viewedReelId.value = null; // Reset viewed reel on close
  emit('close');
};

const previousReel = () => {
  if (hasPreviousReel.value) {
    emit('update-reel', props.reels[currentReelIndex.value - 1]);
  }
};

const nextReel = () => {
  if (hasNextReel.value) {
    emit('update-reel', props.reels[currentReelIndex.value + 1]);
  }
};

// Lifecycle hooks
onMounted(() => {
  nextTick(() => {
    if (viewModal.value) {
      viewModal.value.focus();
    }
  });
});

// Watch for modal visibility and reel changes
watch(
  [() => props.visible, () => props.reel?.idDoc],
  ([newVisible, newReelId], [oldVisible, oldReelId]) => {
    if (newVisible && newReelId && (newReelId !== oldReelId || !oldVisible)) {
      // Trigger increment when modal opens or reel changes
      nextTick(() => {
        if (viewModal.value) {
          viewModal.value.focus();
          incrementView();
        }
      });
    }
  }
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