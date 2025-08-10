<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="visible" open
        class="fixed inset-0 bg-black/60 z-101 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modalTitle"
        @click.self="closeModal"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh]"
          @click.stop
        >
          <!-- Header -->
          <header class="sticky top-0 bg-white dark:bg-gray-800 z-10 p-6 border-b flex items-center rounded-t-xl justify-between">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-300">Editar grupo</h2>
            <button
              @click="closeModal"
              class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
              aria-label="Cerrar modal"
            >
              <i class="fa-solid fa-xmark w-6 h-6"></i>
            </button>
          </header>

          <!-- Contenido -->
          <div class="p-6">
            <!-- Barra de progreso -->
            <div class="flex justify-center mb-6">
              <div class="flex items-center space-x-2">
                <div v-for="(step, index) in steps" :key="index" class="relative flex items-center">
                  <div
                    class="flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all duration-300"
                    :class="{
                      'bg-primary dark:bg-secondary text-white animate-pulse-step': currentStep === index + 1,
                      'bg-primary text-white': currentStep > index + 1,
                      'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300': currentStep < index + 1,
                    }"
                    :aria-current="currentStep === index + 1 ? 'step' : undefined"
                    :aria-label="`Paso ${index + 1}`"
                  >
                    <span v-if="currentStep <= index + 1">{{ index + 1 }}</span>
                    <i v-else class="fa-solid fa-check"></i>
                  </div>
                  <div v-if="index < steps.length - 1" class="w-6 h-1 bg-gray-200 dark:bg-gray-600">
                    <div
                      class="h-full transition-all duration-300"
                      :class="currentStep > index + 1 ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-600'"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Formulario -->
            <form @submit.prevent="handleUpdateGroup" class="space-y-6">
              <!-- Paso 1: Información básica -->
              <div v-if="currentStep === 1">
                <!-- Título del Grupo -->
                <div class="mb-4">
                  <label for="groupTitle" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    Título del Grupo
                  </label>
                  <input
                    v-model="editableGroup.title"
                    id="groupTitle"
                    placeholder="Ej: Cuidado Animal"
                    class="w-full p-3 border hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                    :disabled="isLoading"
                    :class="formErrors.title ? 'border-red-500' : ''"
                    aria-describedby="groupTitleError"
                    :aria-invalid="formErrors.title ? 'true' : 'false'"
                    aria-required="true"
                    minlength="1"
                    maxlength="50"
                    required
                  />
                  <p v-if="formErrors.title" class="text-sm text-red-500 mt-1">{{ formErrors.title }}</p>
                </div>

                <!-- Descripción del Grupo -->
                <div class="mb-4">
                  <label for="groupDescription" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    Descripción del Grupo
                  </label>
                  <textarea
                    v-model="editableGroup.description"
                    id="groupDescription"
                    placeholder="Describe brevemente el objetivo o tema principal del grupo"
                    class="w-full p-3 hover:bg-gray-100 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent bg-gray-50 text-gray-700 placeholder-gray-400 resize-y min-h-[100px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                    :disabled="isLoading"
                    required
                    :class="formErrors.description ? 'border-red-500' : ''"
                    aria-describedby="groupDescriptionError"
                    :aria-invalid="formErrors.description ? 'true' : 'false'"
                    aria-required="true"
                    :minlength="10"
                    :maxlength="500"
                  ></textarea>
                  <p v-if="formErrors.description" class="text-sm text-red-500 mt-1">{{ formErrors.description }}</p>
                </div>
              </div>

              <!-- Paso 2: Multimedia -->
              <div v-if="currentStep === 2">
                <!-- Imagen o Video (opcional) -->
                <div class="relative">
                  <label for="groupMedia" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                    Imagen o Video
                  </label>
                  <input
                    id="groupMedia"
                    type="file"
                    accept="image/*,video/*"
                    @change="handleMediaUpload"
                    :disabled="isLoading"
                    :class="[
                      'w-full p-2 border dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary dark:file:bg-secondary file:text-white hover:file:bg-opacity-90 transition-colors duration-200',
                      formErrors.media ? 'border-red-500' : 'border-gray-300 dark:border-gray-800'
                    ]"
                  />
                  <p v-if="formErrors.media" class="text-red-500 text-sm mt-1">{{ formErrors.media }}</p>
                </div>

                <!-- Previsualización de Media -->
                <div v-if="editableGroup.media.url" class="mt-2">
                  <img
                    v-if="editableGroup.media.type === 'image'"
                    :src="editableGroup.media.url"
                    alt="Preview"
                    class="w-full h-48 object-cover rounded-lg shadow-sm"
                    :aria-label="`Previsualización de ${editableGroup.media.type}`"
                    :class="formErrors.media ? 'border-red-500' : ''"
                    aria-describedby="groupMediaError"
                    :aria-invalid="formErrors.media ? 'true' : 'false'"
                    aria-required="false"
                    aria-label="Previsualización de imagen"
                    @contextmenu.prevent
                    @dragover.prevent
                    @drop.prevent
                    @dragenter.prevent
                    @dragleave.prevent
                    @dragstart.prevent
                    @dragend.prevent
                    @drag="event => event.preventDefault()"
                    @dragenter="event => event.preventDefault()"
                    @dragleave="event => event.preventDefault()"
                    @dragover="event => event.preventDefault()"
                    @dragend="event => event.preventDefault()"
                    @dragstart="event => event.preventDefault()"
                  />
                  <video
                    v-else-if="editableGroup.media.type === 'video'"
                    :src="editableGroup.media.url"
                    autoplay
                    loop
                    muted
                    class="w-full h-48 rounded-lg shadow-sm"
                    :aria-label="`Previsualización de ${editableGroup.media.type}`"
                    :poster="editableGroup.media.url"
                    preload="metadata"
                    @loadedmetadata="editableGroup.media.duration = $event.target.duration"
                    @error="formErrors.media = 'Error al cargar el video. Asegúrate de que sea un formato compatible.'"
                    aria-describedby="groupMediaError"
                    :aria-invalid="formErrors.media ? 'true' : 'false'"
                    aria-required="false"
                    :class="formErrors.media ? 'border-red-500' : ''"
                    style="object-fit: cover;"
                    aria-label="Previsualización de video"
                    @contextmenu.prevent
                    @dragover.prevent
                    @drop.prevent
                    @dragenter.prevent
                    @dragleave.prevent
                    @dragstart.prevent
                    @dragend.prevent
                    @drag="event => event.preventDefault()"
                    @dragenter="event => event.preventDefault()"
                    @dragleave="event => event.preventDefault()"
                    @dragover="event => event.preventDefault()"
                    @dragend="event => event.preventDefault()"
                    @dragstart="event => event.preventDefault()"                
                  ></video>
                </div>
              </div>

              <!-- Paso 3: Configuración -->
              <div v-if="currentStep === 3">
                <!-- Categorías -->
                <div>
                  <label for="postCategories" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    Categorías
                  </label>
                  <multiselect
                    v-model="editableGroup.categories"
                    :options="categories"
                    :multiple="true"
                    :class="{ 'dark': isDark }"
                    placeholder="Seleccionar categorías"
                    label="name"
                    track-by="id"
                    aria-label="Seleccionar categorías"
                    :disabled="isLoading"
                    :aria-invalid="formErrors.categories ? 'true' : 'false'"
                    :aria-describedby="formErrors.categories ? 'categories-error' : null"
                    :aria-required="true"
                    :aria-label="`Selecciona al menos una categoría`"
                    :show-labels="false"
                    :close-on-select="true"
                    :allow-empty="false"
                    :max-height="200"
                    :show-no-results="false"
                    :searchable="true"
                    :loading="isLoading"
                  ></multiselect>
                  <p v-if="formErrors.categories" class="text-sm text-red-500 mt-1">{{ formErrors.categories }}</p>
                </div>
              
                <!-- Privacidad -->
                <div class="flex flex-col gap-4 mt-4">
                  <fieldset>
                    <legend class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                      Privacidad
                    </legend>
                    <div class="flex gap-2 ml-1">
                      <div class="flex items-center gap-2">
                        <input
                          type="radio"
                          id="public"
                          name="privacy"
                          value="public"
                          v-model="editableGroup.privacy"
                          :disabled="isLoading"
                          class="form-radio text-blue-600 focus:ring-blue-500"
                        />
                        <label
                          for="public"
                          class="text-sm text-gray-700 dark:text-gray-100"
                        >
                          Público
                        </label>
                      </div>
                      <div class="flex items-center gap-2">
                        <input
                          type="radio"
                          id="private"
                          name="privacy"
                          value="private"
                          v-model="editableGroup.privacy"
                          :disabled="isLoading"
                          class="form-radio text-blue-600 focus:ring-blue-500"
                        />
                        <label
                          for="private"
                          class="text-sm text-gray-700 dark:text-gray-100"
                        >
                          Privado
                        </label>
                      </div>
                    </div>
                  </fieldset>
                  <p
                    v-if="formErrors.privacy"
                    id="privacy-error"
                    class="text-sm text-red-500 mt-1"
                    role="alert"
                    aria-live="polite"
                  >
                    {{ formErrors.privacy }}
                  </p>
                </div>
              </div>

              <!-- Botones de navegación -->
              <div class="flex justify-between gap-3 mt-6">
                <button
                  v-if="currentStep > 1"
                  type="button"
                  @click="previousStep"
                  :disabled="isLoading"
                  class="px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  aria-label="Volver al paso anterior"
                >
                  <i class="fa-solid fa-arrow-left"></i>
                  <p class="hidden md:block">Atrás</p>
                </button>

                <button
                  v-if="currentStep === 1"
                  type="button"
                  @click="closeModal"
                  :disabled="isLoading"
                  class="px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  aria-label="Cancelar edición del perfil"
                >
                  <i class="fa-solid fa-times"></i>
                  <p class="hidden md:block">Cancelar</p>
                </button>
                
                <button
                  v-if="currentStep < steps.length"
                  type="button"
                  @click="nextStep"
                  :disabled="isLoading"
                  class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-lg hover:bg-primary/90 dark:hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  aria-label="Avanzar al siguiente paso"
                >
                  <p class="hidden md:block">Siguiente</p>
                  <i class="fa-solid fa-arrow-right"></i>
                </button>
                <button
                  v-if="currentStep === steps.length"
                  type="submit"
                  :disabled="isLoading"
                  class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-lg hover:bg-primary/90 dark:hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  aria-label="Guardar perfil"
                >
                  <span v-if="isLoading">
                    <i class="fa-solid fa-circle-notch animate-spin"></i>
                  </span>
                  <p class="hidden md:block">
                    {{ isLoading ? 'Guardando...' : 'Guardar' }}
                  </p>
                  <i v-if="!isLoading" class="fa-solid fa-save"></i>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useMediaUpload } from '../../composable/useMediaUpload';
import { useGroupsStore } from '../../stores/groups';
import { useSnackbarStore } from '../../stores/snackbar';
import { useThemeStore } from '../../stores/theme';
import { defineAsyncComponent } from 'vue';
import 'vue-multiselect/dist/vue-multiselect.css';

// Import vue-multiselect
const Multiselect = defineAsyncComponent(() => import('vue-multiselect'));

// Theme store for dark mode
const themeStore = useThemeStore();
const isDark = computed(() => themeStore.isDarkMode);

const props = defineProps({
  visible: Boolean,
  group: Object,
});
const emits = defineEmits(['close', 'groupUpdated']);

const { uploadMedia } = useMediaUpload();
const groupsStore = useGroupsStore();
const snackbarStore = useSnackbarStore();

const isLoading = ref(false);
const errorFileMessage = ref('');
const formErrors = ref({});
const currentStep = ref(1);
const steps = ref([
  { label: 'Información' },
  { label: 'Multimedia' },
  { label: 'Configuración' },
]);

const categories = ref([
  { id: 'adopcion', name: 'Adopción' },
  { id: 'cuidado', name: 'Cuidado Animal' },
  { id: 'nutricion', name: 'Nutrición y Salud' },
  { id: 'razas', name: 'Razas y Especies' },
  { id: 'rescate', name: 'Rescate' },
  { id: 'utilidad', name: 'Servicios y Utilidad' },
  { id: 'comunidad', name: 'Comunidad' },
  { id: 'educacion', name: 'Educación' },
  { id: 'hobbies', name: 'Actividades y Hobbies' },
  { id: 'duelo', name: 'Duelo y Apoyo' },
  { id: 'otros', name: 'Otros' },
]);

const editableGroup = ref({
  title: '',
  description: '',
  media: {
    url: '',
    path: null,
    type: null,
  },
  newMediaBase64: null,
  categories: [],
  privacy: 'public',
});

watch(
  () => props.group,
  (group) => {
    if (group) {
      editableGroup.value = {
        title: group.title,
        description: group.description,
        media: { ...group.media },
        newMediaBase64: null,
        categories: group.categories,
        privacy: group.privacy,
      };
    }
  },
  { immediate: true }
);

function closeModal() {
  currentStep.value = 1;
  formErrors.value = {};
  errorFileMessage.value = '';
  resetForm();
  emits('close');
}

function resetForm() {
  editableGroup.value = {
    title: '',
    description: '',
    media: {
      url: '',
      path: null,
      type: null,
    },
    newMediaBase64: null,
    categories: [],
    privacy: 'public',
  };
}

function validateStep(step) {
  let isValid = true;
  const errors = {};

  if (step === 1) {
    if (!editableGroup.value.title || editableGroup.value.title.trim() === '') {
      errors.title = 'El título es obligatorio';
      isValid = false;
    }
    if (!editableGroup.value.description) {
      errors.description = 'La descripción es obligatoria';
      isValid = false;
    }
  } else if (step === 2) {
    // Media is optional, no validation required
  } else if (step === 3) {
    if (editableGroup.value.categories.length === 0) {
      errors.categories = 'Debes seleccionar al menos una categoría';
      isValid = false;
    }
    if (editableGroup.value.categories.length > 3) {
      errors.categories = 'Debes seleccionar como máximo 3 categorías';
      isValid = false;
    }
    if (editableGroup.value.privacy !== 'public' && editableGroup.value.privacy !== 'private') {
      errors.privacy = 'La privacidad debe ser pública o privada';
      isValid = false;
    }
  }
  formErrors.value = errors;
  return isValid;
}

function nextStep() {
  if (validateStep(currentStep.value)) {
    currentStep.value += 1;
  }
}

function previousStep() {
  currentStep.value -= 1;
}

async function handleUpdateGroup() {
  isLoading.value = true;
  try {
    // Validate all steps
    for (let i = 1; i <= steps.value.length; i++) {
      if (!validateStep(i)) {
        currentStep.value = i;
        return;
      }
    }

    let updatedUrl = editableGroup.value.media.url;
    let updatedPath = editableGroup.value.media.path;
    if (editableGroup.value.newMediaBase64) {
      const { url, path } = await uploadMedia({
        currentUrl: editableGroup.value.media.url,
        currentPath: editableGroup.value.media.path,
        newMediaBase64: editableGroup.value.newMediaBase64,
        mediaType: editableGroup.value.media.type,
        dynamicPath: `groups/${props.group.ownerId}/${props.group.id}`,
      });
      updatedUrl = url;
      updatedPath = path;
    }

    const updatedGroupData = {
      ...props.group,
      title: editableGroup.value.title,
      description: editableGroup.value.description,
      media: {
        url: updatedUrl,
        path: updatedPath,
        type: editableGroup.value.media.type,
      },
      categories: editableGroup.value.categories,
      privacy: editableGroup.value.privacy,
    };

    await groupsStore.editGroup(props.group.idDoc, updatedGroupData);
    emits('groupUpdated', updatedGroupData);
    closeModal();
    snackbarStore.show('Grupo actualizado exitosamente.', 'success');
  } catch (err) {
    console.error('Error al actualizar grupo:', err);
    snackbarStore.show('Error al actualizar grupo: ' + err.message, 'error');
  } finally {
    isLoading.value = false;
  }
}

function handleMediaUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    errorFileMessage.value = 'Tipo de archivo no permitido.';
    event.target.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onloadend = () => {
    editableGroup.value.newMediaBase64 = reader.result;
    editableGroup.value.media = {
      url: URL.createObjectURL(file),
      path: null,
      type: file.type.startsWith('image') ? 'image' : 'video',
    };
  };
  reader.readAsDataURL(file);
}

// Cerrar el modal con la tecla Escape
function handleKeydown(event) {
  if (event.key === 'Escape' && props.visible) {
    closeModal();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
/* Oculta scrollbars en los contenedores scrollables */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Estilos para el scroll del modal */
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

/* Animación para los pasos del stepper */
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

/* Estilos de transición para el modal */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .bg-white,
.modal-enter-active .dark\:bg-gray-800,
.modal-leave-active .bg-white,
.modal-leave-active .dark\:bg-gray-800 {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .bg-white,
.modal-enter-from .dark\:bg-gray-800,
.modal-leave-to .bg-white,
.modal-leave-to .dark\:bg-gray-800 {
  transform: translateY(-20px);
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
}

.modal-enter-to .bg-white,
.modal-enter-to .dark\:bg-gray-800,
.modal-leave-from .bg-white,
.modal-leave-from .dark\:bg-gray-800 {
  transform: translateY(0);
}
</style>