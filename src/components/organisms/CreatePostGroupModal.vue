<template>
    <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-101">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Nueva publicación en el grupo</h2>
        <form @submit.prevent="createPost" class="space-y-6">
            <input v-model="newPost.title" type="text" placeholder="Título" required class="w-full p-3 rounded border"/>
            <textarea v-model="newPost.description" placeholder="Descripción" required class="w-full p-3 rounded border"></textarea>
            <input type="file" @change="handleMediaUpload" accept="image/*,video/*" class="w-full"/>
            <div v-if="newPost.media.imageBase64">
            <img v-if="newPost.media.type === 'image'" :src="newPost.media.imageBase64" class="w-full h-48 object-cover rounded" />
            <video v-else controls :src="newPost.media.imageBase64" class="w-full h-48 rounded"></video>
            </div>
            <fieldset class="flex flex-wrap gap-3">
            <label v-for="category in categories" :key="category.id" class="flex items-center gap-2">
                <input type="checkbox" v-model="newPost.categories" :value="category" />
                <span>{{ category.name }}</span>
            </label>
            </fieldset>
            <div class="flex justify-end gap-4">
            <button type="button" @click="emit('close')" class="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
            <button type="submit" :disabled="isLoading" class="px-4 py-2 bg-primary text-white rounded">Publicar</button>
            </div>
        </form>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useAuth } from '../../api/auth/useAuth';
import { useCategories } from '../../composable/useCategories';
import { useGroupsStore } from '../../stores/groups';

const props = defineProps({ groupId: String });
const emit = defineEmits(['close']);

const { categories } = useCategories();
const { user } = useAuth();
const groupsStore = useGroupsStore();

const isLoading = ref(false);
const errorFileMessage = ref('');
const formErrors = ref({});

const newPost = ref({
  title: '',
  description: '',
  media: {
    imageBase64: '',
    url: '',
    type: '',
    path: '',
  },
  categories: []
});

watch(() => props.groupId, (val) => {
  if (!val) emit('close');
});

function handleMediaUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    errorFileMessage.value = 'Selecciona una imagen o video válido.';
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onloadend = () => {
    newPost.value.media.imageBase64 = reader.result;
    newPost.value.media.type = file.type.startsWith('image') ? 'image' : 'video';
  };
  reader.readAsDataURL(file);
}

function validateForm() {
  const errors = {};
  if (!newPost.value.title) errors.title = 'El título es obligatorio';
  if (!newPost.value.description) errors.description = 'La descripción es obligatoria';
  if (!newPost.value.categories.length) errors.categories = 'Selecciona al menos una categoría';
  formErrors.value = errors;
  return Object.keys(errors).length === 0;
}

async function createPost() {
  if (!validateForm()) return;
  isLoading.value = true;

  const postData = {
    title: newPost.value.title,
    body: newPost.value.description,
    media: newPost.value.media,
    categories: newPost.value.categories
  };

  try {
    debugger
    await groupsStore.createPostGroup(props.groupId, postData);
    emit('close');
  } catch (err) {
    console.error('Error creando post del grupo:', err);
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
/* Add any scoped styles if needed */
</style>
