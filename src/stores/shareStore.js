import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useShareStore = defineStore('share', () => {
  const isShareModalVisible = ref(false);
  const post = ref(null);

  function openShareModal(postData) {
    post.value = postData;
    isShareModalVisible.value = true;
    document.body.style.overflow = 'hidden';
  }

  function closeShareModal() {
    isShareModalVisible.value = false;
    post.value = null;
    document.body.style.overflow = '';
  }

  return { isShareModalVisible, post, openShareModal, closeShareModal };
});