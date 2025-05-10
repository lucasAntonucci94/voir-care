<!-- CreateHistoryModal.vue -->
<template>
  <section>
    <button
      class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-full hover:bg-primary-md dark:hover:bg-secondary-md transition-all shadow-md"
      @click="showModal = true"
    >
      <i class="fa fa-book pr-2"></i>
      Agregar historia
    </button>
  </section>

  <div v-if="showModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-101">
    <div
      class="bg-white dark:bg-gray-800 rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative"
    >
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100">Crear Nueva Historia</h2>
        <button
          @click="handleClose"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Cerrar modal"
        >
          <i class="fa fa-times"></i>
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          v-for="tab in tabs"
          :key="tab"
          @click="activeTab = tab"
          :class="[
            'px-4 py-2 font-medium transition-all',
            activeTab === tab
              ? 'border-b-2 border-primary text-primary dark:border-secondary dark:text-secondary'
              : 'text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white',
          ]"
        >
          {{ tab }}
        </button>
      </div>

      <!-- Content -->
      <div>
        <CreatePostForm v-if="activeTab === 'Publicación'" @close="handleClose" />
        <CreateReelForm v-if="activeTab === 'Reel'" @close="handleClose" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import CreatePostForm from '../molecules/CreatePostForm.vue';
import CreateReelForm from '../molecules/CreateReelForm.vue';

const showModal = ref(false);
const tabs = ['Publicación', 'Reel'];
const activeTab = ref('Publicación');

const handleClose = () => {
  showModal.value = false;
  activeTab.value = 'Publicación';
};

// Lock/unlock background scroll
watch(showModal, (newValue) => {
  document.body.classList.toggle('overflow-hidden', newValue);
});
</script>

<style scoped>
.transform {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>