<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/60 z-[101] flex items-center justify-center p-4"
  >
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto scrollbar-none">
      <!-- Modal Header -->
      <div class="sticky top-0 bg-white dark:bg-gray-800 z-10 p-6 border-b flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-300">
          {{ isEditing ? 'Editar Blog' : 'Crear Blog' }}
        </h3>
        <button
          @click="closeModal"
          class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
          aria-label="Cerrar modal"
        >
          <i class="fa-solid fa-xmark w-6 h-6"></i>
        </button>
      </div>

      <!-- Progress Bar -->
      <div class="p-6">
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
              <div
                v-if="index < steps.length - 1"
                class="w-6 h-1 bg-gray-200 dark:bg-gray-600"
              >
                <div
                  class="h-full transition-all duration-300"
                  :class="currentStep > index + 1 ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-600'"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Content -->
        <form @submit.prevent="handleSaveBlog" class="space-y-6">
          <!-- Step 1: Basic Info -->
          <div v-if="currentStep === 1">
            <div>
              <label for="blogTitle" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                Título
              </label>
              <input
                v-model="localBlogData.title"
                id="blogTitle"
                type="text"
                placeholder="Ej: Cómo cuidar a tu perro"
                class="w-full p-3 border hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                :disabled="isLoading"
                required
              />
              <p v-if="formErrors.title" class="text-sm text-red-500 mt-1">{{ formErrors.title }}</p>
            </div>
            <div class="mt-4">
              <label for="blogIntro" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                Introducción
              </label>
              <textarea
                v-model="localBlogData.intro"
                id="blogIntro"
                placeholder="Ej: Una breve introducción al tema del blog..."
                class="w-full p-3 border hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                :disabled="isLoading"
                required
              ></textarea>
              <p v-if="formErrors.intro" class="text-sm text-red-500 mt-1">{{ formErrors.intro }}</p>
            </div>
            <div class="mt-4">
              <label for="blogCategories" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                Categorías
              </label>
              <multiselect
                v-model="localBlogData.categories"
                :options="props.categories"
                :multiple="true"
                :class="{ 'dark': isDark }"
                placeholder="Seleccionar categorías"
                label="name"
                track-by="idDoc"
                aria-label="Seleccionar categorías"
                :disabled="isLoading"
              ></multiselect>
              <p v-if="formErrors.categories" class="text-sm text-red-500 mt-1">{{ formErrors.categories }}</p>
            </div>
            <div class="mt-4">
              <label for="blogType" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                Tipo
              </label>
              <select
                v-model="localBlogData.type"
                id="blogType"
                class="w-full p-3 border hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                :disabled="isLoading"
                required
              >
                <option value="" disabled>Selecciona un tipo</option>
                <option v-for="option in blogTypeOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <p v-if="formErrors.type" class="text-sm text-red-500 mt-1">{{ formErrors.type }}</p>
            </div>
            <div class="mt-4">
              <label for="blogSummary" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                Resumen
              </label>
              <textarea
                v-model="localBlogData.summary"
                id="blogSummary"
                placeholder="Ej: Un resumen breve del contenido..."
                class="w-full p-3 border hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                :disabled="isLoading"
                required
              ></textarea>
              <p v-if="formErrors.summary" class="text-sm text-red-500 mt-1">{{ formErrors.summary }}</p>
            </div>
          </div>

          <!-- Step 2: Sections -->
          <div v-if="currentStep === 2">
            <div class="space-y-4">
              <div v-for="(section, index) in localBlogData.sections" :key="index" class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div class="flex justify-between items-center mb-2">
                  <h4 class="text-sm font-medium text-gray-700 dark:text-gray-200">Sección {{ index + 1 }}</h4>
                  <button
                    type="button"
                    @click="removeSection(index)"
                    class="text-red-500 hover:text-red-700"
                    aria-label="Eliminar sección"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
                <div>
                  <label :for="`sectionTitle${index}`" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                    Título de la sección
                  </label>
                  <input
                    v-model="section.title"
                    :id="`sectionTitle${index}`"
                    type="text"
                    placeholder="Ej: Introducción al cuidado"
                    class="w-full p-3 border hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                    :disabled="isLoading"
                  />
                  <p v-if="formErrors[`section${index}Title`]" class="text-sm text-red-500 mt-1">{{ formErrors[`section${index}Title`] }}</p>
                </div>
                <div class="mt-2">
                  <label :for="`sectionText${index}`" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                    Texto
                  </label>
                  <textarea
                    v-model="section.text"
                    :id="`sectionText${index}`"
                    placeholder="Ej: Detalles de la sección..."
                    class="w-full p-3 border hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                    :disabled="isLoading"
                  ></textarea>
                  <p v-if="formErrors[`section${index}Text`]" class="text-sm text-red-500 mt-1">{{ formErrors[`section${index}Text`] }}</p>
                </div>
              </div>
              <button
                type="button"
                @click="addSection"
                class="w-full p-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                :disabled="isLoading"
                aria-label="Agregar sección"
              >
                Agregar Sección
              </button>
            </div>
          </div>

          <!-- Step 3: Images -->
          <div v-if="currentStep === 3">
            <div>
              <label for="blogImage" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                Imagen Principal
              </label>
              <input
                id="blogImage"
                type="file"
                accept="image/*"
                @change="handleImageUpload"
                :disabled="isLoading"
                class="w-full p-2 border dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary dark:file:bg-secondary file:text-white hover:file:bg-opacity-90 transition-colors duration-200"
              />
              <p v-if="formErrors.image" class="text-sm text-red-500 mt-1">{{ formErrors.image }}</p>
              <img
                v-if="localBlogData.imagePreview || localBlogData.image"
                :src="localBlogData.imagePreview || localBlogData.image"
                alt="Main Image Preview"
                class="w-full h-48 object-cover rounded-lg shadow-sm mt-2"
              />
            </div>
            <div class="mt-4 space-y-4">
              <div v-for="(section, index) in localBlogData.sections" :key="index">
                <label :for="`sectionImage${index}`" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Imagen de la sección {{ index + 1 }}
                </label>
                <input
                  :id="`sectionImage${index}`"
                  type="file"
                  accept="image/*"
                  @change="handleSectionImageUpload(index, $event)"
                  :disabled="isLoading"
                  class="w-full p-2 border dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary dark:file:bg-secondary file:text-white hover:file:bg-opacity-90 transition-colors duration-200"
                />
                <p v-if="formErrors[`section${index}Image`]" class="text-sm text-red-500 mt-1">{{ formErrors[`section${index}Image`] }}</p>
                <img
                  v-if="section.imagePreview || section.image"
                  :src="section.imagePreview || section.image"
                  :alt="`Section ${index + 1} Image Preview`"
                  class="w-full h-48 object-cover rounded-lg shadow-sm mt-2"
                />
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
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
              aria-label="Cancelar"
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
              aria-label="Siguiente paso"
            >
              <p class="hidden md:block">Siguiente</p>
              <i class="fa-solid fa-arrow-right"></i>
            </button>
            <button
              v-if="currentStep === steps.length"
              type="submit"
              :disabled="isLoading"
              class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-lg hover:bg-primary/90 dark:hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              aria-label="Guardar blog"
            >
              <span v-if="isLoading">
                <i class="fa-solid fa-spinner animate-spin"></i>
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
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue';
import { defineAsyncComponent } from 'vue';
import { useEducationBlogsStore } from '../../stores/educationBlogs';
import { useSnackbarStore } from '../../stores/snackbar';
import 'vue-multiselect/dist/vue-multiselect.css';
import { useThemeStore } from '../../stores/theme';

const themeStore = useThemeStore();
const isDark = computed(() => themeStore.isDarkMode);
const Multiselect = defineAsyncComponent(() => import('vue-multiselect'));

// Import stores
const blogsStore = useEducationBlogsStore();
const snackbarStore = useSnackbarStore();

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
  blogData: {
    type: Object,
    required: true,
  },
  categories: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['save', 'close']);

// Blog Type Enum
const blogType = Object.freeze({
  FREE: 0,
  PREMIUM: 1,
});

const blogTypeOptions = [
  { value: blogType.FREE, label: 'Free' },
  { value: blogType.PREMIUM, label: 'Premium' },
];

// Local state
const localBlogData = ref({
  id: props.blogData.id || null,
  title: props.blogData.title || '',
  image: props.blogData.image || '',
  imageFile: null,
  imagePreview: null,
  intro: props.blogData.intro || '',
  categories: props.blogData.categories || [], // Now an array of category objects
  type: props.blogData.type || 0,
  summary: props.blogData.summary || '',
  sections: props.blogData.sections ? props.blogData.sections.map(section => ({
    title: section.title || '',
    text: section.text || '',
    image: section.image || '',
    imageFile: null,
    imagePreview: null,
  })) : [],
});

const currentStep = ref(1);
const formErrors = ref({});
const isLoading = ref(false);
const steps = ref([
  { label: 'Información Básica' },
  { label: 'Secciones' },
  { label: 'Imágenes' },
]);

// Computed to check if blogData has changed
const blogDataKey = computed(() => JSON.stringify({
  id: props.blogData.id,
  title: props.blogData.title,
  image: props.blogData.image,
  intro: props.blogData.intro,
  categories: props.blogData.categories,
  type: props.blogData.type,
  summary: props.blogData.summary,
  sections: props.blogData.sections,
}));

// Reset form when blogData changes
watchEffect(() => {
  if (props.visible) {
    localBlogData.value = {
      id: props.blogData.id || null,
      title: props.blogData.title || '',
      image: props.blogData.image || '',
      imageFile: null,
      imagePreview: null,
      intro: props.blogData.intro || '',
      categories: props.blogData.categories || [], // Initialize with category objects
      type: props.blogData.type || 0,
      summary: props.blogData.summary || '',
      sections: props.blogData.sections ? props.blogData.sections.map(section => ({
        title: section.title || '',
        text: section.text || '',
        image: section.image || '',
        imageFile: null,
        imagePreview: null,
      })) : [],
    };
    currentStep.value = 1;
    formErrors.value = {};
  }
});

// Form validation
const validateStep = (step) => {
  let isValid = true;
  const errors = {};

  if (step === 1) {
    if (!localBlogData.value.title?.trim()) {
      errors.title = 'El título es obligatorio';
      isValid = false;
    }
    if (!localBlogData.value.intro?.trim()) {
      errors.intro = 'La introducción es obligatoria';
      isValid = false;
    }
    if (![blogType.FREE.toString(), blogType.PREMIUM.toString()].includes(localBlogData.value.type?.toString())) {
      errors.type = 'Debes seleccionar un tipo válido (Free o Premium)';
      isValid = false;
    }
    if (!localBlogData.value.summary?.trim()) {
      errors.summary = 'El resumen es obligatorio';
      isValid = false;
    }
    if (!localBlogData.value.categories?.length) {
      errors.categories = 'Debes seleccionar al menos una categoría';
      isValid = false;
    }
  } else if (step === 2) {
    localBlogData.value.sections.forEach((section, index) => {
      if (!section.title?.trim()) {
        errors[`section${index}Title`] = 'El título de la sección es obligatorio';
        isValid = false;
      }
      if (!section.text?.trim()) {
        errors[`section${index}Text`] = 'El texto de la sección es obligatorio';
        isValid = false;
      }
    });
  } else if (step === 3) {
    if (!props.isEditing && !localBlogData.value.imageFile && !localBlogData.value.image) {
      errors.image = 'La imagen principal es obligatoria';
      isValid = false;
    }
    localBlogData.value.sections.forEach((section, index) => {
      if (section.imageFile && section.imageFile.size > 5 * 1024 * 1024) {
        errors[`section${index}Image`] = 'La imagen no debe superar los 5MB';
        isValid = false;
      }
    });
  }

  formErrors.value = errors;
  return isValid;
};

// Form methods
const nextStep = () => {
  if (validateStep(currentStep.value)) {
    currentStep.value += 1;
  }
};

const previousStep = () => {
  currentStep.value -= 1;
};

const addSection = () => {
  localBlogData.value.sections.push({ title: '', text: '', image: '', imageFile: null, imagePreview: null });
};

const removeSection = (index) => {
  localBlogData.value.sections.splice(index, 1);
};

const handleImageUpload = (event) => {
  formErrors.value.image = '';
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    formErrors.value.image = 'El archivo debe ser una imagen';
    event.target.value = null;
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    formErrors.value.image = 'La imagen no debe superar los 5MB';
    event.target.value = null;
    return;
  }
  const reader = new FileReader();
  reader.onloadend = () => {
    localBlogData.value.imageFile = file;
    localBlogData.value.imagePreview = URL.createObjectURL(file);
  };
  reader.onerror = () => {
    formErrors.value.image = 'Error al leer la imagen';
    event.target.value = null;
  };
  reader.readAsDataURL(file);
};

const handleSectionImageUpload = (index, event) => {
  formErrors.value[`section${index}Image`] = '';
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    formErrors.value[`section${index}Image`] = 'El archivo debe ser una imagen';
    event.target.value = null;
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    formErrors.value[`section${index}Image`] = 'La imagen no debe superar los 5MB';
    event.target.value = null;
    return;
  }
  const reader = new FileReader();
  reader.onloadend = () => {
    localBlogData.value.sections[index].imageFile = file;
    localBlogData.value.sections[index].imagePreview = URL.createObjectURL(file);
  };
  reader.onerror = () => {
    formErrors.value[`section${index}Image`] = 'Error al leer la imagen';
    event.target.value = null;
  };
  reader.readAsDataURL(file);
};

const handleSaveBlog = async () => {
  isLoading.value = true;
  for (let i = 1; i <= steps.value.length; i++) {
    if (!validateStep(i)) {
      currentStep.value = i;
      isLoading.value = false;
      return;
    }
  }
  const blogData = {
    ...localBlogData.value,
    categories: localBlogData.value.categories,
  };

  try {
    let savedBlog;
    if (props.isEditing) {
      savedBlog = await blogsStore.updateBlog(blogData.id, blogData);
    } else {
      savedBlog = await blogsStore.addBlog(blogData);
    }
    snackbarStore.show(`Blog ${props.isEditing ? 'actualizado' : 'creado'} exitosamente`, 'success');
    emit('save', { blog: savedBlog, error: null });
    closeModal();
  } catch (error) {
    console.error('Error al guardar blog:', error);
    snackbarStore.show('Error al guardar blog: ' + error.message, 'error');
    emit('save', { blog: null, error: error.message });
  } finally {
    isLoading.value = false;
  }
};

const closeModal = () => {
  resetForm();
  emit('close');
};

const resetForm = () => {
  localBlogData.value = {
    id: null,
    title: '',
    image: '',
    imageFile: null,
    imagePreview: null,
    intro: '',
    categories: [],
    type: '',
    summary: '',
    sections: [],
  };
  currentStep.value = 1;
  formErrors.value = {};
};
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

.bg-primary {
  background-color: #3b82f6;
}

.bg-primary:hover {
  background-color: #2563eb;
}

.bg-secondary {
  background-color: #60a5fa;
}

.bg-secondary:hover {
  background-color: #3b82f6;
}


/* ESTILOS DEL SELECTMULTIPLE */

::v-deep(.multiselect) {
  min-height: 38px;
  width: 100%;
  max-width: auto; /*  33.33% Match sm:w-1/3 */
  border: 1px solid;
  border-color:  var(--color-primary-md); /* Default border (light mode) */
  border-radius: 0.375rem;
  background-color: #ffffff; /* Light mode background */
  color: #111827; /* Default text color (light mode) */
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
}

::v-deep(.multiselect.dark) {
  border-color: var(--color-secondary-md); /* #D8690E */
  background-color: #1F2937 !important; /* Dark mode background for the root */
  color: #f9fafb; /* Light text for dark mode */
}

/* Style the tags container */
::v-deep(.multiselect .multiselect__tags) {
  border: 1px solid !important; /* Dark mode background for tags */
  border-color: var(--color-primary) !important;
}

/* Style the tags container */
::v-deep(.multiselect.dark .multiselect__tags) {
  border: 1px solid !important;
  border-color: var(--color-secondary) !important;
}

/* Style the tags container */
::v-deep(.multiselect .multiselect__tags) {
  border: 1px solid !important;
  border-color: var(--color-primary) !important;
}

/* Style the tags container */
::v-deep(.multiselect.dark .multiselect__tags) {
  background-color: #1F2937 !important; /* Dark mode background for tags */
  color: #f9fafb; /* Light text */
  padding: 4px 8px;
}
/* Style the tags container */
::v-deep(.multiselect.dark .multiselect__tags input) {
  background-color: #1F2937 !important; /* Dark mode background for tags */
  color: #f9fafb; /* Light text */
}

/* Style the input */
::v-deep(.multiselect.dark .multiselect__input) {
  color: #f9fafb !important; /* Light text for input in dark mode */
}

/* Style the content wrapper (dropdown) */
::v-deep(.multiselect.dark .multiselect__content-wrapper) {
  background-color: #1F2937 !important; /* Dark mode background for dropdown */
  color: #f9fafb; /* Light text */
}

/* Style the options */
::v-deep(.multiselect .multiselect__option) {
  background-color: #ffffff; /* Light mode option background */
  color: #111827; /* Light mode option text */
}

::v-deep(.multiselect.dark .multiselect__option) {
  background-color: #1F2937 !important; /* Dark mode option background */
  color: #f9fafb; /* Light text */
}

/* Style the highlighted option */
::v-deep(.multiselect .multiselect__option--highlight) {
  background-color: var(--color-primary); /* #02bcae */
  color: #ffffff;
}

::v-deep(.multiselect.dark .multiselect__option--highlight) {
  background-color: var(--color-secondary); /* #F28C38 */
}

/* Style the select arrow */
::v-deep(.multiselect__select) {
  background: transparent;
}

/* Style the disabled state */
::v-deep(.multiselect--disabled) {
  background-color: #e5e7eb; /* Light mode disabled */
}

::v-deep(.multiselect.dark .multiselect--disabled) {
  background-color: #1F2937; /* Dark mode disabled */
}
</style>