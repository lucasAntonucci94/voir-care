
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
      </div>

      <div class="mt-3 sm:mt-4 flex gap-2 sm:gap-3">
        <input
          v-model="userInput"
          type="text"
          placeholder="Escribe tu mensaje..."
          class="flex-1 p-2 sm:p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300 placeholder-gray-400 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm sm:text-base"
          @keyup.enter="sendMessage"
        />
        <button
          @click="sendMessage"
          class="px-4 py-2 sm:px-5 sm:py-2 bg-primary dark:bg-secondary text-white font-medium rounded-lg hover:bg-primary-md dark:hover:bg-secondary-md transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
        >
          Enviar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import RiveScript from 'rivescript'

const messages = ref([])
const userInput = ref('')
const isChatOpen = ref(false)

const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value
}

const closeChat = () => {
  isChatOpen.value = false
}

// Cerrar con ESC
const handleEscape = (e) => {
  if (e.key === 'Escape' && isChatOpen.value) {
    closeChat()
  }
}

// Cerrar al hacer clic fuera del chat
const handleClickOutside = (e) => {
  const chatEl = document.getElementById('chatWindow')
  const buttonEl = document.getElementById('chatToggleButton')

  if (chatEl && !chatEl.contains(e.target) && buttonEl && !buttonEl.contains(e.target)) {
    closeChat()
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleEscape)
  window.addEventListener('click', handleClickOutside)

  try {
    const response = await fetch("/bot.rive")
    const text = await response.text()
    bot.stream(text)
    bot.sortReplies()
  } catch (error) {
    console.error("Error al cargar los scripts de RiveScript:", error)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscape)
  window.removeEventListener('click', handleClickOutside)
})

// Intancio el bot de RiveScript
// const bot = new RiveScript()
const bot = new RiveScript({
  utf8: true,
  forceCase: true,
  debug: false,
  errors: {
    replyNotMatched: "Ups, no tengo información sobre eso aún.",
    replyNotFound: "No estoy segur@ de cómo responderte.",
    objectNotFound: "[Error interno]",
    deepRecursion: "Parece que entramos en un bucle, ¿podés intentar reformular?"
  }
})
bot.unicodePunctuation = new RegExp(/[.,!?;:¿¡]/g)

function sendMessage() {
  const rawText = userInput.value.trim()
  const cleaned = cleanInput(rawText)
  if (!cleaned) return

  messages.value.push({ sender: 'user', text: rawText })

  bot.reply("localuser", cleaned).then(reply => {
    messages.value.push({ sender: 'bot', text: reply })
  })

  userInput.value = ''
}

function cleanInput(text) {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // sin tildes
    .replace(/[.,!?;:¿¡]/g, '') // sin puntuación
}
</script>

