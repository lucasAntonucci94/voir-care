<template>
  <div class="bg-white p-4 rounded-lg shadow-md w-full max-w-lg border border-gray-100 relative hover:shadow-lg dark:bg-gray-800 dark:border-gray-800 text-[#2c3e50] dark:text-white">
    <!-- Post Media (Image or Video) -->
    <div v-if="post?.media?.url" class="relative w-full h-48 rounded-lg overflow-hidden">
      <img
        v-if="post?.media?.type === 'image'"
        :src="post.media.url"
        alt="Post media"
        class="w-full h-full object-cover"
      />
      <video
        v-else-if="post?.media?.type === 'video'"
        :src="post.media.url"
        :poster="post?.media?.url"
        controls
        class="w-full h-full object-cover"
      ></video>
      <!-- Unhide Button -->
      <button
        @click="handleUnhidePost"
        :disabled="isLoading"
        class="absolute top-2 right-2 px-3 py-1 bg-primary dark:bg-secondary text-white rounded-full hover:bg-primary-md dark:hover:bg-secondary-md transition-all duration-200 shadow-md flex items-center gap-2"
        :class="{ 'opacity-50 cursor-not-allowed': isLoading }"
      >
        <i class="fas fa-eye"></i>
        <span v-if="!isLoading">Mostrar</span>
        <span v-else class="flex items-center gap-2">
          <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          Mostrando...
        </span>
      </button>
    </div>
    <!-- Placeholder for No Media -->
    <div v-else class="relative w-full h-48 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
      <button
        @click="handleUnhidePost"
        :disabled="isLoading"
        class="px-3 py-1 bg-primary dark:bg-secondary text-white rounded-full hover:bg-primary-md dark:hover:bg-secondary-md transition-all duration-200 shadow-md flex items-center gap-2"
        :class="{ 'opacity-50 cursor-not-allowed': isLoading }"
      >
        <i class="fas fa-eye"></i>
        <span v-if="!isLoading">Mostrar</span>
        <span v-else class="flex items-center gap-2">
          <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          Mostrando...
        </span>
      </button>
    </div>

    <!-- Post Content -->
    <div class="mt-3">
      <!-- User Info -->
      <div class="flex items-center gap-3 mb-2">
        <img
          :src="post?.user?.photoURLFile || DefaultAvatar"
          alt="User avatar"
          class="w-8 h-8 rounded-full border border-gray-200"
        />
        <div>
          <p class="text-sm font-bold text-gray-700 dark:text-white">
            {{ post?.user?.displayName || 'Anónimo' }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ post?.created_at ? formatTimestamp(post.created_at) : '' }}
          </p>
        </div>
      </div>

      <!-- Post Title and Body -->
      <h3 class="text-lg font-bold text-ellipsis">{{ post?.title }}</h3>
      <p class="mt-1 text-sm text-ellipsis text-gray-600 dark:text-gray-300">
        {{ post?.body }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuth } from '../../api/auth/useAuth';
import { usePostsStore } from '../../stores/posts';
import { useSnackbarStore } from '../../stores/snackbar';
import { formatTimestamp } from '../../utils/formatTimestamp';
import DefaultAvatar from '../../assets/avatar1.jpg';

const props = defineProps(['post']);
const { user } = useAuth();
const snackbarStore = useSnackbarStore();
const postsStore = usePostsStore();
const isLoading = ref(false);

async function handleUnhidePost() {
  if (!user.value?.uid) {
    snackbarStore.show('Usuario no autenticado', 'error');
    return;
  }

  isLoading.value = true;
  try {
    const response = await postsStore.unhidePost(user.value.uid, props.post.idDoc);
    if (response) {
      snackbarStore.show('Publicación mostrada nuevamente', 'success');
      // Update local user hiddenPosts to reflect change
      user.value.hiddenPosts = user.value.hiddenPosts.filter(
        (hp) => hp.postId !== props.post.idDoc
      );
    } else {
      snackbarStore.show('Error al mostrar la publicación', 'error');
    }
  } catch (error) {
    console.error('Error unhiding post:', error);
    snackbarStore.show('Error al mostrar la publicación', 'error');
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
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
</style>