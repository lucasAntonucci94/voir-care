<template>
  <section class="bg-white dark:bg-gray-800 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
    <!-- Encabezado -->
    <div class="max-w-4xl mx-auto mb-12 text-center">
      <h1 class="text-4xl sm:text-5xl font-bold text-gray-700 dark:text-gray-300 mb-4 font-abril">Preguntas Frecuentes</h1>
      <p class="text-lg sm:text-xl text-gray-600 dark:text-gray-400 font-poppins">
        Encuentra respuestas a tus dudas sobre nuestra comunidad dedicada al cuidado y bienestar animal. ¿No ves lo que buscas? ¡Chatea con nosotros!
      </p>
    </div>

    <!-- Tabs para categorías -->
    <div class="max-w-4xl mx-auto mb-8">
      <div class="flex flex-wrap justify-center gap-4">
        <button
          v-for="(tab, index) in tabs"
          :key="index"
          @click="activeTab = index"
          class="px-4 py-2 rounded-full font-semibold text-sm sm:text-base transition-colors font-poppins"
          :class="activeTab === index ? 'bg-primary dark:bg-secondary text-white hover:bg-primary-md dark:hover:bg-secondary-md' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600'"
        >
          {{ tab.name }}
        </button>
      </div>
    </div>

    <!-- Lista de FAQs -->
    <div class="max-w-4xl mx-auto space-y-6">
      <div
        v-for="(faq, index) in filteredFaqs"
        :key="index"
        class="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden"
      >
        <button
          @click="toggleFaq(index)"
          class="w-full flex justify-between items-center p-5 text-left focus:outline-none"
          :class="{ 'bg-primary/20 dark:bg-secondary/20': openFaq === index }"
        >
          <span class="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300 font-poppins">{{ faq.question }}</span>
          <i :class="[
            'fa-solid fa-chevron-down h-5 w-5 text-primary dark:text-secondary transition-transform duration-200',
            { 'rotate-180': openFaq === index }
          ]"
        ></i>

        </button>
        <div
          v-show="openFaq === index"
          class="p-5 text-sm sm:text-base text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-500 font-poppins"
        >
          {{ faq.answer }}
        </div>
      </div>
    </div>

    <!-- Componente de Chat en Vivo -->
    <SupportChatBot :isOpen="openChat" />
    <!-- <SupportChatBotDialogFlow /> -->
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import SupportChatBot from '../components/organisms/SupportChatBot.vue';
import SupportChatBotDialogFlow from '../components/organisms/SupportChatBotDialogFlow.vue';

// Definición de las categorías (tabs)
const tabs = ref([
  { name: 'Sobre la Comunidad', category: 'general' },
  { name: 'Funcionalidades', category: 'features' },
  { name: 'Contenido y Participación', category: 'content' },
  { name: 'Eventos y Grupos', category: 'events' },
  { name: 'Soporte y Seguridad', category: 'support' },
]);

// Estado para controlar la tab activa
const activeTab = ref(0);

// Lista de FAQs actualizada y ampliada
const faqs = ref([
  // Categoría: Sobre la Comunidad
  {
    category: 'general',
    question: '¿Qué es Voir y cuál es su propósito?',
    answer:
      'Somos una comunidad apasionada por el cuidado y bienestar animal. Nuestro propósito es concientizar y educar a las personas sobre la tenencia responsable, ofrecer recursos educativos y crear un espacio donde los amantes de los animales puedan conectar, compartir experiencias y crecer juntos.',
  },
  {
    category: 'general',
    question: '¿Quiénes pueden unirse a la comunidad?',
    answer:
      '¡Todos los amantes de los animales son bienvenidos! Ya seas un dueño experimentado, un adoptante primerizo o simplemente alguien que quiere aprender más sobre el cuidado de perros y gatos, nuestra comunidad tiene un lugar para ti. Solo necesitas crear una cuenta gratuita y empezar a explorar.',
  },
  {
    category: 'general',
    question: '¿Qué beneficios obtengo al unirme?',
    answer:
      'Al unirte, tendrás acceso a una comunidad vibrante donde puedes aprender sobre el cuidado animal, conectar con otros dueños, participar en eventos y grupos, y encontrar recursos como guías, artículos y mapas con lugares que permite y son amigables con los animales. Además, podrás compartir tu amor por las mascotas y apoyar causas como la adopción responsable.',
  },

  // Categoría: Funcionalidades
  {
    category: 'features',
    question: '¿Qué herramientas ofrece la plataforma para el cuidado animal?',
    answer:
      'Ofrecemos una variedad de herramientas para ayudarte a cuidar mejor a tu mascota: chats privados y seguros para conectar con otros dueños o profesionales, un mapa interactivo para encontrar veterinarias, parques y servicios, guías y artículos educativos sobre salud y bienestar, y mucho más. Todo diseñado para que tengas lo que necesitas en un solo lugar.',
  },
  {
    category: 'features',
    question: '¿Cómo funciona el mapa interactivo?',
    answer:
      'Nuestro mapa te permite localizar lugares de interés para tu mascota, como parques, veterinarias, refugios, petshops, paseadores, guarderías y más. Solo selecciona tu ubicación y el tipo de lugar que buscas, y te mostraremos opciones cercanas con información detallada. ¡Es ideal para planificar paseos o encontrar ayuda rápida!',
  },
  {
    category: 'features',
    question: '¿Puedo comunicarme con otros usuarios de forma privada?',
    answer:
      '¡Sí! Contamos con un sistema de chats privados y seguros donde puedes hablar directamente con otros amantes de los animales, veterinarios o paseadores. Es perfecto para coordinar adopciones, pedir consejos o simplemente charlar sobre tu amor por las mascotas.',
  },
  {
    category: 'features',
    question: '¿Qué tipo de recursos educativos ofrecen?',
    answer:
      'En nuestra sección de blog encontrarás guías y artículos sobre temas como alimentación, adiestramiento, salud y bienestar animal. También ofrecemos talleres y charlas (tanto presenciales como virtuales) para que aprendas de expertos y mejores el cuidado de tu perro o gato.',
  },

  // Categoría: Contenido y Participación
  {
    category: 'content',
    question: '¿Qué tipo de contenido puedo compartir en la plataforma?',
    answer:
      'Puedes compartir fotos y videos de tus mascotas, consejos de cuidado, experiencias de adopción, recomendaciones de productos o servicios (como veterinarias o juguetes), y participar en discusiones sobre bienestar animal. Queremos que compartas tu pasión por los animales y ayudes a otros con tu conocimiento.',
  },
  {
    category: 'content',
    question: '¿Puedo publicar sobre adopciones o rescates?',
    answer:
      '¡Claro! Fomentamos la adopción responsable y el rescate de animales. Puedes publicar sobre perros o gatos que necesiten un hogar, compartir historias de adopción exitosa o buscar apoyo para integrar a una nueva mascota en tu familia. Solo asegúrate de seguir nuestras guías de publicación para mantener un ambiente seguro y respetuoso.',
  },
  {
    category: 'content',
    question: '¿Cómo puedo interactuar con otros miembros de la comunidad?',
    answer:
      'Puedes interactuar uniéndote a grupos temáticos (como "Amantes de los Gatos" o "Adopción y Rescate"), participando en eventos, comentando en publicaciones o usando nuestro chat privado. ¡Es una gran forma de hacer amigos que compartan tu amor por los animales!',
  },

  // Categoría: Eventos y Grupos
  {
    category: 'events',
    question: '¿Qué tipo de eventos y grupos puedo encontrar?',
    answer:
      'Organizamos eventos presenciales y virtuales como talleres de adiestramiento, jornadas de adopción, charlas sobre cuidado animal y caminatas solidarias. También tenemos grupos virtuales donde puedes conectar con otros dueños, como "Dueños de Perros Primerizos" o "Nutrición y Bienestar Animal". ¡Hay algo para todos los amantes de las mascotas!',
  },
  {
    category: 'events',
    question: '¿Cómo me inscribo a un evento o me uno a un grupo?',
    answer:
      'En la sección "Eventos y Grupos" encontrarás un carrusel con todas las opciones disponibles. Haz clic en "Inscribirme al evento" para reservar tu lugar en un evento, o en "Unirme al grupo" para participar en un grupo virtual. ¡Es muy fácil y te mantendremos informado con recordatorios!',
  },
  {
    category: 'events',
    question: '¿Puedo organizar mi propio evento o grupo?',
    answer:
      '¡Sí! Si tienes una idea para un evento (como una jornada de adopción) o quieres crear un grupo (por ejemplo, "Amantes de los Perros Pequeños"), contáctanos a través del chat o el formulario de soporte. Evaluaremos tu propuesta y te ayudaremos a hacerla realidad.',
  },

  // Categoría: Soporte y Seguridad
  {
    category: 'support',
    question: '¿Es gratis usar la plataforma?',
    answer:
      'Sí, el acceso básico es completamente gratuito. Puedes unirte a la comunidad, participar en grupos, asistir a eventos gratuitos y acceder a muchos recursos sin costo. También ofrecemos funciones premium opcionales (como contenido exclusivo o eventos especiales) para quienes quieran apoyar más a la comunidad.',
  },
  {
    category: 'support',
    question: '¿Cómo reporto un problema o contenido inapropiado?',
    answer:
      'Si encuentras un problema o contenido que no cumpla con nuestras normas (como publicaciones ofensivas o spam), usa la opción "Reportar" que aparece en cada publicación o perfil. También puedes contactarnos directamente a través del chat en vivo o nuestro formulario de soporte, y nuestro equipo lo revisará lo antes posible.',
  },
  {
    category: 'support',
    question: '¿Cómo protegen mi privacidad y la de mi mascota?',
    answer:
      'Tu privacidad es nuestra prioridad. Todos los chats son privados y seguros, y no compartimos tu información personal con terceros. Además, puedes controlar qué datos de tu perfil o de tu mascota son visibles para otros usuarios. Para más detalles, consulta nuestra Política de Privacidad.',
  },
  {
    category: 'support',
    question: '¿Qué hago si tengo problemas técnicos con la plataforma?',
    answer:
      'Si enfrentas algún problema técnico (como dificultades para iniciar sesión o cargar contenido), contáctanos a través del chat en vivo o envíanos un mensaje desde el formulario de soporte. Nuestro equipo te ayudará a resolverlo rápidamente para que puedas seguir disfrutando de la comunidad.',
  },
]);

// Filtrar FAQs según la tab activa
const filteredFaqs = computed(() => {
  return faqs.value.filter(faq => faq.category === tabs.value[activeTab.value].category);
});

// Estado para controlar qué FAQ está abierto
const openFaq = ref(null);
const openChat = ref(false);

// Función para togglear FAQs
const toggleFaq = (index) => {
  openFaq.value = openFaq.value === index ? null : index;
};
</script>

<style scoped>


.font-poppins {
  font-family: 'Poppins', sans-serif;
  line-height: 1.6;
}

.font-abril {
  font-family: 'Abril Fatface', cursive;
  font-weight: 800;
  letter-spacing: 1px;
}
</style>