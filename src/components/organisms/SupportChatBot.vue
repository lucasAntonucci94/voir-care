<template>
  <div>
    <!-- Botón flotante para abrir/cerrar el chat -->
    <div
      class="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-16 sm:h-16 bg-primary dark:bg-secondary-md rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-primary-md dark:hover:bg-secondary-darker transition-all duration-200 z-50"
      @click="toggleChat"
    >
      <i class="fa fa-message text-white"></i>
    </div>

    <!-- Ventana del chat -->
    <div
      v-if="isChatOpen"
      class="fixed inset-4 sm:bottom-24 sm:right-6 sm:inset-auto sm:w-[28rem] sm:h-[32rem] sm:max-h-[80vh] bg-white rounded-xl shadow-2xl p-4 sm:p-6 flex flex-col z-50 transform transition-all duration-300 scale-100"
    >
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg sm:text-xl font-semibold text-gray-800 tracking-tight">Soporte</h3>
        <button
          @click="toggleChat"
          class="text-gray-500 hover:text-gray-700 transition-all duration-200"
        >
          <svg
            class="h-5 w-5 sm:h-6 sm:w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Área de mensajes -->
      <div
        class="flex-1 bg-gray-50 rounded-lg p-3 sm:p-4 overflow-y-auto text-gray-700 text-sm border border-gray-200"
      >
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="msg.sender === 'user' ? 'text-right' : 'text-left'"
        >
          <div
            :class="msg.sender === 'user' ? 'bg-blue-100 text-blue-900 p-2 rounded mb-1 inline-block' : 'bg-green-100 text-green-900 p-2 rounded mb-1 inline-block'"
          >
            {{ msg.text }}
          </div>
        </div>
      </div>

      <!-- Input y botón de enviar -->
      <div class="mt-3 sm:mt-4 flex gap-2 sm:gap-3">
        <input
          v-model="userInput"
          type="text"
          placeholder="Escribe tu mensaje..."
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
import { ref, onMounted } from 'vue'
import RiveScript from 'rivescript'

const props = defineProps({
  isOpen: Boolean
})

const messages = ref([])
const userInput = ref('')
const isChatOpen = ref(false)

const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value
}

// Instanciar el bot de RiveScript
const bot = new RiveScript()

onMounted(async () => {
  try {
    const response = await fetch("/bot.rive")
    const text = await response.text()
    bot.stream(text)
    bot.sortReplies()
  } catch (error) {
    console.error("Error al cargar los scripts de RiveScript:", error)
  }
})

function sendMessage() {
  const text = userInput.value.trim()
  if (!text) return

  // Agregar el mensaje del usuario
  messages.value.push({ sender: 'user', text })

  // Obtener respuesta del bot
  bot.reply("localuser", text).then(reply => {
    messages.value.push({ sender: 'bot', text: reply })
  })

  userInput.value = ''
}
</script>

<style scoped>
/* Puedes agregar estilos adicionales o personalizar la transición aquí */
</style>
