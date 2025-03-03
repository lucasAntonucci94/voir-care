<!-- components/CarouselAwareness.vue -->
<template>
    <section class="bg-white py-16 overflow-hidden">
      <div class="container mx-auto px-4 w-[90vw]">
        <h2 class="text-4xl font-bold text-gray-800 text-center mb-10 font-poppins">{{ title }}</h2>
        <div class="relative">
          <div
            ref="scrollContainer"
            class="flex overflow-x-auto space-x-5 scrollbar-hide snap-x snap-mandatory"
            style="scroll-behavior: smooth;"
          >
            <div
              v-for="event in events"
              :key="event.title"
              class="awareness-card bg-gray-100 p-5 rounded-lg text-center min-w-[250px] md:min-w-[300px] lg:min-w-[350px] flex-shrink-0 snap-center"
            >
              <div class="awareness-image bg-[#02bcae] h-40 mb-4 rounded" :style="event.image ? { backgroundImage: `url(${event.image})`, backgroundSize: 'cover' } : {}"></div>
              <h3 class="text-xl text-gray-800 mb-2 font-poppins">{{ event.title }}</h3>
              <p class="text-sm text-gray-600 mb-4 font-poppins">{{ event.date }}</p>
              <a
                href="#"
                class="inline-block px-6 py-2 bg-[#2c3e50] text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors font-poppins"
              >
                Inscribirse
              </a>
            </div>
          </div>
          <!-- Flechas de navegación -->
          <button
            class="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md z-10"
            @click="scroll(-1)"
          >
            <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <button
            class="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md z-10"
            @click="scroll(1)"
          >
            <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  
  // Props
  const props = defineProps({
    title: {
      type: String,
      default: 'Concienciación Activa'
    },
    events: {
      type: Array,
      default: () => [
        { title: 'Taller de Bienestar Animal', date: '15 de Noviembre, 2023', image: '' },
        { title: 'Charla sobre Adopción Responsable', date: '22 de Noviembre, 2023', image: '' },
        { title: 'Jornada de Educación', date: '20 de Noviembre, 2023', image: '' },
        { title: 'Seminario de Cuidado de Mascotas', date: '6 de Diciembre, 2023', image: '' },
        { title: 'Jornada de Refugios', date: '10 de Diciembre, 2023', image: '' },
        { title: 'Taller de Adopción', date: '18 de Diciembre, 2023', image: '' },
      ]
    },
    autoScroll: {
      type: Boolean,
      default: true // Activa el desplazamiento automático por defecto
    }
  });
  
  // Referencia al contenedor del carrusel
  const scrollContainer = ref(null);
  let scrollInterval = null;
  
  // Función para desplazar el carrusel
  const scroll = (direction) => {
    if (scrollContainer.value) {
      const scrollAmount = 300; // Mismo valor que usas en tu implementación
      scrollContainer.value.scrollLeft += direction * scrollAmount;
    }
  };
  
  // Configuración del carrusel
  onMounted(() => {
    if (scrollContainer.value) {
      // Soporte para rueda del ratón
      scrollContainer.value.addEventListener('wheel', (evt) => {
        evt.preventDefault();
        const scrollAmount = evt.deltaY * 0.5;
        scrollContainer.value.scrollLeft += scrollAmount;
      });
  
      // Desplazamiento automático (opcional, controlado por prop)
      if (props.autoScroll) {
        scrollInterval = setInterval(() => scroll(1), 5000); // Cada 5 segundos
      }
    }
  });
  
  // Limpieza al desmontar
  onUnmounted(() => {
    if (scrollInterval) clearInterval(scrollInterval);
  });
  </script>
  
  <style scoped>
  /* Ocultar scrollbar pero mantener funcionalidad */
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none; /* IE y Edge */
    scrollbar-width: none; /* Firefox */
  }
  </style>