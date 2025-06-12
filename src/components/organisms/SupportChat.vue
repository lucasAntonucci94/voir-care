<template>
    <div>
      <!-- Botón flotante para abrir/cerrar el chat -->
      <div
        class="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-16 sm:h-16 bg-[#F28C38] rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-teal-600 transition-all duration-200 z-50"
        @click="toggleChat"
      >
        <i class="fa-solid fa-comment-dots h-6 w-6 sm:h-8 sm:w-8 text-white"></i>
      </div>
  
      <!-- Ventana del chat -->
      <div
        v-if="isChatOpen"
        class="fixed inset-4 sm:bottom-24 sm:right-6 sm:inset-auto sm:w-[28rem] sm:h-[32rem] sm:max-h-[80vh] bg-white rounded-xl shadow-2xl p-4 sm:p-6 flex flex-col z-50 transform transition-all duration-300 scale-100"
      >
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg sm:text-xl font-semibold text-gray-800 tracking-tight">{{ title }}</h3>
          <button
            @click="toggleChat"
            class="text-gray-500 hover:text-gray-700 transition-all duration-200"
          >
            <i class="fa-solid fa-xmark h-5 w-5 sm:h-6 sm:w-6"></i>
          </button>
        </div>
  
        <!-- Área de mensajes -->
        <div
          class="flex-1 bg-gray-50 rounded-lg p-3 sm:p-4 overflow-y-auto text-gray-700 text-sm border border-gray-200"
        >
          <p>{{ initialMessage }}</p>
        </div>
  
        <!-- Input y botón de enviar -->
        <div class="mt-3 sm:mt-4 flex gap-2 sm:gap-3">
          <input
            v-model="message"
            type="text"
            placeholder="Escribí tu mensaje..."
            class="flex-1 p-2 sm:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 hover:bg-gray-100 text-sm sm:text-base"
            @keyup.enter="sendMessage"
          />
          <button
            @click="sendMessage"
            class="px-4 py-2 sm:px-5 sm:py-2 bg-primary text-white font-medium rounded-lg hover:bg-teal-600 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue';
  
  const props = defineProps({
    initialMessage: {
      type: String,
      default: '¡Hola! ¿En qué podemos ayudarte hoy?'
    },
    title: {
      type: String,
      default: 'Chat en Vivo'
    },
    isOpen: {
      type: Boolean,
      default: false
    }
  });
  
  const isChatOpen = ref(false);
  const message = ref('');
  
  // Observar la prop isOpen para abrir el chat cuando cambia a true
  watch(() => props.isOpen, (newValue) => {
    if (newValue) {
      isChatOpen.value = true;
    }
  });
  
  // Función para togglear el chat (solo afecta el estado interno)
  const toggleChat = () => {
    isChatOpen.value = !isChatOpen.value;
  };
  
  const sendMessage = () => {
    if (message.value.trim()) {
      // console.log('Mensaje enviado:', message.value);
      message.value = '';
    }
  };
  </script>
  
  <style scoped>
  </style>