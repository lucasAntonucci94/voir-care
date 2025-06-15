<template>
    <!-- Dialogflow Messenger Widget -->
    <div class="flex-1">
      <df-messenger
        chat-title="VoirBot"
        agent-id="5457adaa-015b-4211-b085-6ac4f624f9b8"
        language-code="es"
        class="w-full h-full"
      ></df-messenger>
    </div>
</template>

<script setup>
import { ref } from 'vue'

// State for toggling the chat window
const isChatOpen = ref(false)

// Toggle chat window visibility
const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value
}
</script>

<style>
/* Ocultar el botón de minimizar por defecto */
df-messenger {
  --df-messenger-minimized-chat-button-display: none;
  transition: var(--df-messenger-transition);
  box-shadow: var(--df-messenger-box-shadow);
  border-radius: 16px; /* Bordes redondeados para el contenedor */
  font-family: var(--df-messenger-font-family);
}

/* Estilos de los mensajes */
df-messenger {
  --df-messenger-user-message-border-radius: var(--df-messenger-message-border-radius);
  --df-messenger-bot-message-border-radius: var(--df-messenger-message-border-radius);
  --df-messenger-font-size: 14px; /* Tamaño de fuente legible */
}

/* Ajustar el contenedor del chat */
df-messenger {
  width: 100%;
  height: 100%;
  max-height: 600px; /* Limitar altura máxima */
  min-height: 400px; /* Altura mínima */
}

/* Estilo del input */
df-messenger input {
  border-radius: 8px;
  padding: 10px;
  transition: var(--df-messenger-transition);
}

/* Ícono de envío */
df-messenger .df-messenger-send-icon {
  transform: scale(1.2); /* Hacer el ícono más visible */
}

/* Ajustes para modo oscuro */
.dark df-messenger {
  --df-messenger-chat-background-color: #1F2937;
  --df-messenger-bot-message-background: #4B5563;
}

/* Responsividad */
@media (max-width: 640px) {
  df-messenger {
    max-height: 100vh; /* Ocupar toda la altura en móviles */
    border-radius: 0; /* Sin bordes en móviles */
  }
}

/* Prevenir desbordamiento */
#chatWindow {
  overflow: hidden;
}
</style>