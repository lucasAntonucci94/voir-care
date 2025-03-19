<!-- src/components/FaqSection.vue -->
<template>
  <section class="faq-section bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
    <!-- Encabezado -->
    <div class="max-w-3xl mx-auto mb-8 text-center">
      <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Preguntas Frecuentes</h1>
      <p class="text-base sm:text-lg text-gray-600">
        Todo lo que necesitas saber sobre nuestra comunidad dedicada al cuidado animal. ¿No encontrás tu respuesta? ¡Contactanos!
      </p>
    </div>

    <!-- Lista de FAQs -->
    <div class="max-w-3xl mx-auto space-y-6">
      <div
        v-for="(faq, index) in faqs"
        :key="index"
        class="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <button
          @click="toggleFaq(index)"
          class="w-full flex justify-between items-center p-4 text-left focus:outline-none"
          :class="{ 'bg-indigo-50': openFaq === index }"
        >
          <span class="text-base sm:text-lg font-semibold text-gray-900">{{ faq.question }}</span>
          <svg
            :class="{ 'rotate-180': openFaq === index }"
            class="h-5 w-5 text-gray-500 transition-transform duration-200"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div
          v-show="openFaq === index"
          class="p-4 text-sm sm:text-base text-gray-700 border-t border-gray-200"
        >
          {{ faq.answer }}
        </div>
      </div>
    </div>

    <!-- Sección de Contacto -->
    <div class="max-w-3xl mx-auto mt-10 text-center">
      <p class="text-base sm:text-lg text-gray-600 mb-4">
        ¿Tenés más dudas? Unite a nuestra comunidad o escribinos.
      </p>
      <button
        class="px-6 py-3 bg-[#F28C38] text-white rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all duration-200 shadow-md"
        @click="handleChat"
      >
        Contactanos
      </button>
    </div>
    <!-- Componente de Chat en Vivo -->
    <SupportChat :isOpen="openChat" />
  </section>
</template>

<script setup>
import { ref } from 'vue';
import SupportChat from '../components/organisms/SupportChat.vue'; // Importar el nuevo componente

// Lista de FAQs
const faqs = ref([
  {
    question: '¿Qué es esta red social?',
    answer:
      'Somos una comunidad dedicada al cuidado animal, donde podés encontrar información, compartir experiencias y conectar con otros amantes de las mascotas. Ofrecemos recursos sobre salud, adopción y eventos locales.',
  },
  {
    question: '¿Cómo puedo unirme a la comunidad?',
    answer:
      'Es fácil: creá una cuenta gratuita, completá tu perfil y empezá a explorar. Podés unirte a grupos, publicar contenido o buscar lugares pet-friendly cerca tuyo.',
  },
  {
    question: '¿Qué tipo de contenido puedo compartir?',
    answer:
      'Podés subir fotos de tus mascotas, consejos de cuidado, recomendaciones de veterinarias o petshops, y participar en discusiones sobre bienestar animal.',
  },
  {
    question: '¿Es gratis usar la plataforma?',
    answer:
      'Sí, el acceso básico es gratuito. Ofrecemos funciones premium opcionales para quienes quieran apoyar más a la comunidad y acceder a contenido exclusivo.',
  },
  {
    question: '¿Cómo reporto un problema o contenido inapropiado?',
    answer:
      'Cada publicación tiene una opción de reporte. También podés contactarnos directamente a través del chat en vivo o el formulario de soporte.',
  },
]);

// Estado para controlar qué FAQ está abierto
const openFaq = ref(null);
const openChat = ref(false);

// Función para togglear FAQs
const toggleFaq = (index) => {
  openFaq.value = openFaq.value === index ? null : index;
};

// Función para togglear FAQs
const handleChat = () => {
  openChat.value = true;
};
</script>