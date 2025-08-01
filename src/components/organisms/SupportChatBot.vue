<template>
  <div>
    <div
      id="chatToggleButton"
      class="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-16 sm:h-16 bg-primary dark:bg-secondary-md rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-primary-md dark:hover:bg-secondary-darker transition-all duration-200 z-50"
      @click="toggleChat"
    >
      <i class="fa fa-message text-white"></i>
    </div>

    <div
      v-if="isChatOpen"
      id="chatWindow"
      class="fixed inset-4 sm:bottom-24 sm:right-6 sm:inset-auto sm:w-[28rem] sm:h-[32rem] sm:max-h-[80vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 sm:p-6 flex flex-col z-50 transform transition-all duration-300 scale-100"
    >
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-300 tracking-tight">Soporte</h3>
        <button
          @click="toggleChat"
          class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200 transition-all duration-200"
        >
          <i class="fa-solid fa-xmark h-5 w-5 sm:h-6 sm:w-6"></i>
        </button>
      </div>

      <div
        ref="messagesContainer"
        class="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 overflow-y-auto text-gray-700 text-sm border border-gray-200 dark:border-gray-600"
      >
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="msg.sender === 'user' ? 'text-right' : 'text-left'"
        >
          <div
            :class="msg.sender === 'user' ? 'bg-blue-100 text-blue-900 p-2 rounded mb-1 inline-block' : 'bg-green-100 text-green-900 dark:bg-orange-100 dark:text-orange-900 p-2 rounded mb-1 inline-block'"
          >
            {{ msg.text }}
          </div>
        </div>
        <div v-if="isTyping" class="text-left">
          <div class="bg-green-100 text-green-900 dark:bg-orange-100 dark:text-orange-900 p-2 rounded mb-1 inline-block animate-pulse">
            ...
          </div>
        </div>
      </div>

      <div class="mt-3 sm:mt-4 flex gap-2 sm:gap-3">
        <input
          v-model="userInput"
          type="text"
          placeholder="Escribe tu mensaje..."
          class="flex-1 p-2 sm:p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300 placeholder-gray-400 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm sm:text-base"
          @keyup.enter="sendMessage"
          :disabled="isTyping"
        />
        <button
          @click="sendMessage"
          class="px-4 py-2 sm:px-5 sm:py-2 bg-primary dark:bg-secondary text-white font-medium rounded-lg hover:bg-primary-md dark:hover:bg-secondary-md transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
          :disabled="isTyping"
        >
          <i class="fas fa-paper-plane" v-if="!isTyping"></i>
          <i class="fas fa-spinner fa-spin" v-else></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';

// Define el estado del componente
const messages = ref([]);
const userInput = ref('');
const isChatOpen = ref(false);
const isTyping = ref(false); // Nuevo estado para mostrar el indicador de 'escribiendo'
const messagesContainer = ref(null); // Referencia al contenedor de mensajes

// Modelo de lenguaje que utilizaremos
const modelName = 'gemini-2.5-flash-preview-05-20';

const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value;
};

const closeChat = () => {
  isChatOpen.value = false;
};

// Cerrar con ESC
const handleEscape = (e) => {
  if (e.key === 'Escape' && isChatOpen.value) {
    closeChat();
  }
};

// Cerrar al hacer clic fuera del chat
const handleClickOutside = (e) => {
  const chatEl = document.getElementById('chatWindow');
  const buttonEl = document.getElementById('chatToggleButton');

  if (chatEl && !chatEl.contains(e.target) && buttonEl && !buttonEl.contains(e.target)) {
    closeChat();
  }
};

// Función para hacer scroll automático al final del chat
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

// Observa los cambios en los mensajes para hacer scroll
watch(messages, () => {
  scrollToBottom();
}, { deep: true });

onMounted(() => {
  window.addEventListener('keydown', handleEscape);
  window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscape);
  window.removeEventListener('click', handleClickOutside);
});

// Función para enviar un mensaje al bot de Gemini
async function sendMessage() {
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  // Agrega el mensaje del usuario al chat
  messages.value.push({ sender: 'user', text: userMessage });
  userInput.value = '';
  isTyping.value = true; // Muestra el indicador de 'escribiendo'

  try {
    // Configura el historial del chat para la API
    const chatHistory = messages.value.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
    
    // Agrega un "System Instruction" para guiar al bot
    const prompt = `Eres un asistente de soporte para una plataforma llamada "Voir" dedicada a la comunidad de amantes de las mascotas.
    Tu función es brindar información y ayuda sobre adopción, eventos, cuidado de animales, grupos y publicaciones.
    Responde de manera amigable y útil. Manten las respuestas concisas y directas.
    Si te preguntan algo fuera de este tema, responde educadamente que tu conocimiento se limita a mascotas y la plataforma.

    El usuario dice: ${userMessage}`;

    // Agrega el prompt al historial
    chatHistory.push({ role: 'user', parts: [{ text: prompt }] });
    
    const payload = {
        contents: chatHistory,
    };
    
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`Error de la API: ${response.statusText}`);
    }

    const result = await response.json();
    const botReply = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (botReply) {
      messages.value.push({ sender: 'bot', text: botReply });
    } else {
      messages.value.push({ sender: 'bot', text: "Lo siento, no pude generar una respuesta. Por favor, intenta de nuevo." });
    }

  } catch (error) {
    console.error('Error al comunicarse con la API de Gemini:', error);
    messages.value.push({ sender: 'bot', text: "Hubo un error al procesar tu solicitud. Por favor, intenta más tarde." });
  } finally {
    isTyping.value = false; // Oculta el indicador de 'escribiendo'
  }
}
</script>

<style scoped>
/* Estilos de tu componente original */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #02bcae transparent;
}
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #02bcae;
  border-radius: 3px;
}
.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: var(--color-secondary-md);
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}
.dark .overflow-y-auto::-webkit-scrollbar-track {
  background: #1F2937;
}

/* Transiciones para el chat */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>