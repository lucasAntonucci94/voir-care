<template>
    <div v-if="shareStore.isShareModalVisible" class="fixed inset-0 bg-black/20 flex items-center justify-center z-101 transition-opacity duration-300">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl transform transition-all duration-300">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-300 mb-4">Compartir publicación</h3>
        <div class="flex flex-col gap-3">
          <!-- Share via DM -->
          <div v-if="showDMForm" class="mb-4">
            <label class="block mb-2 text-gray-700 dark:text-gray-300">Enviar a:</label>
            <input
              v-model="recipientEmail"
              type="text"
              placeholder="Correo del destinatario"
              class="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-700 rounded-lg px-3 py-2 mb-2"
            />
            <textarea
              v-model="dmMessage"
              rows="3"
              placeholder="Mensaje opcional..."
              class="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-700 rounded-lg px-3 py-2"
            ></textarea>
            <button
              :disabled="isLoading || !recipientEmail"
              @click="sendDMFn"
              class="w-full mt-2 px-4 py-2 bg-primary dark:bg-secondary text-white rounded-lg hover:bg-primary-md dark:hover:bg-secondary-md transition-all duration-200"
            >
              <span v-if="!isLoading">Enviar</span>
              <span v-else class="flex items-center gap-2">
                <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Enviando...
              </span>
            </button>
            <button
              @click="showDMForm = false"
              class="w-full mt-2 px-4 py-2 text-gray-500 dark:text-gray-300 dark:bg-gray-700 rounded-lg hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
            >
              Cancelar
            </button>
          </div>
          <!-- Share Options -->
          <button
            v-else
            @click="showDMForm = true"
            class="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
          >
            <i class="fas fa-envelope mr-2"></i> Enviar por Mensaje Directo
          </button>
          <button
            @click="shareViaWhatsApp"
            class="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
          >
            <i class="fab fa-whatsapp mr-2"></i> Compartir por WhatsApp
          </button>
          <button
            @click="shareViaSocial"
            class="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
          >
            <i class="fas fa-share-alt mr-2"></i> Compartir en Redes Sociales
          </button>
          <button
            @click="copyLink"
            class="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
          >
            <i class="fas fa-link mr-2"></i> Copiar Enlace
          </button>
        </div>
        <button
          @click="closeShareModal"
          class="w-full mt-4 px-4 py-2 text-gray-500 dark:text-gray-300 dark:bg-gray-700 rounded-lg hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
        >
          Cerrar
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useShareStore } from '../../stores/shareStore';
  import { useShare } from '../../composable/useSharePost';
  import { useAuth } from '../../api/auth/useAuth';
  
  const shareStore = useShareStore();
  const { sendDM, shareViaWhatsApp, shareViaSocial, copyLink } = useShare();
  
  const showDMForm = ref(false);
  const recipientEmail = ref('');
  const dmMessage = ref('');
  const isLoading = ref(false);
  
  const sendDMFn = async () => {
    isLoading.value = true;
    try {
      await useShare().sendDM(shareStore.post.id, recipientEmail.value, dmMessage.value);
      showDMForm.value = false;
      recipientEmail.value = '';
      dmMessage.value = '';
      shareStore.closeShareModal();
    } catch (error) {
      console.error('Error sending DM:', error);
      alert('Error al enviar el mensaje.');
    } finally {
      isLoading.value = false;
    }
  };
  
  const closeShareModal = () => {
    showDMForm.value = false;
    recipientEmail.value = '';
    dmMessage.value = '';
    shareStore.closeShareModal();
  };
  </script>
  
  <style scoped>
  /* Estilos para el modal */
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