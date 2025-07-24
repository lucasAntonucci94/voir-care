<template>
  <div
    v-if="showMediaModal"
    class="fixed inset-0 bg-black/90 z-101 transition-opacity duration-300 overflow-hidden"
    @click.self="closeModal"
  >
    <div class="flex h-full w-full">
      <!-- Contenido multimedia -->
      <div class="flex-1 flex items-center justify-center relative">
        <div v-if="post?.media?.type === 'image'" class="media-container">
          <img
            :src="post?.media?.url"
            alt="Post media"
            class="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
        <div v-else-if="post?.media?.type === 'video'" class="media-container">
          <video
            :src="post?.media?.url"
            alt="Post media"
            :poster="post?.imageUrlFile"
            :controls="true"
            :loop="true"
            autoplay
            class="max-w-full max-h-full object-contain rounded-lg"
          ></video>
        </div>
      </div>

      <!-- Panel lateral de comentarios -->
      <div
        class="w-full md:w-80 bg-gray-900/80 md:bg-gray-50 dark:bg-gray-800 text-white md:text-gray-800 dark:text-gray-300 p-4 md:p-6 flex flex-col justify-between absolute bottom-0 md:static h-40 md:h-auto md:max-h-full overflow-y-auto"
      >
        <div>
          <h3 class="text-lg md:text-xl font-semibold mb-2 text-ellipsis">{{ post?.title }}</h3>
          <p class="text-sm md:text-base mb-4 text-ellipsis">{{ post?.body }}</p>
          <button
            @click="handleToggleLike"
            :class="[
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 mb-4',
              post?.likes?.some(l => l.userId === user?.uid)
                ? 'text-primary dark:text-secondary bg-primary/10 dark:bg-secondary/10'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-secondary',
              !user ? 'opacity-50 cursor-not-allowed' : ''
            ]"
            :disabled="!isAuthenticated"
          >
            <i
              :class="[
                'fas fa-heart',
                post?.likes?.some(l => l.userId === user?.uid)
                  ? 'text-primary dark:text-secondary'
                  : 'text-gray-600 dark:text-gray-400'
              ]"
            ></i>
            {{ post?.likes?.length ?? 0 }} Me gusta
          </button>
          <hr class="border-t border-gray-300 dark:border-gray-700 md:border-gray-400 mb-4" />
          <CommentList :post="post" />
          <CommentForm :idPost="post.idDoc" />
        </div>
        <button
          @click="closeModal"
          class="absolute top-2 right-2 text-gray-300 md:text-gray-600 hover:text-white md:hover:text-gray-800 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          aria-label="Cerrar modal"
        >
          <i class="fa-solid fa-times text-xl md:text-2xl"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch, onUnmounted } from 'vue';
import CommentList from '../molecules/CommentList.vue';
import CommentForm from '../molecules/CommentForm.vue';
import { useAuth } from '../../api/auth/useAuth';
const { isAuthenticated, user } = useAuth();

const props = defineProps({
  showMediaModal: {
    type: Boolean,
    required: true
  },
  post: {
    type: Object,
    required: true
  },
});

const emit = defineEmits(['update:showMediaModal', 'toggle-like']);

function closeModal() {
  emit('update:showMediaModal', false);
  document.body.style.overflow = ''; // Restaura el scroll del body
}

const handleToggleLike = () => {
  emit('toggle-like');
};

// Función para manejar la tecla Escape
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    closeModal();
  }
};

// Observa el cambio en showMediaModal para añadir/quitar el event listener
watch(() => props.showMediaModal, (newVal) => {
  if (newVal) {
    document.addEventListener('keydown', handleKeydown);
  } else {
    document.removeEventListener('keydown', handleKeydown);
  }
});

// Asegúrate de limpiar el event listener cuando el componente se desmonte
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
/* Estilos del modal */
.fixed {
  transition: opacity 0.3s ease-in-out;
}

/* Contenedor de medios */
.media-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
}

/* Estilos para controlar el desbordamiento del título y el cuerpo */
.text-ellipsis {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

h3.text-ellipsis,
p.text-ellipsis {
  max-width: 100%;
}

/* Estilos responsivos */
@media (max-width: 390px) {
  .media-container {
    height: calc(100vh - 10rem);
  }

  .w-80 {
    width: 100%;
    max-height: 10rem;
  }
}

/* Scroll en el panel de comentarios */
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
</style>
